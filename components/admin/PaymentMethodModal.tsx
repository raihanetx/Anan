
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { PaymentMethod } from '../../types';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  method: PaymentMethod | null;
  onSuccess: () => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ isOpen, onClose, method, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    number: '',
    instructions: '',
    is_custom: false,
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  const getSafeString = (val: any) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return '';
  };

  useEffect(() => {
    if (isOpen) {
      if (method) {
        setForm({
          name: getSafeString(method.name),
          number: getSafeString(method.number),
          instructions: getSafeString(method.instructions),
          is_custom: method.is_custom,
          is_active: method.is_active !== undefined ? method.is_active : true
        });
      } else {
        setForm({
          name: '',
          number: '',
          instructions: '',
          is_custom: false,
          is_active: true
        });
      }
    }
  }, [isOpen, method]);

  const generateDefaultInstructions = (name: string) => {
    return `First, copy the number shown above.\nThen open the ${name || '[App Name]'} app.\nThen select 'send money'.\nSend the amount of money that was requested here.\nThen copy the transaction ID and paste it below.`;
  };

  // When switching to custom, if empty, pre-fill with default
  const handleModeSwitch = (isCustom: boolean) => {
    if (isCustom && !form.instructions) {
      setForm(prev => ({ ...prev, is_custom: true, instructions: generateDefaultInstructions(prev.name) }));
    } else {
      setForm(prev => ({ ...prev, is_custom: isCustom }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        number: form.number,
        is_custom: form.is_custom,
        instructions: form.is_custom ? form.instructions : null, // If default, we can store null or the text. Let's store null to save space and use dynamic render.
        is_active: form.is_active
      };

      if (method?.id) {
        const { error } = await supabase.from('payment_methods').update(payload).eq('id', method.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('payment_methods').insert([payload]);
        if (error) throw error;
      }
      onSuccess();
      onClose();
      alert('Payment Method saved!');
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-scale-up overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold font-display">{method ? 'Edit Payment Method' : 'Add Payment Method'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Gateway Name</label>
                    <input
                        required
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-bold"
                        placeholder="e.g. bKash"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Account Number</label>
                    <input
                        required
                        value={form.number}
                        onChange={e => setForm({ ...form, number: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all text-sm font-bold"
                        placeholder="e.g. 017..."
                    />
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Instruction Mode</span>
                     <div className="flex bg-gray-200 p-1 rounded-lg">
                        <button 
                           type="button"
                           onClick={() => handleModeSwitch(false)}
                           className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!form.is_custom ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                        >
                            Default
                        </button>
                        <button 
                           type="button"
                           onClick={() => handleModeSwitch(true)}
                           className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${form.is_custom ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                        >
                            Custom
                        </button>
                     </div>
                </div>

                {!form.is_custom ? (
                    <div className="text-xs text-gray-500 bg-white p-3 rounded-lg border border-gray-100 italic">
                        <i className="ri-information-line mr-1"></i>
                        The standard 5-step instruction list will be displayed automatically based on the gateway name and number.
                    </div>
                ) : (
                    <div className="space-y-2">
                         <div className="flex justify-between items-center">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custom Instructions</label>
                             <button 
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, instructions: generateDefaultInstructions(prev.name) }))}
                                className="text-[10px] font-bold text-primary hover:underline"
                             >
                                Reset to Template
                             </button>
                         </div>
                         <textarea
                            required={form.is_custom}
                            rows={5}
                            value={form.instructions}
                            onChange={e => setForm({ ...form, instructions: e.target.value })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary transition-all text-sm"
                            placeholder="Write your custom instructions here..."
                         />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={form.is_active}
                        onChange={e => setForm({ ...form, is_active: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm font-bold text-gray-700">Gateway Active?</span>
            </div>

            <div className="pt-4 flex gap-3">
               <button
                 type="button"
                 onClick={onClose}
                 className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-sm"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 disabled={loading}
                 className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-darker shadow-lg shadow-primary/20 transition-all text-sm"
               >
                 {loading ? 'Saving...' : 'Save Method'}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
