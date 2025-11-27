import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { contentService } from '@/services/contentService';
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Loader2
} from 'lucide-react';

interface BulkOperationsBarProps {
  selectedItems: Array<{
    id: number;
    type: 'article' | 'video' | 'audio' | 'resource';
    title: string;
  }>;
  onClearSelection: () => void;
  onRefresh: () => void;
  userRole?: string;
}

const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedItems,
  onClearSelection,
  onRefresh,
  userRole = 'user'
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hardDelete, setHardDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isAdmin = userRole === 'admin';
  const selectedCount = selectedItems.length;

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    if (action === 'delete') {
      setShowConfirmDialog(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: string) => {
    if (selectedItems.length === 0) return;

    setLoading(true);
    try {
      // Group items by type for bulk operations
      const itemsByType = selectedItems.reduce((acc, item) => {
        if (!acc[item.type]) acc[item.type] = [];
        acc[item.type].push(item.id);
        return acc;
      }, {} as Record<string, number[]>);

      const promises = [];

      for (const [type, ids] of Object.entries(itemsByType)) {
        if (type === 'resource') {
          // Resources don't support bulk publish/unpublish, only delete
          if (action === 'delete') {
            for (const id of ids) {
              promises.push(contentService.deleteResource(id, hardDelete));
            }
          }
        } else {
          // Articles, videos, and audio support bulk operations
          if (action === 'delete') {
            for (const id of ids) {
              if (type === 'article') {
                promises.push(contentService.deleteArticle(id.toString(), hardDelete));
              } else if (type === 'video') {
                promises.push(contentService.deleteVideo(id, hardDelete));
              } else if (type === 'audio') {
                promises.push(contentService.deleteAudioContent(id, hardDelete));
              }
            }
          } else {
            promises.push(
              contentService.bulkContentAction(
                action as 'publish' | 'unpublish',
                type as 'article' | 'video' | 'audio',
                ids
              )
            );
          }
        }
      }

      await Promise.all(promises);

      const actionLabels = {
        publish: 'published',
        unpublish: 'unpublished',
        delete: hardDelete ? 'permanently deleted' : 'deleted'
      };

      toast({
        title: "Bulk operation completed",
        description: `${selectedCount} item${selectedCount > 1 ? 's' : ''} ${actionLabels[action as keyof typeof actionLabels]} successfully.`,
      });

      onClearSelection();
      onRefresh();
    } catch (error) {
      toast({
        title: "Bulk operation failed",
        description: `Failed to ${action} selected items. Some operations may have succeeded.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      setSelectedAction('');
      setHardDelete(false);
    }
  };

  const handleConfirmDelete = () => {
    executeAction('delete');
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-muted/50 border rounded-lg mb-4">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </Badge>
          
          <Select value={selectedAction} onValueChange={handleActionSelect}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Choose action..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="publish">
                <div className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Publish
                </div>
              </SelectItem>
              <SelectItem value="unpublish">
                <div className="flex items-center">
                  <EyeOff className="mr-2 h-4 w-4" />
                  Unpublish
                </div>
              </SelectItem>
              <SelectItem value="delete" className="text-red-600">
                <div className="flex items-center">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearSelection}
            disabled={loading}
          >
            Clear Selection
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirm Bulk Delete
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedCount} item{selectedCount > 1 ? 's' : ''}:
              <ul className="mt-2 max-h-32 overflow-y-auto">
                {selectedItems.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="text-sm text-muted-foreground">
                    • {item.title} ({item.type})
                  </li>
                ))}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>

          {isAdmin && (
            <div className="flex items-center space-x-2 py-2">
              <Checkbox
                id="hard-delete-bulk"
                checked={hardDelete}
                onCheckedChange={(checked) => setHardDelete(checked as boolean)}
              />
              <label
                htmlFor="hard-delete-bulk"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Permanently delete (cannot be undone)
              </label>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {hardDelete ? (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                Items will be permanently deleted and cannot be recovered.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-orange-600">
                <CheckCircle className="h-4 w-4" />
                Items will be unpublished and can be restored later.
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {hardDelete ? 'Permanently Delete' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkOperationsBar;
