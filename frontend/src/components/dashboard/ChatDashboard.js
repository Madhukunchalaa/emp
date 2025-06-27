import React, { useEffect, useState } from 'react';
import { userService } from '../../services/api';
import Chat from '../common/Chat';

const ChatDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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

  return (
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
            </div>
          ))}
        </div>
      </div>
      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ece5dd' }}>
        {selectedUser && currentUser ? (
          <Chat currentUser={currentUser} otherUser={selectedUser} />
        ) : (
          <div style={{ color: '#888', fontSize: 22, textAlign: 'center' }}>
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;
