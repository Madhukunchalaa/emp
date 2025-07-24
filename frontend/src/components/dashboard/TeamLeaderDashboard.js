import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import './Dashboard.css';
import { 
  Briefcase, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  FileText, 
  Plus, 
  Send, 
  Clock, 
  UserPlus, 
  Eye, 
  Delete, 
  History,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
  Calendar,
  Target
} from 'lucide-react';
import jwtDecode from 'jwt-decode';
import { teamLeaderService, employeeService } from '../../services/api';

const TeamLeaderDashboard = () => {
  // Stats
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, teamMembers: 0, projects: 0 });
  // Data
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Punch In/Out
  const [punchStatus, setPunchStatus] = useState('');
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  // Assign Task
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [assignTaskData, setAssignTaskData] = useState({ member: '', title: '', description: '', deadline: '' });
  // Report
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState({ title: '', content: '' });
  // Manage Team
  const [manageTeamOpen, setManageTeamOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [employeePool, setEmployeePool] = useState([]);
  const [projectTeam, setProjectTeam] = useState([]);
  const [viewTasksOpen, setViewTasksOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberTasks, setMemberTasks] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [reportFields, setReportFields] = useState({ teamUpdates: '', taskSummary: '', challenges: '', completionStatus: '' });
  const [currentTeamLeaderId, setCurrentTeamLeaderId] = useState(null);
  const [user, setUser] = useState({ name: 'Team Leader' });

  useEffect(() => {
    fetchAllData();
    fetchActivityLog();
    // Get current TL ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userObj = decoded.user || decoded;
        setCurrentTeamLeaderId(userObj._id || userObj.id);
        setUser({ name: userObj.name || 'Team Leader' });
      } catch (e) {
        setCurrentTeamLeaderId(null);
      }
    }
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch team members
      const teamRes = await teamLeaderService.getTeamMembers();
      setTeamMembers(teamRes.data);
      
      // Fetch projects assigned to team leader
      const projRes = await teamLeaderService.getAssignedProjects();
      setProjects(projRes.data);
      
      // Fetch tasks assigned by team leader
      const taskRes = await teamLeaderService.getTeamTasks();
      setTasks(taskRes.data);
      
      // Stats
      const totalTasks = taskRes.data.length;
      const completedTasks = taskRes.data.filter(t => t.status === 'completed').length;
      const pendingTasks = taskRes.data.filter(t => t.status !== 'completed').length;
      setStats({
        totalTasks,
        completedTasks,
        pendingTasks,
        teamMembers: teamRes.data.length,
        projects: projRes.data.length,
      });
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const res = await teamLeaderService.getActivityLog();
      setActivityLog(res.data);
    } catch (err) {
      // Ignore log errors
    }
  };

  // Punch In/Out
  const handlePunch = async (type) => {
    setError(''); setPunchStatus('');
    try {
      if (type === 'in') {
        await employeeService.punchIn();
      } else {
        await employeeService.punchOut();
      }
      setPunchStatus(type === 'in' ? 'Punched In!' : 'Punched Out!');
    } catch (err) {
      setError('Failed to punch ' + type);
    }
  };

  // Assign Task
  const handleAssignTask = async () => {
    setError(''); setSuccess('');
    
    // Validate required fields
    if (!assignTaskData.member) {
      setError('Please select a team member');
      return;
    }
    if (!assignTaskData.title || assignTaskData.title.trim() === '') {
      setError('Please enter a task title');
      return;
    }
    if (!assignTaskData.deadline) {
      setError('Please select a deadline');
      return;
    }
    
    try {
      console.log('Sending task data:', assignTaskData);
      await teamLeaderService.createTask({
        teamMemberId: assignTaskData.member,
        title: assignTaskData.title,
        description: assignTaskData.description,
        deadline: assignTaskData.deadline,
      });
      setSuccess('Task assigned successfully!');
      setAssignTaskOpen(false);
      setAssignTaskData({ member: '', title: '', description: '', deadline: '' });
      fetchAllData();
    } catch (err) {
      console.error('Error assigning task:', err);
      setError(err.message || 'Failed to assign task');
    }
  };

  // Manage Team Modal logic
  const openManageTeam = async (project) => {
    setSelectedProject(project);
    setManageTeamOpen(true);
    try {
      // Fetch all employees (not in this project)
      const res = await teamLeaderService.getAvailableEmployees();
      setEmployeePool(res.data);
      // Fetch current team for this project
      const teamRes = await teamLeaderService.getProjectTeam(project._id);
      setProjectTeam(teamRes.data);
    } catch (err) {
      setError('Failed to fetch team data');
    }
  };
  const handleAddToTeam = async (empId) => {
    try {
      await teamLeaderService.addMemberToProject(selectedProject._id, empId);
      setSuccess('Employee added to team');
      // Refresh team
      const teamRes = await teamLeaderService.getProjectTeam(selectedProject._id);
      setProjectTeam(teamRes.data);
    } catch (err) {
      setError('Failed to add employee');
    }
  };
  const handleRemoveFromTeam = async (empId) => {
    try {
      await teamLeaderService.removeMemberFromProject(selectedProject._id, empId);
      setSuccess('Employee removed from team');
      // Refresh team
      const teamRes = await teamLeaderService.getProjectTeam(selectedProject._id);
      setProjectTeam(teamRes.data);
    } catch (err) {
      setError('Failed to remove employee');
    }
  };

  // View Tasks Modal logic
  const openViewTasks = async (member) => {
    setSelectedMember(member);
    setViewTasksOpen(true);
    try {
      const res = await teamLeaderService.getMemberTasks(member._id);
      setMemberTasks(res.data);
    } catch (err) {
      setError('Failed to fetch member tasks');
    }
  };

  // Enhanced Report Modal logic
  const handleReportFieldChange = (field, value) => {
    setReportFields(prev => ({ ...prev, [field]: value }));
  };
  const handleSendReport = async () => {
    setError(''); setSuccess('');
    try {
      await teamLeaderService.sendReport({
        ...reportData,
        ...reportFields
      });
      setSuccess('Report sent to manager!');
      setReportOpen(false);
      setReportData({ title: '', content: '' });
      setReportFields({ teamUpdates: '', taskSummary: '', challenges: '', completionStatus: '' });
    } catch (err) {
      setError('Failed to send report');
    }
  };

  // Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="min-h-screen flex bg-gray-100">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white/80 backdrop-blur-lg shadow-xl border-r border-white/30 p-6 fixed left-0 top-0 z-20">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full" />
              <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Team Leader</span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Team Leader Dashboard</h1>
            <div className="text-xs text-gray-500">Manage your team and projects</div>
          </div>
          <div className="mb-8">
            <div className="text-gray-700 font-semibold mb-2">Stats</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600"><FileText className="w-4 h-4" /> {stats.totalTasks} Tasks</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> {stats.completedTasks} Completed</div>
              <div className="flex items-center gap-2 text-yellow-600"><Clock className="w-4 h-4" /> {stats.pendingTasks} Pending</div>
              <div className="flex items-center gap-2 text-purple-600"><Users className="w-4 h-4" /> {stats.teamMembers} Members</div>
              <div className="flex items-center gap-2 text-orange-600"><Briefcase className="w-4 h-4" /> {stats.projects} Projects</div>
            </div>
          </div>
          <div className="mt-auto">
            <div className="text-xs text-gray-400">Logged in as</div>
            <div className="font-bold text-gray-700">{user.name}</div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 ml-0 md:ml-64 min-h-screen flex flex-col">
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

          <div className="px-6 py-6">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">{getGreeting()}, {user.name}!</h2>
              <p className="text-gray-600">Manage your team and track project progress.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-7xl mb-8 mx-auto">
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-blue-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.totalTasks}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Total Tasks</h3>
                <p className="text-sm text-gray-500">All team tasks</p>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-green-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.completedTasks}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Completed</h3>
                <p className="text-sm text-gray-500">Tasks finished</p>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-yellow-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.pendingTasks}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Pending</h3>
                <p className="text-sm text-gray-500">Tasks to complete</p>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-purple-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.teamMembers}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Team Members</h3>
                <p className="text-sm text-gray-500">People in your team</p>
              </div>

              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-orange-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{stats.projects}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">Projects</h3>
                <p className="text-sm text-gray-500">Assigned projects</p>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12 mx-auto">
              {/* Attendance Card */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-blue-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Clock className="w-5 h-5 text-white"/>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Attendance</h3>
                    <p className="text-sm text-gray-600">Track your work hours</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Today's Status</p>
                  {isPunchedIn ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Punched In</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="font-medium">Ready to start your day</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    onClick={() => handlePunch('in')}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <LogIn className="w-4 h-4" />
                      <span>Punch In</span>
                    </div>
                  </button>
                  <button
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    onClick={() => handlePunch('out')}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Punch Out</span>
                    </div>
                  </button>
                </div>
                {punchStatus && (
                  <div className="mt-3 text-sm text-green-600 font-medium">{punchStatus}</div>
                )}
              </div>

              {/* Report Card */}
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-pink-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Report to Manager</h3>
                    <p className="text-sm text-gray-600">Send progress updates</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  Share team progress and project updates with your manager.
                </p>

                <button
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  onClick={() => setReportOpen(true)}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Send Report</span>
                  </div>
                </button>
              </div>
            </div>
            {/* Projects Section */}
            <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 max-w-7xl mx-auto my-16 animate-fade-in">
              <div className="flex items-center justify-between px-10 py-8 border-b border-white/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">My Projects</h2>
                    <p className="text-sm text-gray-600">Projects assigned by your manager</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {projects.length} project{projects.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="p-10">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading your projects...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No projects assigned yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Your manager will assign projects here.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((proj) => (
                      <div 
                        key={proj._id}
                        className="relative bg-white/90 backdrop-blur rounded-2xl shadow-xl border-l-8 border-blue-400 p-6 hover:shadow-2xl hover:bg-white transition-all duration-300 cursor-pointer group animate-fade-in"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-800 line-clamp-2">{proj.title}</h4>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(proj.status)}`}>
                            {proj.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{proj.description}</p>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium text-gray-800">{proj.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${proj.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-xs text-gray-500 mb-4">
                          {proj.deadline && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(proj.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => openManageTeam(proj)}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                          >
                            <UserPlus className="w-4 h-4" />
                            Manage Team
                          </button>
                        </div>

                        {/* Add a subtle animated bar at the bottom on hover */}
                        <div className="absolute left-0 bottom-0 h-1 w-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-2xl" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            {/* Team Tasks Section */}
            <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 max-w-7xl mx-auto my-16 animate-fade-in">
              <div className="flex items-center justify-between px-10 py-8 border-b border-white/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckSquare className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Team Tasks</h2>
                    <p className="text-sm text-gray-600">Tasks assigned to your team members</p>
                  </div>
                </div>
                <button
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  onClick={() => setAssignTaskOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Assign Task
                </button>
              </div>
              
              <div className="p-10">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading team tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tasks assigned yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Start assigning tasks to your team members.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tasks.map((task) => (
                      <div 
                        key={task._id}
                        className="relative bg-white/90 backdrop-blur rounded-2xl shadow-xl border-l-8 border-green-400 p-6 hover:shadow-2xl hover:bg-white transition-all duration-300 cursor-pointer group animate-fade-in"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-800 line-clamp-2">{task.title}</h4>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>
                        
                        <div className="space-y-2 text-xs text-gray-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-3 h-3" />
                            <span>Assigned to: {task.assigneeName || task.assignee || 'N/A'}</span>
                          </div>
                          {task.deadline && (
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-3 h-3" />
                              <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Add a subtle animated bar at the bottom on hover */}
                        <div className="absolute left-0 bottom-0 h-1 w-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-2xl" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            {/* Team Members Section */}
            <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 max-w-7xl mx-auto my-16 animate-fade-in">
              <div className="flex items-center justify-between px-10 py-8 border-b border-white/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Team Members</h2>
                    <p className="text-sm text-gray-600">Your team members and their details</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="p-10">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading team members...</p>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No team members assigned yet.</p>
                    <p className="text-sm text-gray-400 mt-2">Team members will appear here when assigned.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers.map((member) => (
                      <div 
                        key={member._id}
                        className="relative bg-white/90 backdrop-blur rounded-2xl shadow-xl border-l-8 border-purple-400 p-6 hover:shadow-2xl hover:bg-white transition-all duration-300 cursor-pointer group animate-fade-in"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-800 line-clamp-2">{member.name}</h4>
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-800">
                            {member.role}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">{member.email}</p>
                        
                        <div className="flex justify-end">
                          <button
                            onClick={() => openViewTasks(member)}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Tasks
                          </button>
                        </div>

                        {/* Add a subtle animated bar at the bottom on hover */}
                        <div className="absolute left-0 bottom-0 h-1 w-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-b-2xl" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
            {/* Activity Log Section */}
            <section className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 max-w-7xl mx-auto my-16 animate-fade-in">
              <div className="flex items-center justify-between px-10 py-8 border-b border-white/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <History className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Activity Log</h2>
                    <p className="text-sm text-gray-600">Recent team activities and updates</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {activityLog.length} activit{activityLog.length !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
              </div>
              
              <div className="p-10">
                {activityLog.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity.</p>
                    <p className="text-sm text-gray-400 mt-2">Team activities will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activityLog.map((log, idx) => (
                      <div 
                        key={idx}
                        className="bg-white/90 backdrop-blur rounded-xl shadow-lg border-l-4 border-orange-400 p-4 hover:shadow-xl transition-all duration-300"
                      >
                        <p className="text-gray-800 font-medium mb-1">{log.message}</p>
                        {log.timestamp && (
                          <p className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
      </>
      {/* Assign Task Modal */}
      <Dialog open={assignTaskOpen} onClose={() => setAssignTaskOpen(false)}>
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Team Member"
            value={assignTaskData.member}
            onChange={e => setAssignTaskData({ ...assignTaskData, member: e.target.value })}
            fullWidth
            margin="normal"
          >
            {teamMembers.map(member => (
              <MenuItem key={member._id} value={member._id}>{member.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Task Title"
            value={assignTaskData.title}
            onChange={e => setAssignTaskData({ ...assignTaskData, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={assignTaskData.description}
            onChange={e => setAssignTaskData({ ...assignTaskData, description: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Deadline"
            type="date"
            value={assignTaskData.deadline}
            onChange={e => setAssignTaskData({ ...assignTaskData, deadline: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignTask} variant="contained">Assign</Button>
        </DialogActions>
      </Dialog>
      {/* Manage Team Modal */}
      <Dialog open={manageTeamOpen} onClose={() => setManageTeamOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Team for {selectedProject?.title}</DialogTitle>
        <DialogContent>
          <div style={{marginBottom: 16}}><b>Current Team:</b></div>
          <List dense>
            {projectTeam.map(member => (
              <ListItem key={member._id}>
                <ListItemText primary={member.name} secondary={member.email} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveFromTeam(member._id)} title="Remove"><Delete /></IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <div style={{margin: '16px 0'}}><b>Add Employee:</b></div>
          <TextField
            select
            label="Select Employee"
            value=""
            onChange={e => handleAddToTeam(e.target.value)}
            fullWidth
          >
            {employeePool.map(emp => (
              <MenuItem key={emp._id} value={emp._id}>
                {emp.name} ({emp.email})
                {emp.teamLeaderId && (
                  <span style={{ color: 'gray', fontSize: 12, marginLeft: 8 }}>
                    {emp.teamLeaderId === currentTeamLeaderId
                      ? ' (Already in your team)'
                      : ' (Assigned to another TL)'}
                  </span>
                )}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageTeamOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* View Tasks Modal */}
      <Dialog open={viewTasksOpen} onClose={() => setViewTasksOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tasks for {selectedMember?.name}</DialogTitle>
        <DialogContent>
          {memberTasks.length === 0 ? <p>No tasks assigned.</p> : (
            <List dense>
              {memberTasks.map(task => (
                <ListItem key={task._id}>
                  <ListItemText
                    primary={task.title}
                    secondary={`Status: ${task.status} | Progress: ${task.progressNotes || 'N/A'}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewTasksOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Report Modal */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)}>
        <DialogTitle>Send Report to Manager</DialogTitle>
        <DialogContent>
          <TextField
            label="Report Title"
            value={reportData.title}
            onChange={e => setReportData({ ...reportData, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Content"
            value={reportData.content}
            onChange={e => setReportData({ ...reportData, content: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            label="Team Updates"
            value={reportFields.teamUpdates}
            onChange={e => handleReportFieldChange('teamUpdates', e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            label="Task Status Summary"
            value={reportFields.taskSummary}
            onChange={e => handleReportFieldChange('taskSummary', e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            label="Challenges Faced"
            value={reportFields.challenges}
            onChange={e => handleReportFieldChange('challenges', e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            label="Project Completion Status"
            value={reportFields.completionStatus}
            onChange={e => handleReportFieldChange('completionStatus', e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button onClick={handleSendReport} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>
      {/* Notifications */}
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess('')}>
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default TeamLeaderDashboard; 