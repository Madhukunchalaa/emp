import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Calendar, Clock, Users, FileText, Coffee, Video, Bell, User, ChevronDown, Eye, Play, MoreVertical } from 'lucide-react';
// import { 
//   FileText, 
//   MoreVertical, 
//   Calendar, 
//   User, 
//   Users, 
//   Clock, 
//   Eye, 
//   Play 
// } from 'lucide-react';
const Dashboard = () => {
=======
import axios from 'axios';
import { Clock, FolderOpen, FileText, CheckCircle, Play, Timer, User, LogOut, Menu, X, CalendarCheck } from 'lucide-react';
import { punchIn } from '../../store/slices/employeeSlice';
import { useDispatch } from 'react-redux';
import {useNavigate, Link } from 'react-router-dom';
import { employeeService } from '../../services/api';
import UpdateForm from './UpdateForm';
import Chat from '../common/Chat';
import { managerService } from '../../services/api';


const EmployeeDashboard = () => {
  const navigate=useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState('attendance');
  const [sidebarOpen, setSidebarOpen] = useState(true);
>>>>>>> 8c0fdd4e794c79881c46c5926b1bbd27e41f4d69
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingHours, setWorkingHours] = useState({ hours: 6, minutes: 43, seconds: 37 });
  const [punchInTime, setPunchInTime] = useState('10:05');
  const [punchOutTime, setPunchOutTime] = useState('00:00');
  const [activeNav, setActiveNav] = useState('home');

  // Sample projects data
  const [myProjects] = useState([
    {
      _id: '1',
      title: 'E-commerce Website Development',
      description: 'Building a modern e-commerce platform with React and Node.js, including payment integration and user management.',
      status: 'In Progress',
      deadline: '2025-07-15',
      assignedTo: { name: 'Lokesh' },
      createdBy: { name: 'Manager' },
      comment: 'Priority project - needs to be completed by Q3',
      createdAt: '2025-06-01'
    },
    {
      _id: '2',
      title: 'Mobile App UI/UX Design',
      description: 'Creating user interface designs for a mobile banking application with focus on accessibility.',
      status: 'Pending',
      deadline: '2025-08-20',
      assignedTo: { name: 'Gayathri' },
      createdBy: { name: 'Design Lead' },
      comment: 'Waiting for client feedback on wireframes',
      createdAt: '2025-05-28'
    },
    {
      _id: '3',
      title: 'Database Optimization',
      description: 'Optimize existing database queries and implement caching strategies for improved performance.',
      status: 'Completed',
      deadline: '2025-06-30',
      assignedTo: { name: 'Lokesh' },
      createdBy: { name: 'Tech Lead' },
      comment: 'Great work on performance improvements!',
      createdAt: '2025-05-15'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setWorkingHours(prev => ({
        ...prev,
        seconds: prev.seconds + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', { 
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
    }
    return date.toLocaleDateString('en-US', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      weekday: 'short'
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-success text-white';
      case 'In Progress':
        return 'bg-primary text-white';
      case 'Pending':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary text-white';
    }
  };

  const getDeadlineIndicator = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', class: 'text-danger fw-bold' };
    } else if (diffDays === 0) {
      return { text: 'Due today', class: 'text-warning fw-bold' };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, class: 'text-warning' };
    } else {
      return { text: `${diffDays} days left`, class: 'text-muted' };
    }
  };

  const workingHoursPercentage = ((workingHours.hours * 60 + workingHours.minutes) / 480) * 100;
  const leavePercentage = (16 / 20) * 100;
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleNavClick = (navItem) => {
    setActiveNav(navItem);
  };

  const renderHomeContent = () => (
    <div className="row g-4">
      {/* Left Column */}
      <div className="col-lg-4">
        {/* Attendance Card */}
        <div className="card" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title mb-0">Attendance</h5>
              <div style={{width: '24px', height: '24px', border: '2px dashed #d1d5db', borderRadius: '4px'}}></div>
            </div>
            
            {/* Circular Progress */}
            <div className="d-flex justify-content-center mb-4">
              <div style={{ position: 'relative', width: '200px', height: '200px' }}>
                <svg width="200" height="200" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#f97316"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${workingHoursPercentage * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div className="h4 fw-bold text-dark mb-0">
                    {String(workingHours.hours).padStart(2, '0')}:
                    {String(workingHours.minutes).padStart(2, '0')}:
                    {String(workingHours.seconds).padStart(2, '0')}
                  </div>
                  <small className="text-muted">Working Hours</small>
                </div>
              </div>
            </div>

            {/* Punch In/Out */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', color: 'white' }} className="p-3 mb-3">
              <div className="row">
                <div className="col-6">
                  <small className="text-white">Punch in</small>
                  <div className="h5 mb-0">{punchInTime}</div>
                </div>
                <div className="col-6">
                  <small className="text-white">Punch out</small>
                  <div className="h5 mb-0">{punchOutTime}</div>
                </div>
              </div>
            </div>

            <button className="btn w-100" style={{ backgroundColor: '#f97316', borderColor: '#f97316', color: 'white' }}>
              Punch in
            </button>
          </div>
        </div>
      </div>

      {/* Middle Column */}
      <div className="col-lg-4">
        {/* Greeting */}
        <div className="card mb-4" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-8">
                <small className="fw-bold" style={{ color: '#f97316' }}>Hi, Gayathri</small>
                <h4 className="fw-bold text-dark mb-1">Good Morning</h4>
                <small className="fw-bold" style={{ color: '#f97316' }}>Have a good day</small>
              </div>
              <div className="col-4 text-end">
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#ffedd5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#f97316',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Coffee size={24} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Status */}
        <div className="card" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="card-body p-4">
            <h5 className="card-title mb-4">Quick status</h5>
            
            <div className="row g-3">
              <div className="col-6">
                <div style={{ backgroundColor: '#ffedd5', borderRadius: '8px', position: 'relative', height: '100%', overflow: 'hidden' }} className="p-3">
                  <FileText size={20} className="text-dark mb-2" />
                  <div className="fw-medium text-dark">Project</div>
                  <small className="text-muted">Lorem ipsum dolor sit amet, consectetur</small>
                </div>
              </div>

              <div className="col-6">
                <div style={{ backgroundColor: '#ffedd5', borderRadius: '8px', position: 'relative', height: '100%', overflow: 'hidden' }} className="p-3">
                  <Coffee size={20} className="text-dark mb-2" />
                  <div className="fw-medium text-dark">Leave</div>
                  <small className="text-muted">Lorem ipsum dolor sit amet, consectetur</small>
                  <div><small className="text-danger fw-medium">Denied</small></div>
                </div>
              </div>

              <div className="col-6">
                <div style={{ backgroundColor: '#ffedd5', borderRadius: '8px', position: 'relative', height: '100%', overflow: 'hidden' }} className="p-3">
                  <Coffee size={20} className="text-dark mb-2" />
                  <div className="fw-medium text-dark">Holiday</div>
                  <div className="text-warning fw-medium">11 Diwali</div>
                  <small className="text-muted">Wednesday</small>
                </div>
              </div>

              <div className="col-6">
                <div style={{ backgroundColor: '#ffedd5', borderRadius: '8px', position: 'relative', height: '100%', overflow: 'hidden' }} className="p-3">
                  <Video size={20} className="text-dark mb-2" />
                  <div className="fw-medium text-dark">Meeting</div>
                  <small className="text-muted">Lorem ipsum dolor sit amet, consectetur</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="col-lg-4">
        {/* Calendar */}
        <div className="card mb-4" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title mb-0">Calendar</h5>
              <div style={{width: '24px', height: '24px', border: '2px dashed #d1d5db', borderRadius: '4px'}}></div>
            </div>
            
            <div className="text-center mb-3">
              <h6 className="fw-semibold">April</h6>
            </div>
            
            <div className="row g-0 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="col text-center">
                  <small className="text-muted fw-medium">{day}</small>
                </div>
              ))}
            </div>
            
            <div className="row g-1 mb-3">
              {calendarDays.map(day => (
                <div key={day} className="col text-center">
                  <div style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    backgroundColor: day === 12 ? '#f97316' : day === 15 ? '#ffedd5' : 'transparent',
                    color: day === 12 ? 'white' : day === 15 ? '#f97316' : 'inherit'
                  }} className="small">
                    {day}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="d-grid gap-2">
              <button className="btn btn-sm" style={{ backgroundColor: '#ffedd5', borderColor: '#f97316', color: '#f97316' }}>
                Create a plan
              </button>
              <div className="row g-2">
                <div className="col">
                  <button className="btn btn-sm w-100" style={{ backgroundColor: '#f97316', borderColor: '#f97316', color: 'white' }}>In work</button>
                </div>
                <div className="col">
                  <button className="btn btn-sm w-100" style={{ backgroundColor: '#f97316', borderColor: '#f97316', color: 'white' }}>Outing</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Stats */}
        <div className="card" style={{ border: 'none', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="card-title mb-0">Leave stats</h5>
              <div style={{width: '24px', height: '24px', border: '2px dashed #d1d5db', borderRadius: '4px'}}></div>
            </div>
            
            <div className="d-flex justify-content-center mb-3">
              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg width="120" height="120" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="#f97316"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${leavePercentage * 2.19} 219`}
                    strokeLinecap="round"
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <div className="h4 fw-bold text-dark mb-0">16</div>
                  <small className="text-muted">Days</small>
                </div>
              </div>
            </div>
            
            <div className="text-center mb-3">
              <h6 className="fw-semibold">16/20</h6>
            </div>
            
            <button className="btn w-100 btn-sm" style={{ backgroundColor: '#f97316', borderColor: '#f97316', color: 'white' }}>
              Apply for leave
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const RenderProjectsContent = () => {
  // Sample project data
  const [myProjects] = useState([
    {
      _id: '1',
      title: 'E-commerce Website Redesign',
      description: 'Complete redesign of the company e-commerce platform with modern UI/UX and improved user experience',
      status: 'In Progress',
      deadline: '2025-07-15',
      assignedTo: { name: 'John Doe' },
      createdBy: { name: 'Sarah Wilson' },
      comment: 'Priority project with focus on mobile responsiveness',
      createdAt: '2025-06-01'
    },
    {
      _id: '2',
      title: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms with real-time notifications',
      status: 'Not Started',
      deadline: '2025-08-30',
      assignedTo: { name: 'Jane Smith' },
      createdBy: { name: 'Mike Johnson' },
      comment: 'Requires API integration with existing backend',
      createdAt: '2025-05-28'
    },
    {
      _id: '3',
      title: 'Database Migration',
      description: 'Migrate legacy database to new cloud infrastructure with improved performance',
      status: 'Completed',
      deadline: '2025-06-20',
      assignedTo: { name: 'Bob Wilson' },
      createdBy: { name: 'Alice Brown' },
      comment: null,
      createdAt: '2025-05-15'
    },
    {
      _id: '4',
      title: 'API Integration Project',
      description: 'Integrate third-party APIs for payment processing and authentication services',
      status: 'In Progress',
      deadline: '2025-07-01',
      assignedTo: { name: 'Tom Davis' },
      createdBy: { name: 'Emma Taylor' },
      comment: 'Testing phase in progress',
      createdAt: '2025-05-20'
    }
  ]);

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in progress':
        return 'bg-warning text-dark';
      case 'not started':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getDeadlineIndicator = (deadline) => {
    if (!deadline) return { class: 'text-muted', text: 'No deadline' };
    
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { class: 'text-danger fw-bold', text: 'Overdue' };
    } else if (diffDays <= 3) {
      return { class: 'text-danger fw-bold', text: `${diffDays} days left` };
    } else if (diffDays <= 7) {
      return { class: 'text-warning fw-bold', text: `${diffDays} days left` };
    } else {
      return { class: 'text-success', text: `${diffDays} days left` };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" 
        rel="stylesheet" 
      />
      
      <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="container py-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 p-4" 
               style={{ backgroundColor: 'rgb(249, 115, 22)', borderRadius: '10px' }}>
            <div>
              <h3 className="fw-bold mb-1" style={{ color: '#fff' }}>
                <FileText className="me-2 d-inline" size={28} style={{ color: '#ffff' }} />
                My Projects
              </h3>
              <p className="mb-0" style={{ color: '#ffffff' }}>
                Manage and track your assigned projects
              </p>
            </div>
            <div className="d-flex align-items-center">
              <span className="badge fs-6" style={{ backgroundColor: '#000', color: '#ffffff' }}>
                <FileText className="me-1 d-inline" size={14} />
                {myProjects?.length || 0} Projects
              </span>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="row g-4">
            {myProjects && myProjects.length > 0 ? (
              myProjects.map((project, index) => {
                const deadlineInfo = getDeadlineIndicator(project.deadline);
                const cardBorderColors = [
                  '#ff6600',
                  '#000000',
                  '#ff6600',
                  '#000000'
                ];
                const borderColor = cardBorderColors[index % cardBorderColors.length];

                return (
                  <div key={project._id} className="col-lg-6 col-xl-6">
                    <div className="card h-100 shadow-sm border-0" 
                         style={{ 
                           transition: 'all 0.3s ease',
                           borderLeft: `4px solid ${borderColor} !important`
                         }}>
                      <div className="card-header border-0 pb-0" 
                           style={{ backgroundColor: '#fffff' }}>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h5 className="card-title fw-bold mb-1" 
                                style={{ 
                                  color: '#ff6600',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                              {project.title}
                            </h5>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              <span className={`badge ${getStatusBadgeStyle(project.status)} rounded-pill`}>
                                <span className="me-1" style={{ fontSize: '0.5rem' }}>●</span>
                                {project.status}
                              </span>
                            </div>
                          </div>
                          <div className="dropdown">
                            <button className="btn btn-sm border-0" 
                                    type="button"
                                    style={{ color: '#ffffff' }}>
                              <MoreVertical size={20} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="card-body pt-2" style={{ backgroundColor: '#ffffff' }}>
                        <p className="mb-3" 
                           style={{ 
                             fontSize: '0.9rem',
                             color: '#666666',
                             display: '-webkit-box',
                             WebkitLineClamp: 3,
                             WebkitBoxOrient: 'vertical',
                             overflow: 'hidden'
                           }}>
                          {project.description || 'No description provided'}
                        </p>

                        <div className="row g-2 mb-3">
                          <div className="col-12">
                            <div className="d-flex align-items-center mb-2">
                              <Calendar className="me-2" size={14} style={{ color: '#ff6600' }} />
                              <small className="me-2" style={{ color: '#000000', fontWeight: 'bold' }}>Deadline:</small>
                              <small className={deadlineInfo.class}>
                                {formatDate(project.deadline)}
                                {deadlineInfo.text !== 'No deadline' && (
                                  <span className="ms-1">({deadlineInfo.text})</span>
                                )}
                              </small>
                            </div>
                          </div>
                          
                          <div className="col-12">
                            <div className="d-flex align-items-center mb-2">
                              <User className="me-2" size={14} style={{ color: '#ff6600' }} />
                              <small className="me-2" style={{ color: '#000000', fontWeight: 'bold' }}>Assigned to:</small>
                              <small className="fw-medium" style={{ color: '#000000' }}>
                                {project.assignedTo?.name || 'Unassigned'}
                              </small>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="d-flex align-items-center mb-2">
                              <Users className="me-2" size={14} style={{ color: '#ff6600' }} />
                              <small className="me-2" style={{ color: '#000000', fontWeight: 'bold' }}>Created by:</small>
                              <small className="fw-medium" style={{ color: '#000000' }}>
                                {project.createdBy?.name || 'Unknown'}
                              </small>
                            </div>
                          </div>
                        </div>

                        {project.comment && (
                          <div className="mb-3">
                            <div className="rounded p-2" style={{ backgroundColor: '#fffff' }}>
                              <small className="d-block mb-1" style={{ color: '#ff6600' }}>
                                <FileText className="me-1 d-inline" size={12} />
                                Comment:
                              </small>
                              <small style={{ color: '#000000', fontWeight: 'bold' }}>{project.comment}</small>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="card-footer bg-transparent border-0 pt-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <small style={{ color: '#666666' }}>
                            <Clock className="me-1 d-inline" size={12} />
                            Created {formatDate(project.createdAt)}
                          </small>
                          <div className="btn-group" role="group">
                            <button type="button" 
                                    className="btn btn-sm rounded-pill me-2"
                                    style={{ 
                                      backgroundColor: 'transparent',
                                      borderColor: '#ff6600',
                                      color: '#ff6600'
                                    }}>
                              <Eye className="me-1 d-inline" size={12} />
                              View
                            </button>
                            <button type="button" 
                                    className="btn btn-sm rounded-pill"
                                    style={{ 
                                      backgroundColor: '#ff6600',
                                      borderColor: '#ff6600',
                                      color: '#ffffff'
                                    }}>
                              <Play className="me-1 d-inline" size={12} />
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
                    <FileText size={96} style={{ color: '#ff6600' }} />
                  </div>
                  <h4 className="mb-2" style={{ color: '#000000' }}>No Projects Found</h4>
                  <p className="mb-4" style={{ color: '#666666' }}>You don't have any projects assigned yet.</p>
                  <button className="btn rounded-pill px-4"
                          style={{ 
                            backgroundColor: '#ff6600',
                            borderColor: '#ff6600',
                            color: '#ffffff'
                          }}>
                    <Users className="me-2 d-inline" size={20} />
                    Request New Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

  const renderLeaveContent = () => (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold text-dark mb-0">
            <Coffee className="me-2 text-primary d-inline" size={28} />
            Leave Management
          </h3>
          <p className="text-muted mb-0">Apply for leaves and track your leave balance</p>
        </div>
      </div>
      <div className="text-center py-5">
        <Coffee size={96} className="text-muted mb-4" />
        <h4 className="text-muted">Leave Management</h4>
        <p className="text-muted">Leave management features coming soon...</p>
      </div>
    </div>
  );


const RenderUpdatesContent = () => {
  const [formData, setFormData] = useState({
    project: '',
    status: '',
    update: '',
    finishBy: '',
    image: null
  });

  const [submittedUpdates, setSubmittedUpdates] = useState([]);

<<<<<<< HEAD
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
=======
  const [showChatModal, setShowChatModal] = useState(false);
  const [managerUser, setManagerUser] = useState(null);
  const [employeeUser, setEmployeeUser] = useState(null);

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
>>>>>>> 8c0fdd4e794c79881c46c5926b1bbd27e41f4d69
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = () => {
    if (!formData.project || !formData.status || !formData.update) {
      alert('Please fill in all required fields');
      return;
    }

    const newUpdate = {
      id: Date.now(),
      ...formData,
      submittedAt: new Date()
    };

<<<<<<< HEAD
    setSubmittedUpdates(prev => [newUpdate, ...prev]);
=======

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

  if (name === "project") {
    // When project is selected from dropdown, find the project details
    const selectedProject = projects.find((p) => p._id === value);
    if (selectedProject) {
      setFormData((prev) => ({
        ...prev,
        project: selectedProject._id,
        project_title: selectedProject.title
      }));
    }
  } else {
    // For all other fields, update normally
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formPayload = new FormData();

    // Add required fields
    formPayload.append('project', formData.project);          // Project ID
    formPayload.append('project_title', formData.project_title); // Project title
    formPayload.append('status', formData.status);
    formPayload.append('update', formData.update);
    formPayload.append('finishBy', formData.finishBy);

    // Add image if exists
    if (image) {
      formPayload.append('image', image);
    }

    // Make single API call
    const response = await employeeService.addDailyUpdate(formPayload);

    setMessage("Today's update submitted successfully");
>>>>>>> 8c0fdd4e794c79881c46c5926b1bbd27e41f4d69
    
    // Reset form
    setFormData({
      project: '',
      status: '',
      update: '',
      finishBy: '',
      image: null
    });
    
<<<<<<< HEAD
    // Reset file input
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.value = '';
  };
=======
  } catch (err) {
    console.error('Form not submitted:', err);
    setMessage("Something went wrong. Please try again.");
    
    // Clear error message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  }
};
>>>>>>> 8c0fdd4e794c79881c46c5926b1bbd27e41f4d69

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-success';
      case 'in progress':
        return 'bg-warning';
      case 'not started':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <>
      {/* Bootstrap CSS */}
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <link 
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" 
        rel="stylesheet" 
      />
      
      <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        <div className="container py-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 p-4" 
               style={{ backgroundColor: '#000000', borderRadius: '10px' }}>
            <div>
              <h1 className="fw-bold mb-1" style={{ color: '#ff6600', fontSize: '2.5rem' }}>
                <i className="bi bi-calendar-check me-2"></i>
                Daily Update
              </h1>
              <p className="mb-0" style={{ color: '#ffffff' }}>
                Track your project progress and submit daily updates
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="card shadow-sm border-0 mb-4" style={{ border: '2px solid #ff6600 !important' }}>
            <div className="card-header text-white" style={{ backgroundColor: '#ff6600' }}>
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-pencil-square me-2"></i>
                Submit Your Daily Update
              </h5>
            </div>
            <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
              <div className="row">
                <div className="col-md-8">
                  {/* Project Selection */}
                  <div className="mb-3">
                    <label htmlFor="project" className="form-label fw-bold" style={{ color: '#000000' }}>
                      Project <span style={{ color: '#ff6600' }}>*</span>
                    </label>
                    <select
                      id="project"
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      className="form-select"
                      style={{ borderColor: '#ff6600' }}
                      required
                    >
                      <option value="">Select a project</option>
                      <option value="Website Redesign">Website Redesign</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="Database Migration">Database Migration</option>
                      <option value="API Integration">API Integration</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                    </select>
                  </div>

                  {/* Update Description */}
                  <div className="mb-3">
                    <label htmlFor="update" className="form-label fw-bold" style={{ color: '#000000' }}>
                      Update <span style={{ color: '#ff6600' }}>*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="update"
                      name="update"
                      value={formData.update}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Describe your progress..."
                      style={{ borderColor: '#ff6600' }}
                      required
                    ></textarea>
                  </div>

                  {/* Finish By Date */}
                  <div className="mb-3">
                    <label htmlFor="finishBy" className="form-label fw-bold" style={{ color: '#000000' }}>
                      Finish By
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="finishBy"
                      name="finishBy"
                      value={formData.finishBy}
                      onChange={handleInputChange}
                      style={{ borderColor: '#ff6600' }}
                    />
                  </div>

                  {/* Upload Image */}
                  <div className="mb-3">
                    <label htmlFor="image" className="form-label fw-bold" style={{ color: '#000000' }}>
                      Upload Image
                    </label>
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      name="image"
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ borderColor: '#ff6600' }}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="p-3 rounded" style={{ backgroundColor: '#000000' }}>
                    <h6 className="fw-bold mb-3" style={{ color: '#ff6600' }}>Update Settings</h6>
                    
                    {/* Status */}
                    <div className="mb-3">
                      <label className="form-label fw-bold" style={{ color: '#ffffff' }}>
                        Status <span style={{ color: '#ff6600' }}>*</span>
                      </label>
                      <div className="d-flex flex-column gap-2">
                        {['Not Started', 'In Progress', 'Completed'].map((status) => (
                          <div key={status} className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="status"
                              id={`status-${status.replace(' ', '-').toLowerCase()}`}
                              value={status}
                              checked={formData.status === status}
                              onChange={handleInputChange}
                              style={{ 
                                borderColor: '#ff6600',
                                backgroundColor: formData.status === status ? '#ff6600' : 'white'
                              }}
                              required
                            />
                            <label 
                              className="form-check-label" 
                              htmlFor={`status-${status.replace(' ', '-').toLowerCase()}`}
                              style={{ color: '#ffffff' }}
                            >
                              {status}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center mt-4">
                <button 
                  onClick={handleSubmit}
                  className="btn btn-lg fw-bold px-5"
                  style={{ 
                    backgroundColor: '#ff6600', 
                    borderColor: '#ff6600',
                    color: '#ffffff'
                  }}
                >
                  <i className="bi bi-send me-2"></i>
                  Submit Update
                </button>
              </div>
            </div>
          </div>

          {/* Submitted Updates */}
          {submittedUpdates.length > 0 && (
            <div>
              <div className="d-flex align-items-center mb-4 p-3 rounded" 
                   style={{ backgroundColor: '#000000' }}>
                <h4 className="fw-bold mb-0" style={{ color: '#ff6600' }}>
                  <i className="bi bi-list-ul me-2"></i>
                  Submitted Updates ({submittedUpdates.length})
                </h4>
              </div>

              <div className="row g-4">
                {submittedUpdates.map((update) => (
                  <div key={update.id} className="col-12">
                    <div className="card shadow-sm" style={{ border: '2px solid #ff6600' }}>
                      <div className="card-header d-flex justify-content-between align-items-start" 
                           style={{ backgroundColor: '#000000' }}>
                        <div>
                          <h6 className="card-title fw-bold mb-1" style={{ color: '#ff6600' }}>
                            {update.project}
                          </h6>
                          <p className="mb-0 small" style={{ color: '#ffffff' }}>
                            <i className="bi bi-calendar-event me-1"></i>
                            {formatDate(update.submittedAt)}
                          </p>
                        </div>
                        <div className="d-flex gap-2">
                          <span className={`badge ${getStatusBadgeStyle(update.status)} rounded-pill`}>
                            {update.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="card-body" style={{ backgroundColor: '#ffffff' }}>
                        <div className="row">
                          <div className="col-md-8">
                            <div className="mb-3">
                              <h6 className="fw-bold mb-2" style={{ color: '#000000' }}>Update Details:</h6>
                              <p className="mb-0" style={{ color: '#666666' }}>{update.update}</p>
                            </div>
                            
                            {update.finishBy && (
                              <div className="mb-3">
                                <h6 className="fw-bold mb-2" style={{ color: '#000000' }}>Finish By:</h6>
                                <span className="badge" style={{ backgroundColor: '#000000', color: '#ff6600' }}>
                                  {new Date(update.finishBy).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            
                            {update.image && (
                              <div className="mb-3">
                                <h6 className="fw-bold mb-2" style={{ color: '#000000' }}>Attached Image:</h6>
                                <span className="text-muted">
                                  <i className="bi bi-paperclip me-1"></i>
                                  {update.image.name}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="col-md-4">
                            <div className="rounded p-3" style={{ backgroundColor: '#f8f9fa', border: '1px solid #ff6600' }}>
                              <h6 className="fw-bold mb-2" style={{ color: '#000000' }}>Submission Info</h6>
                              <div className="mb-2">
                                <small className="d-block" style={{ color: '#666666' }}>Status:</small>
                                <span className={`badge ${getStatusBadgeStyle(update.status)} w-100`}>
                                  {update.status}
                                </span>
                              </div>
                              <div className="mb-2">
                                <small className="d-block" style={{ color: '#666666' }}>Project:</small>
                                <span className="badge w-100" style={{ backgroundColor: '#ff6600', color: '#ffffff' }}>
                                  {update.project}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-footer bg-transparent border-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <small style={{ color: '#666666' }}>
                            <i className="bi bi-clock me-1"></i>
                            Submitted {formatDate(update.submittedAt)}
                          </small>
                          <button 
                            type="button" 
                            className="btn btn-sm"
                            style={{ 
                              backgroundColor: '#ff6600',
                              borderColor: '#ff6600',
                              color: '#ffffff'
                            }}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
<<<<<<< HEAD
=======
                
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

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
              <div className="mb-3">
                <label className="form-label">Select Project</label>
                <select
                  name="project"
                  className="form-select"
                  value={formData.project}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a project...</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.title}
                    </option>
                  ))}
                </select>
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
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Update Description</label>
                <textarea
                  name="update"
                  className="form-control"
                  rows="4"
                  value={formData.update}
                  onChange={handleChange}
                  placeholder="Describe what you worked on today, challenges faced, and next steps..."
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

              <div className="mb-3">
                <label className="form-label">Upload Screenshot</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="form-control"
                />
              </div>

              {message && (
                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} mb-3`}>
                  {message}
                </div>
              )}

              <button type="submit" className="btn btn-primary w-100">
                Submit Update
              </button>
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
>>>>>>> 8c0fdd4e794c79881c46c5926b1bbd27e41f4d69
              </div>
            </div>
          )}

          {/* Empty State */}
          {submittedUpdates.length === 0 && (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-inbox display-1" style={{ color: '#ff6600' }}></i>
              </div>
              <h4 className="mb-2" style={{ color: '#000000' }}>No Updates Submitted Yet</h4>
              <p style={{ color: '#666666' }}>
                Fill out the form above to submit your first daily update.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


  const renderContent = () => {
    switch (activeNav) {
      case 'home':
        return renderHomeContent();
      case 'projects':
        return <RenderProjectsContent/>;
      case 'leave':
        return renderLeaveContent();
      case 'updates':
        return <RenderUpdatesContent/>;
      default:
        return renderHomeContent();
    }
  };

<<<<<<< HEAD
=======
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

  // Fetch employee user info (with _id) from token/localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userObj = payload.user || payload;
        setEmployeeUser({ _id: userObj._id || userObj.id, ...userObj });
      } catch (e) {
        console.error('Failed to decode token for employee user', e);
      }
    }
  }, []);

  const handleOpenChat = async () => {
    try {
      const res = await managerService.getProfile();
      // Ensure _id is present for chat
      setManagerUser({ _id: res.data._id || res.data.id, ...res.data });
      setShowChatModal(true);
    } catch (err) {
      alert('Could not fetch manager info for chat');
      console.error('Manager fetch error:', err);
    }
  };

  const handleCloseChat = () => setShowChatModal(false);

  if (!isLoggedIn) {
    return (
      navigate('/login')
    );
  }

>>>>>>> 8c0fdd4e794c79881c46c5926b1bbd27e41f4d69
  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f9fafb', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom">
        <div className="container-fluid px-4">
          {/* Logo */}
          <div className="navbar-brand d-flex align-items-center fw-bold" style={{ color: '#1f2937' }}>
            <div className="me-2">
                  <img src="/smartsolutions-logo.png" alt="Logo" style={{ width: '100%', height: '100%' }} />
            </div>
        
          </div>
<<<<<<< HEAD
=======
          
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
              <button className="btn btn-outline-primary w-100 mb-3" onClick={handleOpenChat}>
                <User size={16} className="me-2" />
                Chat with Manager
              </button>
            </div>
          </nav>
        </div>
>>>>>>> 8c0fdd4e794c79881c46c5926b1bbd27e41f4d69

          {/* Navigation */}
          <div className="d-flex gap-1">
            <button 
              className={`btn border-0 px-3 py-2 fw-bold rounded d-flex align-items-center gap-2 ${
                activeNav === 'home' 
                  ? 'text-white' 
                  : 'text-muted'
              }`}
              style={{
                backgroundColor: activeNav === 'home' ? '#f97316' : 'transparent',
                transition: 'all 0.2s'
              }}
              onClick={() => handleNavClick('home')}
            >
              <Calendar size={20} />
              Home
            </button>
            <button 
              className={`btn border-0 px-3 py-2 fw-bold rounded d-flex align-items-center gap-2 ${
                activeNav === 'projects' 
                  ? 'text-white' 
                  : 'text-muted'
              }`}
              style={{
                backgroundColor: activeNav === 'projects' ? '#f97316' : 'transparent',
                transition: 'all 0.2s'
              }}
              onClick={() => handleNavClick('projects')}
            >
              <FileText size={20} />
              Projects
            </button>
            <button 
              className={`btn border-0 px-3 py-2 fw-bold rounded d-flex align-items-center gap-2 ${
                activeNav === 'leave' 
                  ? 'text-white' 
                  : 'text-muted'
              }`}
              style={{
                backgroundColor: activeNav === 'leave' ? '#f97316' : 'transparent',
                transition: 'all 0.2s'
              }}
              onClick={() => handleNavClick('leave')}
            >
              <Coffee size={20} />
              Leave
            </button>
            <button 
              className={`btn border-0 px-3 py-2 fw-bold rounded d-flex align-items-center gap-2 ${
                activeNav === 'updates' 
                  ? 'text-white' 
                  : 'text-muted'
              }`}
              style={{
                backgroundColor: activeNav === 'updates' ? '#f97316' : 'transparent',
                transition: 'all 0.2s'
              }}
              onClick={() => handleNavClick('updates')}
            >
              <Bell size={20} />
              Updates
            </button>
          </div>

          {/* Right side */}
          <div className="d-flex align-items-center gap-3">
            <small className="text-muted">
              {formatDate(currentTime)} | {formatTime(currentTime)}
            </small>
            <Bell size={20} className="text-muted" />
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">Lokesh</small>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#1f2937',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <User size={20} className="text-white" />
              </div>
              <ChevronDown size={20} className="text-muted" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid p-4">
        {renderContent()}
      </div>
    </div>
<<<<<<< HEAD
=======
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

      {/* Chat with Manager Modal */}
      {showChatModal && managerUser && employeeUser && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-chat-dots me-2 text-primary"></i>
                  Chat with Manager
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseChat}></button>
              </div>
              <div className="modal-body">
                {/* Debug logs for user objects */}
                {console.log('Employee user for chat:', employeeUser)}
                {console.log('Manager user for chat:', managerUser)}
                <Chat currentUser={employeeUser} otherUser={managerUser} />
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </>
>>>>>>> 8c0fdd4e794c79881c46c5926b1bbd27e41f4d69
  );
};

export default Dashboard;