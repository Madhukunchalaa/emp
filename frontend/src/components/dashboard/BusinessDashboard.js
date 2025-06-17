import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, FolderOpen, FileText, CheckCircle, Play, Timer, User, LogOut, Menu, X, CalendarCheck } from 'lucide-react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart2,
  GitBranch,
  ClipboardList
} from 'lucide-react';
import { punchIn } from '../../store/slices/employeeSlice';
import { useDispatch } from 'react-redux';
import {useNavigate, Link } from 'react-router-dom';
import { employeeService } from '../../services/api';

const BusinessDevelopmentDashboard = () => {
  const navigate=useNavigate()
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
  const [message,setMessage]=useState()
  const [formData,setFormData]=useState({
    project:'',
    status:'',
    update:'',
    finishBy:''
  })
  const [image, setImage] = useState(null);



const myProjects=[]
const finishedProjects=[]
  

  const hour = new Date().getHours();
const greeting =
  hour < 12 ? "Good Morning" :
  hour < 18 ? "Good Afternoon" :
  "Good Evening";

  //employeee profile
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await employeeService.getProfile();
      setName(response.data.name);
      setUserEmail(response.data.email);
      setRole(response.data.role);
      setIsWorking(response.data.isWorking); // 👈 Add this line
    } catch (err) {
      // console.error('Failed to fetch employee profile details', err);
    }
  };
  fetchProfile();
}, []);


const dailyUpdate=async()=>{
  try{
     const payload = {
      project: "Landing Page Redesign",
      status: "In Progress",
      update: "Completed responsive layout",
      finishBy: "2025-06-15"
     }


    const response=await employeeService.addDailyUpdate(payload)
    console.log(response.data)

  }
  catch{
    console.log('failed to fetch daily updates data')

  }

}
useEffect(()=>{
  dailyUpdate()
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
//punchout details
const handlepunchOut=async()=>{
  try{
    const response=await employeeService.punchOut()
    alert('punched out success')
    setIsWorking(false)
  }
  catch(err){
    alert('punched out failed please try again after some time')
  }
}



const formatDate = (isoDate) =>
    isoDate ? new Date(isoDate).toLocaleDateString() : 'N/A';

  const formatTime = (isoDate) =>
isoDate ? new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';


  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  //dailyupdates
  const handleChange=(e)=>{
    const{name,value}=e.target
    setFormData(prev=>({...prev,[name]:value}))

  }

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = new FormData();
    data.append('project', formData.project);
    data.append('status', formData.status);
    data.append('update', formData.update);
    data.append('finishBy', formData.finishBy);

    if (image) {
      data.append('image', image);
    }

    await employeeService.addDailyUpdate(data); 
    setMessage(`Today's update submitted successfully`);
    setFormData({
      project: '',
      status: '',
      update: '',
      finishBy: ''
    });
    setImage(null);
  } catch (err) {
    setMessage(`Something went wrong`);
    console.error('Form not submitted:', err);
  }
};



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
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },       // Dashboard view
  { id: 'Opportunities', label: 'Opportunities', icon: Briefcase },     // Business/Job opportunities
  { id: 'Clients', label: 'Clients', icon: Users },                      // Group of people
  { id: 'Analytics', label: 'Analytics', icon: BarChart2 },              // Data visualization
  { id: 'Pipelines', label: 'Pipelines', icon: GitBranch },              // Represents workflow
  { id: 'Activity Log', label: 'Activity Log', icon: ClipboardList },    // Logs or task history
];

  const renderContent = () => {
    switch (activeSection) {
      
      
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
             <div className="container mt-4">
      <h3>Submit Daily Update</h3>
      <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Project Name</label>
          <input
            type="text"
            name="project"
            className="form-control"
            value={formData.project}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="">Select Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Update Description</label>
          <textarea
            name="update"
            className="form-control"
            rows="3"
            value={formData.update}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Finish By</label>
          <input
            type="date"
            name="finishBy"
            className="form-control"
            value={formData.finishBy}
            onChange={handleChange}
            required
          />
        </div>
        <label>Upload Screenshot:</label>
<input
  type="file"
  accept="image/*"
  onChange={(e) => setImage(e.target.files[0])}
/>


        <button type="submit" className="btn btn-primary">Submit Update</button>
        {message && <p className="mt-3 text-success">{message}</p>}
      </form>
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
      navigate('/login')
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
              {sidebarOpen && <h4 className="mb-0 fw-bold">Business</h4>}
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
  <header
    className="header-banner text-white p-4 shadow"
    style={{
      background: 'linear-gradient(135deg, #3a0ca3, #4361ee)', // Same purple-blue gradient
      borderBottom: '4px solid rgb(255, 193, 7)', // Matching accent
    }}
  >
    <div className="container">
      <div className="row align-items-center">
        {/* Left Side: Greeting and Intro */}
        <div className="col-md-7 text-center text-md-start mb-4 mb-md-0">
          <h4 className="fw-semibold">
            👋 {greeting}, <span style={{ color: 'rgb(255, 193, 7)' }}>{name}</span>!
          </h4>
          <h1 className="display-5 fw-bold mt-2">Welcome back to the Business Development Dashboard</h1>
          <p className="lead text-white-50 mt-3">
            Track opportunities,manage client relationships, and drive growth.
          </p>
        </div>

        {/* Right Side: Illustration */}
        <div className="col-md-5 text-center">
          <img
            src="https://cdn.dribbble.com/userupload/23691475/file/original-9d72eaaf0be2992f8c5d86cbcdac4a96.gif"
            alt="Employee Illustration"
            className="img-fluid rounded shadow"
            style={{ maxHeight: '250px' }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mt-4 text-center">
        {[
          { label: 'Active Opportunities', value: 5 },
          { label: 'Qualified Leads', value: 2 },
          { label: 'Proposals Sent', value: 4 },
          { label: 'Pipeline Value', value: 2 },
        ].map((item, index) => (
          <div className={`col-6 col-md-3 ${index >= 2 ? 'mt-3 mt-md-0' : ''}`} key={index}>
            <div
              className="p-3 rounded"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <h5 className="mb-0" style={{ color: 'rgb(255, 193, 7)' }}>{item.value}</h5>
              <small>{item.label}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  </header>

  {/* Main Content */}
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

export default BusinessDevelopmentDashboard;