import { useEffect, useState } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const CATEGORY_COLORS = { Rice: 'blue', Noodles: 'teal', Beverages: 'amber', Bread: 'gray', Desserts: 'teal', Grills: 'red' };

const emptyForm = { name: '', description: '', base_price: '', category: '' };

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    getMenuItems().then((r) => setItems(r.data.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', base_price: item.base_price, category: item.category || '' });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.base_price) { setError('Name and price are required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, base_price: parseFloat(form.base_price) };
      if (editing) await updateMenuItem(editing.id, payload);
      else await createMenuItem(payload);
      setShowModal(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this item?')) return;
    await deleteMenuItem(id);
    load();
  };

  const handleActivate = async (id) => {
  await updateMenuItem(id, { is_active: true });
  load();
};

  if (loading) return <Spinner />;

  const active = items.filter((i) => i.is_active);
  const inactive = items.filter((i) => !i.is_active);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Master Menu</h1>
        <button onClick={openCreate} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
          + Add item
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {active.length === 0 ? <EmptyState message="No menu items yet." /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Base price</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...active, ...inactive].map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                  </td>
                  <td className="px-5 py-3.5">
                    {item.category && <Badge color={CATEGORY_COLORS[item.category] || 'gray'}>{item.category}</Badge>}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-blue-700">BDT {parseFloat(item.base_price).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <Badge color={item.is_active ? 'green' : 'gray'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {item.is_active ? (
                      <>
                        <button onClick={() => openEdit(item)} className="text-xs text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                        <button onClick={() => handleDelete(item.id)} className="text-xs text-red-500 hover:text-red-700">Deactivate</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleActivate(item.id)} className="text-xs text-green-600 hover:text-green-800 mr-3">Activate</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? 'Edit menu item' : 'Add menu item'} onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nasi Lemak" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Base price (BDT) *</label>
              <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Rice, Beverages" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Description</label>
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleSave} disabled={saving} className="w-full bg-blue-700 text-white text-sm py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create item'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
