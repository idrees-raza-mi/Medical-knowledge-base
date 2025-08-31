import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Eye, MessageSquare, HelpCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  likes: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  approved: boolean;
  created_at: string;
  post_id: string;
  user_id: string;
  profiles: { display_name: string };
  blog_posts: { title: string };
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  created_at: string;
}

interface UserQuery {
  id: string;
  question: string;
  answer: string;
  answered: boolean;
  approved: boolean;
  created_at: string;
  profiles: { display_name: string };
}

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [queries, setQueries] = useState<UserQuery[]>([]);
  
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingQuery, setEditingQuery] = useState<UserQuery | null>(null);
  
  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    featured_image: '',
    category: 'Medicine',
    tags: '',
    published: false
  });

  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: '',
    order_index: 0
  });

  const categories = ['Medicine', 'Surgery', 'Health Tips', 'Research', 'Lifestyle'];

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      // Fetch posts
      const { data: postsData } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (display_name),
          blog_posts:post_id (title)
        `)
        .order('created_at', { ascending: false });
      
      // Fetch FAQs
      const { data: faqsData } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });
      
      // Fetch user queries
      const { data: queriesData } = await supabase
        .from('user_queries')
        .select(`
          *,
          profiles:user_id (display_name)
        `)
        .order('created_at', { ascending: false });

      setPosts(postsData || []);
      setComments(commentsData || []);
      setFaqs(faqsData || []);
      setQueries(queriesData || []);
    } catch (error: any) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreatePost = async () => {
    try {
      const slug = newPost.title.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-');
      const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          ...newPost,
          slug,
          tags,
          author_id: user?.id,
          category: newPost.category as 'Medicine' | 'Surgery' | 'Health Tips' | 'Research' | 'Lifestyle'
        });

      if (error) throw error;

      toast({
        title: "Post created successfully",
        description: "Your blog post has been created.",
      });

      setNewPost({
        title: '',
        excerpt: '',
        content: '',
        featured_image: '',
        category: 'Medicine',
        tags: '',
        published: false
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    
    try {
      const tags = Array.isArray(editingPost.tags) 
        ? editingPost.tags 
        : (editingPost.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const { error } = await supabase
        .from('blog_posts')
        .update({
          title: editingPost.title,
          excerpt: editingPost.excerpt,
          content: editingPost.content,
          featured_image: editingPost.featured_image,
          category: editingPost.category as 'Medicine' | 'Surgery' | 'Health Tips' | 'Research' | 'Lifestyle',
          tags,
          published: editingPost.published
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      toast({
        title: "Post updated successfully",
        description: "Your blog post has been updated.",
      });

      setEditingPost(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Post deleted successfully",
        description: "The blog post has been deleted.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveComment = async (id: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ approved })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `Comment ${approved ? 'approved' : 'rejected'}`,
        description: `The comment has been ${approved ? 'approved' : 'rejected'}.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Comment deleted successfully",
        description: "The comment has been deleted.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateFaq = async () => {
    try {
      const { error } = await supabase
        .from('faqs')
        .insert([newFaq]);

      if (error) throw error;

      toast({
        title: "FAQ created successfully",
        description: "Your FAQ has been created.",
      });

      setNewFaq({
        question: '',
        answer: '',
        category: '',
        order_index: 0
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error creating FAQ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateFaq = async () => {
    if (!editingFaq) return;
    
    try {
      const { error } = await supabase
        .from('faqs')
        .update(editingFaq)
        .eq('id', editingFaq.id);

      if (error) throw error;

      toast({
        title: "FAQ updated successfully",
        description: "Your FAQ has been updated.",
      });

      setEditingFaq(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating FAQ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "FAQ deleted successfully",
        description: "The FAQ has been deleted.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error deleting FAQ",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAnswerQuery = async () => {
    if (!editingQuery) return;
    
    try {
      const { error } = await supabase
        .from('user_queries')
        .update({
          answer: editingQuery.answer,
          answered: true,
          approved: editingQuery.approved
        })
        .eq('id', editingQuery.id);

      if (error) throw error;

      toast({
        title: "Query answered successfully",
        description: "Your response has been saved.",
      });

      setEditingQuery(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error answering query",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your blog content and user interactions</p>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">Blog Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="queries">User Queries</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* Create New Post */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Create New Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Enter post title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newPost.category}
                    onValueChange={(value) => setNewPost({ ...newPost, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  placeholder="Enter post excerpt"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Enter post content"
                  rows={8}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    value={newPost.featured_image}
                    onChange={(e) => setNewPost({ ...newPost, featured_image: e.target.value })}
                    placeholder="Enter image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={newPost.published}
                  onChange={(e) => setNewPost({ ...newPost, published: e.target.checked })}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
              
              <Button onClick={handleCreatePost}>Create Post</Button>
            </CardContent>
          </Card>

          {/* Posts List */}
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <CardDescription>
                        {post.category} • {new Date(post.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {post.views}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPost(post)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <div className="grid gap-4">
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {comment.profiles?.display_name || 'Anonymous'}
                      </CardTitle>
                      <CardDescription>
                        On "{comment.blog_posts?.title}" • {new Date(comment.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={comment.approved ? "default" : "secondary"}>
                      {comment.approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{comment.content}</p>
                  <div className="flex items-center space-x-2">
                    {!comment.approved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveComment(comment.id, true)}
                      >
                        Approve
                      </Button>
                    )}
                    {comment.approved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproveComment(comment.id, false)}
                      >
                        Reject
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-6">
          {/* Create New FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Create New FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="faq-question">Question</Label>
                  <Input
                    id="faq-question"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    placeholder="Enter FAQ question"
                  />
                </div>
                <div>
                  <Label htmlFor="faq-category">Category</Label>
                  <Input
                    id="faq-category"
                    value={newFaq.category}
                    onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="faq-answer">Answer</Label>
                <Textarea
                  id="faq-answer"
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  placeholder="Enter FAQ answer"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="faq-order">Order Index</Label>
                <Input
                  id="faq-order"
                  type="number"
                  value={newFaq.order_index}
                  onChange={(e) => setNewFaq({ ...newFaq, order_index: parseInt(e.target.value) })}
                  placeholder="0"
                />
              </div>
              
              <Button onClick={handleCreateFaq}>Create FAQ</Button>
            </CardContent>
          </Card>

          {/* FAQs List */}
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <Card key={faq.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {faq.category && <Badge variant="outline">{faq.category}</Badge>}
                      <span className="text-sm text-muted-foreground">Order: {faq.order_index}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{faq.answer}</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingFaq(faq)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFaq(faq.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-6">
          <div className="grid gap-4">
            {queries.map((query) => (
              <Card key={query.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {query.profiles?.display_name || 'Anonymous'}
                      </CardTitle>
                      <CardDescription>
                        {new Date(query.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={query.answered ? "default" : "secondary"}>
                        {query.answered ? "Answered" : "Pending"}
                      </Badge>
                      <Badge variant={query.approved ? "default" : "outline"}>
                        {query.approved ? "Approved" : "Private"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Question:</h4>
                      <p>{query.question}</p>
                    </div>
                    
                    {query.answer && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-2">Answer:</h4>
                        <p>{query.answer}</p>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingQuery(query)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {query.answered ? 'Edit Answer' : 'Answer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingPost.category}
                    onValueChange={(value) => setEditingPost({ ...editingPost, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-excerpt">Excerpt</Label>
                <Textarea
                  id="edit-excerpt"
                  value={editingPost.excerpt || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  rows={8}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-featured-image">Featured Image URL</Label>
                  <Input
                    id="edit-featured-image"
                    value={editingPost.featured_image || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, featured_image: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                  <Input
                    id="edit-tags"
                    value={Array.isArray(editingPost.tags) ? editingPost.tags.join(', ') : editingPost.tags}
                    onChange={(e) => setEditingPost({ ...editingPost, tags: e.target.value as any })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-published"
                  checked={editingPost.published}
                  onChange={(e) => setEditingPost({ ...editingPost, published: e.target.checked })}
                />
                <Label htmlFor="edit-published">Published</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={handleUpdatePost}>Update Post</Button>
                <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {editingFaq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Edit FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-faq-question">Question</Label>
                <Input
                  id="edit-faq-question"
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-faq-answer">Answer</Label>
                <Textarea
                  id="edit-faq-answer"
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-faq-category">Category</Label>
                  <Input
                    id="edit-faq-category"
                    value={editingFaq.category || ''}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-faq-order">Order Index</Label>
                  <Input
                    id="edit-faq-order"
                    type="number"
                    value={editingFaq.order_index}
                    onChange={(e) => setEditingFaq({ ...editingFaq, order_index: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={handleUpdateFaq}>Update FAQ</Button>
                <Button variant="outline" onClick={() => setEditingFaq(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Answer Query Modal */}
      {editingQuery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Answer Query</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Question</Label>
                <p className="p-3 bg-muted rounded-md">{editingQuery.question}</p>
              </div>
              
              <div>
                <Label htmlFor="query-answer">Your Answer</Label>
                <Textarea
                  id="query-answer"
                  value={editingQuery.answer || ''}
                  onChange={(e) => setEditingQuery({ ...editingQuery, answer: e.target.value })}
                  placeholder="Enter your answer..."
                  rows={6}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="query-approved"
                  checked={editingQuery.approved}
                  onChange={(e) => setEditingQuery({ ...editingQuery, approved: e.target.checked })}
                />
                <Label htmlFor="query-approved">Make this answer public</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button onClick={handleAnswerQuery}>Save Answer</Button>
                <Button variant="outline" onClick={() => setEditingQuery(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;