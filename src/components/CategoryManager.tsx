import React, { useState, useEffect, useRef } from 'react';
import './CategoryManager.css';
import Toast from './Toast';

interface Category {
  _id: number;
  name: string;
  description: string;
  image: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '', 
    image: '' 
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://backend-api-mb18.onrender.com/api/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      console.log(data);
      setCategories(data);
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to fetch categories', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create category
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch('https://backend-api-mb18.onrender.com/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) throw new Error('Failed to create category');
      
      await fetchCategories();
      setNewCategory({ name: '', description: '', image: '' });
      setToast({ message: 'Category created successfully!', type: 'success' });
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to create category', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      setLoading(true);
      const response = await fetch(`https://backend-api-mb18.onrender.com/api/categories/${editingCategory._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editingCategory),
      });

      if (!response.ok) throw new Error('Failed to update category');
      
      await fetchCategories();
      setEditingCategory(null);
      setToast({ message: 'Category updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to update category', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      const response = await fetch(`https://backend-api-mb18.onrender.com/api/categories/${category._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) throw new Error('Failed to delete category');
      
      await fetchCategories();
      setToast({ message: `Category "${category.name}" deleted successfully!`, type: 'success' });
    } catch (err) {
      setToast({ 
        message: err instanceof Error ? err.message : 'Failed to delete category', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const menuRef = menuRefs.current[openMenuId];
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  return (
    <div className="category-manager">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="category-form">
        <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
        <form onSubmit={editingCategory ? handleUpdate : handleCreate}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={editingCategory ? editingCategory.name : newCategory.name}
              onChange={(e) => editingCategory 
                ? setEditingCategory({...editingCategory, name: e.target.value})
                : setNewCategory({...newCategory, name: e.target.value})}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={editingCategory ? editingCategory.description : newCategory.description}
              onChange={(e) => editingCategory
                ? setEditingCategory({...editingCategory, description: e.target.value})
                : setNewCategory({...newCategory, description: e.target.value})}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              value={editingCategory ? editingCategory.image : newCategory.image}
              onChange={(e) => editingCategory
                ? setEditingCategory({...editingCategory, image: e.target.value})
                : setNewCategory({...newCategory, image: e.target.value})}
              placeholder="https://example.com/image.jpg"
              disabled={loading}
            />
            {editingCategory?.image && (
              <div className="image-preview">
                <img src={editingCategory.image} alt="Category preview" />
              </div>
            )}
            {!editingCategory && newCategory.image && (
              <div className="image-preview">
                <img src={newCategory.image} alt="Category preview" />
              </div>
            )}
          </div>
          <div className="form-actions">
            {editingCategory && (
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setEditingCategory(null)}
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
              {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>

      <div className="category-list">
        <h3>Categories</h3>
        {loading ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p>No categories found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category._id}>
                  <td>
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="category-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="category-image-placeholder">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td>
                    <button 
                      className="delete-button"
                      onClick={() => handleDelete(category)}
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

export default CategoryManager; 