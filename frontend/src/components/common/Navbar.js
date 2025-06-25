import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Bell, 
  LogOut, 
  Settings, 
  User,
  Calendar,
  Clock
} from 'lucide-react';
import UserAvatar from './userAvathar';
import { logout } from '../../store/slices/authSlice';
import io from 'socket.io-client';

const Navbar = ({ userRole = 'manager' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const audioRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

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
    socket.on('notification', (data) => {
      setNotificationCount((count) => count + 1);
      setNotifications((prev) => [{ message: data.message, time: new Date() }, ...prev]);
      if (audioRef.current) audioRef.current.play();
      // Optionally show a toast here
    });
    return () => socket.disconnect();
  }, []);

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
      switch (userRole) {
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
    
    // console.log('Navbar - Generated links for role', userRole, ':', links); // Debug log
    return links;
  };

  const handleBellClick = () => {
    setNotificationCount(0);
    setShowDropdown((prev) => !prev);
    // Optionally show a dropdown with notifications
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20">
      <div className="flex justify-between items-center">
        {/* Logo and Brand */}
        <nav className="flex items-center space-x-9">
          <div className="flex items-center space-x-3">
            <div className="logo ml-auto">
              <span className="text-white font-bold text-sm">
                <img src='/smartsolutions-logo.png' alt='smartsolutions' width={100}  className="ml-5" ></img>
              </span>
            </div>
            {/* <span className="font-bold text-xl text-gray-800">Smart Solutions</span> */}
          </div>
      
        <div className="flex items-center justify-content-center">
          {/* Navigation Links */}
          <div className="flex space-x-2 ml-20 justify-content-center align-items-center">
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium px-4 py-2 rounded-xl transition-all duration-200 no-underline ${
                  isActiveRoute(link.path)
                    ? 'text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-md fw-bold'
                    : 'text-gray-700 hover:bg-white/60 fw-bold'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
          </div>
        </nav>
        
        {/* Right Side - Time, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          {/* Time Display */}
          {/* <div className="text-right">
            <h2 className="text-sm font-medium text-gray-800" >{formatDate(currentTime)}</h2>
            <p className="text-xs text-gray-500">{formatTime(currentTime)}</p>
          </div> */}
          
          {/* Notifications */}
          <div className="relative p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 cursor-pointer" onClick={handleBellClick}>
            <Bell className="text-gray-600 hover:text-orange-500" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                {notificationCount}
              </span>
            )}
            {/* Notification Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b font-semibold text-gray-700">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notif, idx) => (
                    <div key={idx} className="px-4 py-2 border-b last:border-b-0 text-gray-800">
                      <div>{notif.message}</div>
                      <div className="text-xs text-gray-400">{notif.time.toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative group">
            <div className="flex items-center space-x-3 cursor-pointer bg-white/60 rounded-xl p-2 hover:bg-white/80 transition-all duration-200">
              <UserAvatar
                src="https://i.pravatar.cc/40?img=5"
                name={userName}
                size="sm"
                className="border-2 border-white shadow-sm"
              />
              <div className="text-right">
                  <p className="text-base font-bold text-gray-900 mx-3 tracking-wide">{userName}</p>
                  <p className="text-[11px] uppercase text-gray-500 tracking-wider border border-gray-300 rounded-full px-2 py-0.5 inline-block mt-1">
                    {role}
                  </p>
                </div>

            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
          <audio ref={audioRef} src="/notification.wav" preload="auto" />
        </div>
      </div>
    </div>
   
  );
};

export default Navbar; 