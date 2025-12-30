
import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../supabaseClient';
import { Product, PricingOption, Category } from '../../types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, product, categories, onSuccess }) => {
  // Initial State
  const initialPricing: PricingOption = { duration: '', duration_days: 0, price: 0, stock: 0 };
  
  const [form, setForm] = useState({
    name: '',
    short_description: '',
    description: '',
    category: '',
    is_featured: false,
    pricing: [initialPricing] as PricingOption[],
    rating: 5,
    reviews: 0,
    sold: ''
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const getSafeString = (val: any) => {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    return '';
  };

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setForm({
          name: getSafeString(product.name),
          short_description: getSafeString(product.short_description),
          description: getSafeString(product.description),
          category: getSafeString(product.category),
          is_featured: product.is_featured || false,
          pricing: product.pricing.map(p => ({ 
            ...p, 
            stock: p.stock || 0,
            duration_days: p.duration_days || 0 
          })),
          rating: product.rating || 5,
          reviews: product.reviews || 0,
          sold: getSafeString(product.sold)
        });
      } else {
        setForm({
          name: '',
          short_description: '',
          description: '',
          category: categories.length > 0 ? categories[0].name : '',
          is_featured: false,
          pricing: [{ duration: '', duration_days: 0, price: 0, stock: 0 }],
          rating: 5,
          reviews: 0,
          sold: ''
        });
      }
      setImageFile(null);
    }
  }, [isOpen, product, categories]);

  const handlePriceChange = (index: number, field: keyof PricingOption, value: any) => {
    const newPricing = [...form.pricing];
    newPricing[index] = { ...newPricing[index], [field]: value };
    setForm({ ...form, pricing: newPricing });
  };

  const addPricingOption = () => {
    setForm({ ...form, pricing: [...form.pricing, { duration: '', duration_days: 0, price: 0, stock: 0 }] });
  };

  const removePricingOption = (index: number) => {
    if (form.pricing.length > 1) {
      setForm({ ...form, pricing: form.pricing.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = product?.image || '';

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        // Upload can use standard client (usually allows authenticated uploads) or admin.
        // Using standard client for storage as it often depends on buckets which might be public/auth.
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const slug = form.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const categoryObj = categories.find(c => c.name === form.category);

      const productPayload = {
        name: form.name,
        slug,
        category: form.category,
        category_slug: categoryObj?.slug || 'misc',
        short_description: form.short_description,
        description: form.description,
        image: imageUrl,
        pricing: form.pricing,
        is_featured: form.is_featured,
        rating: form.rating,
        reviews: form.reviews,
        sold: form.sold,
        stock_out: form.pricing.every(p => (p.stock || 0) <= 0)
        // related_product_ids is EXCLUDED here to prevent overwriting changes made in the Cross-Sell tab
      };

      if (product) {
        // Use supabaseAdmin
        const { error } = await supabaseAdmin
          .from('products')
          .update(productPayload)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        // Use supabaseAdmin
        const { error } = await supabaseAdmin
          .from('products')
          .insert([productPayload]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
      alert('Product saved successfully!');
    } catch (err: any) {
      console.error(err);
      alert('Error saving product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-up">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold font-display">{product ? 'Edit Product' : 'Add New Product'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Basic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Product Name</label>
                    <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-medium"
                    placeholder="e.g. Netflix Premium"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Category</label>
                    <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-medium cursor-pointer"
                    >
                    {categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                </div>

                <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Short Description</label>
                <input
                    required
                    value={form.short_description}
                    onChange={e => setForm({ ...form, short_description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all"
                    placeholder="Brief summary for card view..."
                />
                </div>

                <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Long Description</label>
                <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all resize-none"
                    placeholder="Detailed features and information..."
                />
                </div>
            </div>

            {/* Media & Stats Section */}
            <div className="space-y-6">
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Media & Stats</h3>
                 
                 <div className="grid md:grid-cols-2 gap-6 items-start">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Product Image</label>
                        <input
                        type="file"
                        accept="image/*"
                        onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        {product?.image && !imageFile && (
                           <div className="mt-2 text-xs text-gray-400">Current: <a href={product.image} target="_blank" rel="noreferrer" className="text-primary hover:underline">View Image</a></div>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        {/* Featured Product Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="block text-sm font-bold text-gray-800">Featured Product</span>
                                <span className="block text-xs text-gray-500">Show this in featured sections?</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={form.is_featured}
                                    onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                 </div>

                 {/* Statistics Inputs */}
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Rating (0-5)</label>
                        <input
                            type="number"
                            min="0"
                            max="5"
                            step="0.1"
                            value={form.rating}
                            onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary text-sm font-bold text-center"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Reviews Count</label>
                        <input
                            type="number"
                            min="0"
                            value={form.reviews}
                            onChange={e => setForm({ ...form, reviews: parseInt(e.target.value) })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary text-sm font-bold text-center"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Sold Count</label>
                        <input
                            type="text"
                            value={form.sold}
                            onChange={e => setForm({ ...form, sold: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-primary text-sm font-bold text-center"
                            placeholder="e.g. 500+"
                        />
                    </div>
                 </div>
            </div>

            {/* Plans Section */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-primary flex items-center gap-2">
                  <i className="ri-price-tag-3-line"></i>
                  Pricing Plans & Stock
                </h3>
                <button
                  type="button"
                  onClick={addPricingOption}
                  className="text-primary font-bold text-xs flex items-center gap-1 hover:underline bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <i className="ri-add-circle-line text-lg"></i> Add Plan
                </button>
              </div>

              <div className="space-y-4">
                {form.pricing.map((opt, i) => (
                  <div key={i} className="flex flex-col md:grid md:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-2xl relative border border-gray-200 group items-end">
                    
                    {/* 1. Text Duration */}
                    <div className="md:col-span-4 w-full space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Display Duration</label>
                      <input
                        required
                        placeholder="e.g. 1 Month"
                        value={opt.duration}
                        onChange={e => handlePriceChange(i, 'duration', e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* 2. Numeric Duration */}
                    <div className="md:col-span-3 w-full space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Duration (Days)</label>
                      <input
                        required
                        type="number"
                        placeholder="e.g. 30"
                        value={opt.duration_days}
                        onChange={e => handlePriceChange(i, 'duration_days', parseInt(e.target.value))}
                        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all font-mono"
                      />
                    </div>

                    {/* 3. Price */}
                    <div className="md:col-span-3 w-full space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Price (৳)</label>
                      <input
                        required
                        type="number"
                        value={opt.price}
                        onChange={e => handlePriceChange(i, 'price', parseFloat(e.target.value))}
                        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all font-bold text-gray-800"
                      />
                    </div>

                    {/* 4. Stock */}
                    <div className="md:col-span-2 w-full space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Stock</label>
                      <input
                        required
                        type="number"
                        value={opt.stock}
                        onChange={e => handlePriceChange(i, 'stock', parseInt(e.target.value))}
                        className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>

                    {/* Delete Button */}
                    {form.pricing.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePricingOption(i)}
                        className="absolute -top-2 -right-2 md:top-1/2 md:-translate-y-1/2 md:-right-3 bg-white shadow-md w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors z-10 border border-gray-100"
                        title="Remove Plan"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex gap-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-[2] py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-darker shadow-lg shadow-primary/20 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                    <>
                        <i className="ri-loader-4-line animate-spin text-lg"></i>
                        Saving...
                    </>
                ) : (
                    <>
                        <i className="ri-save-line text-lg"></i>
                        {product ? 'Update Product' : 'Add Product'}
                    </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
