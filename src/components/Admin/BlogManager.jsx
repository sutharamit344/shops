"use client";

import React, { useState, useEffect } from "react";
import Button from "@/components/UI/Button";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2, 
  FileText, 
  Calendar, 
  User, 
  ChevronRight,
  X,
  Check,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";
import { getBlogs, addBlog, updateBlog, deleteBlog } from "@/lib/db";
import Dialog from "@/components/UI/Dialog";
import { useToast } from "@/hooks/useToast";

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { success, error: toastError } = useToast();

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form State
  const [currentBlog, setCurrentBlog] = useState(null); // If set, we are editing
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "Business",
    author: "ShopBajar Team",
    coverImage: "",
    readTime: "5 min read"
  });
  const [blogToDelete, setBlogToDelete] = useState(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const data = await getBlogs();
      setBlogs(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "Business",
      author: "ShopBajar Team",
      coverImage: "",
      readTime: "5 min read"
    });
    setCurrentBlog(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEdit = (blog) => {
    setFormData({
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      category: blog.category || "Business",
      author: blog.author || "ShopBajar Team",
      coverImage: blog.coverImage || "",
      readTime: blog.readTime || "5 min read"
    });
    setCurrentBlog(blog);
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toastError("Title and content are required.");
      return;
    }

    setIsProcessing(true);
    try {
      if (currentBlog) {
        // Update
        const res = await updateBlog(currentBlog.id, formData);
        if (res.success) {
          success("Article updated successfully.");
          setShowFormModal(false);
          fetchBlogs();
        } else {
          toastError(res.error || "Update failed.");
        }
      } else {
        // Add
        const res = await addBlog(formData);
        if (res.success) {
          success("Article published successfully.");
          setShowFormModal(false);
          fetchBlogs();
        } else {
          toastError(res.error || "Publication failed.");
        }
      }
    } catch (err) {
      toastError("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;
    setIsProcessing(true);
    try {
      const res = await deleteBlog(blogToDelete.id);
      if (res.success) {
        success("Article deleted.");
        setShowDeleteModal(false);
        fetchBlogs();
      } else {
        toastError(res.error || "Deletion failed.");
      }
    } catch (err) {
      toastError("An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
      setBlogToDelete(null);
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center py-24 gap-4 text-center">
      <Loader2 className="animate-spin text-[#FF6A00] w-10 h-10 mb-2" />
      <p className="text-[11px] font-bold text-[#999] uppercase tracking-[0.2em]">Accessing editorial archives...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Controls */}
      <div className="bg-white rounded-[32px] border border-[#0A0A0F]/[0.06] shadow-md overflow-hidden">
        <div className="p-6 md:p-8 border-b border-[#0A0A0F]/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-[#0A0A0F] tracking-tight">Journal Master</h2>
            <p className="text-[13px] text-[#999] font-medium mt-1">Compose and manage platform articles and stories.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6A00] transition-colors" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-11 pr-6 py-2.5 bg-white border border-[#0A0A0F]/[0.08] rounded-lg outline-none focus:border-[#FF6A00] transition-all text-[13px] font-medium w-64"
              />
            </div>
            <button
              onClick={handleOpenAdd}
              className="h-10 px-6 bg-[#0A0A0F] text-white rounded-lg font-bold text-[13px] hover:bg-[#333] transition-all active:scale-95 flex items-center gap-2 shadow-md"
            >
              <Plus size={16} /> New Article
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-[#0A0A0F]/[0.04]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest">Article</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest">Metadata</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#999] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0A0A0F]/[0.02]">
              {filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-black/[0.05] relative">
                        {blog.coverImage ? (
                          <img src={blog.coverImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon className="absolute inset-0 m-auto text-gray-300" size={16} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0A0A0F] text-[15px] truncate max-w-xs">{blog.title}</p>
                        <p className="text-[11px] text-[#999] font-medium truncate max-w-xs">{blog.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-black text-[#0A0A0F] uppercase tracking-widest">
                        <User size={12} className="text-[#FF6A00]" /> {blog.author}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar size={12} /> {new Date(blog.createdAt?.seconds * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/blog/${blog.slug}`} target="_blank">
                        <button className="w-9 h-9 bg-gray-50 text-[#0A0A0F]/50 rounded-lg hover:bg-white hover:text-[#FF6A00] transition-all flex items-center justify-center border border-black/[0.03]">
                          <ExternalLink size={16} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(blog)}
                        className="w-9 h-9 bg-gray-50 text-[#0A0A0F]/75 rounded-lg hover:bg-[#0A0A0F] hover:text-white transition-all flex items-center justify-center border border-black/[0.03]"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => { setBlogToDelete(blog); setShowDeleteModal(true); }}
                        className="w-9 h-9 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBlogs.length === 0 && (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <FileText size={32} className="text-gray-200" />
              </div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">No articles found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Dialog isOpen={showFormModal} onClose={() => setShowFormModal(false)} maxWidth="max-w-4xl" showHeader={false}>
        <div className="p-8 md:p-12 overflow-y-auto max-h-[90vh]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-[#0A0A0F] tracking-tight">{currentBlog ? "Edit Article" : "Compose Article"}</h3>
              <p className="text-[13px] text-[#999] font-medium">Standard editorial format for ShopBajar Journal.</p>
            </div>
            <button onClick={() => setShowFormModal(false)} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#0A0A0F] transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Article Title</label>
                  <input 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full h-14 rounded-lg bg-gray-50 border border-[#0A0A0F]/[0.08] px-5 font-bold outline-none focus:border-[#FF6A00] transition-all" 
                    placeholder="e.g. 5 Ways to Grow Your Local Shop" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Short Excerpt</label>
                  <textarea 
                    value={formData.excerpt} 
                    onChange={e => setFormData({...formData, excerpt: e.target.value})}
                    className="w-full h-24 rounded-lg bg-gray-50 border border-[#0A0A0F]/[0.08] p-5 font-medium outline-none focus:border-[#FF6A00] transition-all resize-none" 
                    placeholder="Brief summary for list view..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Category</label>
                    <input 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="w-full h-12 rounded-lg bg-gray-50 border border-[#0A0A0F]/[0.08] px-4 font-bold outline-none focus:border-[#FF6A00]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Read Time</label>
                    <input 
                      value={formData.readTime} 
                      onChange={e => setFormData({...formData, readTime: e.target.value})}
                      className="w-full h-12 rounded-lg bg-gray-50 border border-[#0A0A0F]/[0.08] px-4 font-bold outline-none focus:border-[#FF6A00]" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Cover Image URL</label>
                  <input 
                    value={formData.coverImage} 
                    onChange={e => setFormData({...formData, coverImage: e.target.value})}
                    className="w-full h-14 rounded-lg bg-gray-50 border border-[#0A0A0F]/[0.08] px-5 font-bold outline-none focus:border-[#FF6A00] transition-all" 
                    placeholder="https://..." 
                  />
                  {formData.coverImage && (
                    <div className="mt-2 h-32 rounded-lg overflow-hidden border border-black/[0.05]">
                       <img src={formData.coverImage} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Author Name</label>
                  <input 
                    value={formData.author} 
                    onChange={e => setFormData({...formData, author: e.target.value})}
                    className="w-full h-12 rounded-lg bg-gray-50 border border-[#0A0A0F]/[0.08] px-4 font-bold outline-none focus:border-[#FF6A00]" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-widest ml-1">Article Content (HTML Supported)</label>
              <textarea 
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full h-96 rounded-2xl bg-gray-50 border border-[#0A0A0F]/[0.08] p-6 font-medium outline-none focus:border-[#FF6A00] transition-all resize-none font-mono text-sm" 
                placeholder="<p>Start writing your story here...</p>" 
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowFormModal(false)} className="px-8 h-14 bg-white border border-[#0A0A0F]/[0.06] rounded-lg text-[#0A0A0F] font-bold text-[14px] hover:bg-gray-50 transition-all">Cancel</button>
              <button type="submit" disabled={isProcessing} className="flex-1 h-14 bg-[#0A0A0F] text-white rounded-lg font-bold text-[14px] shadow-lg hover:bg-[#333] transition-all disabled:opacity-50">
                {isProcessing ? <Loader2 className="animate-spin mx-auto" size={20} /> : (currentBlog ? "Update Article" : "Publish to Journal")}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Modal */}
      <Dialog isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} maxWidth="max-w-md" showHeader={false}>
        <div className="p-8">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100"><Trash2 size={28} /></div>
          <h3 className="text-xl font-bold text-[#0A0A0F] mb-1">Remove Article</h3>
          <p className="text-[#666] text-[14px] mb-8">You are deleting <span className="font-bold text-red-500">"{blogToDelete?.title}"</span>. This action is irreversible.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteModal(false)} className="flex-1 h-12 bg-white border border-[#0A0A0F]/[0.06] rounded-lg text-[#0A0A0F] font-bold text-[13px] hover:bg-gray-50 transition-all">Abort</button>
            <button onClick={handleDelete} disabled={isProcessing} className="flex-1 h-12 bg-red-600 text-white rounded-lg font-bold text-[13px] shadow-md hover:bg-red-700 transition-all disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Confirm Removal"}</button>
          </div>
        </div>
      </Dialog>

    </div>
  );
};

export default BlogManager;

