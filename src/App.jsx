import React, { useState, useEffect, useMemo, useRef } from "react";
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
}

/* ============================== SMALL PIECES ============================== */

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

/* ============================== NAV ============================== */

function TopNav({ t, isDark, setIsDark, view, setView, role, setRole, query, setQuery, onSearchSubmit, mobileOpen, setMobileOpen }) {
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
          </fo
