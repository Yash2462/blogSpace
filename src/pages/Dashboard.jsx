import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import PostsGrid from '../components/PostsGrid';
import { Loader2, X, PlusSquare, User, BookOpen, Heart, TrendingUp } from 'lucide-react';

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

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-foreground font-mono group-hover:text-primary transition-colors">{value}</p>
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [totalLikesReceived, setTotalLikesReceived] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const [myPostsRes, likedPostsRes] = await Promise.all([
          api.get(`/api/posts/user/${user.id}/posts`),
          api.get(`/api/posts/user/${user.id}/liked/posts`),
        ]);

        const myPostsData = myPostsRes.data.data || myPostsRes.data.posts || myPostsRes.data || [];
        const likedPostsData = likedPostsRes.data.data || likedPostsRes.data.posts || likedPostsRes.data || [];

        setMyPosts(Array.isArray(myPostsData) ? myPostsData : []);
        setLikedPosts(Array.isArray(likedPostsData) ? likedPostsData : []);

        // Compute total likes received on user's posts
        const totalLikes = myPostsData.reduce((sum, post) => sum + (post.likedBy?.length || 0), 0);
        setTotalLikesReceived(totalLikes);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show only the 3 most recent posts
  const recentPosts = myPosts.slice(0, 3);

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome back, <span className="text-primary">{user?.username || 'Writer'}</span> 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here's a summary of your activity on BlogSpace.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          icon={<BookOpen className="w-6 h-6 text-blue-500" />}
          label="Posts Written"
          value={myPosts.length}
          color="bg-blue-500/10"
        />
        <StatCard
          icon={<Heart className="w-6 h-6 text-red-500" />}
          label="Likes Received"
          value={totalLikesReceived}
          color="bg-red-500/10"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          label="Posts Liked"
          value={likedPosts.length}
          color="bg-green-500/10"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <button
          onClick={() => navigate('/create-post')}
          className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 hover:border-primary/40 transition-all text-primary font-semibold group"
        >
          <PlusSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Write a New Post
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 p-4 bg-muted border border-border rounded-2xl hover:bg-muted/80 hover:border-border/60 transition-all text-foreground font-semibold group"
        >
          <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
          View My Profile
        </button>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold tracking-tight text-foreground border-b border-border pb-3 w-full">
            My Recent Posts
          </h2>
        </div>

        {recentPosts.length > 0 ? (
          <>
            <PostsGrid posts={recentPosts} />
            {myPosts.length > 3 && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
                >
                  View all {myPosts.length} posts on your profile →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
            <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">You haven't written any posts yet.</p>
            <button
              onClick={() => navigate('/create-post')}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <PlusSquare className="w-4 h-4" />
              Write your first post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;