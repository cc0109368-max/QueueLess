import React, { useEffect, useState } from 'react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../api/adminClient';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchCategories().then((data) => {
      setCategories(data.categories || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setSortOrder(categories.length);
    setIsActive(true);
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSortOrder(cat.sortOrder);
    setIsActive(cat.isActive);
    setError(null);
    setShowModal(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name, slug, sortOrder: Number(sortOrder), isActive });
      } else {
        await createCategory({ name, slug, sortOrder: Number(sortOrder), isActive });
      }
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat: any) => {
    try {
      await updateCategory(cat.id, { isActive: !cat.isActive });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update category status');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Products inside may become unorganized.`)) return;
    try {
      await deleteCategory(id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Loading categories...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Category Management</h1>
          <p className="page-desc">Organize menu categories and configure display order on customer menu</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>Order</th>
              <th>Category Name</th>
              <th>Slug / Identifier</th>
              <th>Products Count</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                  No categories found. Click "Add Category" to create one.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 600 }}>#{cat.sortOrder}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{cat.name}</td>
                  <td style={{ color: '#64748b', fontSize: '0.85rem' }}><code>{cat.slug}</code></td>
                  <td>
                    <span className="badge badge-pending">
                      {cat.products ? cat.products.length : 0} products
                    </span>
                  </td>
                  <td>
                    {cat.isActive ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                        Active
                      </span>
                    ) : (
                      <span className="badge badge-danger">
                        <XCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                        Disabled
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => openEditModal(cat)}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', color: cat.isActive ? '#dc2626' : '#16a34a' }}
                        onClick={() => handleToggleStatus(cat)}
                      >
                        {cat.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#dc2626' }}
                        onClick={() => handleDelete(cat.id, cat.name)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 8, width: 420, maxWidth: '90%' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: 10, borderRadius: 6, marginBottom: 12, fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Category Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  style={{ width: '100%' }}
                  placeholder="e.g. Cakes, Desserts"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>URL Slug</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  style={{ width: '100%' }}
                  placeholder="e.g. cakes"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Display Sort Order</label>
                <input
                  type="number"
                  required
                  className="input-field"
                  style={{ width: '100%' }}
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActive" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  Active on Customer Menu
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
