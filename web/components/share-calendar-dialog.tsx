"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, Link2, TrashIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CalendarShare {
  id: string;
  user_id: string;
  share_code: string;
  name: string;
  expires_at: string | null;
  created_at: string;
  active: boolean;
}

interface ShareCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareCalendarDialog({
  open,
  onOpenChange,
}: ShareCalendarDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareName, setShareName] = useState("My Calendar");
  const [expiration, setExpiration] = useState<string | null>("7");
  const [shares, setShares] = useState<CalendarShare[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [creatingShare, setCreatingShare] = useState(false);

  const fetchShares = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/calendar-share");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch shares");
      }
      
      setShares(data.shares || []);
    } catch (err) {
      console.error("Error fetching shares:", err);
      setError("Failed to load existing shares");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchShares();
    }
  }, [open]);

  const handleCreateShare = async () => {
    try {
      setCreatingShare(true);
      setError(null);
      
      const response = await fetch("/api/calendar-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: shareName,
          expiration_days: expiration,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create share");
      }
      
      // Refresh shares list
      fetchShares();
      
      // Reset form
      setShareName("My Calendar");
      setExpiration("7");
    } catch (err) {
      console.error("Error creating share:", err);
      setError("Failed to create calendar share");
    } finally {
      setCreatingShare(false);
    }
  };

  const handleDeleteShare = async (shareId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/calendar-share?id=${shareId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete share");
      }
      
      // Refresh shares list
      fetchShares();
    } catch (err) {
      console.error("Error deleting share:", err);
      setError("Failed to delete calendar share");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = (shareCode: string) => {
    const url = `${window.location.origin}/calendar/${shareCode}`;
    navigator.clipboard.writeText(url);
    setCopied(shareCode);
    setTimeout(() => {
      setCopied(null);
    }, 2000); // Reset copied state after 2 seconds
  };

  const formatExpiration = (expiresAt: string | null) => {
    if (!expiresAt) return "Never expires";
    
    const expDate = new Date(expiresAt);
    const now = new Date();
    
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share Calendar</DialogTitle>
          <DialogDescription>
            Create a link that lets others view your calendar events
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="shareName">Share Name</Label>
              <Input
                id="shareName"
                value={shareName}
                onChange={(e) => setShareName(e.target.value)}
                placeholder="My Calendar"
                className="mt-1"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="expiration">Expires In</Label>
              <Select
                value={expiration || "never"}
                onValueChange={(value) => setExpiration(value === "never" ? null : value)}
              >
                <SelectTrigger id="expiration" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-2">
            <Button
              onClick={handleCreateShare}
              disabled={!shareName.trim() || creatingShare}
              className="w-full"
            >
              {creatingShare ? "Creating..." : "Create Share Link"}
            </Button>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Active Share Links</h3>
            <div className="space-y-3 max-h-[200px] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : shares.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active share links. Create one above.
                </p>
              ) : (
                shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="overflow-hidden">
                      <h4 className="font-medium text-sm truncate">
                        {share.name || "My Calendar"}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Link2 className="h-3 w-3" />
                        <span className="truncate">{share.share_code}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatExpiration(share.expires_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(share.share_code)}
                        className="h-8 px-2"
                      >
                        {copied === share.share_code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteShare(share.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}