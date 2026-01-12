import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getUser, getGroups, addSharedExpense } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AddSharedExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const group = useMemo(() => getGroups().find((g) => g.id === id), [id]);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidBy, setPaidBy] = useState<string>(group?.members[0] || "");
  const [participants, setParticipants] = useState<string[]>(group?.members || []);
  const [splitType, setSplitType] = useState<"equal" | "percent" | "exact">("equal");
  const [shareInputs, setShareInputs] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    (group?.members || []).forEach((m) => (initial[m] = ""));
    return initial;
  });

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Keep per-participant inputs in sync with selection
  useEffect(() => {
    setShareInputs((prev) => {
      const next: Record<string, string> = {};
      participants.forEach((p) => {
        next[p] = prev[p] ?? "";
      });
      return next;
    });
  }, [participants]);

  if (!group) return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 py-8">Group not found</div></div>;

  const toggleParticipant = (m: string) => {
    setParticipants((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const parseNumber = (value: string) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const computeShares = () => {
    if (!amount || participants.length === 0) return {} as Record<string, number>;

    if (splitType === "equal") {
      const share = amount / participants.length;
      return participants.reduce<Record<string, number>>((acc, p) => {
        acc[p] = share;
        return acc;
      }, {});
    }

    if (splitType === "percent") {
      const totalPercent = participants.reduce((sum, p) => sum + parseNumber(shareInputs[p] || "0"), 0);
      if (totalPercent <= 0) return {};
      return participants.reduce<Record<string, number>>((acc, p) => {
        const perc = parseNumber(shareInputs[p] || "0");
        acc[p] = (amount * perc) / totalPercent;
        return acc;
      }, {});
    }

    // exact
    return participants.reduce<Record<string, number>>((acc, p) => {
      acc[p] = parseNumber(shareInputs[p] || "0");
      return acc;
    }, {});
  };

  const previewShares = computeShares();
  const previewTotal = Object.values(previewShares).reduce((sum, v) => sum + v, 0);

  const submit = () => {
    if (!amount || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!paidBy) {
      toast.error("Select who paid");
      return;
    }
    if (participants.length === 0) {
      toast.error("Select at least one participant");
      return;
    }

    const shares = computeShares();

    if (splitType === "percent") {
      const totalPercent = participants.reduce((sum, p) => sum + parseNumber(shareInputs[p] || "0"), 0);
      if (Math.abs(totalPercent - 100) > 0.01) {
        toast.error("Percentages must add up to 100%");
        return;
      }
    }

    if (splitType === "exact") {
      const totalExact = participants.reduce((sum, p) => sum + parseNumber(shareInputs[p] || "0"), 0);
      if (Math.abs(totalExact - amount) > Math.max(1, participants.length) * 0.01) {
        toast.error("Exact amounts must add up to the total");
        return;
      }
    }

    addSharedExpense({
      groupId: group.id,
      amount,
      description: description || "Shared expense",
      paidBy,
      participants,
      date,
      shares,
      splitType,
    });
    navigate(`/groups/${group.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Add Shared Expense</h1>
        <div className="rounded-2xl p-6 shadow-md border border-border bg-card max-w-xl">
          <label className="block text-sm mb-1">Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border border-input px-3 py-2 mb-3 bg-background" placeholder="Dinner" />

          <label className="block text-sm mb-1">Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full rounded-md border border-input px-3 py-2 mb-3 bg-background" placeholder="0" />

          <label className="block text-sm mb-1">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-md border border-input px-3 py-2 mb-3 bg-background" />

          <label className="block text-sm mb-1">Paid by</label>
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} className="w-full rounded-md border border-input px-3 py-2 mb-4 bg-background">
            {group.members.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <div className="mb-4">
            <div className="block text-sm mb-2">Participants</div>
            <div className="flex flex-wrap gap-2">
              {group.members.map((m) => (
                <label key={m} className={`px-3 py-1.5 rounded-full border ${participants.includes(m) ? 'bg-[hsl(var(--primary))] text-white border-transparent' : 'bg-background border-border'}`}>
                  <input type="checkbox" className="hidden" checked={participants.includes(m)} onChange={() => toggleParticipant(m)} />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm mb-2">Split type</div>
            <div className="inline-flex rounded-lg border border-border overflow-hidden">
              {(["equal", "percent", "exact"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSplitType(type)}
                  className={`px-3 py-1.5 text-sm capitalize ${splitType === type ? "bg-[hsl(var(--primary))] text-white" : "bg-background text-foreground hover:bg-[hsl(var(--secondary))]"}`}
                  type="button"
                >
                  {type === "equal" ? "Equal" : type === "percent" ? "Percentage" : "Exact amounts"}
                </button>
              ))}
            </div>
          </div>

          {splitType === "percent" && (
            <div className="space-y-2 mb-4">
              <div className="text-sm text-muted-foreground">Enter percentage for each participant (must total 100%)</div>
              {participants.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <div className="w-32 text-sm">{p}</div>
                  <input
                    type="number"
                    min="0"
                    value={shareInputs[p] ?? ""}
                    onChange={(e) => setShareInputs((prev) => ({ ...prev, [p]: e.target.value }))}
                    className="flex-1 rounded-md border border-input px-3 py-2 bg-background"
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              ))}
            </div>
          )}

          {splitType === "exact" && (
            <div className="space-y-2 mb-4">
              <div className="text-sm text-muted-foreground">Enter exact amount per participant (must total the expense)</div>
              {participants.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <div className="w-32 text-sm">{p}</div>
                  <input
                    type="number"
                    min="0"
                    value={shareInputs[p] ?? ""}
                    onChange={(e) => setShareInputs((prev) => ({ ...prev, [p]: e.target.value }))}
                    className="flex-1 rounded-md border border-input px-3 py-2 bg-background"
                    placeholder="0"
                  />
                  <span className="text-sm text-muted-foreground">₹</span>
                </div>
              ))}
            </div>
          )}

          {splitType === "equal" && (
            <div className="mb-4 text-sm text-muted-foreground">
              Everyone splits equally. Each owes ₹{participants.length ? (amount / participants.length).toFixed(2) : "0"}.
            </div>
          )}

          <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-sm font-medium mb-2">Who owes whom (preview)</div>
            <div className="text-xs text-muted-foreground mb-2">Paid by {paidBy || "—"} · Total {previewTotal ? `₹${previewTotal.toFixed(2)}` : "—"}</div>
            <div className="space-y-1 text-sm">
              {participants.length === 0 ? (
                <div className="text-muted-foreground">Select participants to see the split.</div>
              ) : (
                participants.map((p) => {
                  const share = previewShares[p] ?? 0;
                  const label = paidBy === p ? "already paid their part" : `owes ₹${share.toFixed(2)} to ${paidBy || "payer"}`;
                  return (
                    <div key={p} className="flex items-center justify-between">
                      <span>{p}</span>
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button onClick={() => navigate(-1)} variant="outline" type="button">Cancel</Button>
            <Button onClick={submit} type="button">Add expense</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSharedExpense;













