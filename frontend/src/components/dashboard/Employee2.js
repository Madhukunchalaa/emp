import React, { useState, useEffect } from 'react';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    setSubmittedUpdates(prev => [newUpdate, ...prev]);
    
    // Reset form
    setFormData({
      project: '',
      status: '',
      update: '',
      finishBy: '',
      image: null
    });
    
    // Reset file input
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.value = '';
  };

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
  );
};

export default Dashboard;