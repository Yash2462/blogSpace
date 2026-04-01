import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import PostsGrid from '../components/PostsGrid';
import { Loader2, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [createdPosts, setCreatedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const [createdResponse, likedResponse] = await Promise.all([
          api.get(`/api/posts/user/${user.id}/posts`),
          api.get(`/api/posts/user/${user.id}/liked/posts`),
        ]);

        setCreatedPosts(
          createdResponse.data.posts || createdResponse.data.data || createdResponse.data || []
        );
        setLikedPosts(
          likedResponse.data.posts || likedResponse.data.data || likedResponse.data || []
        );
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setAlert({
          type: 'error',
          message: 'Failed to fetch profile data. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center mt-16 p-6 bg-card rounded-xl border border-border shadow-sm">
        <h2 className="text-xl font-semibold text-foreground">Please log in to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Profile Header Card */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8 flex flex-col items-center text-center shadow-sm">
        <div className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-4xl font-bold mb-4">
          {user.username?.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{user.username}</h1>
        <p className="text-muted-foreground mb-6">{user.email}</p>
        
        <div className="flex gap-8 border-t border-border pt-6 w-full max-w-sm justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{createdPosts.length}</p>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{likedPosts.length}</p>
            <p className="text-sm text-muted-foreground">Liked Posts</p>
          </div>
        </div>
      </div>

      {alert && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          alert.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600 dark:text-green-500'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <span>{alert.message}</span>
          <button 
            className="ml-auto opacity-70 hover:opacity-100" 
            onClick={() => setAlert(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-border w-full flex justify-center mb-8">
        <div className="flex space-x-8">
          <button
            onClick={() => setTabIndex(0)}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
              tabIndex === 0 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setTabIndex(1)}
            className={`pb-4 px-2 text-sm font-medium transition-colors border-b-2 ${
              tabIndex === 1 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            Liked Posts
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {tabIndex === 0 && (
          <div>
            {createdPosts.length > 0 ? (
              <PostsGrid posts={createdPosts} />
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                You have not created any posts yet.
              </div>
            )}
          </div>
        )}
        
        {tabIndex === 1 && (
          <div>
            {likedPosts.length > 0 ? (
              <PostsGrid posts={likedPosts} />
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                You have not liked any posts yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
