import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Palette, Image, FileText, Sparkles, Loader2 } from 'lucide-react';

type ScanPhase = 'connecting' | 'extracting' | 'processing';

interface ScanningProgressProps {
  phase: ScanPhase;
  url: string;
  scrapedData: any;
  processedSchema: any;
}

const ExtractionItem = ({ 
  icon: Icon, 
  label, 
  value, 
  isComplete, 
  delay = 0 
}: { 
  icon: any; 
  label: string; 
  value: string | number | null; 
  isComplete: boolean;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-center gap-3 py-2"
  >
    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
      isComplete ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
    }`}>
      {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium">{label}</div>
      {value && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground truncate max-w-[200px]"
        >
          {value}
        </motion.div>
      )}
    </div>
    {isComplete && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Check className="w-4 h-4 text-green-500" />
      </motion.div>
    )}
  </motion.div>
);

const ColorSwatch = ({ color, delay }: { color: string; delay: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: "spring", stiffness: 500, damping: 30 }}
    className="w-6 h-6 rounded-full border-2 border-background shadow-md"
    style={{ backgroundColor: color }}
    title={color}
  />
);

const ProcessingStep = ({ 
  label, 
  isActive, 
  isComplete,
  delay = 0 
}: { 
  label: string; 
  isActive: boolean; 
  isComplete: boolean;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex items-center gap-3 py-1.5"
  >
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
      isComplete ? 'bg-green-500/20 text-green-500' : 
      isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
    }`}>
      {isComplete ? (
        <Check className="w-3 h-3" />
      ) : isActive ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
    </div>
    <span className={`text-sm ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
      {label}
    </span>
  </motion.div>
);

export function ScanningProgress({ phase, url, scrapedData, processedSchema }: ScanningProgressProps) {
  // Extract data for display
  const logo = scrapedData?.branding?.logo || scrapedData?.branding?.images?.logo;
  const colors = scrapedData?.branding?.colors || {};
  const colorArray = [colors.primary, colors.secondary, colors.accent, colors.background].filter(Boolean);
  const imageCount = scrapedData?.branding?.images ? Object.keys(scrapedData.branding.images).length : 0;
  const companyName = processedSchema?.companyName || '';
  
  // Processing steps
  const processingSteps = [
    { id: 'hero', label: 'Creating Hero Section...' },
    { id: 'services', label: 'Organizing Services...' },
    { id: 'gallery', label: 'Building Gallery...' },
    { id: 'contact', label: 'Setting up Contact...' },
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-8">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-primary rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Phase 1: Connecting */}
        <AnimatePresence mode="wait">
          {phase === 'connecting' && (
            <motion.div
              key="connecting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              {/* Radar animation */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                />
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                />
                <motion.div
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-full">
                  <Globe className="w-10 h-10 text-primary" />
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-2">Connecting to Website</h3>
              
              {/* Typewriter URL effect */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
                className="overflow-hidden mx-auto max-w-sm"
              >
                <p className="text-sm text-muted-foreground font-mono truncate">
                  {url}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Phase 2: Extracting */}
          {phase === 'extracting' && (
            <motion.div
              key="extracting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold">Extracting Content</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column: Extraction items */}
                <div className="space-y-1">
                  <ExtractionItem
                    icon={Globe}
                    label="Website Connected"
                    value={new URL(url).hostname}
                    isComplete={true}
                    delay={0}
                  />
                  <ExtractionItem
                    icon={Image}
                    label="Logo Found"
                    value={logo ? "✓ Detected" : "Searching..."}
                    isComplete={!!logo}
                    delay={0.2}
                  />
                  <ExtractionItem
                    icon={Palette}
                    label="Brand Colors"
                    value={colorArray.length > 0 ? `${colorArray.length} colors found` : "Analyzing..."}
                    isComplete={colorArray.length > 0}
                    delay={0.4}
                  />
                  <ExtractionItem
                    icon={Image}
                    label="Images"
                    value={imageCount > 0 ? `${imageCount} images found` : "Scanning..."}
                    isComplete={imageCount > 0}
                    delay={0.6}
                  />
                  <ExtractionItem
                    icon={FileText}
                    label="Content"
                    value={scrapedData?.markdown ? "Text extracted" : "Reading..."}
                    isComplete={!!scrapedData?.markdown}
                    delay={0.8}
                  />
                </div>

                {/* Right column: Visual previews */}
                <div className="space-y-4">
                  {/* Logo preview */}
                  {logo && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-muted/50 rounded-lg"
                    >
                      <p className="text-xs text-muted-foreground mb-2">Logo Found</p>
                      <div className="bg-white/10 rounded p-2 inline-block">
                        <img 
                          src={logo} 
                          alt="Extracted logo" 
                          className="h-12 object-contain max-w-[150px]"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Color swatches */}
                  {colorArray.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="p-4 bg-muted/50 rounded-lg"
                    >
                      <p className="text-xs text-muted-foreground mb-2">Brand Colors</p>
                      <div className="flex gap-2">
                        {colorArray.map((color, i) => (
                          <ColorSwatch key={color} color={color} delay={0.6 + i * 0.1} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 3: Processing */}
          {phase === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="flex items-center gap-2 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold">AI Processing Content</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Left: Processing steps */}
                <div className="space-y-1">
                  {processingSteps.map((step, index) => (
                    <ProcessingStep
                      key={step.id}
                      label={step.label}
                      isActive={index === Math.floor(Date.now() / 2000) % processingSteps.length}
                      isComplete={processedSchema && index < Math.floor(Date.now() / 2000) % processingSteps.length}
                      delay={index * 0.1}
                    />
                  ))}
                </div>

                {/* Right: Preview of what's being created */}
                <div className="space-y-4">
                  {companyName && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 bg-muted/50 rounded-lg"
                    >
                      <p className="text-xs text-muted-foreground mb-1">Company</p>
                      <p className="font-semibold">{companyName}</p>
                    </motion.div>
                  )}

                  {/* Animated skeleton of sections being built */}
                  <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">Building Sections</p>
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="h-8 bg-muted rounded"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      className="h-4 bg-muted rounded w-3/4"
                    />
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      className="h-4 bg-muted rounded w-1/2"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
