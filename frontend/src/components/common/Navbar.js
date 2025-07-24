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
<<<<<<< HEAD
  Clock,
  ChevronDown
=======
  ChevronDown,
  Clock,
  Calendar,
  Dot
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
} from 'lucide-react';
import UserAvatar from './userAvathar';
import { logout } from '../../store/slices/authSlice';
import io from 'socket.io-client';

<<<<<<< HEAD
// Context to share unread state with Chat component (optional for MVP)
export const ChatNotificationContext = createContext();

const Navbar = ({ userRole = 'manager' }) => {
=======
// Context to share unread state with Chat component
export const ChatNotificationContext = createContext();

const Navbar = ({ userRole = 'manager', children }) => {
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
<<<<<<< HEAD
  const location = useLocation();
=======
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  
  const location = useLocation();

>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
<<<<<<< HEAD
  const audioRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Add missing refs and state for dropdowns
  const profileDropdownRef = useRef(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const notificationDropdownRef = useRef(null);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  // --- Chat notification state ---
  const [unreadMessages, setUnreadMessages] = useState({}); // { userId: count }
  const [chatOpenWith, setChatOpenWith] = useState(null); // userId of open chat

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
=======
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
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
  }, [mobileMenuOpen]);

  // Update time every second
  useEffect(() => {
 const timer = setInterval(() => {
   setCurrentTime(new Date());
 }, 1000);
 return () => clearInterval(timer);
  }, []);

<<<<<<< HEAD
  // Fetch user details if not already set
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

  // Total unread chat messages
  const totalUnread = Object.values(unreadMessages).reduce((a, b) => a + b, 0);

  // To be called from Chat component when opening a chat with userId
  // Example: setChatOpenWith(userId); setUnreadMessages((prev) => ({ ...prev, [userId]: 0 }));

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
=======
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
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
  };

  const handleLogout = () => {
 dispatch(logout());
 navigate('/login');
  };

  const isActiveRoute = (path) => {
 return location.pathname === path;
  };

  const getNavLinks = () => {
<<<<<<< HEAD
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
    return links;
  };

  const handleBellClick = () => {
    setNotificationCount(0);
    setShowDropdown((prev) => !prev);
    // Optionally show a dropdown with notifications
=======
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
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
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

<<<<<<< HEAD
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
            <img src='/smartsolutions-logo.png' alt='smartsolutions' width={100} className="h-12 ml-6" />
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
                className={`flex items-center space-x-1 px-3 py-1.5 font-[600] rounded-lg text-md font-medium transition-all duration-200 no-underline ${
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
          <div className="flex items-center space-x-2 ml-6">
            {/* Notifications */}
            <div ref={notificationDropdownRef} className="relative p-1.5 rounded-lg bg-gray-100 hover:bg-orange-50 transition-all duration-200 cursor-pointer" onClick={handleBellClick}>
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
            <div ref={profileDropdownRef} className="relative group">
              <div className="flex items-center space-x-2 cursor-pointer rounded-lg p-1.5  transition-all duration-200">
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
=======
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
>>>>>>> c725c1abc7ee1a0d41f2bb9b7ff871a079a03917
