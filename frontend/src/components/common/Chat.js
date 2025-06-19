import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const apiUrl = process.env.REACT_APP_API_URL || '';
const SOCKET_URL = apiUrl ? apiUrl.replace('/api', '') : '';

const socket = SOCKET_URL ? io(SOCKET_URL, { transports: ['websocket'] }) : null;

export default function Chat({ currentUser, otherUser }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  // Join room and fetch history
  useEffect(() => {
    if (!currentUser?._id || !otherUser?._id || !socket) return;
    socket.emit('join', { userId: currentUser._id });

    // Fetch chat history
    fetch(`${apiUrl}/employee/chat/history?user1=${currentUser._id}&user2=${otherUser._id}`)
      .then(res => res.json())
      .then(setMessages);

    // Listen for new messages
    socket.on('receiveMessage', msg => {
      // Only add if it's for this chat
      if (
        (msg.from === currentUser._id && msg.to === otherUser._id) ||
        (msg.from === otherUser._id && msg.to === currentUser._id)
      ) {
        setMessages(msgs => [...msgs, msg]);
      }
    });

    return () => socket.off('receiveMessage');
  }, [currentUser?._id, otherUser?._id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    let fileUrl = null, fileName = null;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${apiUrl}/employee/chat/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      fileUrl = data.fileUrl;
      fileName = data.fileName;
    }
    if (socket) {
      socket.emit('sendMessage', {
        from: currentUser._id,
        to: otherUser._id,
        message: text,
        fileUrl,
        fileName,
      });
    }
    setText('');
    setFile(null);
  };

  if (!SOCKET_URL) {
    return <div style={{ color: 'red' }}>Chat is not available: API URL is not set.</div>;
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', border: '1px solid #eee', borderRadius: 10, padding: 16, background: '#fff' }}>
      <div style={{ height: 300, overflowY: 'auto', marginBottom: 12, background: '#f9f9f9', borderRadius: 8, padding: 8 }}>
        {messages.map(msg => (
          <div key={msg._id || Math.random()} style={{ marginBottom: 10, textAlign: msg.from === currentUser._id ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              background: msg.from === currentUser._id ? '#1976d2' : '#eee',
              color: msg.from === currentUser._id ? '#fff' : '#222',
              borderRadius: 8,
              padding: '6px 12px',
              maxWidth: '80%',
              wordBreak: 'break-word'
            }}>
              {msg.message}
              {msg.fileUrl && (
                <div>
                  <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ffd600', textDecoration: 'underline' }}>
                    {msg.fileName || 'File'}
                  </a>
                </div>
              )}
            </div>
            <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, borderRadius: 6, border: '1px solid #ccc', padding: 8 }}
        />
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          style={{ flex: 1 }}
        />
        <button
          onClick={sendMessage}
          disabled={!text && !file}
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0 16px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
} 