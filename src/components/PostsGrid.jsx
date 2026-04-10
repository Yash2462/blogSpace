import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, isValid } from 'date-fns';
import PropTypes from 'prop-types';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';

const PostsGrid = ({ posts = [], onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [postStats, setPostStats] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    const initialLikedPosts = new Set();
    if (user && posts.length > 0) {
      posts.forEach((post) => {
        const postId = post._id || post.id || post.postId;
        if (post.likedBy?.some((like) => like.id === user.id)) {
          initialLikedPosts.add(postId);
        }
      });
      setLikedPosts(initialLikedPosts);
    }

    const fetchAllStats = async () => {
      if (posts.length === 0) return;
      const newStats = {};
      for (const post of posts) {
        const postId = post._id || post.id || post.postId;
        if (postId && !postStats[postId]) {
          try {
            const response = await api.get(`/api/posts/${postId}/stats`);
            newStats[postId] = response.data.data || { likes: 0, comments: 0 };
          } catch (error) {
            console.error(`Failed to fetch stats for post ${postId}`, error);
            newStats[postId] = { likes: 0, comments: 0 };
          }
        }
      }
      if (Object.keys(newStats).length > 0) {
        setPostStats((prev) => ({ ...prev, ...newStats }));
      }
    };

    fetchAllStats();
  }, [posts, user]);

  const handleLikeClick = async (e, postId) => {
    e.stopPropagation();
    if (!user) return;

    const wasLiked = likedPosts.has(postId);
    const originalStats = { ...postStats };
    const originalLikedPosts = new Set(likedPosts);

    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (wasLiked) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });

    setPostStats((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        likes: (prev[postId]?.likes || 0) + (wasLiked ? -1 : 1),
      },
    }));

    try {
      await api.post(`/api/posts/${postId}/like/user/${user.id}`);
    } catch (error) {
      console.error('Failed to update like status', error);
      setPostStats(originalStats);
      setLikedPosts(originalLikedPosts);
    }
  };

  const handlePostClick = (post) => {
    const postId = post._id || post.id || post.postId;
    if (postId) {
      navigate(`/posts/${postId}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || !isValid(new Date(dateString))) return 'No date';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const stripMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/[#*`>~]/g, '') // Remove basic symbols
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Keep link text, remove URL
      .trim();
  };


  if (!posts || posts.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground">
        No posts available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {posts.map((post) => {
        const postId = post._id || post.id || post.postId;
        if (!postId) return null;
        const isLiked = likedPosts.has(postId);
        const stats = postStats[postId] || { likes: 0, comments: 0 };

        return (
          <div
            key={postId}
            onClick={() => handlePostClick(post)}
            className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full w-full"
          >
            {(post.postImage || post.imageUrl) && (
              <div className="w-full h-48 overflow-hidden bg-muted">
                <img
                  src={post.postImage || post.imageUrl}
                  alt={post.title || 'Post image'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            
            <div className="flex flex-col flex-grow p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                  {post.category?.name || 'Uncategorized'}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDate(post.createdAt || post.updatedAt)}
                </span>
              </div>
              
              <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {post.title || 'Untitled Post'}
              </h2>
              
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow leading-relaxed">
                {stripMarkdown(post.data || post.content) || 'No content available'}
              </p>


              {/* Reading time */}
              <div className="text-[11px] font-medium text-muted-foreground mb-4 uppercase tracking-wider">
                {Math.max(1, Math.ceil(((post.data || post.content || '').split(' ').length) / 200))} min read
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <span className="text-xs font-medium text-foreground w-24 truncate">
                  By {post.user?.username || 'Anonymous'}
                </span>
                
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <button
                    onClick={(e) => handleLikeClick(e, postId)}
                    className="flex items-center space-x-1 hover:text-red-500 transition-colors group/btn"
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart 
                      className={`w-4 h-4 transition-transform group-hover/btn:scale-110 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                    <span className="text-xs">{stats.likes}</span>
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePostClick(post);
                    }}
                    className="flex items-center space-x-1 hover:text-primary transition-colors group/btn"
                    title="View Comments"
                  >
                    <MessageSquare className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                    <span className="text-xs">{stats.comments}</span>
                  </button>

                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(postId); }}
                      className="flex items-center space-x-1 hover:text-destructive transition-colors group/btn ml-auto"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

PostsGrid.propTypes = {
  posts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      postId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      data: PropTypes.string,
      content: PropTypes.string,
      postImage: PropTypes.string,
      imageUrl: PropTypes.string,
      category: PropTypes.shape({ name: PropTypes.string }),
      user: PropTypes.shape({ username: PropTypes.string }),
      likedBy: PropTypes.array,
    })
  ),
};

export default PostsGrid; 