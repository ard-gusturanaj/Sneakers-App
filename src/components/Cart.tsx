import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProductImageUrl } from '../lib/productImages';
import { CartItem } from '../types';
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface CartProps {
  onCheckout: () => void;
  cartItems: CartItem[];
  onUpdateCart: () => void;
}

export default function Cart({ onCheckout, cartItems, onUpdateCart }: CartProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCartItems = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user?.id);

    if (data) {
      setItems(data as CartItem[]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadCartItems();
    }
  }, [user, cartItems, loadCartItems]);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    await loadCartItems();
    onUpdateCart();
  };

  const removeItem = async (itemId: string) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    await loadCartItems();
    onUpdateCart();
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading cart...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-600">Start shopping to add items to your cart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product ? (
                      <img
                        src={getProductImageUrl(item.product.name, item.product.image_url || '')}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="text-sm font-semibold text-slate-500">
                          {item.product?.brand}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{item.product?.name}</h3>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-sm text-slate-600 mb-3">Size: {item.size}</div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-lg font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.product?.discount_price ? (
                          <>
                            <div className="text-2xl font-bold text-slate-900">
                              ${(item.product.discount_price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-400 line-through">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-slate-900">
                            ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex justify-between text-xl font-bold text-slate-900">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="w-full bg-slate-900 text-white py-4 rounded-lg font-semibold hover:bg-slate-800 transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
