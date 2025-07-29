import React from 'react';
import { Box, Typography } from '@mui/material';

const Blacklist = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Kara Liste
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Abonelik iptali yapan veya spam şikayeti olan e-postaları yönetin.
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Bu modül geliştirme aşamasındadır.
      </Typography>
    </Box>
  );
};

export default Blacklist;