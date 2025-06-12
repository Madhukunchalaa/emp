import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Container } from '@mui/material';

const ProjectDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return <p>No project data found.</p>;

  const { project, status, description, hoursSpent, comments } = state;

  return (
    <Container maxWidth="sm" className="mt-5">
      <Card className="p-4 shadow-sm border-info border-start border-4 rounded-4">
        <h3 className="text-primary mb-3">{project}</h3>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Description:</strong> {description}</p>
        <p><strong>Hours Spent:</strong> {hoursSpent}</p>
        {comments && (
          <p className="text-info bg-info-subtle p-2 rounded"><strong>Comment:</strong> {comments}</p>
        )}
        <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Back
        </Button>
      </Card>
    </Container>
  );
};

export default ProjectDetails;
