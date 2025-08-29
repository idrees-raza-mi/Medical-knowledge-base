import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Stethoscope, Heart, Brain, Scissors, BookOpen, TrendingUp, Users, Clock, ArrowRight, Star, Award, Shield } from 'lucide-react';

const topCategories = [
  { name: 'Medicine', icon: Stethoscope, count: 45, color: 'bg-blue-500' },
  { name: 'Surgery', icon: Scissors, count: 23, color: 'bg-red-500' },
  { name: 'Health Tips', icon: Heart, count: 67, color: 'bg-green-500' },
  { name: 'Research', icon: Brain, count: 34, color: 'bg-purple-500' },
  { name: 'Lifestyle', icon: Users, count: 29, color: 'bg-orange-500' },
];

const stats = [
  { label: 'Published Articles', value: '200+', icon: BookOpen },
  { label: 'Happy Readers', value: '50K+', icon: Users },
  { label: 'Years Experience', value: '15+', icon: Award },
  { label: 'Medical Awards', value: '25+', icon: Star },
];

const featuredTopics = [
  {
    title: 'Latest Breakthrough in Cancer Research',
    excerpt: 'Discover the revolutionary new treatment approaches that are changing cancer care...',
    readTime: '8 min read',
    category: 'Research',
    trending: true,
  },
  {
    title: 'Mental Health in Modern Medicine',
    excerpt: 'Understanding the importance of mental wellness in overall patient care and recovery...',
    readTime: '6 min read',
    category: 'Medicine',
    trending: true,
  },
  {
    title: 'Preventive Care Best Practices',
    excerpt: 'Essential preventive measures that can significantly improve long-term health outcomes...',
    readTime: '5 min read',
    category: 'Health Tips',
    trending: false,
  },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="outline" className="w-fit">
                  <Shield className="mr-2 h-3 w-3" />
                  Board Certified Physician
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Welcome to
                  <span className="text-primary block">MedBlog</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Your trusted source for evidence-based medical insights, health tips, and the latest breakthroughs in healthcare.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link to="/blogs">
                    Explore Articles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {!user && (
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/auth?mode=signup">Join Community</Link>
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-card to-muted/50">
                <CardHeader className="text-center">
                  <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Stethoscope className="h-12 w-12 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl">Dr. Awais Raza</CardTitle>
                  <CardDescription>
                    Board Certified Docotor of Medicine
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    "Committed to bridging the gap between complex medical research and practical patient care through accessible, evidence-based content."
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
                    <span>• layyah, Pakistan</span>
                    <span>• 3+ Years Experience</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore Medical Topics
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dive into our comprehensive collection of medical articles across various specialties
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topCategories.map((category) => (
              <Card key={category.name} className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                <Link to={`/categories?category=${encodeURIComponent(category.name)}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${category.color} rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <category.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} articles</p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Topics Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Topics
              </h2>
              <p className="text-lg text-muted-foreground">
                Stay updated with the latest medical insights and trending health topics
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/blogs">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTopics.map((topic, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{topic.category}</Badge>
                    {topic.trending && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {topic.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{topic.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {topic.readTime}
                    </div>
                    <Button variant="ghost" size="sm" className="group-hover:text-primary">
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Informed About Your Health
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of healthcare professionals and patients who trust MedBlog for reliable medical information
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/auth?mode=signup">
                Join Our Community
                <Users className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link to="/faq">Ask Questions</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
