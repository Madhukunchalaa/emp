import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, FolderOpen, FileText, CheckCircle, Play, Timer, User, LogOut, Menu, X, CalendarCheck } from 'lucide-react';
import { punchIn } from '../../store/slices/employeeSlice';
import { useDispatch } from 'react-redux';
import {useNavigate, Link } from 'react-router-dom';
import { employeeService } from '../../services/api';
import UpdateForm from './UpdateForm';


const EmployeeDashboard = () => {
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
  const [attendanceData, setAttendanceData] = useState(null);
  const [message,setMessage]=useState()
  const [projects, setProjects] = useState([]);
  const [taskMessage,setTaskMessage]=useState()
  const [todayWorkingOn, setTodayWorkingOn] = useState('');
  const [todayWorkingOnMessage, setTodayWorkingOnMessage] = useState('');
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [dailyUpdatesLoading, setDailyUpdatesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Edit functionality states
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    project: '',
    status: '',
    update: '',
    finishBy: '',
    project_title: ''
  });
  const [editImage, setEditImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const [formData,setFormData]=useState({
    project:'',
    status:'',
    update:'',
    finishBy:'',
    project_title:''
  })
  const [image, setImage] = useState(null);



const myProjects=projects
const finishedProjects=[]

// Helper function to get status badge styling
const getStatusBadgeStyle = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'in progress':
      return 'bg-primary';
    case 'completed':
      return 'bg-success';
    case 'not started':
      return 'bg-secondary';
    case 'on hold':
      return 'bg-warning text-dark';
    case 'cancelled':
      return 'bg-danger';
    default:
      return 'bg-info';
  }
};

// Helper function to get approval status badge styling
const getApprovalStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-success';
    case 'Rejected':
      return 'bg-danger';
    case 'Pending':
      return 'bg-warning text-dark';
    default:
      return 'bg-secondary';
  }
};

// Helper function to format date
const formatDat = (dateString) => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to calculate days until deadline
const getDaysUntilDeadline = (deadline) => {
  if (!deadline) return null;
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to get deadline indicator
const getDeadlineIndicator = (deadline) => {
  const days = getDaysUntilDeadline(deadline);
  if (days === null) return { text: 'No deadline', class: 'text-muted' };
  if (days < 0) return { text: `${Math.abs(days)} days overdue`, class: 'text-danger fw-bold' };
  if (days === 0) return { text: 'Due today', class: 'text-warning fw-bold' };
  if (days <= 3) return { text: `${days} days left`, class: 'text-warning' };
  if (days <= 7) return { text: `${days} days left`, class: 'text-info' };
  return { text: `${days} days left`, class: 'text-success' };
};







  

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
      console.error('Failed to fetch employee profile details', err);
    }
  };
  fetchProfile();
}, []);


const dailyUpdate=async()=>{
  try{
     


    const response=await employeeService.addDailyUpdate()
    console.log(response.data)

  }
  catch{
    console.log('failed to fetch daily updates data')

  }

}
useEffect(()=>{
  dailyUpdate()
},[])


useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await employeeService.getAttendance();
        setAttendanceData(res.data);
        // console.log(res.data)
      } catch (err) {
        // console.error('Failed to fetch attendance:', err);
      }
    };
    fetchData();
  }, []);







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
const handlepunchOut = async () => {
  try {
    const response = await employeeService.punchOut();
    if (response.data) {
      setIsWorking(false);
      // Update attendance data
      const attendanceRes = await employeeService.getAttendance();
      setAttendanceData(attendanceRes.data);
      alert('Punched out successfully');
    }
  } catch (err) {
    console.error('Punch out failed:', err);
    alert(err.response?.data?.message || 'Failed to punch out. Please try again.');
  }
};



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
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "project_title") {
    const selectedProject = projects.find((p) => p.title === value);
    setFormData((prev) => ({
      ...prev,
      project_title: value,
      project: selectedProject?._id || "", // Store _id secretly for backend
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formPayload = new FormData();

    formPayload.append('project', formData.project);          // hidden _id
    formPayload.append('project_title', formData.project_title); // user sees this
    formPayload.append('status', formData.status);
    formPayload.append('update', formData.update);
    formPayload.append('finishBy', formData.finishBy);

    await employeeService.addDailyUpdate(); 
    setMessage(`Today's update submitted successfully`);


      formPayload.append('image', image);
    

    await employeeService.addDailyUpdate(formPayload);

    setMessage("Today's update submitted successfully");


    setFormData({
      project: '',
      project_title: '',
      status: '',
      update: '',
      finishBy: ''
    });
    setImage(null);

    // Clear success message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
    
  } catch (err) {
    console.error('Form not submitted:', err);
    setMessage("Something went wrong. Please try again.");
    
    // Clear error message after 3 seconds too (optional)
    setTimeout(() => setMessage(null), 3000);
  }
};




useEffect(() => {
  const getProject = async () => {
    try {
      const res = await employeeService.getProjects();
      setProjects(res.data); // res.data should be an array of project objects
     
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };
  getProject();
}, []);

// Fetch daily updates when component mounts
useEffect(() => {
  fetchDailyUpdates();
}, []);
























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
                        onClick={handlepunchOut}
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

            {/* Today's Working On Section */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card shadow-sm">
                  <div className="card-header bg-primary bg-opacity-10">
                    <h5 className="mb-0 text-primary">
                      <i className="bi bi-pencil-square me-2"></i>
                      Today's Working On
                    </h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleTodayWorkingOnSubmit}>
                      <div className="row">
                        <div className="col-md-8">
                          <div className="form-group">
                            <label htmlFor="todayWorkingOn" className="form-label fw-semibold">
                              What are you working on today?
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="todayWorkingOn"
                              value={todayWorkingOn}
                              onChange={(e) => setTodayWorkingOn(e.target.value)}
                              placeholder="e.g., Working on user authentication feature, Bug fixes for dashboard, etc."
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                          <button type="submit" className="btn btn-primary w-100">
                            <i className="bi bi-check-circle me-2"></i>
                            Update
                          </button>
                        </div>
                      </div>
                      {todayWorkingOnMessage && (
                        <div className={`alert ${todayWorkingOnMessage.includes('successfully') ? 'alert-success' : 'alert-danger'} mt-3`}>
                          {todayWorkingOnMessage}
                        </div>
                      )}
                    </form>
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
            {attendanceData?.history?.length > 0 ? (
              attendanceData.history.map((record, index) => (
                <tr key={index}>
                  <td className="fw-medium">{formatDate(record.date)}</td>
                  <td className="text-muted">{formatTime(record.punchIn)}</td>
                  <td className="text-muted">{formatTime(record.punchOut)}</td>
                  <td className="text-muted">{record.hours ?? 0}h</td>
                  <td>
                    <span
                      className={`badge ${
                        record.status === 'Present' || record.status === 'Late'
                          ? 'bg-success'
                          : 'bg-warning'
                      }`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
          </div>
        );
      
      case 'myprojects':
        return (
          <div className="container-fluid">
  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h3 className="fw-bold text-dark mb-0">
        <i className="bi bi-kanban me-2 text-primary"></i>
        My Projects
      </h3>
      <p className="text-muted mb-0">Manage and track your assigned projects</p>
    </div>
    <div className="d-flex align-items-center">
      <span className="badge bg-primary bg-opacity-10 text-primary fs-6 me-2">
        <i className="bi bi-collection me-1"></i>
        {myProjects?.length || 0} Projects
      </span>
    </div>
  </div>

  <div className="row g-4">
    {myProjects && myProjects.length > 0 ? (
      myProjects.map((project, index) => {
        const deadlineInfo = getDeadlineIndicator(project.deadline);
        const cardColors = [
          'border-start border-primary border-4',
          'border-start border-success border-4',
          'border-start border-info border-4',
          'border-start border-warning border-4',
          'border-start border-danger border-4'
        ];
        const cardClass = cardColors[index % cardColors.length];

        return (
          <div key={project._id} className="col-lg-6 col-xl-4">
            <div className={`card h-100 shadow-sm border-0 ${cardClass} hover-shadow`} 
                 style={{ transition: 'all 0.3s ease' }}>
              <div className="card-header bg-transparent border-0 pb-0">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h5 className="card-title fw-bold text-dark mb-1 line-clamp-2">
                      {project.title}
                    </h5>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <span className={`badge ${getStatusBadgeStyle(project.status)} rounded-pill`}>
                        <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-outline-secondary border-0" 
                            type="button" data-bs-toggle="dropdown">
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu">
                      <li><a className="dropdown-item" href="#"><i className="bi bi-eye me-2"></i>View Details</a></li>
                      <li><a className="dropdown-item" href="#"><i className="bi bi-pencil me-2"></i>Edit</a></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-trash me-2"></i>Delete</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card-body pt-2">
                <p className="text-muted mb-3 line-clamp-3" style={{ fontSize: '0.9rem' }}>
                  {project.description || 'No description provided'}
                </p>

                <div className="row g-2 mb-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center text-muted mb-2">
                      <i className="bi bi-calendar-event me-2 text-primary"></i>
                      <small className="me-2">Deadline:</small>
                      <small className={deadlineInfo.class}>
                        {formatDate(project.deadline)}
                        {deadlineInfo.text !== 'No deadline' && (
                          <span className="ms-1">({deadlineInfo.text})</span>
                        )}
                      </small>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="d-flex align-items-center text-muted mb-2">
                      <i className="bi bi-person-check me-2 text-success"></i>
                      <small className="me-2">Assigned to:</small>
                      <small className="fw-medium text-dark">
                        {project.assignedTo?.name || 'Unassigned'}
                      </small>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center text-muted mb-2">
                      <i className="bi bi-person-plus me-2 text-info"></i>
                      <small className="me-2">Created by:</small>
                      <small className="fw-medium text-dark">
                        {project.createdBy?.name || 'Unknown'}
                      </small>
                    </div>
                  </div>
                </div>

                {project.comment && (
                  <div className="mb-3">
                    <div className="bg-light rounded p-2">
                      <small className="text-muted d-block mb-1">
                        <i className="bi bi-chat-left-quote me-1"></i>
                        Comment:
                      </small>
                      <small className="text-dark">{project.comment}</small>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-footer bg-transparent border-0 pt-0">
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>
                    Created {formatDate(project.createdAt)}
                  </small>
                  <div className="btn-group" role="group">
                    <button type="button" className="btn btn-sm btn-outline-primary rounded-pill me-1">
                      <i className="bi bi-eye me-1"></i>
                      View
                    </button>
                    <button type="button" className="btn btn-sm btn-primary rounded-pill">
                      <i className="bi bi-play-fill me-1"></i>
                      Start
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })
    ) : (
      <div className="col-12">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-kanban display-1 text-muted"></i>
          </div>
          <h4 className="text-muted mb-2">No Projects Found</h4>
          <p className="text-muted mb-4">You don't have any projects assigned yet.</p>
          <button className="btn btn-primary rounded-pill px-4">
            <i className="bi bi-plus-circle me-2"></i>
            Request New Project
          </button>
        </div>
      </div>
    )}
  </div>
</div>
        );


          
  
      
      case 'updates':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-semibold text-dark mb-1">Daily Updates</h3>
                <p className="text-muted mb-0">Track your submitted updates and approval status</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => fetchDailyUpdates()}
                  disabled={dailyUpdatesLoading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  {dailyUpdatesLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => setActiveSection('submit-update')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Submit New Update
                </button>
              </div>
            </div>

            {dailyUpdatesLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading your updates...</p>
              </div>
            ) : dailyUpdates.length > 0 ? (
              <div className="row g-4">
                {dailyUpdates.map((update) => (
                  <div key={update._id} className="col-12">
                    <div className="card shadow-sm border-0">
                      <div className="card-header bg-transparent border-0 pb-0">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="card-title fw-bold text-dark mb-1">
                              {update.project_title || 'General Update'}
                            </h6>
                            <p className="text-muted mb-0 small">
                              <i className="bi bi-calendar-event me-1"></i>
                              {formatDate(update.date)}
                            </p>
                          </div>
                          <div className="d-flex gap-2">
                            <span className={`badge ${getStatusBadgeStyle(update.status)} rounded-pill`}>
                              {update.status}
                            </span>
                            <span className={`badge ${getApprovalStatusBadgeStyle(update.approvalStatus)} rounded-pill`}>
                              {update.approvalStatus || 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-body pt-2">
                        <div className="row">
                          <div className="col-md-8">
                            <div className="mb-3">
                              <h6 className="fw-semibold text-dark mb-2">Update Details:</h6>
                              <p className="text-muted mb-0">{update.update}</p>
                            </div>
                            
                            {update.finishBy && (
                              <div className="mb-3">
                                <h6 className="fw-semibold text-dark mb-2">Finish By:</h6>
                                <p className="text-muted mb-0">{formatDate(update.finishBy)}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="col-md-4">
                            <div className="bg-light rounded p-3">
                              <h6 className="fw-semibold text-dark mb-2">Approval Status</h6>
                              <div className="mb-2">
                                <span className={`badge ${getApprovalStatusBadgeStyle(update.approvalStatus)} w-100`}>
                                  {update.approvalStatus || 'Pending'}
                                </span>
                              </div>
                              
                              {update.approvedBy && (
                                <div className="mb-2">
                                  <small className="text-muted d-block">Approved by:</small>
                                  <small className="fw-medium text-dark">{update.approvedBy.name}</small>
                                </div>
                              )}
                              
                              {update.approvedAt && (
                                <div className="mb-2">
                                  <small className="text-muted d-block">Approved on:</small>
                                  <small className="fw-medium text-dark">{formatDate(update.approvedAt)}</small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {update.managerFeedback && (
                          <div className="mt-3 p-3 bg-light rounded">
                            <h6 className="fw-semibold text-dark mb-2">
                              <i className="bi bi-chat-left-quote me-2 text-primary"></i>
                              Manager Feedback:
                            </h6>
                            <p className="text-muted mb-0">{update.managerFeedback}</p>
                          </div>
                        )}
                        
                        {update.imageUrl && (
                          <div className="mt-3">
                            <h6 className="fw-semibold text-dark mb-2">Attached Image:</h6>
                            <img 
                              src={update.imageUrl} 
                              alt="Update attachment" 
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px' }}
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="card-footer bg-transparent border-0 pt-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            Submitted {formatTime(update.createdAt)}
                          </small>
                          <div className="btn-group" role="group">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditClick(update)}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Edit
                            </button>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => {
                                // Handle view details functionality
                              }}
                            >
                              <i className="bi bi-eye me-1"></i>
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="col-12">
                    <nav aria-label="Daily updates pagination">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => fetchDailyUpdates(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => fetchDailyUpdates(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => fetchDailyUpdates(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-file-text display-1 text-muted"></i>
                </div>
                <h4 className="text-muted mb-2">No Updates Found</h4>
                <p className="text-muted mb-4">You haven't submitted any daily updates yet.</p>
                <button 
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => setActiveSection('submit-update')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Submit Your First Update
                </button>
              </div>
            )}
          </div>
        );
        
      case 'submit-update':
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-semibold text-dark mb-1">Submit Daily Update</h3>
                <p className="text-muted mb-0">Submit your daily work progress and updates</p>
              </div>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setActiveSection('updates')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Updates
              </button>
            </div>
            <UpdateForm onUpdateSubmitted={() => {
              fetchDailyUpdates();
              setActiveSection('updates');
            }} />
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

  const handleTodayWorkingOnSubmit = async (e) => {
    e.preventDefault();
    if (!todayWorkingOn.trim()) {
      setTodayWorkingOnMessage('Please enter what you are working on today');
      return;
    }

    try {
      const response = await employeeService.updateTodayWorkingOn(todayWorkingOn);
      setTodayWorkingOnMessage('Today\'s work updated successfully!');
      setTodayWorkingOn('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setTodayWorkingOnMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update today\'s work:', err);
      setTodayWorkingOnMessage(err.response?.data?.message || 'Failed to update. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => setTodayWorkingOnMessage(''), 3000);
    }
  };

  const fetchDailyUpdates = async (page = 1) => {
    setDailyUpdatesLoading(true);
    try {
      const response = await employeeService.getMyDailyUpdates(page, 10);
      setDailyUpdates(response.data.updates);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch daily updates:', err);
    } finally {
      setDailyUpdatesLoading(false);
    }
  };

  // Edit functionality handlers
  const handleEditClick = (update) => {
    setEditingUpdate(update);
    setEditFormData({
      project: update.project?._id || update.project || '', // Handle both ObjectId and string
      status: update.status || '',
      update: update.update || '',
      finishBy: update.finishBy ? new Date(update.finishBy).toISOString().split('T')[0] : '',
      project_title: update.project_title || update.project?.title || '' // Use project title or project object title
    });
    setEditImage(null);
    setShowEditModal(true);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "project_title") {
      const selectedProject = projects.find((p) => p.title === value);
      setEditFormData(prev => ({
        ...prev,
        project_title: value,
        project: selectedProject?._id || "", // Store _id secretly for backend
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditImageChange = (e) => {
    if (e.target.files[0]) {
      setEditImage(e.target.files[0]);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    
    try {
      const formData = new FormData();
      // Don't send project field if it's not a valid ObjectId
      if (editFormData.project && editFormData.project.trim() !== '') {
        formData.append('project', editFormData.project);
      }
      formData.append('status', editFormData.status);
      formData.append('update', editFormData.update);
      formData.append('finishBy', editFormData.finishBy);
      formData.append('project_title', editFormData.project_title);
      
      if (editImage) {
        formData.append('image', editImage);
      }

      await employeeService.updateDailyUpdate(editingUpdate._id, formData);
      
      // Refresh the updates list
      await fetchDailyUpdates(currentPage);
      
      // Close modal and reset state
      setShowEditModal(false);
      setEditingUpdate(null);
      setEditFormData({
        project: '',
        status: '',
        update: '',
        finishBy: '',
        project_title: ''
      });
      setEditImage(null);
      
      alert('Update edited successfully!');
    } catch (error) {
      console.error('Error editing update:', error);
      alert(error.message || 'Failed to edit update');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingUpdate(null);
    setEditFormData({
      project: '',
      status: '',
      update: '',
      finishBy: '',
      project_title: ''
    });
    setEditImage(null);
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
          <h1 className="display-5 fw-bold mt-2">Welcome back to the Employee Dashboard</h1>
          <p className="lead text-white-50 mt-3">
            View tasks, log updates, and track your daily progress.
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
          { label: 'Today\'s Hours', value: 5 },
          { label: 'Pending Tasks', value: 2 },
          { label: 'Completed Tasks', value: 4 },
          { label: 'Weekly Total', value: 22 },
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

      {/* Edit Update Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2 text-primary"></i>
                  Edit Daily Update
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseEditModal}
                ></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="editProject" className="form-label fw-semibold">
                          Project
                        </label>
                        <select
                          className="form-select"
                          id="editProject"
                          name="project_title"
                          value={editFormData.project_title}
                          onChange={handleEditFormChange}
                        >
                          <option value="">Select a project</option>
                          {projects.map((project) => (
                            <option key={project._id} value={project.title}>
                              {project.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="editStatus" className="form-label fw-semibold">
                          Status
                        </label>
                        <select
                          className="form-select"
                          id="editStatus"
                          name="status"
                          value={editFormData.status}
                          onChange={handleEditFormChange}
                        >
                          <option value="">Select status</option>
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="On Hold">On Hold</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="editUpdate" className="form-label fw-semibold">
                      Update Details
                    </label>
                    <textarea
                      className="form-control"
                      id="editUpdate"
                      name="update"
                      rows="4"
                      value={editFormData.update}
                      onChange={handleEditFormChange}
                      placeholder="Describe what you worked on today..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="editFinishBy" className="form-label fw-semibold">
                          Finish By
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="editFinishBy"
                          name="finishBy"
                          value={editFormData.finishBy}
                          onChange={handleEditFormChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="editImage" className="form-label fw-semibold">
                          Attach Image (Optional)
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="editImage"
                          accept="image/*"
                          onChange={handleEditImageChange}
                        />
                        <small className="text-muted">
                          Leave empty to keep existing image
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  {editingUpdate?.imageUrl && (
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Current Image:</label>
                      <div>
                        <img 
                          src={editingUpdate.imageUrl} 
                          alt="Current attachment" 
                          className="img-fluid rounded"
                          style={{ maxHeight: '150px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleCloseEditModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Update
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Backdrop */}
      {showEditModal && (
        <div className="modal-backdrop fade show"></div>
      )}

    
    </>
  );
};

export default EmployeeDashboard;