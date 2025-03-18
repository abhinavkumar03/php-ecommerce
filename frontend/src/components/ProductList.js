import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/products.php`, {
        params: {
          search,
          min_price: minPrice || 0,
          max_price: maxPrice || 100000,
          sort,
          page,
          limit: 8
        }
      });
      setProducts(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/products.php?id=${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`page-button ${page === i ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div>
      <div className="filters">
        <form onSubmit={handleSearch}>
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Min Price</label>
              <input
                type="number"
                className="filter-input"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Max Price</label>
              <input
                type="number"
                className="filter-input"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">Sort</label>
              <select
                className="filter-input"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
          <button type="submit" className="button">Apply Filters</button>
        </form>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <img
                src={product.image_url || 'https://via.placeholder.com/300'}
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                <p className="product-description">
                  {product.description ? 
                    (product.description.length > 100 ? 
                      `${product.description.substring(0, 100)}...` : 
                      product.description) : 
                    'No description available'}
                </p>
                <div>
                  <Link to={`/edit/${product.id}`} className="button">Edit</Link>
                  <button
                    className="button button-danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="pagination">
          <button
            className="page-button"
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          {renderPagination()}
          <button
            className="page-button"
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;