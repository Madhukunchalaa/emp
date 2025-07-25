import React, { useState, useEffect, useRef, createContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Bell, 
  LogOut, 
  Settings, 
  User,
  Menu,
  X,
  ChevronDown,
  Clock,
  Calendar,
  Dot
} from 'lucide-react';
import UserAvatar from './userAvathar';
import { logout } from '../../store/slices/authSlice';
import io from 'socket.io-client';

// Context to share unread state with Chat component
export const ChatNotificationContext = createContext();

const Navbar = ({ userRole = 'manager', children }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  const location = useLocation();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState({});
  const [chatOpenWith, setChatOpenWith] = useState(null);
  
  const audioRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
 const handleClickOutside = (event) => {
   if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
  setProfileDropdownOpen(false);
   }
   if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
  setNotificationDropdownOpen(false);
   }
   if (mobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
  setMobileMenuOpen(false);
   }
 };
 
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Update time every second
  useEffect(() => {
 const timer = setInterval(() => {
   setCurrentTime(new Date());
 }, 1000);
 return () => clearInterval(timer);
  }, []);

  // Fetch user details
  useEffect(() => {
 if (!userName) {
   const fetchUserDetails = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.name || 'User');
    setUserEmail(user.email || '');
    setRole(user.role || userRole);
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

  // Socket connection for real-time notifications
  useEffect(() => {
 const socket = io('https://emp-1-rgfq.onrender.com');
 const user = JSON.parse(localStorage.getItem('user') || '{}');
 
 if (user && user.id) {
   socket.emit('join', { userId: user.id });
 }

 socket.on('chat_message', (data) => {
   if (chatOpenWith !== data.from) {
  setUnreadMessages((prev) => ({
    ...prev,
    [data.from]: (prev[data.from] || 0) + 1
  }));
   }
   if (audioRef.current) audioRef.current.play();
 });

 socket.on('notification', (data) => {
   setNotificationCount((count) => count + 1);
   setNotifications((prev) => [
  { 
    id: Date.now(), 
    message: data.message, 
    time: new Date(),
    type: data.type || 'info',
    read: false
  }, 
  ...prev
   ]);
   if (audioRef.current) audioRef.current.play();
 });

 return () => socket.disconnect();
  }, [chatOpenWith]);

  const totalUnread = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

  const formatTime = (date) => {
 return date.toLocaleTimeString('en-US', { 
   hour12: true,
   hour: '2-digit',
   minute: '2-digit'
 });
  };

  const formatDate = (date) => {
 return date.toLocaleDateString('en-US', { 
   weekday: 'short',
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
  case 'admin':
    return [
   { path: '/admin/empid', label: 'Admin Dashboard', icon: '🛠️' },
   // Optionally add more admin links here
    ];
  case 'manager':
    return [
   { path: '/dashboard', label: 'Dashboard',   },
   { path: '/team', label: 'Team'},
   { path: '/projects', label: 'Projects'},
   { path: '/reports', label: 'Reports' },
   { path: '/assign-project', label: 'Create Project' },
   { path: '/assign-task', label: 'Assign Task', },
   { path: '/manager-leave', label: 'Leave Requests'}
    ];
  case 'team-leader':
    return [
   { path: '/dashboard', label: 'Dashboard',   },
   { path: '/team-management', label: 'Team Management'},
   { path: '/team-tasks', label: 'Team Tasks'},
   { path: '/team-projects', label: 'Team Projects'},
   { path: '/team-reports', label: 'Team Reports'},
   { path: '/assign-team-task', label: 'Assign Task'}
    ];
  case 'employee':
  case 'developer':
  case 'designer':
    return [
   { path: '/dashboard', label: 'Dashboard'},
   { path: '/my-tasks', label: 'My Tasks' },
   { path: '/my-projects', label: 'My Projects'},
   { path: '/daily-updates', label: 'Daily Updates'},
   { path: '/attendance', label: 'Attendance'},
   { path: '/Leave', label: 'Leave'}
    ];
  case 'Business':
  case 'business':
    return [
   { path: '/dashboard', label: 'Dashboard'},
   { path: '/opportunities', label: 'Opportunities'},
   { path: '/leads', label: 'Leads'},
   { path: '/proposals', label: 'Proposals'},
   { path: '/analytics', label: 'Analytics'}
    ];
  default:
    return [
   { path: '/dashboard', label: 'Dashboard',  }
    ];
   }
 })();
 
 links.push({ path: '/chat', label: 'Chat'});
 return links;
  };

  const handleNotificationClick = () => {
 setNotificationDropdownOpen(!notificationDropdownOpen);
 if (notificationCount > 0) {
   setNotificationCount(0);
   setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
 }
  };

  const markNotificationAsRead = (id) => {
 setNotifications(prev => 
   prev.map(notif => 
  notif.id === id ? { ...notif, read: true } : notif
   )
 );
  };

  const clearAllNotifications = () => {
 setNotifications([]);
 setNotificationCount(0);
  };

  return (
 <ChatNotificationContext.Provider value={{ 
   unreadMessages, 
   setUnreadMessages, 
   chatOpenWith, 
   setChatOpenWith 
 }}>
   <div className="flex flex-col">
  <header className="sticky top-0 z-40 bg-gradient-to-br from-green-100 via-white to-emerald-100 shadow-sm">
    {/* Top Bar */}
    <div className="flex h-16 items-center justify-between px-4 lg:px-6 border-b border-green-200/60">
   {/* Logo Section */}
   <div className="flex items-center space-x-4">
     <img src='/smartsolutions-logo.png' alt='Smart Solutions' className="h-10 w-auto" />
   </div>

   {/* Navigation - Desktop */}
   <nav className="hidden md:flex items-center space-x-4 flex-1 justify-center">
     {getNavLinks().map((link) => (
    <Link
      key={link.path}
      to={link.path}
      className={`px-3 py-2 rounded-md text-md font-bold transition-colors no-underline ${
     isActiveRoute(link.path)
       ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow'
       : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
      }`}
    >
      <span className="flex items-center space-x-2">
     <span>{link.icon}</span>
     <span>{link.label}</span>
      </span>
    </Link>
     ))}
   </nav>

   {/* Right Section */}
   <div className="flex items-center space-x-4">
     {/* Time Display */}
     <div className="hidden md:flex items-center space-x-2 text-emerald-700">
    <Clock className="w-4 h-4" />
    <span className="text-sm">{formatTime(currentTime)}</span>
     </div>

     {/* Notifications */}
     <div className="relative" ref={notificationDropdownRef}>
    <button
      onClick={handleNotificationClick}
      className="p-2 rounded-full hover:bg-green-100 relative"
    >
      <Bell className="w-5 h-5 text-green-500" />
      {notificationCount > 0 && (
     <span className="absolute top-0 right-0 h-5 w-5 text-xs flex items-center justify-center bg-emerald-500 text-white rounded-full">
       {notificationCount}
     </span>
      )}
    </button>
    {/* Notification Dropdown */}
    {notificationDropdownOpen && (
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-green-200 py-2 z-50">
     <div className="flex items-center justify-between px-4 pb-2 border-b border-green-100">
       <h3 className="text-sm font-semibold text-emerald-700">Notifications</h3>
       <button
      onClick={clearAllNotifications}
      className="text-xs text-green-400 hover:text-emerald-700"
       >
      Clear all
       </button>
     </div>
     <div className="max-h-96 overflow-y-auto">
       {notifications.length === 0 ? (
      <p className="text-sm text-emerald-400 text-center py-4">No notifications</p>
       ) : (
      notifications.map((notification) => (
        <div
       key={notification.id}
       className={`px-4 py-3 hover:bg-green-50 cursor-pointer ${
         !notification.read ? 'bg-green-50' : ''
       }`}
       onClick={() => markNotificationAsRead(notification.id)}
        >
       <p className="text-sm text-gray-800">{notification.message}</p>
       <p className="text-xs text-emerald-400 mt-1">
         {formatTime(new Date(notification.time))}
       </p>
        </div>
      ))
       )}
     </div>
      </div>
    )}
     </div>

     {/* Profile Dropdown */}
     <div className="relative" ref={profileDropdownRef}>
    <button
      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
      className="flex items-center space-x-2 p-2 rounded-full hover:bg-green-100"
    >
      <UserAvatar name={userName} size="sm" className="bg-green-500 text-white" />
      <span className="hidden md:block text-sm font-medium text-emerald-700">{userName}</span>
      <ChevronDown className="w-4 h-4 text-green-400" />
    </button>
    {profileDropdownOpen && (
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-green-200 py-2 z-50">
     <div className="px-4 py-2 border-b border-green-100">
       <p className="text-sm font-medium text-emerald-700">{userName}</p>
       <p className="text-xs text-emerald-400">{userEmail}</p>
     </div>
     <div className="py-1">
       <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center space-x-2"
       >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
       </button>
     </div>
      </div>
    )}
     </div>
   </div>
    </div>

    {/* Mobile Navigation */}
    <div className="md:hidden border-b border-green-200">
   <div className="px-4 py-3">
     <button
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    className="w-full flex items-center justify-between py-2 rounded-lg border border-green-200 px-4"
     >
    <span className="text-sm font-medium text-emerald-700">Menu</span>
    {mobileMenuOpen ? (
      <X className="w-5 h-5 text-green-400" />
    ) : (
      <Menu className="w-5 h-5 text-green-400" />
    )}
     </button>
   </div>
   {mobileMenuOpen && (
     <nav className="px-4 py-2 space-y-1">
    {getNavLinks().map((link) => (
      <Link
     key={link.path}
     to={link.path}
     onClick={() => setMobileMenuOpen(false)}
     className={`block px-3 py-2 rounded-md text-base font-medium ${
       isActiveRoute(link.path)
      ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow'
      : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
     }`}
      >
     <span className="flex items-center space-x-2">
       <span>{link.icon}</span>
       <span>{link.label}</span>
     </span>
      </Link>
    ))}
     </nav>
   )}
    </div>
  </header>

  {/* Main Content
  <main className="flex-1 p-6">
    {children}
  </main> */}

  {/* Audio for notifications */}
  <audio ref={audioRef} src="/notification.wav" />
   </div>
 </ChatNotificationContext.Provider>
  );
};

export default Navbar;