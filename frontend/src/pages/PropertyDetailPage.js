import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container, Grid, Typography, Box, Chip, Divider, Button, Paper } from '@mui/material';
import { Home, KingBed, Bathtub, AspectRatio, Euro, LocationOn, Phone, Email } from '@mui/icons-material';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import axios from 'axios';

const PropertyDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/properties/${id}`);
        setProperty(response.data);
        
        // Format images for gallery
        const galleryImages = response.data.images.map(img => ({
          original: img,
          thumbnail: img
        }));
        setImages(galleryImages);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id]);

  if (loading) {
    return <Typography>{t('loading')}...</Typography>;
  }

  if (!property) {
    return <Typography>{t('property.notFound')}</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>{property.title}</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <ImageGallery 
              items={images} 
              showPlayButton={false}
              showFullscreenButton={false}
            />
          </Box>
          
          <Typography variant="h6" gutterBottom>{t('property.description')}</Typography>
          <Typography paragraph>{property.description}</Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>{t('property.details')}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <Box display="flex" alignItems="center">
                <Euro color="primary" sx={{ mr: 1 }} />
                <Typography>
                  {property.price.toLocaleString()} {property.transactionType === 'rent' ? t('month') : ''}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box display="flex" alignItems="center">
                <Home color="primary" sx={{ mr: 1 }} />
                <Typography>{t(`propertyTypes.${property.propertyType}`)}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box display="flex" alignItems="center">
                <KingBed color="primary" sx={{ mr: 1 }} />
                <Typography>{property.bedrooms} {t('bedrooms')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box display="flex" alignItems="center">
                <Bathtub color="primary" sx={{ mr: 1 }} />
                <Typography>{property.bathrooms} {t('bathrooms')}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Box display="flex" alignItems="center">
                <AspectRatio color="primary" sx={{ mr: 1 }} />
                <Typography>{property.surface}m²</Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography>
                <strong>DPE:</strong> {property.dpe}
              </Typography>
            </Grid>
          </Grid>
          
          {property.features && property.features.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>{t('property.features')}</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {property.features.map((feature, index) => (
                  <Chip key={index} label={feature} />
                ))}
              </Box>
            </>
          )}
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>{t('property.contact')}</Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">{property.contact.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone color="primary" sx={{ mr: 1 }} />
              <Typography>
                {t('property.showPhone')} <Button variant="text" size="small">{t('show')}</Button>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email color="primary" sx={{ mr: 1 }} />
              <Typography>
                {t('property.showEmail')} <Button variant="text" size="small">{t('show')}</Button>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn color="primary" sx={{ mr: 1 }} />
              <Typography>
                {property.address.city}, {property.address.postalCode}
                <Button variant="text" size="small">{t('property.showMap')}</Button>
              </Typography>
            </Box>
            
            <Button 
              variant="contained" 
              fullWidth 
              size="large" 
              sx={{ mt: 2 }}
            >
              {t('property.contactButton')}
            </Button>
            
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              {t('property.reference')}: {property.reference}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PropertyDetailPage;