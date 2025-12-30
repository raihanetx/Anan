
import React, { useState, useEffect, useRef } from 'react';
import { Product, View, Review } from '../types';
import { supabase } from '../supabaseClient';

interface ProductDetailsViewProps {
  product: Product;
  addToCart: (product: Product, pricingIndex: number) => void;
  navigate: (view: View, product?: Product) => void;
}

const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({ product, addToCart, navigate }) => {
  const [selectedPricingIndex, setSelectedPricingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [descExpanded, setDescExpanded] = useState(false);
  
  // Data State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // User State
  const [myReviewIds, setMyReviewIds] = useState<number[]>([]);
  const [likedReviewIds, setLikedReviewIds] = useState<number[]>([]);
  
  // Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // UI State
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedPrice = product.pricing[selectedPricingIndex] || { price: 0, duration: 'N/A', stock: 0 };

  // --- Helpers ---

  const safeString = (val: any): string => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const sanitizeReview = (r: any): Review => ({
    ...r,
    customer_name: safeString(r.customer_name),
    comment: safeString(r.comment),
    created_at: safeString(r.created_at)
  });

  const sanitizeProduct = (p: any): Product => ({
    ...p,
    name: safeString(p.name),
    category: safeString(p.category),
    description: safeString(p.description),
    short_description: safeString(p.short_description),
    image: safeString(p.image),
    sold: safeString(p.sold),
    pricing: Array.isArray(p.pricing) ? p.pricing : [],
    related_product_ids: Array.isArray(p.related_product_ids) ? p.related_product_ids : []
  });

  // Helper: Format Date
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return isoString;
    }
  };

  // 1. Load Local Storage & Fetch Data
  useEffect(() => {
    const savedReviews = localStorage.getItem('my_flame_reviews');
    if (savedReviews) setMyReviewIds(JSON.parse(savedReviews));
    
    const savedLikes = localStorage.getItem('my_flame_likes');
    if (savedLikes) setLikedReviewIds(JSON.parse(savedLikes));
  }, []);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });
    
    if (data) {
        setReviews(data.map(sanitizeReview));
    }
  };

  useEffect(() => {
    // Reset state on product change
    setSelectedPricingIndex(0);
    setActiveTab('description');
    setDescExpanded(false);
    setShowReviewModal(false);
    setEditingId(null);
    setReviewComment('');
    setReviewName('');
    setReviewRating(0);
    setActiveMenuId(null);
    
    // Fetch Data
    fetchReviews();

    const fetchRelated = async () => {
        let related: Product[] = [];

        // 1. Try Manual Selection
        if (product.related_product_ids && product.related_product_ids.length > 0) {
            const { data } = await supabase.from('products').select('*').in('id', product.related_product_ids);
            if (data && data.length > 0) {
                const sanitizedData = data.map(sanitizeProduct);
                const idOrder = product.related_product_ids;
                related = sanitizedData.sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));
            }
        } 
        
        // 2. Fallback to Category
        if (related.length === 0) {
            const { data } = await supabase.from('products')
                .select('*')
                .eq('category', product.category)
                .neq('id', product.id)
                .limit(4);
            if (data) {
                related = data.map(sanitizeProduct);
            }
        }

        setRelatedProducts(related);
    };
    fetchRelated();
  }, [product]);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // --- Handlers ---

  const handleBuyNow = () => {
    addToCart(product, selectedPricingIndex);
    navigate('checkout');
  };

  const handleOpenReviewModal = (review?: Review) => {
    if (review) {
        setEditingId(review.id);
        setReviewName(review.customer_name);
        setReviewRating(review.rating);
        setReviewComment(review.comment);
    } else {
        setEditingId(null);
        setReviewName('');
        setReviewRating(0);
        setReviewComment('');
    }
    setShowReviewModal(true);
    setActiveMenuId(null);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if(confirm('Are you sure you want to delete this comment?')) {
        const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
        if (!error) {
            const updatedIds = myReviewIds.filter(id => id !== reviewId);
            setMyReviewIds(updatedIds);
            localStorage.setItem('my_flame_reviews', JSON.stringify(updatedIds));
            fetchReviews();
        } else {
            alert('Failed to delete review.');
        }
    }
    setActiveMenuId(null);
  };

  // DEMO ONLY - Visual update, no DB call for likes to avoid schema errors
  const handleToggleLike = (reviewId: number, currentLikes: number) => {
    const isLiked = likedReviewIds.includes(reviewId);
    
    // Update local storage state
    let newLikedIds = [];
    if (isLiked) {
        newLikedIds = likedReviewIds.filter(id => id !== reviewId);
    } else {
        newLikedIds = [...likedReviewIds, reviewId];
    }
    setLikedReviewIds(newLikedIds);
    localStorage.setItem('my_flame_likes', JSON.stringify(newLikedIds));

    // Update Visual Count (Local only)
    const newCount = isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1;
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: newCount } : r));
    
    // IMPORTANT: We do not call supabase.update here. 
    // This satisfies the requirement to not have "like" functionality on the backend.
  };

  // DEMO ONLY - Visual interaction
  const handleShare = (review: Review) => {
    // Just a visual confirmation
    alert('Link copied to clipboard (Demo)');
  };

  const handleCommentClick = (reviewId: number) => {
     setActiveReplyId(activeReplyId === reviewId ? null : reviewId);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
        alert("Please select a rating.");
        return;
    }
    if (!reviewName.trim() || !reviewComment.trim()) {
        alert("Please fill all fields.");
        return;
    }

    setSubmitting(true);

    try {
        if (editingId) {
            // Edit
            const { error } = await supabase.from('reviews').update({
                customer_name: reviewName,
                rating: reviewRating,
                comment: reviewComment,
            }).eq('id', editingId);
            
            if (error) throw error;
        } else {
            // Create - IMPORTANT: Not sending 'likes' to DB to prevent error
            const { data, error } = await supabase.from('reviews').insert([{
                product_id: product.id,
                customer_name: reviewName,
                rating: reviewRating,
                comment: reviewComment
                // 'likes' is omitted here intentionally
            }]).select();

            if (error) throw error;
            
            if (data && data[0]) {
                const updatedIds = [...myReviewIds, data[0].id];
                setMyReviewIds(updatedIds);
                localStorage.setItem('my_flame_reviews', JSON.stringify(updatedIds));
            }
        }
        
        await fetchReviews();
        setShowReviewModal(false);
        setEditingId(null);
        setReviewComment('');
        setReviewName('');
        setReviewRating(0);
        setHoverRating(0);
    } catch (err: any) {
        console.error(err);
        alert(`Failed to submit review: ${err.message || 'Unknown error'}`);
    } finally {
        setSubmitting(false);
    }
  };

  const getDescription = (desc: any) => {
    if (typeof desc === 'string') return desc;
    return '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-16 fade-in pb-16 relative">
      {/* Top Section: Image & Basic Info */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mt-4 md:mt-10">
        {/* Image */}
        <div className="w-full md:w-1/2">
            <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.stock_out && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <div className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold text-xl transform -rotate-12 shadow-lg">SOLD OUT</div>
                    </div>
                )}
            </div>
        </div>

        {/* Info */}
        <div className="w-full md:w-1/2 flex flex-col gap-5">
            <div>
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 font-display tracking-tight">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 font-sans">
                    <div className="flex items-center gap-1">
                        <i className="ri-star-fill text-yellow-500 text-lg"></i>
                        <span className="font-bold text-gray-900 text-base">{product.rating || 4.5}</span>
                        <span>({reviews.length} reviews)</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                        <i className="ri-shopping-bag-3-line"></i>
                        <span>{product.sold || '0+'} sold</span>
                    </div>
                </div>
                
                {/* Short Description */}
                <p className="text-base text-gray-600 leading-relaxed mb-6 font-sans">
                    {getDescription(product.short_description || product.description)}
                </p>
                
                <div className="text-3xl font-bold mb-6 text-primary font-poppins flex items-baseline">
                    <span className="font-bangla font-black mr-1 text-2xl">৳</span>{selectedPrice.price.toFixed(2)}
                    <span className="text-sm text-gray-500 font-normal ml-2 font-sans">/ {selectedPrice.duration}</span>
                </div>
                
                {/* Options */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 font-sans">Select Plan</h3>
                    <div className="flex gap-3 flex-wrap font-sans">
                        {product.pricing.map((opt, idx) => {
                            const isOptStockOut = opt.stock !== undefined && opt.stock <= 0;
                            return (
                                <button 
                                    key={idx}
                                    onClick={() => setSelectedPricingIndex(idx)}
                                    className={`relative flex items-center justify-center px-5 py-3 rounded-xl transition-all border-2 ${
                                        selectedPricingIndex === idx 
                                            ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                                            : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                                    } ${isOptStockOut ? 'opacity-50 grayscale' : ''}`}
                                >
                                    <span className="text-sm font-bold whitespace-nowrap">
                                        {opt.duration}
                                        {isOptStockOut && <span className="text-[10px] text-red-500 ml-1 block leading-none">Sold Out</span>}
                                    </span>
                                    {selectedPricingIndex === idx && (
                                        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white bg-primary shadow-sm border-2 border-white">
                                            <i className="ri-check-line text-xs font-bold"></i>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 font-sans mt-auto">
                <button 
                    onClick={() => addToCart(product, selectedPricingIndex)} 
                    disabled={product.stock_out || (selectedPrice.stock !== undefined && selectedPrice.stock <= 0)}
                    className="flex-1 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-sm hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i className="ri-shopping-bag-line text-xl"></i> Add to Cart
                </button>
                <button 
                    onClick={handleBuyNow} 
                    disabled={product.stock_out || (selectedPrice.stock !== undefined && selectedPrice.stock <= 0)}
                    className="flex-1 bg-primary border-2 border-primary text-white hover:bg-primary-darker font-bold py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-sm hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i className="ri-flashlight-fill text-xl"></i> Buy Now
                </button>
            </div>
        </div>
      </div>

      {/* Description & Reviews Section */}
      <div className="mt-20">
        {/* Tabs */}
        <div className="border-y border-gray-200 py-4 mb-8 md:mb-16 flex justify-center items-center font-sans">
             <button 
                onClick={() => setActiveTab('description')} 
                className={`text-sm md:text-base font-bold transition-all px-6 md:px-12 ${activeTab === 'description' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
            >
                Description
            </button>
            <div className="w-[1px] h-5 bg-gray-300"></div>
            <button 
                onClick={() => setActiveTab('reviews')} 
                className={`text-sm md:text-base font-bold transition-all px-6 md:px-12 ${activeTab === 'reviews' ? 'text-primary' : 'text-gray-500 hover:text-gray-800'}`}
            >
                Reviews ({reviews.length})
            </button>
        </div>

        {/* Content Area */}
        <div className="max-w-3xl mx-auto font-sans">
            {activeTab === 'description' ? (
                <div className="fade-in px-4">
                    <div className={`text-gray-600 leading-relaxed text-base whitespace-pre-wrap text-left ${descExpanded ? '' : 'line-clamp-6'} relative transition-all duration-500`}>
                        {getDescription(product.description)}
                        {!descExpanded && product.description.length > 400 && (
                            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
                        )}
                    </div>
                    {product.description.length > 400 && (
                        <div className="text-center mt-4">
                            <button 
                                onClick={() => setDescExpanded(!descExpanded)} 
                                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-darker transition-colors"
                            >
                                {descExpanded ? 'Read less' : 'Read more'} 
                                <i className={`ri-arrow-${descExpanded ? 'up' : 'down'}-s-line`}></i>
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="fade-in px-4 py-4">
                    
                    {/* TRIGGER: Input Box */}
                    <div onClick={() => handleOpenReviewModal()} className="flex items-center gap-3 mb-8 cursor-pointer group">
                        <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 group-hover:border-primary group-hover:text-primary transition bg-white">
                            <i className="ri-user-line text-xl"></i>
                        </div>
                        <div className="flex-1 border border-gray-300 rounded-full h-12 px-4 flex items-center text-gray-400 bg-white group-hover:border-primary group-hover:text-primary transition">
                            Write a review...
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="flex flex-col gap-5">
                        {reviews.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No reviews yet.</div>
                        ) : (
                            reviews.map((review) => {
                                const isOwn = myReviewIds.includes(review.id);
                                const isLiked = likedReviewIds.includes(review.id);
                                const isReplying = activeReplyId === review.id;

                                return (
                                    <div key={review.id} className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm relative group hover:border-gray-300 transition-colors">
                                        
                                        {/* THREE DOTS MENU (Only if Own) */}
                                        {isOwn && (
                                            <div className="absolute top-4 right-4 z-10">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === review.id ? null : review.id); }}
                                                    className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
                                                >
                                                    <i className="ri-more-2-fill text-xl"></i>
                                                </button>
                                                
                                                {/* Dropdown */}
                                                {activeMenuId === review.id && (
                                                    <div ref={menuRef} className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-20 animate-fade-in">
                                                        <button 
                                                            onClick={() => handleOpenReviewModal(review)} 
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            <i className="ri-edit-line text-sm"></i> Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteReview(review.id)} 
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                                                        >
                                                            <i className="ri-delete-bin-line text-sm"></i> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Header */}
                                        <div className="flex gap-3 items-start pr-8">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center font-bold text-blue-600 flex-shrink-0 shadow-inner border border-white">
                                                {review.customer_name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-sm text-gray-800">{review.customer_name}</h4>
                                                    <span className="text-xs text-gray-400">• {formatDate(review.created_at)}</span>
                                                    {isOwn && <span className="text-xs text-gray-400">• My review</span>}
                                                </div>
                                                <div className="flex gap-1 mt-0.5 text-yellow-400 text-xs">
                                                    {[1,2,3,4,5].map(star => (
                                                        <i key={star} className={star <= review.rating ? "ri-star-fill" : "ri-star-line text-gray-200"}></i>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="pl-5 mt-2">
                                            <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                                {review.comment}
                                            </p>
                                            
                                            {/* Actions */}
                                            <div className="flex items-center gap-6 text-xs font-bold text-gray-500 mt-5 border-t border-gray-100 pt-3">
                                                <button 
                                                    onClick={() => handleToggleLike(review.id, review.likes || 0)}
                                                    className={`flex items-center gap-1.5 hover:text-primary transition group/btn ${isLiked ? 'text-primary' : ''}`}
                                                >
                                                    <i className={`${isLiked ? 'ri-thumb-up-fill' : 'ri-thumb-up-line'} w-4 h-4 text-base group-hover/btn:scale-110 transition-transform`}></i>
                                                    <span>{review.likes || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 hover:text-red-500 transition group/btn">
                                                    <i className="ri-thumb-down-line w-4 h-4 text-base group-hover/btn:scale-110 transition-transform mt-1"></i>
                                                </button>
                                                <button 
                                                    onClick={() => handleCommentClick(review.id)}
                                                    className={`flex items-center gap-1.5 hover:text-primary transition group/btn ${isReplying ? 'text-primary' : ''}`}
                                                >
                                                    <i className="ri-chat-1-line w-4 h-4 text-base group-hover/btn:scale-110 transition-transform"></i>
                                                    <span>Comment</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleShare(review)}
                                                    className="flex items-center gap-1.5 hover:text-primary transition group/btn ml-auto"
                                                >
                                                    <i className="ri-share-forward-line w-4 h-4 text-base group-hover/btn:scale-110 transition-transform"></i>
                                                    <span>Share</span>
                                                </button>
                                            </div>
                                            
                                            {/* Reply Demo */}
                                            {isReplying && (
                                                <div className="mt-4 flex gap-2 animate-fade-in">
                                                    <input type="text" placeholder="Write a reply..." className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-primary" />
                                                    <button onClick={() => alert("Comment feature is disabled in demo mode.")} className="bg-primary text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-primary-darker">Post</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 md:mt-24 border-t border-gray-100 pt-10 md:pt-16">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 md:mb-10 font-display text-center">Related Products</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8">
                {relatedProducts.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => navigate('details', p)}
                        className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
                    >
                        <div className="aspect-[4/3] overflow-hidden bg-gray-50 relative">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            {p.stock_out && (
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                    Stock Out
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <div className="mb-2">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">{p.category}</span>
                                <h4 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors font-display">{p.name}</h4>
                            </div>
                            <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                                <div className="font-poppins text-gray-900 font-bold">
                                    <span className="font-bangla font-black mr-0.5 text-base">৳</span>
                                    <span className="text-lg">{p.pricing?.[0]?.price || 0}</span>
                                </div>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        addToCart(p, 0); 
                                    }} 
                                    disabled={p.stock_out}
                                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm disabled:opacity-50"
                                >
                                    <i className="ri-add-line text-lg"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
             <div className="absolute inset-0" onClick={() => setShowReviewModal(false)}></div>
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 relative z-10">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-gray-700 text-center">{editingId ? 'Edit Review' : 'Rate your experience'}</h3>
                </div>
                
                <form onSubmit={handleSubmitReview} className="p-6 flex flex-col gap-5">
                    
                    {/* Stars */}
                    <div className="flex justify-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                        {[1,2,3,4,5].map(star => {
                            const isActive = (hoverRating || reviewRating) >= star;
                            return (
                                <button 
                                    type="button" 
                                    key={star} 
                                    onClick={() => setReviewRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    className="focus:outline-none transition transform hover:scale-110"
                                >
                                    {/* Using Remix Icon as SVG for exact style match from request */}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "text-yellow-400" : "text-gray-300 fill-gray-100"}>
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                </button>
                            );
                        })}
                    </div>

                    {/* Name Input */}
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <i className="ri-user-line text-xl"></i>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
                            value={reviewName}
                            onChange={e => setReviewName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Comment Input */}
                    <textarea 
                        rows={4}
                        placeholder="Share your thoughts..." 
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm font-medium"
                        value={reviewComment}
                        onChange={e => setReviewComment(e.target.value)}
                        required
                    ></textarea>

                    <div className="flex gap-3 mt-2">
                         <button 
                            type="button" 
                            onClick={() => setShowReviewModal(false)}
                            className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="flex-1 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-darker shadow-md transition flex items-center justify-center gap-2"
                        >
                            {submitting && <i className="ri-loader-4-line animate-spin"></i>}
                            {editingId ? 'Update' : 'Submit'}
                        </button>
                    </div>
                </form>
             </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsView;
