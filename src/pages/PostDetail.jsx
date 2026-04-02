import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CommentsDrawer from '../components/CommentsDrawer';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ArrowLeft, Loader2, MessageSquare, Share2, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

const CodeBlock = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-6 mb-4 rounded-xl overflow-hidden bg-[#1e1e1e] border border-border">
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
          borderRadius: 0,
          padding: '2.5rem 1rem 1rem 1rem',
          fontSize: '0.9rem',
          backgroundColor: 'transparent'
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get('/api/posts');
        let postsArray = [];
        if (Array.isArray(res.data)) {
          postsArray = res.data;
        } else if (res.data && Array.isArray(res.data.posts)) {
          postsArray = res.data.posts;
        } else if (res.data && Array.isArray(res.data.data)) {
          postsArray = res.data.data;
        }
        
        const foundPost = postsArray.find(p => 
          String(p._id) === String(postId) || 
          String(p.id) === String(postId) || 
          String(p.postId) === String(postId)
        );
        
        if (foundPost) {
          setPost(foundPost);
        } else {
          setError('Post not found');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="relative min-h-[calc(100vh-64px)] p-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="max-w-2xl mx-auto mt-12 bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20 flex items-center">
          <span className="font-semibold">{error || 'Post not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-background py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Posts
        </button>

        {/* Post Card */}
        <div className="bg-card border border-border shadow-sm rounded-3xl overflow-hidden p-6 sm:p-10 md:p-12">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-8">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-muted-foreground border-b border-border pb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px]">
                {post.category?.name || 'Uncategorized'}
              </span>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 opacity-70" />
                <span>{post.createdAt ? format(new Date(post.createdAt), 'MMMM dd, yyyy') : 'Recently Published'}</span>
              </div>

              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5 opacity-70" />
                <span>{Math.max(1, Math.ceil(((post.data || post.content || '').split(' ').length) / 200))} min read</span>
              </div>

              <div className="flex items-center">
                By <strong className="ml-1.5 text-foreground">{post.user?.username || 'Writer'}</strong>
              </div>

              <div className="ml-auto flex items-center">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // Could add a toast here
                  }}
                  className="flex items-center gap-2 hover:text-primary transition-colors font-medium border border-border px-3 py-1.5 rounded-lg hover:bg-accent"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          {post.postImage && (
            <div className="mb-10 rounded-2xl overflow-hidden bg-muted border border-border/50 max-h-[500px] flex items-center justify-center">
              <img
                src={post.postImage}
                alt={post.title}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Post Content */}
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
                  // If children is empty or just whitespace/newlines, don't render a block
                  const isEmpty = React.Children.toArray(children).every(child => 
                    typeof child === 'string' && child.trim() === ''
                  );
                  if (isEmpty) return null;
                  
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
                    <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {post.data || post.content}
            </ReactMarkdown>
          </div>

          {/* Footer Actions */}
          <div className="mt-12 pt-12 border-t border-border">
            
            {/* Author Section */}
            <div className="flex items-center gap-4 mb-12 p-6 rounded-2xl bg-muted/40 border border-border/50">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                {(post.user?.username || 'W')[0].toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-foreground">Written by {post.user?.username || 'Writer'}</h4>
                <p className="text-sm text-muted-foreground">Passionate about sharing knowledge and exploring the depth of tech and logic.</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground italic">
                Thanks for reading this article.
              </div>
              <button
                onClick={() => setCommentsOpen(true)}
                className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                View Comments
              </button>
            </div>
          </div>

        </div>
      </div>

      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={postId}
      />
    </div>
  );
};

export default PostDetail; 