import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ 
      mt: 4, 
      pt: 2,
      borderTop: '1px solid',
      borderColor: 'divider',
      textAlign: 'center' 
    }}>
      <Typography 
        variant="caption" 
        color="text.secondary"
        sx={{ fontSize: '0.75rem' }}
      >
        Copy Right by KT. Liang 2025.01
      </Typography>
    </Box>
  );
};

export default Footer; 