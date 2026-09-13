import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  Clock, 
  ArrowRight, 
  Printer, 
  ShieldCheck, 
  MapPin,
  ExternalLink,
  Ban,
  XCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { OrderStatus } from '../types';

export const OrderConfirmationModal: React.FC = () => {
  const { currentOrder, setCurrentView, orders, cancelOrder, showToast } = useStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonOption, setCancelReasonOption] = useState('Changed my mind / No longer needed');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const order = currentOrder || orders[0];

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl text-stone-900 mb-2">No Order Found</h2>
        <button
          type="button"
          onClick={() => setCurrentView('shop')}
          className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Gallery
        </button>
      </div>
    );
  }

  const handleConfirmCancel = async () => {
    const finalReason = cancelReasonOption === 'Other' && customReason.trim()
      ? customReason.trim()
      : cancelReasonOption;
    
    try {
      setIsCancelling(true);
      await cancelOrder(order.id, finalReason, 'Customer');
      setShowCancelModal(false);
      showToast(`Order #${order.orderNumber} successfully cancelled.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const isCancelled = order.status === 'Cancelled';

  const ORDER_STEPS: Array<{ status: OrderStatus; label: string; desc: string }> = [
    { status: 'Pending', label: 'Order Confirmed', desc: 'Payment verified & queued' },
    { status: 'Processing', label: 'Lab Allocation', desc: 'Paper cut & color-calibrated' },
    { status: 'Printed & Framed', label: 'Archival Framing', desc: 'Custom framed with white-glove inspection' },
    { status: 'Shipped', label: 'Dispatched', desc: 'In transit with climate protection' },
    { status: 'Delivered', label: 'Delivered', desc: 'Received at destination' }
  ];

  const getStatusIndex = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Processing': return 1;
      case 'Printed & Framed': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStatusIndex(order.status);

  return (
    <div className="bg-[#faf8f5] min-h-screen py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Celebration / Cancellation Header */}
        {isCancelled ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-rose-200 shadow-sm text-center mb-8">
            <div className="w-16 h-16 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.25em] text-rose-800">
              Order Cancelled • #{order.orderNumber}
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-950 mt-1 mb-3">
              This order has been cancelled
            </h1>

            <p className="text-stone-600 text-sm max-w-lg mx-auto mb-4">
              Cancelled on {new Date(order.cancelledAt || order.createdAt).toLocaleDateString()}
              {order.cancelReason && ` — Reason: "${order.cancelReason}"`}.
            </p>

            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs text-emerald-900 font-semibold">
              <RotateCcw className="w-4 h-4 text-emerald-600" />
              <span>100% Refund of ${order.total} has been returned to your {order.paymentMethod}.</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm text-center mb-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-800">
              Payment Confirmed • Order #{order.orderNumber}
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-950 mt-1 mb-3">
              Thank you for supporting tactile art!
            </h1>

            <p className="text-stone-600 text-sm max-w-lg mx-auto mb-6">
              We’ve queued your physical prints with our master lab. A confirmation email has been dispatched to <strong className="text-stone-900">{order.customer.email}</strong>.
            </p>

            <div className="inline-flex items-center gap-3 bg-stone-50 border border-stone-200 px-4 py-2 rounded-xl text-xs text-stone-700">
              <span>Estimated Delivery: <strong>{order.estimatedDelivery || '3–4 Business Days'}</strong></span>
              <span>•</span>
              <span>Courier: <strong>{order.shippingCarrier || 'FedEx Express Gallery Care'}</strong></span>
            </div>
          </div>
        )}

        {/* Live Tracking Progress Timeline */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-stone-100 gap-2">
            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-950">
                Live Physical Print Progress
              </h3>
              <p className="text-xs text-stone-500">
                Tracking #{order.trackingNumber || 'Pending Courier Scan'}
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
              isCancelled
                ? 'bg-rose-100 text-rose-900 border border-rose-200'
                : 'bg-amber-100 text-amber-900'
            }`}>
              Status: {order.status}
            </span>
          </div>

          {/* Stepper */}
          <div className="relative">
            {/* Horizontal Line for desktop */}
            <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0" />
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative z-10">
              {ORDER_STEPS.map((stepItem, idx) => {
                const isCompleted = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div key={stepItem.status} className="flex sm:flex-col items-center sm:text-center gap-4 sm:gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-stone-950 text-white shadow-md'
                          : 'bg-stone-200 text-stone-500'
                      } ${isCurrent ? 'ring-4 ring-amber-400/50 scale-110' : ''}`}
                    >
                      {idx < currentStepIdx ? '✓' : idx + 1}
                    </div>

                    <div>
                      <div className={`text-xs font-bold ${isCompleted ? 'text-stone-950' : 'text-stone-400'}`}>
                        {stepItem.label}
                      </div>
                      <div className="text-[10px] text-stone-500 hidden sm:block mt-0.5">
                        {stepItem.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log from timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
                Chronological Activity Log
              </h4>
              <div className="space-y-2">
                {order.timeline.map((evt, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-stone-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-stone-900 mr-2">{evt.status}:</span>
                      <span>{evt.note}</span>
                      <span className="text-[10px] text-stone-400 ml-2">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order Details & Receipt */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="font-serif text-lg font-semibold text-stone-950">
              Receipt & Packaging Specifications
            </h3>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>

          {/* Purchased Prints */}
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-18 object-cover rounded shadow-sm shrink-0 border border-stone-200"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-semibold text-stone-900">{item.name}</h4>
                  <p className="text-xs text-stone-500">{item.sizeName} • Frame: {item.frameName}</p>
                  <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-stone-950 font-mono">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    (${item.unitPrice.toFixed(2)} ea)
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Breakdown */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <h5 className="font-bold text-stone-800 uppercase tracking-wider mb-2">
                Shipping Destination
              </h5>
              <p className="text-stone-600 leading-relaxed mb-3">
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.street} {order.shippingAddress.apartment || ''}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-lg text-[11px] text-stone-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paid via <strong>{order.paymentMethod}</strong></span>
                {order.upiTransactionRef && (
                  <span className="font-mono text-stone-500">({order.upiTransactionRef})</span>
                )}
              </div>
            </div>

            <div className="space-y-1.5 text-stone-600 sm:text-right">
              <div className="flex justify-between sm:justify-end sm:gap-6">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-stone-900">${order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between sm:justify-end sm:gap-6 text-amber-700">
                  <span>Discount ({order.couponCode}):</span>
                  <span className="font-mono font-medium">-${order.discount}</span>
                </div>
              )}
              <div className="flex justify-between sm:justify-end sm:gap-6">
                <span>Shipping:</span>
                <span className="font-mono font-medium text-stone-900">
                  {order.shipping === 0 ? 'FREE' : `$${order.shipping}`}
                </span>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-6 text-stone-400">
                <span>Tax:</span>
                <span className="font-mono">${order.tax}</span>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-6 text-base font-bold text-stone-950 pt-2 border-t border-stone-200">
                <span>Total Paid:</span>
                <span className="font-serif">${order.total}</span>
              </div>
            </div>
          </div>

          {/* Return CTA */}
          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentView('shop')}
              className="w-full sm:w-auto px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>Continue Exploring Artworks</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

            <div className="flex items-center gap-4 flex-wrap justify-end">
              {!isCancelled && order.status !== 'Delivered' && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2.5 border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-600" />
                  <span>Cancel Order</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentView('account')}
                className="text-xs font-semibold text-stone-700 hover:text-stone-950 underline"
              >
                View in Customer Order History
              </button>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-scaleUp space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-950">
                      Cancel Order #{order.orderNumber}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Total: ${order.total} • {order.items.length} artwork(s)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Cancellation Reason Selection */}
              <div className="space-y-3 text-xs">
                <label className="block font-semibold text-stone-800">
                  Reason for cancelling:
                </label>
                <select
                  value={cancelReasonOption}
                  onChange={(e) => setCancelReasonOption(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 font-medium text-stone-800"
                >
                  <option value="Changed my mind / No longer needed">Changed my mind / No longer needed</option>
                  <option value="Need to modify frame size or shipping address">Need to modify frame size or shipping address</option>
                  <option value="Found alternative artwork / duplicate order">Found alternative artwork / duplicate order</option>
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Delivery timeframe too long">Delivery timeframe too long</option>
                  <option value="Other">Other (specify below)</option>
                </select>

                {cancelReasonOption === 'Other' && (
                  <div>
                    <textarea
                      rows={2}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please tell us what went wrong..."
                      className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-stone-900 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Notice */}
              <div className="p-3 bg-rose-50/80 border border-rose-200/80 rounded-xl text-[11px] text-rose-900 leading-relaxed">
                Cancelling will halt print production immediately. A 100% refund of <strong>${order.total}</strong> will be returned to your original payment method (<strong>{order.paymentMethod}</strong>).
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleConfirmCancel}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>{isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
