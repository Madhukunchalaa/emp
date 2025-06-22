import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  LogOut, 
  Settings, 
  User,
  Calendar,
  Clock
} from 'lucide-react';
import UserAvatar from './userAvathar';

const Navbar = ({ userRole = 'manager' }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [role, setRole] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
            { path: '/assign-task', label: 'Assign Task', icon: '📋' }
          ];
        case 'employee':
        case 'developer':
        case 'designer':
          return [
            { path: '/dashboard', label: 'Home', icon: '🏠' },
            { path: '/my-tasks', label: 'My Tasks', icon: '📋' },
            { path: '/my-projects', label: 'My Projects', icon: '📊' },
            { path: '/daily-updates', label: 'Daily Updates', icon: '📝' },
            { path: '/attendance', label: 'Attendance', icon: '⏰' }
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

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo and Brand */}
        <nav className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-xl text-gray-800">Smart Solutions</span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-2 ml-8">
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium px-4 py-2 rounded-xl transition-all duration-200 no-underline ${
                  isActiveRoute(link.path)
                    ? 'text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-md'
                    : 'text-gray-700 hover:bg-white/60'
                }`}
              >
                <span className="mr-2">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        
        {/* Right Side - Time, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          {/* Time Display */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{formatDate(currentTime)}</p>
            <p className="text-xs text-gray-500">{formatTime(currentTime)}</p>
          </div>
          
          {/* Notifications */}
          <div className="p-2 rounded-xl bg-white/60 hover:bg-white/80 transition-all duration-200 cursor-pointer">
            <Bell className="w-5 h-5 text-gray-600 hover:text-orange-500" />
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
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500">{role}</p>
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
        </div>
      </div>
    </div>
  );
};

export default Navbar; 