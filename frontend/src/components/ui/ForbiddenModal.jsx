
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ForbiddenModal() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
        console.log('forbidden event caught', e.detail); 
      setMessage(e.detail.message);
      setShow(true);
    };
    window.addEventListener('fnb:forbidden', handler);
    return () => window.removeEventListener('fnb:forbidden', handler);
  }, []);

  const goHome = () => {
    setShow(false);
    if (user?.role === 'admin') navigate('/');
    else navigate(`/outlet/${user?.outlet_id}/pos`);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 text-xl">🔒</span>
        </div>
        <h2 className="text-base font-semibold text-gray-800 mb-2">Access denied</h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <button
          onClick={goHome}
          className="w-full bg-blue-700 text-white text-sm py-2.5 rounded-xl hover:bg-blue-800 transition-colors font-medium"
        >
          Go to my outlet
        </button>
      </div>
    </div>
  );
}