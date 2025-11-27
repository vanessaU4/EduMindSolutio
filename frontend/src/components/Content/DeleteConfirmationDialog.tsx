import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hardDelete: boolean) => void;
  contentType: 'article' | 'video' | 'audio' | 'resource';
  contentTitle: string;
  loading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contentType,
  contentTitle,
  loading = false
}) => {
  const [hardDelete, setHardDelete] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.is_staff || user?.role === 'admin';

  const handleConfirm = () => {
    onConfirm(hardDelete);
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'article': return 'Article';
      case 'video': return 'Video';
      case 'audio': return 'Audio Content';
      case 'resource': return 'Mental Health Resource';
      default: return 'Content';
    }
  };

  const getSoftDeleteDescription = () => {
    switch (contentType) {
      case 'article':
      case 'video':
      case 'audio':
        return 'This will unpublish the content, making it invisible to users but keeping it in the system for potential recovery.';
      case 'resource':
        return 'This will mark the resource as unverified, making it invisible to users but keeping it in the system for potential recovery.';
      default:
        return 'This will hide the content from users but keep it in the system.';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete {getContentTypeLabel()}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to delete <strong>"{contentTitle}"</strong>?
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Default Action (Recommended)</p>
                  <p>{getSoftDeleteDescription()}</p>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hard-delete"
                    checked={hardDelete}
                    onCheckedChange={(checked) => setHardDelete(checked as boolean)}
                  />
                  <Label htmlFor="hard-delete" className="text-sm font-medium">
                    Permanently delete (Admin only)
                  </Label>
                </div>
                {hardDelete && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium mb-1">Warning: Permanent Deletion</p>
                        <p>This will permanently remove the {contentType} from the database. This action cannot be undone!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={loading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={hardDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {hardDelete ? 'Permanently Delete' : 'Unpublish'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
