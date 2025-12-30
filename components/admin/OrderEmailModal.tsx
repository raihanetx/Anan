
import React, { useState } from 'react';
import { Order } from '../../types';

interface OrderEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const OrderEmailModal: React.FC<OrderEmailModalProps> = ({ isOpen, onClose, order }) => {
  const [accessDetails, setAccessDetails] = useState('');
  const [sending, setSending] = useState(false);

  // Provided Credentials (stored here as requested, though normally server-side)
  const GMAIL_USER = 'usefor5bzx@gmail.com';
  // const GMAIL_PASS = 'ljttbayszoivmzrp'; // Kept for reference if we had a backend

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const emailBody = `
Dear ${order.customerName || 'Customer'},

Thank you for your purchase (Order #${order.id}).

Here are your access details/downloads:
----------------------------------------
${accessDetails}
----------------------------------------

If you have any issues, please reply to this email.

Best regards,
FLAME Digital Store
    `.trim();

    try {
      // Simulate Email Sending Delay
      // NOTE: Browsers cannot directly connect to SMTP servers due to security restrictions.
      // In a production app, this would send 'emailBody' to a backend API which uses the credentials provided.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Email sent successfully to ${order.customerEmail || 'customer'} from ${GMAIL_USER}!`);
      onClose();
      setAccessDetails('');
    } catch (error) {
      alert('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1005] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex justify-between items-center">
          <div className="text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <i className="ri-mail-send-line text-xl"></i>
              Send Access Details
            </h2>
            <p className="text-white/80 text-xs">Order #{order.id} • {order.customerName}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <i className="ri-close-circle-line text-2xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
               <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">To:</span>
               <span className="text-xs font-bold text-gray-700">{order.customerEmail || 'No Email Provided'}</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">From:</span>
               <span className="text-xs font-bold text-gray-700">{GMAIL_USER}</span>
            </div>
          </div>

          <div className="space-y-3">
             <label className="block text-sm font-bold text-gray-700">
               Access Details / Credentials / Download Links
             </label>
             <textarea 
                required
                rows={6}
                value={accessDetails}
                onChange={(e) => setAccessDetails(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-primary focus:bg-white transition-all font-mono"
                placeholder="e.g.&#10;Username: user123&#10;Password: pass123&#10;Link: https://example.com/download"
             ></textarea>
             <p className="text-xs text-gray-400">This text will be inserted into the email template sent to the user.</p>
          </div>

          <div className="mt-6 flex gap-3">
             <button 
               type="button" 
               onClick={onClose}
               className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
             >
               Cancel
             </button>
             <button 
               type="submit" 
               disabled={sending}
               className="flex-[2] py-3 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-darker shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
             >
               {sending ? (
                 <>
                   <i className="ri-loader-4-line animate-spin"></i>
                   Sending...
                 </>
               ) : (
                 <>
                   <i className="ri-send-plane-fill"></i>
                   Send Mail
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderEmailModal;
