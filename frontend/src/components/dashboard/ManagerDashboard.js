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
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  AccessTime as AccessTimeIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Assignment as ProjectIcon,
  Timer as TimerIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Comment as CommentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CalendarToday as CalendarIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import {
  fetchEmployees,
  fetchProjects,
  assignProject,
  fetchAttendanceHistory,
  clearError,
  clearSuccess,
} from '../../store/slices/managerSlice';
import {
  fetchAllDesigns,
  reviewDesign,
} from '../../store/slices/designSlice';
import EmployeeCalendar from './EmployeeCalendar';
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

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { employees = [], projects = [], attendanceHistory = [], loading, error, success } = useSelector((state) => state.manager);
  const { user } = useSelector((state) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    deadline: '',
    assignedTo: '',
  });
  const [employeeUpdates, setEmployeeUpdates] = useState([]);
  const [updateSummary, setUpdateSummary] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date()
  });
  const [designReviewDialog, setDesignReviewDialog] = useState({
    open: false,
    design: null,
    status: '',
    comment: '',
  });
  const [designs, setDesigns] = useState([]);
  const [designLoading, setDesignLoading] = useState(false);
  const [designError, setDesignError] = useState(null);

  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchProjects());
    fetchDesigns();
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000);
    }
    if (success) {
      setTimeout(() => dispatch(clearSuccess()), 5000);
    }
  }, [error, success, dispatch]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeeUpdates();
    }
  }, [selectedEmployee, dateRange]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 2 && selectedEmployee) {
      dispatch(fetchAttendanceHistory(selectedEmployee._id));
    }
  };

  const handleProjectDialogOpen = () => {
    setProjectDialogOpen(true);
  };

  const handleProjectDialogClose = () => {
    setProjectDialogOpen(false);
    setNewProject({
      title: '',
      description: '',
      deadline: '',
      assignedTo: '',
    });
  };

  const handleProjectSubmit = () => {
    dispatch(assignProject(newProject));
    handleProjectDialogClose();
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    if (tabValue === 2) {
      dispatch(fetchAttendanceHistory(employee._id));
    }
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

  const fetchEmployeeUpdates = async () => {
    try {
      console.log('Fetching updates for employee:', selectedEmployee._id);
      const response = await api.get('/manager/employee-updates', {
        params: {
          employeeId: selectedEmployee._id,
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        }
      });
      console.log('Employee updates response:', response.data);
      setEmployeeUpdates(response.data.updates || []);
      setUpdateSummary(response.data.summary || null);
    } catch (error) {
      console.error('Error fetching employee updates:', error);
      setEmployeeUpdates([]);
      setUpdateSummary(null);
    }
  };

  const fetchDesigns = async () => {
    try {
      setDesignLoading(true);
      const response = await dispatch(fetchAllDesigns({})).unwrap();
      setDesigns(response);
    } catch (error) {
      setDesignError(error.message);
    } finally {
      setDesignLoading(false);
    }
  };

  const handleDesignReview = (design) => {
    setDesignReviewDialog({
      open: true,
      design,
      status: '',
      comment: '',
    });
  };

  const handleDesignReviewClose = () => {
    setDesignReviewDialog({
      open: false,
      design: null,
      status: '',
      comment: '',
    });
  };

  const handleDesignReviewSubmit = async () => {
    try {
      await dispatch(reviewDesign({
        designId: designReviewDialog.design._id,
        status: designReviewDialog.status,
        managerComment: designReviewDialog.comment,
      })).unwrap();
      handleDesignReviewClose();
      fetchDesigns();
    } catch (error) {
      setDesignError(error.message);
    }
  };

  const renderEmployeeUpdates = () => {
    if (!selectedEmployee) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Please select an employee to view their updates
          </Typography>
        </Box>
      );
    }

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

    if (!employeeUpdates || employeeUpdates.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No updates found for this employee
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        {updateSummary && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1">
                  Total Hours: {updateSummary.totalHours}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1">
                  Tasks Completed: {updateSummary.completedTasks}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1">
                  Last Update: {new Date(updateSummary.lastUpdate).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hours Spent</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employeeUpdates.map((update) => (
                <React.Fragment key={update._id}>
                  {update.tasks.map((task, index) => (
                    <TableRow key={`${update._id}-${index}`}>
                      <TableCell>
                        {new Date(update.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {projects.find(p => p._id === task.project)?.title || 'Unknown Project'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          color={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{task.hoursSpent}</TableCell>
                      <TableCell>{task.description}</TableCell>
                    </TableRow>
                  ))}
                  {update.comments && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          Comments: {update.comments}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderAttendanceHistory = () => {
    if (!selectedEmployee) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography variant="h6" color="text.secondary">
            Select an employee to view attendance history
          </Typography>
        </Box>
      );
    }

    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }

    return (
      <GlassCard>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Attendance History
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                type="date"
                label="Start Date"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                type="date"
                label="End Date"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
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
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {record.punchIn ? new Date(record.punchIn).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        {record.punchOut ? new Date(record.punchOut).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        {record.totalHours ? `${record.totalHours.toFixed(2)} hrs` : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={
                            record.status === 'Present' ? 'success' :
                            record.status === 'Late' ? 'warning' :
                            record.status === 'Absent' ? 'error' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No attendance records found for the selected period
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </GlassCard>
    );
  };

  const renderEmployeeList = () => {
    return (
      <Fade in key="employees">
        <Box>
          <Box display="flex" alignItems="center" mb={3}>
            <GroupIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">
              Team Members
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {employees && employees.length > 0 ? (
              employees.map((employee, index) => (
                <Grid item xs={12} sm={6} md={4} key={employee._id}>
                  <Zoom in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                    <GlassCard>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              mr: 2,
                            }}
                          >
                            {employee.name.charAt(0)}
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold">
                              {employee.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {employee.role}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {employee.email}
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            handleEmployeeSelect(employee);
                            setTabValue(2);
                          }}
                          sx={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          View Hours
                        </Button>
                      </CardContent>
                    </GlassCard>
                  </Zoom>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No employees found
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Fade>
    );
  };

  const renderProjectList = () => {
    return (
      <Fade in key="projects">
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Project Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleProjectDialogOpen}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1.5,
              }}
            >
              Assign New Project
            </Button>
          </Box>

          <GlassCard>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Deadline</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Comment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects && projects.length > 0 ? (
                    projects.map((project, index) => (
                      <Fade in timeout={300} style={{ transitionDelay: `${index * 50}ms` }} key={project._id}>
                        <TableRow
                          sx={{
                            '&:hover': {
                              backgroundColor: alpha('#667eea', 0.05),
                            },
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight="600">{project.title}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{project.description}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ width: 32, height: 32, mr: 1, fontSize: '0.8rem' }}>
                                {project.assignedTo?.name?.charAt(0)}
                              </Avatar>
                              {project.assignedTo?.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(project.deadline).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={project.status}
                              color={getStatusColor(project.status)}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {project.comment || 'No comment'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <AssignmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No projects found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Box>
      </Fade>
    );
  };

  const renderDesignsList = () => {
    if (designLoading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Fade in key="designs">
        <Box>
          <Box display="flex" alignItems="center" mb={3}>
            <ImageIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">
              Design Submissions
            </Typography>
          </Box>

          <GlassCard>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Designer</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Submission Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Preview</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {designs.length > 0 ? (
                    designs.map((design) => (
                      <TableRow key={design._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                              {design.designer?.name?.charAt(0)}
                            </Avatar>
                            {design.designer?.name}
                          </Box>
                        </TableCell>
                        <TableCell>{design.project?.title}</TableCell>
                        <TableCell>
                          {new Date(design.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={design.status}
                            color={
                              design.status === 'Approved' ? 'success' :
                              design.status === 'Rejected' ? 'error' :
                              design.status === 'Pending' ? 'warning' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {design.imageUrl && (
                            <IconButton
                              onClick={() => window.open(design.imageUrl, '_blank')}
                              size="small"
                            >
                              <ImageIcon />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          {design.status === 'Pending' && (
                            <Box>
                              <Tooltip title="Approve">
                                <IconButton
                                  onClick={() => handleDesignReview(design)}
                                  color="success"
                                  size="small"
                                >
                                  <ApproveIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  onClick={() => handleDesignReview(design)}
                                  color="error"
                                  size="small"
                                >
                                  <RejectIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <ImageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No design submissions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Box>
      </Fade>
    );
  };

  const renderTabPanel = () => {
    switch (tabValue) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <StatCard
                icon={<GroupIcon />}
                title="Total Employees"
                value={employees.length}
                subtitle="Active team members"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <StatCard
                icon={<ProjectIcon />}
                title="Active Projects"
                value={projects.filter(p => p.status === 'In Progress').length}
                subtitle="Ongoing projects"
                color="info"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <StatCard
                icon={<CheckCircleIcon />}
                title="Completed"
                value={projects.filter(p => p.status === 'Completed').length}
                subtitle="Finished projects"
                color="success"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <StatCard
                icon={<TimerIcon />}
                title="Average Hours"
                value={calculateAverageHours()}
                subtitle="Per employee"
                color="warning"
              />
            </Grid>
          </Grid>
        );
      case 1:
        return renderEmployeeList();
      case 2:
        return renderAttendanceHistory();
      case 3:
        return renderProjectList();
      case 4:
        return renderDesignsList();
      default:
        return null;
    }
  };

  const calculateAverageHours = () => {
    if (!attendanceHistory.length) return '0';
    const totalHours = attendanceHistory.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    return (totalHours / attendanceHistory.length).toFixed(1);
  };

  if (loading) {
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
              Manager Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              color="rgba(255,255,255,0.8)" 
              textAlign="center"
            >
              Welcome back, {user?.name}! 🚀
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
              icon={<GroupIcon sx={{ fontSize: 32 }} />}
              title="Team Members"
              value={employees?.length || 0}
              subtitle="Active employees"
              color="primary"
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<ProjectIcon sx={{ fontSize: 32 }} />}
              title="Projects"
              value={projects?.length || 0}
              subtitle="Total projects"
              color="secondary"
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
              title="Completed"
              value={projects?.filter(p => p.status === 'Completed').length || 0}
              subtitle="Finished projects"
              color="success"
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TimerIcon sx={{ fontSize: 32 }} />}
              title="In Progress"
              value={projects?.filter(p => p.status === 'In Progress').length || 0}
              subtitle="Active projects"
              color="warning"
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
                    label="Employee List" 
                    icon={<AssignmentIcon />}
                  />
                  <AnimatedTab 
                    label="Project Management" 
                    icon={<DashboardIcon />}
                  />
                  <AnimatedTab 
                    label="Working Hours" 
                    icon={<AccessTimeIcon />}
                  />
                  <AnimatedTab 
                    label="Daily Updates" 
                    icon={<SaveIcon />}
                  />
                  <AnimatedTab 
                    label="Designs" 
                    icon={<ImageIcon />}
                  />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {renderTabPanel()}
              </Box>
            </CardContent>
          </GlassCard>
        </Fade>

        {/* Project Assignment Dialog */}
        <Dialog 
          open={projectDialogOpen} 
          onClose={handleProjectDialogClose}
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
              <AddIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Assign New Project
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <TextField
              fullWidth
              type="date"
              label="Deadline"
              value={newProject.deadline}
              onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <FormControl 
              fullWidth 
              sx={{ 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            >
              <InputLabel>Assign To</InputLabel>
              <Select
                value={newProject.assignedTo}
                onChange={(e) => setNewProject({ ...newProject, assignedTo: e.target.value })}
                label="Assign To"
              >
                {employees && employees.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.7rem' }}>
                        {employee.name.charAt(0)}
                      </Avatar>
                      {employee.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button 
              onClick={handleProjectDialogClose}
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleProjectSubmit}
              variant="contained"
              disabled={!newProject.title || !newProject.assignedTo || !newProject.deadline}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Assign Project
            </Button>
          </DialogActions>
        </Dialog>

        {/* Design Review Dialog */}
        <Dialog
          open={designReviewDialog.open}
          onClose={handleDesignReviewClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Review Design Submission
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={designReviewDialog.status}
                  onChange={(e) => setDesignReviewDialog(prev => ({
                    ...prev,
                    status: e.target.value
                  }))}
                  label="Status"
                >
                  <MenuItem value="Approved">Approve</MenuItem>
                  <MenuItem value="Rejected">Reject</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Comment"
                value={designReviewDialog.comment}
                onChange={(e) => setDesignReviewDialog(prev => ({
                  ...prev,
                  comment: e.target.value
                }))}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDesignReviewClose}>Cancel</Button>
            <Button
              onClick={handleDesignReviewSubmit}
              variant="contained"
              disabled={!designReviewDialog.status}
            >
              Submit Review
            </Button>
          </DialogActions>
        </Dialog>

        {/* Error Snackbar */}
        <Snackbar
          open={!!designError}
          autoHideDuration={6000}
          onClose={() => setDesignError(null)}
        >
          <Alert severity="error" onClose={() => setDesignError(null)}>
            {designError}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ManagerDashboard;