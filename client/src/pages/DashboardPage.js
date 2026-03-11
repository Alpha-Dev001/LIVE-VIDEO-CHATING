import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../hooks/useWebRTC';
import Sidebar from '../components/Sidebar';
import VideoCall from '../components/VideoCall';

export default function DashboardPage() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [selectedUser, setSelectedUser] = useState(null);

  const {
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
  } = useWebRTC();

  const isSelectedOnline = selectedUser && onlineUsers.includes(selectedUser._id);

  const handleSelectUser = (u) => {
    if (callState !== 'idle') return;
    setSelectedUser(u);
  };

  const handleStartCall = () => {
    if (selectedUser && isSelectedOnline && callState === 'idle') {
      startCall(selectedUser);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        onSelectUser={handleSelectUser}
        selectedUser={selectedUser}
        callState={callState}
      />

      <main className="main-area">
        {!selectedUser ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="32" fill="#6C63FF" opacity="0.1"/>
                <path d="M18 26h20a4 4 0 014 4v12a4 4 0 01-4 4H18a4 4 0 01-4-4V30a4 4 0 014-4z" fill="#6C63FF" opacity="0.3"/>
                <path d="M42 32l10-5v14l-10-5v-4z" fill="#6C63FF" opacity="0.5"/>
              </svg>
            </div>
            <h2>Select a user to call</h2>
            <p>Choose someone from the sidebar to start a video call</p>
            <div className="feature-chips">
              <span className="chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                HD Video
              </span>
              <span className="chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
                Crystal Audio
              </span>
              <span className="chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/></svg>
                End-to-end
              </span>
            </div>
          </div>
        ) : (
          <div className="user-detail">
            <div className="user-detail-header">
              <div className="user-detail-avatar">
                <img
                  src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                  alt={selectedUser.username}
                  className="avatar avatar-lg"
                />
                <span className={`status-dot lg ${isSelectedOnline ? 'online' : 'offline'}`}></span>
              </div>
              <div className="user-detail-info">
                <h2>{selectedUser.username}</h2>
                <p className={isSelectedOnline ? 'online-text' : 'offline-text'}>
                  {isSelectedOnline ? '● Online' : '○ Offline'}
                </p>
              </div>
            </div>

            <div className="call-panel">
              {callState === 'idle' && (
                <div className="start-call-area">
                  {isSelectedOnline ? (
                    <>
                      <p className="call-hint">Ready to connect</p>
                      <button className="btn-start-call" onClick={handleStartCall}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                        </svg>
                        Start Video Call
                      </button>
                    </>
                  ) : (
                    <div className="user-offline-msg">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <p>{selectedUser.username} is currently offline</p>
                      <span>They'll appear online when they log in</span>
                    </div>
                  )}
                </div>
              )}

              {callState === 'calling' && (
                <div className="call-status-msg calling">
                  <div className="pulse-ring"></div>
                  <p>Calling {remoteUser?.username}...</p>
                  <button className="btn-end-call" onClick={endCall}>Cancel</button>
                </div>
              )}

              {callState === 'incoming' && (
                <div className="call-status-msg incoming">
                  <p>{remoteUser?.username} is calling you</p>
                  <div className="inline-call-btns">
                    <button className="btn-reject" onClick={rejectCall}>Decline</button>
                    <button className="btn-accept" onClick={acceptCall}>Accept</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <VideoCall
        callState={callState}
        remoteUser={remoteUser}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onEndCall={endCall}
        onAcceptCall={acceptCall}
        onRejectCall={rejectCall}
        onToggleMute={toggleMute}
        onToggleCamera={toggleCamera}
      />
    </div>
  );
}
