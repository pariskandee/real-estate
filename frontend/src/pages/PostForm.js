import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const PostForm = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    price: '',
    propertyType: '',
    rooms: '',
    address: '',
    contact: '',
    dpe: '',
    description: '',
    images: [],
    saleOrRent: 'sale', // Default to sale
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: [...e.target.files] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append('price', formData.price);
    formDataObj.append('propertyType', formData.propertyType);
    formDataObj.append('rooms', formData.rooms);
    formDataObj.append('address', formData.address);
    formDataObj.append('contact', formData.contact);
    formDataObj.append('dpe', formData.dpe);
    formDataObj.append('description', formData.description);
    formDataObj.append('saleOrRent', formData.saleOrRent);
    formDataObj.append('userEmail', user.email);

    formData.images.forEach((image) => {
      formDataObj.append('images', image);
    });

    try {
      await axios.post('/api/posts', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Property posted successfully!');
    } catch (err) {
      alert('Failed to post property.');
    }
  };

  return (
    <div className="post-form">
      <h2>Post a Property</h2>
      <form onSubmit={handleSubmit}>
        <label>Sale or Rent</label>
        <select name="saleOrRent" value={formData.saleOrRent} onChange={handleChange}>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>

        <label>Price</label>
        <input type="number" name="price" value={formData.price} onChange={handleChange} required />

        <label>Property Type</label>
        <input type="text" name="propertyType" value={formData.propertyType} onChange={handleChange} required />

        <label>Rooms</label>
        <input type="number" name="rooms" value={formData.rooms} onChange={handleChange} required />

        <label>Address</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} required />

        <label>Contact Number</label>
        <input type="text" name="contact" value={formData.contact} onChange={handleChange} required />

        <label>DPE</label>
        <input type="text" name="dpe" value={formData.dpe} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <label>Images</label>
        <input type="file" name="images" onChange={handleImageChange} multiple required />

        <button type="submit">Submit Property</button>
      </form>
    </div>
  );
};

export default PostForm;
