import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CartItem } from '../types';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';

interface PaymentProps {
  onSuccess: () => void;
}

export default function Payment({ onSuccess }: PaymentProps) {
  const { user, profile } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'paypal' | 'cash'>('visa');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState('');
  const [contactEmail, setContactEmail] = useState(profile?.email || '');
  const [contactPhone, setContactPhone] = useState('');

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [paypalEmail, setPaypalEmail] = useState('');

  const loadCartItems = useCallback(async () => {
    const { data } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', user?.id);

    if (data) {
      setCartItems(data as CartItem[]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadCartItems();
    }
  }, [user, loadCartItems]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user?.id,
            total_amount: calculateTotal(),
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            delivery_date: deliveryDate.toISOString().split('T')[0],
            status: 'processing',
            contact_email: contactEmail,
            contact_phone: contactPhone,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price: item.product?.discount_price || item.product?.price || 0,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      await supabase.from('cart_items').delete().eq('user_id', user?.id);

      alert('Order placed successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl lg:text-[2rem] font-bold text-slate-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Shipping Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Shipping Address
                </label>
                <textarea
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Payment Method</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('visa')}
                className={`p-4 border-2 rounded-lg transition ${
                  paymentMethod === 'visa'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-7 h-7 mx-auto mb-2 text-slate-900" />
                <div className="font-semibold text-slate-900">Credit/Debit Card</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('paypal')}
                className={`p-4 border-2 rounded-lg transition ${
                  paymentMethod === 'paypal'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Wallet className="w-7 h-7 mx-auto mb-2 text-slate-900" />
                <div className="font-semibold text-slate-900">PayPal</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-4 border-2 rounded-lg transition ${
                  paymentMethod === 'cash'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <DollarSign className="w-7 h-7 mx-auto mb-2 text-slate-900" />
                <div className="font-semibold text-slate-900">Cash on Delivery</div>
              </button>
            </div>

            {paymentMethod === 'visa' && (
              <div className="space-y-4 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      maxLength={5}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                    <input
                      type="text"
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={3}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="border-t pt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  PayPal Email
                </label>
                <input
                  type="email"
                  required
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="paypal@example.com"
                />
              </div>
            )}

            {paymentMethod === 'cash' && (
              <div className="border-t pt-6">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800">
                    You will pay with cash when your order is delivered. Please have the exact amount
                    ready.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-slate-600">
                  <span>
                    {item.product?.name} (Size: {item.size}) x {item.quantity}
                  </span>
                  <span>
                    $
                    {(
                      (item.product?.discount_price || item.product?.price || 0) * item.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between text-xl font-bold text-slate-900">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
