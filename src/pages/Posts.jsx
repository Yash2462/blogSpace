import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import PostsGrid from '../components/PostsGrid';
import { Loader2, AlertCircle } from 'lucide-react';

const Posts = () => {
  const { user, loadingUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const catRes = await api.get('/api/category');
        const categoriesData =
          catRes.data.categories || catRes.data.data || catRes.data || [];

        setCategories([{ id: 'All', name: 'All' }, ...categoriesData]);

        const postRes = await api.get('/api/posts');
        const postsData =
          postRes.data.posts || postRes.data.data || postRes.data || [];
        setPosts(postsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setAlert({
          type: 'error',
          message: 'Failed to load the page. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchPostsByCategory = async () => {
      if (selectedCategory === 'All') {
        setLoading(true);
        try {
          const res = await api.get('/api/posts');
          const postsData = res.data.posts || res.data.data || res.data || [];
          setPosts(postsData);
        } catch (error) {
          console.error('Error fetching all posts:', error);
          setAlert({
            type: 'error',
            message: 'Failed to fetch posts. Please try again later.',
          });
          setPosts([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      const selected = categories.find((c) => c.name === selectedCategory);
      if (!selected || selected.id === 'All') return;

      setLoading(true);
      try {
        const res = await api.get(`/api/posts/category/${selected.id}/posts`);
        const postsData = res.data.posts || res.data.data || res.data || [];
        setPosts(postsData);
      } catch (error) {
        console.error(`Error fetching posts for category ${selectedCategory}:`, error);
        setAlert({
          type: 'error',
          message: `Failed to fetch posts for ${selectedCategory}.`,
        });
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (!loading) fetchPostsByCategory();
  }, [selectedCategory, categories]);

  const handleCategoryClick = (categoryName) => {
    if (categoryName !== selectedCategory) {
      setSelectedCategory(categoryName);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {alert && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-2 bg-destructive/10 text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{alert.message}</span>
            <button 
              className="ml-auto opacity-70 hover:opacity-100" 
              onClick={() => setAlert(null)}
            >
              ×
            </button>
          </div>
        )}

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            Welcome to BlogSpace
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing stories, share your thoughts, and connect with a
            community of passionate writers and readers.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((category) => (
            <button
              key={category.id || category.name}
              onClick={() => handleCategoryClick(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.name
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Post list or loader */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <PostsGrid posts={posts} />
        )}
      </div>
    </div>
  );
};

export default Posts;
