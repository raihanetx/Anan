
import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Product, PricingOption } from '../../types';

interface InventoryViewProps {
  products: Product[];
  refreshData: () => void;
}

const InventoryView: React.FC<InventoryViewProps> = ({ products, refreshData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Store pending changes: productId -> Array of PricingOptions
  const [changes, setChanges] = useState<Record<number, PricingOption[]>>({});
  const [loadingIds, setLoadingIds] = useState<number[]>([]);

  // Filter products based on search
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStockChange = (productId: number, planIndex: number, newStockStr: string) => {
    const newStock = parseInt(newStockStr) || 0;
    
    // Get current state or initial state from props
    const currentProduct = products.find(p => p.id === productId);
    if (!currentProduct) return;

    // Use existing changes or deep copy original pricing
    const currentPricing = changes[productId] 
      ? [...changes[productId]] 
      : JSON.parse(JSON.stringify(currentProduct.pricing));

    // Update specific plan
    if (currentPricing[planIndex]) {
      currentPricing[planIndex].stock = newStock;
    }

    setChanges({
      ...changes,
      [productId]: currentPricing
    });
  };

  const saveChanges = async (productId: number) => {
    const pricingToSave = changes[productId];
    if (!pricingToSave) return;

    // Add to loading state
    setLoadingIds(prev => [...prev, productId]);

    try {
      // Logic: If ALL plans have 0 stock, set stock_out = true
      const isStockOut = pricingToSave.every((p: PricingOption) => (p.stock || 0) <= 0);

      const { error } = await supabase
        .from('products')
        .update({
          pricing: pricingToSave,
          stock_out: isStockOut
        })
        .eq('id', productId);

      if (error) throw error;

      // Clear changes for this product locally
      const newChanges = { ...changes };
      delete newChanges[productId];
      setChanges(newChanges);
      
      refreshData();
      alert('Inventory updated successfully!');
    } catch (err: any) {
      alert('Error updating inventory: ' + err.message);
    } finally {
      setLoadingIds(prev => prev.filter(id => id !== productId));
    }
  };

  const discardChanges = (productId: number) => {
    const newChanges = { ...changes };
    delete newChanges[productId];
    setChanges(newChanges);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-xl font-bold text-gray-800">Inventory Management</h2>
           <p className="text-sm text-gray-500">Quickly update stock levels for all product variants.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-[30%]">Product</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-[50%]">Stock Levels (Per Variant)</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right w-[20%]">Status / Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
               <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                  No products found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const hasPendingChanges = !!changes[p.id];
                const activePricing = changes[p.id] || p.pricing;
                const isLoading = loadingIds.includes(p.id);

                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-4">
                        <img src={p.image} className="w-12 h-12 rounded-lg object-cover border border-gray-100 bg-white" alt="" />
                        <div>
                          <div className="font-bold text-gray-900">{p.name}</div>
                          <div className="text-[10px] text-gray-500">{p.category}</div>
                          {p.stock_out && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-[9px] font-bold rounded uppercase">
                              Stock Out
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-4">
                        {activePricing.map((opt: PricingOption, idx: number) => (
                          <div key={idx} className="flex flex-col gap-1 w-[120px]">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate" title={opt.duration}>
                              {opt.duration}
                            </label>
                            <div className="relative">
                              <input 
                                type="number"
                                min="0"
                                value={opt.stock !== undefined ? opt.stock : 0}
                                onChange={(e) => handleStockChange(p.id, idx, e.target.value)}
                                className={`w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-primary transition-all ${
                                  (opt.stock || 0) > 0 ? 'bg-white border-gray-200 text-gray-800' : 'bg-red-50 border-red-100 text-red-500'
                                }`}
                              />
                              {(opt.stock || 0) <= 0 && (
                                <div className="absolute right-2 top-1.5 text-red-500 pointer-events-none">
                                  <i className="ri-error-warning-fill"></i>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right align-middle">
                      {hasPendingChanges ? (
                        <div className="flex justify-end gap-2 animate-fade-in">
                           <button 
                             onClick={() => discardChanges(p.id)}
                             disabled={isLoading}
                             className="px-3 py-2 border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors text-xs font-bold"
                           >
                             Cancel
                           </button>
                           <button 
                             onClick={() => saveChanges(p.id)}
                             disabled={isLoading}
                             className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-darker transition-colors text-xs font-bold flex items-center gap-1 shadow-lg shadow-primary/20"
                           >
                             {isLoading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-line"></i>}
                             Save
                           </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium italic">No changes</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryView;
