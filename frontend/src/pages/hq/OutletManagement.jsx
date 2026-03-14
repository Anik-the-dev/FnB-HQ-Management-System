import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOutlets, createOutlet, getMenuItems, getOutletMenu,
  assignMenuItem, updateAssignment, removeAssignment,
} from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function OutletManagement() {
  const [outlets, setOutlets] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [outletMenu, setOutletMenu] = useState([]);
  const [showCreateOutlet, setShowCreateOutlet] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [outletForm, setOutletForm] = useState({ name: '', location: '' });
  const [assignForm, setAssignForm] = useState({ menu_item_id: '', override_price: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = () =>
    Promise.all([getOutlets(), getMenuItems()])
      .then(([o, m]) => { setOutlets(o.data.data); setMenuItems(m.data.data); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const selectOutlet = (outlet) => {
    setSelected(outlet);
    getOutletMenu(outlet.id).then((r) => setOutletMenu(r.data.data));
  };

  const handleCreateOutlet = async () => {
    if (!outletForm.name.trim()) { setError('Name is required.'); return; }
    setSaving(true); setError('');
    try {
      await createOutlet(outletForm);
      setShowCreateOutlet(false);
      setOutletForm({ name: '', location: '' });
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Error creating outlet.');
    } finally { setSaving(false); }
  };

  const handleAssign = async () => {
    if (!assignForm.menu_item_id) { setError('Select a menu item.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { menu_item_id: parseInt(assignForm.menu_item_id) };
      if (assignForm.override_price) payload.override_price = parseFloat(assignForm.override_price);
      await assignMenuItem(selected.id, payload);
      setShowAssign(false);
      setAssignForm({ menu_item_id: '', override_price: '' });
      getOutletMenu(selected.id).then((r) => setOutletMenu(r.data.data));
    } catch (e) {
      setError(e.response?.data?.error || 'Error assigning item.');
    } finally { setSaving(false); }
  };

  const handleRemove = async (menuItemId) => {
    if (!confirm('Remove this item from outlet?')) return;
    await removeAssignment(selected.id, menuItemId);
    getOutletMenu(selected.id).then((r) => setOutletMenu(r.data.data));
  };

  const handleToggleAvailable = async (menuItemId, currentVal) => {
    await updateAssignment(selected.id, menuItemId, { is_available: !currentVal });
    getOutletMenu(selected.id).then((r) => setOutletMenu(r.data.data));
  };

  const assignedIds = outletMenu.map((i) => i.menu_item_id);
  const unassigned = menuItems.filter((m) => m.is_active && !assignedIds.includes(m.id));

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Outlet Management</h1>
        <button onClick={() => { setShowCreateOutlet(true); setError(''); }} className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
          + Add outlet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Outlet list */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Outlets</h2>
          <div className="space-y-2">
            {outlets.map((o) => (
              <div
                key={o.id}
                onClick={() => selectOutlet(o)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selected?.id === o.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'}`}
              >
                <p className="text-sm font-medium text-gray-800">{o.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{o.location}</p>
                {/* <div className="flex gap-2 mt-1.5">
                  <Badge color={o.is_active ? 'green' : 'gray'}>{o.is_active ? 'Active' : 'Inactive'}</Badge>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/outlet/${o.id}/pos`); }}
                    className="text-xs text-teal-600 hover:text-teal-800"
                  >
                    Open POS →
                  </button>
                </div> */}
              </div>
            ))}
          </div>
        </div>

        {/* Assigned menu */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm py-12">
              Select an outlet to manage its menu
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">Menu — {selected.name}</h2>
                <button
                  onClick={() => { setShowAssign(true); setError(''); setAssignForm({ menu_item_id: '', override_price: '' }); }}
                  disabled={unassigned.length === 0}
                  className="text-xs bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 disabled:opacity-40 transition-colors"
                >
                  + Assign item
                </button>
              </div>

              {outletMenu.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No items assigned yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs text-gray-500">Item</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500">Base price</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500">Outlet price</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500">Status</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {outletMenu.map((item) => (
                      <tr key={item.menu_item_id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 font-medium text-gray-800">{item.name}</td>
                        <td className="px-3 py-2.5 text-gray-500">BDT {parseFloat(item.base_price).toFixed(2)}</td>
                        <td className="px-3 py-2.5 font-medium text-blue-700">
                          BDT {parseFloat(item.effective_price).toFixed(2)}
                          {item.override_price && <span className="text-xs text-amber-600 ml-1">(override)</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => handleToggleAvailable(item.menu_item_id, item.is_available)}>
                            <Badge color={item.is_available ? 'green' : 'gray'}>{item.is_available ? 'Available' : 'Unavailable'}</Badge>
                          </button>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button onClick={() => handleRemove(item.menu_item_id)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create outlet modal */}
      {showCreateOutlet && (
        <Modal title="Add outlet" onClose={() => setShowCreateOutlet(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Outlet name *</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={outletForm.name} onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })} placeholder="e.g. Outlet Downtown" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Location</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={outletForm.location} onChange={(e) => setOutletForm({ ...outletForm, location: e.target.value })} placeholder="Address" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleCreateOutlet} disabled={saving} className="w-full bg-blue-700 text-white text-sm py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {saving ? 'Creating...' : 'Create outlet'}
            </button>
          </div>
        </Modal>
      )}

      {/* Assign item modal */}
      {showAssign && (
        <Modal title={`Assign item to ${selected?.name}`} onClose={() => setShowAssign(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Menu item *</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={assignForm.menu_item_id} onChange={(e) => setAssignForm({ ...assignForm, menu_item_id: e.target.value })}>
                <option value="">Select item...</option>
                {unassigned.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} — BDT {parseFloat(m.base_price).toFixed(2)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Override price (BDT) — leave blank to use base price</label>
              <input type="number" min="0" step="0.01" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" value={assignForm.override_price} onChange={(e) => setAssignForm({ ...assignForm, override_price: e.target.value })} placeholder="Optional" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button onClick={handleAssign} disabled={saving} className="w-full bg-blue-700 text-white text-sm py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {saving ? 'Assigning...' : 'Assign item'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
