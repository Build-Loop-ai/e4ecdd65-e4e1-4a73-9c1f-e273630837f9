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
        'relative bg-background rounded-lg shadow-elevated overflow-hidden transition-all duration-300 w-full border border-border',
        className,
        viewport !== 'desktop' && 'border-4 border-muted rounded-[2rem]'
      )}
      style={{
        height: viewport === 'desktop' ? 'calc(100vh - 180px)' : 'calc(100vh - 200px)',
      }}
    >
      {/* Device notch for mobile */}
      {viewport === 'mobile' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-muted rounded-b-2xl z-10" />
      )}

      {/* Tablet camera for tablet */}
      {viewport === 'tablet' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-muted-foreground/30 rounded-full z-10" />
      )}

      <iframe
        src={previewUrl}
        className="w-full h-full border-0"
        title="Preview"
        style={{
          paddingTop: viewport === 'mobile' ? '24px' : viewport === 'tablet' ? '16px' : 0,
        }}
      />
    </div>
  );
}
