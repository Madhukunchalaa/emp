import React from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const EmployeeCalendar = ({ employee, attendanceHistory }) => {
  const theme = useTheme();

  const formatTime = (date) => {
    if (!date) return 'Not punched out';
    return new Date(date).toLocaleTimeString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const calculateHours = (punchIn, punchOut) => {
    if (!punchIn || !punchOut) return 'N/A';
    const start = new Date(punchIn);
    const end = new Date(punchOut);
    const hours = (end - start) / (1000 * 60 * 60);
    return hours.toFixed(2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'late':
        return 'warning';
      case 'absent':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon fontSize="small" />;
      case 'late':
        return <WarningIcon fontSize="small" />;
      case 'absent':
        return <ErrorIcon fontSize="small" />;
      default:
        return <AccessTimeIcon fontSize="small" />;
    }
  };

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Punch In</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Punch Out</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Total Hours</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceHistory && attendanceHistory.length > 0 ? (
              attendanceHistory.map((record) => (
                <TableRow
                  key={record._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontSize: '0.8rem',
                        }}
                      >
                        {formatDate(record.date).split('/')[1]}
                      </Avatar>
                      <Typography variant="body2" fontWeight="600">
                        {formatDate(record.date)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTime(record.punchIn)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatTime(record.punchOut)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {calculateHours(record.punchIn, record.punchOut)} hrs
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(record.status)}
                      label={record.status}
                      color={getStatusColor(record.status)}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <AccessTimeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No attendance records found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EmployeeCalendar; 