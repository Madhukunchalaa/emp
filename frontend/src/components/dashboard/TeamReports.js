import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert } from '@mui/material';
import { teamLeaderService } from '../../services/api';

const TeamReports = () => {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportData, setReportData] = useState({ title: '', content: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSendReport = async () => {
    setError(''); setSuccess('');
    try {
      await teamLeaderService.sendReport(reportData);
      setSuccess('Report sent to manager!');
      setReportOpen(false);
      setReportData({ title: '', content: '' });
    } catch (err) {
      setError('Failed to send report');
    }
  };

  return (
    <div>
      <h3>Report to Manager</h3>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => setReportOpen(true)}>Send Report</Button>
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
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button onClick={handleSendReport} variant="contained">Send</Button>
        </DialogActions>
      </Dialog>
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

export default TeamReports; 