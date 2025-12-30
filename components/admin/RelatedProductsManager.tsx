
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Product } from '../../types';

interface RelatedProductsManagerProps {
  products: Product[];
  refreshData: () => void;
}

const RelatedProductsManager: React.FC<RelatedProductsManagerProps> = ({ products, refreshData }) => {
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<number[]>([]);
  const [searchTarget, setSearchTarget] = useState('');
  const [searchCandidate, setSearchCandidate] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // When target changes, load its current related IDs
  useEffect(() => {
    if (selectedTargetId) {
      const target = products.find(p => p.id === selectedTargetId);
      if (target) {
        setSelectedRelatedIds(target.related_product_ids || []);
        setHasChanges(false);
      }
    } else {
        setSelectedRelatedIds([]);
    }
  }, [selectedTargetId, products]);

  const handleToggle = (id: number) => {
    setSelectedRelatedIds(prev => {
        const isSelected = prev.includes(id);
        const newIds = isSelected ? prev.filter(x => x !== id) : [...prev, id];
        setHasChanges(true);
        return newIds;
    });
  };

  const handleSave = async () => {
      if (!selectedTargetId) return;
      setLoading(true);
      try {
          const { error } = await supabase
            .from('products')
            .update({ related_product_ids: selectedRelatedIds })
            .eq('id', selectedTargetId);
            
          if (error) throw error;
          
          await refreshData(); // Refresh local state
          setHasChanges(false);
          alert('Related products updated successfully!');
      } catch (err: any) {
          alert('Error: ' + err.message);
      } finally {
          setLoading(false);
      }
  };

  const targetList = products.filter(p => p.name.toLowerCase().includes(searchTarget.toLowerCase()));
  const candidateList = products.filter(p => 
      p.id !== selectedTargetId && // Exclude self
      (p.name.toLowerCase().includes(searchCandidate.toLowerCase()) || p.category.toLowerCase().includes(searchCandidate.toLowerCase()))
  );
  
  // Sort candidates: Selected ones first, then by ID
  candidateList.sort((a, b) => {
      const aSelected = selectedRelatedIds.includes(a.id);
      const bSelected = selectedRelatedIds.includes(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[600px] animate-fade-in">
        {/* Left Panel: Select Target Product */}
        <div className="w-full lg:w-1/3 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-800 mb-2">1. Select Target Product</h3>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={searchTarget}
                        onChange={(e) => setSearchTarget(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                    />
                    <i className="ri-search-line absolute left-2.5 top-2.5 text-gray-400"></i>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {targetList.map(p => (
                    <div 
                        key={p.id}
                        onClick={() => {
                            if (hasChanges) {
                                if(!confirm("You have unsaved changes. Discard them?")) return;
                            }
                            setSelectedTargetId(p.id);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                            selectedTargetId === p.id 
                            ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20' 
                            : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                        }`}
                    >
                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div className="min-w-0">
                            <div className={`text-sm font-bold truncate ${selectedTargetId === p.id ? 'text-primary' : 'text-gray-800'}`}>{p.name}</div>
                            <div className="text-[10px] text-gray-500">{p.category}</div>
                        </div>
                        {selectedTargetId === p.id && <i className="ri-arrow-right-s-line ml-auto text-primary"></i>}
                    </div>
                ))}
                {targetList.length === 0 && <div className="p-4 text-center text-gray-400 text-xs">No products found.</div>}
            </div>
        </div>

        {/* Right Panel: Configure Related */}
        <div className="w-full lg:w-2/3 bg-white border border-gray-200 rounded-2xl flex flex-col overflow-hidden shadow-sm relative">
            {!selectedTargetId ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <i className="ri-links-line text-3xl text-gray-300"></i>
                    </div>
                    <p className="font-medium text-gray-600">No Product Selected</p>
                    <p className="text-sm mt-1">Select a product from the left list to configure its related items.</p>
                </div>
            ) : (
                <>
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                2. Select Related Items
                                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {selectedRelatedIds.length} Selected
                                </span>
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">These will appear in the "Related Products" section.</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                             <div className="relative flex-1 sm:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Filter candidates..." 
                                    value={searchCandidate}
                                    onChange={(e) => setSearchCandidate(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                                />
                                <i className="ri-filter-3-line absolute left-2.5 top-2.5 text-gray-400"></i>
                            </div>
                            {hasChanges && (
                                <button 
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-darker transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    {loading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-save-3-line"></i>}
                                    Save Changes
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                            {candidateList.map(p => {
                                const isSelected = selectedRelatedIds.includes(p.id);
                                return (
                                    <div 
                                        key={p.id}
                                        onClick={() => handleToggle(p.id)}
                                        className={`group relative p-3 rounded-xl border cursor-pointer transition-all select-none flex items-start gap-3 ${
                                            isSelected 
                                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                            : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                                            isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 group-hover:border-gray-400'
                                        }`}>
                                            {isSelected && <i className="ri-check-line text-sm"></i>}
                                        </div>
                                        
                                        <img src={p.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-100" />
                                        
                                        <div className="min-w-0">
                                            <div className={`text-xs font-bold truncate leading-tight mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>{p.name}</div>
                                            <div className="text-[10px] text-gray-500">{p.category}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default RelatedProductsManager;
