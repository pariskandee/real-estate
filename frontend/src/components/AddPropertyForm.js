import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ImageUpload from './ImageUpload';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Grid, 
  Paper, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  Chip,
  IconButton
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import axios from 'axios';
import { auth } from '../firebase';

const AddPropertyForm = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState('');

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      price: '',
      propertyType: '',
      transactionType: '',
      rooms: '',
      bedrooms: '',
      bathrooms: '',
      surface: '',
      dpe: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
      },
      contact: {
        name: '',
        phone: '',
        email: ''
      }
    },
    validationSchema: Yup.object({
      title: Yup.string().required(t('validation.required')),
      description: Yup.string().required(t('validation.required')),
      price: Yup.number().required(t('validation.required')).positive(),
      propertyType: Yup.string().required(t('validation.required')),
      transactionType: Yup.string().required(t('validation.required')),
      rooms: Yup.number().required(t('validation.required')).positive().integer(),
      bedrooms: Yup.number().required(t('validation.required')).positive().integer(),
      bathrooms: Yup.number().required(t('validation.required')).positive().integer(),
      surface: Yup.number().required(t('validation.required')).positive(),
      dpe: Yup.string().required(t('validation.required')),
      'address.street': Yup.string().required(t('validation.required')),
      'address.city': Yup.string().required(t('validation.required')),
      'address.postalCode': Yup.string().required(t('validation.required')),
      'contact.name': Yup.string().required(t('validation.required')),
      'contact.phone': Yup.string().required(t('validation.required')),
      'contact.email': Yup.string().email(t('validation.email')).required(t('validation.required'))
    }),
    onSubmit: async (values) => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert(t('auth.required'));
          return;
        }
        
        if (images.length < 3) {
          alert(t('property.minImages'));
          return;
        }
        
        const propertyData = {
          ...values,
          images,
          features,
          postedBy: user.uid,
          userIp: '' // Will be captured on backend
        };
        
        const idToken = await user.getIdToken();
        await axios.post('/api/properties', propertyData, {
          headers: {
            Authorization: `Bearer ${idToken}`
          }
        });
        
        alert(t('property.addSuccess'));
        formik.resetForm();
        setImages([]);
        setFeatures([]);
      } catch (error) {
        console.error('Error adding property:', error);
        alert(t('property.addError'));
      }
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert(t('property.maxImages'));
      return;
    }
    
    setUploading(true);
    
    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        return axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      });
      
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(res => res.data.url);
      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(t('property.uploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    if (featureInput && !features.includes(featureInput)) {
      setFeatures(prev => [...prev, featureInput]);
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (feature) => {
    setFeatures(prev => prev.filter(f => f !== feature));
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>{t('property.addTitle')}</Typography>
      
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t('property.title')}
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label={t('property.description')}
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('property.transactionType')}</InputLabel>
              <Select
                name="transactionType"
                value={formik.values.transactionType}
                onChange={formik.handleChange}
                error={formik.touched.transactionType && Boolean(formik.errors.transactionType)}
                label={t('property.transactionType')}
              >
                <MenuItem value="sale">{t('sale')}</MenuItem>
                <MenuItem value="rent">{t('rent')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('property.propertyType')}</InputLabel>
              <Select
                name="propertyType"
                value={formik.values.propertyType}
                onChange={formik.handleChange}
                error={formik.touched.propertyType && Boolean(formik.errors.propertyType)}
                label={t('property.propertyType')}
              >
                <MenuItem value="house">{t('propertyTypes.house')}</MenuItem>
                <MenuItem value="apartment">{t('propertyTypes.apartment')}</MenuItem>
                <MenuItem value="land">{t('propertyTypes.land')}</MenuItem>
                <MenuItem value="commercial">{t('propertyTypes.commercial')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label={t('property.price')}
              name="price"
              value={formik.values.price}
              onChange={formik.handleChange}
              error={formik.touched.price && Boolean(formik.errors.price)}
              helperText={formik.touched.price && formik.errors.price}
              InputProps={{
                endAdornment: formik.values.transactionType === 'rent' ? t('month') : ''
              }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label={t('property.rooms')}
              name="rooms"
              value={formik.values.rooms}
              onChange={formik.handleChange}
              error={formik.touched.rooms && Boolean(formik.errors.rooms)}
              helperText={formik.touched.rooms && formik.errors.rooms}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label={t('property.bedrooms')}
              name="bedrooms"
              value={formik.values.bedrooms}
              onChange={formik.handleChange}
              error={formik.touched.bedrooms && Boolean(formik.errors.bedrooms)}
              helperText={formik.touched.bedrooms && formik.errors.bedrooms}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label={t('property.bathrooms')}
              name="bathrooms"
              value={formik.values.bathrooms}
              onChange={formik.handleChange}
              error={formik.touched.bathrooms && Boolean(formik.errors.bathrooms)}
              helperText={formik.touched.bathrooms && formik.errors.bathrooms}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              type="number"
              label={t('property.surface')}
              name="surface"
              value={formik.values.surface}
              onChange={formik.handleChange}
              error={formik.touched.surface && Boolean(formik.errors.surface)}
              helperText={formik.touched.surface && formik.errors.surface}
              InputProps={{
                endAdornment: 'm²'
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>{t('property.dpe')}</InputLabel>
              <Select
                name="dpe"
                value={formik.values.dpe}
                onChange={formik.handleChange}
                error={formik.touched.dpe && Boolean(formik.errors.dpe)}
                label={t('property.dpe')}
              >
                <MenuItem value="A">A</MenuItem>
                <MenuItem value="B">B</MenuItem>
                <MenuItem value="C">C</MenuItem>
                <MenuItem value="D">D</MenuItem>
                <MenuItem value="E">E</MenuItem>
                <MenuItem value="F">F</MenuItem>
                <MenuItem value="G">G</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>{t('property.address')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('property.street')}
                  name="address.street"
                  value={formik.values.address.street}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                  helperText={formik.touched.address?.street && formik.errors.address?.street}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('property.city')}
                  name="address.city"
                  value={formik.values.address.city}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                  helperText={formik.touched.address?.city && formik.errors.address?.city}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label={t('property.postalCode')}
                  name="address.postalCode"
                  value={formik.values.address.postalCode}
                  onChange={formik.handleChange}
                  error={formik.touched.address?.postalCode && Boolean(formik.errors.address?.postalCode)}
                  helperText={formik.touched.address?.postalCode && formik.errors.address?.postalCode}
                />
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>{t('property.contact')}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('property.contactName')}
                  name="contact.name"
                  value={formik.values.contact.name}
                  onChange={formik.handleChange}
                  error={formik.touched.contact?.name && Boolean(formik.errors.contact?.name)}
                  helperText={formik.touched.contact?.name && formik.errors.contact?.name}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('property.phone')}
                  name="contact.phone"
                  value={formik.values.contact.phone}
                  onChange={formik.handleChange}
                  error={formik.touched.contact?.phone && Boolean(formik.errors.contact?.phone)}
                  helperText={formik.touched.contact?.phone && formik.errors.contact?.phone}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('property.email')}
                  name="contact.email"
                  value={formik.values.contact.email}
                  onChange={formik.handleChange}
                  error={formik.touched.contact?.email && Boolean(formik.errors.contact?.email)}
                  helperText={formik.touched.contact?.email && formik.errors.contact?.email}
                />
              </Grid>
            </Grid>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>{t('property.features')}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                label={t('property.addFeature')}
                size="small"
                sx={{ mr: 1 }}
              />
              <Button variant="outlined" onClick={handleAddFeature}>
                {t('add')}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {features.map((feature, index) => (
                <Chip
                  key={index}
                  label={feature}
                  onDelete={() => handleRemoveFeature(feature)}
                />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>{t('property.images')} (3-10)</Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="property-images"
              type="file"
              multiple
              onChange={handleImageUpload}
            />
            <label htmlFor="property-images">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                disabled={uploading}
              >
                {uploading ? t('uploading') : t('property.uploadImages')}
              </Button>
            </label>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {images.map((image, index) => (
                <Box key={index} sx={{ position: 'relative' }}>
                  <img
                    src={image}
                    alt={`Property ${index}`}
                    style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }}
                  />
                  <IconButton
                    size="small"
                    sx={{ 
                      position: 'absolute', 
                      top: -8, 
                      right: -8, 
                      backgroundColor: 'background.paper',
                      '&:hover': { backgroundColor: 'background.paper' }
                    }}
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Delete fontSize="small" color="error" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={uploading}
            >
              {t('property.submit')}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AddPropertyForm;