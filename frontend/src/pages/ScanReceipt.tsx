import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { addExpense, getUser } from "@/lib/storage";

const categories = ["Food", "Travel", "Shopping", "Bills", "Groceries", "Others"] as const;

const ScanReceipt = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState<typeof categories[number]>("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const mockOcr = async () => {
    if (!file) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    // Very simple mock: infer amount-like number in filename, fallback to a friendly default
    const match = file.name.match(/(\d+[\._]?\d{0,2})/);
    const inferredAmount = match ? Number(match[1].replace(/_/g, ".")) : Math.round(200 + Math.random() * 1200);
    const inferredCategory = inferCategoryFromName(file.name);
    setAmount(inferredAmount);
    setCategory(inferredCategory);
    if (!description) setDescription(file.name.replace(/\.[^.]+$/, ""));
    setLoading(false);
  };

  const save = () => {
    if (!amount || !category || !date) return;
    addExpense({
      amount: Number(amount),
      category,
      description: description || "Receipt",
      date,
    });
    navigate("/expenses");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-6">Scan Receipt (Mocked)</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 shadow-md border border-border bg-card">
            <label className="block text-sm mb-2">Upload receipt image (JPG/PNG)</label>
            <div className="border border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="text-xs text-muted-foreground mt-2">Drop or choose a file</div>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-2">Preview</div>
                <img src={previewUrl} alt="receipt preview" className="max-h-64 rounded-lg border border-border" />
              </div>
            )}
          </div>

          <div className="rounded-2xl p-6 shadow-md border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recognized Details</h2>
              <button
                disabled={!file || loading}
                onClick={mockOcr}
                className="px-3 py-2 rounded-md border border-border hover:bg-muted disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Auto-fill from Image"}
              </button>
            </div>

            <label className="block text-sm mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-md border border-input px-3 py-2 mb-3 bg-background"
              placeholder="0"
            />

            <label className="block text-sm mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof categories[number])}
              className="w-full rounded-md border border-input px-3 py-2 mb-3 bg-background"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label className="block text-sm mb-1">Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 mb-3 bg-background"
              placeholder="Store / Item"
            />

            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 mb-4 bg-background"
            />

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => navigate(-1)} className="px-3 py-2 rounded-md border border-border">Cancel</button>
              <button onClick={save} className="px-3 py-2 rounded-md bg-[hsl(var(--primary))] text-white">Confirm & Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function inferCategoryFromName(name: string): typeof categories[number] {
  const lower = name.toLowerCase();
  if (/(food|pizza|meal|dinner|lunch|cafe|restaurant)/.test(lower)) return "Food";
  if (/(uber|ola|cab|flight|train|bus|travel|hotel)/.test(lower)) return "Travel";
  if (/(bill|electric|water|wifi|recharge)/.test(lower)) return "Bills";
  if (/(grocery|market|supermarket)/.test(lower)) return "Groceries";
  if (/(shop|amazon|flipkart|store)/.test(lower)) return "Shopping";
  return "Others";
}

export default ScanReceipt;







