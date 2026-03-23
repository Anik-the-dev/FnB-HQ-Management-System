import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOutlets, getRevenueReport } from '../../services/api.js';
import StatCard from '../../components/ui/StatCard.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [outlets, setOutlets] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    Promise.all([getOutlets(), getRevenueReport()])
      .then(([outletsResponse, revenueResponse]) => {
        setOutlets(outletsResponse.data.data);
        setRevenue(revenueResponse.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const totalRevenue = revenue.reduce((sum, revenueItem) => sum + parseFloat(revenueItem.total_revenue), 0);
  const totalSales = revenue.reduce((sum, revenueItem) => sum + parseInt(revenueItem.total_sales), 0);
  const chartData = revenue.map((revenueItem) => ({
    name: revenueItem.outlet_name.replace('Outlet', ''),
    revenue: parseFloat(parseFloat(revenueItem.total_revenue).toFixed(2)),
  }));

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-5">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Outlets" value={outlets.length} />
        <StatCard label="Total sales" value={totalSales} />
        <StatCard label="Total revenue" value={`BDT ${totalRevenue.toFixed(2)}`} />
        <StatCard label="Active outlets" value={outlets.filter((outlet) => outlet.is_active).length} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue by outlet</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `BDT ${v}`} />
              <Tooltip formatter={(v) => [`BDT ${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Outlets</h2>
          <div className="space-y-2">
            {outlets.map((outlet) => (
              <div
                key={outlet.id}
                onClick={() => navigate(`/outlet/${outlet.id}/pos`)}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{outlet.name}</p>
                  <p className="text-xs text-gray-400">{outlet.location}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${outlet.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {outlet.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
