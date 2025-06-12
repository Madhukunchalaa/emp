import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, FolderOpen, FileText, CheckCircle, Play, Timer, User, LogOut, Menu, X, CalendarCheck } from 'lucide-react';
import { punchIn } from '../../store/slices/employeeSlice';
import { useDispatch } from 'react-redux';
import { employeeService } from '../../services/api';


const EmployeeDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState('attendance');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [punchInTime, setPunchInTime] = useState(null);
  const [punchOutTime, setPunchOutTime] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [name,setName]=useState()
  const [userEmail,setUserEmail]=useState()
  const [role,setRole]=useState()
  const [punchStatus,setPunchStatus]=useState()

  //employeee profile
useEffect(()=>{
  const empl=async()=>{
    try{

      const response=await employeeService.getProfile()
      setName(response.data.name)
      setUserEmail(response.data.email)
      setRole(response.data.role)

    }
    catch(err){
      console.error('failed to fetch employee profile details',err)
    }
  }
  empl()
},[])

  //punchin details
const handlePunch=async()=>{
  try{

    const response=await employeeService.punchIn()
    console.log(response.data)
    setIsWorking(true)
    alert('punched in success')
    
  }
  catch(err){
    console.error('failed to punc in please try again',err)
    alert(err.message)

  }
}







  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sample data
  const myProjects = [
    { id: 1, name: 'User Authentication System', status: 'In Progress', progress: 65, deadline: '2025-07-20', priority: 'High' },
    { id: 2, name: 'Dashboard UI Components', status: 'Active', progress: 40, deadline: '2025-08-15', priority: 'Medium' },
    { id: 3, name: 'API Integration', status: 'Active', progress: 80, deadline: '2025-06-25', priority: 'High' },
  ];

  const finishedProjects = [
    { id: 1, name: 'Login Page Design', completedDate: '2025-06-05', duration: '2 weeks' },
    { id: 2, name: 'Database Schema', completedDate: '2025-05-28', duration: '1 week' },
    { id: 3, name: 'Testing Framework Setup', completedDate: '2025-05-15', duration: '3 days' },
  ];

  const dailyUpdates = [
    { id: 1, date: '2025-06-11', update: 'Completed user registration form validation and error handling', status: 'completed' },
    { id: 2, date: '2025-06-10', update: 'Working on authentication middleware and JWT token implementation', status: 'in-progress' },
    { id: 3, date: '2025-06-09', update: 'Fixed responsive design issues on mobile devices', status: 'completed' },
  ];

  const attendanceRecords = [
    { date: '2025-06-11', punchIn: '09:15 AM', punchOut: '06:30 PM', totalHours: '8.25', status: 'Present' },
    { date: '2025-06-10', punchIn: '09:00 AM', punchOut: '06:15 PM', totalHours: '8.25', status: 'Present' },
    { date: '2025-06-09', punchIn: '09:30 AM', punchOut: '06:45 PM', totalHours: '8.25', status: 'Present' },
    { date: '2025-06-08', punchIn: '10:00 AM', punchOut: '07:00 PM', totalHours: '8.00', status: 'Late' },
  ];

  const totalHoursData = {
    today: 8.5,
    thisWeek: 42.5,
    thisMonth: 168,
    overtime: 2.5
  };

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const handlePunchIn = () => {
    const now = new Date();
    setPunchInTime(now);
    setIsWorking(true);
    setPunchOutTime(null);
  };

  const handlePunchOut = () => {
    const now = new Date();
    setPunchOutTime(now);
    setIsWorking(false);
  };

  const calculateWorkingHours = () => {
    if (punchInTime && punchOutTime) {
      const diff = (punchOutTime - punchInTime) / (1000 * 60 * 60);
      return diff.toFixed(2);
    }
    return '0.00';
  };

  const sidebarItems = [
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'myprojects', label: 'My Projects', icon: FolderOpen },
    { id: 'updates', label: 'Daily Updates', icon: FileText },
    { id: 'finished', label: 'Finished Projects', icon: CheckCircle },
    { id: 'active', label: 'Active Projects', icon: Play },
    { id: 'hours', label: 'Total Hours', icon: Timer },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'attendance':
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Attendance Management</h3>
            
            {/* Punch In/Out Section */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title">Current Time</h5>
                    <h2 className="text-primary mb-3">{currentTime.toLocaleTimeString()}</h2>
                    <p className="text-muted">{currentTime.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="card-title">Today's Status</h5>
                    <div className="mb-3">
                      {punchInTime && (
                        <p className="mb-1">Punch In: <strong>{punchInTime.toLocaleTimeString()}</strong></p>
                      )}
                      {punchOutTime && (
                        <p className="mb-1">Punch Out: <strong>{punchOutTime.toLocaleTimeString()}</strong></p>
                      )}
                      {punchInTime && punchOutTime && (
                        <p className="mb-1">Total Hours: <strong>{calculateWorkingHours()}h</strong></p>
                      )}
                    </div>
                    <div className="d-grid gap-2">
                      <button 
                        onClick={handlePunch}
                        disabled={isWorking}
                        className="btn btn-success"
                      >
                        <Clock size={16} className="me-2" />
                        Punch In
                      </button>
                      <button 
                        onClick={handlePunchOut}
                        disabled={!isWorking}
                        className="btn btn-danger"
                      >
                        <Clock size={16} className="me-2" />
                        Punch Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance History */}
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Attendance History</h5>
              </div>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Punch In</th>
                      <th>Punch Out</th>
                      <th>Total Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((record, index) => (
                      <tr key={index}>
                        <td className="fw-medium">{record.date}</td>
                        <td className="text-muted">{record.punchIn}</td>
                        <td className="text-muted">{record.punchOut}</td>
                        <td className="text-muted">{record.totalHours}h</td>
                        <td>
                          <span className={`badge ${
                            record.status === 'Present' ? 'bg-success' : 'bg-warning'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'myprojects':
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">My Projects</h3>
            <div className="row g-3">
              {myProjects.map(project => (
                <div key={project.id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title">{project.name}</h5>
                        <div>
                          <span className={`badge me-2 ${
                            project.priority === 'High' ? 'bg-danger' : 
                            project.priority === 'Medium' ? 'bg-warning' : 'bg-info'
                          }`}>
                            {project.priority}
                          </span>
                          <span className={`badge ${
                            project.status === 'Active' ? 'bg-primary' : 'bg-success'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted mb-3">Deadline: {project.deadline}</p>
                      <div className="mb-2">
                        <div className="d-flex justify-content-between mb-1">
                          <small>Progress</small>
                          <small>{project.progress}%</small>
                        </div>
                        <div className="progress">
                          <div 
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${project.progress}%` }}
                            aria-valuenow={project.progress}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'updates':
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Daily Updates</h3>
            <div className="mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Add New Update</h5>
                  <div className="mb-3">
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      placeholder="Enter your daily update..."
                    ></textarea>
                  </div>
                  <button className="btn btn-primary">
                    <FileText size={16} className="me-2" />
                    Add Update
                  </button>
                </div>
              </div>
            </div>
            <div className="row g-3">
              {dailyUpdates.map(update => (
                <div key={update.id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0">{update.date}</h6>
                        <span className={`badge ${
                          update.status === 'completed' ? 'bg-success' : 'bg-warning'
                        }`}>
                          {update.status === 'completed' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <p className="card-text text-secondary mb-0">{update.update}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'finished':
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Finished Projects</h3>
            <div className="row g-3">
              {finishedProjects.map(project => (
                <div key={project.id} className="col-md-6">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-start mb-2">
                        <CheckCircle size={20} className="text-success me-2" />
                        <div className="flex-fill">
                          <h6 className="card-title mb-1">{project.name}</h6>
                          <p className="text-muted mb-1">Completed: {project.completedDate}</p>
                          <small className="text-secondary">Duration: {project.duration}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'active':
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Active Projects</h3>
            <div className="row g-3">
              {myProjects.filter(p => p.status === 'Active' || p.status === 'In Progress').map(project => (
                <div key={project.id} className="col-md-6">
                  <div className="card shadow-sm border-primary">
                    <div className="card-body">
                      <div className="d-flex align-items-start mb-2">
                        <Play size={20} className="text-primary me-2" />
                        <div className="flex-fill">
                          <h6 className="card-title mb-1">{project.name}</h6>
                          <p className="text-muted mb-2">Deadline: {project.deadline}</p>
                          <div className="progress" style={{ height: '6px' }}>
                            <div 
                              className="progress-bar bg-primary"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <small className="text-muted">{project.progress}% Complete</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'hours':
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Total Hours</h3>
            <div className="row g-4">
              <div className="col-md-3">
                <div className="card shadow-sm text-center">
                  <div className="card-body">
                    <Timer size={32} className="text-primary mb-2" />
                    <h4 className="text-primary">{totalHoursData.today}h</h4>
                    <p className="text-muted mb-0">Today</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm text-center">
                  <div className="card-body">
                    <Timer size={32} className="text-success mb-2" />
                    <h4 className="text-success">{totalHoursData.thisWeek}h</h4>
                    <p className="text-muted mb-0">This Week</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm text-center">
                  <div className="card-body">
                    <Timer size={32} className="text-info mb-2" />
                    <h4 className="text-info">{totalHoursData.thisMonth}h</h4>
                    <p className="text-muted mb-0">This Month</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card shadow-sm text-center">
                  <div className="card-body">
                    <Timer size={32} className="text-warning mb-2" />
                    <h4 className="text-warning">{totalHoursData.overtime}h</h4>
                    <p className="text-muted mb-0">Overtime</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Weekly Hours Chart */}
            <div className="card shadow-sm mt-4">
              <div className="card-header">
                <h5 className="mb-0">Weekly Hours Breakdown</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                    const hours = [8.5, 8.0, 8.5, 7.5, 8.0, 0, 2.0][index];
                    return (
                      <div key={day} className="col text-center">
                        <div className="mb-2">
                          <div 
                            className="bg-primary rounded"
                            style={{ 
                              height: `${Math.max(hours * 10, 5)}px`,
                              width: '20px',
                              margin: '0 auto'
                            }}
                          ></div>
                        </div>
                        <small className="text-muted">{day}</small>
                        <div><small className="fw-bold">{hours}h</small></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div className="text-center text-muted">Select a section from the sidebar</div>;
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
        <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
          <div className="card shadow-lg" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="card-body p-4">
              <h2 className="text-center mb-4 fw-bold">Employee Login</h2>
              <div>
                <div className="mb-3">
                  <input 
                    type="email" 
                    className="form-control"
                    placeholder="Employee ID or Email"
                  />
                </div>
                <div className="mb-3">
                  <input 
                    type="password" 
                    className="form-control"
                    placeholder="Password"
                  />
                </div>
                <button 
                  type="button"
                  onClick={handleLogin}
                  className="btn btn-primary w-100"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
      <style>{`
        .sidebar {
          transition: all 0.3s ease;
          min-height: 100vh;
        }
        .sidebar.collapsed {
          width: 80px !important;
        }
        .sidebar-item {
          transition: all 0.2s ease;
          border: none;
          background: none;
        }
        .sidebar-item:hover {
          background-color: #f8f9fa !important;
        }
        .sidebar-item.active {
          background-color: #e3f2fd !important;
          color: #1976d2 !important;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .header-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .main-content {
          min-height: calc(100vh - 200px);
        }
        .working-status {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
      
      <div className="d-flex min-vh-100 bg-light">
        {/* Sidebar */}
        <div className={`bg-white shadow sidebar ${sidebarOpen ? '' : 'collapsed'}`} style={{ width: sidebarOpen ? '260px' : '80px' }}>
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              {sidebarOpen && <h4 className="mb-0 fw-bold">Employee Portal</h4>}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-outline-secondary btn-sm"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          
          <nav className="p-3">
            <div className="d-grid gap-2">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`sidebar-item btn d-flex align-items-center text-start p-2 rounded ${
                      activeSection === item.id ? 'active' : ''
                    }`}
                  >
                    <Icon size={20} className="me-3" />
                    {sidebarOpen && <span className="fw-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-fill d-flex flex-column">
          {/* Header Banner */}
          <header className="header-banner text-white p-4 shadow">
            <div className="text-center">
              <h1 className="display-4 fw-bold mb-2">Employee Dashboard</h1>
              <p className="lead opacity-75 mb-0">Track your work, manage projects, and stay productive</p>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-fill p-4 main-content">
            {renderContent()}
          </main>
        </div>

        {/* Right Sidebar - Profile */}
        <div className="bg-white shadow" style={{ width: '320px' }}>
          <div className="p-4">
            <div className="text-center">
              <div className="profile-avatar rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                <User size={32} className="text-white" />
              </div>
              
              <div className="mb-4">
                <h5 className="fw-semibold mb-1">{name}</h5>
                <p className="text-muted mb-1">{userEmail}</p>
                <small className="text-muted">{role}</small>
                {isWorking && (
                  <div className="mt-2">
                    <span className="badge bg-success working-status">Currently Working</span>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-secondary">Today's Summary</h6>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="fw-bold text-primary">8.5h</div>
                        <small className="text-muted">Hours Logged</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-success">3</div>
                        <small className="text-muted">Tasks Done</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold text-info">2</div>
                        <small className="text-muted">Active Projects</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-secondary">Quick Actions</h6>
                    <div className="d-grid gap-2">
                      <button className="btn btn-outline-primary btn-sm">
                        <FileText size={14} className="me-1" />
                        Add Update
                      </button>
                      <button className="btn btn-outline-success btn-sm">
                        <Clock size={14} className="me-1" />
                        View Timesheet
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
              >
                <LogOut size={16} className="me-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;