import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  Tab,
  Tabs,
  Card,
  CardContent,
  Avatar,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  fetchEmployeeProjects,
  updateProjectStatus,
  updateProjectComment,
  punchIn,
  punchOut,
  fetchAttendance,
  clearError,
  clearSuccess,
} from '../../store/slices/employeeSlice';
import api from '../../services/api';

const GlassCard = ({ children, sx = {}, ...props }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.paper, 0.4)})`,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: '20px',
        boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 16px 48px ${alpha(theme.palette.common.black, 0.15)}`,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

const StatCard = ({ icon, title, value, subtitle, color = 'primary', delay = 0 }) => (
  <Zoom in timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
    <GlassCard>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="h6" fontWeight="600" sx={{ mt: 1 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              background: `linear-gradient(135deg, ${alpha('#667eea', 0.2)}, ${alpha('#764ba2', 0.2)})`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </GlassCard>
  </Zoom>
);

const AnimatedTab = ({ label, icon, ...props }) => (
  <Tab
    label={
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography variant="body2" fontWeight="600">
          {label}
        </Typography>
      </Box>
    }
    sx={{
      minHeight: 64,
      textTransform: 'none',
      borderRadius: '12px',
      mx: 0.5,
      transition: 'all 0.3s ease',
      '&.Mui-selected': {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        '& .MuiTypography-root': {
          color: 'white',
        },
      },
    }}
    {...props}
  />
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  
  // Get data from Redux store with default values
  const { projects = [], attendance = null, loading = false, error = null, success = null } = useSelector((state) => state.employee || {});
  const { user = null } = useSelector((state) => state.auth || {});
  
  // Initialize state variables with default values
  const [tabValue, setTabValue] = useState(0);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newComment, setNewComment] = useState('');
  const [dailyUpdateDialogOpen, setDailyUpdateDialogOpen] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [dailyComments, setDailyComments] = useState('');
  const [todayUpdate, setTodayUpdate] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchEmployeeProjects());
    dispatch(fetchAttendance());
  }, [dispatch]);

  // Update daily tasks when projects change
  useEffect(() => {
    if (Array.isArray(projects)) {
      const tasks = projects.map(project => ({
        project: project._id || `project-${Math.random()}`,
        title: project.title || 'Untitled Project',
        status: project.status || 'In Progress',
        hoursSpent: 0,
        description: ''
      }));
      setDailyTasks(tasks);
    } else {
      setDailyTasks([]);
    }
  }, [projects]);

  // Clear error and success messages after 5 seconds
  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000);
    }
    if (success) {
      setTimeout(() => dispatch(clearSuccess()), 5000);
    }
  }, [error, success, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleStatusDialogOpen = (project) => {
    setSelectedProject(project);
    setNewStatus(project.status);
    setStatusDialogOpen(true);
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
    setSelectedProject(null);
    setNewStatus('');
  };

  const handleCommentDialogOpen = (project) => {
    setSelectedProject(project);
    setNewComment(project.comment || '');
    setCommentDialogOpen(true);
  };

  const handleCommentDialogClose = () => {
    setCommentDialogOpen(false);
    setSelectedProject(null);
    setNewComment('');
  };

  const handleStatusUpdate = () => {
    if (selectedProject && newStatus) {
      dispatch(updateProjectStatus({ projectId: selectedProject._id, status: newStatus }));
      handleStatusDialogClose();
    }
  };

  const handleCommentUpdate = () => {
    if (selectedProject) {
      dispatch(updateProjectComment({ projectId: selectedProject._id, comment: newComment }));
      handleCommentDialogClose();
    }
  };

  const handlePunchIn = () => {
    dispatch(punchIn());
  };

  const handlePunchOut = () => {
    dispatch(punchOut());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Started':
        return 'default';
      case 'In Progress':
        return 'primary';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleDailyUpdateDialogOpen = () => {
    setDailyUpdateDialogOpen(true);
  };

  const handleDailyUpdateDialogClose = () => {
    setDailyUpdateDialogOpen(false);
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...dailyTasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value,
      status: updatedTasks[index].status || 'In Progress'
    };
    setDailyTasks(updatedTasks);
    
    // Update total hours
    const total = updatedTasks.reduce((sum, task) => sum + (parseFloat(task.hoursSpent) || 0), 0);
    setTotalHours(total);
  };

  const handleSubmitDailyUpdate = async () => {
    try {
      const updateData = {
        tasks: dailyTasks.map(task => ({
          project: task.project,
          status: task.status || 'In Progress',
          hoursSpent: parseFloat(task.hoursSpent) || 0,
          description: task.description || 'No description provided'
        })),
        totalHours,
        comments: dailyComments || 'No additional comments'
      };

      await api.post('/employee/daily-update', updateData);
      setDailyUpdateDialogOpen(false);
      setDailyTasks([]);
      setTotalHours(0);
      setDailyComments('');
    } catch (error) {
      console.error('Error submitting daily update:', error);
    }
  };

  const renderProjects = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No projects assigned yet
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Deadline</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project._id}>
                <TableCell>{project.title}</TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(project.deadline).toLocaleDateString()}
                </TableCell>
                <TableCell>{project.comment || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={() => handleStatusDialogOpen(project)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Add Comment">
                      <IconButton
                        size="small"
                        onClick={() => handleCommentDialogOpen(project)}
                      >
                        <CommentIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Show loading state
  if (!projects || !user) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container>
        <Box mt={4}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  console.log('Rendering dashboard with projects:', projects);
  console.log('Current daily tasks:', dailyTasks);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Header Section */}
        <Fade in timeout={800}>
          <Box mb={4}>
            <Typography 
              variant="h3" 
              fontWeight="bold" 
              color="white" 
              textAlign="center"
              sx={{
                textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                mb: 1,
              }}
            >
              Employee Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              color="rgba(255,255,255,0.8)" 
              textAlign="center"
            >
              Welcome back, {user.name}! 🚀
            </Typography>
          </Box>
        </Fade>

        {/* Error/Success Messages */}
        {error && (
          <Slide direction="down" in mountOnEnter unmountOnExit>
            <Box mb={3}>
              <GlassCard sx={{ borderLeft: '4px solid #f44336' }}>
                <CardContent>
                  <Typography color="error" fontWeight="600">
                    {error}
                  </Typography>
                </CardContent>
              </GlassCard>
            </Box>
          </Slide>
        )}
        
        {success && (
          <Slide direction="down" in mountOnEnter unmountOnExit>
            <Box mb={3}>
              <GlassCard sx={{ borderLeft: '4px solid #4caf50' }}>
                <CardContent>
                  <Typography color="success.main" fontWeight="600">
                    {success}
                  </Typography>
                </CardContent>
              </GlassCard>
            </Box>
          </Slide>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
              title="Total Projects"
              value={projects?.length || 0}
              subtitle="Assigned to you"
              color="primary"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
              title="Completed"
              value={projects?.filter(p => p.status === 'Completed').length || 0}
              subtitle="Finished projects"
              color="success"
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TimerIcon sx={{ fontSize: 32 }} />}
              title="In Progress"
              value={projects?.filter(p => p.status === 'In Progress').length || 0}
              subtitle="Active projects"
              color="warning"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<AccessTimeIcon sx={{ fontSize: 32 }} />}
              title="Today's Hours"
              value={attendance?.today?.hours || '0'}
              subtitle="Hours worked"
              color="info"
              delay={300}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<SaveIcon sx={{ fontSize: 32 }} />}
              title="Today's Update"
              value={todayUpdate ? 'Submitted' : 'Pending'}
              subtitle={todayUpdate ? 'Update submitted' : 'Update required'}
              color={todayUpdate ? 'success' : 'warning'}
              delay={300}
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
          <GlassCard>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTabs-indicator': {
                      display: 'none',
                    },
                  }}
                >
                  <AnimatedTab 
                    label="Attendance" 
                    icon={<AccessTimeIcon />}
                  />
                  <AnimatedTab 
                    label="My Projects" 
                    icon={<AssignmentIcon />}
                  />
                  <AnimatedTab 
                    label="Daily Update" 
                    icon={<SaveIcon />}
                  />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Attendance Tab */}
                {tabValue === 0 && (
                  <Fade in key="attendance">
                    <Box>
                      <Box display="flex" alignItems="center" mb={3}>
                        <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant="h5" fontWeight="bold">
                          Attendance
                        </Typography>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <GlassCard>
                            <CardContent>
                              <Typography variant="h6" fontWeight="bold" mb={2}>
                                Today' Status
                              </Typography>
                              <Box display="flex" alignItems="center" mb={2}>
                                <Avatar
                                  sx={{
                                    width: 64,
                                    height: 64,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    mr: 2,
                                  }}
                                >
                                  {user?.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="h6" fontWeight="bold">
                                    {user?.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {user?.role}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box display="flex" gap={2}>
                                <Button
                                  variant="contained"
                                  onClick={handlePunchIn}
                                  disabled={attendance?.today?.punchIn}
                                  sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    flex: 1,
                                  }}
                                >
                                  Punch In
                                </Button>
                                <Button
                                  variant="contained"
                                  onClick={handlePunchOut}
                                  disabled={!attendance?.today?.punchIn || attendance?.today?.punchOut}
                                  sx={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    flex: 1,
                                  }}
                                >
                                  Punch Out
                                </Button>
                              </Box>
                            </CardContent>
                          </GlassCard>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <GlassCard>
                            <CardContent>
                              <Typography variant="h6" fontWeight="bold" mb={2}>
                                Today Details
                              </Typography>
                              <Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    Punch In
                                  </Typography>
                                  <Typography variant="body2" fontWeight="600">
                                    {attendance?.today?.punchIn 
                                      ? new Date(attendance.today.punchIn).toLocaleTimeString()
                                      : 'Not punched in'}
                                  </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" color="text.secondary">
                                    Punch Out 
                                  </Typography>
                                  <Typography variant="body2" fontWeight="600">
                                    {attendance?.today?.punchOut
                                      ? new Date(attendance.today.punchOut).toLocaleTimeString()
                                      : 'Not punched out'}
                                  </Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                  <Typography variant="body2" color="text.secondary">
                                    Hours Worked
                                  </Typography>
                                  <Typography variant="body2" fontWeight="600">
                                    {attendance?.today?.hours || '0'} hrs
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </GlassCard>
                        </Grid>
                      </Grid>
                    </Box>
                  </Fade>
                )}

                {/* Projects Tab */}
                {tabValue === 1 && (
                  <Fade in key="projects">
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h5">
                          Your Projects
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setDailyUpdateDialogOpen(true)}
                        >
                          Daily Updates
                        </Button>
                      </Box>
                      {renderProjects()}
                    </Box>
                  </Fade>
                )}

                {/* Daily Update Tab */}
                {tabValue === 2 && (
                  <Fade in key="daily-update">
                    <Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center">
                          <SaveIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <Typography variant="h5" fontWeight="bold">
                            Daily Task Update
                          </Typography>
                        </Box>
                        {!todayUpdate && (
                          <Button
                            variant="contained"
                            onClick={handleDailyUpdateDialogOpen}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Submit Today's Update
                          </Button>
                        )}
                      </Box>

                      {todayUpdate ? (
                        <GlassCard>
                          <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                              Today's Update ({new Date(todayUpdate.date).toLocaleDateString()})
                            </Typography>
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" fontWeight="600" mb={1}>
                                  Total Hours: {todayUpdate.totalHours}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                  {todayUpdate.comments}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <TableContainer>
                                  <Table>
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Hours</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {todayUpdate.tasks.map((task, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{task.project.title}</TableCell>
                                          <TableCell>
                                            <Chip
                                              label={task.status}
                                              color={getStatusColor(task.status)}
                                              size="small"
                                              sx={{ fontWeight: 600, borderRadius: '8px' }}
                                            />
                                          </TableCell>
                                          <TableCell>{task.hoursSpent}</TableCell>
                                          <TableCell>{task.description}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </GlassCard>
                      ) : (
                        <GlassCard>
                          <CardContent>
                            <Box textAlign="center" py={4}>
                              <SaveIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                              <Typography variant="h6" color="text.secondary" mb={2}>
                                No update submitted for today
                              </Typography>
                              <Button
                                variant="contained"
                                onClick={handleDailyUpdateDialogOpen}
                                sx={{
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  borderRadius: '12px',
                                  textTransform: 'none',
                                  fontWeight: 600,
                                }}
                              >
                                Submit Today's Update
                              </Button>
                            </Box>
                          </CardContent>
                        </GlassCard>
                      )}
                    </Box>
                  </Fade>
                )}
              </Box>
            </CardContent>
          </GlassCard>
        </Fade>

        {/* Status Update Dialog */}
        <Dialog 
          open={statusDialogOpen} 
          onClose={handleStatusDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center">
              <EditIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Update Project Status
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                label="Status"
                sx={{
                  borderRadius: '12px',
                }}
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={handleStatusDialogClose}
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              disabled={!newStatus}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog 
          open={commentDialogOpen} 
          onClose={handleCommentDialogClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center">
              <CommentIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Add Comment
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={handleCommentDialogClose}
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCommentUpdate}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Add Comment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Daily Update Dialog */}
        <Dialog
          open={dailyUpdateDialogOpen}
          onClose={handleDailyUpdateDialogClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Daily Work Update</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {Array.isArray(dailyTasks) && dailyTasks.length > 0 ? (
              <Grid container spacing={2}>
                {dailyTasks.map((task, index) => (
                  <Grid item xs={12} key={index}>
                    <GlassCard>
                      <CardContent>
                        <Typography variant="h6">{task.title || 'Untitled Task'}</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Hours Spent"
                              type="number"
                              value={task.hoursSpent}
                              onChange={(e) => handleTaskChange(index, 'hoursSpent', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Description"
                              multiline
                              rows={2}
                              value={task.description}
                              onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </GlassCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No tasks available for update.</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDailyUpdateDialogClose}>Cancel</Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmitDailyUpdate}
              disabled={!Array.isArray(dailyTasks) || dailyTasks.length === 0}
            >
              Submit Update
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard; 