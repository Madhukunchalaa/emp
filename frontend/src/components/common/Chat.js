import React, { useEffect, useState, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { ChatNotificationContext } from './Navbar';
import { chatService } from '../../services/api';

<<<<<<< HEAD
// Socket URL - should be configurable for deployment
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://emp-1-rgfq.onrender.com';

const socket = io(SOCKET_URL, { transports: ['websocket'] });

=======
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://emp-1-rgfq.onrender.com';
const socket = io(SOCKET_URL, { transports: ['websocket'] });

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
export default function Chat({ currentUser, otherUser, style = {}, audioRef }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { setUnreadMessages, chatOpenWith } = useContext(ChatNotificationContext);

  useEffect(() => {
    if (!currentUser?._id || !otherUser?._id || !socket) return;
    socket.emit('join', { userId: currentUser._id });

    const fetchChatHistory = async () => {
      try {
        const response = await chatService.getChatHistory(currentUser._id, otherUser._id);
        setMessages(response.data || []);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setMessages([]);
      }
    };

    fetchChatHistory();

    socket.on('receiveMessage', msg => {
      if (
        (msg.from === currentUser._id && msg.to === otherUser._id) ||
        (msg.from === otherUser._id && msg.to === currentUser._id)
      ) {
        setMessages(msgs => [...msgs, msg]);
<<<<<<< HEAD
        // Play sound if message is from the other user and chat is open
        if (msg.from === otherUser._id && audioRef && audioRef.current) {
          audioRef.current.play();
        }
        // If chat is not open with this user, increment unread count
=======
        if (msg.from === otherUser._id && audioRef && audioRef.current) {
          audioRef.current.play();
        }
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
        if (msg.from === otherUser._id && chatOpenWith !== otherUser._id && setUnreadMessages) {
          setUnreadMessages(prev => ({ ...prev, [otherUser._id]: (prev[otherUser._id] || 0) + 1 }));
        }
      }
    });

    return () => socket.off('receiveMessage');
  }, [currentUser?._id, otherUser?._id, audioRef, chatOpenWith, setUnreadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!currentUser?._id || !otherUser?._id) {
      alert('User information missing. Please re-login.');
      return;
    }
    let fileUrl = null, fileName = null;
    if (file) {
      try {
        const response = await chatService.uploadChatFile(file);
        fileUrl = response.data.fileUrl;
        fileName = response.data.fileName;
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
        return;
      }
    }
    const messageObj = {
      from: currentUser._id,
      to: otherUser._id,
      message: text,
      fileUrl,
      fileName,
    };
    if (socket) {
      socket.emit('sendMessage', messageObj);
    }
    setText('');
    setFile(null);
<<<<<<< HEAD
    // Mark as read for this user
=======
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
    if (setUnreadMessages) {
      setUnreadMessages(prev => ({ ...prev, [otherUser._id]: 0 }));
    }
  };

  return (
<<<<<<< HEAD
    <div style={{ width: '100%', height: '100%', ...style, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid #d0e6d0',
        background: '#25d366',
        color: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        fontWeight: 600,
        fontSize: 18
      }}>
        {otherUser?.name || 'Chat'}
      </div>
      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px 12px',
        background: 'rgba(232,245,233,0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }}>
        {messages.map(msg => {
          const isSender = msg.from === currentUser._id;
          const bubbleStyle = {
            alignSelf: isSender ? 'flex-end' : 'flex-start',
            background: isSender ? '#25d366' : '#fff',
            color: isSender ? '#fff' : '#222',
            borderRadius: 18,
            borderBottomRightRadius: isSender ? 4 : 18,
            borderBottomLeftRadius: isSender ? 18 : 4,
            padding: '10px 16px',
            marginBottom: 2,
            maxWidth: '75%',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            wordBreak: 'break-word',
            fontSize: 15,
            position: 'relative'
          };
          const dateObj = new Date(msg.createdAt);
          const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = dateObj.toLocaleDateString();
          return (
            <div key={msg._id || Math.random()} style={{ display: 'flex', flexDirection: 'column', alignItems: isSender ? 'flex-end' : 'flex-start' }}>
              <div style={bubbleStyle}>
                {msg.message}
                {msg.fileUrl && (
                  <div style={{ marginTop: 6 }}>
                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: isSender ? '#fff59d' : '#388e3c', textDecoration: 'underline', fontSize: 14 }}>
                      {msg.fileName || 'File'}
                    </a>
                  </div>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#888', margin: isSender ? '2px 8px 0 0' : '2px 0 0 8px', alignSelf: isSender ? 'flex-end' : 'flex-start' }}>
                {timeStr}, {dateStr}
=======
    <div className="w-full h-full flex flex-col justify-end bg-[#b2dfdb] rounded-2xl shadow-2xl border border-white/30 overflow-hidden" style={style}>
      {/* Header */}
      <div className="px-6 py-4 bg-[#075e54] text-white font-bold text-lg flex items-center rounded-t-2xl shadow-md">
        <div className="w-10 h-10 rounded-full bg-[#b2dfdb] flex items-center justify-center text-white font-bold text-lg">
          {getInitials(otherUser?.name)}
        </div>
        <span className="truncate ml-3">{otherUser?.name || 'Chat'}</span>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-br from-green-50 via-white to-emerald-50 flex flex-col gap-3">
        {messages.map(msg => {
          const isSender = msg.from === currentUser._id;
          const avatar = (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-base ${isSender ? 'bg-[#b2dfdb] text-white' : 'bg-[#b2dfdb] text-green-700'}`}>
              {getInitials(isSender ? currentUser?.name : otherUser?.name)}
            </div>
          );
          return (
            <div key={msg._id || Math.random()} className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-end gap-2 ${isSender ? 'flex-row-reverse' : ''}`}>
                {avatar}
                <div className={`relative px-5 py-3 rounded-2xl max-w-[75%] shadow-md text-sm font-medium break-words ${isSender ? 'bg-[#b2dfdb] text-green-900 rounded-br-md' : 'bg-white/90 text-green-900 rounded-bl-md border border-green-100'}`}>
                  {msg.message}
                  {msg.fileUrl && (
                    <div className="mt-2">
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className={`underline text-xs ${isSender ? 'text-green-700' : 'text-green-700'}`}>{msg.fileName || 'File'}</a>
                    </div>
                  )}
                </div>
              </div>
              <div className={`text-xs mt-1 ${isSender ? 'text-green-700' : 'text-gray-400'} px-2`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(msg.createdAt).toLocaleDateString()}
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Bar */}
<<<<<<< HEAD
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 10px',
        borderTop: '1px solid #d0e6d0',
        background: '#f7fdf7',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16
      }}>
        {/* File upload icon */}
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 22,
            cursor: 'pointer',
            color: '#25d366',
            padding: '0 6px'
          }}
=======
      <div className="flex items-center gap-2 px-4 py-3 border-t border-white/30 bg-white/90 rounded-b-2xl">
        {/* File upload icon */}
        <button
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          className="text-green-500 text-xl px-2 py-1 rounded hover:bg-[#b2dfdb] transition-colors"
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
          title="Attach file"
        >
          📎
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={e => setFile(e.target.files[0])}
<<<<<<< HEAD
          style={{ display: 'none' }}
=======
          className="hidden"
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
        />
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
<<<<<<< HEAD
          style={{
            flex: 1,
            borderRadius: 20,
            border: '1px solid #b2dfdb',
            padding: '10px 14px',
            fontSize: 15,
            outline: 'none',
            background: '#fff',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}
=======
          className="flex-1 rounded-full border border-green-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white shadow-sm"
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
        />
        <button
          onClick={sendMessage}
          disabled={!text && !file}
<<<<<<< HEAD
          style={{
            background: '#25d366',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: 42,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(37,211,102,0.08)',
            cursor: (!text && !file) ? 'not-allowed' : 'pointer',
            opacity: (!text && !file) ? 0.6 : 1,
            marginLeft: 4
          }}
=======
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-[#b2dfdb] to-gree-700 text-white text-lg font-bold shadow-md ml-1 transition-all duration-200 ${(!text && !file) ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110'}`}
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
          title="Send"
        >
          ➤
        </button>
      </div>
    </div>
  );
} 