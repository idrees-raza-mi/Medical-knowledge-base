import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, X, Clock, Eye, Heart, Share2 } from 'lucide-react';

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
  content: string;
  profiles: {
    display_name: string;
  };
}

interface BlogPreviewProps {
  post: BlogPost;
}

const BlogPreview = ({ post }: BlogPreviewProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const sharePost = (platform: string) => {
    const url = encodeURIComponent(window.location.origin + `/blog/${post.slug}`);
    const title = encodeURIComponent(post.title);
    const text = encodeURIComponent(post.excerpt);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (showPreview) {
    return (
      <>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              {post.featured_image && (
                <div className="aspect-video bg-muted overflow-hidden rounded-lg mb-4">
                  <img 
                    src={post.featured_image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{post.category}</Badge>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
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
              
              <CardTitle className="text-2xl mb-2">{post.title}</CardTitle>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <p>By {post.profiles?.display_name || 'Dr. Awais Raza'}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs">Share:</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sharePost('twitter')}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sharePost('linkedin')}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sharePost('facebook')}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sharePost('whatsapp')}
                    className="h-8 w-8 p-0"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{post.content}</div>
              </div>
              
              {post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="font-semibold mb-3">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="group-hover:text-primary"
      onClick={() => setShowPreview(true)}
    >
      Read More
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default BlogPreview;