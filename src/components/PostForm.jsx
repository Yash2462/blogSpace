import { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, X, Loader2 } from 'lucide-react';
import api from '../api/axios';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-4 mb-2">
      <div className="absolute right-2 top-2 z-10 flex items-center">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={copied ? "Copied!" : "Copy code"}
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '2.5rem 1rem 1rem 1rem',
          fontSize: '0.9rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const PostForm = ({ open, onClose, onSubmit, post, loading = false }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.data || '');
  const [categoryId, setCategoryId] = useState(post?.category?.id || '');
  const [postImage, setPostImage] = useState(post?.postImage || '');
  const [activeTab, setActiveTab] = useState(0); // 0 = Write, 1 = Preview
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.data || '');
      setCategoryId(post.category?.id || '');
      setPostImage(post.postImage || '');
    } else {
      setTitle('');
      setContent('');
      setCategoryId('');
      setPostImage('');
    }
  }, [post, open]);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.get('/api/category');
      const categoriesData = Array.isArray(res.data) 
        ? res.data 
        : res.data.categories || res.data.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !categoryId) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setError('');
      await onSubmit({
        title,
        data: content,
        categoryId,
        postImage,
      });
    } catch (err) {
      setError('Failed to create post. Please try again.');
    }
  };

  const selectedCategory = categories.find(cat => cat.id === categoryId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-4xl rounded-xl shadow-lg border border-border flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {post ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 -mr-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground block">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 rounded-md border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                  !title && error ? 'border-red-500' : 'border-input'
                }`}
                placeholder="Enter title..."
              />
              {!title && error && (
                <p className="text-xs text-red-500 mt-1">Title is required</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground block">
                Image URL
              </label>
              <input
                type="url"
                value={postImage}
                onChange={(e) => setPostImage(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground block">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={categoriesLoading}
                className={`w-full px-4 py-2 rounded-md border bg-background/50 focus:bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none ${
                  !categoryId && error ? 'border-red-500' : 'border-input'
                }`}
              >
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : categories.length === 0 ? (
                  <option value="" disabled>No categories available</option>
                ) : (
                  <>
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {!categoryId && error && (
                <p className="text-xs text-red-500 mt-1">Please select a category</p>
              )}
            </div>

            {/* Markdown Tabs */}
            <div className="mt-6">
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setActiveTab(0)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 0
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 1
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Preview
                </button>
              </div>

              <div className="mt-4 min-h-[400px]">
                {activeTab === 0 ? (
                  <div className="border border-input rounded-md overflow-hidden bg-background">
                    <MDEditor
                      value={content}
                      onChange={setContent}
                      preview="edit"
                      height={400}
                      className="!bg-transparent aryan-text"
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-background rounded-lg border border-border min-h-[400px]">
                    <h1 className="text-3xl font-bold text-foreground mb-6">
                      {title || 'Untitled Post'}
                    </h1>
                    
                    {postImage && (
                      <div className="mb-6 rounded-lg overflow-hidden bg-muted border border-border/50 max-h-[300px] flex items-center justify-center">
                        <img 
                          src={postImage} 
                          alt={title} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    )}

                    <div className="max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <div className="aryan-block">
                              <span className="aryan-syntax">#</span>
                              <span className="font-bold text-xl">{children}</span>
                            </div>
                          ),
                          h2: ({ children }) => (
                            <div className="aryan-block">
                              <span className="aryan-syntax">##</span>
                              <span className="font-bold text-lg">{children}</span>
                            </div>
                          ),
                          h3: ({ children }) => (
                            <div className="aryan-block">
                              <span className="aryan-syntax">###</span>
                              <span className="font-bold">{children}</span>
                            </div>
                          ),
                          p: ({ children }) => {
                            if (typeof children === 'string' && children.trim() === '') return null;
                            return (
                              <div className="aryan-block">
                                {children}
                              </div>
                            );
                          },
                          ul: ({ children }) => (
                            <div className="aryan-block space-y-2">
                              {children}
                            </div>
                          ),
                          li: ({ children }) => (
                            <div className="flex items-start">
                              <span className="aryan-syntax">•</span>
                              <span>{children}</span>
                            </div>
                          ),
                          blockquote: ({ children }) => (
                            <div className="aryan-block border-l-4 border-primary/20">
                              <span className="aryan-syntax">&gt;</span>
                              <span className="italic opacity-80">{children}</span>
                            </div>
                          ),
                          code({node, inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <CodeBlock
                                language={match[1]}
                                value={String(children).replace(/\n$/, '')}
                                {...props}
                              />
                            ) : (
                              <code className={`${className} bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm`} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {content || 'Nothing to preview'}
                      </ReactMarkdown>
                    </div>

                    <p className="text-xs text-muted-foreground mt-8 pt-4 border-t border-border">
                      {selectedCategory ? `Category: ${selectedCategory.name}` : 'No category selected'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* hidden submit for enter key */}
            <button type="submit" className="hidden" />
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-border bg-card flex justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md font-medium text-foreground bg-background border border-input hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !title || !content || !categoryId}
            className="flex items-center px-4 py-2 rounded-md font-medium text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {post ? 'Updating...' : 'Creating...'}</>
            ) : post ? (
              'Update Post'
            ) : (
              'Create Post'
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PostForm;