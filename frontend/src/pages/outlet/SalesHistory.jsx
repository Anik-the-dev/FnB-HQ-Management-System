import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSales, getSaleByReceipt } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Modal from '../../components/ui/Modal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';

export default function SalesHistory() {
  const { id } = useParams();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getSales(id, { limit: 50 })
      .then((r) => setSales(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const openDetail = (sale) => {
    setSelected(sale);
    setDetail(null);
    setDetailLoading(true);
    getSaleByReceipt(id, sale.receipt_number)
      .then((r) => setDetail(r.data.data))
      .finally(() => setDetailLoading(false));
  };

  const formatTime = (dt) => {
    const d = new Date(dt);
    return d.toLocaleString('en-MY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const totalRevenue = sales.reduce((s, t) => s + parseFloat(t.total_amount), 0);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Sales History</h1>
        {sales.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400">Total ({sales.length} sales)</p>
            <p className="text-lg font-bold text-teal-700">BDT {totalRevenue.toFixed(2)}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {sales.length === 0 ? <EmptyState message="No sales recorded yet." /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Receipt</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Date & time</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Total</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs font-medium text-gray-700">{sale.receipt_number}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{formatTime(sale.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-teal-700">BDT {parseFloat(sale.total_amount).toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => openDetail(sale)} className="text-xs text-blue-600 hover:text-blue-800">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <Modal title={`Receipt — ${selected.receipt_number}`} onClose={() => setSelected(null)}>
          {detailLoading ? <Spinner /> : detail ? (
            <div>
              <div className="space-y-2 mb-4">
                {detail.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.menu_item_name} <span className="text-gray-400">x{item.quantity}</span>
                      <span className="text-xs text-gray-400 ml-1">@ BDT {parseFloat(item.unit_price).toFixed(2)}</span>
                    </span>
                    <span className="font-medium text-gray-800">BDT {parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="font-bold text-teal-700 text-base">BDT {parseFloat(detail.total_amount).toFixed(2)}</span>
              </div>
              {detail.notes && (
                <p className="text-xs text-gray-400 mt-3">Notes: {detail.notes}</p>
              )}
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}
