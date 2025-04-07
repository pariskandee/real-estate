import { useTranslation } from 'react-i18next';
import { Typography, Box } from '@mui/material';

const Logo = () => {
  const { t } = useTranslation();
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src="/images/logo.png" 
        alt="NEXA Immobilier" 
        style={{ height: 50, marginRight: 10 }} 
      />
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          flexGrow: 1,
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          fontWeight: 700
        }}
      >
        NEXA Immobilier
      </Typography>
    </Box>
  );
};

export default Logo;