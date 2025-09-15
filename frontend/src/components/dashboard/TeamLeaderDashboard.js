import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
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
import { teamLeaderService } from '../../services/api';

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
        projects: projRes.data.length
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const res = await teamLeaderService.getActivityLog();
      setActivityLog(res.data || []);
    } catch (err) {
      console.error('Error fetching activity log:', err);
    }
  };

  const handlePunch = async (type) => {
    try {
      if (type === 'in') {
        await teamLeaderService.punchIn();
        setIsPunchedIn(true);
        setPunchStatus('Successfully punched in!');
      } else {
        await teamLeaderService.punchOut();
        setIsPunchedIn(false);
        setPunchStatus('Successfully punched out!');
      }
      setTimeout(() => setPunchStatus(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Punch operation failed');
    }
  };

  const handleAssignTask = async () => {
    try {
      await teamLeaderService.assignTask(assignTaskData);
      setSuccess('Task assigned successfully!');
      setAssignTaskOpen(false);
      setAssignTaskData({ member: '', title: '', description: '', deadline: '' });
      fetchAllData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign task');
    }
  };

  const openManageTeam = async (project) => {
    setSelectedProject(project);
    setProjectTeam(project.team || []);
    try {
      const res = await teamLeaderService.getAvailableEmployees();
      setEmployeePool(res.data);
    } catch (err) {
      setError('Failed to load available employees');
    }
    setManageTeamOpen(true);
  };

  const handleAddToTeam = async (empId) => {
    try {
      await teamLeaderService.addToTeam(selectedProject._id, empId);
      setSuccess('Employee added to team!');
      openManageTeam(selectedProject); // Refresh
    } catch (err) {
      setError('Failed to add employee to team');
    }
  };

  const handleRemoveFromTeam = async (empId) => {
    try {
      await teamLeaderService.removeFromTeam(selectedProject._id, empId);
      setSuccess('Employee removed from team!');
      openManageTeam(selectedProject); // Refresh
    } catch (err) {
      setError('Failed to remove employee from team');
    }
  };

  const openViewTasks = async (member) => {
    setSelectedMember(member);
    try {
      const res = await teamLeaderService.getMemberTasks(member._id);
      setMemberTasks(res.data);
    } catch (err) {
      setError('Failed to load member tasks');
    }
    setViewTasksOpen(true);
  };

  const handleReportFieldChange = (field, value) => {
    setReportFields(prev => ({ ...prev, [field]: value }));
  };

  const handleSendReport = async () => {
    try {
      await teamLeaderService.sendReport({
        ...reportData,
        ...reportFields
      });
      setSuccess('Report sent successfully!');
      setReportOpen(false);
      setReportData({ title: '', content: '' });
      setReportFields({ teamUpdates: '', taskSummary: '', challenges: '', completionStatus: '' });
    } catch (err) {
      setError('Failed to send report');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Status color helper
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{background: 'linear-gradient(135deg, #0f172a, #1e293b)'}}>
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-slate-800/90 backdrop-blur-lg shadow-xl border-r border-slate-700/50 p-6 fixed left-0 top-0 z-20">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full" />
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Team Leader</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 mb-2">Team Leader Dashboard</h1>
          <div className="text-xs text-slate-400">Manage your team and projects</div>
        </div>
        <div className="mb-8">
          <div className="text-slate-200 font-semibold mb-2">Stats</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400"><FileText className="w-4 h-4" /> {stats.totalTasks} Tasks</div>
            <div className="flex items-center gap-2 text-green-400"><CheckCircle className="w-4 h-4" /> {stats.completedTasks} Completed</div>
            <div className="flex items-center gap-2 text-yellow-400"><Clock className="w-4 h-4" /> {stats.pendingTasks} Pending</div>
            <div className="flex items-center gap-2 text-purple-400"><Users className="w-4 h-4" /> {stats.teamMembers} Members</div>
            <div className="flex items-center gap-2 text-orange-400"><Briefcase className="w-4 h-4" /> {stats.projects} Projects</div>
          </div>
        </div>
        <div className="mt-auto">
          <div className="text-xs text-slate-400">Logged in as</div>
          <div className="font-bold text-slate-200">{user.name}</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen flex flex-col">
        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-900/30 border border-red-500/50 text-red-300 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-900/30 border border-green-500/50 text-green-300 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        <div className="px-6 py-6">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">{getGreeting()}, {user.name}!</h2>
            <p className="text-slate-400">Manage your team and track project progress.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-7xl mb-8 mx-auto">
            <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-blue-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-100">{stats.totalTasks}</span>
              </div>
              <h3 className="font-semibold text-slate-100 mb-1">Total Tasks</h3>
              <p className="text-sm text-slate-400">All team tasks</p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-green-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-100">{stats.completedTasks}</span>
              </div>
              <h3 className="font-semibold text-slate-100 mb-1">Completed</h3>
              <p className="text-sm text-slate-400">Tasks finished</p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-yellow-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-100">{stats.pendingTasks}</span>
              </div>
              <h3 className="font-semibold text-slate-100 mb-1">Pending</h3>
              <p className="text-sm text-slate-400">Tasks to complete</p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-purple-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-100">{stats.teamMembers}</span>
              </div>
              <h3 className="font-semibold text-slate-100 mb-1">Team Members</h3>
              <p className="text-sm text-slate-400">People in your team</p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border-l-8 border-orange-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-slate-100">{stats.projects}</span>
              </div>
              <h3 className="font-semibold text-slate-100 mb-1">Projects</h3>
              <p className="text-sm text-slate-400">Assigned projects</p>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12 mx-auto">
            {/* Attendance Card */}
            <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-blue-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Clock className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Attendance</h3>
                  <p className="text-sm text-slate-400">Track your work hours</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2">Today's Status</p>
                {isPunchedIn ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Punched In</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-400">
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
            <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-pink-400 w-full flex flex-col justify-between animate-fade-in hover:scale-105 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">Report to Manager</h3>
                  <p className="text-sm text-slate-400">Send progress updates</p>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 mb-4">
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

          {/* Team Members Section */}
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-purple-400 w-full max-w-4xl mb-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">Team Members</h3>
                  <p className="text-sm text-slate-400">Manage your team</p>
                </div>
              </div>
              <button
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                onClick={() => setAssignTaskOpen(true)}
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Assign Task</span>
                </div>
              </button>
            </div>

            {teamMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-slate-400">No team members assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div key={member._id} className="bg-slate-700/60 backdrop-blur-lg rounded-xl p-4 border border-slate-600/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-100">{member.name}</h4>
                          <p className="text-sm text-slate-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openViewTasks(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Tasks"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status || 'Active'}
                      </span>
                      <span className="text-slate-400">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border-l-8 border-orange-400 w-full max-w-4xl mb-8 mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-100">Assigned Projects</h3>
                  <p className="text-sm text-slate-400">Manage project teams</p>
                </div>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-slate-400">No projects assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project._id} className="bg-slate-700/60 backdrop-blur-lg rounded-xl p-4 border border-slate-600/30 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-100">{project.title}</h4>
                        <p className="text-sm text-slate-400">{project.description}</p>
                      </div>
                      <button
                        onClick={() => openManageTeam(project)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <UserPlus className="w-4 h-4" />
                          <span>Manage Team</span>
                        </div>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className="text-slate-400">Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Assign Task Modal */}
      <Dialog open={assignTaskOpen} onClose={() => setAssignTaskOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task to Team Member</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Team Member"
            value={assignTaskData.member}
            onChange={(e) => setAssignTaskData({ ...assignTaskData, member: e.target.value })}
            fullWidth
            margin="normal"
          >
            {teamMembers.map((member) => (
              <MenuItem key={member._id} value={member._id}>
                {member.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Task Title"
            value={assignTaskData.title}
            onChange={(e) => setAssignTaskData({ ...assignTaskData, title: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={assignTaskData.description}
            onChange={(e) => setAssignTaskData({ ...assignTaskData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Deadline"
            type="datetime-local"
            value={assignTaskData.deadline}
            onChange={(e) => setAssignTaskData({ ...assignTaskData, deadline: e.target.value })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignTaskOpen(false)}>Cancel</Button>
          <Button onClick={handleAssignTask} variant="contained">Assign Task</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Team Modal */}
      <Dialog open={manageTeamOpen} onClose={() => setManageTeamOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Team for {selectedProject?.title}</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Current Team</h4>
              {projectTeam.length === 0 ? (
                <p className="text-slate-400">No team members assigned</p>
              ) : (
                <List dense>
                  {projectTeam.map((member) => (
                    <ListItem key={member._id}>
                      <ListItemText primary={member.name} secondary={member.email} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveFromTeam(member._id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Available Employees</h4>
              {employeePool.length === 0 ? (
                <p className="text-slate-400">No available employees</p>
              ) : (
                <List dense>
                  {employeePool.map((employee) => (
                    <ListItem key={employee._id}>
                      <ListItemText primary={employee.name} secondary={employee.email} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleAddToTeam(employee._id)}
                          color="primary"
                        >
                          <UserPlus />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </div>
          </div>
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