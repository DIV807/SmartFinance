import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getUser, getGroups, addGroup, computeGroupBalances, deleteGroup } from "@/lib/storage";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(() => getGroups());
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [membersText, setMembersText] = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setGroups(getGroups());
  }, [navigate]);

  const create = () => {
    const members = membersText.split(",").map((m) => m.trim()).filter(Boolean);
    if (!name.trim() || members.length < 2) return;
    const g = addGroup(name.trim(), members);
    setGroups(getGroups());
    setOpen(false);
    setName("");
    setMembersText("");
    navigate(`/groups/${g.id}`);
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    try {
      deleteGroup(groupId);
      setGroups(getGroups());
      toast.success(`Group "${groupName}" deleted successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete group");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Groups</h1>
          <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-white">Add Group</button>
        </div>

        {groups.length === 0 ? (
          <p className="text-muted-foreground">No groups yet. Create your first group.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groups.map((g) => {
              const balances = computeGroupBalances(g.id);
              const summary = summarizeBalances(balances);
              return (
                <div key={g.id} className="relative rounded-xl border border-border bg-card p-5 hover:shadow-md transition">
                  <button
                    onClick={() => navigate(`/groups/${g.id}`)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between pr-8">
                      <div>
                        <div className="font-semibold">{g.name}</div>
                        <div className="text-sm text-muted-foreground">{g.members.join(", ")}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{summary}</div>
                    </div>
                  </button>
                  <div className="absolute top-4 right-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the group
                            "{g.name}" and all associated expenses.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteGroup(g.id, g.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {open && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md rounded-xl bg-card border border-border p-6">
              <h2 className="text-lg font-semibold mb-4">Create Group</h2>
              <label className="block text-sm mb-1">Group name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-input px-3 py-2 mb-3 bg-background" placeholder="Trip to Goa" />
              <label className="block text-sm mb-1">Members (comma separated)</label>
              <input value={membersText} onChange={(e) => setMembersText(e.target.value)} className="w-full rounded-md border border-input px-3 py-2 mb-4 bg-background" placeholder="Rahul, Aditi, You" />
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-md border border-border">Cancel</button>
                <button onClick={create} className="px-3 py-2 rounded-md bg-[hsl(var(--primary))] text-white">Create</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function summarizeBalances(balances: Record<string, number>) {
  const entries = Object.entries(balances);
  if (entries.length === 0) return "No balances yet";
  const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
  const min = entries.reduce((a, b) => (a[1] < b[1] ? a : b));
  if (Math.abs(max[1]) < 1 && Math.abs(min[1]) < 1) return "All settled";
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.abs(Math.round(n)));
  return max[1] > 0 ? `${min[0]} owes ${max[0]} ${fmt(min[1])}` : `${max[0]} owes ${min[0]} ${fmt(max[1])}`;
}

export default Groups;













