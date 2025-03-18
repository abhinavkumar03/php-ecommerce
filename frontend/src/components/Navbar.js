import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div>
          <Link to="/">E-Commerce Products</Link>
        </div>
        <div>
          <Link to="/add" className="button button-success">Add Product</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;