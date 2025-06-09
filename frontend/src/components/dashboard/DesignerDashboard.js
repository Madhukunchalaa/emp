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
  Snackbar,
  Alert,
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
import { fetchDesignerSubmissions, submitDesign } from '../../store/slices/designSlice';
import { fetchDesignerTasks, updateTaskStatus } from '../../store/slices/taskSlice';
import { punchIn, punchOut, fetchAttendance } from '../../store/slices/employeeSlice';
import { fetchProjects, updateProjectStatus } from '../../store/slices/projectSlice';

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

const DesignerDashboard = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { designs, loading: designsLoading, error: designsError } = useSelector(state => state.designs);
  const { tasks, loading: tasksLoading, error: tasksError } = useSelector(state => state.tasks);
  const { attendance, loading: attendanceLoading } = useSelector(state => state.employee);
  const { items: projects, loading: projectsLoading } = useSelector(state => state.projects);
  const [tabValue, setTabValue] = useState(0);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    designFile: null
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    dispatch(fetchDesignerSubmissions());
    dispatch(fetchDesignerTasks());
    dispatch(fetchAttendance());
    dispatch(fetchProjects());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePunchIn = async () => {
    try {
      await dispatch(punchIn()).unwrap();
      setSnackbar({
        open: true,
        message: 'Punched in successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to punch in',
        severity: 'error'
      });
    }
  };

  const handlePunchOut = async () => {
    try {
      await dispatch(punchOut()).unwrap();
      setSnackbar({
        open: true,
        message: 'Punched out successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to punch out',
        severity: 'error'
      });
    }
  };

  const handleSubmitDesign = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('designFile', formData.designFile);

    try {
      await dispatch(submitDesign(formDataToSend)).unwrap();
      setSnackbar({
        open: true,
        message: 'Design submitted successfully',
        severity: 'success'
      });
      setOpenSubmitDialog(false);
      setFormData({ title: '', description: '', designFile: null });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit design',
        severity: 'error'
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await dispatch(updateTaskStatus({ taskId, status: newStatus })).unwrap();
      setSnackbar({
        open: true,
        message: 'Task status updated successfully',
        severity: 'success'
      });
      setOpenTaskDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update task status',
        severity: 'error'
      });
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await dispatch(updateProjectStatus({ projectId, status: newStatus })).unwrap();
      setSnackbar({
        open: true,
        message: 'Project status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update project status',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'warning';
      case 'pending':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AssignmentIcon />}
            title="Total Projects"
            value={projects?.length || 0}
            subtitle="Active projects"
            color="primary"
            delay={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TimerIcon />}
            title="Tasks"
            value={tasks?.length || 0}
            subtitle="Pending tasks"
            color="warning"
            delay={100}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleIcon />}
            title="Designs"
            value={designs?.length || 0}
            subtitle="Submitted designs"
            color="success"
            delay={200}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccessTimeIcon />}
            title="Hours"
            value={attendance?.reduce((acc, curr) => acc + (curr.hours || 0), 0) || 0}
            subtitle="Total hours worked"
            color="info"
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <AnimatedTab label="Attendance" icon={<AccessTimeIcon />} />
          <AnimatedTab label="Projects" icon={<AssignmentIcon />} />
          <AnimatedTab label="Designs" icon={<CheckCircleIcon />} />
          <AnimatedTab label="Tasks" icon={<TimerIcon />} />
        </Tabs>
      </Box>

      {/* Attendance Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <GlassCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    Attendance
                  </Typography>
                  <Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handlePunchIn}
                      sx={{ mr: 1 }}
                      startIcon={<AccessTimeIcon />}
                    >
                      Punch In
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handlePunchOut}
                      startIcon={<AccessTimeIcon />}
                    >
                      Punch Out
                    </Button>
                  </Box>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Punch In</TableCell>
                        <TableCell>Punch Out</TableCell>
                        <TableCell>Total Hours</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : !Array.isArray(attendance) ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">No attendance records available</TableCell>
                        </TableRow>
                      ) : attendance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center">No attendance records found</TableCell>
                        </TableRow>
                      ) : (
                        attendance.map((record) => (
                          <TableRow key={record._id}>
                            <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                            <TableCell>{record.punchIn ? new Date(record.punchIn).toLocaleTimeString() : '-'}</TableCell>
                            <TableCell>{record.punchOut ? new Date(record.punchOut).toLocaleTimeString() : '-'}</TableCell>
                            <TableCell>{record.hours || '-'}</TableCell>
                            <TableCell>
                              <Chip
                                label={record.status}
                                color={getStatusColor(record.status)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      )}

      {/* Projects Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <GlassCard>
              <CardContent>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  My Projects
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projectsLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : !Array.isArray(projects) ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No projects available</TableCell>
                        </TableRow>
                      ) : projects.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No projects found</TableCell>
                        </TableRow>
                      ) : (
                        projects.map((project) => (
                          <TableRow key={project._id}>
                            <TableCell>{project.title}</TableCell>
                            <TableCell>{project.description}</TableCell>
                            <TableCell>
                              <Chip
                                label={project.status}
                                color={getStatusColor(project.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={project.status}
                                  onChange={(e) => handleUpdateProjectStatus(project._id, e.target.value)}
                                  size="small"
                                >
                                  <MenuItem value="pending">Pending</MenuItem>
                                  <MenuItem value="in progress">In Progress</MenuItem>
                                  <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      )}

      {/* Designs Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <GlassCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography component="h2" variant="h6" color="primary" gutterBottom>
                    My Designs
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setOpenSubmitDialog(true)}
                    startIcon={<AddIcon />}
                  >
                    Submit Design
                  </Button>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Submitted Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {designsLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : !Array.isArray(designs) ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No designs available</TableCell>
                        </TableRow>
                      ) : designs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No designs found</TableCell>
                        </TableRow>
                      ) : (
                        designs.map((design) => (
                          <TableRow key={design._id}>
                            <TableCell>{design.title}</TableCell>
                            <TableCell>{design.description}</TableCell>
                            <TableCell>
                              <Chip
                                label={design.status}
                                color={getStatusColor(design.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(design.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      )}

      {/* Tasks Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <GlassCard>
              <CardContent>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  My Tasks
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tasksLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : !Array.isArray(tasks) ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No tasks available</TableCell>
                        </TableRow>
                      ) : tasks.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">No tasks found</TableCell>
                        </TableRow>
                      ) : (
                        tasks.map((task) => (
                          <TableRow key={task._id}>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>{task.description}</TableCell>
                            <TableCell>
                              <Chip
                                label={task.status}
                                color={getStatusColor(task.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={task.status}
                                  onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                  size="small"
                                >
                                  <MenuItem value="pending">Pending</MenuItem>
                                  <MenuItem value="in progress">In Progress</MenuItem>
                                  <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>
      )}

      {/* Submit Design Dialog */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Design</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmitDesign} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ mt: 2 }}
            >
              Upload Design File
              <input
                type="file"
                hidden
                onChange={(e) => setFormData({ ...formData, designFile: e.target.files[0] })}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitDesign} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DesignerDashboard; 