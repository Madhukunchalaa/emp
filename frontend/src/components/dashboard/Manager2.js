import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  FileText,
  Palette,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import { useNavigate, Link } from "react-router-dom";

import axios from "axios";
import jwtDecode from "jwt-decode";
import { managerService } from "../../services/api";
import { useParams } from "react-router-dom";
import Chat from '../common/Chat';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState("employees");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employees,setEmployees]=useState()
  const [projects,setProjects]=useState()
  const [designs,setDesigns]=useState()
  const [user,setUser]=useState()
  const [updates,setUpdates]=useState()
  const [manager,setManager]=useState()
  const [email,setEmail]=useState()
  const [selectedEmployeeId,setSelectedEmployeeId]=useState()
  const [attendanceHistory,setAttendanceHistory]=useState()
  const[projectTitle,setProjectTitle]=useState()
  const[projectDescription,setProjectDescription]=useState()
  const[projectDeadline,setProjectDeadline]=useState()
  const [employeeToAssign,setEmployeeToAssign]=useState()
  const [taskMessage,setTaskMessage]=useState()
  const [projectId,setProjectId]=useState()
  const [calendarDate, setCalendarDate] = useState(null);
  const [datesWithUpdates, setDatesWithUpdates] = useState([]);
  const [updatesForDate, setUpdatesForDate] = useState([]);
  const [chatEmployee, setChatEmployee] = useState(null);

const { employeeId } = useParams();

const hour = new Date().getHours();

const greeting =
  hour < 12 ? "Good Morning" :
  hour < 18 ? "Good Afternoon" :
  "Good Evening";



useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    const decoded = jwtDecode(token);
    setUser(decoded);
  }
}, []);

  //attendence Histaory of employees











 // employee attendance details
 useEffect(() => {
  const fetchDailyUpdates = async () => {
    try {
      const response = await managerService.getEmployeeDailyUpdates();
      setUpdates(response.data.updates); // Make sure to access the actual array
      // Extract unique dates (YYYY-MM-DD)
      const uniqueDates = [...new Set(response.data.updates.map(update => new Date(update.date).toISOString().split('T')[0]))];
      setDatesWithUpdates(uniqueDates);
      // Optionally, set the calendar to the most recent date with updates
      if (uniqueDates.length > 0) setCalendarDate(uniqueDates[0]);
      console.log('Fetched updates:', response.data.updates);
    } catch (error) {
      console.error(
        "Error fetching daily updates:",
        error?.response?.data?.message || error.message || error
      );
    }
  };

  fetchDailyUpdates();
}, []);

// When calendarDate or updates change, filter updates for that date
useEffect(() => {
  if (!calendarDate || !updates) {
    setUpdatesForDate([]);
    return;
  }
  const selected = new Date(calendarDate).toISOString().split('T')[0];
  const filtered = updates.filter(update => new Date(update.date).toISOString().split('T')[0] === selected);
  setUpdatesForDate(filtered);
}, [calendarDate, updates]);




// this function is to get the details of manager profile
  useEffect(() => {
    const manager = async () => {
      try {
        const response = await managerService.getProfile();
        setManager(response.data.name);
        setEmail(response.data.email);
      
       
       
      } catch {}
    };
    manager();
  }, []);

  //getting all employee details to manager
  useEffect(() => {
    const emp = async () => {
      try {
        const response = await managerService.getEmployees();
        setEmployees(response.data);
        console.log(response.data.status)
      } catch (error) {
        console.log("Error fetching employees:", error);
      }
    };

    emp();
  }, []);

  // Add real-time updates for employee status
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await managerService.getEmployees();
        setEmployees(response.data);
      } catch (error) {
        console.log("Error fetching employees:", error);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);


  // getting projects
  useEffect(() => {
    const project = async () => {
      try {
        const response = await managerService.getProjects();
        setProjects(response.data);
          setProjectId(response.data[0]._id)
          console.log('project id',response.data[0]._id)
     
      } catch (error) {
        console.log("Error fetching projects:", error);
      }
    };

    project();
  }, []);

  //employee attendence details
    const handleEmployeeChange = async (e) => {
    const employeeId = e.target.value;
    setSelectedEmployeeId(employeeId);
    try {
      const res = managerService.getAttendanceHistory();
      setAttendanceHistory(res.data);
    } catch {
      console.log("failed to fetch the employee attendence history");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    try {
      const res = await managerService.getAttendanceHistory(selectedEmployeeId);
      setAttendanceHistory(res.data); // assuming array
      
    } catch (err) {
      console.log("Error fetching attendance:");
    } 
  };


  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const sidebarItems = [
    { id: "employees", label: "Employee List", icon: Users },
    { id: "projects", label: "Projects", icon: FileText },
     { id: "Task", label: "Assign task", icon: FileText },
    { id: "hours", label: "Working Hours", icon: Clock },
    { id: "updates", label: "Daily Updates", icon: FileText },
    { id: "designs", label: "Designs", icon: Palette },
  ];

//getting  status of employee
const [selectedUpdate, setSelectedUpdate] = useState(null);
const [showModal, setShowModal] = useState(false);
const [feedback, setFeedback] = useState('');
const [actionType, setActionType] = useState(''); // 'approve' or 'reject'

// Function to handle opening the modal
const handleViewUpdate = (update) => {
  setSelectedUpdate(update);
  setShowModal(true);
  setFeedback('');
  setActionType('');
};

// Function to handle closing the modal
const handleCloseModal = () => {
  setShowModal(false);
  setSelectedUpdate(null);
  setFeedback('');
  setActionType('');
};

// Function to handle approve/reject actions
const handleAction = async (action) => {
  if (!feedback.trim()) {
    alert('Please provide feedback before proceeding.');
    return;
  }

  try {
    const response = await managerService.approveRejectUpdate(selectedUpdate._id, action, feedback.trim());
    
    if (response.data) {
      alert(`Update ${action}d successfully!`);
      handleCloseModal();
      
      // Refresh the updates list
      const refreshResponse = await managerService.getEmployeeDailyUpdates();
      setUpdates(refreshResponse.data.updates);
    } else {
      alert(`Failed to ${action} update. Please try again.`);
    }
  } catch (error) {
    console.error(`Error ${action}ing update:`, error);
    alert(`Error ${action}ing update: ${error.response?.data?.message || error.message}`);
  }
};

// Helper function to get status badge color
const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-success';
    case 'in progress':
    case 'in-progress':
      return 'bg-warning';
    case 'pending':
      return 'bg-secondary';
    case 'blocked':
      return 'bg-danger';
    default:
      return 'bg-primary';
  }
};

// Helper function to get approval status badge style
const getApprovalStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-success';
    case 'rejected':
      return 'bg-danger';
    case 'pending':
      return 'bg-secondary';
    default:
      return 'bg-primary';
  }
};

//update projects
const handleStatusUpdate = async (projectId, status) => {
  try {
    const res = await managerService.updateProjectStatus({ projectId, status });
    console.log(`✅ ${status} success:`, res.data);
    alert(`${status}  successfully`);
  } catch (err) {
    console.error(`❌ ${status} failed:`, err);
    const msg =
      err?.response?.data?.message || err?.message || 'Unknown error';
    alert(`${status} failed: ${msg}`);
  }
};
//assign task to the employee

const handleTaskSubmit = async (e) => {
  e.preventDefault();

  const payload = {
    title: projectTitle,
    description: projectDescription,
    deadline: projectDeadline,
    assignedTo: employeeToAssign,
  };

  try {
    const res = await managerService.assignProject(payload);
    console.log('Project assigned:', res.data);
    const assignedUser = employees.find(emp => emp._id === employeeToAssign);
  setTaskMessage(`Task assigned successfully to ${assignedUser?.name || 'Employee'}`);

    // ✅ Clear form fields
    setProjectTitle('');
    setProjectDescription('');
    setProjectDeadline('');
    setEmployeeToAssign('');

    // Optional: show success message or toast here
  } catch (error) {
    console.error('Project assignment failed:', error.response?.data?.message || error.message);
    // Optional: show error message or toast here
  }
};

// Helper to get the correct image URL
const getImageUrl = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `http://localhost:5000${url}`;
};

  //random colors for employee profile cards
  const renderContent = () => {
    switch (activeSection) {
      case "employees":
        const getRandomColorClass = () => {
          const colors = [
            "primary",
            "secondary",
            "success",
            "danger",
            "warning",
            "info",
            "dark",
          ];
          const random = Math.floor(Math.random() * colors.length);
          return `bg-${colors[random]}`;
        };
        const getRandomShadow = () => {
          const shadows = ["shadow-sm", "shadow", "shadow-lg"];
          return shadows[Math.floor(Math.random() * shadows.length)];
        };

        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Employee List</h3>
            
            {/* Employee Status Summary */}
            {Array.isArray(employees) && (
              <div className="row mb-4">
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 bg-success bg-opacity-10 rounded-4">
                    <div className="card-body text-center">
                      <h4 className="text-success mb-1">
                        {employees.filter(emp => emp.status === 'Online').length}
                      </h4>
                      <p className="text-muted mb-0 small">🟢 Online</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 bg-danger bg-opacity-10 rounded-4">
                    <div className="card-body text-center">
                      <h4 className="text-danger mb-1">
                        {employees.filter(emp => emp.status === 'Offline').length}
                      </h4>
                      <p className="text-muted mb-0 small">🔴 Offline</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 bg-secondary bg-opacity-10 rounded-4">
                    <div className="card-body text-center">
                      <h4 className="text-secondary mb-1">
                        {employees.filter(emp => emp.status !== 'Online' && emp.status !== 'Offline').length}
                      </h4>
                      <p className="text-muted mb-0 small">⚪ Other</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 bg-primary bg-opacity-10 rounded-4">
                    <div className="card-body text-center">
                      <h4 className="text-primary mb-1">
                        {employees.length}
                      </h4>
                      <p className="text-muted mb-0 small">👥 Total</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 bg-info bg-opacity-10 rounded-4">
                    <div className="card-body text-center">
                      <h4 className="text-info mb-1">
                        {employees.filter(emp => emp.todayWorkingOn && emp.todayWorkingOn.trim() !== '').length}
                      </h4>
                      <p className="text-muted mb-0 small">📝 Updated Work</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="row g-4">
              {Array.isArray(employees) &&
                employees.map((emp) => {
                  const randomBadgeClass = getRandomColorClass();
                  const randomShadowClass = getRandomShadow();
                  return (
                    <div key={emp._id} className="col-md-6 col-lg-4">
                      <div
                        className={`card border-0 rounded-4 ${randomShadowClass}`}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="position-relative">
                                <div
                                  className="avatar text-white rounded-circle d-flex align-items-center justify-content-center"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    fontSize: "20px",
                                    backgroundColor: `#${Math.floor(
                                      Math.random() * 16777215
                                    ).toString(16)}`,
                                  }}
                                >
                                  {emp.name?.charAt(0).toUpperCase()}
                                </div>
                                {/* Status indicator dot */}
                                <div
                                  className="position-absolute"
                                  style={{
                                    bottom: "2px",
                                    right: "2px",
                                    width: "12px",
                                    height: "12px",
                                    borderRadius: "50%",
                                    backgroundColor: emp.status === 'Online' ? '#28a745' : emp.status === 'Offline' ? '#dc3545' : '#6c757d',
                                    border: "2px solid white",
                                    boxShadow: "0 0 0 2px #fff"
                                  }}
                                ></div>
                              </div>
                              <div>
                                <h5 className="card-title mb-1 text-dark fw-bold">
                                  {emp.name}
                                </h5>
                                <p className="text-muted mb-0 small">
                                  {emp.role}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`badge rounded-pill px-3 py-2 text-white ${
                                emp.status === 'Online' 
                                  ? 'bg-success' 
                                  : emp.status === 'Offline' 
                                  ? 'bg-danger' 
                                  : randomBadgeClass
                              }`}
                            >
                              {emp.status === 'Online' ? '🟢 Online' : emp.status === 'Offline' ? '🔴 Offline' : emp.status}
                            </span>
                          </div>
                          <div className="mt-2">
                            <p className="mb-1">
                              <strong>Email:</strong> {emp.email}
                               {/* <h5> Today's Update:<p>{emp.latestUpdateTitle || 'No updates yet'} </p> </h5> */}
                            </p>
                            {emp.todayWorkingOn && (
                              <div className="mt-2 p-2 bg-light rounded">
                                <small className="text-muted d-block mb-1">
                                  <strong>Today's Work:</strong>
                                </small>
                                <p className="mb-0 text-dark small">
                                  {emp.todayWorkingOn}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="d-flex justify-content-end mt-2">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setChatEmployee(emp)}
                            >
                              Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            {chatEmployee && user && (
              <div className="mt-4">
                <h5>Chat with {chatEmployee.name}</h5>
                <Chat currentUser={user} otherUser={chatEmployee} />
                <button className="btn btn-link mt-2" onClick={() => setChatEmployee(null)}>Close Chat</button>
              </div>
            )}
          </div>
        );



      case "projects":
        const getStatusButton = (status) => {
          switch (status.toLowerCase()) {
            case "active":
              return (
                <button className="btn btn-success btn-sm rounded-pill px-3">
                  Active
                </button>
              );
            case "in progress":
              return (
                <button className="btn btn-warning btn-sm rounded-pill px-3 text-dark">
                  In Progress
                </button>
              );
            case "completed":
              return (
                <button className="btn btn-primary btn-sm rounded-pill px-3">
                  Completed
                </button>
              );
            default:
              return (
                <button className="btn btn-secondary btn-sm rounded-pill px-3">
                  Unknown
                </button>
              );
          }
        };

        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Projects</h3>
            <div className="row g-4">
              {Array.isArray(projects) &&
                projects.map((project) => (
                  <div key={project.id} className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-lg rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex flex-column justify-content-between align-items-start mb-2">
                          <div>
                            <h5 className="card-title fw-bold text-dark">
                              {project.title}
                            </h5>
                          </div>
                          <small className="text-muted">
                            Due: {project.deadline}
                          </small>
                          <p className="text-muted small mb-2">
                            {project.description}
                          </p>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-dark">Progress</small>
                            <small className="text-dark">
                              {project.status}%
                            </small>
                          </div>
                          <div className="progress" style={{ height: "8px" }}>
                            <div
                              className={`progress-bar ${
                                project.status >= 100 ? "bg-success" : "bg-info"
                              }`}
                              role="progressbar"
                              style={{ width: `${project.status}%` }}
                              aria-valuenow={project.status}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                        </div>

                        <div className="text-end">
                          {getStatusButton(project.phase || "in progress")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
        

     case "Task":
      return(
       <div className="container mt-5">
  <div className="row justify-content-center">
    <div className="col-md-10 col-lg-8">
      <div className="card border-0 shadow rounded-4">
        <div className="card-header bg-gradient bg-primary text-white py-3 rounded-top-4">
          <h3 className="mb-0 text-center">📋 Assign New Project</h3>
        </div>
        <div className="card-body px-4 py-4">
          <form onSubmit={handleTaskSubmit}>
            <div className="mb-4">
              <label htmlFor="projectTitle" className="form-label fw-semibold">
                Project Title
              </label>
              <input
                type="text"
                className="form-control rounded-pill px-3"
                id="projectTitle"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Enter project title"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="projectDescription" className="form-label fw-semibold">
                Project Description
              </label>
              <textarea
                className="form-control rounded-3 px-3"
                id="projectDescription"
                rows="4"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Enter project details"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="projectDeadline" className="form-label fw-semibold">
                Deadline
              </label>
              <input
                type="date"
                className="form-control rounded-pill px-3"
                id="projectDeadline"
                value={projectDeadline}
                onChange={(e) => setProjectDeadline(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="employeeSelect" className="form-label fw-semibold">
                Assign To
              </label>
              <select
                className="form-select rounded-pill px-3"
                id="employeeSelect"
                value={employeeToAssign}
                onChange={(e) => setEmployeeToAssign(e.target.value)}
                required
              >
                <option value="">-- Select Employee --</option>
                {employees.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-success rounded-pill py-2 fs-5">
                🚀 Assign Project
              </button>
            </div>

            {taskMessage && (
              <div className="alert alert-success mt-4 mb-0 rounded-3 text-center">
                ✅ {taskMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  </div>
</div>


      )

     case "hours":
        return (
          <div className="container mt-4">
            <h3>Manager Attendance Dashboard</h3>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="employeeSelect" className="form-label">
                  Select Employee:
                </label>
                <select
                  id="employeeSelect"
                  className="form-select"
                  value={selectedEmployeeId}
                  onChange={handleEmployeeChange}
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary">
                Submit
              </button>
            </form>

            {/* {loading && <p className="mt-3">Loading attendance...</p>} */}

            {Array.isArray(attendanceHistory) &&
              attendanceHistory.length > 0 && (
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Punch In</th>
                      <th>Punch Out</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((entry, idx) => (
                      <tr key={idx}>
                        <td>{new Date(entry.date).toLocaleDateString()}</td>
                        <td>
                          {entry.punchIn
                            ? new Date(entry.punchIn).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>

                        <td>
                          {entry.punchOut
                            ? new Date(entry.punchOut).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            {Array.isArray(attendanceHistory) &&
              attendanceHistory.length === 0 &&
              selectedEmployeeId && (
                <p className="mt-3">No attendance records found.</p>
              )}
          </div>
        );







     case "updates":
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Daily Updates</h3>
            <div className="mb-4">
              <Calendar
                onChange={setCalendarDate}
                value={calendarDate}
                tileClassName={({ date, view }) => {
                  if (view === 'month') {
                    const dateStr = date.toISOString().split('T')[0];
                    if (datesWithUpdates.includes(dateStr)) {
                      return 'bg-primary text-white rounded-circle fw-bold';
                    }
                  }
                  return null;
                }}
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const dateStr = date.toISOString().split('T')[0];
                    if (datesWithUpdates.includes(dateStr)) {
                      return <span className="dot" style={{ display: 'inline-block', width: 6, height: 6, background: '#1976d2', borderRadius: '50%', marginLeft: 2 }}></span>;
                    }
                  }
                  return null;
                }}
              />
            </div>
            <div>
              {calendarDate && updatesForDate.length === 0 && (
                <div className="alert alert-info">No updates for this date.</div>
              )}
              {updatesForDate.map(update => (
                <div key={update._id} className="card mb-3 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{update.employee?.name || 'Employee'}</h5>
                    <p className="card-text">{update.update}</p>
                    <p className="mb-1"><strong>Status:</strong> {update.status}</p>
                    <p className="mb-1"><strong>Approval:</strong> {update.approvalStatus}</p>
                    {update.imageUrl && (
                      <div className="mb-2">
                        <img src={update.imageUrl} alt="Update attachment" style={{ maxWidth: 200, borderRadius: 8 }} />
                      </div>
                    )}
                    <small className="text-muted">{new Date(update.date).toLocaleString()}</small>
                    <div className="mt-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => handleViewUpdate(update)}
                      >
                        Review / Approve / Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "designs":
        return (
          <div>
            <h3 className="mb-4 fw-semibold text-dark">Design Assets</h3>
            <div className="row g-3">
              {Array.isArray(designs) &&
                designs.map((design) => (
                  <div key={design.id} className="col-12">
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="card-title">{design.title}</h6>
                            <p className="text-muted mb-1">
                              by {design.description}
                            </p>
                            <img src={design.fileURL} alt="Design Preview" />
                            <div>
                              <small className="text-muted">
                                {design.submittedDate}
                              </small>
                            </div>
                          </div>
                          <span
                            className={`badge rounded-pill ${
                              design.status === "Approved"
                                ? "bg-success"
                                : design.status === "In Review"
                                ? "bg-warning"
                                : "bg-info"
                            }`}
                          >
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
        return (
          <div className="text-center text-muted">
            Select a section from the sidebar
          </div>
        );
    }
  };

  if (!isLoggedIn) {
    return navigate("/login");
  }

  return (
    <>
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
        
        /* Calendar Styles */
        .react-calendar {
          background: #fff !important;
          border-radius: 16px !important;
          box-shadow: 0 2px 16px rgba(44,62,80,0.08) !important;
          border: none !important;
          padding: 16px !important;
          font-family: inherit !important;
          margin-bottom: 24px !important;
          width: 100% !important;
        }
        .react-calendar__tile {
          border-radius: 8px !important;
          transition: background 0.2s, color 0.2s !important;
          font-weight: 500 !important;
          font-size: 1rem !important;
          padding: 0.5em 0.2em !important;
        }
        .react-calendar__tile--active,
        .react-calendar__tile--now {
          background: #1976d2 !important;
          color: #fff !important;
          border-radius: 8px !important;
        }
        .react-calendar__tile--hasActive {
          background: #e3f2fd !important;
          color: #1976d2 !important;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: #e3f2fd !important;
          color: #1976d2 !important;
        }
        .react-calendar__month-view__days__day--weekend {
          color: #d32f2f !important;
        }
        .react-calendar__navigation {
          margin-bottom: 8px !important;
        }
        .react-calendar__navigation button {
          color: #1976d2 !important;
          font-weight: bold !important;
          min-width: 36px !important;
          background: none !important;
          border-radius: 6px !important;
          border: none !important;
          transition: background 0.2s !important;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background: #e3f2fd !important;
        }
        .dot {
          display: inline-block !important;
          width: 6px !important;
          height: 6px !important;
          background: #1976d2 !important;
          border-radius: 50% !important;
          margin-left: 2px !important;
          margin-top: 2px !important;
        }
      `}</style>
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="d-flex min-vh-100 bg-light">
        {/* Sidebar */}
        <div
          className={`bg-white shadow sidebar ${
            sidebarOpen ? "" : "collapsed"
          }`}
          style={{ width: sidebarOpen ? "260px" : "80px" }}
        >
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
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`sidebar-item btn d-flex align-items-center text-start p-2 rounded ${
                      activeSection === item.id ? "active" : ""
                    }`}
                  >
                    <Icon size={20} className="me-3" />
                    {sidebarOpen && (
                      <span className="fw-medium">{item.label}</span>
                    )}
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
              background: "linear-gradient(135deg, #3a0ca3, #4361ee)", // purple to blue gradient
              borderBottom: "4px solid rgb(255, 193, 7)", // light teal
            }}
          >
            <div className="container">
              <div className="row align-items-center">
                {/* Left Side: Greeting and Intro */}
                <div className="col-md-7 text-center text-md-start mb-4 mb-md-0">
                  <h4 className="fw-semibold">
                    👋{greeting},{" "}
                    <span style={{ color: "rgb(255, 193, 7)" }}>Manager</span>!
                  </h4>
                  <h1 className="display-5 fw-bold mt-2">
                    Welcome back to the Manager Dashboard
                  </h1>
                  <p className="lead text-white-50 mt-3">
                    Track your team's progress, assign tasks, and ensure
                    productivity.
                  </p>
                </div>

                {/* Right Side: Illustration */}
                <div className="col-md-5 text-center">
                  <img
                    src="https://cdn.dribbble.com/userupload/23691475/file/original-9d72eaaf0be2992f8c5d86cbcdac4a96.gif"
                    alt="Dashboard Illustration"
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: "250px" }}
                  />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="row mt-4 text-center">
                {[
                  { label: "Active Projects", value: 5 },
                  { label: "Team Members", value: 12 },
                  { label: "Pending Tasks", value: 3 },
                  { label: "Reports Reviewed", value: 7 },
                ].map((item, index) => (
                  <div
                    className={`col-6 col-md-3 ${
                      index >= 2 ? "mt-3 mt-md-0" : ""
                    }`}
                    key={index}
                  >
                    <div
                      className="p-3 rounded"
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        color: "#ffffff",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                    >
                      <h5
                        className="mb-0"
                        style={{ color: "rgb(255, 193, 7)" }}
                      >
                        {item.value}
                      </h5>
                      <small>{item.label}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-fill p-4 main-content">{renderContent()}</main>
        </div>

        {/* Right Sidebar - Profile */}
        <div className="bg-white shadow" style={{ width: "320px" }}>
          <div className="p-4">
            <div className="text-center">
              <div className="profile-avatar rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                <User size={32} className="text-white" />
              </div>

              <div className="mb-4">
                <h5 className="fw-semibold mb-1">{manager}</h5>
                <p className="text-muted mb-1">{email}</p>
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
                    <h6 className="card-title text-secondary">
                      Recent Activity
                    </h6>
                    <div className="text-start">
                      <p className="small text-muted mb-1">
                        • Project update received
                      </p>
                      <p className="small text-muted mb-1">
                        • New design approved
                      </p>
                      <p className="small text-muted mb-0">
                        • Team meeting scheduled
                      </p>
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

      {/* Review Modal */}
      {showModal && selectedUpdate && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-eye me-2 text-primary"></i>
                  Review Daily Update
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <h6 className="fw-semibold text-dark mb-2">Employee:</h6>
                      <p className="text-muted mb-0">{selectedUpdate.employee?.name || 'Unknown Employee'}</p>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="fw-semibold text-dark mb-2">Update Details:</h6>
                      <p className="text-muted mb-0">{selectedUpdate.update}</p>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="fw-semibold text-dark mb-2">Project:</h6>
                      <p className="text-muted mb-0">{selectedUpdate.project_title || 'General Update'}</p>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="fw-semibold text-dark mb-2">Status:</h6>
                      <span className={`badge ${getStatusBadgeColor(selectedUpdate.status)}`}>
                        {selectedUpdate.status}
                      </span>
                    </div>
                    
                    {selectedUpdate.finishBy && (
                      <div className="mb-3">
                        <h6 className="fw-semibold text-dark mb-2">Finish By:</h6>
                        <p className="text-muted mb-0">{new Date(selectedUpdate.finishBy).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-md-4">
                    <div className="bg-light rounded p-3">
                      <h6 className="fw-semibold text-dark mb-2">Current Approval Status</h6>
                      <div className="mb-2">
                        <span className={`badge ${getApprovalStatusBadgeStyle(selectedUpdate.approvalStatus)} w-100`}>
                          {selectedUpdate.approvalStatus || 'Pending'}
                        </span>
                      </div>
                      
                      {selectedUpdate.approvedBy && (
                        <div className="mb-2">
                          <small className="text-muted d-block">Approved by:</small>
                          <small className="fw-medium text-dark">{selectedUpdate.approvedBy.name}</small>
                        </div>
                      )}
                      
                      {selectedUpdate.approvedAt && (
                        <div className="mb-2">
                          <small className="text-muted d-block">Approved on:</small>
                          <small className="fw-medium text-dark">{new Date(selectedUpdate.approvedAt).toLocaleDateString()}</small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedUpdate.imageUrl && (
                  <div className="mt-3">
                    <h6 className="fw-semibold text-dark mb-2">Attached Image:</h6>
                    <img 
                      src={selectedUpdate.imageUrl} 
                      alt="Update attachment" 
                      className="img-fluid rounded"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="form-label fw-semibold text-primary">
                    <i className="bi bi-chat-left-text me-2"></i>Your Feedback *
                  </label>
                  <textarea
                    className="form-control border-2"
                    rows="4"
                    placeholder="Provide your feedback for this update..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer border-0 bg-light">
                <button 
                  type="button" 
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={handleCloseModal}
                >
                  <i className="bi bi-x-circle me-2"></i>Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger rounded-pill px-4 me-2"
                  onClick={() => handleAction('reject')}
                  disabled={!feedback.trim()}
                >
                  <i className="bi bi-x-octagon me-2"></i>Reject
                </button>
                <button 
                  type="button" 
                  className="btn btn-success rounded-pill px-4"
                  onClick={() => handleAction('approve')}
                  disabled={!feedback.trim()}
                >
                  <i className="bi bi-check-circle me-2"></i>Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {showModal && (
        <div className="modal-backdrop fade show"></div>
      )}

    </>
  );
};

export default ManagerDashboard;
