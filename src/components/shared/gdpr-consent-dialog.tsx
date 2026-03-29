"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Trash2, Lock } from "lucide-react";

interface GdprConsentDialogProps {
  open: boolean;
  onConsent: () => void;
  onDecline: () => void;
}

export function GdprConsentDialog({ open, onConsent, onDecline }: GdprConsentDialogProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onDecline()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Privacy & Data Consent
          </DialogTitle>
          <DialogDescription>
            Before uploading your photo, please review our data practices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Biometric Data Processing</p>
              <p className="text-muted-foreground mt-1">
                Your photo will be processed by AI to generate hairstyle previews.
                This involves facial feature analysis which may constitute biometric data
                processing under GDPR and similar regulations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Trash2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Automatic Deletion</p>
              <p className="text-muted-foreground mt-1">
                Your uploaded photos are automatically deleted within 24 hours.
                Generated results are stored in your account until you delete them
                or request full data deletion.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="text-sm">
              <p className="font-medium">I consent to the processing of my photo</p>
              <p className="text-muted-foreground mt-1">
                I understand that my facial image will be analyzed by AI for hairstyle generation.
              </p>
            </div>
            <Switch checked={accepted} onCheckedChange={setAccepted} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDecline}>
            Cancel
          </Button>
          <Button onClick={onConsent} disabled={!accepted}>
            Continue & Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
