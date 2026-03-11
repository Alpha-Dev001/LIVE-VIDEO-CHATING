import { useEffect } from 'react';

export default function VideoCall({
  callState,
  remoteUser,
  localVideoRef,
  remoteVideoRef,
  isMuted,
  isCameraOff,
  onEndCall,
  onAcceptCall,
  onRejectCall,
  onToggleMute,
  onToggleCamera
}) {
  // Auto-play videos when streams are set
  useEffect(() => {
    const localVideo = localVideoRef.current;
    const remoteVideo = remoteVideoRef.current;
    if (localVideo) localVideo.muted = true; // Mute self to prevent echo
    return () => {
      if (localVideo) localVideo.srcObject = null;
      if (remoteVideo) remoteVideo.srcObject = null;
    };
  }, []);

  if (callState === 'idle') {
    return null;
  }

  return (
    <div className="video-overlay">
      {/* Incoming Call Screen */}
      {callState === 'incoming' && (
        <div className="call-modal incoming">
          <div className="call-modal-inner">
            <div className="call-ripple">
              <div className="ripple r1"></div>
              <div className="ripple r2"></div>
              <div className="ripple r3"></div>
              <img
                src={remoteUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${remoteUser?.username}`}
                alt={remoteUser?.username}
                className="call-avatar"
              />
            </div>
            <h2 className="call-name">{remoteUser?.username}</h2>
            <p className="call-subtitle">Incoming video call...</p>
            <div className="call-actions">
              <button className="call-btn reject" onClick={onRejectCall}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.12-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  <line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="call-btn accept" onClick={onAcceptCall}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outgoing Call Screen */}
      {callState === 'calling' && (
        <div className="call-modal outgoing">
          <div className="call-modal-inner">
            <div className="call-ripple">
              <div className="ripple r1"></div>
              <div className="ripple r2"></div>
              <div className="ripple r3"></div>
              <img
                src={remoteUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${remoteUser?.username}`}
                alt={remoteUser?.username}
                className="call-avatar"
              />
            </div>
            <h2 className="call-name">{remoteUser?.username}</h2>
            <p className="call-subtitle">Calling...</p>
            <div className="call-actions">
              <button className="call-btn reject" onClick={onEndCall}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.12-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Call Screen */}
      {callState === 'connected' && (
        <div className="active-call">
          {/* Remote Video (fullscreen background) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="remote-video"
          />
          <div className="remote-video-overlay">
            <span className="remote-name">{remoteUser?.username}</span>
          </div>

          {/* Local Video (picture-in-picture) */}
          <div className="local-video-wrap">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`local-video ${isCameraOff ? 'camera-off' : ''}`}
            />
            {isCameraOff && (
              <div className="camera-off-overlay">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
                  <path d="M21 6.5l-4-4-3.5 3.5L12 4.5 10.5 6 9 4.5 5 8.5 3 6.5 1.5 8l3 3H4v10h14V11h.5l2 2 1.5-1.5zm-9.5 9c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>Camera Off</span>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="call-controls">
            <div className="controls-inner">
              <button
                className={`ctrl-btn ${isMuted ? 'active-red' : ''}`}
                onClick={onToggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
                  </svg>
                )}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              <button
                className="ctrl-btn end-call-btn"
                onClick={onEndCall}
                title="End call"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.12-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
                <span>End</span>
              </button>

              <button
                className={`ctrl-btn ${isCameraOff ? 'active-red' : ''}`}
                onClick={onToggleCamera}
                title={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isCameraOff ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 6.5l-4-4-3.5 3.5L12 4.5 10.5 6 9 4.5l-4 4L3 6.5 1.5 8l3 3H4v10h14V11h.5l2 2L22 11.5z"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                )}
                <span>{isCameraOff ? 'Camera On' : 'Camera Off'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden videos for calling/incoming state (needed for stream capture) */}
      {(callState === 'calling' || callState === 'incoming') && (
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 1, height: 1, overflow: 'hidden' }}>
          <video ref={localVideoRef} autoPlay playsInline muted />
          <video ref={remoteVideoRef} autoPlay playsInline />
        </div>
      )}
    </div>
  );
}
