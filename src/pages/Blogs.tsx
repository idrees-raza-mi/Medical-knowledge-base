import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, Clock, Eye, Heart, ArrowRight, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

const Blogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortBy]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          category,
          tags,
          views,
          likes,
          created_at,
          profiles:author_id (
            display_name
          )
        `)
        .eq('published', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory as any);
      }

      if (sortBy === 'views') {
        query = query.order('views', { ascending: false });
      } else if (sortBy === 'likes') {
        query = query.order('likes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const categories = ['Medicine', 'Surgery', 'Health Tips', 'Research', 'Lifestyle'];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Medical Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our comprehensive collection of evidence-based medical articles and health insights
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles, topics, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Latest</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
            <SelectItem value="likes">Most Liked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-all overflow-hidden">
            {post.featured_image && (
              <div className="aspect-video bg-muted overflow-hidden">
                <img 
                  src={post.featured_image} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{post.category}</Badge>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Eye className="mr-1 h-3 w-3" />
                    {post.views}
                  </div>
                  <div className="flex items-center">
                    <Heart className="mr-1 h-3 w-3" />
                    {post.likes}
                  </div>
                </div>
              </div>
              <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {post.excerpt}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <p>By {post.profiles?.display_name || 'Dr. Sarah Johnson'}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild className="group-hover:text-primary">
                  <Link to={`/blog/${post.slug}`}>
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              
              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search terms or filters
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Blogs;