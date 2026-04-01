import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CommentsDrawer from '../components/CommentsDrawer';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';

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
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                {post.category?.name || 'Uncategorized'}
              </span>
              <span className="flex items-center">
                By <strong className="ml-1 text-foreground">{post.user?.username || 'Unknown'}</strong>
              </span>
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
          <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
            <ReactMarkdown
              components={{
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
          <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Thanks for reading!
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

      <CommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        postId={postId}
      />
    </div>
  );
};

export default PostDetail; 