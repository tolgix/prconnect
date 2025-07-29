import React from 'react';
import { Box, Typography } from '@mui/material';

const Press = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Basın Verileri
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Gazeteci ve medya kanalı bilgilerini yönetin.
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Bu modül geliştirme aşamasındadır.
      </Typography>
    </Box>
  );
};

export default Press;