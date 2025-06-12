import React, { useState } from 'react';
import { 
  Home, 
  Palette, 
  Layers, 
  Users, 
  Settings, 
  FileText, 
  BarChart3, 
  Bell,
  User,
  LogOut,
  ChevronDown,
  Search,
  Menu,
  X
} from 'lucide-react';

const DesignerDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'design-system', label: 'Design System', icon: Palette },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    setActiveNav('dashboard');
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const LoginForm = () => (
    <>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
      <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow-lg">
            <div className="modal-body p-4">
              <h2 className="text-center mb-4 fw-bold">Welcome Back</h2>
              <form>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="designer@example.com" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" placeholder="••••••••" />
                </div>
                <button 
                  type="button"
                  onClick={handleLogin}
                  className="btn btn-primary w-100 fw-semibold"
                  style={{background: 'linear-gradient(135deg, #007bff, #6f42c1)'}}
                >
                  Sign In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
      
      <style>{`
        .sidebar {
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          background: white;
          border-right: 1px solid #dee2e6;
          z-index: 1000;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        
        .sidebar.show {
          transform: translateX(0);
        }
        
        @media (min-width: 992px) {
          .sidebar {
            position: relative;
            transform: translateX(0);
          }
          .sidebar.show {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0;
          }
        }
        
        .nav-item {
          border-radius: 8px;
          margin-bottom: 4px;
          transition: all 0.2s ease;
        }
        
        .nav-item:hover {
          background-color: #f8f9fa;
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
          color: #1976d2;
          border-right: 3px solid #1976d2;
        }
        
        .banner {
          background: linear-gradient(135deg, #007bff, #6f42c1, #e83e8c);
          color: white;
        }
        
        .profile-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #28a745, #007bff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .logo-icon {
          width: 35px;
          height: 35px;
          background: linear-gradient(135deg, #007bff, #6f42c1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .stat-card {
          border-radius: 12px;
          border: 1px solid #dee2e6;
        }
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
        }
        
        .dropdown-menu.show {
          display: block;
        }
      `}</style>

      <div className="d-flex">
        {/* Mobile Overlay */}
        {sidebarOpen && <div className="overlay d-lg-none" onClick={() => setSidebarOpen(false)}></div>}

        {/* Left Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
          <div className="d-flex flex-column h-100">
            {/* Logo */}
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              <div className="d-flex align-items-center">
                <div className="logo-icon me-3">
                  <Palette size={20} />
                </div>
                <span className="h5 mb-0 fw-bold">DesignHub</span>
              </div>
              <button 
                className="btn btn-outline-secondary d-lg-none"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-grow-1 p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className={`nav-item p-3 d-flex align-items-center cursor-pointer ${
                      activeNav === item.id ? 'active' : ''
                    }`}
                    onClick={() => {
                      setActiveNav(item.id);
                      setSidebarOpen(false);
                    }}
                    style={{cursor: 'pointer'}}
                  >
                    <Icon size={20} className="me-3" />
                    <span className="fw-medium">{item.label}</span>
                  </div>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-3 border-top">
              <div className="d-flex align-items-center p-3 bg-light rounded">
                <div className="profile-avatar me-3">
                  <User size={20} />
                </div>
                <div className="flex-grow-1">
                  <div className="fw-medium small">Sarah Johnson</div>
                  <div className="text-muted" style={{fontSize: '0.75rem'}}>UI/UX Designer</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow-1 d-flex flex-column">
          {/* Top Header */}
          <header className="bg-white border-bottom p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-outline-secondary me-3 d-lg-none"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu size={20} />
                </button>
                <h1 className="h3 mb-0 fw-bold text-capitalize">
                  {activeNav.replace('-', ' ')}
                </h1>
              </div>

              <div className="d-flex align-items-center">
                {/* Search */}
                <div className="input-group me-3 d-none d-md-flex" style={{width: '250px'}}>
                  <span className="input-group-text bg-light border-end-0">
                    <Search size={16} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-start-0 bg-light"
                    placeholder="Search projects..." 
                  />
                </div>

                {/* Notifications */}
                <button className="btn btn-outline-secondary me-3 position-relative">
                  <Bell size={20} />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize: '0.6rem'}}>
                    3
                  </span>
                </button>

                {/* Profile Dropdown */}
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-secondary d-flex align-items-center"
                    onClick={toggleProfileMenu}
                  >
                    <div className="profile-avatar me-2">
                      <User size={16} />
                    </div>
                    <div className="d-none d-md-block text-start me-2">
                      <div className="small fw-medium">Sarah Johnson</div>
                      <div className="text-muted" style={{fontSize: '0.7rem'}}>Designer</div>
                    </div>
                    <ChevronDown size={16} />
                  </button>

                  {showProfileMenu && (
                    <div className="dropdown-menu dropdown-menu-end show position-absolute" style={{top: '100%', right: 0}}>
                      <div className="dropdown-header">
                        <div className="fw-medium">Sarah Johnson</div>
                        <div className="text-muted small">sarah@designhub.com</div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <User size={16} className="me-2" />
                        Profile Settings
                      </a>
                      <a className="dropdown-item d-flex align-items-center" href="#">
                        <Settings size={16} className="me-2" />
                        Account Settings
                      </a>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item d-flex align-items-center text-danger"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} className="me-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Banner Section */}
          <div className="banner p-4">
            <div className="container-fluid">
              <h2 className="display-6 fw-bold mb-3">
                Welcome back, Sarah! 🎨
              </h2>
              <p className="lead opacity-75 mb-4">
                Ready to create something amazing today? Your creativity dashboard is waiting.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button className="btn btn-light btn-lg fw-medium">
                  Start New Project
                </button>
                <button className="btn btn-outline-light btn-lg fw-medium">
                  View Recent Work
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-grow-1 p-4 bg-light">
            <div className="container-fluid">
              {activeNav === 'dashboard' && (
                <div className="row g-4">
                  <div className="col-md-6 col-lg-4">
                    <div className="card stat-card h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="card-title mb-0">Active Projects</h5>
                          <div className="stat-icon bg-primary bg-opacity-10 text-primary">
                            <Layers size={24} />
                          </div>
                        </div>
                        <h2 className="display-6 fw-bold mb-2">14</h2>
                        <small className="text-success">+2 from last week</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card stat-card h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="card-title mb-0">Team Members</h5>
                          <div className="stat-icon bg-info bg-opacity-10 text-info">
                            <Users size={24} />
                          </div>
                        </div>
                        <h2 className="display-6 fw-bold mb-2">8</h2>
                        <small className="text-primary">All active today</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card stat-card h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h5 className="card-title mb-0">Completed</h5>
                          <div className="stat-icon bg-success bg-opacity-10 text-success">
                            <BarChart3 size={24} />
                          </div>
                        </div>
                        <h2 className="display-6 fw-bold mb-2">42</h2>
                        <small className="text-muted">This month</small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeNav !== 'dashboard' && (
                <div className="card stat-card">
                  <div className="card-body text-center py-5">
                    <div className="stat-icon bg-light text-muted mx-auto mb-4">
                      <Layers size={32} />
                    </div>
                    <h3 className="card-title text-capitalize">
                      {activeNav.replace('-', ' ')} Section
                    </h3>
                    <p className="text-muted">
                      This section is ready for your amazing content! Start building your {activeNav.replace('-', ' ')} features here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DesignerDashboard;