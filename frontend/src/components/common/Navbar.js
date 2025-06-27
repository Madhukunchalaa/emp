import React, { useState, useEffect, useRef, createContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Bell, 
  LogOut, 
  Settings, 
  User,
  Menu,
  X
} from 'lucide-react';
import UserAvatar from './userAvathar';
import { logout } from '../../store/slices/authSlice';
import io from 'socket.io-client';

// Context to share unread state with Chat component (optional for MVP)
export const ChatNotificationContext = createContext();

const Navbar = ({ userRole = 'manager' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- Chat notification state ---
  const [unreadMessages, setUnreadMessages] = useState({}); // { userId: count }
  const [chatOpenWith, setChatOpenWith] = useState(null); // userId of open chat

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch user details if not already set
  useEffect(() => {
    if (!userName) {
      const fetchUserDetails = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          // console.log('Navbar - User data from localStorage:', user); // Debug log
          setUserName(user.name || 'User');
          setUserEmail(user.email || '');
          setRole(user.role || userRole);
          // console.log('Navbar - Set role to:', user.role || userRole); // Debug log
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          setUserName('User');
          setUserEmail('');
          setRole(userRole);
        }
      };
      fetchUserDetails();
    }
  }, [userName, userRole]);

  useEffect(() => {
    const socket = io('http://localhost:5000'); // or your deployed backend
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      socket.emit('join', { userId: user.id });
    }
    // Listen for chat messages
    socket.on('chat_message', (data) => {
      // data: { from: senderId, message: ... }
      if (chatOpenWith !== data.from) {
        setUnreadMessages((prev) => ({
          ...prev,
          [data.from]: (prev[data.from] || 0) + 1
        }));
      }
      // Optionally play sound, show toast, etc.
      if (audioRef.current) audioRef.current.play();
    });
    // Listen for other notifications (optional)
    socket.on('notification', (data) => {
      setNotificationCount((count) => count + 1);
      setNotifications((prev) => [{ message: data.message, time: new Date() }, ...prev]);
      if (audioRef.current) audioRef.current.play();
      // Optionally show a toast here
    });
    return () => socket.disconnect();
  }, [chatOpenWith]);

  // Total unread chat messages
  const totalUnread = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

  // To be called from Chat component when opening a chat with userId
  // Example: setChatOpenWith(userId); setUnreadMessages((prev) => ({ ...prev, [userId]: 0 }));

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const getNavLinks = () => {
    const links = (() => {
      switch (role || userRole) {
        case 'manager':
          return [
            { path: '/dashboard', label: 'Home', icon: '🏠' },
            { path: '/team', label: 'Team', icon: '👥' },
            { path: '/projects', label: 'Projects', icon: '📊' },
            { path: '/reports', label: 'Reports', icon: '📈' },
            { path: '/assign-project', label: 'Create Project', icon: '➕' },
            { path: '/assign-task', label: 'Assign Task', icon: '📋' },
            { path: '/manager-leave', label: 'Leave Requests', icon: '🗂️' }
          ];
        case 'employee':
        case 'developer':
        case 'designer':
          return [
            { path: '/dashboard', label: 'Home', icon: '🏠' },
            { path: '/my-tasks', label: 'My Tasks', icon: '📋' },
            { path: '/my-projects', label: 'My Projects', icon: '📊' },
            { path: '/daily-updates', label: 'Daily Updates', icon: '📝' },
            { path: '/attendance', label: 'Attendance', icon: '⏰' },
            { path: '/Leave', label: 'Leave', icon: '📝' }
          ];
        case 'Business':
        case 'business':
          return [
            { path: '/dashboard', label: 'Home', icon: '🏠' },
            { path: '/opportunities', label: 'Opportunities', icon: '💼' },
            { path: '/leads', label: 'Leads', icon: '🎯' },
            { path: '/proposals', label: 'Proposals', icon: '📄' },
            { path: '/analytics', label: 'Analytics', icon: '📈' }
          ];
        default:
          return [
            { path: '/dashboard', label: 'Home', icon: '🏠' }
          ];
      }
    })();
    // Add Chat link for all roles
    links.push({ path: '/chat', label: 'Chat', icon: '💬' });
    // console.log('Navbar - Generated links for role', role || userRole, ':', links); // Debug log
    return links;
  };

  const handleBellClick = () => {
    setNotificationCount(0);
    setShowDropdown((prev) => !prev);
    // Optionally show a dropdown with notifications
  };

  // Mobile nav dropdown
  const MobileNav = () => (
    <div className={`fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <img src='/smartsolutions-logo.png' alt='smartsolutions' width={90} className="h-7" />
        <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded hover:bg-gray-200">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {getNavLinks().map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline ${
              isActiveRoute(link.path)
                ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow'
                : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="text-base">{link.icon}</span>
            <span>{link.label}</span>
            {/* Show unread badge for chat link */}
            {link.path === '/chat' && totalUnread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] rounded-full px-1.5">{totalUnread}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <ChatNotificationContext.Provider value={{ unreadMessages, setUnreadMessages, chatOpenWith, setChatOpenWith }}>
      <header className="w-full bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="flex items-center justify-between px-2 py-1">
          {/* Logo and Hamburger */}
          <div className="flex items-center space-x-2">
            <img src='/smartsolutions-logo.png' alt='smartsolutions' width={80} className="h-7" />
            <button className="lg:hidden p-1 ml-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          {/* Nav links (desktop only) */}
          <nav className="hidden lg:flex items-center space-x-1 ml-4">
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 no-underline ${
                  isActiveRoute(link.path)
                    ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white shadow'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
                {/* Show unread badge for chat link */}
                {link.path === '/chat' && totalUnread > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-[10px] rounded-full px-1.5">{totalUnread}</span>
                )}
              </Link>
            ))}
          </nav>
          {/* Right side: notifications and profile */}
          <div className="flex items-center space-x-2 ml-auto">
            {/* Notifications */}
            <div className="relative p-1.5 rounded-lg bg-gray-100 hover:bg-orange-50 transition-all duration-200 cursor-pointer" onClick={handleBellClick}>
              <Bell className="w-4 h-4 text-gray-600 hover:text-orange-500" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">
                  {notificationCount}
                </span>
              )}
              {/* Notification Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto text-xs">
                  <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="p-3 text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div key={idx} className="px-3 py-2 border-b last:border-b-0 text-gray-800">
                        <div>{notif.message}</div>
                        <div className="text-[10px] text-gray-400">{notif.time.toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {/* Profile Dropdown */}
            <div className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer bg-gray-100 rounded-lg p-1.5 hover:bg-orange-50 transition-all duration-200">
                <UserAvatar
                  src="https://i.pravatar.cc/40?img=5"
                  name={userName}
                  size="sm"
                  className="border-2 border-white shadow-sm"
                />
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900 mx-2 tracking-wide">{userName}</p>
                  <p className="text-[10px] uppercase text-gray-500 tracking-wider border border-gray-200 rounded-full px-2 py-0.5 inline-block mt-0.5">
                    {role}
                  </p>
                </div>
              </div>
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-xs">
                <div className="py-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
              <audio ref={audioRef} src="/notification.wav" preload="auto" />
            </div>
          </div>
        </div>
        {/* Mobile nav dropdown */}
        {mobileMenuOpen && <MobileNav />}
      </header>
    </ChatNotificationContext.Provider>
  );
};

export default Navbar; 