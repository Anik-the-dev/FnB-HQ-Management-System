export default function Badge({ children, color = 'blue' }) {
  const colors = {
    blue:  'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red:   'bg-red-100 text-red-700',
    gray:  'bg-gray-100 text-gray-600',
    teal:  'bg-teal-100 text-teal-700',
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}
