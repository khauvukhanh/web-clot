import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryManager from './CategoryManager';
import './Dashboard.css';
import ProductManager from './ProductManager';
import OrderManager from './OrderManager';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('categories');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <nav className="dashboard-nav">
        <ul>
          <li>
            <button 
              className={`nav-button ${activeMenu === 'categories' ? 'active' : ''}`}
              onClick={() => handleMenuClick('categories')}
            >
              Categories
            </button>
          </li>
          <li>
            <button 
              className={`nav-button ${activeMenu === 'products' ? 'active' : ''}`}
              onClick={() => handleMenuClick('products')}
            >
              Products
            </button>
          </li>
          <li>
            <button 
              className={`nav-button ${activeMenu === 'orders' ? 'active' : ''}`}
              onClick={() => handleMenuClick('orders')}
            >
              Orders
            </button>
          </li>
        </ul>
      </nav>

      <div className="dashboard-content">
        {activeMenu === 'categories' && <CategoryManager />}
        {activeMenu === 'products' && <ProductManager />}
        {activeMenu === 'orders' && <OrderManager />}
      </div>
    </div>
  );
};

export default Dashboard; 