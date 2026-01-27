import { cn } from '@/lib/utils';

type Viewport = 'desktop' | 'tablet' | 'mobile';

interface PreviewFrameProps {
  slug: string;
  viewport: Viewport;
}

const viewportStyles: Record<Viewport, { width: string; className: string }> = {
  desktop: {
    width: '100%',
    className: 'max-w-full',
  },
  tablet: {
    width: '768px',
    className: 'max-w-[768px]',
  },
  mobile: {
    width: '375px',
    className: 'max-w-[375px]',
  },
};

export default function PreviewFrame({ slug, viewport }: PreviewFrameProps) {
  const previewUrl = `/preview/${slug}`;
  const { className } = viewportStyles[viewport];

  return (
    <div
      className={cn(
        'relative bg-background rounded-2xl overflow-hidden transition-all duration-300 w-full',
        className,
        viewport === 'desktop' 
          ? 'shadow-elevated border border-border' 
          : 'shadow-2xl'
      )}
      style={{
        height: viewport === 'desktop' ? 'calc(100vh - 64px)' : 'calc(100vh - 100px)',
      }}
    >
      {/* Device frame for mobile/tablet */}
      {viewport !== 'desktop' && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Top bezel */}
          <div className={cn(
            'absolute top-0 left-0 right-0 bg-foreground/5 backdrop-blur-sm flex items-center justify-center',
            viewport === 'mobile' ? 'h-8' : 'h-6'
          )}>
            {viewport === 'mobile' && (
              <div className="w-20 h-5 bg-foreground/10 rounded-full" />
            )}
            {viewport === 'tablet' && (
              <div className="w-2.5 h-2.5 bg-foreground/20 rounded-full" />
            )}
          </div>
          
          {/* Bottom bezel for mobile */}
          {viewport === 'mobile' && (
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-foreground/5 flex items-center justify-center">
              <div className="w-24 h-1 bg-foreground/20 rounded-full" />
            </div>
          )}
          
          {/* Side bezels */}
          <div className={cn(
            'absolute top-0 bottom-0 left-0 bg-foreground/5',
            viewport === 'mobile' ? 'w-2' : 'w-1.5'
          )} />
          <div className={cn(
            'absolute top-0 bottom-0 right-0 bg-foreground/5',
            viewport === 'mobile' ? 'w-2' : 'w-1.5'
          )} />
        </div>
      )}

      <iframe
        src={previewUrl}
        className={cn(
          'w-full h-full border-0 bg-background',
          viewport === 'mobile' && 'pt-8 pb-6 px-2',
          viewport === 'tablet' && 'pt-6 px-1.5'
        )}
        title="Preview"
      />
    </div>
  );
}
