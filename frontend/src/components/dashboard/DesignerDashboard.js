import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDesignerSubmissions, submitDesign } from '../../store/slices/designSlice';
import { fetchDesignerTasks, updateTaskStatus } from '../../store/slices/taskSlice';
import { punchIn, punchOut, fetchAttendance } from '../../store/slices/employeeSlice';
import { fetchProjects, updateProjectStatus } from '../../store/slices/projectSlice';

const DesignerDashboard = () => {
  const dispatch = useDispatch();
  const { designs, loading: designsLoading, error: designsError } = useSelector(state => state.designs);
  const { tasks, loading: tasksLoading, error: tasksError } = useSelector(state => state.tasks);
  const { attendance, loading: attendanceLoading } = useSelector(state => state.employee);
  const { projects, loading: projectsLoading } = useSelector(state => state.projects);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Attendance" />
          <Tab label="Projects" />
          <Tab label="Designs" />
          <Tab label="Tasks" />
        </Tabs>
      </Box>

      {/* Attendance Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
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
                  >
                    Punch In
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handlePunchOut}
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
                    {attendance.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.punchIn ? new Date(record.punchIn).toLocaleTimeString() : '-'}</TableCell>
                        <TableCell>{record.punchOut ? new Date(record.punchOut).toLocaleTimeString() : '-'}</TableCell>
                        <TableCell>{record.hours || '-'}</TableCell>
                        <TableCell>{record.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Projects Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
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
                    {projects.map((project) => (
                      <TableRow key={project._id}>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>{project.description}</TableCell>
                        <TableCell>{project.status}</TableCell>
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={project.status}
                              onChange={(e) => handleUpdateProjectStatus(project._id, e.target.value)}
                            >
                              <MenuItem value="pending">Pending</MenuItem>
                              <MenuItem value="in_progress">In Progress</MenuItem>
                              <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Designs Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  My Design Submissions
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenSubmitDialog(true)}
                >
                  Submit New Design
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
                      <TableCell>Manager Comment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {designs.map((design) => (
                      <TableRow key={design._id}>
                        <TableCell>{design.title}</TableCell>
                        <TableCell>{design.description}</TableCell>
                        <TableCell>{design.status}</TableCell>
                        <TableCell>
                          {new Date(design.submittedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{design.managerComment || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tasks Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Assigned Tasks
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Content</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell>{task.content}</TableCell>
                        <TableCell>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{task.priority}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setSelectedTask(task);
                              setOpenTaskDialog(true);
                            }}
                          >
                            Update Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Submit Design Dialog */}
      <Dialog open={openSubmitDialog} onClose={() => setOpenSubmitDialog(false)}>
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
              required
              multiline
              rows={4}
            />
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFormData({ ...formData, designFile: e.target.files[0] })}
              style={{ marginTop: '1rem' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubmitDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitDesign} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Task Status Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)}>
        <DialogTitle>Update Task Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedTask?.status || ''}
              onChange={(e) => handleUpdateTaskStatus(selectedTask._id, e.target.value)}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default DesignerDashboard; 