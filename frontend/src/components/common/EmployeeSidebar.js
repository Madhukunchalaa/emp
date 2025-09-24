import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Bell, 
  LogOut, 
  User,
  Menu,
  X,
  ChevronDown,
  Clock,
  Calendar,
  Home,
  CheckSquare,
  Briefcase,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import UserAvatar from './userAvathar';
import { logout } from '../../store/slices/authSlice';
import io from 'socket.io-client';

const EmployeeSidebar = ({ children }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const audioRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const notificationDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserName(user.name || 'User');
      setUserEmail(user.email || '');
    } catch (error) {
      setUserName('User');
      setUserEmail('');
    }
  }, []);

  useEffect(() => {
    const socket = io('https://emp-1-rgfq.onrender.com');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
      socket.emit('join', { userId: user.id });
    }
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
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActiveRoute = (path) => location.pathname === path;

  const getNavLinks = () => {
    return [
      { path: '/dashboard', label: 'Dashboard', icon: Home },
      { path: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
      { path: '/my-projects', label: 'My Projects', icon: Briefcase },
      { path: '/work-updates', label: 'Work Updates', icon: FileText },
      { path: '/attendance', label: 'Attendance', icon: Calendar },
      { path: '/Leave', label: 'Leave', icon: Calendar },
      { path: '/chat', label: 'Chat', icon: MessageSquare }
    ];
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
    <div className="flex h-screen bg-gray-50">
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={`${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${sidebarCollapsed ? 'w-16' : 'w-64'} 
      fixed md:relative inset-y-0 left-0 z-50 bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-gray-800 font-bold text-lg">SS</span>
                </div>
                <span className="text-white text-xl font-semibold">Smart solutions</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden md:block p-1 rounded-md hover:bg-gray-700 text-white"
              >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-1 rounded-md hover:bg-gray-700 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {!sidebarCollapsed && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userName ? userName.split(' ').map(n => n[0]).join('') : 'E'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{userName || 'Employee'}</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {getNavLinks().map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors group ${
                  isActiveRoute(link.path)
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={sidebarCollapsed ? link.label : ''}
              >
                <IconComponent className={`${sidebarCollapsed ? 'w-5 h-5' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                {!sidebarCollapsed && (
                  <span className="truncate">{link.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-3">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2 text-gray-300 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatTime(currentTime)}</span>
            </div>
          )}

          <div className="relative" ref={notificationDropdownRef}>
            <button
              onClick={handleNotificationClick}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-md hover:bg-gray-700 text-gray-300 relative`}
              title={sidebarCollapsed ? 'Notifications' : ''}
            >
              <Bell className="w-5 h-5" />
              {!sidebarCollapsed && <span>Notifications</span>}
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 text-xs flex items-center justify-center bg-red-500 text-white rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
            {notificationDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-80 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <button onClick={clearAllNotifications} className="text-xs text-blue-400 hover:text-blue-300">Clear all</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-800 cursor-pointer ${
                          !notification.read ? 'bg-gray-800' : ''
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <p className="text-sm text-white">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(new Date(notification.time))}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-md hover:bg-gray-700 text-gray-300`}
            >
              <UserAvatar name={userName} size="sm" className="bg-gray-600 text-white" />
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
            {profileDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-sm font-medium text-white">{userName}</p>
                  <p className="text-xs text-gray-300">{userEmail}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-800 flex items-center space-x-2"
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

      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        <div className="md:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Employee Dashboard</h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <audio ref={audioRef} src="/notification.wav" />
    </div>
  );
};

export default EmployeeSidebar;


