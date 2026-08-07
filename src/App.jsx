import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient.js";
import {
  Search, Sun, Moon, Play, Users, TrendingUp, Sparkles, Clock,
  Plus, Upload, BarChart3, DollarSign,
  Eye, Heart, Film, Music2, Trophy, GraduationCap, Gamepad2,
  Newspaper, Clapperboard, Shield, Trash2, CheckCircle2, XCircle,
  Tv, ArrowUp, ArrowDown, Edit3, User, Bell, Menu, X, Zap, Antenna,
  RotateCcw,
} from "lucide-react";

/* ============================== DATA ============================== */

const CATEGORIES = [
  { id: "movies", label: "Movies" },
  { id: "music", label: "Music" },
  { id: "sports", label: "Sports" },
  { id: "education", label: "Education" },
  { id: "gaming", label: "Gaming" },
  { id: "news", label: "News" },
  { id: "entertainment", label: "Entertainment" },
];

const CATEGORY_ICON = {
  movies: Film, music: Music2, sports: Trophy, education: GraduationCap,
  gaming: Gamepad2, news: Newspaper, entertainment: Clapperboard,
};

const PROGRAM_POOLS = {
  movies: ["Midnight Requiem (2019)", "The Glass Horizon", "Neon Streets", "Ashfall",
    "Late Night Double Feature", "Director's Cut Hour", "The Long Way Home",
    "Static & Silence", "Harbor Lights", "Reel Classics: 90s Night"],
  music: ["Morning Frequencies", "Indie Hour", "Beat Lab Live", "Synthwave Sessions",
    "Acoustic Sundown", "Top 40 Countdown", "Late Night Lo-fi", "Vinyl Vault",
    "Bassline Radio", "Sunrise Chillout"],
  sports: ["SportsCenter Roundup", "Live: League Match Replay", "Fight Night Classics",
    "Trackside Highlights", "The Locker Room", "Weekend Recap", "Extreme Sports Hour",
    "Full Match Replay", "Draft Analysis", "Overtime Talk"],
  education: ["History Uncovered", "Science Simplified", "Mind & Method", "Language Lab",
    "The Curious Classroom", "Deep Dive Documentaries", "Study Hall Live",
    "World Explained", "Code & Concepts", "Math Made Easy"],
  gaming: ["Speedrun Spotlight", "Retro Arcade Hour", "Ranked Grind Live",
    "Indie Game Showcase", "Boss Rush", "Patch Notes Live", "Late Night Co-op",
    "Esports Replay", "Build & Battle", "Pixel Theater Hour"],
  news: ["Morning Briefing", "World Report", "Market Watch", "Tech Today",
    "Regional Update", "The Debate Hour", "Evening Bulletin", "Weather Desk",
    "Investigative Report", "Overnight Wire"],
  entertainment: ["Talk of the Town", "Celebrity Hour", "Behind the Scenes",
    "Late Night Laughs", "Reality Check", "The Green Room Live", "Pop Culture Rewind",
    "Studio Live", "After Hours", "Weekend Spotlight"],
};

const TIME_SLOTS = ["00:00", "02:30", "05:00", "07:30", "10:00", "12:30", "15:00", "17:30", "20:00", "22:00"];

function buildSchedule(category, offset = 0) {
  const pool = PROGRAM_POOLS[category];
  return TIME_SLOTS.map((time, i) => ({ time, title: pool[(i + offset) % pool.length] }));
}

const RAW_CHANNELS = [
  { id: "nova-cinema", chNo: 101, name: "Nova Cinema", category: "movies",
    tagline: "Feature films, all night.", followers: 284000, viewersBase: 9400,
    owner: "Nova Studios", featured: true, trending: true,
    grad: ["from-red-900", "to-zinc-950"],
    desc: "Nova Cinema runs a curated slate of feature films back-to-back, from noir thrillers to modern indie darlings. No episode picking — just tune in and watch whatever's airing." },
  { id: "frame-reel", chNo: 104, name: "Frame & Reel", category: "movies",
    tagline: "Indie film discoveries.", followers: 31200, viewersBase: 1200,
    owner: "Reel House", isNew: true, offset: 5,
    grad: ["from-orange-900", "to-zinc-950"],
    desc: "A rotating reel of independent films you won't find on the big platforms, hand-picked by a small team of programmers who love the format." },
  { id: "wavelength", chNo: 205, name: "Wavelength", category: "music",
    tagline: "Music around the clock.", followers: 198500, viewersBase: 6700,
    owner: "Wavelength Collective", trending: true,
    grad: ["from-fuchsia-900", "to-zinc-950"],
    desc: "Wavelength broadcasts a genre-hopping mix of live sessions, countdowns and DJ sets, scheduled like a real radio station but for your eyes too." },
  { id: "lofi-harbor", chNo: 208, name: "Lo-Fi Harbor", category: "music",
    tagline: "Chill beats to dock to.", followers: 52300, viewersBase: 2100,
    owner: "Harbor Sound", isNew: true, offset: 6,
    grad: ["from-purple-900", "to-zinc-950"],
    desc: "Slow tempo, warm tape hiss, and a looped skyline view. Lo-Fi Harbor is the channel people leave on in the background while they work." },
  { id: "full-court", chNo: 310, name: "Full Court", category: "sports",
    tagline: "Every game, replayed live.", followers: 412000, viewersBase: 15300,
    owner: "Full Court Media", featured: true, trending: true,
    grad: ["from-emerald-900", "to-zinc-950"],
    desc: "Full Court schedules replays and live coverage back to back so there's always a match on — no digging through archives required." },
  { id: "trackside", chNo: 314, name: "Trackside", category: "sports",
    tagline: "Motorsport, wall to wall.", followers: 87400, viewersBase: 3200,
    owner: "Trackside Network", offset: 4,
    grad: ["from-lime-900", "to-zinc-950"],
    desc: "Qualifying, race day, and paddock analysis, scheduled like a proper motorsport channel with a full programming grid." },
  { id: "mindspark", chNo: 402, name: "Mindspark", category: "education",
    tagline: "Learn something tonight.", followers: 143000, viewersBase: 4100,
    owner: "Mindspark Learning", trending: true,
    grad: ["from-amber-900", "to-zinc-950"],
    desc: "Documentary-style lessons on history, science and the world around us, scheduled through the day like an old-school learning channel." },
  { id: "codecraft", chNo: 405, name: "Codecraft Academy", category: "education",
    tagline: "Programming, taught live.", followers: 22800, viewersBase: 980,
    owner: "Codecraft", isNew: true, offset: 5,
    grad: ["from-yellow-900", "to-zinc-950"],
    desc: "A daily programming block covering everything from beginner syntax to systems design, taught in scheduled live segments." },
  { id: "respawn-tv", chNo: 510, name: "Respawn TV", category: "gaming",
    tagline: "Games. No pause button.", followers: 356000, viewersBase: 12100,
    owner: "Respawn Media", featured: true, trending: true,
    grad: ["from-violet-900", "to-zinc-950"],
    desc: "Respawn TV is always mid-game — ranked ladders, speedruns, and co-op nights, scheduled so there's always something live." },
  { id: "pixel-theater", chNo: 513, name: "Pixel Theater", category: "gaming",
    tagline: "Retro cabinets, live.", followers: 64200, viewersBase: 2600,
    owner: "Pixel Theater Co.", offset: 7,
    grad: ["from-indigo-900", "to-zinc-950"],
    desc: "Cabinet classics and speedrun attempts from the golden age of gaming, playing on a loop like a retro arcade that never closes." },
  { id: "wire-report", chNo: 601, name: "Wire Report", category: "news",
    tagline: "The wire never sleeps.", followers: 521000, viewersBase: 18700,
    owner: "Wire Report Inc.", featured: true,
    grad: ["from-sky-900", "to-zinc-950"],
    desc: "Rolling news coverage scheduled block by block — briefings, market watch and bulletins, all day and through the night." },
  { id: "green-room", chNo: 705, name: "The Green Room", category: "entertainment",
    tagline: "Talk. Laughs. Repeat.", followers: 176000, viewersBase: 5400,
    owner: "Green Room Studios", trending: true,
    grad: ["from-rose-900", "to-zinc-950"],
    desc: "Talk segments, celebrity interviews and clip shows scheduled through the day like a classic entertainment network." },
];

const CHANNELS = RAW_CHANNELS.map((c) => ({
  ...c,
  isLive: true,
  schedule: buildSchedule(c.category, c.offset || 0),
}));

const MY_CHANNEL_IDS = ["nova-cinema", "respawn-tv"];

const ADS = [
  { id: 1, title: "Aperture Cold Brew", subtitle: "Brewed slow. Streamed fast.", cta: "Learn more", grad: ["from-amber-800", "to-zinc-950"] },
  { id: 2, title: "Meridian Headphones", subtitle: "Studio sound for your living room.", cta: "Shop now", grad: ["from-cyan-800", "to-zinc-950"] },
  { id: 3, title: "TeleCast Pro", subtitle: "Ad-free viewing across every channel.", cta: "Upgrade", grad: ["from-red-800", "to-zinc-950"] },
];

const ADMIN_USERS = [
  { id: 1, name: "Ariana Bloom", email: "ariana@novastudios.tv", role: "Owner", status: "Active" },
  { id: 2, name: "Devon Okafor", email: "devon@respawnmedia.tv", role: "Owner", status: "Active" },
  { id: 3, name: "Priya Nandan", email: "priya@wire-report.tv", role: "Owner", status: "Active" },
  { id: 4, name: "Marcus Vell", email: "marcus.vell@mail.com", role: "Viewer", status: "Active" },
  { id: 5, name: "Sofia Reyes", email: "s.reyes@mail.com", role: "Viewer", status: "Suspended" },
  { id: 6, name: "Kenji Sato", email: "kenji@harborsound.tv", role: "Owner", status: "Pending review" },
];

/* ============================== HELPERS ============================== */

function cx(...a) { return a.filter(Boolean).join(" "); }
function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getNowInfo(schedule, now) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let idx = -1;
  for (let i = 0; i < schedule.length; i++) {
    if (timeToMinutes(schedule[i].time) <= nowMin) idx = i;
  }
  if (idx === -1) idx = schedule.length - 1;
  const nextIdx = (idx + 1) % schedule.length;
  const startMin = timeToMinutes(schedule[idx].time);
  let endMin = timeToMinutes(schedule[nextIdx].time);
  if (endMin <= startMin) endMin += 24 * 60;
  let effectiveNow = nowMin;
  if (effectiveNow < startMin) effectiveNow += 24 * 60;
  const progress = Math.min(100, Math.max(0, ((effectiveNow - startMin) / (endMin - startMin)) * 100));
  const minutesLeft = Math.max(0, Math.round(endMin - effectiveNow));
  return { currentIdx: idx, nextIdx, current: schedule[idx], next: schedule[nextIdx], progress, minutesLeft };
}

function getTheme(isDark) {
  return isDark
    ? {
        bg: "bg-black", bgSoft: "bg-zinc-950", surface: "bg-zinc-900",
        surfaceHover: "hover:bg-zinc-800", border: "border-zinc-800",
        text: "text-zinc-100", textMuted: "text-zinc-400", textFaint: "text-zinc-600",
        input: "bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-600",
        pill: "bg-zinc-900 border-zinc-800", pillActive: "bg-red-600 border-red-600 text-white",
      }
    : {
        bg: "bg-neutral-100", bgSoft: "bg-white", surface: "bg-white",
        surfaceHover: "hover:bg-neutral-50", border: "border-neutral-200",
        text: "text-zinc-900", textMuted: "text-zinc-500", textFaint: "text-zinc-400",
        input: "bg-white border-neutral-300 text-zinc-900 placeholder-zinc-400",
        pill: "bg-white border-neutral-200", pillActive: "bg-red-600 border-red-600 text-white",
      };
  function LiveDot({ size = "w-1.5 h-1.5" }) {
  return (
    <span className="relative inline-flex">
      <span className={cx(size, "rounded-full bg-red-500 animate-ping absolute inline-flex opacity-75")} />
      <span className={cx(size, "rounded-full bg-red-500 relative inline-flex")} />
    </span>
  );
}

function ChNoBadge({ chNo, t }) {
  return (
    <span className={cx("font-display tracking-wide text-[11px] px-1.5 py-0.5 rounded border", t.border, t.textMuted)}>
      CH {chNo}
    </span>
  );
}

function ChannelScreen({ channel, big, t }) {
  const Icon = CATEGORY_ICON[channel.category];
  return (
    <div className={cx("relative overflow-hidden rounded-xl bg-gradient-to-br", channel.grad[0], channel.grad[1],
      big ? "aspect-video" : "aspect-video")}>
      <div className="absolute inset-0 animate-screenshift opacity-80"
        style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08), transparent 60%)" }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className={cx("text-white/10", big ? "w-24 h-24" : "w-10 h-10")} strokeWidth={1.2} />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(to bottom, #fff 0px, #fff 1px, transparent 1px, transparent 3px)" }} />
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur px-2 py-0.5 rounded-full">
        <LiveDot />
        <span className="text-white text-[10px] font-bold tracking-widest">LIVE</span>
      </div>
      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-0.5 rounded-full text-white text-[10px]">
        <Users className="w-3 h-3" />
        {formatCount(channel.viewersBase)}
      </div>
      {big && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur flex items-center justify-center border border-white/20">
            <Play className="w-6 h-6 text-white ml-1" fill="white" />
          </div>
        </div>
      )}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-6">
        <p className="text-white text-[11px] font-semibold truncate">{channel.currentTitle}</p>
      </div>
    </div>
  );
}

function ChannelCard({ channel, now, followed, onToggleFollow, onOpen, t }) {
  const info = getNowInfo(channel.schedule, now);
  const c = { ...channel, currentTitle: info.current.title };
  const isFollowed = followed.has(channel.id);
  return (
    <div className={cx("group rounded-xl border overflow-hidden transition cursor-pointer", t.border, t.surface, t.surfaceHover)}
      onClick={() => onOpen(channel.id)}>
      <ChannelScreen channel={c} t={t} />
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ChNoBadge chNo={channel.chNo} t={t} />
              {channel.isNew && <span className="text-[10px] font-bold text-emerald-500">NEW</span>}
            </div>
            <p className={cx("font-display text-lg leading-tight truncate", t.text)}>{channel.name}</p>
            <p className={cx("text-xs truncate", t.textMuted)}>{info.current.title}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFollow(channel.id); }}
            className={cx("shrink-0 p-1.5 rounded-full border transition", t.border,
              isFollowed ? "bg-red-600 border-red-600 text-white" : cx(t.surface, t.textMuted, "hover:text-red-500"))}
          >
            <Heart className="w-3.5 h-3.5" fill={isFollowed ? "currentColor" : "none"} />
          </button>
        </div>
        <div className={cx("flex items-center gap-1 mt-2 text-[11px]", t.textFaint)}>
          <Users className="w-3 h-3" /> {formatCount(channel.viewersBase)} watching
          <span className="mx-1">·</span>
          {formatCount(channel.followers)} followers
        </div>
      </div>
    </div>
  );
}

function SectionRow({ title, icon: Icon, channels, now, followed, onToggleFollow, onOpen, t }) {
  if (!channels.length) return null;
  return (
    <section className="mb-9">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="w-4 h-4 text-red-500" />}
        <h2 className={cx("font-display text-xl tracking-wide", t.text)}>{title}</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {channels.map((c) => (
          <ChannelCard key={c.id} channel={c} now={now} followed={followed} onToggleFollow={onToggleFollow} onOpen={onOpen} t={t} />
        ))}
      </div>
      </section>
  );
}

function Ticker({ channels, now, t }) {
  const items = useMemo(() => {
    const trending = channels.filter((c) => c.trending).slice(0, 6);
    return trending.map((c) => {
      const info = getNowInfo(c.schedule, now);
      return `${c.name} now airing ${info.current.title} · ${formatCount(c.viewersBase)} watching`;
    });
  }, [channels, now]);
  const text = items.join("   ●   ");
  return (
    <div className={cx("border-y overflow-hidden", t.border, "bg-red-600")}>
      <div className="flex whitespace-nowrap py-1.5 animate-marquee">
        <span className="text-white text-xs font-semibold px-4 tracking-wide">{text}</span>
        <span className="text-white text-xs font-semibold px-4 tracking-wide">{text}</span>
      </div>
    </div>
  );
}

function AdBanner({ t }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % ADS.length), 6000);
    return () => clearInterval(id);
  }, []);
  const ad = ADS[idx];
  return (
    <div className={cx("relative rounded-xl overflow-hidden border mb-9 bg-gradient-to-r", t.border, ad.grad[0], ad.grad[1])}>
      <div className="flex items-center justify-between px-5 py-6 sm:px-8 sm:py-8">
        <div>
          <span className="text-[10px] tracking-widest font-bold text-white/50">SPONSORED</span>
          <h3 className="font-display text-2xl sm:text-3xl text-white mt-1">{ad.title}</h3>
          <p className="text-white/70 text-sm mt-1">{ad.subtitle}</p>
          <button className="mt-4 bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-white/90 transition">
            {ad.cta}
          </button>
        </div>
      </div>
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {ADS.map((a, i) => (
          <button key={a.id} onClick={() => setIdx(i)}
            className={cx("w-1.5 h-1.5 rounded-full transition", i === idx ? "bg-white" : "bg-white/30")} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, t }) {
  return (
    <div className={cx("rounded-xl border p-4", t.border, t.surface)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-red-500" />
        <span className={cx("text-xs", t.textMuted)}>{label}</span>
      </div>
      <p className={cx("font-display text-2xl", t.text)}>{value}</p>
      {sub && <p className={cx("text-[11px] mt-0.5", t.textFaint)}>{sub}</p>}
    </div>
  );
}
    }
function AuthModal({ t, onClose }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Muvaffaqiyatli! Emailingizni tekshiring va tasdiqlash havolasini bosing.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={cx("w-full max-w-sm rounded-2xl border p-6", t.border, t.surface)} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className={cx("font-display text-2xl", t.text)}>{mode === "signin" ? "Kirish" : "Ro'yxatdan o'tish"}</h2>
          <button onClick={onClose} className={t.textMuted}><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={cx("text-xs font-semibold", t.textMuted)}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className={cx("w-full mt-1 text-sm rounded-lg px-3 py-2 border outline-none focus:border-red-500", t.input)} />
          </div>
          <div>
            <label className={cx("text-xs font-semibold", t.textMuted)}>Parol</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className={cx("w-full mt-1 text-sm rounded-lg px-3 py-2 border outline-none focus:border-red-500", t.input)} />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          {message && <p className="text-xs text-emerald-500">{message}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? "Kuting..." : mode === "signin" ? "Kirish" : "Ro'yxatdan o'tish"}
          </button>
        </form>
        <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setMessage(""); }}
          className={cx("w-full text-center text-xs mt-4", t.textMuted)}>
          {mode === "signin" ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : "Hisobingiz bormi? Kiring"}
        </button>
      </div>
    </div>
  );
}
function TopNav({ t, isDark, setIsDark, view, setView, role, setRole, query, setQuery, onSearchSubmit, mobileOpen, setMobileOpen, user, onOpenAuth, onSignOut }) {
  const roles = [
    { id: "viewer", label: "Viewer" },
    { id: "owner", label: "Owner" },
    { id: "admin", label: "Admin" },
  ];
  return (
    <header className={cx("sticky top-0 z-40 backdrop-blur border-b", t.border, isDark ? "bg-black/85" : "bg-white/85")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <button className="flex items-center gap-2 shrink-0" onClick={() => { setView("home"); setRole("viewer"); }}>
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <Antenna className="w-4.5 h-4.5 text-white" />
            </div>
            <span className={cx("font-display text-2xl tracking-wide", t.text)}>TeleCast</span>
          </button>
          <form onSubmit={onSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <Search className={cx("w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2", t.textFaint)} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search channels..."
              className={cx("w-full text-sm rounded-full pl-9 pr-4 py-2 border outline-none focus:border-red-500 transition", t.input)}
            />
          </form>

          <div className="hidden lg:flex items-center gap-1 shrink-0">
            {roles.map((r) => (
              <button key={r.id}
                onClick={() => { setRole(r.id); setView(r.id === "viewer" ? "home" : r.id === "owner" ? "dashboard" : "admin"); }}
                className={cx("text-xs font-semibold px-3 py-1.5 rounded-full border transition",
                  role === r.id ? "bg-red-600 border-red-600 text-white" : cx(t.pill, t.textMuted))}>
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIsDark(!isDark)}
              className={cx("p-2 rounded-full border transition", t.border, t.surfaceHover, t.textMuted)}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button className={cx("hidden sm:flex p-2 rounded-full border transition", t.border, t.surfaceHover, t.textMuted)}>
              <Bell className="w-4 h-4" />
            </button>
            {user ? (
              <button onClick={onSignOut} title="Chiqish"
                className="hidden sm:flex w-8 h-8 rounded-full bg-red-600 items-center justify-center text-white text-xs font-bold">
                {user.email[0].toUpperCase()}
              </button>
            ) : (
              <button onClick={onOpenAuth}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-600 text-white">
                <User className="w-3.5 h-3.5" /> Kirish
              </button>
            )}
            <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className={cx("w-5 h-5", t.text)} /> : <Menu className={cx("w-5 h-5", t.text)} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden pb-4 space-y-3">
            <form onSubmit={onSearchSubmit} className="relative">
              <Search className={cx("w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2", t.textFaint)} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search channels..."
                className={cx("w-full text-sm rounded-full pl-9 pr-4 py-2 border outline-none focus:border-red-500", t.input)}
              />
            </form>
            <div className="flex gap-2">
              {roles.map((r) => (
                <button key={r.id}
                  onClick={() => { setRole(r.id); setView(r.id === "viewer" ? "home" : r.id === "owner" ? "dashboard" : "admin"); setMobileOpen(false); }}
                  className={cx("flex-1 text-xs font-semibold px-3 py-2 rounded-full border transition",
                    role === r.id ? "bg-red-600 border-red-600 text-white" : cx(t.pill, t.textMuted))}>
                  {r.label}
                </button>
              ))}
            </div>
            {user ? (
              <button onClick={onSignOut}
                className="w-full text-xs font-semibold px-3 py-2 rounded-full border border-red-600 text-red-500">
                Chiqish ({user.email})
              </button>
            ) : (
              <button onClick={onOpenAuth}
                className="w-full text-xs font-semibold px-3 py-2 rounded-full bg-red-600 text-white">
                Kirish / Ro'yxatdan o'tish
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

function CategoryChips({ t, active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 mb-8 scrollbar-none">
      <button onClick={() => onSelect(null)}
        className={cx("shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition",
          active === null ? "bg-red-600 border-red-600 text-white" : cx(t.pill, t.textMuted))}>
        All Channels
      </button>
      {CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICON[cat.id];
        return (
          <button key={cat.id} onClick={() => onSelect(cat.id)}
            className={cx("shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition",
              active === cat.id ? "bg-red-600 border-red-600 text-white" : cx(t.pill, t.textMuted))}>
            <Icon className="w-3.5 h-3.5" /> {cat.label}
          </button>
        );
      })}
    </div>
  );
}
function HomeView({ t, now, followed, onToggleFollow, onOpen, category, setCategory, allChannels }) {
  const pool = category ? allChannels.filter((c) => c.category === category) : allChannels;
  const featured = pool.find((c) => c.featured) || pool[0];
  const trending = pool.filter((c) => c.trending);
  const fresh = pool.filter((c) => c.isNew);
  const recommended = [...pool].sort((a, b) => b.followers - a.followers).slice(0, 5);

  if (!pool.length) {
    return <div className={cx("text-center py-24", t.textMuted)}>No channels in this category yet.</div>;
  }

  return (
    <div>
      <CategoryChips t={t} active={category} onSelect={setCategory} />

      {featured && (
        <section className="mb-10">
          <div className={cx("rounded-2xl border overflow-hidden grid md:grid-cols-2", t.border, t.surface)}>
            <div className="p-6 sm:p-8 flex flex-col justify-center">
              <span className="text-[10px] tracking-widest font-bold text-red-500 mb-2">FEATURED CHANNEL</span>
              <div className="flex items-center gap-2 mb-2">
                <ChNoBadge chNo={featured.chNo} t={t} />
                <LiveDot /><span className={cx("text-[11px] font-semibold", t.textMuted)}>ON AIR</span>
              </div>
              <h1 className={cx("font-display text-4xl sm:text-5xl leading-tight", t.text)}>{featured.name}</h1>
              <p className={cx("mt-2 text-sm", t.textMuted)}>{featured.tagline}</p>
              <div className="flex gap-2 mt-5">
                <button onClick={() => onOpen(featured.id)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition">
                  <Play className="w-4 h-4" fill="white" /> Watch Live
                </button>
                <button onClick={() => onToggleFollow(featured.id)}
                  className={cx("flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border transition", t.border, t.surfaceHover, t.text)}>
                  <Heart className="w-4 h-4" fill={followed.has(featured.id) ? "currentColor" : "none"} />
                  {followed.has(featured.id) ? "Following" : "Follow"}
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6 flex items-center">
              <ChannelScreen big channel={{ ...featured, currentTitle: getNowInfo(featured.schedule, now).current.title }} t={t} />
            </div>
          </div>
        </section>
      )}

      <AdBanner t={t} />

      <SectionRow title="Trending Now" icon={TrendingUp} channels={trending} now={now} followed={followed} onToggleFollow={onToggleFollow} onOpen={onOpen} t={t} />
      <SectionRow title="New Channels" icon={Sparkles} channels={fresh} now={now} followed={followed} onToggleFollow={onToggleFollow} onOpen={onOpen} t={t} />
      <SectionRow title="Recommended For You" icon={Zap} channels={recommended} now={now} followed={followed} onToggleFollow={onToggleFollow} onOpen={onOpen} t={t} />
      <SectionRow title="All Channels" icon={Tv} channels={pool} now={now} followed={followed} onToggleFollow={onToggleFollow} onOpen={onOpen} t={t} />
    </div>
  );
}

function SearchView({ t, query, results, now, followed, onToggleFollow, onOpen }) {
  return (
    <div>
      <p className={cx("text-sm mb-6", t.textMuted)}>
        {results.length} result{results.length !== 1 ? "s" : ""} for <span className={t.text}>&ldquo;{query}&rdquo;</span>
      </p>
      {results.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((c) => (
            <ChannelCard key={c.id} channel={c} now={now} followed={followed} onToggleFollow={onToggleFollow} onOpen={onOpen} t={t} />
          ))}
        </div>
      ) : (
        <div className={cx("text-center py-24", t.textMuted)}>No channels match your search.</div>
      )}
    </div>
  );
}

function ChannelView({ t, channel, now, followed, onToggleFollow, allChannels, onOpen }) {
  const [tab, setTab] = useState("schedule");
  if (!channel) return <div className={cx("text-center py-24", t.textMuted)}>Channel not found.</div>;
  const info = getNowInfo(channel.schedule, now);
  const related = allChannels.filter((c) => c.category === channel.category && c.id !== channel.id).slice(0, 5);
  const isFollowed = followed.has(channel.id);
  const Icon = CATEGORY_ICON[channel.category];

  return (
    <div>
      <ChannelScreen big channel={{ ...channel, currentTitle: info.current.title }} t={t} />

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mt-5">
        <div className="flex items-start gap-3">
          <div className={cx("w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 font-display text-xl text-white", channel.grad[0], channel.grad[1])}>
            {channel.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={cx("font-display text-3xl", t.text)}>{channel.name}</h1>
              <ChNoBadge chNo={channel.chNo} t={t} />
            </div>
            <p className={cx("text-sm mt-0.5", t.textMuted)}>{channel.tagline}</p>
            <div className={cx("flex items-center gap-3 mt-1.5 text-xs", t.textFaint)}>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{formatCount(channel.viewersBase)} watching</span>
              <span>{formatCount(channel.followers)} followers</span>
            </div>
          </div>
        </div>
        <button onClick={() => onToggleFollow(channel.id)}
          className={cx("flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border transition shrink-0",
            isFollowed ? "bg-red-600 border-red-600 text-white" : cx(t.border, t.surfaceHover, t.text))}>
          <Heart className="w-4 h-4" fill={isFollowed ? "currentColor" : "none"} />
          {isFollowed ? "Following" : "Follow"}
        </button>
      </div>

      <div className={cx("mt-6 rounded-xl border p-4", t.border, t.surface)}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-red-500">ON NOW</span>
            <p className={cx("font-display text-xl", t.text)}>{info.current.title}</p>
          </div>
          <div className="text-right">
            <span className={cx("text-xs", t.textMuted)}>up next</span>
            <p className={cx("text-sm font-semibold", t.text)}>{info.next.title}</p>
          </div>
        </div>
        <div className={cx("h-1.5 rounded-full overflow-hidden", t.border, "border bg-black/10")}>
          <div className="h-full bg-red-600" style={{ width: `${info.progress}%` }} />
        </div>
        <p className={cx("text-[11px] mt-1.5", t.textFaint)}>{info.minutesLeft} min remaining in this program</p>
      </div>

      <div className="flex gap-2 mt-8 mb-4">
        {["schedule", "about"].map((tb) => (
          <button key={tb} onClick={() => setTab(tb)}
            className={cx("text-xs font-semibold px-4 py-1.5 rounded-full border capitalize transition",
              tab === tb ? "bg-red-600 border-red-600 text-white" : cx(t.pill, t.textMuted))}>
            {tb}
          </button>
        ))}
      </div>

      {tab === "schedule" ? (
        <div className={cx("rounded-xl border divide-y", t.border, t.surface)}>
          {channel.schedule.map((slot, i) => {
            const isNow = i === info.currentIdx;
            return (
              <div key={i} className={cx("flex items-center gap-4 px-4 py-3", isNow && "bg-red-600/10")}>
                <span className={cx("font-mono text-xs w-14 shrink-0", isNow ? "text-red-500 font-bold" : t.textMuted)}>{slot.time}</span>
                <span className={cx("text-sm flex-1", isNow ? cx(t.text, "font-semibold") : t.textMuted)}>{slot.title}</span>
                {isNow && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 shrink-0">
                    <LiveDot size="w-1 h-1" /> ON NOW
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className={cx("rounded-xl border p-5", t.border, t.surface)}>
          <p className={cx("text-sm leading-relaxed", t.textMuted)}>{channel.desc}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            <div>
              <span className={cx("text-[11px]", t.textFaint)}>Category</span>
              <p className={cx("text-sm font-semibold flex items-center gap-1.5 mt-0.5", t.text)}>
                <Icon className="w-3.5 h-3.5 text-red-500" />
                {CATEGORIES.find((c) => c.id === channel.category)?.label}
              </p>
            </div>
            <div>
              <span className={cx("text-[11px]", t.textFaint)}>Owner</span>
              <p className={cx("text-sm font-semibold mt-0.5", t.text)}>{channel.owner}</p>
            </div>
            <div>
              <span className={cx("text-[11px]", t.textFaint)}>Followers</span>
              <p className={cx("text-sm font-semibold mt-0.5", t.text)}>{formatCount(channel.followers)}</p>
            </div>
            <div>
              <span className={cx("text-[11px]", t.textFaint)}>Avg. Viewers</span>
              <p className={cx("text-sm font-semibold mt-0.5", t.text)}>{formatCount(channel.viewersBase)}</p>
            </div>
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-10">
          <SectionRow title={`More in ${CATEGORIES.find((c) => c.id === channel.category)?.label}`} channels={related} now={now} followed={followed} onToggleFollow={onToggleFollow} onOpen={onOpen} t={t} />
        </div>
      )}
    </div>
    );
}

/* ============================== OWNER DASHBOARD ============================== */

function OwnerDashboard({ t, isDark, ownedChannels, now, addChannel }) {
  const [selectedId, setSelectedId] = useState(ownedChannels[0]?.id || null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", category: "movies", tagline: "" });
  const [scheduleEdits, setScheduleEdits] = useState({});

  const selected = ownedChannels.find((c) => c.id === selectedId) || ownedChannels[0];
  const schedule = scheduleEdits[selected?.id] || selected?.schedule || [];

  function moveItem(idx, dir) {
    const arr = [...schedule];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setScheduleEdits((s) => ({ ...s, [selected.id]: arr }));
  }
  function removeItem(idx) {
    const arr = schedule.filter((_, i) => i !== idx);
    setScheduleEdits((s) => ({ ...s, [selected.id]: arr }));
  }

  const weekViews = useMemo(() => {
    if (!selected) return [];
    return Array.from({ length: 7 }, (_, i) => Math.round(selected.viewersBase * (10 + i * 1.3 + (i % 3))));
  }, [selected]);
  const maxView = Math.max(...weekViews, 1);
  const dailyRevenue = selected ? (selected.followers * 0.0004 + selected.viewersBase * 0.006).toFixed(2) : "0.00";

  function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    addChannel({ ...form });
    setForm({ name: "", category: "movies", tagline: "" });
    setShowCreate(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className={cx("font-display text-3xl", t.text)}>Channel Owner Dashboard</h1>
          <p className={cx("text-sm", t.textMuted)}>Manage your channels, schedules and revenue.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2.5 rounded-full transition">
          <Plus className="w-4 h-4" /> Create Channel
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className={cx("rounded-xl border p-5 mb-8 grid sm:grid-cols-3 gap-4", t.border, t.surface)}>
          <div className="sm:col-span-1">
            <label className={cx("text-xs font-semibold", t.textMuted)}>Channel name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={cx("w-full mt-1 text-sm rounded-lg px-3 py-2 border outline-none focus:border-red-500", t.input)} placeholder="e.g. Midnight Signal" />
          </div>
          <div>
            <label className={cx("text-xs font-semibold", t.textMuted)}>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={cx("w-full mt-1 text-sm rounded-lg px-3 py-2 border outline-none focus:border-red-500", t.input)}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={cx("text-xs font-semibold", t.textMuted)}>Tagline</label>
            <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className={cx("w-full mt-1 text-sm rounded-lg px-3 py-2 border outline-none focus:border-red-500", t.input)} placeholder="Short description" />
          </div>
          <div className="sm:col-span-3 flex gap-2">
            <div className={cx("flex-1 flex items-center gap-2 text-xs rounded-lg border px-3 py-2", t.border, t.textFaint)}>
              <Upload className="w-3.5 h-3.5" /> Logo & banner upload (demo — no file needed)
            </div>
            <button type="submit" className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition">
              Launch Channel
            </button>
          </div>
        </form>
      )}

      {!selected ? (
        <div className={cx("text-center py-24", t.textMuted)}>You don't own any channels yet — create one to get started.</div>
      ) : (
        <>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {ownedChannels.map((c) => (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className={cx("shrink-0 flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border transition",
                  selected.id === c.id ? "bg-red-600 border-red-600 text-white" : cx(t.pill, t.textMuted))}>
                <ChNoBadge chNo={c.chNo} t={selected.id === c.id ? { border: "border-white/40", textMuted: "text-white" } : t} /> {c.name}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Eye} label="Total Views" value={formatCount(selected.viewersBase * 340)} sub="last 30 days" t={t} />
            <StatCard icon={Users} label="Followers" value={formatCount(selected.followers)} sub="+2.4% this week" t={t} />
            <StatCard icon={Clock} label="Watch Time" value={formatCount(selected.viewersBase * 18) + " hrs"} sub="last 30 days" t={t} />
            <StatCard icon={DollarSign} label="Ad Revenue" value={"$" + dailyRevenue} sub="estimated / day" t={t} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className={cx("rounded-xl border p-5", t.border, t.surface)}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-red-500" />
                <h3 className={cx("font-display text-lg", t.text)}>Views — Last 7 Days</h3>
              </div>
              <div className="flex items-end gap-2.5 h-36">
                {weekViews.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full bg-red-600/80 hover:bg-red-500 rounded-t transition" style={{ height: `${(v / maxView) * 100}%` }} />
                    <span className={cx("text-[10px]", t.textFaint)}>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={cx("rounded-xl border p-5", t.border, t.surface)}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-red-500" />
                  <h3 className={cx("font-display text-lg", t.text)}>Broadcast Schedule</h3>
                </div>
                {scheduleEdits[selected.id] && (
                  <button onClick={() => setScheduleEdits((s) => ({ ...s, [selected.id]: undefined }))}
                    className={cx("flex items-center gap-1 text-[11px]", t.textMuted)}>
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {schedule.map((slot, i) => (
                  <div key={i} className={cx("flex items-center gap-2 rounded-lg border px-3 py-2", t.border)}>
                    <span className={cx("font-mono text-xs w-12 shrink-0", t.textMuted)}>{slot.time}</span>
                    <span className={cx("text-sm flex-1 truncate", t.text)}>{slot.title}</span>
                    <button onClick={() => moveItem(i, -1)} className={cx("p-1 rounded", t.surfaceHover, t.textFaint)}><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveItem(i, 1)} className={cx("p-1 rounded", t.surfaceHover, t.textFaint)}><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeItem(i)} className={cx("p-1 rounded hover:text-red-500", t.surfaceHover, t.textFaint)}><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <button className={cx("w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border", t.border, t.surfaceHover, t.textMuted)}>
                <Upload className="w-3.5 h-3.5" /> Upload video & add to schedule
              </button>
            </div>
            </div>
        </>
      )}
    </div>
  );
}

/* ============================== ADMIN PANEL ============================== */

function AdminPanel({ t, allChannels, removedIds, setRemovedIds, adsState, setAdsState }) {
  const totalUsers = ADMIN_USERS.length;
  const totalChannels = allChannels.length - removedIds.size;
  const totalWatchHours = allChannels.reduce((s, c) => s + c.viewersBase, 0) * 24 / 1000;
  const totalRevenue = allChannels.reduce((s, c) => s + c.followers * 0.0004 + c.viewersBase * 0.006, 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-5 h-5 text-red-500" />
        <h1 className={cx("font-display text-3xl", t.text)}>Admin Panel</h1>
      </div>
      <p className={cx("text-sm mb-6", t.textMuted)}>Platform-wide oversight of users, channels and advertising.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={formatCount(totalUsers * 18400)} sub={`${totalUsers} sampled`} t={t} />
        <StatCard icon={Tv} label="Total Channels" value={totalChannels} sub={`${removedIds.size} removed`} t={t} />
        <StatCard icon={Clock} label="Watch Hours" value={formatCount(Math.round(totalWatchHours)) + "K"} sub="last 30 days" t={t} />
        <StatCard icon={DollarSign} label="Platform Revenue" value={"$" + formatCount(Math.round(totalRevenue * 30))} sub="estimated / month" t={t} />
      </div>

      <div className={cx("rounded-xl border mb-8 overflow-hidden", t.border, t.surface)}>
        <div className="px-5 py-3 border-b">
          <h3 className={cx("font-display text-lg", t.text)}>Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cx("text-left text-[11px] uppercase tracking-wide", t.textFaint)}>
                <th className="px-5 py-2 font-semibold">Name</th>
                <th className="px-5 py-2 font-semibold">Email</th>
                <th className="px-5 py-2 font-semibold">Role</th>
                <th className="px-5 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_USERS.map((u) => (
                <tr key={u.id} className={cx("border-t", t.border)}>
                  <td className={cx("px-5 py-2.5 font-medium", t.text)}>{u.name}</td>
                  <td className={cx("px-5 py-2.5", t.textMuted)}>{u.email}</td>
                  <td className={cx("px-5 py-2.5", t.textMuted)}>{u.role}</td>
                  <td className="px-5 py-2.5">
                    <span className={cx("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      u.status === "Active" ? "bg-emerald-500/15 text-emerald-500" :
                      u.status === "Suspended" ? "bg-red-500/15 text-red-500" : "bg-amber-500/15 text-amber-500")}>
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cx("rounded-xl border mb-8 overflow-hidden", t.border, t.surface)}>
        <div className="px-5 py-3 border-b">
          <h3 className={cx("font-display text-lg", t.text)}>Channels</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cx("text-left text-[11px] uppercase tracking-wide", t.textFaint)}>
                <th className="px-5 py-2 font-semibold">Channel</th>
                <th className="px-5 py-2 font-semibold">Category</th>
                <th className="px-5 py-2 font-semibold">Followers</th>
                <th className="px-5 py-2 font-semibold">Status</th>
                <th className="px-5 py-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {allChannels.map((c) => {
                const removed = removedIds.has(c.id);
                return (
                  <tr key={c.id} className={cx("border-t", t.border)}>
                    <td className={cx("px-5 py-2.5 font-medium", t.text)}>CH {c.chNo} · {c.name}</td>
                    <td className={cx("px-5 py-2.5 capitalize", t.textMuted)}>{c.category}</td>
                    <td className={cx("px-5 py-2.5", t.textMuted)}>{formatCount(c.followers)}</td>
                    <td className="px-5 py-2.5">
                      <span className={cx("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                        removed ? "bg-red-500/15 text-red-500" : "bg-emerald-500/15 text-emerald-500")}>
                        {removed ? "Removed" : "Live"}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <button
                        onClick={() => setRemovedIds((s) => {
                          const next = new Set(s);
                          removed ? next.delete(c.id) : next.add(c.id);
                          return next;
                        })}
                        className={cx("text-[11px] font-semibold px-3 py-1 rounded-full border transition",
                          removed ? "border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10" : "border-red-500/40 text-red-500 hover:bg-red-500/10")}>
                        {removed ? "Restore" : "Remove"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className={cx("rounded-xl border overflow-hidden", t.border, t.surface)}>
        <div className="px-5 py-3 border-b">
          <h3 className={cx("font-display text-lg", t.text)}>Advertisements</h3>
        </div>
        <div className="divide-y">
          {adsState.map((ad) => (
            <div key={ad.id} className={cx("flex items-center justify-between px-5 py-3", t.border)}>
              <div>
                <p className={cx("text-sm font-semibold", t.text)}>{ad.title}</p>
                <p className={cx("text-xs", t.textFaint)}>{ad.subtitle} · {formatCount(ad.id * 84210)} impressions</p>
              </div>
              <button
                onClick={() => setAdsState((prev) => prev.map((a) => a.id === ad.id ? { ...a, active: !a.active } : a))}
                className={cx("flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition",
                  ad.active ? "border-emerald-500/40 text-emerald-500" : "border-zinc-500/40 text-zinc-500")}>
                {ad.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {ad.active ? "Active" : "Paused"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== APP ============================== */

export default function TeleCastApp() {
  const [isDark, setIsDark] = useState(true);
  const [view, setView] = useState("home");
  const [role, setRole] = useState("viewer");
  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [followed, setFollowed] = useState(new Set(["full-court", "wire-report"]));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [createdChannels, setCreatedChannels] = useState([]);
  const [removedIds, setRemovedIds] = useState(new Set());
  const [adsState, setAdsState] = useState(ADS.map((a) => ({ ...a, active: true })));
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  function handleSignOut() {
    supabase.auth.signOut();
  }

  const t = getTheme(isDark);

  const allChannels = useMemo(() => {
    const created = createdChannels.map((c, i) => ({
      id: `custom-${i}-${c.name.toLowerCase().replace(/\s+/g, "-")}`,
      chNo: 800 + i,
      name: c.name,
      category: c.category,
      tagline: c.tagline || "A brand new TeleCast channel.",
      followers: 0,
      viewersBase: Math.floor(Math.random() * 40) + 5,
      owner: "You",
      desc: `${c.name} just launched on TeleCast. ${c.tagline || ""}`,
      grad: ["from-red-900", "to-zinc-950"],
      isNew: true,
      isLive: true,
      schedule: buildSchedule(c.category, i % 3),
      isMine: true,
    }));
    return [...CHANNELS, ...created].filter((c) => !removedIds.has(c.id));
  }, [createdChannels, removedIds]);

  const ownedChannels = allChannels.filter((c) => MY_CHANNEL_IDS.includes(c.id) || c.isMine);

  function toggleFollow(id) {
    setFollowed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openChannel(id) {
    setSelectedChannelId(id);
    setView("channel");
    window.scrollTo?.({ top: 0, behavior: "smooth" });
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setSearchTerm(query);
    setView("search");
  }

  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return allChannels.filter((c) =>
      c.name.toLowerCase().includes(q) || c.category.includes(q) || c.tagline.toLowerCase().includes(q));
  }, [searchTerm, allChannels]);

  const selectedChannel = allChannels.find((c) => c.id === selectedChannelId);

  return (
    <div className={cx("min-h-screen font-body transition-colors", t.bg, t.text)}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Bebas Neue', 'Inter', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
        .font-mono, .font-mono * { font-family: 'JetBrains Mono', monospace; }
        @keyframes screenshift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-screenshift { background-size: 200% 200%; animation: screenshift 9s ease-in-out infinite; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 32s linear infinite; width: max-content; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        * { scroll-behavior: smooth; }
      `}</style>

      <TopNav
        t={t} isDark={isDark} setIsDark={setIsDark}
        view={view} setView={setView} role={role} setRole={setRole}
        query={query} setQuery={setQuery} onSearchSubmit={handleSearchSubmit}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        user={user} onOpenAuth={() => setShowAuth(true)} onSignOut={handleSignOut}
      />

      {showAuth && <AuthModal t={t} onClose={() => setShowAuth(false)} />}

      {view === "home" && <Ticker channels={allChannels} now={now} t={t} />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === "home" && (
          <HomeView t={t} now={now} followed={followed} onToggleFollow={toggleFollow} onOpen={openChannel}
            category={category} setCategory={setCategory} allChannels={allChannels} />
        )}
        {view === "search" && (
          <SearchView t={t} query={searchTerm} results={searchResults} now={now} followed={followed} onToggleFollow={toggleFollow} onOpen={openChannel} />
        )}
        {view === "channel" && (
          <ChannelView t={t} channel={selectedChannel} now={now} followed={followed} onToggleFollow={toggleFollow} allChannels={allChannels} onOpen={openChannel} />
        )}
        {view === "dashboard" && (
          <OwnerDashboard t={t} isDark={isDark} ownedChannels={ownedChannels} now={now}
            addChannel={(c) => { setCreatedChannels((prev) => [...prev, c]); }} />
        )}
        {view === "admin" && (
          <AdminPanel t={t} allChannels={[...CHANNELS, ...createdChannels.map((c, i) => ({
            id: `custom-${i}-${c.name.toLowerCase().replace(/\s+/g, "-")}`, chNo: 800 + i, name: c.name,
            category: c.category, followers: 0, viewersBase: 10, owner: "You",
          }))]} removedIds={removedIds} setRemovedIds={setRemovedIds} adsState={adsState} setAdsState={setAdsState} />
        )}
      </main>

      <footer className={cx("border-t mt-12", t.border)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Antenna className="w-4 h-4 text-red-500" />
            <span className={cx("font-display text-lg", t.text)}>TeleCast</span>
          </div>
          <p className={cx("text-xs", t.textFaint)}>Channels play on their own schedule — just tune in. Demo build with sample data.</p>
        </div>
      </footer>
    </div>
  );
      }
