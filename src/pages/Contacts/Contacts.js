import React from 'react';
import { Box, Typography } from '@mui/material';

const Contacts = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        İletişim Listeleri
      </Typography>
      <Typography variant="body1" color="text.secondary">
        İletişim listelerini ve segmentleri yönetin.
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Bu modül geliştirme aşamasındadır.
      </Typography>
    </Box>
  );
};

export default Contacts;