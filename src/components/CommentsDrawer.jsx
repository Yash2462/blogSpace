import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { X, Send, Trash2, Loader2, MessageSquare } from 'lucide-react';

const CommentsDrawer = ({ open, onClose, postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && postId) {
      fetchComments();
    }
  }, [open, postId]);

  const fetchComments = async () => {
    if (!postId) {
      setError('No post ID provided');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/comments/post/${postId}`);
      const commentsData = res.data?.data || res.data || [];
      const actualComments = Array.isArray(commentsData) ? commentsData : commentsData.comments || [];
      setComments(actualComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user?.id || !postId) return;

    setSubmitting(true);
    setError('');
    try {
      await api.post(`/api/comments/user/${user.id}/post/${postId}/createComment`, {
        comment: newComment
      });
      setNewComment('');
      await fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!commentId) return;
    
    try {
      await api.delete(`/api/comments/${commentId}`);
      await fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold flex items-center text-foreground">
            <MessageSquare className="w-5 h-5 mr-2" />
            Comments
          </h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-muted-foreground hover:bg-muted rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center space-y-2">
              <MessageSquare className="w-8 h-8 opacity-20" />
              <p>No comments yet.<br/>Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.commentId || comment.id || Math.random()} className="flex space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                    {comment.user?.username?.[0]?.toUpperCase() || comment.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold truncate text-foreground pr-2">
                        {comment.user?.username || comment.user?.name || 'Anonymous'}
                      </h4>
                      <div className="flex items-center">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {comment.commentedAt || comment.createdAt 
                            ? formatDistanceToNow(new Date(comment.commentedAt || comment.createdAt), { addSuffix: true }) 
                            : 'Just now'}
                        </span>
                        {user?.id === comment.user?.id && (
                          <button 
                            onClick={() => handleDelete(comment.commentId || comment.id)}
                            className="ml-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded"
                            title="Delete comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed break-words">
                      {comment.comment || comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input Form */}
        <div className="p-4 border-t border-border bg-card">
          {!user ? (
            <div className="text-center p-3 text-sm text-muted-foreground bg-muted rounded-lg">
              Log in to join the conversation.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center justify-center bg-primary text-primary-foreground p-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="Send comment"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentsDrawer; 