import React, { useEffect, useState, useContext, useRef } from 'react';
import { userService } from '../../services/api';
import Chat from '../common/Chat';
import { ChatNotificationContext } from '../common/Navbar';

const ChatDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const audioRef = useRef(null);
  const { unreadMessages, setUnreadMessages, chatOpenWith, setChatOpenWith } = useContext(ChatNotificationContext);

  useEffect(() => {
    // Get current user from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userObj = payload.user || payload;
        setCurrentUser({ _id: userObj._id || userObj.id, ...userObj });
      } catch (e) {
        console.error('Failed to decode token for current user', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getAllUsers();
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users for chat', err);
      }
    };
    fetchUsers();
  }, []);

  // When a user is selected, mark their messages as read
  useEffect(() => {
    if (selectedUser && setUnreadMessages) {
      setChatOpenWith(selectedUser._id);
      setUnreadMessages((prev) => ({ ...prev, [selectedUser._id]: 0 }));
    }
  }, [selectedUser, setUnreadMessages, setChatOpenWith]);

  return (
    <>
      {/* Notification sound element above chat */}
      <audio ref={audioRef} src="/notification.wav" preload="auto" />
      <div style={{ display: 'flex', height: '100vh', background: '#ece5dd' }}>
        {/* Sidebar */}
        <div style={{ width: 320, background: '#fff', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 20, background: '#075e54', color: '#fff', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
            Chat
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {users.map(user => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 18px',
                  cursor: 'pointer',
                  background: selectedUser?._id === user._id ? '#e0f2f1' : '#fff',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#b2dfdb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: 18,
                  color: '#00695c',
                  marginRight: 16
                }}>
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{user.name}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>{user.role}</div>
                </div>
                {/* Unread badge */}
                {unreadMessages && unreadMessages[user._id] > 0 && (
                  <span style={{
                    position: 'absolute',
                    right: 18,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: '#25d366',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: 12,
                    minWidth: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    padding: '0 7px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                  }}>{unreadMessages[user._id]}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ece5dd' }}>
          {selectedUser && currentUser ? (
            <Chat currentUser={currentUser} otherUser={selectedUser} audioRef={audioRef} />
          ) : (
            <div style={{ color: '#888', fontSize: 22, textAlign: 'center' }}>
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatDashboard;
