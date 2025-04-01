import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, XCircle } from 'lucide-react';
import BottomSheet from './BottomSheet';

export interface ActionItem {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions: ActionItem[];
  cancelLabel?: string;
}

export default function ActionSheet({
  isOpen,
  onClose,
  title,
  description,
  actions,
  cancelLabel = 'Batal'
}: ActionSheetProps) {
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
    >
      <div className="flex flex-col p-4 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            onClick={() => {
              action.onClick();
              onClose();
            }}
            disabled={action.disabled}
            className="w-full justify-start h-12 text-base"
          >
            {action.icon && <span className="mr-3">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full mt-2 h-12 text-base"
        >
          <XCircle className="mr-3 h-4 w-4" />
          {cancelLabel}
        </Button>
      </div>
    </BottomSheet>
  );
} 