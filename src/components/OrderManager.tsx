import React from 'react';
import './OrderManager.css';
import Toast from './Toast';
import { useOrderManager } from '../hooks/useOrderManager';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  thumbnail: string;
  images: string[];
  category: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  note: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

const OrderManager: React.FC = () => {
  const {
    orders,
    loading,
    toast,
    pagination,
    handleStatusUpdate,
    handlePageChange,
    formatDate,
    getStatusColor,
    setToast
  } = useOrderManager();

  return (
    <div className="order-manager">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="order-list">
        <h2>Orders</h2>
        
        {/* Status Counts */}
        <div className="status-counts">
          <div className="status-count pending">
            <span className="count">{pagination.statusCounts.pending}</span>
            <span className="label">Pending</span>
          </div>
          <div className="status-count processing">
            <span className="count">{pagination.statusCounts.processing}</span>
            <span className="label">Processing</span>
          </div>
          <div className="status-count shipped">
            <span className="count">{pagination.statusCounts.shipped}</span>
            <span className="label">Shipped</span>
          </div>
          <div className="status-count delivered">
            <span className="count">{pagination.statusCounts.delivered}</span>
            <span className="label">Delivered</span>
          </div>
          <div className="status-count cancelled">
            <span className="count">{pagination.statusCounts.cancelled}</span>
            <span className="label">Cancelled</span>
          </div>
        </div>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <>
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-number">Order #{order._id.slice(-6)}</div>
                    <div className={`order-status ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="shipping-info">
                      <h3>Shipping Address</h3>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>

                    <div className="order-items">
                      <h3>Items</h3>
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <img 
                            src={item.product.thumbnail} 
                            alt={item.product.name} 
                            className="item-image"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/60';
                            }}
                          />
                          <div className="item-details">
                            <p>{item.product.name}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: ${item.price.toFixed(2)}</p>
                            {item.product.discountPrice && (
                              <p className="discount-price">
                                Discount Price: ${item.product.discountPrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary">
                      <h3>Summary</h3>
                      <p>Total Amount: ${order.totalAmount.toFixed(2)}</p>
                      <p>Payment Status: {order.paymentStatus}</p>
                      <p>Payment Method: {order.paymentMethod}</p>
                      {order.note && <p>Note: {order.note}</p>}
                      <p>Order Date: {formatDate(order.createdAt)}</p>
                    </div>
                  </div>

                  <div className="order-actions">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order._id, e.target.value as Order['status'])}
                      disabled={loading}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="pagination-button"
                >
                  Previous
                </button>
                <div className="pagination-info">
                  <span>Page {pagination.page} of {pagination.pages}</span>
                  <span className="total-orders">Total Orders: {pagination.total}</span>
                </div>
                <button 
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderManager; 