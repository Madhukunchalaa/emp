import React, { useEffect, useState } from 'react';
import { getTeamTasks } from '../../services/api';
import { CircularProgress, Paper, Typography, List, ListItem, ListItemText } from '@mui/material';

const TeamTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTeamTasks();
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch team tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Team Tasks</Typography>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && !error && (
        <List>
          {tasks.length === 0 && <Typography>No tasks assigned yet.</Typography>}
          {tasks.map(task => (
            <ListItem key={task._id} divider>
              <ListItemText
                primary={task.content || task.title}
                secondary={`Assigned to: ${task.assignedTo?.name || 'N/A'} | Status: ${task.status}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default TeamTasks; 