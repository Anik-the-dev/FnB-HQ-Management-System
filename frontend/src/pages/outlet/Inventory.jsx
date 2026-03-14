import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getInventory, adjustStock } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

function stockColor(qty, threshold) {
  if (qty === 0) return 'bg-red-100 text-red-700';
  if (qty <= threshold) return 'bg-amber-100 text-amber-700';
  return 'bg-green-100 text-green-700';
}

export default function Inventory() {
  const { id } = useParams();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restockItem, setRestockItem] = useState(null);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () =>
    getInventory(id).then((r) => setInventory(r.data.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const openRestock = (item) => { setRestockItem(item); setAmount(''); setError(''); };

  const handleRestock = async () => {
    if (!amount || parseInt(amount) <= 0) { setError('Enter a positive number.'); return; }
    setSaving(true); setError('');
    try {
      await adjustStock(id, restockItem.menu_item_id, { adjustment: parseInt(amount) });
      setRestockItem(null);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to restock.');
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const low = inventory.filter((i) => i.quantity_on_hand > 0 && i.quantity_on_hand <= i.low_stock_threshold);
  const empty = inventory.filter((i) => i.quantity_on_hand === 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-2">Inventory</h1>

      {(low.length > 0 || empty.length > 0) && (
        <div className="mb-5 space-y-2">
          {empty.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {empty.length} item{empty.length > 1 ? 's' : ''} out of stock: {empty.map((i) => i.menu_item_name).join(', ')}
            </div>
          )}
          {low.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              {low.length} item{low.length > 1 ? 's' : ''} running low: {low.map((i) => i.menu_item_name).join(', ')}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {inventory.length === 0 ? <EmptyState message="No inventory records." /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Item</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Stock</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Low stock at</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inventory.map((item) => (
                <tr key={item.menu_item_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-800">{item.menu_item_name}</td>
                  <td className="px-5 py-3.5 text-gray-500">{item.category || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${stockColor(item.quantity_on_hand, item.low_stock_threshold)}`}>
                      {item.quantity_on_hand} units
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{item.low_stock_threshold} units</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => openRestock(item)}
                      className="text-xs bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors font-medium"
                    >
                      + Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {restockItem && (
        <Modal title={`Restock — ${restockItem.menu_item_name}`} onClose={() => setRestockItem(null)}>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
              Current stock: <span className="font-semibold text-gray-800">{restockItem.quantity_on_hand} units</span>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Add quantity *</label>
              <input
                type="number"
                min="1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50"
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleRestock}
              disabled={saving}
              className="w-full bg-teal-700 text-white text-sm py-2.5 rounded-lg hover:bg-teal-800 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Add stock'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
