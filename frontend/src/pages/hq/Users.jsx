import { useEffect, useState } from 'react';
import { getOutlets, getUsers, createUser, deactivateUser, activateUser } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Badge from '../../components/ui/Badge.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

const emptyForm = { username: '', password: '', role: 'outlet', outlet_id: '' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    Promise.all([getUsers(), getOutlets()])
      .then(([u, o]) => { setUsers(u.data.data); setOutlets(o.data.data); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.username || !form.password) { setError('Username and password are required.'); return; }
    if (form.role === 'outlet' && !form.outlet_id) { setError('Select an outlet.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (form.role === 'admin') delete payload.outlet_id;
      else payload.outlet_id = parseInt(payload.outlet_id);
      await createUser(payload);
      setShowModal(false);
      setForm(emptyForm);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to create user.');
    } finally { setSaving(false); }
  };

  const handleToggle = async (user) => {
    if (!confirm(`${user.is_active ? 'Deactivate' : 'Activate'} ${user.username}?`)) return;
    if (user.is_active) await deactivateUser(user.id);
    else await activateUser(user.id);
    load();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Users</h1>
        <button
          onClick={() => { setShowModal(true); setError(''); setForm(emptyForm); }}
          className="bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          + Add user
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {users.length === 0 ? <EmptyState message="No users found." /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Username</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Role</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Outlet</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800 font-mono text-xs">{u.username}</td>
                  <td className="px-5 py-3.5">
                    <Badge color={u.role === 'admin' ? 'blue' : 'teal'}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{u.outlet_name || '—'}</td>
                  <td className="px-5 py-3.5">
                    <Badge color={u.is_active ? 'green' : 'gray'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleToggle(u)}
                      className={`text-xs ${u.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title="Add user" onClose={() => setShowModal(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Username *</label>
              <input
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. outlet4"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Password *</label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Role *</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value, outlet_id: '' })}
              >
                <option value="outlet">Outlet</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {form.role === 'outlet' && (
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Outlet *</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  value={form.outlet_id}
                  onChange={(e) => setForm({ ...form, outlet_id: e.target.value })}
                >
                  <option value="">Select outlet...</option>
                  {outlets.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={saving}
              className="w-full bg-blue-700 text-white text-sm py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Creating...' : 'Create user'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
