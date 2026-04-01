import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import PostsGrid from '../components/PostsGrid';
import { Loader2, X } from 'lucide-react';

export const CommentsDialog = ({ open, onClose, postId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    api.get(`/api/comments/post/${postId}`)
      .then(res => {
        setComments(Array.isArray(res.data) ? res.data : res.data.comments || res.data.data || []);
      })
      .catch(() => setError('Failed to load comments.'))
      .finally(() => setLoading(false));
  }, [open, postId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user?.id) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/comments/user/${user.id}/post/${postId}/createComment`, { comment: newComment });
      const res = await api.get(`/api/comments/post/${postId}`);
      setComments(Array.isArray(res.data) ? res.data : res.data.comments || res.data.data || []);
      setNewComment('');
    } catch {
      setError('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-xl shadow-lg border border-border flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Comments</h2>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-1 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">{error}</div>
          ) : comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment, idx) => (
                <div key={comment.id || idx} className="pb-3 border-b border-border last:border-0 last:pb-0">
                  <p className="text-foreground">{comment.comment || comment.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {comment.user?.username ? `By ${comment.user.username}` : 'Anonymous'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-card rounded-b-xl">
          {user ? (
            <div className="space-y-3">
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Add a comment"
                rows="2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center"
                >
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Post Comment
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">Log in to add a comment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/api/posts');
        const postsData = Array.isArray(res.data) 
          ? res.data 
          : res.data.posts || res.data.data || [];
        setPosts(postsData.slice(0, 3));
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground border-b border-border pb-4">
          Dashboard
        </h1>
        <p className="mt-2 text-muted-foreground">Welcome to your dashboard. Here are the latest posts.</p>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <PostsGrid posts={posts} />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 