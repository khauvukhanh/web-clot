import React, { useState, useEffect } from 'react';
import './ProductManager.css';
import Toast from './Toast';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  images: string[];
  category: Category;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    thumbnail: '',
    images: [''],
    category: '',
    stock: 0,
    isActive: true
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // Fetch products and categories
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://backend-api-mb18.onrender.com/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to fetch products', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://backend-api-mb18.onrender.com/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to fetch categories', 
        type: 'error' 
      });
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Create product
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('https://backend-api-mb18.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error('Failed to create product');
      
      await fetchProducts();
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        discountPrice: 0,
        thumbnail: '',
        images: [''],
        category: '',
        stock: 0,
        isActive: true
      });
      setToast({ message: 'Product created successfully!', type: 'success' });
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to create product', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Update product
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      setLoading(true);
      const response = await fetch(`https://backend-api-mb18.onrender.com/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingProduct),
      });

      if (!response.ok) throw new Error('Failed to update product');
      
      await fetchProducts();
      setEditingProduct(null);
      setToast({ message: 'Product updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to update product', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete the product "${product.name}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      const response = await fetch(`https://backend-api-mb18.onrender.com/api/products/${product._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) throw new Error('Failed to delete product');
      
      await fetchProducts();
      setToast({ message: `Product "${product.name}" deleted successfully!`, type: 'success' });
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to delete product', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-manager">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="product-form">
        <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={editingProduct ? handleUpdate : handleCreate}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={editingProduct ? editingProduct.name : newProduct.name}
              onChange={(e) => editingProduct 
                ? setEditingProduct({...editingProduct, name: e.target.value})
                : setNewProduct({...newProduct, name: e.target.value})}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={editingProduct ? editingProduct.description : newProduct.description}
              onChange={(e) => editingProduct
                ? setEditingProduct({...editingProduct, description: e.target.value})
                : setNewProduct({...newProduct, description: e.target.value})}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              value={editingProduct ? editingProduct.price : newProduct.price}
              onChange={(e) => editingProduct
                ? setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})
                : setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
              required
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Discount Price</label>
            <input
              type="number"
              value={editingProduct ? editingProduct.discountPrice || 0 : newProduct.discountPrice}
              onChange={(e) => editingProduct
                ? setEditingProduct({...editingProduct, discountPrice: parseFloat(e.target.value)})
                : setNewProduct({...newProduct, discountPrice: parseFloat(e.target.value)})}
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              value={editingProduct ? editingProduct.stock : newProduct.stock}
              onChange={(e) => editingProduct
                ? setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})
                : setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
              required
              min="0"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              value={editingProduct ? editingProduct.category._id : newProduct.category}
              onChange={(e) => editingProduct
                ? setEditingProduct({
                    ...editingProduct,
                    category: {
                      _id: e.target.value,
                      name: categories.find(c => c._id === e.target.value)?.name || ''
                    }
                  })
                : setNewProduct({...newProduct, category: e.target.value})}
              required
              disabled={loading}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Thumbnail URL</label>
            <input
              type="url"
              value={editingProduct ? editingProduct.thumbnail : newProduct.thumbnail}
              onChange={(e) => editingProduct
                ? setEditingProduct({...editingProduct, thumbnail: e.target.value})
                : setNewProduct({...newProduct, thumbnail: e.target.value})}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
            {editingProduct?.thumbnail && (
              <div className="image-preview">
                <img src={editingProduct.thumbnail} alt="Product thumbnail" />
              </div>
            )}
            {!editingProduct && newProduct.thumbnail && (
              <div className="image-preview">
                <img src={newProduct.thumbnail} alt="Product thumbnail" />
              </div>
            )}
          </div>
          <div className="form-group">
            <label>Additional Images</label>
            <div className="image-list">
              {(editingProduct ? editingProduct.images : newProduct.images).map((image, index) => (
                <div key={index} className="image-input-group">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => {
                      const newImages = [...(editingProduct ? editingProduct.images : newProduct.images)];
                      newImages[index] = e.target.value;
                      if (editingProduct) {
                        setEditingProduct({...editingProduct, images: newImages});
                      } else {
                        setNewProduct({...newProduct, images: newImages});
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => {
                      const newImages = [...(editingProduct ? editingProduct.images : newProduct.images)];
                      newImages.splice(index, 1);
                      if (editingProduct) {
                        setEditingProduct({...editingProduct, images: newImages});
                      } else {
                        setNewProduct({...newProduct, images: newImages});
                      }
                    }}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="add-image-button"
                onClick={() => {
                  if (editingProduct) {
                    setEditingProduct({
                      ...editingProduct,
                      images: [...editingProduct.images, '']
                    });
                  } else {
                    setNewProduct({
                      ...newProduct,
                      images: [...newProduct.images, '']
                    });
                  }
                }}
                disabled={loading}
              >
                Add Image
              </button>
            </div>
          </div>
          <div className="form-actions">
            {editingProduct && (
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setEditingProduct(null)}
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>

      <div className="product-list">
        <h3>Products</h3>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.thumbnail ? (
                      <img 
                        src={product.thumbnail} 
                        alt={product.name} 
                        className="product-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category.name}</td>
                  <td>
                    {product.discountPrice ? (
                      <>
                        <span className="original-price">${product.price.toFixed(2)}</span>
                        <span className="discount-price">${product.discountPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </td>
                  <td>{product.stock}</td>
                  <td>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(product)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductManager; 