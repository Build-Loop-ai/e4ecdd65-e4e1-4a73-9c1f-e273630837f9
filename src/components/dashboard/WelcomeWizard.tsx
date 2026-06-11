import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  User,
  Mail,
  FileText,
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
} from 'lucide-react';

interface WelcomeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
}

const STEPS = [
  {
    key: 'welcome',
    icon: Sparkles,
    title: 'Welcome to Pitch!',
    description: 'You\'re all set up and ready to start winning clients. Let us show you around.',
    tips: [
      'Create AI-powered proposals in minutes',
      'Track when prospects view your pitches',
      'Send professional outreach emails',
      'Monitor your email deliverability',
    ],
  },
  {
    key: 'profile',
    icon: User,
    title: 'Complete Your Profile',
    description: 'Add your business details so your pitches look professional and on-brand.',
    tips: [
      'Add your business name and tagline',
      'Upload your logo for branded pitches',
      'Add social links for credibility',
    ],
    action: { label: 'Go to Settings', route: '/dashboard/settings' },
  },
  {
    key: 'email',
    icon: Mail,
    title: 'Connect Your Email',
    description: 'Link your email account to send pitches directly and track opens.',
    tips: [
      'Connect Gmail or Outlook in one click',
      'Enable email warmup for better deliverability',
      'Track when prospects open your emails',
    ],
    action: { label: 'Go to Settings', route: '/dashboard/settings' },
  },
  {
    key: 'pitch',
    icon: FileText,
    title: 'Create Your First Pitch',
    description: 'Enter any website URL and we\'ll generate a stunning proposal automatically.',
    tips: [
      'Paste a prospect\'s website URL',
      'AI extracts content, colors, and branding',
      'Choose from premium templates',
      'Share via link or send directly',
    ],
    action: { label: 'Create a Pitch', route: '/dashboard/new' },
  },
];

export function WelcomeWizard({ open, onOpenChange, userName }: WelcomeWizardProps) {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const handleAction = () => {
    if (current.action) {
      onOpenChange(false);
      navigate(current.action.route);
    }
  };

  const handleFinish = () => {
    onOpenChange(false);
    navigate('/dashboard/new');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0">
        {/* Progress bar */}
        <div className="flex gap-1 px-6 pt-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="px-6 pt-6 pb-6"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <current.icon className="h-6 w-6 text-primary" />
            </div>

            {/* Title */}
            <DialogTitle className="text-xl font-bold text-foreground mb-1">
              {isFirst && userName
                ? `Welcome to Pitch, ${userName.split(' ')[0]}!`
                : current.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mb-5">
              {current.description}
            </DialogDescription>

            {/* Tips */}
            <ul className="space-y-2.5 mb-6">
              {current.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground">{tip}</span>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <div>
                {!isFirst && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(step - 1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {current.action && (
                  <Button variant="outline" size="sm" onClick={handleAction}>
                    {current.action.label}
                  </Button>
                )}

                {isLast ? (
                  <Button size="sm" onClick={handleFinish}>
                    <Rocket className="h-4 w-4 mr-1" />
                    Let's Go!
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setStep(step + 1)}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>

            {/* Skip */}
            {!isLast && (
              <div className="text-center mt-4">
                <button
                  onClick={() => onOpenChange(false)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
