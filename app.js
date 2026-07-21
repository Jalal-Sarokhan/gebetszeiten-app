/* ============================================================
   Gebetszeiten – App-Logik (Vanilla, kein Build-Schritt)
   ============================================================ */

"use strict";

/* ---------- Konstanten ---------- */
const CSV_BASE = "https://raw.githubusercontent.com/Jalal-Sarokhan/csv/refs/heads/main/gebetszeiten_";
const LOCAL_FALLBACK_CSV = "gebetszeiten_2025.csv";
const LS = { theme: "gz-theme", lang: "gz-lang", csv: (y) => `gz-csv-${y}` };

const ICONS = {
    Fajr:    '<path d="M3 18h18M12 3v3M5.6 8.6l2 2M18.4 8.6l-2 2M7 18a5 5 0 0 1 10 0"/>',
    Shuruq:  '<path d="M3 18h18M12 8v-5M5 11l1.5 1.5M19 11l-1.5 1.5M8 18a4 4 0 0 1 8 0M2 22h20"/>',
    Zuhr:    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
    Asr:     '<path d="M17 18a5 5 0 0 0-10 0M12 5V3M5 12H3M6 6 4.5 4.5M21 12h-2M18 6l1.5-1.5M3 18h18M4 22h16"/>',
    Maghrib: '<path d="M3 18h18M12 14v-4M8 18a4 4 0 0 1 8 0M2 22h20M6 10l1.5 1.5M18 10l-1.5 1.5"/>',
    Isha:    '<path d="M20 14.5A7 7 0 1 1 9.5 4a5.5 5.5 0 0 0 10.5 10.5Z"/><path d="M16 4l.6 1.4L18 6l-1.4.6L16 8l-.6-1.4L14 6l1.4-.6Z"/>'
};

const SVG_SUN = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>';
const SVG_MOON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A7 7 0 1 1 9.5 4a5.5 5.5 0 0 0 10.5 10.5Z"/></svg>';
const SVG_EXPAND = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M16 21h3a2 2 0 0 0 2-2v-3M8 21H5a2 2 0 0 1-2-2v-3"/></svg>';
const SVG_COMPRESS = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3M16 3v3a2 2 0 0 0 2 2h3M16 21v-3a2 2 0 0 1 2-2h3M8 21v-3a2 2 0 0 0-2-2H3"/></svg>';

const PRAYERS = [
    { key: "Fajr",    ar: "الفجر",  azan: true  },
    { key: "Shuruq",  ar: "الشروق", azan: false },
    { key: "Zuhr",    ar: "الظهر",  azan: true  },
    { key: "Asr",     ar: "العصر",  azan: true  },
    { key: "Maghrib", ar: "المغرب", azan: true  },
    { key: "Isha",    ar: "العشاء", azan: true  }
];

const T = {
    de: {
        mosqueName: "Othman-bin-Affan-Moschee", city: "Ludwigshafen am Rhein",
        nextPrayer: "Nächstes Gebet", remaining: "verbleibende Zeit",
        loading: "Gebetszeiten werden geladen…",
        loadError: "Gebetszeiten konnten nicht geladen werden.", retry: "Erneut versuchen",
        enableAzan: "Azan aktivieren", azanOn: "Azan aktiv",
        audioHint: "Einmal aktivieren, damit der Azan bei geöffneter Seite ertönt.",
        dataSource: "Zeiten: Othman-bin-Affan-Moschee, Ludwigshafen",
        prayerTime: (p) => `Es ist Zeit für ${p}.`,
        de: { Fajr: "Morgengebet", Shuruq: "Sonnenaufgang", Zuhr: "Mittagsgebet", Asr: "Nachmittagsgebet", Maghrib: "Abendgebet", Isha: "Nachtgebet" },
        allTimes: "Alle Zeiten", allTimesTitle: "Alle Gebetszeiten", today: "heute",
        jumua: "Freitagsgebet (Jumua)", winter: "Winterzeit", summer: "Sommerzeit",
        androidApp: "Android-App herunterladen",
        badge: "jetzt", statusLive: "aktuell", statusCached: "gespeichert", statusOffline: "offline",
        locale: "de-DE", langLabel: "عربي"
    },
    ar: {
        mosqueName: "مسجد عثمان بن عفان", city: "لودفيغسهافن",
        nextPrayer: "الصلاة القادمة", remaining: "الوقت المتبقّي",
        loading: "جارٍ تحميل مواقيت الصلاة…",
        loadError: "تعذّر تحميل مواقيت الصلاة.", retry: "إعادة المحاولة",
        enableAzan: "تفعيل الأذان", azanOn: "الأذان مُفعَّل",
        audioHint: "فعّله مرة واحدة ليُسمَع الأذان عند فتح الصفحة.",
        dataSource: "المواقيت: مسجد عثمان بن عفان، لودفيغسهافن",
        prayerTime: (p) => `حان وقت صلاة ${p}.`,
        de: { Fajr: "الفجر", Shuruq: "الشروق", Zuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" },
        allTimes: "كل الأوقات", allTimesTitle: "جميع مواقيت الصلاة", today: "اليوم",
        jumua: "صلاة الجمعة (الخطبة)", winter: "التوقيت الشتوي", summer: "التوقيت الصيفي",
        androidApp: "تحميل تطبيق أندرويد",
        badge: "الآن", statusLive: "محدّث", statusCached: "محفوظ", statusOffline: "دون اتصال",
        locale: "ar", langLabel: "DE"
    }
};

/* ---------- Zustand ---------- */
let times = {};                 // { "d.M.yyyy": {Fajr:"05:40", ...} }
let lang = localStorage.getItem(LS.lang) || "de";
let dataStatus = "";            // "live" | "cached" | "offline"
let audioUnlocked = false;
const fired = new Set();        // "d.M.yyyy Fajr" -> Azan bereits gefeuert

/* ---------- Hilfsfunktionen ---------- */
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

function normDate(str) {
    // "01.03.2025" / "1.3.2025 " / "1´.3.2025" -> "1.3.2025"
    const clean = String(str).replace(/[´'`\s]/g, "");
    const [d, m, y] = clean.split(".");
    return `${parseInt(d, 10)}.${parseInt(m, 10)}.${parseInt(y, 10)}`;
}

function todayKey(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    const header = lines[0].split(";").map((h) => h.trim());
    const map = {};
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(";");
        if (cells.length < header.length) continue;
        const row = {};
        header.forEach((h, j) => { row[h] = (cells[j] || "").trim(); });
        if (!row.Datum) continue;
        map[normDate(row.Datum)] = row; // last-wins bei Duplikaten
    }
    return map;
}

/* ---------- Daten laden (network-first, dann Cache, dann Fallback) ---------- */
async function loadTimes() {
    const year = new Date().getFullYear();
    showState("loading");
    try {
        const res = await fetch(`${CSV_BASE}${year}.csv`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        times = parseCsv(text);
        localStorage.setItem(LS.csv(year), text);
        dataStatus = "live";
    } catch (err) {
        const cached = localStorage.getItem(LS.csv(year));
        if (cached) {
            times = parseCsv(cached);
            dataStatus = "cached";
        } else {
            try {
                const res = await fetch(LOCAL_FALLBACK_CSV);
                times = parseCsv(await res.text());
                dataStatus = "offline";
            } catch (e) {
                showState("error");
                return;
            }
        }
    }
    if (!Object.keys(times).length) { showState("error"); return; }
    renderCards();
    tick();
    updateStatusLabel();
    if (location.hash === "#all") openAll();
}

function showState(which) {
    const grid = $("prayerGrid");
    grid.querySelectorAll(".card").forEach((c) => c.remove());
    $("loadingState").hidden = which !== "loading";
    $("errorState").hidden = which !== "error";
}

/* ---------- Rendering ---------- */
function renderCards() {
    const grid = $("prayerGrid");
    $("loadingState").hidden = true;
    $("errorState").hidden = true;
    grid.querySelectorAll(".card").forEach((c) => c.remove());

    const today = times[todayKey()] || {};
    const t = T[lang];
    for (const p of PRAYERS) {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.prayer = p.key;
        card.innerHTML = `
            <span class="card__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none"
                     stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[p.key]}</svg>
            </span>
            <span class="card__ar">${p.ar}</span>
            <span class="card__name">${p.key}</span>
            <span class="card__de">${t.de[p.key]}</span>
            <span class="card__time">${today[p.key] || "--:--"}</span>`;
        grid.appendChild(card);
    }
}

/* ---------- Uhr / Datum / nächstes Gebet ---------- */
function fmtDate(locale, opts) {
    try { return new Intl.DateTimeFormat(locale, opts).format(new Date()); }
    catch (e) { return ""; }
}

function buildTimeline() {
    // Zeitachse gestern-Isha -> heute (6) -> morgen-Fajr für prev/next & Fortschritt
    const items = [];
    const push = (offset, prayer, val) => {
        if (!val) return;
        const [h, m] = val.split(":").map(Number);
        const at = new Date();
        at.setDate(at.getDate() + offset);
        at.setHours(h, m, 0, 0);
        items.push({ prayer, time: val, at });
    };
    const y = times[todayKey(-1)], t = times[todayKey()], tm = times[todayKey(1)];
    if (y) push(-1, PRAYERS[5], y.Isha);
    if (t) for (const p of PRAYERS) push(0, p, t[p.key]);
    if (tm) push(1, PRAYERS[0], tm.Fajr);
    items.sort((a, b) => a.at - b.at);
    return items;
}

function getSegment(now) {
    let prev = null, next = null;
    for (const it of buildTimeline()) {
        if (it.at <= now) prev = it;
        else { next = it; break; }
    }
    return { prev, next };
}

function tick() {
    const now = new Date();
    const t = T[lang];

    $("currentTime").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    $("gregorianDate").textContent = fmtDate(t.locale, { weekday: "long", day: "numeric", month: "long" });
    $("hijriDate").textContent = fmtDate(`${t.locale}-u-ca-islamic-umalqura`, { day: "numeric", month: "long", year: "numeric" });

    const seg = getSegment(now);
    const next = seg.next;
    document.querySelectorAll(".card").forEach((c) => c.classList.remove("card--next", "card--passed"));

    // Fortschritt zwischen vorigem und nächstem Gebet
    const fill = $("progressFill");
    if (seg.prev && next) {
        const frac = (now - seg.prev.at) / (next.at - seg.prev.at);
        fill.style.width = `${Math.min(100, Math.max(0, frac * 100))}%`;
    } else {
        fill.style.width = "0%";
    }

    if (next) {
        const name = lang === "ar" ? next.prayer.ar : next.prayer.key;
        $("nextPrayerName").textContent = name;
        $("nextPrayerTime").textContent = next.time;

        let diff = Math.max(0, Math.floor((next.at - now) / 1000));
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        $("countdown").textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

        // Karten hervorheben / abblenden
        const today = times[todayKey()] || {};
        let reachedNext = false;
        document.querySelectorAll(".card").forEach((c) => {
            const key = c.dataset.prayer;
            if (key === next.prayer.key && !reachedNext) {
                c.classList.add("card--next");
                if (!c.querySelector(".card__badge")) {
                    const b = document.createElement("span");
                    b.className = "card__badge";
                    c.appendChild(b);
                }
                c.querySelector(".card__badge").textContent = t.badge;
                reachedNext = true;
            } else if (!reachedNext && today[key]) {
                c.classList.add("card--passed");
            }
        });
    }

    checkAzan(now);
}

/* ---------- Azan-Auslösung ---------- */
function checkAzan(now) {
    const dayKey = todayKey();
    const today = times[dayKey];
    if (!today) return;
    const hhmm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    for (const p of PRAYERS) {
        if (!p.azan) continue;
        const id = `${dayKey} ${p.key}`;
        if (today[p.key] === hhmm && !fired.has(id)) {
            fired.add(id);
            firePrayer(p);
        }
    }
}

function firePrayer(p) {
    const t = T[lang];
    const name = lang === "ar" ? p.ar : p.key;
    const msg = t.prayerTime(name);

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(t.mosqueName, { body: msg, icon: "icon.png" });
    }
    const banner = $("prayerBanner");
    banner.textContent = msg;
    banner.hidden = false;
    setTimeout(() => { banner.hidden = true; }, 60000);

    const audio = $("azanAudio");
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

/* ---------- Alle Zeiten (Ganzjahr) ---------- */
function parseKey(k) {
    const [d, m, y] = k.split(".").map(Number);
    return new Date(y, m - 1, d);
}

function renderAllTimes() {
    const t = T[lang];
    const todayK = todayKey();
    const keys = Object.keys(times).sort((a, b) => parseKey(a) - parseKey(b));
    const monthFmt = new Intl.DateTimeFormat(t.locale, { month: "long", year: "numeric" });
    const dowFmt = new Intl.DateTimeFormat(t.locale, { weekday: "short" });
    const numFmt = new Intl.DateTimeFormat(t.locale, { day: "2-digit", month: "2-digit" });

    let html = "";
    let curMonth = "";
    for (const k of keys) {
        const d = parseKey(k);
        const month = monthFmt.format(d);
        if (month !== curMonth) { html += `<div class="month">${month}</div>`; curMonth = month; }
        const isToday = k === todayK;
        const row = times[k];
        const chips = PRAYERS.map((p) =>
            `<span class="tchip"><b>${lang === "ar" ? p.ar : p.key}</b><span>${row[p.key] || "--:--"}</span></span>`
        ).join("");
        html += `<div class="day${isToday ? " day--today" : ""}"${isToday ? ' id="allToday"' : ""}>
            <div class="day__head">
                <div class="day__date"><span class="day__dow">${dowFmt.format(d)}</span><span class="day__num">${numFmt.format(d)}</span></div>
                ${isToday ? `<span class="day__badge">${t.today}</span>` : ""}
            </div>
            <div class="day__times">${chips}</div>
        </div>`;
    }
    $("allBody").innerHTML = html;
}

function openAll() {
    if (!Object.keys(times).length) return;
    renderAllTimes();
    $("allModal").hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
        const el = $("allToday");
        if (el) el.scrollIntoView({ block: "center" });
    });
}

function closeAll() {
    $("allModal").hidden = true;
    document.body.style.overflow = "";
}

/* ---------- Sprache & Theme ---------- */
function applyLang() {
    const t = T[lang];
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.dataset.i18n;
        if (t[key]) el.textContent = t[key];
    });
    $("langLabel").textContent = t.langLabel;
    updateStatusLabel();
    if (Object.keys(times).length) { renderCards(); tick(); }
    if (!$("allModal").hidden) renderAllTimes();
}

function updateStatusLabel() {
    const t = T[lang];
    const map = { live: t.statusLive, cached: t.statusCached, offline: t.statusOffline };
    $("dataStatus").textContent = map[dataStatus] ? `· ${map[dataStatus]}` : "";
}

function applyTheme(theme) {
    if (theme) document.documentElement.setAttribute("data-theme", theme);
    const dark = document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    $("themeToggle").innerHTML = dark ? SVG_SUN : SVG_MOON;
}

/* ---------- Audio freischalten ---------- */
function enableAudio() {
    const audio = $("azanAudio");
    audio.play().then(() => {
        setTimeout(() => { audio.pause(); audio.currentTime = 0; }, 2500);
        audioUnlocked = true;
        const btn = $("enableAudio");
        btn.classList.add("is-active");
        btn.querySelector("[data-i18n]").textContent = T[lang].azanOn;
    }).catch(() => {});

    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
}

/* ---------- Vollbild (TV/Kiosk) ---------- */
function updateFsIcon() {
    $("fsToggle").innerHTML = document.fullscreenElement ? SVG_COMPRESS : SVG_EXPAND;
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        const el = document.documentElement;
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) { try { req.call(el); } catch (e) {} }
    } else {
        (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
}

/* ---------- Jumua-Saison (Sommer-/Winterzeit) hervorheben ---------- */
function markSeason() {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
    const summer = now.getTimezoneOffset() < Math.max(jan, jul);
    $("jWinter").classList.toggle("jtime--active", !summer);
    $("jSummer").classList.toggle("jtime--active", summer);
}

/* ---------- Init ---------- */
function init() {
    applyTheme(localStorage.getItem(LS.theme));
    applyLang();
    markSeason();

    $("themeToggle").addEventListener("click", () => {
        const dark = document.documentElement.getAttribute("data-theme") === "dark" ||
            (!document.documentElement.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
        const next = dark ? "light" : "dark";
        localStorage.setItem(LS.theme, next);
        applyTheme(next);
    });

    $("langToggle").addEventListener("click", () => {
        lang = lang === "de" ? "ar" : "de";
        localStorage.setItem(LS.lang, lang);
        applyLang();
    });

    $("enableAudio").addEventListener("click", enableAudio);
    $("retryBtn").addEventListener("click", loadTimes);

    if (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen) {
        $("fsToggle").addEventListener("click", toggleFullscreen);
        document.addEventListener("fullscreenchange", updateFsIcon);
        document.addEventListener("webkitfullscreenchange", updateFsIcon);
        updateFsIcon();
    } else {
        $("fsToggle").hidden = true;
    }

    $("showAll").addEventListener("click", openAll);
    $("allModal").querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeAll));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });

    loadTimes();
    setInterval(tick, 1000);
    updateStatusLabel();
}

document.addEventListener("DOMContentLoaded", init);
