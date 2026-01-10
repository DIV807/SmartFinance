import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getUser, getGroups, addSharedExpense } from "@/lib/storage";

const AddSharedExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const group = useMemo(() => getGroups().find((g) => g.id === id), [id]);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidBy, setPaidBy] = useState<string>(group?.members[0] || "");
  const [participants, setParticipants] = useState<string[]>(group?.members || []);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  if (!group) return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-4 py-8">Group not found</div></div>;

  const toggleParticipant = (m: string) => {
    setParticipants((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const submit = () => {
    if (!amount || !paidBy || participants.length === 0) return;
    addSharedExpense({
      groupId: group.id,
      amount,
      description: description || "Shared expense",
      paidBy,
      participants,
      date,
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

          <div className="flex items-center justify-end gap-2">
            <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-md border border-border">Cancel</button>
            <button onClick={submit} className="px-3 py-2 rounded-md bg-[hsl(var(--primary))] text-white">Add expense</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSharedExpense;













