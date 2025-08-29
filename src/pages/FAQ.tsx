import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, MessageCircle, HelpCircle, Send, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
}

interface UserQuery {
  id: string;
  question: string;
  answer: string;
  answered: boolean;
  approved: boolean;
  created_at: string;
  profiles: {
    display_name: string;
  };
}

const querySchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters long'),
});

type QueryFormValues = z.infer<typeof querySchema>;

const FAQ = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [userQueries, setUserQueries] = useState<UserQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<QueryFormValues>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      question: '',
    },
  });

  useEffect(() => {
    fetchFAQs();
    fetchUserQueries();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading FAQs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('user_queries')
        .select(`
          id,
          question,
          answer,
          answered,
          approved,
          created_at,
          profiles:user_id (
            display_name
          )
        `)
        .eq('approved', true)
        .eq('answered', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserQueries(data || []);
    } catch (error: any) {
      console.error('Error fetching user queries:', error);
    }
  };

  const handleSubmitQuery = async (data: QueryFormValues) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to ask questions",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_queries')
        .insert([
          {
            user_id: user.id,
            question: data.question,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Question submitted!",
        description: "Your question has been submitted for review. You'll be notified when it's answered.",
      });

      form.reset();
    } catch (error: any) {
      toast({
        title: "Error submitting question",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['General', 'Treatment', 'Prevention', 'Diagnosis', 'Lifestyle'];
  
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded"></div>
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
        <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find answers to common medical questions or ask your own
        </p>
      </div>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="faqs" className="flex items-center">
            <HelpCircle className="mr-2 h-4 w-4" />
            FAQs
          </TabsTrigger>
          <TabsTrigger value="ask" className="flex items-center">
            <MessageCircle className="mr-2 h-4 w-4" />
            Ask a Question
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-8">
          {/* Search and Filters */}
          <div className="space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge 
                variant={selectedCategory === 'all' ? 'default' : 'outline'} 
                className="cursor-pointer"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Badge>
              {categories.map(category => (
                <Badge 
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'} 
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-2">
                    <span>{faq.question}</span>
                    {faq.category && (
                      <Badge variant="outline" className="text-xs">
                        {faq.category}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <div className="prose prose-sm max-w-none">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-24 w-24 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No FAQs found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search terms or browse all categories
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {/* Community Questions */}
          {userQueries.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">Community Q&A</h2>
              <div className="space-y-6">
                {userQueries.map((query) => (
                  <Card key={query.id}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                        {query.question}
                      </CardTitle>
                      <CardDescription>
                        Asked by {query.profiles?.display_name || 'Anonymous'} • {new Date(query.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Check className="mr-2 h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Answered by Dr. Sarah Johnson</span>
                        </div>
                        <p className="text-muted-foreground">{query.answer}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ask" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Ask Dr. Sarah Johnson
              </CardTitle>
              <CardDescription>
                Have a medical question? Submit it here and get a professional answer. All questions are reviewed before being published.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmitQuery)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Question</label>
                  <Textarea
                    placeholder="Please describe your medical question in detail. Be specific about symptoms, duration, and any relevant medical history..."
                    className="min-h-32"
                    {...form.register('question')}
                  />
                  {form.formState.errors.question && (
                    <p className="text-sm text-destructive">{form.formState.errors.question.message}</p>
                  )}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Disclaimer:</strong> This platform is for educational purposes only and should not replace professional medical advice. 
                    In case of emergency, please contact your healthcare provider or emergency services immediately.
                  </p>
                </div>

                <Button type="submit" disabled={submitting || !user} className="w-full">
                  {submitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Question
                    </>
                  )}
                </Button>

                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Please <Button variant="link" className="p-0" asChild><a href="/auth">sign in</a></Button> to ask questions
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FAQ;