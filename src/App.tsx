import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CalendarPlus, Download, TimerReset, Edit3, Trash2, Copy, Bell, Sparkles, FlaskConical, Atom, Clock3, Thermometer, FileSpreadsheet, Bug, HardDriveDownload, WifiOff } from "lucide-react";

type Sample = {
  id: string;
  name: string;
  location?: string;
  temperature?: string;
  startISO: string;
  endISO: string;
  notes?: string;
  createdAt: number;
};

const pad = (n: number) => String(n).padStart(2, "0");
const NL = "\\n";

function toICSDate(d: Date): string {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + "Z"
  );
}

function icsForSample(s: Sample): string {
  const dtStart = new Date(s.startISO);
  const dtEnd = new Date(s.endISO);
  const uid = `${s.id}@venkata.epilab`;
  const summary = `Incubation: ${s.name}${s.temperature ? ` @ ${s.temperature}` : ""}`;
  const desc = [s.notes ? `Notes: ${s.notes}` : null, s.location ? `Location: ${s.location}` : null]
    .filter(Boolean)
    .map((x) => (x || "").replace(/\r?\n/g, NL))
    .join(NL);

  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(dtStart)}`,
    `DTEND:${toICSDate(dtEnd)}`,
    `SUMMARY:${summary}`,
    desc ? `DESCRIPTION:${desc}` : null,
    "BEGIN:VALARM",
    "TRIGGER:-PT5M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Incubation ending soon",
    "END:VALARM",
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join(NL);
}

function wrapICS(vevents: string[]): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//Venkata Epigenetic Lab//Incubation Matrix//EN",
    "METHOD:PUBLISH",
    ...vevents,
    "END:VCALENDAR",
  ].join(NL);
}

function download(filename: string, content: string, mime = "text/calendar") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function prettyDateTime(d: Date) {
  return d.toLocaleString([], { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function statusOf(s: Sample, now = Date.now()) {
  const start = new Date(s.startISO).getTime();
  const end = new Date(s.endISO).getTime();
  if (now < start) return "scheduled" as const;
  if (now >= start && now <= end) return "running" as const;
  return now - end < 60_000 ? ("completed" as const) : ("overdue" as const);
}

function csvForSamples(samples: Sample[]): string {
  const header = ["Name", "Start", "End", "Temperature", "Location", "Notes"].join(",");
  const rows = samples.map((s) =>
    [
      s.name,
      s.startISO,
      s.endISO,
      s.temperature || "",
      s.location || "",
      (s.notes || "").replace(/\r?\n/g, " "),
    ]
      .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join(NL);
}

function toGoogleCalendarURL(s: Sample) {
  const start = toICSDate(new Date(s.startISO));
  const end = toICSDate(new Date(s.endISO));
  const text = encodeURIComponent(`Incubation: ${s.name}`);
  const details = encodeURIComponent([
    s.temperature ? `Temperature: ${s.temperature}` : null,
    s.location ? `Location: ${s.location}` : null,
    s.notes ? `Notes: ${s.notes}` : null,
  ]
    .filter(Boolean)
    .map((x) => (x || "").replace(/\r?\n/g, NL))
    .join(NL));
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}%2F${end}&details=${details}`;
}

function injectManifest() {
  const manifest = {
    name: "Venkata Epigenetic Lab — Incubation Matrix",
    short_name: "EpiLab",
    start_url: ".",
    scope: ".",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0ea5e9",
    description: "Track incubations, offline-capable, calendar export.",
    icons: [],
  } as const;
  const existing = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
  if (!existing) {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" }));
    document.head.appendChild(link);
  }
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return { ok: false, reason: "no-sw" } as const;
  if (!window.isSecureContext) return { ok: false, reason: "insecure-context" } as const;
  try {
    const reg = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    return { ok: true, reg } as const;
  } catch (e) {
    return { ok: false, reason: String(e) } as const;
  }
}

function DNAHelixBg() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(1100px_600px_at_10%_10%,#0ea5e9_0%,transparent_60%),radial-gradient(900px_500px_at_90%_20%,#a78bfa_0%,transparent_55%),radial-gradient(700px_400px_at_50%_100%,#22d3ee_0%,transparent_50%)] bg-slate-950" />
      <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(1000px_600px_at_50%_30%,black,transparent)]" style={{backgroundImage: "linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
      <svg className="absolute -left-24 top-0 h-[140%] w-auto opacity-40" viewBox="0 0 400 1200" fill="none">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#22d3ee" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        {[0, 80, 160].map((x) => (
          <g key={x} transform={`translate(${x},0)`}>
            <path d="M100 0 C 50 150, 150 250, 100 400 C 50 550, 150 650, 100 800 C 50 950, 150 1050, 100 1200" stroke="url(#g1)" strokeWidth="2" />
            <path d="M140 0 C 90 150, 190 250, 140 400 C 90 550, 190 650, 140 800 C 90 950, 190 1050, 140 1200" stroke="url(#g1)" strokeWidth="2" />
            {Array.from({ length: 28 }).map((_, i) => (
              <line key={i} x1="100" y1={i * 42} x2="140" y2={i * 42 + 20} stroke="url(#g1)" strokeWidth="1" opacity="0.7">
                <animate attributeName="x2" values="140;130;140" dur="4s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
              </line>
            ))}
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml;utf8,<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" width=\\\"100\\\" height=\\\"100\\\" viewBox=\\\"0 0 100 100\\\"><filter id=\\\"n\\\"><feTurbulence type=\\\"fractalNoise\\\" baseFrequency=\\\"0.65\\\" numOctaves=\\\"1\\\" stitchTiles=\\\"stitch\\\"/></filter><rect width=\\\"100%\\\" height=\\\"100%\\\" filter=\\\"url(%23n)\\\" opacity=\\\"0.25\\\"/></svg>')" }} />
    </div>
  );
}

function StatusPill({ status }: { status: ReturnType<typeof statusOf> }) {
  const map: Record<string, string> = {
    scheduled: "from-sky-500 to-cyan-400 text-white",
    running: "from-emerald-400 to-lime-300 text-slate-900",
    completed: "from-slate-400 to-slate-200 text-slate-900",
    overdue: "from-rose-500 to-pink-400 text-white",
  };
  return (
    <div className={`bg-gradient-to-r ${map[status]} text-xs px-2 py-1 rounded-full shadow-lg shadow-black/30 border border-white/10`}>{status.toUpperCase()}</div>
  );
}

export default function App() {
  const [samples, setSamples] = useState<Sample[]>(() => {
    try { return JSON.parse(localStorage.getItem("epi_samples") || "[]"); } catch { return []; }
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "scheduled" | "running" | "overdue" | "completed">("all");
  const [nowTick, setNowTick] = useState(Date.now());
  const [installEvt, setInstallEvt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => { const id = setInterval(() => setNowTick(Date.now()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { localStorage.setItem("epi_samples", JSON.stringify(samples)); }, [samples]);

  useEffect(() => {
    // PWA boot
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (!existingManifest) injectManifest();
    registerServiceWorker();

    const onBip = (e: any) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener("beforeinstallprompt", onBip as any);
    const onInstalled = () => setInstallEvt(null);
    window.addEventListener("appinstalled", onInstalled);

    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);
    window.addEventListener("online", online); window.addEventListener("offline", offline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip as any);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", online); window.removeEventListener("offline", offline);
    };
  }, []);

  const enriched = useMemo(() => samples.map((s) => ({ s, status: statusOf(s, nowTick) })), [samples, nowTick]);
  const filtered = enriched
    .filter(({ s, status }) => (filter === "all" ? true : status === filter))
    .filter(({ s }) => (query.trim() ? [s.name, s.temperature, s.location, s.notes].filter(Boolean).join(" ").toLowerCase().includes(query.toLowerCase()) : true))
    .sort((a, b) => new Date(a.s.endISO).getTime() - new Date(b.s.endISO).getTime());

  const [name, setName] = useState("");
  const [start, setStart] = useState(() => new Date());
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [temperature, setTemperature] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const end = useMemo(() => new Date(start.getTime() + (hours * 60 + minutes) * 60000), [start, hours, minutes]);

  function resetForm() {
    setName(""); setStart(new Date()); setHours(1); setMinutes(0); setTemperature(""); setLocation(""); setNotes(""); setEditingId(null);
  }

  function addOrUpdateSample() {
    if (!name.trim()) return alert("Name your sample.");
    const s: Sample = {
      id: editingId ?? (crypto as any).randomUUID?.() ?? String(Date.now()),
      name: name.trim(),
      temperature: temperature.trim() || undefined,
      location: location.trim() || undefined,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      notes: notes.trim() || undefined,
      createdAt: editingId ? samples.find((x) => x.id === editingId)?.createdAt || Date.now() : Date.now(),
    };
    setSamples((prev) => (prev.some((x) => x.id === s.id) ? prev.map((x) => (x.id === s.id ? s : x)) : [s, ...prev]));
    resetForm();
  }

  function editSample(s: Sample) {
    setEditingId(s.id); setName(s.name); setStart(new Date(s.startISO));
    const mins = Math.max(1, Math.round((new Date(s.endISO).getTime() - new Date(s.startISO).getTime()) / 60000));
    setHours(Math.floor(mins / 60)); setMinutes(mins % 60);
    setTemperature(s.temperature || ""); setLocation(s.location || ""); setNotes(s.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function removeSample(id: string) {
    if (!confirm("Delete this incubation?")) return; setSamples((p) => p.filter((x) => x.id !== id));
  }
  function duplicateSample(s: Sample) {
    const copy: Sample = { ...s, id: (crypto as any).randomUUID?.() ?? String(Date.now()), name: `${s.name} (copy)`, createdAt: Date.now() };
    setSamples((p) => [copy, ...p]);
  }

  function exportAllICS() {
    if (samples.length === 0) return alert("No samples.");
    download(`EpiLab_Incubations.ics`, wrapICS(samples.map(icsForSample)));
  }
  function exportCSV() {
    if (samples.length === 0) return alert("No samples.");
    download("EpiLab_Incubations.csv", csvForSamples(samples), "text/csv");
  }

  async function triggerInstall() {
    if (!installEvt) return;
    installEvt.prompt();
    const choice = await installEvt.userChoice;
    setInstallEvt(null);
    console.info("A2HS:", choice);
  }

  return (
    <div className="min-h-screen text-slate-100 relative">
      <DNAHelixBg />

      <header className="sticky top-0 z-40 backdrop-blur-lg bg-slate-950/40 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-2 bg-cyan-400/30 blur-xl rounded-full" />
            <FlaskConical className="relative w-6 h-6 text-cyan-300" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">
            VENKATA • <span className="text-cyan-300">EPIGENETIC LAB</span> — <span className="text-violet-300">Incubation Matrix</span>
          </h1>
          <div className="ml-auto flex items-center gap-2">
            {installEvt && (
              <button onClick={triggerInstall} className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 inline-flex items-center gap-2" title="Install app">
                <HardDriveDownload className="w-4 h-4"/> Install
              </button>
            )}
            <button onClick={exportAllICS} className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-300/40 text-cyan-100 inline-flex items-center gap-2">
              <CalendarPlus className="w-4 h-4"/> .ics
            </button>
            <button onClick={exportCSV} className="px-3 py-1.5 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-300/40 text-violet-100 inline-flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4"/> CSV
            </button>
          </div>
        </div>
        {!isOnline && (
          <div className="bg-amber-500/10 border-t border-amber-400/30 text-amber-100 text-xs">
            <div className="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2"><WifiOff className="w-4 h-4"/> You're offline — app still works; sync and Google Calendar links require internet.</div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="relative mb-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 overflow-hidden">
          <div className="absolute -inset-16 bg-gradient-to-r from-cyan-500/10 via-fuchsia-500/10 to-violet-500/10 [mask-image:radial-gradient(600px_200px_at_20%_0%,black,transparent)]" />
          <div className="relative flex flex-wrap items-start gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Atom className="w-4 h-4 text-cyan-300"/> epigenetic theme
              <Sparkles className="w-4 h-4 text-violet-300"/>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs">
              <button onClick={() => ("Notification" in window ? Notification.requestPermission() : alert("No notifications"))} className="px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10 inline-flex items-center gap-2"><Bell className="w-4 h-4"/> Enable notifications</button>
            </div>
          </div>
          <p className="relative mt-3 text-sm text-slate-300">
            Track incubations with a neon-DNA twist. Now installable and offline-capable. Live countdowns, calendar export, CSV logs.
          </p>
        </div>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold tracking-tight">{editingId ? "Edit incubation" : "New incubation"}</h2>
              {editingId && <span className="ml-auto text-xs text-slate-400">ID: {editingId.slice(0,8)}…</span>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-300">Sample name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., S. cerevisiae — H2O2 stress"
                  className="w-full rounded-xl border border-white/15 bg-white/10 text-slate-100 placeholder:text-slate-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-300/40" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Start</label>
                <input type="datetime-local" value={new Date(start.getTime() - start.getTimezoneOffset() * 60000).toISOString().slice(0,16)} onChange={(e) => setStart(new Date(e.target.value))}
                  className="w-full rounded-xl border border-white/15 bg-white/10 text-slate-100 px-3 py-2" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Hours</label>
                  <input type="number" min={0} value={hours} onChange={(e) => setHours(Math.max(0, parseInt(e.target.value || "0")))}
                    className="w-full rounded-xl border border-white/15 bg-white/10 text-slate-100 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-300">Minutes</label>
                  <input type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Math.min(59, Math.max(0, parseInt(e.target.value || "0"))))}
                    className="w-full rounded-xl border border-white/15 bg-white/10 text-slate-100 px-3 py-2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300 flex items-center gap-2"><Thermometer className="w-4 h-4 text-cyan-300"/>Temperature</label>
                <input value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="e.g., 30°C, RT, 65°C"
                  className="w-full rounded-xl border border-white/15 bg-white/10 text-slate-100 px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Location</label>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Incubator B2, Shaker #1"
                  className="w-full rounded-xl border border-white/15 bg-white/10 text-slate-100 px-3 py-2" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-300">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Add IPTG at 2h — check OD600"
                  className="w-full rounded-xl border border-white/15 bg-white/10 text-slate-100 px-3 py-2 h-20" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={addOrUpdateSample} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-slate-900 font-semibold shadow-lg shadow-cyan-500/30">
                <Plus className="w-4 h-4"/> {editingId ? "Save changes" : "Add incubation"}
              </button>
              <button onClick={resetForm} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 hover:bg-white/10">
                <TimerReset className="w-4 h-4"/> Reset
              </button>

              <div className="ml-auto flex items-center gap-2 text-xs">
                <span className="text-slate-400">Presets:</span>
                {[15, 30, 45, 60, 90, 120, 180, 240].map((m) => (
                  <button key={m} onClick={() => { setHours(Math.floor(m/60)); setMinutes(m%60); }} className="px-3 py-1 rounded-full border border-white/15 hover:bg-white/10">
                    {m >= 60 ? `${Math.round(m/60)}h` : `${m}m`}
                  </button>
                ))}
              </div>

              <div className="w-full mt-3 text-sm text-slate-300">
                <div className="flex items-center gap-2"><Clock3 className="w-4 h-4 text-violet-300"/> Ends:</div>
                <div className="font-medium text-slate-100">{prettyDateTime(end)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-2xl shadow-black/30">
            <h3 className="text-lg font-semibold mb-3">Search & Filters</h3>
            <div className="grid gap-3">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, temp, location, notes…"
                className="w-full rounded-xl border border-white/15 bg-white/10 text-slate-100 placeholder:text-slate-400 px-3 py-2" />
              <div className="flex flex-wrap gap-2">
                {[ ["all","All"], ["scheduled","Scheduled"], ["running","Running"], ["overdue","Overdue"], ["completed","Completed"] ].map(([key,label]) => (
                  <button key={key} onClick={() => setFilter(key as any)}
                    className={`px-3 py-1.5 rounded-xl border border-white/15 ${filter===key?"bg-gradient-to-r from-cyan-400/30 to-fuchsia-400/30 text-white":"hover:bg-white/10"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400">Tip: Cards show neon progress bars and quick calendar export.</div>
            </div>
          </div>
        </section>

        <section className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Incubations</h2>
            <span className="text-sm text-slate-400">{filtered.length} shown • {samples.length} total</span>
          </div>

        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 text-center text-slate-300">
              No incubations yet. Add one above — e.g., <span className="font-medium">“Yeast @ 30°C, 90 min”</span>.
            </motion.div>
          ) : (
            filtered.map(({s, status}) => (
              <SampleCard key={s.id} s={s} status={status as any} onEdit={editSample} onDelete={removeSample} onDuplicate={duplicateSample} />
            ))
          )}
        </AnimatePresence>
        </section>

        <DevDiagnostics />

        <footer className="mt-12 py-8 text-center text-xs text-slate-400">
          Built for Venkata’s Epigenetic Lab • Neon PWA v3.2
        </footer>
      </main>

      <button onClick={() => document.querySelector<HTMLInputElement>('input[placeholder^="e.g., S. cerevisiae"]')?.focus()} title="New incubation"
        className="fixed bottom-6 right-6 z-40 rounded-full p-3 bg-gradient-to-r from-cyan-400 to-fuchsia-400 text-slate-900 shadow-xl shadow-fuchsia-500/30 hover:scale-105 transition">
        <Plus className="w-6 h-6"/>
      </button>
    </div>
  );
}

function ProgressBar({ startISO, endISO }: { startISO: string; endISO: string }) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => { const id = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(id); }, []);
  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();
  const pct = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  return (
    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden border border-white/10">
      <div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" style={{ width: `${pct}%` }} />
    </div>
  );
}

function SampleCard({ s, status, onEdit, onDelete, onDuplicate }: { s: Sample; status: ReturnType<typeof statusOf>; onEdit: (s: Sample) => void; onDelete: (id: string) => void; onDuplicate: (s: Sample) => void; }) {
  const now = Date.now();
  const start = new Date(s.startISO).getTime();
  const end = new Date(s.endISO).getTime();
  const remain = status === "running" ? end - now : 0;

  function formatDuration(ms: number) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad2 = (n: number) => String(n).padStart(2, "0");
    return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
  }

  return (
    <motion.div layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
      className="group border border-white/10 rounded-3xl bg-white/5 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/30">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <StatusPill status={status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base truncate">{s.name}</h3>
              {s.temperature && <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-white/10 border border-white/15"><Thermometer className="w-3.5 h-3.5 text-cyan-300" />{s.temperature}</div>}
              {s.location && <div className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/15">{s.location}</div>}
            </div>
            <div className="mt-1 text-sm text-slate-300 flex flex-wrap gap-x-6 gap-y-1">
              <div><span className="font-medium text-slate-200">Start:</span> {prettyDateTime(new Date(s.startISO))}</div>
              <div><span className="font-medium text-slate-200">End:</span> {prettyDateTime(new Date(s.endISO))}</div>
              {s.notes && <div className="w-full sm:w-auto"><span className="font-medium text-slate-200">Notes:</span> {s.notes}</div>}
            </div>
          </div>
        </div>

        <div className="mt-3">
          {status === "running" && (
            <div className="mb-2 text-sm font-mono bg-black/30 border border-white/10 text-white px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              ⏳ {formatDuration(remain)} remaining
            </div>
          )}
          {status === "scheduled" && (
            <div className="mb-2 text-sm font-mono bg-black/30 border border-white/10 text-white px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              ▶ Starts in {formatDuration(start - now)}
            </div>
          )}
          {status === "overdue" && (
            <div className="mb-2 text-sm font-mono bg-rose-600/80 border border-rose-300/40 text-white px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
              ⚠ Finished {formatDuration(now - end)} ago
            </div>
          )}
          <ProgressBar startISO={s.startISO} endISO={s.endISO} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href={toGoogleCalendarURL(s)} target="_blank" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10">
            <CalendarPlus className="w-4 h-4"/> Google Cal
          </a>
          <button onClick={() => download(`${s.name.replace(/[^a-z0-9_\-]+/gi, "_")}.ics`, wrapICS([icsForSample(s)]))} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10">
            <Download className="w-4 h-4"/> .ics
          </button>
          <button onClick={() => onDuplicate(s)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10">
            <Copy className="w-4 h-4"/> Duplicate
          </button>
          <button onClick={() => onEdit(s)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/10">
            <Edit3 className="w-4 h-4"/> Edit
          </button>
          <button onClick={() => onDelete(s.id)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-rose-400/30 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30">
            <Trash2 className="w-4 h-4"/> Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DevDiagnostics() {
  const [results, setResults] = React.useState<{ name: string; pass: boolean; detail?: string }[]>([]);

  React.useEffect(() => {
    const now = new Date();
    const in5 = new Date(now.getTime() + 5 * 60000);
    const past5 = new Date(now.getTime() - 5 * 60000);

    const sample: Sample = {
      id: "test-1",
      name: "Diagnostics Sample",
      startISO: now.toISOString(),
      endISO: in5.toISOString(),
      createdAt: Date.now(),
      temperature: "30°C",
      location: "Incubator X",
      notes: "Line1\\nLine2",
    };

    const tests: { name: string; fn: () => boolean; detail?: string }[] = [
      { name: "icsForSample produces VEVENT with escaped newlines", fn: () => { const ics = icsForSample(sample); return ics.includes("BEGIN:VEVENT") && ics.includes("END:VEVENT") && ics.includes("\\n"); } },
      { name: "wrapICS wraps calendar correctly", fn: () => { const cal = wrapICS([icsForSample(sample)]); return cal.startsWith("BEGIN:VCALENDAR") && cal.endsWith("END:VCALENDAR"); } },
      { name: "CSV header + row, uses escaped row separators", fn: () => { const csv = csvForSamples([sample]); return csv.startsWith("Name,Start,End,Temperature,Location,Notes") && csv.includes("\\n"); } },
      { name: "statusOf transitions", fn: () => { const a: Sample = { ...sample, startISO: in5.toISOString(), endISO: new Date(in5.getTime() + 60000).toISOString() }; const b: Sample = { ...sample, startISO: now.toISOString(), endISO: in5.toISOString() }; const c: Sample = { ...sample, startISO: past5.toISOString(), endISO: past5.toISOString() }; return (statusOf(a, now.getTime()) === "scheduled" && statusOf(b, now.getTime()) === "running" && ["completed", "overdue"].includes(statusOf(c, now.getTime()) as any)); } },
      { name: "PWA: manifest link exists", fn: () => !!document.querySelector('link[rel="manifest"]') },
      { name: "PWA: serviceWorker supported", fn: () => 'serviceWorker' in navigator },
      { name: "Google Cal URL encodes escaped newlines", fn: () => { const url = toGoogleCalendarURL(sample); return url.includes('action=TEMPLATE') && url.includes('text=') && decodeURIComponent(url).includes('\\n'); } },
    ];

    const r = tests.map((t) => {
      let pass = false; let detail = "";
      try { pass = !!t.fn(); } catch (e: any) { pass = false; detail = String(e?.message || e); }
      return { name: t.name, pass, detail };
    });
    setResults(r);
  }, []);

  const allPass = results.length > 0 && results.every((r) => r.pass);

  return (
    <div className="mt-10 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
      <div className="flex items-center gap-2 text-emerald-200">
        <Bug className="w-4 h-4"/>
        <span className="font-semibold">Developer Diagnostics</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded ${allPass ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
          {allPass ? "All tests passing" : "Needs attention"}
        </span>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {results.map((r) => (
          <li key={r.name} className="flex items-start gap-2">
            <span className={`mt-1 inline-block h-2 w-2 rounded-full ${r.pass ? "bg-emerald-400" : "bg-rose-400"}`} />
            <div>
              <div className="text-slate-100">{r.name}</div>
              {!r.pass && r.detail && <div className="text-rose-200/90 text-xs">{r.detail}</div>}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-xs text-slate-300">
        <p><strong>Note:</strong> Service workers require HTTPS and a real <code>sw.js</code>. GitHub Pages provides HTTPS.</p>
      </div>
    </div>
  );
}
