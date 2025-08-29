import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Flame, Eye, Heart, Clock, ArrowRight, Users, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrendingPost {
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

const HotTopics = () => {
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<TrendingPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHotTopics();
  }, []);

  const fetchHotTopics = async () => {
    try {
      // Fetch trending posts (high views in the last 30 days)
      const { data: trending, error: trendingError } = await supabase
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
        .eq('published', true)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('views', { ascending: false })
        .limit(6);

      if (trendingError) throw trendingError;
      setTrendingPosts(trending || []);

      // Fetch recent popular posts
      const { data: recent, error: recentError } = await supabase
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
        .eq('published', true)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(4);

      if (recentError) throw recentError;
      setRecentPosts(recent || []);

      // Fetch most popular posts overall
      const { data: popular, error: popularError } = await supabase
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
        .eq('published', true)
        .order('likes', { ascending: false })
        .limit(4);

      if (popularError) throw popularError;
      setPopularPosts(popular || []);

    } catch (error: any) {
      toast({
        title: "Error loading hot topics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const PostCard = ({ post, showTrending = false }: { post: TrendingPost; showTrending?: boolean }) => (
    <Card className="group hover:shadow-lg transition-all overflow-hidden">
      {post.featured_image && (
        <div className="aspect-video bg-muted overflow-hidden relative">
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {showTrending && (
            <Badge className="absolute top-3 right-3 bg-orange-500 hover:bg-orange-600">
              <Flame className="mr-1 h-3 w-3" />
              Trending
            </Badge>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{post.category}</Badge>
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Eye className="mr-1 h-3 w-3" />
              {post.views.toLocaleString()}
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
        <div className="flex items-center justify-between mb-4">
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
          <div className="flex flex-wrap gap-2">
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
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-6">
              <div className="h-8 bg-muted rounded w-48"></div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, j) => (
                  <Card key={j} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center mb-4">
          <Flame className="h-8 w-8 text-orange-500 mr-3" />
          <h1 className="text-4xl font-bold text-foreground">Hot Topics</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover the most trending and popular medical articles in our community
        </p>
      </div>

      {/* Stats Banner */}
      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <TrendingUp className="h-12 w-12 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{trendingPosts.length}</div>
            <p className="text-sm text-muted-foreground">Trending This Month</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{recentPosts.length}</div>
            <p className="text-sm text-muted-foreground">New This Week</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{popularPosts.length}</div>
            <p className="text-sm text-muted-foreground">Community Favorites</p>
          </CardContent>
        </Card>
      </div>

      {/* Trending Posts */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Flame className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/blogs?sort=views">
              View All Trending
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trendingPosts.slice(0, 6).map((post) => (
            <PostCard key={post.id} post={post} showTrending={true} />
          ))}
        </div>
        
        {trendingPosts.length === 0 && (
          <div className="text-center py-12">
            <Flame className="h-24 w-24 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No trending posts yet</h3>
            <p className="text-muted-foreground">Check back soon for trending content</p>
          </div>
        )}
      </section>

      {/* Recent Posts */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-3xl font-bold text-foreground">New This Week</h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/blogs?sort=recent">
              View All Recent
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {recentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* Popular Posts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Heart className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-3xl font-bold text-foreground">Community Favorites</h2>
          </div>
          <Button variant="outline" asChild>
            <Link to="/blogs?sort=likes">
              View All Popular
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {popularPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HotTopics;