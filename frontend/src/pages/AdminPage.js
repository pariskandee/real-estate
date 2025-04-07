import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Button,
  Box,
  TextField,
  Pagination
} from '@mui/material';
import { Check, Close, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { auth } from '../firebase';

const AdminPage = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        const idToken = await user.getIdToken();
        const response = await axios.get(`/api/properties/admin?page=${page}&search=${searchTerm}`, {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });
        
        setProperties(response.data.properties);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [page, searchTerm]);

  const handleApprove = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const idToken = await user.getIdToken();
      await axios.patch(`/api/properties/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      
      setProperties(prev => prev.map(prop => 
        prop._id === id ? { ...prop, isApproved: true } : prop
      ));
    } catch (error) {
      console.error('Error approving property:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const idToken = await user.getIdToken();
      await axios.delete(`/api/properties/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      
      setProperties(prev => prev.filter(prop => prop._id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>{t('admin.title')}</Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label={t('admin.search')}
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      
      {loading ? (
        <Typography>{t('loading')}...</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('property.title')}</TableCell>
                  <TableCell>{t('property.type')}</TableCell>
                  <TableCell>{t('property.price')}</TableCell>
                  <TableCell>{t('property.location')}</TableCell>
                  <TableCell>{t('property.status')}</TableCell>
                  <TableCell>{t('property.postedBy')}</TableCell>
                  <TableCell>{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property._id}>
                    <TableCell>{property.title}</TableCell>
                    <TableCell>
                      {t(`propertyTypes.${property.propertyType}`)} - {t(property.transactionType)}
                    </TableCell>
                    <TableCell>
                      {property.price.toLocaleString()} {property.transactionType === 'rent' ? t('month') : ''}
                    </TableCell>
                    <TableCell>
                      {property.address.city}, {property.address.postalCode}
                    </TableCell>
                    <TableCell>
                      {property.isApproved ? (
                        <Chip icon={<Check />} label={t('approved')} color="success" size="small" />
                      ) : (
                        <Chip icon={<Close />} label={t('pending')} color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{property.postedBy.email}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!property.isApproved && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Check />}
                            onClick={() => handleApprove(property._id)}
                          >
                            {t('approve')}
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                        >
                          {t('edit')}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDelete(property._id)}
                        >
                          {t('delete')}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default AdminPage;