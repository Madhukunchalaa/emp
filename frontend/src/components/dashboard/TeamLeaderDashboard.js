import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import './Dashboard.css';
import { Briefcase, CheckSquare, Users, TrendingUp, FileText, Plus, Send, Clock, UserPlus, Eye, Delete, History } from 'lucide-react';
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-message">{getGreeting()}, Team Leader!</div>
        <div className="sub-header">Here's your personalized workspace for today.</div>
      </div>
      {/* Stats Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="card-icon-bg"><Briefcase className="card-icon" /></div>
          <h3>Total Tasks</h3>
          <div className="stat-main">{stats.totalTasks}</div>
          <p>All tasks assigned to your team</p>
        </div>
        <div className="stat-card">
          <div className="card-icon-bg"><CheckSquare className="card-icon" /></div>
          <h3>Completed</h3>
          <div className="stat-main">{stats.completedTasks}</div>
          <p>Tasks finished</p>
        </div>
        <div className="stat-card">
          <div className="card-icon-bg"><TrendingUp className="card-icon" /></div>
          <h3>Pending</h3>
          <div className="stat-main">{stats.pendingTasks}</div>
          <p>Tasks to complete</p>
        </div>
        <div className="stat-card">
          <div className="card-icon-bg"><Users className="card-icon" /></div>
          <h3>Team Members</h3>
          <div className="stat-main">{stats.teamMembers}</div>
          <p>People in your team</p>
        </div>
        <div className="stat-card">
          <div className="card-icon-bg"><FileText className="card-icon" /></div>
          <h3>Projects</h3>
          <div className="stat-main">{stats.projects}</div>
          <p>Projects assigned by manager</p>
        </div>
      </div>
      {/* Punch In/Out */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button className="punch-button punch-in" onClick={() => handlePunch('in')}><Clock style={{marginRight: 8}} size={18}/>Punch In</button>
        <button className="punch-button punch-out" onClick={() => handlePunch('out')}><Clock style={{marginRight: 8}} size={18}/>Punch Out</button>
        {punchStatus && <span style={{ color: 'green', marginLeft: 16 }}>{punchStatus}</span>}
      </div>
      {/* Projects Section */}
      <div className="projects-section">
        <div className="section-title">My Projects</div>
        {projects.length === 0 ? <p>No projects assigned.</p> : (
          <div className="projects-grid">
            {projects.map(proj => (
              <div className="project-card" key={proj._id}>
                <div className="project-card-header">
                  <h4>{proj.title}</h4>
                  <span className={`status-pill status-${proj.status?.toLowerCase().replace(/ /g, '-')}`}>{proj.status}</span>
                </div>
                <div className="project-description">{proj.description}</div>
                <div className="project-progress">
                  <p>Progress: {proj.progress || 0}%</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${proj.progress || 0}%` }}></div>
                  </div>
                </div>
                <div className="project-footer">
                  <p>Deadline: {proj.deadline ? proj.deadline.slice(0,10) : 'N/A'}</p>
                  <IconButton size="small" onClick={() => openManageTeam(proj)} title="Manage Team"><UserPlus /></IconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Team Tasks Section */}
      <div className="projects-section">
        <div className="section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Team Tasks</span>
          <button className="update-button" onClick={() => setAssignTaskOpen(true)}><Plus size={18} style={{marginRight: 6}}/>Assign Task</button>
        </div>
        {tasks.length === 0 ? <p>No tasks assigned.</p> : (
          <div className="projects-grid">
            {tasks.map(task => (
              <div className="project-card" key={task._id}>
                <div className="project-card-header">
                  <h4>{task.title}</h4>
                  <span className={`status-pill status-${task.status?.toLowerCase().replace(/ /g, '-')}`}>{task.status}</span>
                </div>
                <div className="project-description">{task.description}</div>
                <div className="project-footer">
                  <p>Assigned to: {task.assigneeName || task.assignee || 'N/A'}</p>
                  <p>Deadline: {task.deadline ? task.deadline.slice(0,10) : 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Team Members Section */}
      <div className="projects-section">
        <div className="section-title">Team Members</div>
        {teamMembers.length === 0 ? <p>No team members.</p> : (
          <div className="projects-grid">
            {teamMembers.map(member => (
              <div className="project-card" key={member._id}>
                <div className="project-card-header">
                  <h4>{member.name}</h4>
                  <span className="status-pill status-in-progress">{member.role}</span>
                </div>
                <div className="project-description">{member.email}</div>
                <div className="project-footer">
                  <IconButton size="small" onClick={() => openViewTasks(member)} title="View Tasks"><Eye /></IconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Activity Log Section */}
      <div className="projects-section">
        <div className="section-title"><History style={{marginRight: 8}}/>Activity Log</div>
        {activityLog.length === 0 ? <p>No recent activity.</p> : (
          <List dense>
            {activityLog.map((log, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={log.message} secondary={log.timestamp ? new Date(log.timestamp).toLocaleString() : ''} />
              </ListItem>
            ))}
          </List>
        )}
      </div>
      {/* Report to Manager Section */}
      <div className="projects-section">
        <div className="section-title">Report to Manager</div>
        <button className="update-button" onClick={() => setReportOpen(true)}><Send size={18} style={{marginRight: 6}}/>Send Report</button>
      </div>
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