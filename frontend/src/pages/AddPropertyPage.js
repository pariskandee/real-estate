import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box } from '@mui/material';
import AddPropertyForm from '../components/AddPropertyForm';
import { useAuth } from '../context/AuthContext';

const AddPropertyPage = () => {
  const { t } = useTranslation();
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <Typography>{t('loading')}...</Typography>;
  }

  if (!currentUser) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>
          {t('auth.required')}
        </Typography>
        <Typography>
          {t('auth.loginToAdd')}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('property.addTitle')}
      </Typography>
      <Box sx={{ mt: 3 }}>
        <AddPropertyForm />
      </Box>
    </Container>
  );
};

export default AddPropertyPage;