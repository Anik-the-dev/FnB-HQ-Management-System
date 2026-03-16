import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOutletMenu, createSale } from '../../services/api.js';
import Spinner from '../../components/ui/Spinner.jsx';
import Badge from '../../components/ui/Badge.jsx';

const CATEGORY_COLORS = { Rice: 'blue', Noodles: 'teal', Beverages: 'amber', Bread: 'gray', Desserts: 'teal', Grills: 'red' };

export default function POS() {
  const { id } = useParams();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getOutletMenu(id)
      .then((response) => setMenu(response.data.data.filter((menuItem) => menuItem.is_available)))
      .finally(() => setLoading(false));
  }, [id]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((cartItem) => cartItem.menu_item_id === item.menu_item_id);
      if (existing) return prevCart.map((cartItem) => cartItem.menu_item_id === item.menu_item_id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      return [...prevCart, { menu_item_id: item.menu_item_id, name: item.name, price: parseFloat(item.effective_price), quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart((prevCart) => {
      const existing = prevCart.find((cartItem) => cartItem.menu_item_id === menuItemId);
      if (existing.quantity === 1) return prevCart.filter((cartItem) => cartItem.menu_item_id !== menuItemId);
      return prevCart.map((cartItem) => cartItem.menu_item_id === menuItemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem);
    });
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0);

  const handleConfirm = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await createSale({
        outlet_id: parseInt(id),
        items: cart.map((c) => ({ menu_item_id: c.menu_item_id, quantity: c.quantity })),
      });
      setReceipt(res.data.data);
      setCart([]);
    } catch (e) {
      const details = e.response?.data?.details;
      if (details) {
        setError(details.map((d) => `${d.name}: need ${d.requested}, only ${d.available} left`).join(' | '));
      } else {
        setError(e.response?.data?.error || 'Sale failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner />;

  // Receipt view
  if (receipt) {
    return (
      <div className="max-w-sm mx-auto mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="bg-teal-700 text-white text-center py-5 px-6">
            <div className="text-xs text-teal-200 mb-1">Sale confirmed</div>
            <div className="font-mono text-sm font-medium">{receipt.receipt_number}</div>
          </div>
          <div className="p-5">
            <div className="space-y-2 mb-4">
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.menu_item_name} <span className="text-gray-400">x{item.quantity}</span></span>
                  <span className="font-medium text-gray-800">BDT {parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-bold text-teal-700 text-lg">BDT {parseFloat(receipt.total_amount).toFixed(2)}</span>
            </div>
            <button
              onClick={() => setReceipt(null)}
              className="w-full mt-5 bg-teal-700 text-white text-sm py-3 rounded-xl hover:bg-teal-800 transition-colors font-medium"
            >
              New sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(menu.map((menuItem) => menuItem.category).filter(Boolean))];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Menu panel */}
      <div className="md:col-span-2">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">POS</h1>
        {categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge color={CATEGORY_COLORS[category] || 'gray'}>{category}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {menu.filter((menuItem) => menuItem.category === category).map((item) => {
                  const inCart = cart.find((cartItem) => cartItem.menu_item_id === item.menu_item_id);
                  return (
                    <div
                        key={item.menu_item_id}
                        className={`relative p-3 rounded-xl border transition-all ${inCart ? 'border-teal-400 bg-teal-50' : 'border-gray-100 bg-white hover:border-teal-300 hover:bg-teal-50/50'}`}
                      >
                        <p className="text-sm font-medium text-gray-800">{item.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm font-semibold text-teal-700">BDT {parseFloat(item.effective_price).toFixed(2)}</p>
                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => removeFromCart(item.menu_item_id)}
                                className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 text-sm font-bold flex items-center justify-center transition-colors"
                              >−</button>
                              <span className="text-sm font-semibold text-teal-700 w-4 text-center">{inCart.quantity}</span>
                              <button
                                onClick={() => addToCart(item)}
                                className="w-6 h-6 rounded-full bg-teal-600 text-white hover:bg-teal-700 text-sm font-bold flex items-center justify-center transition-colors"
                              >+</button>
                     </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-6 h-6 rounded-full bg-teal-600 text-white hover:bg-teal-700 text-sm font-bold flex items-center justify-center transition-colors"
                      >+</button>
                    )}
                  </div>
                </div>
                );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {menu.map((item) => {
              const inCart = cart.find((cartItem) => cartItem.menu_item_id === item.menu_item_id);
              return (
                <button
                  key={item.menu_item_id}
                  onClick={() => addToCart(item)}
                  className={`relative text-left p-3 rounded-xl border transition-all ${inCart ? 'border-teal-400 bg-teal-50' : 'border-gray-100 bg-white hover:border-teal-300 hover:bg-teal-50/50'}`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 bg-teal-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {inCart.quantity}
                    </span>
                  )}
                  <p className="text-sm font-medium text-gray-800 pr-6">{item.name}</p>
                  <p className="text-sm font-semibold text-teal-700 mt-1">BDT {parseFloat(item.effective_price).toFixed(2)}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 h-fit sticky top-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Order summary</h2>

        {cart.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Tap items to add</p>
        ) : (
          <div className="space-y-2 mb-4">
            {cart.map((cartItem) => (
              <div key={cartItem.menu_item_id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => removeFromCart(cartItem.menu_item_id)} className="w-5 h-5 rounded-full border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-300 text-xs flex items-center justify-center transition-colors">−</button>
                  <span className="text-sm text-gray-700">{cartItem.name}</span>
                  <span className="text-xs text-gray-400">x{cartItem.quantity}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">BDT {(cartItem.price * cartItem.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-3 mb-4">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="font-bold text-teal-700 text-lg">BDT {total.toFixed(2)}</span>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mb-3 bg-red-50 p-2 rounded-lg">{error}</p>}

        <div className="space-y-2">
          <button
            onClick={handleConfirm}
            disabled={cart.length === 0 || submitting}
            className="w-full bg-teal-700 text-white text-sm py-3 rounded-xl hover:bg-teal-800 disabled:opacity-40 transition-colors font-medium"
          >
            {submitting ? 'Processing...' : 'Confirm sale'}
          </button>
          {cart.length > 0 && (
            <button onClick={clearCart} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1 transition-colors">
              Clear order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
