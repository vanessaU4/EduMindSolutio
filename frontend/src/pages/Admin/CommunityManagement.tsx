import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  MessageSquare, Users, Flag, Lock, Pin, Trash2, 
  Eye, Search, Loader2, AlertTriangle, CheckCircle, 
  MoreHorizontal, Edit, ToggleLeft, ToggleRight, Plus
} from 'lucide-react';
import { communityService, ForumPost, ForumCategory, ModerationReport } from '@/services/communityService';
import { RoleGuard } from '@/components/RoleGuard';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import ForumPostForm from '@/components/Community/ForumPostForm';
import ForumCategoryForm from '@/components/Community/ForumCategoryForm';

const CommunityManagement: React.FC = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<'posts' | 'categories' | 'reports'>('posts');
  const [contentLoading, setContentLoading] = useState(false);
  const [showForm, setShowForm] = useState<'post' | 'category' | null>(null);
  const [editingItem, setEditingItem] = useState<ForumPost | ForumCategory | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, postsData, reportsData] = await Promise.all([
        communityService.getForumCategories(),
        communityService.getForumPosts(),
        communityService.getModerationReports(),
      ]);
      setCategories(categoriesData);
      setPosts(postsData);
      setReports(reportsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load community data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentTypeSelect = (type: 'posts' | 'categories' | 'reports') => {
    setSelectedContentType(type);
  };

  const handleOpenForm = (formType: 'post' | 'category') => {
    setShowForm(formType);
  };

  const handleCloseForm = () => {
    setShowForm(null);
    setEditingItem(null);
    loadData(); // Refresh data after form operations
  };

  const handleCreatePost = async (data: any) => {
    try {
      if (editingItem && 'title' in editingItem) {
        // Update existing post
        await communityService.updateForumPost(editingItem.id, data);
        toast({
          title: "Success",
          description: "Forum post updated successfully",
        });
      } else {
        // Create new post
        await communityService.createForumPost(data);
        toast({
          title: "Success",
          description: "Forum post created successfully",
        });
      }
      handleCloseForm();
    } catch (error: any) {
      let errorMessage = editingItem ? "Failed to update post" : "Failed to create post";
      
      if (error?.response?.data) {
        // Handle validation errors from backend
        const errorData = error.response.data;
        if (errorData.title && Array.isArray(errorData.title)) {
          errorMessage = errorData.title[0];
        } else if (errorData.content && Array.isArray(errorData.content)) {
          errorMessage = errorData.content[0];
        } else if (errorData.category && Array.isArray(errorData.category)) {
          errorMessage = errorData.category[0];
        } else if (errorData.author_mood && Array.isArray(errorData.author_mood)) {
          errorMessage = errorData.author_mood[0];
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleCreateCategory = async (data: any) => {
    try {
      if (editingItem && 'name' in editingItem) {
        // Update existing category
        await communityService.updateForumCategory(editingItem.id, data);
        toast({
          title: "Success",
          description: "Forum category updated successfully",
        });
      } else {
        // Create new category
        await communityService.createForumCategory(data);
        toast({
          title: "Success",
          description: "Forum category created successfully",
        });
      }
      handleCloseForm();
    } catch (error: any) {
      let errorMessage = editingItem ? "Failed to update category" : "Failed to create category";
      
      if (error?.response?.data) {
        // Handle validation errors from backend
        const errorData = error.response.data;
        if (errorData.name && Array.isArray(errorData.name)) {
          errorMessage = errorData.name[0];
        } else if (errorData.description && Array.isArray(errorData.description)) {
          errorMessage = errorData.description[0];
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleEditPost = (post: ForumPost) => {
    setEditingItem(post);
    setShowForm('post');
  };

  const handleEditCategory = (category: ForumCategory) => {
    setEditingItem(category);
    setShowForm('category');
  };

  const handleTogglePin = async (id: number, isPinned: boolean) => {
    try {
      if (isPinned) {
        await communityService.unpinForumPost(id);
        toast({
          title: 'Success',
          description: 'Post unpinned successfully',
        });
      } else {
        await communityService.pinForumPost(id);
        toast({
          title: 'Success',
          description: 'Post pinned successfully',
        });
      }
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isPinned ? 'unpin' : 'pin'} post`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleLock = async (id: number, isLocked: boolean) => {
    try {
      if (isLocked) {
        await communityService.unlockForumPost(id);
        toast({
          title: 'Success',
          description: 'Post unlocked successfully',
        });
      } else {
        await communityService.lockForumPost(id);
        toast({
          title: 'Success',
          description: 'Post locked successfully',
        });
      }
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isLocked ? 'unlock' : 'lock'} post`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleCategoryActive = async (id: number, isActive: boolean) => {
    try {
      if (isActive) {
        await communityService.deactivateForumCategory(id);
        toast({
          title: 'Success',
          description: 'Category deactivated successfully',
        });
      } else {
        await communityService.activateForumCategory(id);
        toast({
          title: 'Success',
          description: 'Category activated successfully',
        });
      }
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isActive ? 'deactivate' : 'activate'} category`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleApproval = async (id: number, isApproved: boolean) => {
    try {
      if (isApproved) {
        await communityService.unapproveForumPost(id);
        toast({
          title: 'Success',
          description: 'Post unapproved successfully',
        });
      } else {
        await communityService.approveForumPost(id);
        toast({
          title: 'Success',
          description: 'Post approved successfully',
        });
      }
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isApproved ? 'unapprove' : 'approve'} post`,
        variant: 'destructive',
      });
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    try {
      console.log('Deleting post with id:', id);
      setLoading(true);
      
      await communityService.deleteForumPost(id);
      console.log('Post deleted successfully');
      
      // Refresh the data from server
      console.log('Refreshing data after post deletion...');
      await loadData();
      console.log('Data refreshed successfully');
      
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      
      console.log('Success toast shown for post deletion');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone and will affect all posts in this category.')) return;

    try {
      console.log('Deleting category with id:', id);
      setLoading(true);
      
      await communityService.deleteForumCategory(id);
      console.log('Category deleted successfully');
      
      // Refresh the data from server
      console.log('Refreshing data after category deletion...');
      await loadData();
      console.log('Data refreshed successfully');
      
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
      
      console.log('Success toast shown for category deletion');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      let errorMessage = "Failed to delete category";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      await communityService.resolveModerationReport(reportId, {});
      toast({
        title: 'Success',
        description: 'Report resolved successfully',
      });
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve report',
        variant: 'destructive',
      });
    }
  };

  const handleDismissReport = async (reportId: number) => {
    try {
      await communityService.dismissModerationReport(reportId, {});
      toast({
        title: 'Success',
        description: 'Report dismissed successfully',
      });
      await loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss report',
        variant: 'destructive',
      });
    }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPostsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Likes</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredPosts.map((post) => (
          <TableRow key={post.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {post.is_pinned && <Badge variant="secondary">Pinned</Badge>}
                {post.is_locked && <Badge variant="outline">Locked</Badge>}
                <span className="truncate max-w-xs">{post.title}</span>
              </div>
            </TableCell>
            <TableCell>{post.author_display_name}</TableCell>
            <TableCell>
              <Badge variant={post.is_approved ? "default" : "secondary"}>
                {post.is_approved ? 'Approved' : 'Pending'}
              </Badge>
            </TableCell>
            <TableCell>{post.view_count}</TableCell>
            <TableCell>{post.like_count}</TableCell>
            <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditPost(post)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTogglePin(post.id, post.is_pinned)}>
                    {post.is_pinned ? (
                      <><ToggleLeft className="mr-2 h-4 w-4" />Unpin</>
                    ) : (
                      <><Pin className="mr-2 h-4 w-4" />Pin</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleLock(post.id, post.is_locked)}>
                    {post.is_locked ? (
                      <><ToggleRight className="mr-2 h-4 w-4" />Unlock</>
                    ) : (
                      <><Lock className="mr-2 h-4 w-4" />Lock</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleApproval(post.id, post.is_approved)}>
                    {post.is_approved ? (
                      <><ToggleLeft className="mr-2 h-4 w-4" />Unapprove</>
                    ) : (
                      <><CheckCircle className="mr-2 h-4 w-4" />Approve</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeletePost(post.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderCategoriesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Order</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">{category.name}</TableCell>
            <TableCell className="max-w-xs truncate">{category.description}</TableCell>
            <TableCell>
              <Badge variant={category.is_active ? "default" : "secondary"}>
                {category.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{category.order}</TableCell>
            <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleCategoryActive(category.id, category.is_active)}>
                    {category.is_active ? (
                      <><ToggleLeft className="mr-2 h-4 w-4" />Deactivate</>
                    ) : (
                      <><ToggleRight className="mr-2 h-4 w-4" />Activate</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderReportsTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Reporter</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <Badge variant="outline">
                {report.report_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </TableCell>
            <TableCell>{report.reporter_name}</TableCell>
            <TableCell className="max-w-xs truncate">{report.description}</TableCell>
            <TableCell>
              {report.reported_post ? `Post #${report.reported_post}` :
               report.reported_comment ? `Comment #${report.reported_comment}` :
               report.reported_user ? `User #${report.reported_user}` : 'N/A'}
            </TableCell>
            <TableCell>
              <Badge variant={
                report.status === 'resolved' ? 'default' :
                report.status === 'dismissed' ? 'secondary' :
                report.status === 'under_review' ? 'outline' : 'destructive'
              }>
                {report.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </TableCell>
            <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              {report.status === 'pending' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleResolveReport(report.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Resolve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDismissReport(report.id)}>
                      <ToggleLeft className="mr-2 h-4 w-4" />
                      Dismiss
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderContentTable = () => {
    const getContentData = () => {
      switch (selectedContentType) {
        case 'posts': return filteredPosts;
        case 'categories': return categories;
        case 'reports': return reports;
        default: return [];
      }
    };

    const getContentTitle = () => {
      switch (selectedContentType) {
        case 'posts': return 'Forum Posts';
        case 'categories': return 'Forum Categories';
        case 'reports': return 'Reports';
        default: return 'Content';
      }
    };

    const getEmptyIcon = () => {
      switch (selectedContentType) {
        case 'posts': return MessageSquare;
        case 'categories': return Users;
        case 'reports': return Flag;
        default: return MessageSquare;
      }
    };

    const contentData = getContentData();
    const EmptyIcon = getEmptyIcon();

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{getContentTitle()}</CardTitle>
            {selectedContentType !== 'reports' && (
              <Button onClick={() => handleOpenForm(
                selectedContentType === 'posts' ? 'post' :
                selectedContentType === 'categories' ? 'category' : 'post'
              )}>
                <Plus className="w-4 h-4 mr-2" />
                New {getContentTitle().slice(0, -1)}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {contentLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading {getContentTitle().toLowerCase()}...</p>
            </div>
          ) : contentData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <EmptyIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No {getContentTitle().toLowerCase()} found</p>
              <p className="text-sm">
                {selectedContentType === 'reports' 
                  ? 'Reported content will appear here for moderation'
                  : `Create your first ${getContentTitle().toLowerCase().slice(0, -1)} to get started`
                }
              </p>
            </div>
          ) : (
            selectedContentType === 'posts' ? renderPostsTable() :
            selectedContentType === 'categories' ? renderCategoriesTable() :
            selectedContentType === 'reports' ? renderReportsTable() :
            <div className="text-center py-8 text-gray-500">
              <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No content found</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
      </div>
    );
  }

  // Show form if requested
  if (showForm) {
    const renderForm = () => {
      switch (showForm) {
        case 'post':
          return (
            <ErrorBoundary>
              <ForumPostForm
                onSubmit={handleCreatePost}
                onCancel={handleCloseForm}
                initialData={editingItem && 'title' in editingItem ? editingItem : undefined}
                isEditing={!!editingItem}
              />
            </ErrorBoundary>
          );
        case 'category':
          return (
            <ErrorBoundary>
              <ForumCategoryForm
                onSubmit={handleCreateCategory}
                onCancel={handleCloseForm}
                initialData={editingItem && 'name' in editingItem ? editingItem : undefined}
                isEditing={!!editingItem}
              />
            </ErrorBoundary>
          );
        default:
          return null;
      }
    };

    return (
      <ErrorBoundary>
        <RoleGuard requireModeration>
          <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
            <div className="mb-4">
              <Button variant="ghost" onClick={handleCloseForm} className="mb-4">
                ← Back to Community Management
              </Button>
            </div>
            {renderForm()}
          </div>
        </RoleGuard>
      </ErrorBoundary>
    );
  }

  const communityTypes = [
    {
      id: 'posts',
      name: 'Forum Posts',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      description: 'Moderate and manage forum posts',
      total: posts.length,
      featured: posts.filter(p => p.is_pinned).length,
    },
    {
      id: 'categories',
      name: 'Categories',
      icon: Users,
      color: 'bg-green-100 text-green-600',
      description: 'Manage forum categories and topics',
      total: categories.length,
      featured: categories.filter(c => c.is_active).length,
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: Flag,
      color: 'bg-red-100 text-red-600',
      description: 'Review reported content and violations',
      total: reports.length,
      featured: reports.filter(r => r.status === 'pending').length,
    },
  ];

  return (
    <ErrorBoundary>
      <RoleGuard requireModeration>
        <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Management</h1>
            <p className="text-gray-600">Moderate forums, posts, and community interactions</p>
          </div>

          {/* Community Type Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {communityTypes.map((type) => (
              <Card 
                key={type.id} 
                className={`cursor-pointer transition-all ${selectedContentType === type.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'}`}
                onClick={() => handleContentTypeSelect(type.id as any)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline">{type.total}</Badge>
                  </div>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {type.id === 'posts' ? `Pinned: ${type.featured}` :
                       type.id === 'categories' ? `Active: ${type.featured}` :
                       `Pending: ${type.featured}`}
                    </span>
                    {type.id !== 'reports' && (
                      <Button size="sm" variant="outline" onClick={(e) => { 
                        e.stopPropagation(); 
                        handleOpenForm(
                          type.id === 'posts' ? 'post' :
                          type.id === 'categories' ? 'category' : 'post'
                        );
                      }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add New
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search */}
          {selectedContentType === 'posts' && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Content Display */}
          <ErrorBoundary>
            {renderContentTable()}
          </ErrorBoundary>

        </div>
      </RoleGuard>
    </ErrorBoundary>
  );
};

export default CommunityManagement;
