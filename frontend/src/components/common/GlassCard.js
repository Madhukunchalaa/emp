import React from 'react';
import { Card } from '@mui/material';

export const GlassCard = ({ children, ...props }) => {
  return (
    <Card
      {...props}
      sx={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        ...props.sx
      }}
    >
      {children}
    </Card>
  );
}; 