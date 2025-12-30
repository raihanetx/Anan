
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Category } from '../../types';
import { ICON_LIBRARIES } from './AdminConstants';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess: () => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, category, onSuccess }) => {
  const [form, setForm] = useState({ name: '', icon: 'ri-price-tag-3-line' });
  const [activeIconTab, setActiveIconTab] = useState<string>('Remix');
  const [iconSearch, setIconSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setForm({ name: category.name, icon: category.icon });
        // Detect library
        const iconClass = category.icon;
        if (iconClass.startsWith('ri-')) setActiveIconTab('Remix');
        else if (iconClass.startsWith('fa-')) setActiveIconTab('FontAwesome');
        else if (iconClass.startsWith('bx')) setActiveIconTab('Boxicons');
        else if (iconClass.startsWith('uil')) setActiveIconTab('Unicons');
        else if (iconClass.startsWith('bi')) setActiveIconTab('Bootstrap');
        else if (iconClass.startsWith('ph')) setActiveIconTab('Phosphor');
      } else {
        setForm({ name: '', icon: 'ri-star-line' });
        setActiveIconTab('Remix');
      }
      setIconSearch('');
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const slug = form.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const payload = {
        name: form.name,
        slug,
        icon: form.icon
      };

      if (category && category.id) {
        const { error } = await supabase.from('categories').update(payload).eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert([payload]);
        if (error) throw error;
      }
      onSuccess();
      onClose();
      alert('Category saved!');
    } catch (err: any) {
      alert('Error saving category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredIcons = () => {
    const icons = ICON_LIBRARIES[activeIconTab] || [];
    if (!iconSearch) return icons;
    return icons.filter(icon => icon.toLowerCase().includes(iconSearch.toLowerCase()));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-scale-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold font-display">{category ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><i className="ri-close-line text-2xl"></i></button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="categoryForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all"
                placeholder="e.g. Finance"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Icon</label>

              <div className="flex flex-col md:flex-row gap-4 mb-2">
                <div className="flex-1">
                  <input
                    required
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-mono text-sm"
                    placeholder="e.g. ri-home-line"
                  />
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 shrink-0">
                  <i className={`${form.icon} text-2xl text-primary`}></i>
                </div>
              </div>

              {/* Icon Picker UI */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                  {Object.keys(ICON_LIBRARIES).map(lib => (
                    <button
                      key={lib}
                      type="button"
                      onClick={() => setActiveIconTab(lib)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeIconTab === lib ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'}`}
                    >
                      {lib}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder={`Search ${activeIconTab} icons...`}
                    value={iconSearch}
                    onChange={e => setIconSearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  <i className="ri-search-line absolute left-3 top-2 text-gray-400 text-sm"></i>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {getFilteredIcons().map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={`h-10 rounded-lg flex items-center justify-center text-lg transition-all border ${form.icon === icon ? 'bg-primary text-white border-primary ring-2 ring-primary/20' : 'bg-white text-gray-600 border-gray-100 hover:border-primary hover:text-primary'}`}
                      title={icon}
                    >
                      <i className={icon}></i>
                    </button>
                  ))}
                  {getFilteredIcons().length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-400 text-xs">
                      No icons found matching "{iconSearch}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="categoryForm"
            disabled={loading}
            className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-darker shadow-lg shadow-primary/20 transition-all text-sm"
          >
            {loading ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
