import { Button } from '@/components/ui/button';
import { Trash2, Plus, Loader2 } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  onCreatePitches: () => void;
  isDeleting?: boolean;
  isCreating?: boolean;
  hasWebsites?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onCreatePitches,
  isDeleting = false,
  isCreating = false,
  hasWebsites = true,
}: BulkActionsBarProps) {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
        <span className="text-sm text-muted-foreground">
          {selectedCount > 0 ? (
            <>{selectedCount} of {totalCount} selected</>
          ) : (
            <>{totalCount} lead{totalCount !== 1 ? 's' : ''}</>
          )}
        </span>
      </div>

      {selectedCount > 0 && (
        <div className="flex items-center gap-2">
          {hasWebsites && (
            <Button
              size="sm"
              onClick={onCreatePitches}
              disabled={isCreating}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Pitch{selectedCount !== 1 ? 'es' : ''}
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
