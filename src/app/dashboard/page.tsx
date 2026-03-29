"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BeforeAfterSlider } from "@/components/shared/before-after-slider";
import {
  CreditCard,
  Sparkles,
  Clock,
  Image as ImageIcon,
  Download,
  Trash2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Generation {
  id: string;
  status: string;
  styleId: string | null;
  prompt: string | null;
  sourceImageUrl: string;
  resultImageUrl: string | null;
  hasWatermark: boolean;
  processingTimeMs: number | null;
  createdAt: string;
}

interface UserData {
  creditsBalance: number;
  subscriptionTier: string;
  email: string;
  name: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { isSignedIn } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/user")
      .then((r) => r.json())
      .then(setUserData)
      .catch(() => {});

    fetch("/api/user/generations")
      .then((r) => r.json())
      .then((data) => setGenerations(data.generations || []))
      .catch(() => {});
  }, [isSignedIn]);

  const handleDeleteData = async () => {
    setDeleting(true);
    try {
      await fetch("/api/user/delete-data", { method: "DELETE" });
      setDeleteDialogOpen(false);
      setGenerations([]);
      setUserData(null);
    } catch {
      // ignore
    }
    setDeleting(false);
  };

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in to view your dashboard</h1>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your generations and account</p>
        </div>
        <Link href="/try">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            New Generation
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userData?.creditsBalance ?? "—"}</p>
                <p className="text-sm text-muted-foreground">Credits Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <ImageIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{generations.length}</p>
                <p className="text-sm text-muted-foreground">Total Generations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{userData?.subscriptionTier ?? "free"}</p>
                <p className="text-sm text-muted-foreground">Current Plan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generations Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Your Generations</CardTitle>
        </CardHeader>
        <CardContent>
          {generations.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No generations yet</p>
              <p className="text-muted-foreground mb-6">Create your first hairstyle transformation</p>
              <Link href="/try">
                <Button className="gap-2">
                  Try It Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {generations.map((gen) => (
                <button
                  key={gen.id}
                  onClick={() => setSelectedGen(gen)}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden border hover:border-primary transition-colors"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    {gen.status === "completed" ? (
                      <Sparkles className="h-8 w-8 text-primary" />
                    ) : (
                      <Clock className="h-8 w-8 text-muted-foreground animate-pulse" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <Badge variant={gen.status === "completed" ? "default" : "secondary"} className="text-xs">
                      {gen.status}
                    </Badge>
                    <p className="text-xs text-white mt-1 truncate">
                      {gen.prompt || gen.styleId || "Custom style"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Detail Dialog */}
      {selectedGen && (
        <Dialog open={!!selectedGen} onOpenChange={() => setSelectedGen(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Generation Details</DialogTitle>
              <DialogDescription>
                {selectedGen.prompt || selectedGen.styleId || "Custom style"} · {new Date(selectedGen.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedGen.status === "completed" && selectedGen.resultImageUrl ? (
                <BeforeAfterSlider
                  beforeSrc={selectedGen.sourceImageUrl}
                  afterSrc={selectedGen.resultImageUrl}
                  className="aspect-[3/4]"
                />
              ) : (
                <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {selectedGen.status === "failed" ? "Generation failed" : "Processing..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              {selectedGen.resultImageUrl && (
                <a href={selectedGen.resultImageUrl} download>
                  <Button size="sm" className="gap-1">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </a>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Data Management */}
      <Card className="mt-8 border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            In accordance with GDPR, you can request full deletion of all your data
            including uploaded photos, generated images, and account information.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete All My Data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Data</DialogTitle>
            <DialogDescription>
              This will permanently delete your account, all generations, and uploaded photos.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteData} disabled={deleting}>
              {deleting ? "Deleting..." : "Yes, Delete Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Crown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
      <path d="M5.21 16.5h13.58" />
    </svg>
  );
}
