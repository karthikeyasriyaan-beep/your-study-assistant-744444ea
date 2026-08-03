import { useEffect, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SEEN_KEY = "cbse:feedback:seen:v1";
const STORE_KEY = "cbse:feedback:entries:v1";
const DELAY_MS = 30_000;

type Entry = { site: string; note: string; at: string };

function readEntries(): Entry[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "[]") as Entry[];
  } catch {
    return [];
  }
}

export function CbseFeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [site, setSite] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SEEN_KEY)) return;
    const id = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  const close = (remember: boolean) => {
    if (remember) localStorage.setItem(SEEN_KEY, new Date().toISOString());
    setOpen(false);
  };

  const submit = () => {
    if (!site.trim() && !note.trim()) {
      toast.error("Add a website or a short note first");
      return;
    }
    const entries = readEntries();
    entries.push({ site: site.trim(), note: note.trim(), at: new Date().toISOString() });
    localStorage.setItem(STORE_KEY, JSON.stringify(entries));
    toast.success("Thanks! Your suggestion was recorded.");
    setSite("");
    setNote("");
    close(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close(true))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-primary" />
            Can't find what you need?
          </DialogTitle>
          <DialogDescription>
            We link CBSE books straight from NCERT. If you know a better site for
            CBSE textbooks, notes or solutions — let us know and we'll add it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="cbse-site" className="text-xs">
              Website you use
            </Label>
            <Input
              id="cbse-site"
              placeholder="e.g. ncert.nic.in, epathshala.nic.in"
              value={site}
              onChange={(e) => setSite(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cbse-note" className="text-xs">
              What's missing or hard to find?
            </Label>
            <Textarea
              id="cbse-note"
              rows={3}
              placeholder="Tell us which book, class or subject you were looking for…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => close(true)}>
            Not now
          </Button>
          <Button onClick={submit}>Send feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}