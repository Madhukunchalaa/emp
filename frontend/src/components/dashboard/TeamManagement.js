import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert } from '@mui/material';
import { getAvailableEmployees, assignEmployeeToTeam, getTeamMembers, createTaskForTeamMember } from '../../services/api';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [assignTaskOpen, setAssignTaskOpen] = useState(false);
  const [assignTaskData, setAssignTaskData] = useState({ teamMemberId: '', title: '', description: '', deadline: '' });
  const [addingEmployee, setAddingEmployee] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
    fetchAvailableEmployees();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const res = await getTeamMembers();
      setTeamMembers(res.data);
    } catch (err) {
      setError('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEmployees = async () => {
    try {
      const res = await getAvailableEmployees();
      setAvailableEmployees(res.data);
    } catch (err) {
      setError('Failed to fetch available employees');
    }
  };

  const handleAssignTask = async () => {
    setError(''); setSuccess('');
    try {
      await createTaskForTeamMember(assignTaskData);
      setSuccess('Task assigned successfully!');
      setAssignTaskOpen(false);
      setAssignTaskData({ teamMemberId: '', title: '', description: '', deadline: '' });
    } catch (err) {
      setError('Failed to assign task');
    }
  };

  const handleAddEmployee = async (employeeId) => {
    setAddingEmployee(true);
    setError(''); setSuccess('');
    try {
      await assignEmployeeToTeam(employeeId);
      setSuccess('Employee added to team!');
      setAvailableEmployees(availableEmployees.filter(emp => emp._id !== employeeId));
      fetchTeamMembers();
    } catch (err) {
      setError('Failed to add employee');
    } finally {
      setAddingEmployee(false);
    }
  };

  return (
    <div>
      <h3>Team Members</h3>
      {loading && <p>Loading team members...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <ul>
          {teamMembers.map(member => (
            <li key={member._id}>{member.name} ({member.email})</li>
          ))}
        </ul>
      )}
      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setAssignTaskOpen(true)}>Assign Task</Button>
      <Dialog open={assignTaskOpen} onClose={() => setAssignTaskOpen(false)}>
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Team Member"
            value={assignTaskData.teamMemberId}
            onChange={e => setAssignTaskData({ ...assignTaskData, teamMemberId: e.target.value })}
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
      <h3 style={{ marginTop: 32 }}>Add Employee to Team</h3>
      <ul>
        {availableEmployees.map(emp => (
          <li key={emp._id} style={{ marginBottom: 8 }}>
            {emp.name} ({emp.email})
            <Button
              variant="contained"
              size="small"
              sx={{ ml: 2 }}
              onClick={() => handleAddEmployee(emp._id)}
              disabled={addingEmployee}
            >
              Add to Team
            </Button>
          </li>
        ))}
      </ul>
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

export default TeamManagement; 