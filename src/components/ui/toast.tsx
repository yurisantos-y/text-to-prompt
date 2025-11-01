import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  onClose?: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', children, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'fixed bottom-4 right-4 z-[100] flex w-full max-w-md items-center justify-between space-x-4 rounded-md border p-4 shadow-lg',
          variant === 'default' && 'bg-background text-foreground',
          variant === 'destructive' && 'bg-destructive text-destructive-foreground',
          className
        )}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export { Toast };
