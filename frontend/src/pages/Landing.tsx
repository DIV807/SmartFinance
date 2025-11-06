import { Link } from "react-router-dom";
import type { ReactNode } from "react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-20 bg-[hsl(var(--background))]/80 backdrop-blur border-b border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="SmartFinance" className="h-8 w-8" />
            <span className="text-lg font-semibold">SmartFinance</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-md border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition">
              Log in
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-md bg-[hsl(var(--primary))] text-white hover:opacity-90 transition">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          {/* Background visuals: subtle grid and gradient blobs */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-100px,hsl(var(--accent)/0.25),transparent)]" />
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[hsl(var(--primary))]/15 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[hsl(var(--accent))]/15 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.06]" style={{
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,.25) 1px, transparent 1px)",
              backgroundSize: "32px 32px"
            }} />
          </div>
          <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
            <h1 className="mx-auto max-w-3xl text-4xl md:text-6xl font-bold tracking-tight">
              Take control of your spending
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[hsl(var(--muted-foreground))] text-lg">
              Track expenses, split bills, and visualize trends—all in one modern, privacy-friendly app.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link to="/signup" className="px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition">
                Create free account
              </Link>
            </div>
            <div className="mt-12 mx-auto max-w-5xl rounded-xl border border-[hsl(var(--border))] bg-white shadow-[var(--shadow-lg)] overflow-hidden dark:bg-[hsl(var(--card))]">
              <div className="w-full p-6 md:p-8">
                {/* Promo module: KPI stats + mini chart illustration */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="rounded-lg border border-[hsl(var(--border))] p-5 bg-[hsl(var(--secondary))] text-left">
                    <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Monthly spend</div>
                    <div className="mt-2 text-3xl font-semibold">₹ 58,240</div>
                    <div className="mt-1 text-xs text-emerald-600">-8.2% vs last month</div>
                  </div>
                  <div className="rounded-lg border border-[hsl(var(--border))] p-5 bg-[hsl(var(--secondary))] text-left">
                    <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Top category</div>
                    <div className="mt-2 text-3xl font-semibold">Groceries</div>
                    <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">₹ 12,150 this month</div>
                  </div>
                  <div className="rounded-lg border border-[hsl(var(--border))] p-5 bg-[hsl(var(--secondary))] text-left">
                    <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Shared balance</div>
                    <div className="mt-2 text-3xl font-semibold">₹ 2,430</div>
                    <div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">You are owed</div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-[hsl(var(--border))] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Spending trend</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">Last 12 months</div>
                  </div>
                  <div className="h-40 w-full">
                    <svg viewBox="0 0 600 160" className="w-full h-full">
                      <defs>
                        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0,120 C60,100 120,140 180,110 C240,80 300,130 360,95 C420,60 480,105 540,70 C570,55 600,65 600,65 L600,160 L0,160 Z" fill="url(#area)" />
                      <path d="M0,120 C60,100 120,140 180,110 C240,80 300,130 360,95 C420,60 480,105 540,70 C570,55 600,65 600,65" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              title="Fast expense entry"
              description="Add expenses in seconds with smart categories and recurring rules."
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2h9l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <path d="M14 2v4h4" />
                  <path d="M8 13h8" />
                  <path d="M12 9v8" />
                </svg>
              }
            />
            <Feature
              title="Clear insights"
              description="Beautiful charts highlight where your money goes each month."
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <rect x="6" y="12" width="3" height="6" />
                  <rect x="11" y="9" width="3" height="9" />
                  <rect x="16" y="6" width="3" height="12" />
                </svg>
              }
            />
            <Feature
              title="Split & settle"
              description="Share group expenses and settle up without the awkwardness."
              icon={
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 14v7" />
                  <circle cx="12" cy="7" r="3" />
                  <path d="M5 22v-3a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v3" />
                </svg>
              }
            />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 text-center">
          <div className="rounded-2xl border border-[hsl(var(--border))] p-10 md:p-14 bg-[hsl(var(--secondary))]">
            <h2 className="text-2xl md:text-3xl font-semibold">Ready to get financially organized?</h2>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">Join SmartFinance and start tracking for free.</p>
            <div className="mt-6">
              <Link to="/signup" className="px-6 py-3 rounded-lg bg-[hsl(var(--primary))] text-white font-medium hover:opacity-90 transition">
                Get started free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--border))]">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-[hsl(var(--muted-foreground))] flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} SmartFinance</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[hsl(var(--foreground))]">Privacy</a>
            <a href="#" className="hover:text-[hsl(var(--foreground))]">Terms</a>
            <a href="#" className="hover:text-[hsl(var(--foreground))]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Feature = ({ title, description, icon }: { title: string; description: string; icon: ReactNode }) => {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-sm)]">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="mt-1 text-[hsl(var(--muted-foreground))]">{description}</p>
    </div>
  );
};

export default Landing;


