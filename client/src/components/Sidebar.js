import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function Sidebar({ onSelectUser, selectedUser, callState }) {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('/api/auth/users');
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  const sortedUsers = [...users].sort((a, b) => {
    const aOnline = isOnline(a._id);
    const bOnline = isOnline(b._id);
    if (aOnline && !bOnline) return -1;
    if (!aOnline && bOnline) return 1;
    return a.username.localeCompare(b.username);
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#6C63FF"/>
            <path d="M8 12h10a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-6a2 2 0 012-2z" fill="white" opacity="0.9"/>
            <path d="M20 15l6-3v8l-6-3v-2z" fill="white"/>
          </svg>
          <span>NexCall</span>
        </div>
      </div>

      <div className="current-user">
        <div className="user-avatar-wrap">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
            alt={user?.username}
            className="avatar avatar-sm"
          />
          <span className="status-dot online"></span>
        </div>
        <div className="user-info">
          <span className="user-name">{user?.username}</span>
          <span className="user-status-text">● You</span>
        </div>
        <button className="btn-logout" onClick={logout} title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
        </button>
      </div>

      <div className="users-section">
        <div className="section-header">
          <span>Users</span>
          <span className="online-count">{onlineUsers.filter(id => id !== user?._id).length} online</span>
        </div>

        {loading ? (
          <div className="sidebar-loading">
            {[1,2,3].map(i => (
              <div key={i} className="user-skeleton">
                <div className="skel-avatar"></div>
                <div className="skel-info">
                  <div className="skel-line skel-name"></div>
                  <div className="skel-line skel-status"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="no-users">
            <p>No other users yet</p>
            <p className="hint">Invite someone to join!</p>
          </div>
        ) : (
          <ul className="user-list">
            {sortedUsers.map((u) => {
              const online = isOnline(u._id);
              const isSelected = selectedUser?._id === u._id;
              const isCalling = isSelected && callState !== 'idle';

              return (
                <li
                  key={u._id}
                  className={`user-item ${isSelected ? 'selected' : ''} ${!online ? 'offline' : ''}`}
                  onClick={() => onSelectUser(u)}
                >
                  <div className="user-avatar-wrap">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                      alt={u.username}
                      className="avatar avatar-sm"
                    />
                    <span className={`status-dot ${online ? 'online' : 'offline'}`}></span>
                  </div>
                  <div className="user-info">
                    <span className="user-name">{u.username}</span>
                    <span className={`user-status-text ${online ? 'online-text' : 'offline-text'}`}>
                      {isCalling ? (
                        <span className="calling-indicator">
                          <span className="pulse-dot"></span>
                          In call
                        </span>
                      ) : online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  {online && !isCalling && (
                    <div className="call-btn-hint">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
