import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchCategories, fetchCounters, createProduct, updateProduct } from '../api/adminClient';
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [counters, setCounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [counterId, setCounterId] = useState('');

  const loadData = () => {
    Promise.all([fetchProducts(), fetchCategories(), fetchCounters()])
      .then(([prodRes, catRes, countRes]) => {
        setProducts(prodRes.products || []);
        setCategories(catRes.categories || []);
        setCounters(countRes.counters || []);
        if (catRes.categories?.[0]) setCategoryId(catRes.categories[0].id);
        if (countRes.counters?.[0]) setCounterId(countRes.counters[0].id);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async (product: any) => {
    const newStatus = product.availability === 'AVAILABLE' ? 'SOLD_OUT' : 'AVAILABLE';
    await updateProduct(product.id, { availability: newStatus });
    loadData();
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProduct({
      name,
      price: parseFloat(price),
      categoryId,
      counterId: counterId || undefined,
    });
    setShowForm(false);
    setName('');
    setPrice('');
    loadData();
  };

  if (loading) return <div>Loading menu items...</div>;

  return (
    <div>
      <div className="top-bar">
        <h1 className="page-title">Menu & Items Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add New Item
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateProduct}
          style={{
            background: '#ffffff',
            padding: 20,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            marginBottom: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Item Name</label>
            <input
              type="text"
              required
              className="input-field"
              style={{ width: '100%' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Price (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              className="input-field"
              style={{ width: '100%' }}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Category</label>
            <select
              className="input-field"
              style={{ width: '100%' }}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600 }}>Counter Assignment</label>
            <select
              className="input-field"
              style={{ width: '100%' }}
              value={counterId}
              onChange={(e) => setCounterId(e.target.value)}
            >
              <option value="">None (Unassigned)</option>
              {counters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary">
              Save Product
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Counter</th>
              <th>Price</th>
              <th>Availability Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ fontWeight: 600 }}>{product.name}</td>
                <td>{product.category?.name}</td>
                <td>{product.counter?.name || 'Unassigned'}</td>
                <td style={{ fontWeight: 700 }}>₹{product.price.toFixed(2)}</td>
                <td>
                  <span
                    className={`badge ${
                      product.availability === 'AVAILABLE' ? 'badge-paid' : 'badge-cancelled'
                    }`}
                  >
                    {product.availability}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                    onClick={() => handleToggleAvailability(product)}
                  >
                    {product.availability === 'AVAILABLE' ? (
                      <>
                        <ToggleLeft size={16} /> Mark Sold Out
                      </>
                    ) : (
                      <>
                        <ToggleRight size={16} color="#16a34a" /> Mark Available
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
