import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BarChart3, MessageSquare, Eye, Plus, Bell, TrendingUp, AlertCircle, CheckCircle, XCircle, Filter, Search, Download, RefreshCw } from 'lucide-react';
import { managerService } from '../../services/api';
import UserAvatar from '../common/userAvathar';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';

export default function ManagerDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [managerName, setManagerName] = useState('');
  const [managerMail, setManagerMail] = useState('');
  const [role, setRole] = useState('');
  const [employeesData, setEmployeesData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [employeeUpdates, setEmployeeUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalProjects: 0,
    completedProjects: 0,
    pendingUpdates: 0,
    totalHours: 0
  });

  // Fetch manager details
  useEffect(() => {
    const managerDetails = async () => {
      try {
        setLoading(true);
        const res = await managerService.getProfile();
        setManagerName(res.data.name);
        setManagerMail(res.data.mail);
        setRole(res.data.role);
      } catch (error) {
        console.error('Failed to fetch manager details:', error);
        setManagerName('Failed to fetch name');
        setManagerMail('Failed to fetch manager email');
        setRole('Failed to fetch manager role');
      } finally {
        setLoading(false);
      }
    };
    managerDetails();
  }, []);

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const res = await managerService.getEmployees();
        console.log('Employees response:', res);
        console.log('Employees data type:', typeof res.data);
        console.log('Employees data:', res.data);
        const employees = extractData(res);
        setEmployeesData(employees);
        setStats(prev => ({
          ...prev,
          totalEmployees: employees.length,
          activeEmployees: employees.filter(emp => emp.status === 'active').length
        }));
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setError('Failed to fetch employees data');
        setEmployeesData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await managerService.getProjects();
        console.log('Projects response:', res);
        console.log('Projects data type:', typeof res.data);
        console.log('Projects data:', res.data);
        const projects = extractData(res);
        setProjectsData(projects);
        setStats(prev => ({
          ...prev,
          totalProjects: projects.length,
          completedProjects: projects.filter(project => project.status === 'completed').length
        }));
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setError('Failed to fetch projects data');
        setProjectsData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch employee updates
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setLoading(true);
        const res = await managerService.getEmployeeUpdates();
        console.log('Updates response:', res);
        console.log('Updates data type:', typeof res.data);
        console.log('Updates data:', res.data);
        const updates = extractData(res);
        setEmployeeUpdates(updates);
        setStats(prev => ({
          ...prev,
          pendingUpdates: updates.filter(update => update.status === 'pending').length
        }));
      } catch (error) {
        console.error('Failed to fetch updates:', error);
        setError('Failed to fetch employee updates');
        setEmployeeUpdates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  // Refresh projects data function
  const refreshProjects = async () => {
    try {
      setLoading(true);
      const res = await managerService.getProjects();
      const projects = extractData(res);
      setProjectsData(projects);
      setStats(prev => ({
        ...prev,
        totalProjects: projects.length,
        completedProjects: projects.filter(project => project.status === 'completed').length
      }));
      setSuccess('Projects data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh projects:', error);
      setError('Failed to refresh projects data');
    } finally {
      setLoading(false);
    }
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear error/success messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Helper function to safely extract data from API responses
  const extractData = (response) => {
    if (!response) return [];
    
    // If response.data is an array, return it
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // If response.data is an object with a data property
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // If response.data is an object with a results property
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results;
    }
    
    // If response.data is an object with an items property
    if (response.data && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    
    // If response itself is an array
    if (Array.isArray(response)) {
      return response;
    }
    
    // If response.data is an object, try to find any array property
    if (response.data && typeof response.data === 'object') {
      const keys = Object.keys(response.data);
      for (const key of keys) {
        if (Array.isArray(response.data[key])) {
          return response.data[key];
        }
      }
    }
    
    // Default fallback
    console.warn('Could not extract array data from response:', response);
    return [];
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleViewUpdate = (update) => {
    setSelectedUpdate(update);
    setShowUpdateModal(true);
  };

  const filteredEmployees = employeesData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || employee.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredProjects = projectsData.filter(project => {
    return project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           project.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get unique team members from a project's steps
  const getProjectTeam = (project) => {
    if (!project || !project.steps) return [];
    const team = new Map();
    project.steps.forEach(step => {
      if (step.tasks) {
        step.tasks.forEach(task => {
          // Ensure assignedTo is populated and has an _id
          if (task.assignedTo && task.assignedTo._id && !team.has(task.assignedTo._id)) {
            team.set(task.assignedTo._id, task.assignedTo);
          }
        });
      }
    });
    return Array.from(team.values());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation Bar */}
      <Navbar userRole="manager" />

      {/* Error/Success Messages */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Debug Section - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mx-6 mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
          <h4 className="font-bold mb-2">Debug Info:</h4>
          <p>User Role from localStorage: {localStorage.getItem('userRole')}</p>
          <p>User Data: {localStorage.getItem('user')}</p>
          <button 
            onClick={() => {
              console.log('Current localStorage:', {
                token: localStorage.getItem('token'),
                user: localStorage.getItem('user'),
                userRole: localStorage.getItem('userRole')
              });
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          >
            Log localStorage
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Manager Dashboard
          </h1>
          <p className="text-gray-600">Welcome back! Here's an overview of your team and projects</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Total Employees</h3>
            <p className="text-sm text-gray-500">{stats.activeEmployees} active today</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.totalProjects}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Total Projects</h3>
            <p className="text-sm text-gray-500">{stats.completedProjects} completed</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">{stats.pendingUpdates}</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Pending Updates</h3>
            <p className="text-sm text-gray-500">Require approval</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-white/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">87%</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Productivity</h3>
            <p className="text-sm text-gray-500">+5% from last week</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees, projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Employee List Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 mb-6">
          <div className="flex items-center justify-between p-5 border-b border-white/20">
            <h2 className="text-xl font-bold text-gray-800">Employee List</h2>
            <Link to="/assign-task" className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 no-underline">
              <Plus className="w-4 h-4" />
              <span>Assign Task</span>
            </Link>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No employees found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredEmployees.map((employee) => (
                  <div key={employee._id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30 group">
                    <div className="relative mb-3">
                      <UserAvatar
                        avatar={employee.avatar}
                        name={employee.name}
                        className="mx-auto"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                        employee.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray-800 mb-1">{employee.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{employee.position || employee.role}</p>
                    <p className="text-xs text-gray-500 mb-3 truncate">{employee.email}</p>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-center space-x-1 text-sm text-gray-600 bg-gray-100/70 rounded-lg px-2 py-1">
                        <Clock className="w-3 h-3" />
                        <span>{employee.role}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleViewEmployee(employee)}
                        className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:shadow-md transition-all duration-200"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button className="flex items-center space-x-1 bg-gray-200/70 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-300/70 transition-all duration-200">
                        <MessageSquare className="w-3 h-3" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 mb-6">
          <div className="flex items-center justify-between p-5 border-b border-white/20">
            <h2 className="text-xl font-bold text-gray-800">Recent Projects</h2>
            <div className="flex space-x-2">
              <button
                onClick={refreshProjects}
                disabled={loading}
                className="flex items-center space-x-1 text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <span className="text-gray-400">|</span>
              <Link to="/assign-project" className="text-orange-500 hover:text-orange-600 font-medium no-underline">
                Create Project
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/projects" className="text-orange-500 hover:text-orange-600 font-medium no-underline">View All</Link>
            </div>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No projects found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.slice(0, 6).map((project) => (
                  <Link 
                    key={project._id} 
                    to={`/project/${project._id}`}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30 group block no-underline"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{project.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                      <div className="flex items-center">
                        {getProjectTeam(project).slice(0, 3).map(member => (
                          <UserAvatar key={member._id} name={member.name} className="-ml-2" />
                        ))}
                        {getProjectTeam(project).length > 3 && (
                          <span className="ml-1 text-xs text-gray-500">+{getProjectTeam(project).length - 3}</span>
                        )}
                        {getProjectTeam(project).length === 0 && (
                          <span className="text-xs text-gray-500">No one assigned</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Click to view details</span>
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
                      </div>
                    </div>
                    <div className="text-gray-600">
                      <span className="font-semibold">
                        {(() => {
                          const totalTasks = project.steps 
                            ? project.steps.reduce((acc, step) => acc + (step.tasks ? step.tasks.length : 0), 0) 
                            : 0;
                          const completedTasks = project.steps 
                            ? project.steps.reduce((acc, step) => acc + (step.tasks ? step.tasks.filter(t => t.status === 'completed').length : 0), 0) 
                            : 0;
                          return `${completedTasks} / ${totalTasks} tasks`;
                        })()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Employee Updates Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center justify-between p-5 border-b border-white/20">
            <h2 className="text-xl font-bold text-gray-800">Recent Employee Updates</h2>
            <Link to="/reports" className="text-orange-500 hover:text-orange-600 font-medium no-underline">View All</Link>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading updates...</p>
              </div>
            ) : employeeUpdates.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No updates found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {employeeUpdates.slice(0, 5).map((update) => (
                  <div key={update._id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <UserAvatar
                          avatar={update.employee?.avatar}
                          name={update.employee?.name}
                          size="sm"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{update.employee?.name}</h4>
                          <p className="text-xs text-gray-500">{new Date(update.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        update.status === 'approved' ? 'bg-green-100 text-green-800' :
                        update.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {update.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{update.tasks?.map(task => task.description).join(', ')}</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewUpdate(update)}
                        className="flex items-center space-x-1 bg-gray-200/70 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-300/70 transition-all duration-200"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily Updates Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 mt-6">
          <div className="flex items-center justify-between p-5 border-b border-white/20">
            <h2 className="text-xl font-bold text-gray-800">Daily Updates</h2>
            <Link to="/reports" className="text-orange-500 hover:text-orange-600 font-medium no-underline">View All</Link>
          </div>
          
          <div className="p-5">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading daily updates...</p>
              </div>
            ) : employeeUpdates.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No daily updates found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {employeeUpdates.slice(0, 5).map((update) => (
                  <div key={update._id} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 hover:shadow-lg hover:bg-white/80 transition-all duration-300 border border-white/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <UserAvatar
                          avatar={update.employee?.avatar}
                          name={update.employee?.name}
                          size="sm"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-800">{update.employee?.name}</h4>
                          <p className="text-xs text-gray-500">{new Date(update.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          update.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          update.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          update.status === 'Not Started' ? 'bg-yellow-100 text-yellow-800' :
                          update.status === 'On Hold' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {update.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          update.approvalStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                          update.approvalStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {update.approvalStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="font-medium text-gray-800 mb-1">Project: {update.project_title}</h5>
                      <p className="text-sm text-gray-600">{update.update}</p>
                    </div>

                    {update.imageUrl && (
                      <div className="mb-3">
                        <img 
                          src={update.imageUrl} 
                          alt="Update attachment"
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewUpdate(update)}
                        className="flex items-center space-x-1 bg-gray-200/70 text-gray-700 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-300/70 transition-all duration-200"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Employee Details</h3>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="text-center mb-4">
              <UserAvatar
                avatar={selectedEmployee.avatar}
                name={selectedEmployee.name}
                className="mx-auto mb-3"
              />
              <h4 className="font-semibold text-gray-800">{selectedEmployee.name}</h4>
              <p className="text-sm text-gray-600">{selectedEmployee.position || selectedEmployee.role}</p>
              <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedEmployee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedEmployee.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="text-gray-800">{selectedEmployee.role}</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl hover:shadow-md transition-all duration-200">
                View Profile
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl hover:bg-gray-300 transition-all duration-200">
                Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Detail Modal */}
      {showUpdateModal && selectedUpdate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Daily Update Details</h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserAvatar
                  avatar={selectedUpdate.employee?.avatar}
                  name={selectedUpdate.employee?.name}
                  size="sm"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedUpdate.employee?.name}</h4>
                  <p className="text-xs text-gray-500">{new Date(selectedUpdate.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Project:</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{selectedUpdate.project_title}</p>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">Status:</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUpdate.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  selectedUpdate.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  selectedUpdate.status === 'Not Started' ? 'bg-yellow-100 text-yellow-800' :
                  selectedUpdate.status === 'On Hold' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedUpdate.status}
                </span>
              </div>

              <div>
                <h5 className="font-medium text-gray-800 mb-2">Update Details:</h5>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{selectedUpdate.update}</p>
              </div>

              {selectedUpdate.finishBy && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Finish By:</h5>
                  <p className="text-sm text-gray-600">{new Date(selectedUpdate.finishBy).toLocaleDateString()}</p>
                </div>
              )}

              {selectedUpdate.imageUrl && (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Attachment:</h5>
                  <img 
                    src={selectedUpdate.imageUrl} 
                    alt="Update attachment"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}