import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/products.php?id=${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await axios.put(`${process.env.REACT_APP_API_URL}/products.php?id=${id}`, formData);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/products.php`, formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
      {loading && isEditing ? (
        <p>Loading product data...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows="4"
            ></textarea>
          </div>
          <div className="form-group">
            <label className="form-label">Price</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="text"
              className="form-control"
              name="image_url"
              value={formData.image_url || ''}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <button type="submit" className="button button-success" disabled={loading}>
            {loading ? 'Saving...' : (isEditing ? 'Update Product' : 'Add Product')}
          </button>
          <button
            type="button"
            className="button"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};

export default ProductForm;