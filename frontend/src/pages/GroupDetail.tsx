import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  getUser,
  getGroupsForCurrentUser,
  getGroupExpenses,
  computeGroupBalances,
  deleteSharedExpense,
  computeSettlements,
  addSettlement,
  getMemberDisplay,
  getMemberKey,
  getMemberDisplayByKey,
} from "@/lib/storage";
import { Trash2, CheckCircle } from "lucide-react";
import { toast } from "sonner";


const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  // 🔥 forces re-render after delete
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setReady(true);
  }, [navigate]);

  const group = useMemo(() => {
    if (!id) return undefined;
    const items = getGroupsForCurrentUser();
    return items.find(({ group }) => group.id === id)?.group;
  }, [id, refreshKey]);

  const expenses = useMemo(
    () => getGroupExpenses().filter((e) => e.groupId === id),
    [id, refreshKey]
  );

  const balances = useMemo(
    () => (id ? computeGroupBalances(id) : {}),
    [id, refreshKey]
  );

  const settlements = useMemo(
    () => (id ? computeSettlements(id) : []),
    [id, refreshKey]
  );

  const handleDeleteExpense = (expenseId: string) => {
    try {
      deleteSharedExpense(expenseId);
      toast.success("Expense deleted");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Could not delete expense");
    }
  };

  const handleMarkResolved = (from: string, to: string, amount: number) => {
    try {
      addSettlement({ groupId: id!, from, to, amount });
      toast.success("Marked as paid");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Could not mark as resolved");
    }
  };


  if (!ready) return null;

  if (!group)
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          Group not found
        </div>
      </div>
    );

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Math.abs(Math.round(n)));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{group.name}</h1>
            <p className="text-sm text-muted-foreground">
              {group.members.map(getMemberDisplay).join(", ")}
            </p>
          </div>
          <Link
            to={`/groups/${group.id}/add-expense`}
            className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-white"
          >
            Add expense
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Balances */}
          <div className="rounded-2xl p-6 shadow-md border border-border bg-card">
            <h3 className="text-lg font-semibold mb-3">Balances</h3>
            <div className="space-y-2">
              {group.members.map((m) => {
                const key = getMemberKey(m);
                const v = balances[key] ?? 0;
                const display = getMemberDisplay(m);
                if (Math.abs(v) < 1) {
                  return (
                    <div key={key} className="text-sm text-muted-foreground">
                      {display}: settled
                    </div>
                  );
                }
                return (
                  <div key={key} className="text-sm">
                    {v > 0 ? (
                      <span className="text-emerald-600">
                        {display} is owed {fmt(v)}
                      </span>
                    ) : (
                      <span className="text-red-600">
                        {display} owes {fmt(v)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settlements */}
          <div className="rounded-2xl p-6 shadow-md border border-border bg-card">
            <h3 className="text-lg font-semibold mb-3">Who Pays Whom</h3>
            {settlements.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                All settled !!
              </p>
            ) : (
              <div className="space-y-3">
                {settlements.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="text-sm">
                      <span className="font-medium">{getMemberDisplayByKey(group, s.from)}</span> pays{" "}
                      <span className="font-medium">{fmt(s.amount)}</span> to{" "}
                      <span className="font-medium">{getMemberDisplayByKey(group, s.to)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300"
                      onClick={() => handleMarkResolved(s.from, s.to, s.amount)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolved
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses */}
          <div className="rounded-2xl p-6 shadow-md border border-border bg-card md:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Shared Expenses</h3>

            {expenses.length === 0 ? (
              <p className="text-muted-foreground">
                No shared expenses yet.
              </p>
            ) : (
              <div className="space-y-3">
                {expenses.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">
                          {e.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Paid by {getMemberDisplayByKey(group, e.paidBy)} on{" "}
                          {new Date(e.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Split among: {e.participants.map((p) => getMemberDisplayByKey(group, p)).join(", ")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Split type: {e.splitType || "equal"}
                        </div>

                        {e.shares && (
                          <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                            {Object.entries(e.shares).map(
                              ([person, share]) => (
                                <div
                                  key={person}
                                  className="flex justify-between"
                                >
                                  <span>{getMemberDisplayByKey(group, person)}</span>
                                  <span>
                                    {person === e.paidBy
                                      ? `share ${fmt(share)} (already paid)`
                                      : `owes ${fmt(share)}`}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-lg font-semibold">
                          ₹ {e.amount}
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteExpense(e.id)
                          }
                          className="text-destructive hover:bg-destructive/10 p-2 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
