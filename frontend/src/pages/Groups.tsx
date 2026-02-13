import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getUser, getGroupsForCurrentUser, addGroup, computeGroupBalances, deleteGroup, getMemberDisplay, getMemberDisplayByKey, type GroupMember } from "@/lib/storage";
import { Trash2, Plus, X } from "lucide-react";
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

const emptyMember = (): GroupMember => ({ name: "", email: "" });

const Groups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(() =>
    getGroupsForCurrentUser().map((x) => x.group)
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [members, setMembers] = useState<GroupMember[]>(() => [emptyMember(), emptyMember()]);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setGroups(getGroupsForCurrentUser().map((x) => x.group));
  }, [navigate]);

  const addMember = () => setMembers((prev) => [...prev, emptyMember()]);
  const removeMember = (i: number) => {
    if (members.length <= 2) return;
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateMember = (i: number, field: "name" | "email", value: string) => {
    setMembers((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m))
    );
  };

  const create = () => {
    const valid = members.filter((m) => m.name.trim());
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (valid.length < 1) {
      toast.error("Add at least one member with a name");
      return;
    }
    const user = getUser();
    const allMembers: GroupMember[] = [];
    if (user?.name?.trim()) {
      allMembers.push({ name: user.name, email: user.email });
    }
    valid.forEach((m) => {
      const key = m.email?.trim() || m.name;
      if (!allMembers.some((x) => (x.email?.trim() || x.name) === key)) {
        allMembers.push(m);
      }
    });
    if (allMembers.length < 2) {
      toast.error("Add at least 2 members (enter names in the member fields)");
      return;
    }
    try {
      const g = addGroup(name.trim(), allMembers);
      setGroups(getGroupsForCurrentUser().map((x) => x.group));
      setOpen(false);
      setName("");
      setMembers([emptyMember(), emptyMember()]);
      toast.success("Group created!");
      navigate(`/groups/${g.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create group");
    }
  };

  const handleDeleteGroup = (groupId: string, groupName: string) => {
    try {
      deleteGroup(groupId);
      setGroups(getGroupsForCurrentUser().map((x) => x.group));
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
              const summary = summarizeBalances(g, balances);
              return (
                <div key={g.id} className="relative rounded-xl border border-border bg-card p-5 hover:shadow-md transition">
                  <button
                    onClick={() => navigate(`/groups/${g.id}`)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between pr-8">
                      <div>
                        <div className="font-semibold">{g.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {g.members.map(getMemberDisplay).join(", ")}
                        </div>
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
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 mb-4 bg-background"
                placeholder="Trip to Goa"
              />
              <label className="block text-sm mb-2">Members</label>
              <ul className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {members.map((m, i) => (
                  <li key={i} className="flex items-center gap-2 list-disc list-inside">
                    <div className="flex-1 flex gap-2 flex-wrap">
                      <input
                        value={m.name}
                        onChange={(e) => updateMember(i, "name", e.target.value)}
                        className="flex-1 min-w-[100px] rounded-md border border-input px-3 py-2 bg-background text-sm"
                        placeholder="Name"
                      />
                      <input
                        value={m.email || ""}
                        onChange={(e) => updateMember(i, "email", e.target.value)}
                        className="flex-1 min-w-[100px] rounded-md border border-input px-3 py-2 bg-background text-sm"
                        placeholder="Email (optional, links if they have account)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(i)}
                      disabled={members.length <= 2}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Remove member"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={addMember}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-border text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground mb-4"
              >
                <Plus className="h-4 w-4" />
                Add member
              </button>
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setOpen(false)} className="px-3 py-2 rounded-md border border-border">
                  Cancel
                </button>
                <button type="button" onClick={create} className="px-3 py-2 rounded-md bg-[hsl(var(--primary))] text-white">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function summarizeBalances(group: { members: (string | GroupMember)[] }, balances: Record<string, number>) {
  const entries = Object.entries(balances);
  if (entries.length === 0) return "No balances yet";
  const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b));
  const min = entries.reduce((a, b) => (a[1] < b[1] ? a : b));
  if (Math.abs(max[1]) < 1 && Math.abs(min[1]) < 1) return "All settled";
  const fmt = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.abs(Math.round(n)));
  const maxDisplay = getMemberDisplayByKey(group, max[0]);
  const minDisplay = getMemberDisplayByKey(group, min[0]);
  return max[1] > 0 ? `${minDisplay} owes ${maxDisplay} ${fmt(min[1])}` : `${maxDisplay} owes ${minDisplay} ${fmt(max[1])}`;
}

export default Groups;













