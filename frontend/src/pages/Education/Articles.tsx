import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Filter, BookOpen, Clock, User, Heart, 
  Plus, Edit, Trash2, Eye, Star, Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contentService } from '@/services/contentService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  readTime: number;
  publishedAt: string;
  updatedAt: string;
  isPublished: boolean;
  views: number;
  likes: number;
  difficulty: string;
  imageUrl?: string;
  isLiked?: boolean;
  shareCount?: number;
}

const Articles: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isReading, setIsReading] = useState(false);

  const categories = [
    'All', 'Depression', 'Anxiety', 'PTSD', 'Self-Care', 
    'Coping Strategies', 'Relationships', 'Sleep', 'Nutrition', 'Mental Health'
  ];

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const articlesData = await contentService.getArticles();
      // Handle both array and paginated response formats
      const articles = Array.isArray(articlesData) ? articlesData : (articlesData.results || []);
      
      // Map backend fields to frontend interface
      const mappedArticles = articles.map((article: any) => ({
        ...article,
        author: article.author_name || article.author,
        category: article.category_name || article.category,
        readTime: article.estimated_read_time || 5,
        publishedAt: article.published_at,
        updatedAt: article.updated_at,
        isPublished: article.is_published,
        views: article.view_count || 0,
        likes: article.like_count || 0,
        difficulty: article.difficulty_level || 'beginner',
        isLiked: article.isLiked || false
      }));
      
      setArticles(mappedArticles);
    } catch (error) {
      console.error('Failed to load articles:', error);
      setArticles([]);
      toast({
        title: 'Error',
        description: 'Failed to load articles. Please check your connection.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = Array.isArray(articles) ? articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || article.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  }) : [];

  const handleLikeArticle = async (articleId: number) => {
    const article = articles.find(a => a.id === articleId);
    const isCurrentlyLiked = article?.isLiked;
    
    try {
      // Optimistic update for better UX
      setArticles(prev => Array.isArray(prev) ? prev.map(article => 
        article.id === articleId 
          ? { 
              ...article, 
              likes: isCurrentlyLiked 
                ? Math.max((article.likes || 1) - 1, 0)
                : (article.likes || 0) + 1,
              isLiked: !isCurrentlyLiked 
            }
          : article
      ) : []);
      
      // Try to save like to database
      try {
        const response = await fetch(`/api/content/articles/${articleId}/like/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ liked: !isCurrentlyLiked }),
        });

        if (response.ok) {
          const updatedArticle = await response.json();
          // Update with actual data from server
          setArticles(prev => Array.isArray(prev) ? prev.map(article => 
            article.id === articleId ? { ...article, ...updatedArticle } : article
          ) : []);
        } else {
          console.warn('Like API endpoint not available, using local state only');
        }
      } catch (apiError) {
        console.warn('Like API endpoint not available, using local state only:', apiError);
        // Continue with optimistic update - don't show error to user
      }
      
      toast({
        title: isCurrentlyLiked ? 'Article Unliked' : 'Article Liked',
        description: 'Thank you for your feedback!',
      });
      
    } catch (error) {
      console.error('Failed to like article:', error);
      
      // Revert optimistic update on error
      setArticles(prev => Array.isArray(prev) ? prev.map(article => 
        article.id === articleId 
          ? { ...article, likes: article.likes, isLiked: isCurrentlyLiked }
          : article
      ) : []);
      
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReadArticle = async (article: Article) => {
    setSelectedArticle(article);
    setIsReading(true);
    
    // Optimistically update view count
    setArticles(prev => Array.isArray(prev) ? prev.map(a => 
      a.id === article.id 
        ? { ...a, views: (a.views || 0) + 1 }
        : a
    ) : []);
    
    // Track article view in backend
    try {
      await fetch(`/api/content/articles/${article.id}/view/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.warn('View tracking API endpoint not available:', error);
      // Continue without showing error to user
    }
  };

  const handleShareArticle = async (article: Article) => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: `${window.location.origin}/education/articles/${article.id}`,
    };

    try {
      // Use Web Share API if available (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
        
        // Track share in database
        try {
          await fetch(`/api/content/articles/${article.id}/share/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ method: 'native_share' }),
          });
        } catch (trackError) {
          console.warn('Share tracking API endpoint not available:', trackError);
        }
        
        toast({
          title: 'Article Shared',
          description: 'Thank you for sharing this article!',
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        
        // Track share in database
        try {
          await fetch(`/api/content/articles/${article.id}/share/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ method: 'copy_link' }),
          });
        } catch (trackError) {
          console.warn('Share tracking API endpoint not available:', trackError);
        }
        
        toast({
          title: 'Link Copied',
          description: 'Article link copied to clipboard!',
        });
      }
    } catch (error) {
      console.error('Failed to share article:', error);
      
      // Fallback: Try to copy link
      try {
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: 'Link Copied',
          description: 'Article link copied to clipboard!',
        });
      } catch (clipboardError) {
        toast({
          title: 'Share Failed',
          description: 'Unable to share article. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageArticles = user?.role === 'admin' || user?.role === 'guide';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Educational Articles
              </h1>
              <p className="text-gray-600">
                Evidence-based articles on mental health and wellness
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={getDifficultyColor(article.difficulty)}>
                    {article.difficulty}
                  </Badge>
                  <Badge variant="outline">{article.category}</Badge>
                </div>
                <CardTitle className="text-lg leading-tight">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {article.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {article.readTime} min
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {article.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {(article.views || 0).toLocaleString()}
                    </div>
                    <button
                      onClick={() => handleLikeArticle(article.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        article.isLiked 
                          ? 'text-red-500 hover:text-red-600' 
                          : 'hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${article.isLiked ? 'fill-current' : ''}`} />
                      {article.likes || 0}
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReadArticle(article)}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Read
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleShareArticle(article)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {canManageArticles && (
                      <>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later for new content.
            </p>
          </div>
        )}
      </motion.div>

      {/* Article Reading Modal */}
      <Dialog open={isReading} onOpenChange={setIsReading}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedArticle?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedArticle && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-4">
                {/* Article Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b pb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedArticle.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedArticle.readTime} min read
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {(selectedArticle.views || 0).toLocaleString()} views
                  </div>
                  <Badge variant="outline">
                    {selectedArticle.category}
                  </Badge>
                  {selectedArticle.difficulty && (
                    <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                      {selectedArticle.difficulty}
                    </Badge>
                  )}
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="text-lg text-gray-700 mb-6 leading-relaxed">
                    {selectedArticle.excerpt}
                  </div>
                  
                  <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {selectedArticle.content || "This article content will be loaded from the database. Currently showing placeholder content for demonstration purposes."}
                  </div>
                </div>

                {/* Article Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Article Actions */}
                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeArticle(selectedArticle.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedArticle.isLiked
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${selectedArticle.isLiked ? 'fill-current' : ''}`} />
                      {selectedArticle.isLiked ? 'Liked' : 'Like'} ({selectedArticle.likes || 0})
                    </button>
                    <button 
                      onClick={() => handleShareArticle(selectedArticle)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                  
                  <Button onClick={() => setIsReading(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Articles;
