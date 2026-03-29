"use client";

import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

const PHASES = [
  { key: "analyzing", label: "Analyzing your photo...", progress: 25 },
  { key: "styling", label: "Preparing the style...", progress: 50 },
  { key: "generating", label: "Generating your hairstyle...", progress: 75 },
  { key: "finishing", label: "Finishing touches...", progress: 90 },
  { key: "completed", label: "Done!", progress: 100 },
] as const;

interface GenerationProgressProps {
  status: string;
}

export function GenerationProgress({ status }: GenerationProgressProps) {
  const phase = PHASES.find((p) => p.key === status) || PHASES[0];
  const isComplete = status === "completed";

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="flex items-center justify-center gap-2">
        {!isComplete && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        <span className="text-lg font-medium">{phase.label}</span>
      </div>
      <Progress value={phase.progress} className="h-3" />
      <div className="flex justify-between text-xs text-muted-foreground">
        {PHASES.slice(0, 4).map((p, i) => (
          <span
            key={p.key}
            className={
              PHASES.indexOf(phase) >= i ? "text-primary font-medium" : ""
            }
          >
            {i + 1}. {p.key.charAt(0).toUpperCase() + p.key.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
