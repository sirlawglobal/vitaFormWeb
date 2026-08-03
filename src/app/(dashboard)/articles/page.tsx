'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Send, Upload, Loader2, ImageIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { adminApi } from '@/lib/api';
import { extractDataArray } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export interface Article {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  coverImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  authorId?: any;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalArticles, setTotalArticles] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await adminApi.uploadFile(file, 'articles');
      const uploadedUrl = res.data?.url || res.url;
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, coverImage: uploadedUrl }));
      }
    } catch (err: any) {
      console.error('Failed to upload article image:', err);
      const errorMsg = err?.error?.message || err?.message || 'Failed to upload image';
      alert(Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    tags: [],
    coverImage: '',
  });

  const [tagsInput, setTagsInput] = useState('');

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (statusFilter === 'published') params.isPublished = true;
      if (statusFilter === 'draft') params.isPublished = false;

      const response: any = await adminApi.getArticles(params);
      const data = extractDataArray(response);
      setArticles(data);
      setTotalArticles(response?.data?.meta?.total || response?.meta?.total || data.length);
    } catch (err) {
      console.warn('[Articles] Failed to fetch articles:', err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 500);
    return () => clearTimeout(timer);
  }, [page, search, statusFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convert tags string to array
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t !== '');
    const payload = { ...formData, tags: tagsArray };

    try {
      if (isEditing && selectedArticleId) {
        await adminApi.updateArticle(selectedArticleId, payload);
      } else {
        await adminApi.createArticle(payload);
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      console.error('Failed to save article:', err);
      const errorMsg = err?.message || err?.error?.message;
      alert(Array.isArray(errorMsg) ? errorMsg.join('\\n') : errorMsg || 'Failed to save article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedArticleId) return;
    setIsSubmitting(true);
    try {
      await adminApi.deleteArticle(selectedArticleId);
      setIsDeleteModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      console.error('Failed to delete article:', err);
      const errorMsg = err?.message || err?.error?.message;
      alert(Array.isArray(errorMsg) ? errorMsg.join('\\n') : errorMsg || 'Failed to delete article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedArticleId) return;
    setIsSubmitting(true);
    try {
      await adminApi.publishArticle(selectedArticleId);
      setIsPublishModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      console.error('Failed to publish article:', err);
      const errorMsg = err?.message || err?.error?.message;
      alert(Array.isArray(errorMsg) ? errorMsg.join('\\n') : errorMsg || 'Failed to publish article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedArticleId(null);
    setFormData({ title: '', slug: '', excerpt: '', content: '', tags: [], coverImage: '' });
    setTagsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (article: Article) => {
    setIsEditing(true);
    setSelectedArticleId(article.id || article._id || null);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      tags: article.tags,
      coverImage: article.coverImage || '',
    });
    setTagsInput(article.tags?.join(', ') || '');
    setIsModalOpen(true);
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Articles & Sleep Guides</h1>
          <p className="text-xs text-slate-400 mt-1">Publish editorial blog posts and mattress buying guides</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <input 
          type="text" 
          placeholder="Search by title, tags, or excerpt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
        />
        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-40 rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* List */}
      {articles.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-xs">
          {loading ? 'Fetching articles...' : 'No articles found.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {articles.map((article) => (
            <Card key={article.id || article._id} className="relative overflow-hidden group flex flex-col md:flex-row p-0">
              {article.coverImage && (
                <div className="md:w-1/3 h-32 md:h-auto bg-slate-800">
                  <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 flex-1 space-y-2">
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 p-1 rounded-lg backdrop-blur-sm">
                  {!article.isPublished && (
                    <button onClick={() => { setSelectedArticleId(article.id || article._id || null); setIsPublishModalOpen(true); }} className="p-1 text-slate-400 hover:text-blue-400" title="Publish">
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => openEditModal(article)} className="p-1 text-slate-400 hover:text-emerald-400" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setSelectedArticleId(article.id || article._id || null); setIsDeleteModalOpen(true); }} className="p-1 text-slate-400 hover:text-rose-400" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-start justify-between pr-14">
                  <h3 className="text-sm font-bold text-slate-100 line-clamp-2">{article.title}</h3>
                </div>
                
                <p className="text-xs text-slate-400 line-clamp-2">{article.excerpt}</p>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">#{tag}</span>
                  ))}
                  {article.tags && article.tags.length > 3 && <span className="text-[10px] text-slate-500">+{article.tags.length - 3}</span>}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800 mt-2">
                  <span>Author: {article.authorId?.firstName ? `${article.authorId.firstName} ${article.authorId.lastName}` : 'Admin'}</span>
                  <div className="flex items-center gap-2">
                    {article.isPublished ? (
                      <Badge status="active">Published</Badge>
                    ) : (
                      <Badge status="inactive">Draft</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalArticles > limit && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-6">
          <p className="text-xs text-slate-400">
            Showing <span className="font-medium text-slate-200">{(page - 1) * limit + 1}</span> to <span className="font-medium text-slate-200">{Math.min(page * limit, totalArticles)}</span> of <span className="font-medium text-slate-200">{totalArticles}</span> articles
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= totalArticles || loading}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Edit Article" : "Create New Article"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Slug (URL snippet) - Optional</label>
                <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" placeholder="Auto-generated if left blank" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Featured / Cover Image</label>
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors">
                    {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-emerald-400" />}
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
                  <span className="text-xs text-slate-500">or paste URL below</span>
                </div>
                <input
                  type="url"
                  value={formData.coverImage || ''}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
                {formData.coverImage && (
                  <div className="mt-2.5 relative aspect-video w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                    <img src={formData.coverImage} alt="Feature preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverImage: '' })}
                      className="absolute top-2 right-2 rounded-full bg-slate-900/80 p-1 text-slate-400 hover:text-slate-100 backdrop-blur"
                      title="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tags (comma separated)</label>
                <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" placeholder="mattress, sleep health, comfort" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Excerpt (Short Summary)</label>
                <textarea required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2.5 text-sm text-slate-100" rows={3} />
              </div>
            </div>
            
            <div className="flex flex-col h-[500px]">
              <label className="block text-xs font-medium text-slate-400 mb-1">Article Content</label>
              <div className="flex-1 overflow-hidden border border-slate-700 rounded-lg bg-slate-50 text-slate-900">
                <ReactQuill 
                  theme="snow"
                  value={formData.content || ''}
                  onChange={(val) => setFormData({...formData, content: val})}
                  modules={modules}
                  className="h-full pb-10"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              {isEditing ? 'Save Changes' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Article">
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">Are you sure you want to delete this article? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100">Cancel</button>
            <button onClick={handleDelete} disabled={isSubmitting} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50">Delete</button>
          </div>
        </div>
      </Modal>

      {/* Publish Modal */}
      <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)} title="Publish Article">
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">Are you sure you want to publish this article? It will become visible on the public storefront immediately.</p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button onClick={() => setIsPublishModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100">Cancel</button>
            <button onClick={handlePublish} disabled={isSubmitting} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50">Publish Now</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
