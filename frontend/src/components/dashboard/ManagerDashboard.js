import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BarChart3, MessageSquare, Eye, Plus, Bell, TrendingUp, AlertCircle, CheckCircle, XCircle, Filter, Search, Download, RefreshCw, Settings, ClipboardList, FolderOpen } from 'lucide-react';
import { managerService } from '../../services/api';
import UserAvatar from '../common/userAvathar';
import { Link } from 'react-router-dom';
import Chat from '../common/Chat';
import TodoCalendar from './TodoCalendar';
import TaskList from './TaskList';
import jwtDecode from 'jwt-decode';
// import { Calendar, ChevronLeft, ChevronRight, User, Clock, X, Users, CalendarDays, ArrowLeft } from 'lucide-react';

export default function ManagerDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [managerName, setManagerName] = useState('');
  const [managerMail, setManagerMail] = useState('');
  const [role, setRole] = useState('');
  const [employeesData, setEmployeesData] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [managerUser, setManagerUser] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [chatEmployee, setChatEmployee] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showTodoCalendar, setShowTodoCalendar] = useState(true);
  const [dailyQuote, setDailyQuote] = useState('');
  const [productivityData, setProductivityData] = useState({
    overallProductivity: 0,
    projectStatuses: {
      completed: 0,
      inProgress: 0,
      pending: 0,
      onHold: 0
    },
    projectProgress: []
  });

  // Inspirational quotes array
  const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't be afraid to give up the good to go for the great. - John D. Rockefeller",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Sometimes later becomes never. Do it now.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Dream bigger. Do bigger.",
    "Don't stop when you're tired. Stop when you're done.",
    "Wake up with determination. Go to bed with satisfaction.",
    "Do something today that your future self will thank you for.",
    "Little things make big days.",
    "It's going to be hard, but hard does not mean impossible.",
    "Don't wait for opportunity. Create it.",
    "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    "The key to success is to focus on goals, not obstacles.",
    "Dream it. Believe it. Build it.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The only impossible journey is the one you never begin.",
    "In the middle of difficulty lies opportunity. - Albert Einstein"
  ];

  // Get current time of day for greeting
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Set random quote on component mount
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setDailyQuote(randomQuote);
  }, []);

  // Function to get a new random quote
  const getNewQuote = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setDailyQuote(randomQuote);
  };

  // Function to calculate productivity data
  const calculateProductivityData = (projects) => {
    if (!projects || projects.length === 0) {
      return {
        overallProductivity: 0,
        projectStatuses: { completed: 0, inProgress: 0, pending: 0, onHold: 0 },
        projectProgress: []
      };
    }

    let totalProgress = 0;
    const projectStatuses = { completed: 0, inProgress: 0, pending: 0, onHold: 0 };
    const projectProgress = [];

    projects.forEach(project => {
      // Calculate project progress based on tasks
      const totalTasks = project.steps 
        ? project.steps.reduce((acc, step) => acc + (step.tasks ? step.tasks.length : 0), 0) 
        : 0;
      const completedTasks = project.steps 
        ? project.steps.reduce((acc, step) => acc + (step.tasks ? step.tasks.filter(t => t.status === 'completed').length : 0), 0) 
        : 0;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      totalProgress += progressPercentage;
      
      // Categorize project status
      if (progressPercentage === 100) {
        projectStatuses.completed++;
      } else if (progressPercentage > 0) {
        projectStatuses.inProgress++;
      } else if (project.status === 'on-hold' || project.status === 'paused') {
        projectStatuses.onHold++;
      } else {
        projectStatuses.pending++;
      }

      // Add to project progress array
      projectProgress.push({
        name: project.name,
        progress: progressPercentage,
        status: project.status,
        priority: project.priority,
        teamSize: getProjectTeam(project).length
      });
    });

    const overallProductivity = Math.round(totalProgress / projects.length);

    return {
      overallProductivity,
      projectStatuses,
      projectProgress: projectProgress.sort((a, b) => b.progress - a.progress)
    };
  };


  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const res = await managerService.getAttendanceHistory();
        setAttendanceData(res);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);





  // Dashboard stats
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    totalProjects: 0,
    completedProjects: 0,
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

  useEffect(() => {
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
        
        // Calculate productivity data
        const productivity = calculateProductivityData(projects);
        setProductivityData(productivity);
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

  // Refresh projects data function
  const refreshProjects = async () => {
    try {
      setLoading(true);
      const res = await managerService.getProjects();
      const projects = extractData(res);
      setProjectsData(projects);
      
      // Calculate productivity data
      const productivity = calculateProductivityData(projects);
      setProductivityData(productivity);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userObj = payload.user || payload;
        setManagerUser({ _id: userObj._id || userObj.id, ...userObj });
      } catch (e) {
        console.error('Failed to decode token for manager user', e);
      }
    }
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  // Helper function to determine if employee is online based on punch in status
  const isEmployeeOnline = (employee) => {
    // Check if employee has punched in today and not punched out
    if (employee.isPunchedIn) {
      return true;
    }
    
    // Check if employee has a punchIn record for today and no punchOut
    if (employee.todayPunchIn && !employee.todayPunchOut) {
      return true;
    }
    
    // Check attendance data structure
    if (employee.attendance && employee.attendance.today) {
      const attendance = employee.attendance.today;
      if (attendance.punchIn && !attendance.punchOut) {
        return true;
      }
    }
    
    // If employee status is explicitly set to 'Online' (from punch in/out)
    if (employee.status === 'Online') {
      return true;
    }
    
    // Default to offline
    return false;
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };


  const handleChatWithEmployee = (employee) => {
    setChatEmployee(employee);
    setShowChat(true);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setChatEmployee(null);
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
        return 'bg-white text-black';
      case 'in-progress':
        return 'bg-gray-200 text-black';
      case 'pending':
        return 'bg-gray-300 text-black';
      default:
        return 'bg-gray-100 text-black';
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
    <div className="min-h-screen bg-gray-50">
     

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Header Section */}
      

      {/* Main Content */}
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome {managerName || 'Manager'}</h2>
          
          {/* User Profile Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-600">
                  {managerName ? managerName.charAt(0).toUpperCase() : 'M'}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{managerName || 'Manager'}</h3>
                <p className="text-gray-600">Manager</p>
                
              </div>
            </div>
          
          </div>
          
          {/* Information Cards Grid */}
        
        </div>

       

        {/* Search and Filter Section */}
      

        

        {/* Employee List Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Employee List</h2>
            <div className="flex items-center space-x-2">
              <Link to="/assign-project" className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all duration-200 no-underline">
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </Link>
              <Link to="/assign-task" className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-xl shadow-md hover:bg-gray-100 transition-all duration-200 no-underline">
                <Plus className="w-4 h-4" />
                <span>Assign Task</span>
              </Link>
            </div>
          </div>
          
          <div className="p-5">
            {/* Table Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <select className="bg-white text-gray-800 border border-gray-300 rounded px-2 py-1 text-sm">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Search:</span>
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="bg-white text-gray-800 border border-gray-300 rounded px-3 py-1 text-sm w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading employees...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No employees found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        {/* <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" /> */}
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          NAME
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          EMAIL
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          ROLE
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          STATUS
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => {
                      // Determine online/offline status based on punch in
                      const isOnline = isEmployeeOnline(employee);
                      const statusText = isOnline ? 'Online' : 'Offline';
                      const statusColor = isOnline ? 'bg-green-500' : 'bg-gray-500';
                      const statusDotColor = isOnline ? 'bg-green-400' : 'bg-gray-400';
                      
                      return (
                        <tr key={employee._id} className="bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors">
                          <td className="px-6 py-4">
                            {/* <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" /> */}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                             
                              <div>
                                <div className="text-sm font-medium text-gray-800">{employee.name}</div>
                                <div className="text-xs text-gray-400">{employee.position || employee.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {employee.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 capitalize">{employee.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800 ${statusColor}`}>
                              <span className={`w-2 h-2 rounded-full mr-2 ${statusDotColor}`}></span>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewEmployee(employee)}
                                className="text-gray-400 hover:text-gray-800 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleChatWithEmployee(employee)}
                                className="text-gray-400 hover:text-gray-800 transition-colors"
                                title="Chat"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button 
                                className="text-gray-400 hover:text-gray-800 transition-colors"
                                title="More Actions"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredEmployees.length}</span> of <span className="font-medium">{filteredEmployees.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm text-gray-600 bg-gray-800 border border-gray-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-800 bg-blue-600 border border-blue-600 rounded">
                      1
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 bg-gray-800 border border-gray-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Projects</h2>
            <div className="flex space-x-2">
              <button
                onClick={refreshProjects}
                disabled={loading}
                className="flex items-center space-x-1 text-gray-800 hover:text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <span className="text-gray-400">|</span>
              <Link to="/assign-project" className="text-gray-800 hover:text-gray-600 font-medium no-underline">
                Create Project
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/assign-project-to-team-leader" className="text-gray-600 hover:text-gray-800 font-medium no-underline">
                Assign to Team Leader
              </Link>
              <span className="text-gray-400">|</span>
              <Link to="/projects" className="text-gray-800 hover:text-gray-600 font-medium no-underline">View All</Link>
            </div>
          </div>
          
          <div className="p-5">
            {/* Table Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show</span>
                <select className="bg-white text-gray-800 border border-gray-300 rounded px-2 py-1 text-sm">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-600">entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Search:</span>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="bg-white text-gray-800 border border-gray-300 rounded px-3 py-1 text-sm w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading projects...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No projects found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        {/* <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" /> */}
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          PROJECT NAME
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          START DATE
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          END DATE
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          STATUS
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          PROGRESS
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          PRIORITY
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="flex items-center">
                          TEAM
                          <svg className="w-3 h-3 ml-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.075 2.075 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.072 2.072 0 0 0-1.846-1.087Z"/>
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => {
                      // Calculate project progress
                      const totalTasks = project.steps 
                        ? project.steps.reduce((acc, step) => acc + (step.tasks ? step.tasks.length : 0), 0) 
                        : 0;
                      const completedTasks = project.steps 
                        ? project.steps.reduce((acc, step) => acc + (step.tasks ? step.tasks.filter(t => t.status === 'completed').length : 0), 0) 
                        : 0;
                      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                      
                      // Get project team
                      const projectTeam = getProjectTeam(project);
                      
                      // Determine priority color
                      const getPriorityColor = (priority) => {
                        switch (priority?.toLowerCase()) {
                          case 'high':
                            return 'bg-red-500 text-gray-800';
                          case 'medium':
                            return 'bg-yellow-500 text-gray-800';
                          case 'low':
                            return 'bg-green-500 text-gray-800';
                          default:
                            return 'bg-gray-500 text-gray-800';
                        }
                      };
                      
                      return (
                        <tr key={project._id} className="bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors">
                          <td className="px-6 py-4">
                            {/* <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" /> */}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="text-sm font-medium text-gray-800">{project.title}</div>
                                <div className="text-xs text-gray-400 line-clamp-1">{project.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: '2-digit' 
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {project.deadline ? new Date(project.deadline).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: '2-digit' 
                            }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-800 ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{progressPercentage}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority || 'Medium'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center -space-x-2">
                              {projectTeam.slice(0, 3).map((member, index) => (
                                <UserAvatar 
                                  key={member._id} 
                                  name={member.name}
                                  className="w-6 h-6 border-2 border-gray-800"
                                />
                              ))}
                              {projectTeam.length > 3 && (
                                <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                                  <span className="text-xs text-gray-800">+{projectTeam.length - 3}</span>
                                </div>
                              )}
                              {projectTeam.length === 0 && (
                                <span className="text-xs text-gray-400">No team</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link 
                                to={`/project/${project._id}`}
                                className="text-gray-400 hover:text-gray-800 transition-colors"
                                title="View Project"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link 
                                to={`/assign-project/${project._id}`}
                                className="text-gray-400 hover:text-gray-800 transition-colors"
                                title="Edit Project"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </Link>
                              <button 
                                className="text-gray-400 hover:text-gray-800 transition-colors"
                                title="More Actions"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredProjects.length}</span> of <span className="font-medium">{filteredProjects.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm text-gray-600 bg-gray-800 border border-gray-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                      Previous
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-800 bg-blue-600 border border-blue-600 rounded">
                      1
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 bg-gray-800 border border-gray-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Productivity Graph Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Company Productivity</span>
            </h2>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  {productivityData.overallProductivity}%
                </div>
                <div className="text-sm text-gray-600">Overall Productivity</div>
              </div>
              <button
                onClick={refreshProjects}
                disabled={loading}
                className="flex items-center space-x-1 text-gray-800 hover:text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Status Distribution */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Status Distribution</h3>
                
                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-400">{productivityData.projectStatuses.completed}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{productivityData.projectStatuses.inProgress}</div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-yellow-400">{productivityData.projectStatuses.pending}</div>
                        <div className="text-sm text-gray-600">Pending</div>
                      </div>
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-red-400">{productivityData.projectStatuses.onHold}</div>
                        <div className="text-sm text-gray-600">On Hold</div>
                      </div>
                      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Ring */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - productivityData.overallProductivity / 100)}`}
                        className="text-green-400 transition-all duration-1000 ease-in-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{productivityData.overallProductivity}%</div>
                        <div className="text-xs text-gray-400">Complete</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Progress Chart */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Progress Overview</h3>
                
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {productivityData.projectProgress.length > 0 ? (
                    productivityData.projectProgress.map((project, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-gray-600/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-gray-800 font-medium truncate">{project.name}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {project.priority || 'Low'}
                            </span>
                            <span className="text-sm text-gray-400">{project.teamSize} members</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                                project.progress === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                project.progress > 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                project.progress > 25 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-red-500 to-pink-500'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-800 min-w-[3rem] text-right">
                            {project.progress}%
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                          <span className="capitalize">{project.status}</span>
                          <span>{project.progress === 100 ? 'Completed' : 'In Progress'}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-gray-400">No projects available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Management Section */}
        <TaskList />

      </div>

      {/* Employee Detail Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-800/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Employee Details</h3>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-600 hover:text-gray-800"
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
              <h4 className="font-semibold text-black">{selectedEmployee.name}</h4>
              <p className="text-sm text-gray-600">{selectedEmployee.position || selectedEmployee.role}</p>
              <p className="text-xs text-gray-500">{selectedEmployee.email}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedEmployee.status === 'active' ? 'bg-white text-black border border-gray-300' : 'bg-gray-200 text-black'
                }`}>
                  {selectedEmployee.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="text-black">{selectedEmployee.role}</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button className="flex-1 bg-gray-800 text-gray-800 py-2 rounded-xl hover:bg-gray-700 transition-all duration-200">
                View Profile
              </button>
              <button 
                onClick={() => {
                  handleChatWithEmployee(selectedEmployee);
                  setShowEmployeeModal(false);
                }}
                className="flex-1 bg-gray-200 text-black py-2 rounded-xl hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Todo Calendar Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-blue-400" />
                <span>Todo Calendar</span>
              </h2>
            </div>
            <div className="min-h-[500px] overflow-visible">
              <TodoCalendar isCompact={true} />
            </div>
          </div>
        </div>



      {/* Chat Panel */}
      {showChat && chatEmployee && managerUser && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-gray-800 font-semibold">
                  {chatEmployee.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{chatEmployee.name}</h3>
                  <p className="text-sm text-gray-500">{chatEmployee.role}</p>
                </div>
              </div>
              <button
                onClick={handleCloseChat}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            {/* Chat Component */}
            <div className="flex-1 overflow-hidden">
              <Chat 
                currentUser={managerUser} 
                otherUser={chatEmployee} 
                style={{ height: '100%', width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}