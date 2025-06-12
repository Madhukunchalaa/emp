import React, { useState , useEffect } from 'react';
import { Users, Clock, FileText, Palette, User, LogOut, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';



const ManagerDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState('employees');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employees,setEmployees]=useState()
  const [projects,setProjects]=useState()
  const [designs,setDesigns]=useState()
  const [user,setUser]=useState()
  const [updates,setUpdates]=useState()

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode(token);
    setUser(decoded);
  }
}, []);



  // useEffect(()=>{
  //   const token=localStorage.getItem("token")
  //   const decoded=jwtDecode(token)
  //   console.log(decoded.name)
  // })

useEffect(() => {
    const emp = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manager/employees", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setEmployees(response.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    emp(); 
  }, []); 

  useEffect(() => {
    const project = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manager/projects", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    project(); 
  }, []);


  useEffect(() => {
    const design = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/designs/all", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setDesigns(response.data);
      } catch (error) {
        console.error('Error fetching designs:', error);
      }
    };

    design(); 
  }, []);


  useEffect(() => {
    const dailyUpdates= async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/manager/employee-updates", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setUpdates(response.data);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching dailyupdates:', error);
      }
    };

    dailyUpdates(); 
  }, []);
  
  
  

  const workingHours = [
    { employee: 'John Doe', hoursToday: 8, hoursWeek: 40, overtime: 2 },
    { employee: 'Jane Smith', hoursToday: 7.5, hoursWeek: 37.5, overtime: 0 },
    { employee: 'Mike Johnson', hoursToday: 0, hoursWeek: 0, overtime: 0 },
    { employee: 'Sarah Wilson', hoursToday: 8.5, hoursWeek: 42.5, overtime: 2.5 },
  ];

 


  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const sidebarItems = [
    { id: 'employees', label: 'Employee List', icon: Users },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'hours', label: 'Working Hours', icon: Clock },
    { id: 'updates', label: 'Daily Updates', icon: FileText },
    { id: 'designs', label: 'Designs', icon: Palette },
  ];

  const renderContent = () => {
    switch (activeSection) {
     case 'employees':
      const getRandomColorClass = () => {
        const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark'];
        const random = Math.floor(Math.random() * colors.length);
        return `bg-${colors[random]}`;
      };
      const getRandomShadow = () => {
        const shadows = ['shadow-sm', 'shadow', 'shadow-lg'];
        return shadows[Math.floor(Math.random() * shadows.length)];
      };

      return (
        <div>
          <h3 className="mb-4 fw-semibold text-dark">Employee List</h3>
          <div className="row g-4">
            {Array.isArray(employees) && employees.map(emp => {
              const randomBadgeClass = getRandomColorClass();
              const randomShadowClass = getRandomShadow();
              return (
                <div key={emp._id} className="col-md-6 col-lg-4">
                  <div className={`card border-0 rounded-4 ${randomShadowClass}`}>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="avatar text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: '50px',
                              height: '50px',
                              fontSize: '20px',
                              backgroundColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                            }}
                          >
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="card-title mb-1 text-dark fw-bold">{emp.name}</h5>
                            <p className="text-muted mb-0 small">{emp.role}</p>
                          </div>
                        </div>
                        <span className={`badge rounded-pill px-3 py-2 text-white ${randomBadgeClass}`}>
                          {emp.status}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="mb-1"><strong>Email:</strong> {emp.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );


      case 'projects':
        const getStatusButton = (status) => {
          switch (status.toLowerCase()) {
            case 'active':
              return <button className="btn btn-success btn-sm rounded-pill px-3">Active</button>;
            case 'in progress':
              return <button className="btn btn-warning btn-sm rounded-pill px-3 text-dark">In Progress</button>;
            case 'completed':
              return <button className="btn btn-primary btn-sm rounded-pill px-3">Completed</button>;
            default:
              return <button className="btn btn-secondary btn-sm rounded-pill px-3">Unknown</button>;
          }
        };

        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Projects</h3>
            <div className="row g-4">
              {Array.isArray(projects) && projects.map(project => (
                <div key={project.id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-lg rounded-4">
                    <div className="card-body p-4">
                      <div className="d-flex flex-column justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="card-title fw-bold text-dark">{project.title}</h5>
                        </div>
                        <small className="text-muted">Due: {project.deadline}</small>
                        <p className="text-muted small mb-2">{project.description}</p>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <small className="text-dark">Progress</small>
                          <small className="text-dark">{project.status}%</small>
                        </div>
                        <div className="progress" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar ${project.status >= 100 ? 'bg-success' : 'bg-info'}`}
                            role="progressbar"
                            style={{ width: `${project.status}%` }}
                            aria-valuenow={project.status}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          />
                        </div>
                      </div>

                      <div className="text-end">
                        {getStatusButton(project.phase || 'in progress')}
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
            <h3 className="mb-4 fw-semibold text-dark">Working Hours</h3>
            <div className="card shadow-sm">
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Employee</th>
                      <th>Today</th>
                      <th>This Week</th>
                      <th>Overtime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workingHours.map((record, index) => (
                      <tr key={index}>
                        <td className="fw-medium">{record.employee}</td>
                        <td className="text-muted">{record.hoursToday}h</td>
                        <td className="text-muted">{record.hoursWeek}h</td>
                        <td className="text-muted">{record.overtime}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
     case 'updates':
  return (
    <div>
      <h3 className="mb-4 fw-semibold text-dark">Daily Updates</h3>
      <div className="row g-3">
        {Array.isArray(updates) && updates.map(dailyUpdates => (
          <div key={dailyUpdates._id} className="col-12">
            <div className="card shadow-sm border-start border-4 border-info">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="card-title mb-0 text-primary">
                    <b>Name:</b> {dailyUpdates.employee ? dailyUpdates.employee.name : 'Unknown'}
                  </h6>
                  <small className="text-muted">
                    {new Date(dailyUpdates.date).toLocaleDateString()}
                  </small>
                </div>

                <p className="mb-2 text-dark">
                  <b>Email:</b> {dailyUpdates.employee ? dailyUpdates.employee.email : 'Unknown'}
                </p>

                {Array.isArray(dailyUpdates.tasks) && dailyUpdates.tasks.length > 0 ? (
                  dailyUpdates.tasks.map(task => (
                    <div key={task._id} className="mb-3 p-2 rounded bg-light">
                     <p className="mb-1 text-success">
  <b>Project:</b>{' '}
  <Link
    to="/project-details"
    state={{
      project: task.project?.name || 'N/A',
      status: task.status,
      description: task.description,
      hoursSpent: task.hoursSpent,
      comments: dailyUpdates.comments,
    }}
    className="text-decoration-none text-success fw-semibold"
  >
    {task.project?.name || 'N/A'}
  </Link>
</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No tasks recorded.</p>
                )}

                {dailyUpdates.comments && (
                  <p className="text-info bg-info-subtle px-2 py-1 rounded mt-2 mb-0">
                    <em><b>Comment:</b> {dailyUpdates.comments}</em>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

      
      case 'designs':
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Design Assets</h3>
            <div className="row g-3">
            {Array.isArray(designs) && designs.map(design=> (
                <div key={design.id} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="card-title">{design.title}</h6>
                          <p className="text-muted mb-1">by {design.description}</p>
                          <img 
                          src={design.fileURL} alt="Design Preview" />
                          <div><small className="text-muted">{design.submittedDate}</small></div>
                        </div>
                        <span className={`badge rounded-pill ${
                          design.status === 'Approved' ? 'bg-success' :
                          design.status === 'In Review' ? 'bg-warning' :
                          'bg-info'
                        }`}>
                          {design.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              <h2 className="text-center mb-4 fw-bold">Manager Login</h2>
              <form>
                <div className="mb-3">
                  <input 
                    type="email" 
                    className="form-control"
                    placeholder="Email"
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
              </form>
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
      `}</style>
      
      <div className="d-flex min-vh-100 bg-light">
        {/* Sidebar */}
        <div className={`bg-white shadow sidebar ${sidebarOpen ? '' : 'collapsed'}`} style={{ width: sidebarOpen ? '260px' : '80px' }}>
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center justify-content-between">
              {sidebarOpen && <h4 className="mb-0 fw-bold">Dashboard</h4>}
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
              <h1 className="display-4 fw-bold mb-2">Manager Dashboard</h1>
              <p className="lead opacity-75 mb-0">Manage your team and projects efficiently</p>
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
                <h5 className="fw-semibold mb-1">{user?.name}</h5>
                <p className="text-muted mb-1">manager@company.com</p>
                <small className="text-muted">Senior Manager</small>
              </div>

              <div className="mb-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-secondary">Quick Stats</h6>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="fw-bold">3</div>
                        <small className="text-muted">Active Employees</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold">3</div>
                        <small className="text-muted">Active Projects</small>
                      </div>
                      <div className="col-4">
                        <div className="fw-bold">1</div>
                        <small className="text-muted">Pending Reviews</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-secondary">Recent Activity</h6>
                    <div className="text-start">
                      <p className="small text-muted mb-1">• Project update received</p>
                      <p className="small text-muted mb-1">• New design approved</p>
                      <p className="small text-muted mb-0">• Team meeting scheduled</p>
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

export default ManagerDashboard;