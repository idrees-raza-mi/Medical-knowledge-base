import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Stethoscope, Heart, Brain, Scissors, Users, BookOpen, Clock, Eye, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: string;
  views: number;
  likes: number;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

interface CategoryStats {
  category: string;
  count: number;
  icon: any;
  description: string;
  color: string;
}

const categoryData: CategoryStats[] = [
  {
    category: 'Medicine',
    count: 0,
    icon: Stethoscope,
    description: 'General medical practices, diagnosis, and treatment approaches',
    color: 'bg-blue-500',
  },
  {
    category: 'Surgery',
    count: 0,
    icon: Scissors,
    description: 'Surgical procedures, techniques, and post-operative care',
    color: 'bg-red-500',
  },
  {
    category: 'Health Tips',
    count: 0,
    icon: Heart,
    description: 'Preventive care, lifestyle advice, and wellness guidance',
    color: 'bg-green-500',
  },
  {
    category: 'Research',
    count: 0,
    icon: Brain,
    description: 'Latest medical research, studies, and clinical findings',
    color: 'bg-purple-500',
  },
  {
    category: 'Lifestyle',
    count: 0,
    icon: Users,
    description: 'Work-life balance, mental health, and social aspects of medicine',
    color: 'bg-orange-500',
  },
];

const Categories = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>(categoryData);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'Medicine');
  const { toast } = useToast();

  useEffect(() => {
    fetchCategoryStats();
    fetchPostsByCategory(selectedCategory);
  }, [selectedCategory]);

  const fetchCategoryStats = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('category')
        .eq('published', true);

      if (error) throw error;

      const categoryCounts = categoryData.map(cat => ({
        ...cat,
        count: data?.filter(post => post.category === cat.category).length || 0,
      }));

      setCategories(categoryCounts);
    } catch (error: any) {
      toast({
        title: "Error loading categories",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchPostsByCategory = async (category: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          featured_image,
          category,
          views,
          likes,
          created_at,
          profiles:author_id (
            display_name
          )
        `)
        .eq('published', true)
        .eq('category', category as any)
        .order('created_at', { ascending: false });

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

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Medical Categories</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Browse articles by medical specialty and topic areas
        </p>
      </div>

      {/* Category Overview */}
      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {categories.map((category) => (
          <Card 
            key={category.category} 
            className={`group hover:shadow-lg transition-all cursor-pointer border-2 ${
              selectedCategory === category.category ? 'border-primary' : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedCategory(category.category)}
          >
            <CardContent className="p-6 text-center">
              <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <category.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{category.category}</h3>
              <p className="text-sm text-muted-foreground mb-2">{category.count} articles</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Category Content */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          {categories.map((category) => (
            <TabsTrigger 
              key={category.category} 
              value={category.category}
              className="text-xs md:text-sm"
            >
              {category.category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.category} value={category.category}>
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 ${category.color} rounded-lg mr-4 flex items-center justify-center`}>
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{category.category}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <BookOpen className="mr-1 h-4 w-4" />
                  {category.count} articles
                </div>
              </div>
            </div>

            {loading ? (
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
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {posts.length === 0 && !loading && (
              <div className="text-center py-12">
                <category.icon className="h-24 w-24 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No articles in {category.category} yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Check back soon for new content in this category
                </p>
                <Button variant="outline" asChild>
                  <Link to="/blogs">Browse All Articles</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Categories;