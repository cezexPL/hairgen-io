"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { StyleCatalog } from "@/components/shared/style-catalog";
import { GdprConsentDialog } from "@/components/shared/gdpr-consent-dialog";
import { GenerationProgress } from "@/components/shared/generation-progress";
import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { HairstyleItem } from "@/lib/catalog";
import { Sparkles, Download, RefreshCw, CreditCard } from "lucide-react";
import Link from "next/link";

type AppState = "upload" | "style" | "generating" | "result";

export default function TryPage() {
  const { user, isSignedIn } = useUser();
  const [appState, setAppState] = useState<AppState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HairstyleItem | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState("pending");
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [gdprOpen, setGdprOpen] = useState(false);
  const [gdprConsented, setGdprConsented] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch user credits
  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/user")
        .then((r) => r.json())
        .then((data) => {
          setCredits(data.creditsBalance ?? 0);
          setGdprConsented(data.gdprConsent ?? false);
        })
        .catch(() => {});
    }
  }, [isSignedIn]);

  // Poll generation status
  useEffect(() => {
    if (!generationId || generationStatus === "completed" || generationStatus === "failed") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/${generationId}`);
        const data = await res.json();
        setGenerationStatus(data.status);
        if (data.status === "completed" && data.resultImageUrl) {
          setResultImageUrl(data.resultImageUrl);
          setAppState("result");
        }
        if (data.status === "failed") {
          setError(data.errorMessage || "Generation failed. Please try again.");
          setAppState("style");
        }
      } catch {
        // Retry on next interval
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [generationId, generationStatus]);

  const handleFileSelected = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setFileDataUrl(reader.result as string);
    reader.readAsDataURL(f);

    // If not GDPR consented, show dialog
    if (!gdprConsented) {
      setGdprOpen(true);
    } else {
      setAppState("style");
    }
  }, [gdprConsented]);

  const handleGdprConsent = () => {
    setGdprConsented(true);
    setGdprOpen(false);
    setAppState("style");
  };

  const handleGdprDecline = () => {
    setGdprOpen(false);
    setFile(null);
    setFileDataUrl(null);
  };

  const handleGenerate = async () => {
    if (!file || (!selectedStyle && !customPrompt)) return;
    setError(null);

    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleId: selectedStyle?.id,
          prompt: customPrompt || undefined,
          sourceImageBase64: base64,
          gdprConsent: true,
          email: user?.emailAddresses[0]?.emailAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          setError("No credits remaining. Please purchase more credits.");
          return;
        }
        setError(data.error || "Something went wrong.");
        return;
      }

      setGenerationId(data.generationId);
      setGenerationStatus("pending");
      setCredits(data.creditsRemaining);
      setAppState("generating");
    } catch {
      setError("Network error. Please try again.");
    }
  };

  const handleReset = () => {
    setAppState("upload");
    setFile(null);
    setFileDataUrl(null);
    setSelectedStyle(null);
    setCustomPrompt("");
    setGenerationId(null);
    setGenerationStatus("pending");
    setResultImageUrl(null);
    setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Try Your New Hairstyle</h1>
        <p className="text-muted-foreground">
          Upload a photo, pick a style, and see your transformation
        </p>
        {credits !== null && (
          <Badge variant="outline" className="mt-3">
            <CreditCard className="h-3.5 w-3.5 mr-1" />
            {credits} credit{credits !== 1 ? "s" : ""} remaining
          </Badge>
        )}
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {["Upload", "Choose Style", "Generate", "Result"].map((step, i) => {
          const states: AppState[] = ["upload", "style", "generating", "result"];
          const isActive = states.indexOf(appState) >= i;
          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                {step}
              </span>
              {i < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-sm">
          {error}
          {error.includes("credits") && (
            <Link href="/pricing" className="block mt-2">
              <Button variant="outline" size="sm">
                Buy Credits <CreditCard className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Upload State */}
      {appState === "upload" && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Upload Your Photo</CardTitle>
          </CardHeader>
          <CardContent>
            {!isSignedIn ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">Sign in to try your new hairstyle</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/sign-in">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button>Create Account</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <PhotoUpload onFileSelected={handleFileSelected} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Style Selection State */}
      {appState === "style" && (
        <div className="space-y-6">
          {/* Preview of uploaded photo */}
          {fileDataUrl && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileDataUrl}
                    alt="Your photo"
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium">Your Photo</p>
                    <p className="text-sm text-muted-foreground">
                      {file?.name} · Ready for styling
                    </p>
                    <Button variant="ghost" size="sm" className="mt-1" onClick={handleReset}>
                      Change Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Choose Your Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <StyleCatalog
                selectedStyleId={selectedStyle?.id ?? null}
                onSelectStyle={setSelectedStyle}
              />

              {/* Custom prompt */}
              <div className="border-t pt-6">
                <label className="text-sm font-medium block mb-2">
                  Or describe your own style:
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => {
                    setCustomPrompt(e.target.value);
                    if (e.target.value) setSelectedStyle(null);
                  }}
                  placeholder="e.g., Long wavy auburn hair with side-swept bangs..."
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y"
                />
              </div>

              <Button
                size="lg"
                className="w-full gap-2"
                disabled={!selectedStyle && !customPrompt}
                onClick={handleGenerate}
              >
                <Sparkles className="h-5 w-5" />
                Generate Hairstyle
                {credits !== null && <span className="text-xs opacity-75">(1 credit)</span>}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generating State */}
      {appState === "generating" && (
        <Card>
          <CardContent className="py-16">
            <GenerationProgress status={generationStatus} />
          </CardContent>
        </Card>
      )}

      {/* Result State */}
      {appState === "result" && resultImageUrl && fileDataUrl && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Transformation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BeforeAfterSlider
                beforeSrc={fileDataUrl}
                afterSrc={resultImageUrl}
                className="aspect-[3/4] max-w-lg mx-auto"
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Another Style
            </Button>
            <a href={resultImageUrl} download="hairgen-result.webp">
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Download Result
              </Button>
            </a>
          </div>
        </div>
      )}

      <GdprConsentDialog
        open={gdprOpen}
        onConsent={handleGdprConsent}
        onDecline={handleGdprDecline}
      />
    </div>
  );
}
