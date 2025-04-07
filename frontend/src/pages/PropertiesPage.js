import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Grid, Typography, TextField, MenuItem, Box, Pagination } from '@mui/material';
import PropertyCard from '../components/PropertyCard';
import axios from 'axios';

const PropertiesPage = () => {
  const { t } = useTranslation();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    transactionType: '',
    propertyType: '',
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    location: '',
    page: 1,
    limit: 12
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams(filters).toString();
        const response = await axios.get(`/api/properties?${query}`);
        setProperties(response.data.properties);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({ ...prev, page: value }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>{t('properties.title')}</Typography>
      
      <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label={t('properties.transactionType')}
              name="transactionType"
              value={filters.transactionType}
              onChange={handleFilterChange}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              <MenuItem value="sale">{t('sale')}</MenuItem>
              <MenuItem value="rent">{t('rent')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label={t('properties.propertyType')}
              name="propertyType"
              value={filters.propertyType}
              onChange={handleFilterChange}
            >
              <MenuItem value="">{t('all')}</MenuItem>
              <MenuItem value="house">{t('propertyTypes.house')}</MenuItem>
              <MenuItem value="apartment">{t('propertyTypes.apartment')}</MenuItem>
              <MenuItem value="land">{t('propertyTypes.land')}</MenuItem>
              <MenuItem value="commercial">{t('propertyTypes.commercial')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label={t('properties.minPrice')}
              name="minPrice"
              type="number"
              value={filters.minPrice}
              onChange={handleFilterChange}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label={t('properties.maxPrice')}
              name="maxPrice"
              type="number"
              value={filters.maxPrice}
              onChange={handleFilterChange}
            />
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Typography>{t('loading')}...</Typography>
      ) : properties.length === 0 ? (
        <Typography>{t('properties.noResults')}</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {properties.map(property => (
              <Grid item key={property._id} xs={12} sm={6} md={4} lg={3}>
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={filters.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default PropertiesPage;