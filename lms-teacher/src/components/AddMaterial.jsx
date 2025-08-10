import './AddMaterial.css';

import {
  Button,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import axios from 'axios';

const AddTour = () => {
  const [materialDetails, setMaterialDetails] = useState({
    item_id: '',
    item_name: '',
    available_qty: '',
    unit_price: '',
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]); // Store image previews

  const handleChange = (e) => {
    setMaterialDetails({ ...materialDetails, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    // Add new files and generate previews
    const updatedImages = [...materialDetails.images, ...files];
    const updatedPreviews = [
      ...imagePreviews,
      ...files.map((file) => URL.createObjectURL(file)),
    ];

    setMaterialDetails({ ...materialDetails, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleRemoveImage = (index) => {
    // Remove selected image and its preview
    const updatedImages = materialDetails.images.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);

    setMaterialDetails({ ...materialDetails, images: updatedImages });
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { item_id, item_name, available_qty, unit_price, images } = materialDetails;

    // Check if required fields are filled in
    if (!item_id || !item_name || !available_qty || !unit_price) {
      alert('Please fill in all required fields.');
      return;
    }

    // Prepare the data to send to the backend
    const formData = new FormData();
    formData.append('itemId', item_id); // Match field name as expected by the backend
    formData.append('itemName', item_name); // Match field name as expected by the backend
    formData.append('availableQty', available_qty); // Match field name as expected by the backend
    formData.append('unitPrice', unit_price); // Match field name as expected by the backend

    // Only append images if they exist
    if (images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    try {
      const response = await axios.post('http://localhost:4000/api/material/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Material added successfully:', response.data);
      alert('Material added successfully!');
      setMaterialDetails({
        item_id: '',
        item_name: '',
        available_qty: '',
        unit_price: '',
        images: [],
      });
      setImagePreviews([]); // Clear previews after submission
    } catch (error) {
      console.error('Error adding material:', error);
      alert(error.response?.data?.message || 'Failed to add material. Please try again.');
    }
  };

  return (
    <Container className="add-material-container">
      <Typography
        variant="h4"
        gutterBottom
        className="heading"
        style={{ fontWeight: 600,textAlign: 'center' }}
      >
        Add New Material
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Material Item ID */}
          <Grid item xs={12}>
            <TextField
              label="Material Item ID"
              variant="outlined"
              fullWidth
              name="item_id"
              value={materialDetails.item_id}
              onChange={handleChange}
              className="text-field"
            />
          </Grid>

          {/* Material Name */}
          <Grid item xs={12}>
            <TextField
              label="Material Name"
              variant="outlined"
              fullWidth
              name="item_name"
              value={materialDetails.item_name}
              onChange={handleChange}
              className="text-field"
            />
          </Grid>

          {/* Available Quantity */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Available Quantity"
              variant="outlined"
              fullWidth
              name="available_qty"
              value={materialDetails.available_qty}
              onChange={handleChange}
              className="text-field"
              type="number"
            />
          </Grid>

          {/* Unit Price */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Unit Price"
              variant="outlined"
              fullWidth
              name="unit_price"
              value={materialDetails.unit_price}
              onChange={handleChange}
              className="text-field"
              type="number"
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              color="secondary"
              fullWidth
              className="upload-button"
            >
              Upload Images
              <input
                type="file"
                name="images"
                onChange={handleImageChange}
                multiple
                hidden
              />
            </Button>
          </Grid>

          {/* Image Previews */}
          <Grid item xs={12}>
            <div className="image-preview-container">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="image-preview"
                  />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              className="submit-button"
            >
              Add Material
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default AddTour;
