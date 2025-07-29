import React from 'react';
import { Box, Typography } from '@mui/material';

const Analytics = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analitikler
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Kampanya performanslarını detaylı olarak analiz edin.
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Bu modül geliştirme aşamasındadır.
      </Typography>
    </Box>
  );
};

export default Analytics;