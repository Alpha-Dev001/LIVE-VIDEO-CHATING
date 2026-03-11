import { useRef, useState, useCallback, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export const useWebRTC = ({ onCallEnded } = {}) => {
  const { socket } = useSocket();
  const [callState, setCallState] = useState('idle'); // idle | calling | incoming | connected
  const [remoteUser, setRemoteUser] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const incomingCallDataRef = useRef(null);

  // ─── Create Peer Connection ──────────────────────────────────────
  const createPeerConnection = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          targetUserId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        handleCallEnded();
      }
    };

    return pc;
  }, [socket]);

  // ─── Get Local Media ─────────────────────────────────────────────
  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
    return stream;
  };

  // ─── Initiate Call ───────────────────────────────────────────────
  const startCall = useCallback(async (targetUser) => {
    if (callState !== 'idle') return;
    try {
      setCallState('calling');
      setRemoteUser(targetUser);

      const stream = await getLocalStream();
      const pc = createPeerConnection(targetUser._id);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-user', {
        targetUserId: targetUser._id,
        offer
      });
    } catch (err) {
      console.error('Error starting call:', err);
      cleanup();
      setCallState('idle');
    }
  }, [callState, socket, createPeerConnection]);

  // ─── Accept Incoming Call ────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    if (!incomingCallDataRef.current) return;
    const { callerId, callerName, callerAvatar, offer } = incomingCallDataRef.current;

    try {
      setCallState('connected');

      const stream = await getLocalStream();
      const pc = createPeerConnection(callerId);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('accept-call', { callerId, answer });
      incomingCallDataRef.current = null;
    } catch (err) {
      console.error('Error accepting call:', err);
      cleanup();
      setCallState('idle');
    }
  }, [socket, createPeerConnection]);

  // ─── Reject Call ─────────────────────────────────────────────────
  const rejectCall = useCallback(() => {
    if (!incomingCallDataRef.current) return;
    const { callerId } = incomingCallDataRef.current;
    socket.emit('reject-call', { callerId });
    incomingCallDataRef.current = null;
    setCallState('idle');
    setRemoteUser(null);
  }, [socket]);

  // ─── End Call ────────────────────────────────────────────────────
  const endCall = useCallback(() => {
    if (remoteUser) {
      socket.emit('end-call', { targetUserId: remoteUser._id });
    }
    handleCallEnded();
  }, [socket, remoteUser]);

  const handleCallEnded = useCallback(() => {
    cleanup();
    setCallState('idle');
    setRemoteUser(null);
    if (onCallEnded) onCallEnded();
  }, [onCallEnded]);

  // ─── Cleanup ─────────────────────────────────────────────────────
  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  // ─── Toggle Mute ─────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  }, []);

  // ─── Toggle Camera ───────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOff(!videoTrack.enabled);
    }
  }, []);

  // ─── Socket Event Listeners ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ callerId, callerName, callerAvatar, offer }) => {
      if (callState !== 'idle') {
        socket.emit('reject-call', { callerId });
        return;
      }
      incomingCallDataRef.current = { callerId, callerName, callerAvatar, offer };
      setRemoteUser({ _id: callerId, username: callerName, avatar: callerAvatar });
      setCallState('incoming');
    };

    const handleCallAccepted = async ({ answer }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          setCallState('connected');
        }
      } catch (err) {
        console.error('Error setting remote description:', err);
      }
    };

    const handleCallRejected = ({ message }) => {
      alert(message);
      handleCallEnded();
    };

    const handleCallEnded = () => {
      cleanup();
      setCallState('idle');
      setRemoteUser(null);
    };

    const handleIceCandidate = async ({ candidate }) => {
      try {
        if (peerConnectionRef.current && candidate) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    };

    const handleCallError = ({ message }) => {
      alert(`Call error: ${message}`);
      cleanup();
      setCallState('idle');
      setRemoteUser(null);
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-rejected', handleCallRejected);
    socket.on('call-ended', handleCallEnded);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('call-error', handleCallError);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-rejected', handleCallRejected);
      socket.off('call-ended', handleCallEnded);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('call-error', handleCallError);
    };
  }, [socket, callState, handleCallEnded]);

  return {
    callState,
    remoteUser,
    isMuted,
    isCameraOff,
    localVideoRef,
    remoteVideoRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera
  };
};
