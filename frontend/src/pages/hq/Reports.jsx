import { useEffect, useState } from 'react';
import { getOutlets, getRevenueReport, getTopItems } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [outlets, setOutlets] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [loading, setLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(false);

  useEffect(() => {
    Promise.all([getOutlets(), getRevenueReport()])
      .then(([o, r]) => {
        setOutlets(o.data.data);
        setRevenue(r.data.data);
        if (o.data.data.length > 0) {
          const first = o.data.data[0].id;
          setSelectedOutlet(first);
          return getTopItems(first);
        }
      })
      .then((t) => { if (t) setTopItems(t.data.data); })
      .finally(() => setLoading(false));
  }, []);

  const handleOutletChange = (id) => {
    setSelectedOutlet(id);
    setTopLoading(true);
    getTopItems(id).then((r) => setTopItems(r.data.data)).finally(() => setTopLoading(false));
  };

  if (loading) return <Spinner />;

  const totalRevenue = revenue.reduce((s, r) => s + parseFloat(r.total_revenue), 0);
  const totalSales = revenue.reduce((s, r) => s + parseInt(r.total_sales), 0);
  const chartData = revenue.map((r) => ({
    name: r.outlet_name.replace('Outlet ', ''),
    revenue: parseFloat(parseFloat(r.total_revenue).toFixed(2)),
    sales: parseInt(r.total_sales),
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-5">Reports</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total revenue" value={`BDT ${totalRevenue.toFixed(2)}`} />
        <StatCard label="Total sales" value={totalSales} />
        <StatCard label="Outlets reporting" value={revenue.filter((r) => parseInt(r.total_sales) > 0).length} />
        <StatCard label="Best outlet" value={revenue[0]?.outlet_name?.replace('Outlet ', '') || '-'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue by outlet</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `BDT ${v}`} />
              <Tooltip formatter={(v, n) => [n === 'revenue' ? `BDT ${v}` : v, n === 'revenue' ? 'Revenue' : 'Sales']} />
              <Bar dataKey="revenue" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top items */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Top 5 items</h2>
            <select
              value={selectedOutlet}
              onChange={(e) => handleOutletChange(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>

          {topLoading ? <Spinner /> : topItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No sales data yet.</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={item.menu_item_id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-semibold text-gray-400">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-xs font-semibold text-blue-700">BDT {parseFloat(item.total_revenue).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                        <div
                          className="h-1.5 bg-blue-500 rounded-full"
                          style={{ width: `${(item.total_quantity / topItems[0].total_quantity) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{item.total_quantity} sold</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue table */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Outlet</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Total sales</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Total revenue</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {revenue.map((r) => (
                <tr key={r.outlet_id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{r.outlet_name}</td>
                  <td className="px-5 py-3 text-gray-600">{r.total_sales}</td>
                  <td className="px-5 py-3 font-semibold text-blue-700">BDT {parseFloat(r.total_revenue).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                        <div className="h-1.5 bg-blue-400 rounded-full" style={{ width: totalRevenue > 0 ? `${(parseFloat(r.total_revenue) / totalRevenue) * 100}%` : '0%' }} />
                      </div>
                      <span className="text-xs text-gray-400">
                        {totalRevenue > 0 ? `${((parseFloat(r.total_revenue) / totalRevenue) * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
