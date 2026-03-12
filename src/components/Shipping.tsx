import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getProductImageUrl } from '../lib/productImages';
import { useAuth } from '../contexts/AuthContext';
import { Order, OrderItem } from '../types';
import { Package, MapPin, Phone, Mail, Calendar, Clock } from 'lucide-react';

export default function Shipping() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<{ [key: string]: OrderItem[] }>({});
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (ordersData) {
      setOrders(ordersData);

      for (const order of ordersData) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*, product:products(*)')
          .eq('order_id', order.id);

        if (items) {
          setOrderItems((prev) => ({ ...prev, [order.id]: items as OrderItem[] }));
        }
      }
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-amber-100 text-amber-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No orders yet</h2>
          <p className="text-slate-600">Your orders will appear here once you make a purchase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-slate-900 text-white px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-sm opacity-75">Order ID</div>
                    <div className="font-mono font-semibold">{order.id.substring(0, 8).toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Order Date</div>
                    <div className="font-semibold">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Total Amount</div>
                    <div className="text-2xl font-bold">${order.total_amount.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-slate-600 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">Order Status</div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-600 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">Estimated Delivery</div>
                        <div className="text-slate-700">
                          {new Date(order.delivery_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-slate-600 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">Payment Method</div>
                        <div className="text-slate-700 capitalize">{order.payment_method}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-slate-600 mt-1" />
                      <div>
                        <div className="font-semibold text-slate-900 mb-1">Shipping Address</div>
                        <div className="text-slate-700 whitespace-pre-line">{order.shipping_address}</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="font-semibold text-slate-900 mb-3">Contact Information</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Mail className="w-4 h-4 text-slate-500" />
                          <a href={`mailto:${order.contact_email}`} className="hover:underline">
                            {order.contact_email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-4 h-4 text-slate-500" />
                          <a href={`tel:${order.contact_phone}`} className="hover:underline">
                            {order.contact_phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Order Items</h3>
                  <div className="space-y-3">
                    {orderItems[order.id]?.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg">
                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          {item.product ? (
                            <img
                              src={getProductImageUrl(item.product.name, item.product.image_url || '')}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-500">
                            {item.product?.brand}
                          </div>
                          <div className="font-semibold text-slate-900">{item.product?.name}</div>
                          <div className="text-sm text-slate-600">
                            Size: {item.size} | Quantity: {item.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">${item.price.toFixed(2)}</div>
                          <div className="text-sm text-slate-600">each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-900 mb-1">Need Help?</div>
              <p className="text-sm text-blue-800">
                If you have any questions or concerns about your order, please contact us using
                the contact information above. Our customer service team is here to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
