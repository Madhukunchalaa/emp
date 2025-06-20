import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

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
  Pagination,
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
  fetchEmployeeDailyUpdates, // Added this import
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
  const { 
    employees = [], 
    projects = [], 
    attendanceHistory = [], 
    dailyUpdates = [], // Added this from Redux state
    loading, 
    error, 
    success 
  } = useSelector((state) => state.manager);
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
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

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
      // Fetch daily updates using Redux action
      dispatch(fetchEmployeeDailyUpdates({
        employeeId: selectedEmployee._id,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      }));
    }
  }, [selectedEmployee, dateRange, dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 2 && selectedEmployee) {
      dispatch(fetchAttendanceHistory(selectedEmployee._id));
    }
    // Load daily updates when switching to Daily Updates tab
    if (newValue === 3 && selectedEmployee) {
      dispatch(fetchEmployeeDailyUpdates({
        employeeId: selectedEmployee._id,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      }));
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
    if (tabValue === 3) {
      dispatch(fetchEmployeeDailyUpdates({
        employeeId: employee._id,
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString()
      }));
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

  // Updated renderEmployeeUpdates to use Redux state
  const renderEmployeeUpdates = () => {
    if (!selectedEmployee) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Please select an employee to view their daily updates
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

    // Use dailyUpdates from Redux state instead of employeeUpdates
    const updatesToShow = dailyUpdates || [];

    if (updatesToShow.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No daily updates found for this employee
          </Typography>
        </Box>
      );
    }

    return (
      <GlassCard>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">
              Daily Updates - {selectedEmployee.name}
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                type="date"
                label="Start Date"
                value={dateRange.startDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDateRange = { ...dateRange, startDate: new Date(e.target.value) };
                  setDateRange(newDateRange);
                  // Refetch data with new date range
                  if (selectedEmployee) {
                    dispatch(fetchEmployeeDailyUpdates({
                      employeeId: selectedEmployee._id,
                      startDate: newDateRange.startDate.toISOString(),
                      endDate: newDateRange.endDate.toISOString()
                    }));
                  }
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
              <TextField
                type="date"
                label="End Date"
                value={dateRange.endDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  const newDateRange = { ...dateRange, endDate: new Date(e.target.value) };
                  setDateRange(newDateRange);
                  // Refetch data with new date range
                  if (selectedEmployee) {
                    dispatch(fetchEmployeeDailyUpdates({
                      employeeId: selectedEmployee._id,
                      startDate: newDateRange.startDate.toISOString(),
                      endDate: newDateRange.endDate.toISOString()
                    }));
                  }
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Task Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Hours Spent</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {updatesToShow.map((update) => (
                  <React.Fragment key={update._id}>
                    {update.tasks && update.tasks.map((task, index) => (
                      <TableRow 
                        key={`${update._id}-${index}`}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha('#667eea', 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(update.date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {projects.find(p => p._id === task.project)?.title || 'Unknown Project'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.status}
                            color={
                              task.status === 'Completed' ? 'success' : 
                              task.status === 'In Progress' ? 'primary' : 
                              'default'
                            }
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {task.hoursSpent} hrs
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {task.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {update.comments || '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </GlassCard>
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
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedEmployees = employees.slice(startIndex, endIndex);
    const totalPages = Math.ceil(employees.length / itemsPerPage);

    return (
      <Fade in key="employees">
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <GroupIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Team Members
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total Employees: {employees.length}
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee, index) => (
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
                            {employee.name?.charAt(0)}
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
                        {employee.attendance?.today && (
                          <Box mb={2}>
                            <Chip
                              label={`Today: ${employee.attendance.today.status}`}
                              color={
                                employee.attendance.today.status === 'Present' ? 'success' :
                                employee.attendance.today.status === 'Late' ? 'warning' :
                                'error'
                              }
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            {employee.attendance.today.punchIn && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Punch In: {new Date(employee.attendance.today.punchIn).toLocaleTimeString()}
                              </Typography>
                            )}
                            {employee.attendance.today.punchOut && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Punch Out: {new Date(employee.attendance.today.punchOut).toLocaleTimeString()}
                              </Typography>
                            )}
                          </Box>
                        )}
                        <Box display="flex" gap={1}>
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
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<SaveIcon />}
                            onClick={() => {
                              handleEmployeeSelect(employee);
                              setTabValue(3);
                            }}
                            sx={{
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Daily Updates
                          </Button>
                        </Box>
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

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '12px',
                    margin: '0 4px',
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Fade>
    );
  };

  const renderProjectList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

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
                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
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
                          <TableCell>
                            <Box display="flex" gap={1}>
                              <Tooltip title="View Details">
                                <IconButton size="small" color="primary">
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Project">
                                <IconButton size="small" color="primary">
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))
                    ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Box py={4}>
                          <ProjectIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary">
                            No projects assigned yet
                          </Typography>
                        </Box>
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

  const renderDesignReview = () => {
    if (designLoading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      );
    }

    if (designError) {
      return (
        <Box p={3} textAlign="center">
          <Typography color="error">{designError}</Typography>
        </Box>
      );
    }

    return (
      <Fade in key="designs">
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center">
              <ImageIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Typography variant="h5" fontWeight="bold">
                Design Review
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Total Designs: {designs.length}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {designs && designs.length > 0 ? (
              designs.map((design, index) => (
                <Grid item xs={12} sm={6} md={4} key={design._id}>
                  <Zoom in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                    <GlassCard>
                      <CardContent>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar
                            sx={{
                              width: 48,
                              height: 48,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              mr: 2,
                            }}
                          >
                            <ImageIcon />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold" noWrap>
                              {design.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              by {design.createdBy?.name}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" mb={2}>
                          {design.description}
                        </Typography>
                        
                        <Box mb={2}>
                          <Chip
                            label={design.status}
                            color={
                              design.status === 'approved' ? 'success' :
                              design.status === 'rejected' ? 'error' :
                              'warning'
                            }
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Created: {new Date(design.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>

                        {design.managerComment && (
                          <Box mb={2} p={2} sx={{ backgroundColor: 'background.default', borderRadius: 2 }}>
                            <Typography variant="body2" fontWeight="600" mb={1}>
                              Manager Comment:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {design.managerComment}
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" gap={1}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleDesignReview(design)}
                            sx={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Review
                          </Button>
                        </Box>
                      </CardContent>
                    </GlassCard>
                  </Zoom>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box textAlign="center" py={4}>
                  <ImageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No designs found for review
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Fade>
    );
  };

  const renderTabContent = () => {
    switch (tabValue) {
      case 0:
        return (
          <Box>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<GroupIcon sx={{ fontSize: 32 }} />}
                  title="Total Employees"
                  value={employees.length}
                  subtitle="Active team members"
                  delay={0}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
                  title="Active Projects"
                  value={projects.filter(p => p.status !== 'Completed').length}
                  subtitle="In progress"
                  color="secondary"
                  delay={100}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
                  title="Completed Projects"
                  value={projects.filter(p => p.status === 'Completed').length}
                  subtitle="Successfully finished"
                  color="success"
                  delay={200}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
                  title="Team Performance"
                  value="85%"
                  subtitle="Overall efficiency"
                  color="warning"
                  delay={300}
                />
              </Grid>
            </Grid>
            {renderEmployeeList()}
          </Box>
        );
      case 1:
        return renderProjectList();
      case 2:
        return renderAttendanceHistory();
      case 3:
        return renderEmployeeUpdates();
      case 4:
        return renderDesignReview();
      case 5:
        return selectedEmployee ? (
          <EmployeeCalendar employeeId={selectedEmployee._id} />
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <Typography variant="h6" color="text.secondary">
              Select an employee to view calendar
            </Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Manager Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Welcome back, {user?.name}! Here's your team overview.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          background: 'transparent',
          mb: 3,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              display: 'none',
            },
            '& .MuiTabs-scroller': {
              overflow: 'visible !important',
            },
          }}
        >
          <AnimatedTab
            label="Dashboard"
            icon={<DashboardIcon />}
          />
          <AnimatedTab
            label="Projects"
            icon={<AssignmentIcon />}
          />
          <AnimatedTab
            label="Attendance"
            icon={<AccessTimeIcon />}
          />
          <AnimatedTab
            label="Daily Updates"
            icon={<CommentIcon />}
          />
          <AnimatedTab
            label="Design Review"
            icon={<ImageIcon />}
          />
          <AnimatedTab
            label="Calendar"
            icon={<CalendarIcon />}
          />
        </Tabs>
      </Paper>

      <Box sx={{ minHeight: '60vh' }}>
        {renderTabContent()}
      </Box>

      {/* Project Assignment Dialog */}
      <Dialog
        open={projectDialogOpen}
        onClose={handleProjectDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${alpha('#667eea', 0.05)}, ${alpha('#764ba2', 0.05)})`,
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Assign New Project
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newProject.assignedTo}
                  onChange={(e) => setNewProject({ ...newProject, assignedTo: e.target.value })}
                  label="Assign To"
                  sx={{
                    borderRadius: '12px',
                  }}
                >
                  {employees.map((employee) => (
                    <MenuItem key={employee._id} value={employee._id}>
                      {employee.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Deadline"
                value={newProject.deadline}
                onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleProjectDialogClose}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${alpha('#667eea', 0.05)}, ${alpha('#764ba2', 0.05)})`,
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Review Design: {designReviewDialog.design?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" mb={2}>
                {designReviewDialog.design?.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Created by: {designReviewDialog.design?.createdBy?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Review Status</InputLabel>
                <Select
                  value={designReviewDialog.status}
                  onChange={(e) => setDesignReviewDialog(prev => ({ ...prev, status: e.target.value }))}
                  label="Review Status"
                  sx={{ borderRadius: '12px' }}
                >
                  <MenuItem value="approved">
                    <Box display="flex" alignItems="center">
                      <ApproveIcon sx={{ mr: 1, color: 'success.main' }} />
                      Approve
                    </Box>
                  </MenuItem>
                  <MenuItem value="rejected">
                    <Box display="flex" alignItems="center">
                      <RejectIcon sx={{ mr: 1, color: 'error.main' }} />
                      Reject
                    </Box>
                  </MenuItem>
                  <MenuItem value="pending">
                    <Box display="flex" alignItems="center">
                      <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                      Needs Revision
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Manager Comment"
                value={designReviewDialog.comment}
                onChange={(e) => setDesignReviewDialog(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Provide feedback or comments..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={handleDesignReviewClose}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDesignReviewSubmit}
            variant="contained"
            disabled={!designReviewDialog.status}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!success}
        autoHideDuration={5000}
        onClose={() => dispatch(clearSuccess())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => dispatch(clearSuccess())} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => dispatch(clearError())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => dispatch(clearError())} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManagerDashboard;