import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ChevronDown, ChevronUp, Loader2, Lightbulb } from 'lucide-react';
import { usePitchScore, type PitchScore } from '@/hooks/usePitchScore';
import { cn } from '@/lib/utils';

interface PitchScoreCardProps {
  previewId: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

function getProgressColor(score: number) {
  if (score >= 80) return '[&>div]:bg-green-500';
  if (score >= 60) return '[&>div]:bg-yellow-500';
  return '[&>div]:bg-red-500';
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Weak';
}

function ScoreBreakdown({ score }: { score: PitchScore }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Overall */}
      <div className="flex items-center gap-4">
        <div className={cn('text-4xl font-bold tabular-nums', getScoreColor(score.overall_score))}>
          {score.overall_score}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-foreground">{getScoreLabel(score.overall_score)}</span>
            <span className="text-xs text-muted-foreground">/100</span>
          </div>
          <Progress value={score.overall_score} className={cn('h-2', getProgressColor(score.overall_score))} />
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">{score.summary}</p>

      {/* Top improvement */}
      <div className="flex gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-foreground">{score.top_improvement}</p>
      </div>

      {/* Dimensions toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between text-muted-foreground"
        onClick={() => setExpanded(!expanded)}
      >
        Score breakdown
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {expanded && (
        <div className="space-y-4">
          {score.dimensions.map((dim) => (
            <div key={dim.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{dim.name}</span>
                <span className={cn('text-sm font-semibold tabular-nums', getScoreColor(dim.score))}>
                  {dim.score}
                </span>
              </div>
              <Progress value={dim.score} className={cn('h-1.5', getProgressColor(dim.score))} />
              <ul className="space-y-1">
                {dim.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PitchScoreCard({ previewId }: PitchScoreCardProps) {
  const { score, isLoading, scorePitch } = usePitchScore();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Pitch Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        {score ? (
          <ScoreBreakdown score={score} />
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-3">
              Get AI-powered feedback on completeness, personalization & persuasion.
            </p>
            <Button
              onClick={() => scorePitch(previewId)}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Score this Pitch
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
