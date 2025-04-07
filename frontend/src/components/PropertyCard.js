import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardMedia, CardContent, Typography, Chip, Box } from '@mui/material';
import { Home, KingBed, Bathtub, AspectRatio, Euro } from '@mui/icons-material';

const PropertyCard = ({ property }) => {
  const { t } = useTranslation();
  
  return (
    <Card sx={{ maxWidth: 345, m: 2, cursor: 'pointer' }}>
      <CardMedia
        component="img"
        height="200"
        image={property.images[0]}
        alt={property.title}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div">
          {property.title}
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Euro fontSize="small" color="primary" />
          <Typography variant="body1" ml={1}>
            {property.price.toLocaleString()} {property.transactionType === 'rent' ? t('month') : ''}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {property.address.city}, {property.address.postalCode}
        </Typography>
        
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Chip icon={<KingBed />} label={`${property.bedrooms} ${t('bedrooms')}`} size="small" />
          <Chip icon={<Bathtub />} label={`${property.bathrooms} ${t('bathrooms')}`} size="small" />
          <Chip icon={<AspectRatio />} label={`${property.surface}m²`} size="small" />
        </Box>
        
        <Chip 
          icon={<Home />} 
          label={t(`propertyTypes.${property.propertyType}`)} 
          color="primary" 
          size="small" 
        />
      </CardContent>
    </Card>
  );
};

export default PropertyCard;