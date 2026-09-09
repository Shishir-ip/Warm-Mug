import { useState } from 'react';
import { ArrowLeft, CreditCard, Wallet, Smartphone, Check } from 'lucide-react';
import { CartItem } from '../App';

interface CheckoutPageProps {
  cart: CartItem[];
  cartTotal: number;
  onBack: () => void;
  onOrderComplete: (orderData: any) => void;
}

type PaymentMethod = 'card' | 'cod' | 'mobile_banking';
type MobileProvider = 'bkash' | 'nagad' | 'rocket';

export default function CheckoutPage({ cart, cartTotal, onBack, onOrderComplete }: CheckoutPageProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [mobileProvider, setMobileProvider] = useState<MobileProvider>('bkash');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    landmark: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    mobileNumber: '',
    transactionId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shipping = cartTotal >= 50 ? 0 : 5.99;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const orderData = {
        order_number: `WM-${Date.now().toString().slice(-8)}`,
        status: 'pending',
        subtotal: cartTotal,
        shipping_cost: shipping,
        tax: tax,
        total: total,
        shipping_name: formData.name,
        shipping_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_landmark: formData.landmark || null,
        shipping_country: 'Bangladesh',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'paid',
        mobile_banking_provider: paymentMethod === 'mobile_banking' ? mobileProvider : null,
        mobile_banking_number: paymentMethod === 'mobile_banking' ? formData.mobileNumber : null,
        mobile_banking_transaction_id: paymentMethod === 'mobile_banking' ? formData.transactionId : null,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image: item.image,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        })),
      };

      onOrderComplete(orderData);
    } catch (err) {
      console.error('Error placing order:', err);
      setIsSubmitting(false);
      alert('Error placing order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="nb-card m-4">
        <div className="p-4 flex items-center gap-3">
          <button onClick={onBack} className="nb-button-secondary p-2">
            <ArrowLeft className="w-5 h-5" strokeWidth={3} />
          </button>
          <h1 className="nb-heading text-2xl">CHECKOUT</h1>
        </div>
      </div>

      <div className="m-4 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Info */}
          <div className="nb-card p-6">
            <h2 className="nb-heading text-xl mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[var(--accent-blue)] border-2 border-[var(--border-color)] flex items-center justify-center">1</span>
              SHIPPING INFORMATION
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">PHONE *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">EMAIL *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">ADDRESS *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="nb-input w-full px-4 py-3"
                  placeholder="House 12, Road 5, Dhanmondi"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">CITY *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                    placeholder="Dhaka"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">LANDMARK (OPTIONAL)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                    placeholder="Near ABC School"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Payment Method */}
          <div className="nb-card p-6">
            <h2 className="nb-heading text-xl mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-[var(--accent-pink)] border-2 border-[var(--border-color)] flex items-center justify-center">2</span>
              PAYMENT METHOD
            </h2>

            <div className="space-y-3">
              {/* Card Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`nb-card w-full p-4 flex items-center gap-4 cursor-pointer ${
                  paymentMethod === 'card' ? 'bg-[var(--accent-yellow)]' : ''
                }`}
              >
                <CreditCard className="w-6 h-6" strokeWidth={3} />
                <div className="text-left flex-1">
                  <p className="font-bold">CARD PAYMENT</p>
                  <p className="text-sm">Visa, Mastercard, AMEX</p>
                </div>
                {paymentMethod === 'card' && <Check className="w-6 h-6" strokeWidth={3} />}
              </button>

              {/* Mobile Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('mobile_banking')}
                className={`nb-card w-full p-4 flex items-center gap-4 cursor-pointer ${
                  paymentMethod === 'mobile_banking' ? 'bg-[var(--accent-yellow)]' : ''
                }`}
              >
                <Smartphone className="w-6 h-6" strokeWidth={3} />
                <div className="text-left flex-1">
                  <p className="font-bold">MOBILE BANKING</p>
                  <p className="text-sm">bKash, Nagad, Rocket</p>
                </div>
                {paymentMethod === 'mobile_banking' && <Check className="w-6 h-6" strokeWidth={3} />}
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`nb-card w-full p-4 flex items-center gap-4 cursor-pointer ${
                  paymentMethod === 'cod' ? 'bg-[var(--accent-yellow)]' : ''
                }`}
              >
                <Wallet className="w-6 h-6" strokeWidth={3} />
                <div className="text-left flex-1">
                  <p className="font-bold">CASH ON DELIVERY</p>
                  <p className="text-sm">Pay when you receive</p>
                </div>
                {paymentMethod === 'cod' && <Check className="w-6 h-6" strokeWidth={3} />}
              </button>
            </div>

            {/* Card Details */}
            {paymentMethod === 'card' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">CARD NUMBER</label>
                  <input
                    type="text"
                    required
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">EXPIRY</label>
                    <input
                      type="text"
                      required
                      value={formData.expiry}
                      onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                      className="nb-input w-full px-4 py-3"
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">CVV</label>
                    <input
                      type="text"
                      required
                      value={formData.cvv}
                      onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                      className="nb-input w-full px-4 py-3"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Banking Details */}
            {paymentMethod === 'mobile_banking' && (
              <div className="mt-6 space-y-4">
                <div className="nb-card p-4 bg-[var(--accent-blue)]">
                  <p className="font-bold mb-2">PAYMENT INSTRUCTIONS:</p>
                  <p className="text-sm">Send ${total.toFixed(2)} to: <span className="font-black">+8801676220935</span></p>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">SELECT PROVIDER</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bkash', 'nagad', 'rocket'] as MobileProvider[]).map(provider => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => setMobileProvider(provider)}
                        className={`nb-button py-2 ${mobileProvider === provider ? 'bg-[var(--accent-pink)]' : ''}`}
                      >
                        {provider.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">YOUR MOBILE NUMBER</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">TRANSACTION ID</label>
                  <input
                    type="text"
                    required
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    className="nb-input w-full px-4 py-3"
                    placeholder="TXN8A7K9M2P5"
                  />
                </div>
              </div>
            )}

            {/* COD Info */}
            {paymentMethod === 'cod' && (
              <div className="mt-6">
                <div className="nb-card p-4 bg-[var(--accent-green)]">
                  <p className="font-bold">✓ You will pay ${total.toFixed(2)} in cash when you receive your order.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="nb-card p-6 sticky top-4">
            <h2 className="nb-heading text-xl mb-4">ORDER SUMMARY</h2>
            
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover border-2 border-[var(--border-color)]" />
                  <div className="flex-1">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[var(--border-color)] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-bold">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span className="font-bold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span className="font-bold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg border-t-2 border-[var(--border-color)] pt-2">
                <span className="font-black">TOTAL:</span>
                <span className="font-black">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="nb-button w-full py-4 mt-4 text-lg disabled:opacity-50"
            >
              {isSubmitting ? 'PROCESSING...' : `PLACE ORDER - $${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
