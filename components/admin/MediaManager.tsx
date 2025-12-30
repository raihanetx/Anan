
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export const MediaManager: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from('product-images').list();
    if (data) {
        setFiles(data);
    } else {
        console.error(error);
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage.from('product-images').upload(filePath, file);
    if (error) {
        alert('Upload failed: ' + error.message);
    } else {
        fetchFiles();
    }
    setUploading(false);
  };

  const handleDelete = async (fileName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    const { error } = await supabase.storage.from('product-images').remove([fileName]);
    if (error) {
        alert('Delete failed: ' + error.message);
    } else {
        fetchFiles();
    }
  };

  const getPublicUrl = (fileName: string) => {
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('URL Copied!');
  };

  return (
    <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="font-bold text-gray-800">Media Library</h3>
                <p className="text-sm text-gray-500">Manage your uploaded product images.</p>
            </div>
            <div className="flex gap-2">
                <button onClick={fetchFiles} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
                    <i className="ri-refresh-line"></i>
                </button>
                <label className="bg-primary text-white px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-primary-darker transition-all flex items-center gap-2">
                    {uploading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-upload-cloud-line"></i>}
                    Upload Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
            </div>
        </div>

        {loading ? (
             <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
        ) : files.length === 0 ? (
             <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-2xl border-dashed">
                 <i className="ri-image-line text-4xl text-gray-300 mb-2 block"></i>
                 <p className="text-gray-500 font-medium">No images found.</p>
                 <p className="text-xs text-gray-400">Upload an image to get started.</p>
             </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map(file => {
                    const url = getPublicUrl(file.name);
                    return (
                        <div key={file.id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden aspect-square hover:shadow-md transition-all">
                            <img src={url} className="w-full h-full object-cover" alt={file.name} />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                <button 
                                    onClick={() => copyToClipboard(url)}
                                    className="bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100"
                                >
                                    Copy URL
                                </button>
                                <button 
                                    onClick={() => handleDelete(file.name)}
                                    className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-1.5 border-t border-gray-100">
                                <p className="text-[10px] text-gray-600 truncate text-center font-mono">{file.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
};
