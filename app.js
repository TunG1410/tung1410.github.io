/* =========================================================
   NEURAL-LINK v3 // giao diện "Hoàng hôn neon": cảnh 3D, hiệu ứng,
   HUD và nội dung cho mọi trang.
   Bạn không cần sửa file này — thông tin cá nhân nằm trong data.js
   ========================================================= */
function NL_MAIN(){
  "use strict";
  // bản nháp từ chế độ chỉnh sửa (chỉ có trên máy của chủ trang) thay cho data.js khi đang bật xem nháp
  const PV = window.NL_PREVIEW && window.NL_PREVIEW.profile;
  if (!PV && typeof PROFILE === "undefined"){ document.getElementById("main").innerHTML = '<p style="padding:140px 24px;text-align:center;font:16px/1.6 system-ui;color:#F7F3FF">Không đọc được file <b>data.js</b>. Hãy kiểm tra lại dấu ngoặc kép, dấu phẩy trong file (xem mục "Gỡ lỗi" trong hướng dẫn).</p>'; return; }
  const P = PV || PROFILE;
  // dữ liệu thiếu trường nào thì dùng giá trị rỗng để trang không bị lỗi
  P.name = String(P.name || "Tên của bạn"); P.codename = String(P.codename || "").trim(); P.role = String(P.role || ""); P.tagline = P.tagline || ""; P.about = P.about || "";
  P.level = +P.level || 0;
  ["skills","tools","games","quests","contacts"].forEach(k => { if (!Array.isArray(P[k])) P[k] = []; });
  P.skills = P.skills.filter(Boolean).map(s => ({ name: String(s.name || ""), level: Math.max(0, Math.min(10, +s.level || 0)) }));
  P.tools = P.tools.filter(Boolean).map(String);
  P.contacts = P.contacts.filter(c => c && c.url).map(c => ({ label: String(c.label || c.url), value: String(c.value || c.url), url: String(c.url) }));
  P.quests = P.quests.filter(Boolean);
  const games = P.games.filter(Boolean).map(g => ({ ...g, title: String(g.title || "Game chưa đặt tên"), genres: Array.isArray(g.genres) ? g.genres : [], features: Array.isArray(g.features) ? g.features : [], screenshots: Array.isArray(g.screenshots) ? g.screenshots.filter(Boolean) : [] }));
  const PAGE = document.body.dataset.page || "home";
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const lerp = (a,b,t) => a + (b - a)*t;
  const pad = (n, k = 2) => String(n).padStart(k, "0");
  // Hiệu ứng luôn bật mặc định (kể cả khi máy đặt "giảm chuyển động"); người xem tắt bằng nút FX trên HUD
  const reduce = document.documentElement.classList.contains("fx-off");
  // máy yếu (ít nhân CPU / ít RAM / bật tiết kiệm dữ liệu): tự giảm hiệu ứng nền để trang mượt hơn
  const lite = !reduce && ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4 || !!(navigator.connection && navigator.connection.saveData));
  if (lite) document.documentElement.classList.add("lite");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const ss = { get(k){ try { return sessionStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { sessionStorage.setItem(k,v); } catch(e){} }, del(k){ try { sessionStorage.removeItem(k); } catch(e){} } };
  const ls = { get(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch(e){} } };
  const getSet = k => { try { return new Set(JSON.parse(ss.get(k) || "[]")); } catch(e){ return new Set(); } };
  const putSet = (k, s) => ss.set(k, JSON.stringify([...s]));
  const initials = n => (n.trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(-2).join("") || "?").toUpperCase();
  const isDev = g => g.status === "dev";
  const stText = g => isDev(g) ? "Đang phát triển" : "Đã phát hành";
  const released = games.filter(g => !isDev(g)).length;
  const ID = `${initials(P.name)}-${pad(P.level, 4)}`;
  const YEAR = new Date().getFullYear();
  const featuredIndex = Math.max(0, games.findIndex(g => g.featured));
  const safeUrl = u => { u = String(u || "").trim(); return /^(javascript|data|vbscript):/i.test(u) ? "#" : u; };
  const extLink = u => /^(https?:)?\/\//i.test(u);
  // tên/tiêu đề dài: thêm lớp "l" hoặc "xl" để chữ nhỏ lại, không chiếm cả màn hình
  const lenCls = (s, a, b) => { const n = String(s || "").length; return n > b ? " xl" : n > a ? " l" : ""; };
  const ICON = {
    trophy: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg>`,
    check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>`,
    play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>`,
    arrow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    left: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`,
    right: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`,
    copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>`,
    lock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
    close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    pad: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 11h4M8 9v4M15 12h.01M18 10h.01"/><path d="M17.32 5H6.68a4 4 0 0 0-3.98 3.59l-.9 7.82A2.5 2.5 0 0 0 4.3 19.2c.86 0 1.65-.48 2.04-1.24L7.5 16h9l1.16 1.96c.39.76 1.18 1.24 2.04 1.24a2.5 2.5 0 0 0 2.5-2.79l-.9-7.82A4 4 0 0 0 17.32 5z"/></svg>`
  };

  /* ---------- màu & ngẫu nhiên ---------- */
  const hash = s => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const rgb = h => { h = String(h || "").trim().replace("#",""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); if (!/^[0-9a-f]{6}$/i.test(h)) h = "FF4F9A"; return [0,2,4].map(i => parseInt(h.slice(i,i+2),16)); };
  const hex = c => "#" + c.map(v => clamp(Math.round(v),0,255).toString(16).padStart(2,"0")).join("");
  const mix = (a,b,t) => { const A = rgb(a), B = rgb(b); return hex(A.map((v,i) => v + (B[i]-v)*t)); };
  const rgba = (h,a) => { const c = rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  const gColor = g => hex(rgb(g && g.color));
  // bỏ dấu tiếng Việt để so khớp từ khóa
  const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();

  /* =========================================================
     TRANH MINH HỌA TỰ VẼ — mỗi game một cảnh hợp với thể loại
     (thành phố, rừng đom đóm, đường đua, sa mạc, quán trọ ma,
     vũ trụ, lâu đài), tô theo màu "color" của game trong data.js
     ========================================================= */
  const C = { pink:"#FF4F9A", pink2:"#FF8DC1", gold:"#FFC65C", orange:"#FF8A4C", violet:"#8B6CFF", lilac:"#BBA9FF", mint:"#5EF0C8", cyan:"#59E3FF", blue:"#62B6FF", ink:"#0A0818" };
  const mkCanvas = (W, H) => { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(W)); c.height = Math.max(1, Math.ceil(H)); return c; };
  // đốm sáng mềm (đom đóm / bụi sáng), vẽ sẵn một lần cho mỗi màu
  const SPR = {};
  const sprite = col => SPR[col] || (SPR[col] = (() => {
    const c = mkCanvas(32, 32), x = c.getContext("2d"), g = x.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.12, rgba(col, 1)); g.addColorStop(.4, rgba(col, .35)); g.addColorStop(1, rgba(col, 0));
    x.fillStyle = g; x.fillRect(0, 0, 32, 32); return c;
  })());
  const glow = (x, cx, cy, R, col, a = .5) => {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, R); g.addColorStop(0, rgba(col, a)); g.addColorStop(.4, rgba(col, a*.35)); g.addColorStop(1, rgba(col, 0));
    x.save(); x.globalCompositeOperation = "lighter"; x.fillStyle = g; x.fillRect(cx - R, cy - R, R*2, R*2); x.restore();
  };
  const sparks = (x, r, n, col, x0, y0, w, h, zMin, zMax, alt) => {
    x.save(); x.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i++){ const z = zMin + r()*(zMax - zMin); x.globalAlpha = .25 + r()*.7; x.drawImage(sprite(alt && r() < .35 ? alt : col), x0 + r()*w - z/2, y0 + r()*h - z/2, z, z); }
    x.restore();
  };
  function skyline(W, H, r, o){
    const c = mkCanvas(W, H), x = c.getContext("2d"), s = o.scale || 1;
    let px = (o.x0 ?? 0) - r()*o.maxW; const end = o.x1 ?? W;
    while (px < end){
      const bw = o.minW + r()*(o.maxW - o.minW), bh = (o.minH + r()*(o.maxH - o.minH))*(o.shape ? o.shape(px/W) : 1), top = o.base - bh;
      x.fillStyle = o.fill; x.fillRect(px, top, bw, o.base - top + 2);
      if (r() < .35){ const iw = bw*(.4 + r()*.3), ih = bh*(.08 + r()*.12); x.fillRect(px + (bw - iw)/2, top - ih, iw, ih + 1); }
      if (r() < .25){ x.fillRect(px + bw*.5, top - bh*.25, Math.max(1, s), bh*.25); if (o.blink){ x.fillStyle = "#FF5C6C"; x.fillRect(px + bw*.5 - s, top - bh*.25 - s, 3*s, 3*s); } }
      if (o.rim){ x.fillStyle = o.rim; x.fillRect(px, top, Math.max(1, s), o.base - top); }
      const ws = 5*s, ww = Math.max(1, 2*s);
      for (let wy = top + ws; wy < o.base - ws; wy += ws)
        for (let wx = px + 3*s; wx < px + bw - 3*s; wx += ws)
          if (r() < o.winP){ x.fillStyle = rgba(o.wins[Math.floor(r()*o.wins.length)], o.winA*(.35 + r()*.65)); x.fillRect(wx, wy, ww, ww); }
      if (o.signP && r() < o.signP && bh > o.maxH*.4){
        const col = o.wins[Math.floor(r()*o.wins.length)], sw = Math.max(4*s, bw*.16), sh = bh*(.2 + r()*.25), sx = px + (r() < .5 ? 2*s : bw - sw - 2*s), sy = top + bh*(.1 + r()*.3);
        x.save(); x.shadowColor = col; x.shadowBlur = 16*s; x.fillStyle = rgba(col, .9); x.fillRect(sx, sy, sw, sh); x.restore();
        x.fillStyle = "rgba(10,4,20,.38)"; for (let k = sy + 3*s; k < sy + sh - 2*s; k += 5*s) x.fillRect(sx + sw*.2, k, sw*.6, 2*s);
      }
      px += bw + r()*o.gap;
    }
    return c;
  }
  // đĩa mặt trời tô chuyển màu từ trên xuống
  function sunDisc(R, stops){
    const c = mkCanvas(R*2, R*2), x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, R*2);
    stops.forEach((s,i) => g.addColorStop(i/(stops.length - 1), s));
    x.fillStyle = g; x.beginPath(); x.arc(R, R, R, 0, Math.PI*2); x.fill();
    return c;
  }
  // cắt các sọc ngang ở nửa dưới mặt trời; off (0..1) làm sọc trôi xuống
  function stripeSun(base, R, off = 0, out){
    const c = out || mkCanvas(base.width, base.height);
    if (c.width !== base.width || c.height !== base.height){ c.width = base.width; c.height = base.height; }
    const x = c.getContext("2d"); x.clearRect(0, 0, c.width, c.height); x.drawImage(base, 0, 0);
    x.globalCompositeOperation = "destination-out";
    const N = 10, top = R*.62;
    for (let i = 0; i < N; i++){ const t = (i + off)/N; x.fillRect(0, top + t*R*1.42, R*2, .5 + t*t*R*.16); }
    x.globalCompositeOperation = "source-over";
    return c;
  }
  // dãy núi (midpoint displacement) có viền sáng trên sống núi
  function mountains(W, H, r, o){
    const c = mkCanvas(W, H), x = c.getContext("2d"), n = o.n || 7, N = 1 << n, v = new Array(N + 1).fill(0), s = o.scale || 1;
    v[0] = r(); v[N] = r();
    for (let step = N, a = 1; step > 1; step /= 2, a *= (o.rough || .55)){ const h = step/2; for (let i = h; i < N; i += step) v[i] = (v[i-h] + v[i+h])/2 + (r() - .5)*a; }
    const lo = Math.min(...v), hi = Math.max(...v), pts = v.map((y,i) => [i/N*W, o.base - o.amp*(.15 + .85*(y - lo)/((hi - lo) || 1))*(o.shape ? o.shape(i/N) : 1)]);
    const g = x.createLinearGradient(0, o.base - o.amp, 0, o.base); g.addColorStop(0, o.top); g.addColorStop(1, o.bottom || o.top);
    x.beginPath(); x.moveTo(0, o.base + 2); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(W, o.base + 2); x.closePath(); x.fillStyle = g; x.fill();
    if (o.rim){ x.save(); x.shadowColor = o.rim; x.shadowBlur = 10*s; x.strokeStyle = o.rim; x.lineWidth = 1.3*s; x.beginPath(); pts.forEach((p,i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); x.restore(); }
    return c;
  }
  function floorGrid(x, W, H, hz, color, off = 0, alpha = .6, floorTop = null, vx = W/2){
    const N = 18;
    x.lineWidth = Math.max(1, W/1400); x.strokeStyle = rgba(color, alpha*.5);
    x.beginPath(); for (let k = -28; k <= 28; k++){ x.moveTo(vx + k*W*.012, hz); x.lineTo(vx + k*W*.17, H); } x.stroke();
    for (let i = 0; i < N; i++){ const t = ((i + off) % N)/N, y = hz + (H - hz)*t*t; x.strokeStyle = rgba(color, alpha*Math.min(1, t*1.4)); x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
    if (floorTop){ const g = x.createLinearGradient(0, hz, 0, hz + (H - hz)*.35); g.addColorStop(0, rgba(floorTop, .9)); g.addColorStop(1, rgba(floorTop, 0)); x.fillStyle = g; x.fillRect(0, hz, W, (H - hz)*.35); }
  }
  function reflect(x, sx, hz, H, w, color){
    for (let k = 0; k < 14; k++){ const t = k/14, y = hz + (H - hz)*Math.pow(t, 1.4) + 2, ww = w*(1 - t*.7);
      x.fillStyle = rgba(color, .38*(1 - t)); x.fillRect(sx - ww/2, y, ww, Math.max(1.5, (H - hz)*.012*(1 + t*2))); }
  }
  const horizonLine = (x, W, hz, color, a = .85) => { const g = x.createLinearGradient(0, 0, W, 0); g.addColorStop(0, rgba(color, 0)); g.addColorStop(.5, rgba(color, a)); g.addColorStop(1, rgba(color, 0)); x.fillStyle = g; x.fillRect(0, hz - 1, W, 2); };
  function paintSky(x, W, hz, col, r, s, o = {}){
    const g = x.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, o.top || "#0C0824"); g.addColorStop(.42, mix(o.mid || "#23164E", col, .1)); g.addColorStop(.78, mix(o.low || "#552371", col, .22)); g.addColorStop(1, mix(o.hor || "#B03A78", col, .42));
    x.fillStyle = g; x.fillRect(0, 0, W, hz + 2);
    const n = W*hz/(o.starDiv || 2600);
    for (let i = 0; i < n; i++){ const y = r()*hz*(o.starH || .72), a = (.15 + r()*.6)*(1 - y/hz*.8); x.fillStyle = `rgba(255,240,255,${a})`; const z = r() < .1 ? 2*s : Math.max(1, s*.9); x.fillRect(r()*W, y, z, z); }
  }
  function paintSun(x, cx, cy, R, col, r, striped = true){
    x.save(); x.globalCompositeOperation = "lighter";
    let g = x.createRadialGradient(cx, cy, R*.5, cx, cy, R*2.8); g.addColorStop(0, rgba(col, .5)); g.addColorStop(.5, rgba(mix(col, C.pink, .5), .16)); g.addColorStop(1, rgba(col, 0));
    x.fillStyle = g; x.fillRect(cx - R*3, cy - R*3, R*6, R*6); x.restore();
    const disc = sunDisc(R, [mix(col, "#FFFFFF", .55), mix(col, "#FFF1B8", .3), col, mix(col, C.pink, .65)]);
    x.drawImage(striped ? stripeSun(disc, R, r()) : disc, cx - R, cy - R);
  }
  function paintMoon(x, cx, cy, R, col){
    glow(x, cx, cy, R*4.2, col, .32); glow(x, cx, cy, R*1.8, "#FFFFFF", .16);
    const g = x.createRadialGradient(cx - R*.3, cy - R*.35, R*.1, cx, cy, R);
    g.addColorStop(0, "#FFFDF4"); g.addColorStop(.6, mix("#FFF4DC", col, .25)); g.addColorStop(1, mix("#F0D9FF", col, .45));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI*2); x.fill();
    x.fillStyle = rgba(mix(col, "#7A5AB0", .5), .16);
    [[-.35,-.1,.22],[.25,.3,.16],[.1,-.42,.11],[.42,-.12,.09]].forEach(([dx,dy,rr]) => { x.beginPath(); x.arc(cx + dx*R, cy + dy*R, rr*R, 0, Math.PI*2); x.fill(); });
  }
  const vignette = (x, W, H, a = .55) => { const v = x.createRadialGradient(W/2, H/2, Math.min(W,H)*.3, W/2, H/2, Math.max(W,H)*.75); v.addColorStop(0, "rgba(5,3,14,0)"); v.addColorStop(1, `rgba(5,3,14,${a})`); x.fillStyle = v; x.fillRect(0, 0, W, H); };
  function pines(x, W, base, o, r){
    x.fillStyle = o.fill;
    for (let px = -r()*o.gap; px < W + o.gap; px += o.gap*(.55 + r()*.9)){
      const h = (o.minH + r()*(o.maxH - o.minH))*(o.shape ? o.shape(px/W) : 1), w = h*(.34 + r()*.14), tiers = 3 + Math.floor(r()*3);
      x.beginPath();
      for (let k = 0; k < tiers; k++){ const ty = base - h + h*.82*k/tiers, tw = w*(.3 + .7*(k + 1)/tiers), th = h/tiers*1.55; x.moveTo(px, ty); x.lineTo(px + tw/2, ty + th); x.lineTo(px - tw/2, ty + th); x.closePath(); }
      x.rect(px - w*.05, base - h*.2, w*.1, h*.2 + 2);
      x.fill();
    }
    x.fillRect(0, base - 1, W, 3);
  }
  function hills(x, W, base, amp, fill, r, freq = 1.4){
    const ph = r()*6.28, ph2 = r()*6.28;
    x.beginPath(); x.moveTo(0, base + amp*2);
    for (let i = 0; i <= 80; i++){ const t = i/80; x.lineTo(t*W, base - amp*(.55 + .3*Math.sin(t*freq*6.28 + ph) + .15*Math.sin(t*freq*2.7*6.28 + ph2))); }
    x.lineTo(W, base + amp*2); x.closePath(); x.fillStyle = fill; x.fill();
  }
  function dune(x, W, H, base, amp, r, lit, shade, freq = 1){
    const ph = r()*6.28, pts = [];
    for (let i = 0; i <= 90; i++){ const t = i/90, a = Math.sin(t*freq*6.28 + ph), b = Math.sin(t*freq*2.3*6.28 + ph*1.7); pts.push([t*W, base - amp*(.5 + .38*a + .12*b)]); }
    const g = x.createLinearGradient(0, base - amp, 0, base + amp*.6); g.addColorStop(0, lit); g.addColorStop(1, shade);
    x.beginPath(); x.moveTo(0, H); pts.forEach(p => x.lineTo(p[0], p[1])); x.lineTo(W, H); x.closePath(); x.fillStyle = g; x.fill();
    // mặt khuất nắng của cồn cát
    x.save(); x.clip(); x.fillStyle = rgba(shade, .55);
    x.beginPath(); x.moveTo(0, H); pts.forEach((p,i) => { const q = pts[Math.min(pts.length - 1, i + 3)]; x.lineTo(p[0], p[1] + Math.max(0, p[1] - q[1])*2.4 + amp*.08); }); x.lineTo(W, H); x.closePath(); x.fill(); x.restore();
    x.save(); x.globalCompositeOperation = "lighter"; x.strokeStyle = rgba(lit, .5); x.lineWidth = Math.max(1, amp*.012); x.beginPath(); pts.forEach((p,i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); x.restore();
  }
  function palm(x, px, base, h, s, fill, lean){
    x.save(); x.strokeStyle = fill; x.fillStyle = fill; x.lineCap = "round";
    const tx = px + lean*h*.35, ty = base - h;
    x.lineWidth = Math.max(2, h*.045); x.beginPath(); x.moveTo(px, base); x.quadraticCurveTo(px + lean*h*.05, base - h*.6, tx, ty); x.stroke();
    for (let k = 0; k < 8; k++){
      const a = -Math.PI*.5 + (k - 3.5)*.42 + lean*.2, L = h*(.42 + (k % 3)*.08), ex = tx + Math.cos(a)*L*1.1, ey = ty + Math.sin(a)*L*.55 + L*.32;
      x.lineWidth = Math.max(1.5, h*.02); x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + Math.cos(a)*L*.6, ty + Math.sin(a)*L*.7 - L*.18, ex, ey); x.stroke();
      for (let j = 1; j < 7; j++){ const t = j/7, qx = tx + (ex - tx)*t, qy = ty + (ey - ty)*t - Math.sin(t*Math.PI)*L*.18; x.lineWidth = Math.max(1, h*.012); x.beginPath(); x.moveTo(qx, qy); x.lineTo(qx + Math.cos(a + 1.2)*L*.12*(1 - t*.5), qy + L*.13*(1 - t*.4)); x.moveTo(qx, qy); x.lineTo(qx + Math.cos(a - 1.2)*L*.12*(1 - t*.5), qy + L*.13*(1 - t*.4)); x.stroke(); }
    }
    x.beginPath(); x.arc(tx, ty + h*.02, h*.03, 0, Math.PI*2); x.fill();
    x.restore();
  }
  function lanternString(x, x0, y0, x1, y1, sag, n, col, s, r){
    x.save(); x.strokeStyle = "rgba(20,10,30,.9)"; x.lineWidth = Math.max(1, s); x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo((x0 + x1)/2, Math.max(y0, y1) + sag, x1, y1); x.stroke();
    for (let i = 1; i < n; i++){ const t = i/n, qx = (1-t)*(1-t)*x0 + 2*(1-t)*t*((x0 + x1)/2) + t*t*x1, qy = (1-t)*(1-t)*y0 + 2*(1-t)*t*(Math.max(y0, y1) + sag) + t*t*y1;
      const c = i % 3 === 0 ? C.pink : i % 3 === 1 ? C.gold : col; glow(x, qx, qy + 5*s, 16*s, c, .55);
      x.fillStyle = mix(c, "#FFFFFF", .35); x.beginPath(); x.ellipse(qx, qy + 5*s, 3.2*s, 4.2*s, 0, 0, Math.PI*2); x.fill(); }
    x.restore();
  }
  function ghost(x, cx, cy, R, col, r){
    const tilt = (r() - .5)*.4;
    glow(x, cx, cy + R*.2, R*3.2, col, .3);
    x.save(); x.translate(cx, cy); x.rotate(tilt);
    const g = x.createLinearGradient(0, -R, 0, R*1.6); g.addColorStop(0, rgba("#FFFFFF", .92)); g.addColorStop(.5, rgba(mix(col, "#FFFFFF", .5), .7)); g.addColorStop(1, rgba(col, 0));
    x.beginPath(); x.moveTo(-R*.8, 0); x.arc(0, 0, R*.8, Math.PI, 0);
    for (let i = 0; i <= 6; i++){ const t = i/6; x.lineTo(R*.8 - t*R*1.6, R*1.25 + Math.sin(t*Math.PI*3)*R*.18 + t*R*.15); }
    x.closePath(); x.fillStyle = g; x.shadowColor = col; x.shadowBlur = R*.8; x.fill();
    x.shadowBlur = 0; x.fillStyle = "rgba(26,10,48,.85)";
    x.beginPath(); x.ellipse(-R*.28, -R*.05, R*.11, R*.16, 0, 0, Math.PI*2); x.ellipse(R*.22, -R*.05, R*.11, R*.16, 0, 0, Math.PI*2); x.fill();
    x.beginPath(); x.ellipse(-R*.03, R*.3, R*.12, R*.08, 0, 0, Math.PI*2); x.fill();
    x.restore();
  }

  // các cảnh: back = bầu trời & mặt trời, mid = bóng dáng chính, front = mặt đất & hạt sáng
  const SCENES = {
    city: { hz:.64, paint(X, k){
      const { W, H, hz, s, r, col, sx } = k, R = Math.min(H*(.2 + r()*.08), W*.3), sy = hz - R*.62;
      paintSky(X.back, W, hz, col, r, s); paintSun(X.back, sx, sy, R, col, r);
      if (r() < .8) X.back.drawImage(mountains(W, H, r, { base:hz, amp:H*(.1 + r()*.08), top:mix("#3A1E66", col, .12), bottom:mix("#241444", col, .06), rim:rgba(mix(col, "#FFFFFF", .3), .55), scale:s }), 0, 0);
      let g = X.back.createLinearGradient(0, hz - H*.14, 0, hz); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, .22)); X.back.fillStyle = g; X.back.fillRect(0, hz - H*.14, W, H*.14);
      X.mid.drawImage(skyline(W, H, r, { base:hz, minW:W*.022, maxW:W*.055, minH:H*.04, maxH:H*.15, gap:3*s, fill:mix("#1E1440", col, .1), wins:[col, C.gold], winP:.1, winA:.5, scale:s }), 0, 0);
      X.mid.drawImage(skyline(W, H, r, { base:hz + 2, minW:W*.035, maxW:W*.09, minH:H*.06, maxH:H*.3, gap:8*s, fill:"#100A22", wins:[col, "#FFFFFF", C.gold, C.pink], winP:.15, winA:.9, signP:.4, blink:true, scale:s }), 0, 0);
      const f = X.front; g = f.createLinearGradient(0, hz, 0, H); g.addColorStop(0, mix("#22103E", col, .14)); g.addColorStop(1, "#0A0818"); f.fillStyle = g; f.fillRect(0, hz, W, H - hz);
      floorGrid(f, W, H, hz, col, r()*18, .75, null, sx); reflect(f, sx, hz, H, R*1.3, col); horizonLine(f, W, hz, mix(col, "#FFFFFF", .4), .8);
      sparks(f, r, W*H/9000, col, 0, hz*.55, W, H - hz*.55, 3*s, 12*s, C.gold);
    }},
    forest: { hz:.7, paint(X, k){
      const { W, H, hz, s, r, col, sx } = k, R = Math.min(H*.13, W*.16), my = hz*(.34 + r()*.12);
      paintSky(X.back, W, hz, col, r, s, { top:"#070A22", mid:"#14184A", low:"#2E2160", hor:"#5B3A7E", starDiv:1900 });
      paintMoon(X.back, sx, my, R, col);
      const b = X.back; [[.26, "#2B2A62", .55],[.18, "#221F52", .7]].forEach(([amp, fill], i) => { hills(b, W, hz - H*.06*(2 - i), H*amp, mix(fill, col, .06), r, 1.1 + i*.4); });
      const m = X.mid;
      pines(m, W, hz - H*.05, { fill:mix("#2A2462", col, .1), minH:H*.1, maxH:H*.2, gap:W*.018 }, r);
      let g = m.createLinearGradient(0, hz - H*.2, 0, hz); g.addColorStop(0, rgba(mix("#5A4A9A", col, .3), 0)); g.addColorStop(1, rgba(mix("#6A55A8", col, .35), .55)); m.fillStyle = g; m.fillRect(0, hz - H*.2, W, H*.2);
      pines(m, W, hz + H*.02, { fill:mix("#171339", col, .06), minH:H*.16, maxH:H*.32, gap:W*.03 }, r);
      g = m.createLinearGradient(0, hz - H*.12, 0, hz + H*.05); g.addColorStop(0, rgba(mix("#4A3C88", col, .25), 0)); g.addColorStop(1, rgba(mix("#4A3C88", col, .25), .5)); m.fillStyle = g; m.fillRect(0, hz - H*.12, W, H*.17);
      const f = X.front, gy = hz + H*.01;
      g = f.createLinearGradient(0, gy, 0, H); g.addColorStop(0, mix("#2A2160", col, .16)); g.addColorStop(.35, "#120E30"); g.addColorStop(1, "#08061A"); f.fillStyle = g; f.fillRect(0, gy, W, H - gy);
      // lối mòn uốn lượn dẫn vào rừng
      const px0 = W*(.42 + r()*.16), pathAt = t => px0 + Math.sin(t*3.2 + 1)*W*.08*t;
      f.save(); f.beginPath();
      for (let i = 0; i <= 40; i++){ const t = i/40, y = gy + (H - gy)*t, w = W*(.006 + .16*t*t); f.lineTo(pathAt(t) - w, y); }
      for (let i = 40; i >= 0; i--){ const t = i/40, y = gy + (H - gy)*t, w = W*(.006 + .16*t*t); f.lineTo(pathAt(t) + w, y); }
      f.closePath(); g = f.createLinearGradient(0, gy, 0, H); g.addColorStop(0, rgba(mix(col, "#FFFFFF", .3), .55)); g.addColorStop(.5, rgba(mix(col, "#6A55A8", .5), .3)); g.addColorStop(1, rgba("#2A2160", .4)); f.fillStyle = g; f.fill(); f.restore();
      pines(f, W, H + 2, { fill:"#07051A", minH:H*.45, maxH:H*.8, gap:W*.2, shape:t => t < .16 || t > .84 ? 1 : 0 }, r);
      g = f.createLinearGradient(0, gy - H*.04, 0, gy + H*.1); g.addColorStop(0, rgba(mix("#8A78D8", col, .3), 0)); g.addColorStop(.5, rgba(mix("#8A78D8", col, .3), .22)); g.addColorStop(1, rgba(mix("#8A78D8", col, .3), 0)); f.fillStyle = g; f.fillRect(0, gy - H*.04, W, H*.14);
      f.save(); f.globalCompositeOperation = "lighter";
      for (let i = 0; i < 90; i++){ const t = Math.pow(r(), .8), y = gy + (H - gy)*t - H*.06*r(), z = (2 + 9*t + r()*4)*s; f.globalAlpha = .3 + r()*.7; f.drawImage(sprite(r() < .75 ? C.gold : col), pathAt(t) + (r() - .5)*W*(.1 + .5*t) - z/2, y - z/2, z, z); }
      f.restore();
      sparks(f, r, W*H/6000, C.gold, 0, hz*.4, W, H*.45, 2*s, 8*s, col);
      glow(f, pathAt(.5), gy + (H - gy)*.5 - H*.08, H*.09, C.gold, .5);
    }},
    road: { hz:.6, paint(X, k){
      const { W, H, hz, s, r, col } = k, sx = W*.5 + (k.sx - W*.5)*.35, R = Math.min(H*.25, W*.26), sy = hz - R*.55;
      paintSky(X.back, W, hz, col, r, s); paintSun(X.back, sx, sy, R, col, r);
      X.back.drawImage(mountains(W, H, r, { base:hz, amp:H*.12, top:mix("#3A1E66", col, .14), bottom:mix("#241444", col, .06), rim:rgba(mix(col, "#FFFFFF", .3), .6), scale:s, shape:t => .35 + Math.abs(t - sx/W)*1.6 }), 0, 0);
      X.mid.drawImage(skyline(W, H, r, { base:hz + 1, minW:W*.012, maxW:W*.03, minH:H*.03, maxH:H*.13, gap:2*s, fill:"#140B2C", wins:[col, C.gold, "#FFFFFF"], winP:.18, winA:.8, scale:s*.7, x0:sx - W*.28, x1:sx + W*.28, shape:t => 1 - Math.min(1, Math.abs(t - sx/W)*3.2) }), 0, 0);
      const f = X.front;
      let g = f.createLinearGradient(0, hz, 0, H); g.addColorStop(0, mix("#2A1046", col, .16)); g.addColorStop(1, "#0A0818"); f.fillStyle = g; f.fillRect(0, hz, W, H - hz);
      floorGrid(f, W, H, hz, col, r()*18, .5, null, sx);
      // mặt đường
      const rw0 = W*.004, rw1 = W*.62;
      f.fillStyle = "#0D0720"; f.beginPath(); f.moveTo(sx - rw0, hz); f.lineTo(sx + rw0, hz); f.lineTo(sx + rw1, H); f.lineTo(sx - rw1, H); f.closePath(); f.fill();
      f.save(); f.shadowColor = col; f.shadowBlur = 12*s; f.strokeStyle = mix(col, "#FFFFFF", .25); f.lineWidth = 2.2*s;
      [-1, 1].forEach(d => { f.beginPath(); f.moveTo(sx + d*rw0, hz); f.lineTo(sx + d*rw1, H); f.stroke(); });
      f.restore();
      for (let i = 0; i < 16; i++){ const t0 = (i + r())/16, t1 = t0 + .025, y0 = hz + (H - hz)*t0*t0, y1 = hz + (H - hz)*Math.min(1, t1*t1);
        for (const lane of [-.33, .33]){ f.fillStyle = rgba("#FFFFFF", .25 + t0*.5); f.beginPath(); f.moveTo(sx + lane*(rw0 + (rw1 - rw0)*t0*t0) - s*t0*2, y0); f.lineTo(sx + lane*(rw0 + (rw1 - rw0)*t0*t0) + s*t0*2, y0); f.lineTo(sx + lane*(rw0 + (rw1 - rw0)*t1*t1) + s*t1*3, y1); f.lineTo(sx + lane*(rw0 + (rw1 - rw0)*t1*t1) - s*t1*3, y1); f.closePath(); f.fill(); } }
      // vệt đèn xe
      f.save(); f.globalCompositeOperation = "lighter";
      [[-.16, C.pink], [-.08, C.gold], [.1, col], [.2, C.pink]].forEach(([lane, c]) => { const gg = f.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, rgba(c, 0)); gg.addColorStop(.5, rgba(c, .5)); gg.addColorStop(1, rgba(c, .9)); f.strokeStyle = gg; f.lineWidth = 3*s; f.beginPath(); f.moveTo(sx + lane*rw0*10, hz + 3); f.lineTo(sx + lane*rw1*1.7, H); f.stroke(); });
      f.restore();
      reflect(f, sx, hz, H, R*1.1, col); horizonLine(f, W, hz, mix(col, "#FFFFFF", .4), .9);
      sparks(f, r, W*H/14000, col, 0, hz*.6, W, H - hz*.6, 3*s, 10*s, C.gold);
      [[.06, 1], [.17, .75], [.85, -1], [.95, -.7]].forEach(([px, d]) => palm(f, W*px + (r() - .5)*W*.03, hz + H*.04 + (Math.abs(px - .5) - .3)*H*.5, H*(.3 + Math.abs(px - .5)*.5), s, "#0A0616", -d*.5));
    }},
    desert: { hz:.6, paint(X, k){
      const { W, H, hz, s, r, col, sx } = k, R = Math.min(H*.24, W*.24), sy = hz - R*.4;
      paintSky(X.back, W, hz, col, r, s, { top:"#120A26", mid:"#3A1846", low:"#8A2E5E", hor:"#E0704F", starDiv:5200, starH:.5 });
      paintSun(X.back, sx, sy, R, col, r);
      const b = X.back; b.fillStyle = mix("#5A2560", col, .15);
      for (let i = 0; i < 3; i++){ const mx = W*(.06 + r()*.88), mw = W*(.05 + r()*.07), mh = H*(.05 + r()*.08); b.beginPath(); b.moveTo(mx - mw*1.3, hz + 2);
        for (let j = 0; j <= 8; j++){ const t = j/8, ex = mx - mw + mw*2*t, top = t < .15 || t > .85 ? mh*(.35 + r()*.3) : mh*(.9 + r()*.12); b.lineTo(ex, hz - top); }
        b.lineTo(mx + mw*1.3, hz + 2); b.closePath(); b.fill(); }
      let g = b.createLinearGradient(0, hz - H*.2, 0, hz + 2); g.addColorStop(0, rgba(mix(col, C.orange, .5), 0)); g.addColorStop(1, rgba(mix(col, C.orange, .5), .4)); b.fillStyle = g; b.fillRect(0, hz - H*.2, W, H*.2 + 2);
      dune(X.mid, W, H, hz + H*.04, H*.1, r, mix("#C2557A", col, .3), mix("#3A1846", col, .1), .8);
      dune(X.mid, W, H, hz + H*.15, H*.14, r, mix("#E07A6A", col, .35), mix("#2A1238", col, .08), .6);
      const f = X.front;
      dune(f, W, H, hz + H*.32, H*.2, r, mix("#F09A6A", col, .3), "#1A0A26", .45);
      // cột đá cổ và vòm đổ
      const u = Math.min(W, H*1.6)/700, px = W*(.1 + r()*.14), pb = hz + H*.28;
      f.fillStyle = "#1A0A22";
      const column = (x0, h) => { f.fillRect(x0, pb - h, 16*u, h + 6*u); f.fillRect(x0 - 5*u, pb - h - 7*u, 26*u, 8*u); f.fillRect(x0 - 3*u, pb - 4*u, 22*u, 10*u); };
      column(px, 120*u); column(px + 80*u, 74*u);
      f.beginPath(); f.moveTo(px - 5*u, pb - 127*u); f.quadraticCurveTo(px + 40*u, pb - 170*u, px + 70*u, pb - 140*u); f.lineTo(px + 66*u, pb - 128*u); f.quadraticCurveTo(px + 40*u, pb - 150*u, px + 8*u, pb - 118*u); f.closePath(); f.fill();
      f.fillRect(px + 140*u, pb - 14*u, 40*u, 18*u); f.fillRect(px + 150*u, pb - 26*u, 22*u, 14*u);
      f.save(); f.globalCompositeOperation = "lighter";
      for (let i = 0; i < 40; i++){ const y = hz + r()*(H - hz), x0 = r()*W, L = W*(.08 + r()*.25); g = f.createLinearGradient(x0, y, x0 + L, y - L*.08); g.addColorStop(0, rgba(col, 0)); g.addColorStop(.5, rgba(mix(col, "#FFE2A1", .5), .16 + r()*.2)); g.addColorStop(1, rgba(col, 0)); f.strokeStyle = g; f.lineWidth = Math.max(1, s*(.6 + r())); f.beginPath(); f.moveTo(x0, y); f.lineTo(x0 + L, y - L*.08); f.stroke(); }
      f.restore();
      sparks(f, r, W*H/7000, mix(col, "#FFE2A1", .4), 0, hz*.5, W, H*.6, 2*s, 7*s, C.orange);
      g = f.createLinearGradient(0, 0, W, 0); g.addColorStop(0, rgba(mix(col, C.orange, .4), .18)); g.addColorStop(.5, rgba(col, 0)); g.addColorStop(1, rgba(mix(col, C.orange, .4), .14)); f.fillStyle = g; f.fillRect(0, 0, W, H);
    }},
    haunt: { hz:.68, paint(X, k){
      const { W, H, hz, s, r, col, sx } = k, R = Math.min(H*.11, W*.12), mx = W - sx*.6 - W*.1, my = hz*.3;
      paintSky(X.back, W, hz, col, r, s, { top:"#08071E", mid:"#1A1446", low:"#3A2368", hor:"#7A3A7E", starDiv:2000 });
      paintMoon(X.back, mx, my, R, col);
      hills(X.back, W, hz - H*.05, H*.16, mix("#261C58", col, .08), r, 1.2);
      const m = X.mid, base = hz + H*.02, cx = W*(.3 + r()*.15), u = Math.min(W, H*1.6)/700;
      hills(m, W, base + H*.02, H*.08, "#120C2C", r, .7);
      // quán trọ: hai tầng mái cong, cửa sổ sáng
      m.fillStyle = "#0F0A26";
      const bw = 150*u, bh = 62*u;
      m.fillRect(cx - bw/2, base - bh, bw, bh + 4);
      const roof = (y, w, h) => { m.beginPath(); m.moveTo(cx - w/2 - 14*u, y + 4*u); m.quadraticCurveTo(cx - w*.3, y - h*.15, cx - w*.18, y - h); m.lineTo(cx + w*.18, y - h); m.quadraticCurveTo(cx + w*.3, y - h*.15, cx + w/2 + 14*u, y + 4*u); m.closePath(); m.fill(); };
      roof(base - bh, bw + 20*u, 26*u); m.fillRect(cx - bw*.32, base - bh - 52*u, bw*.64, 30*u); roof(base - bh - 46*u, bw*.75, 22*u);
      m.fillRect(cx + bw*.28, base - bh - 70*u, 10*u, 34*u);
      const wins = [[-.38, -.62], [-.14, -.62], [.14, -.62], [.38, -.62], [-.2, -1.35], [.2, -1.35]];
      wins.forEach(([wx, wy]) => { const x0 = cx + wx*bw - 9*u, y0 = base + wy*bh - 1*u; glow(m, x0 + 9*u, y0 + 9*u, 34*u, C.gold, .4); m.fillStyle = r() < .85 ? "#FFD27A" : mix(col, "#FFFFFF", .3); m.fillRect(x0, y0, 18*u, 16*u); m.fillStyle = "#0F0A26"; m.fillRect(x0 + 8*u, y0, 2*u, 16*u); });
      m.fillStyle = "#2A1520"; m.fillRect(cx - 12*u, base - 30*u, 24*u, 30*u); glow(m, cx, base - 15*u, 30*u, C.orange, .35);
      lanternString(m, cx - bw/2 - 12*u, base - bh + 6*u, cx - bw/2 - 110*u, base - 26*u, 18*u, 6, col, u, r);
      lanternString(m, cx + bw/2 + 12*u, base - bh + 6*u, cx + bw/2 + 130*u, base - 20*u, 22*u, 7, col, u, r);
      // khói bốc từ ống khói
      m.save(); m.globalCompositeOperation = "lighter"; for (let i = 0; i < 9; i++) glow(m, cx + bw*.3 + i*7*u + Math.sin(i)*8*u, base - bh - 80*u - i*14*u, (10 + i*3)*u, "#B9A8FF", .1); m.restore();
      const f = X.front; f.fillStyle = "#0B0720"; f.fillRect(0, base + H*.02, W, H);
      let g = f.createLinearGradient(0, base, 0, H); g.addColorStop(0, rgba(mix(col, "#5A3A9A", .5), .35)); g.addColorStop(.4, "rgba(11,7,32,0)"); f.fillStyle = g; f.fillRect(0, base, W, H - base);
      // hàng rào gỗ
      f.fillStyle = "#06041A"; for (let px = W*.55; px < W*1.02; px += 16*u){ f.fillRect(px, base + H*.05 - 26*u, 5*u, 30*u + H); } f.fillRect(W*.55, base + H*.05 - 18*u, W*.5, 4*u); f.fillRect(W*.55, base + H*.05 - 8*u, W*.5, 4*u);
      // lối đá dẫn tới cửa, đèn lồng hai bên
      f.save(); f.globalAlpha = .9; for (let i = 0; i < 9; i++){ const t = i/9, y = base + H*.03 + (H - base)*t*t*1.1, w = (8 + 40*t)*u; f.fillStyle = rgba(mix("#4A3A7A", col, .2), .55 - t*.2); f.beginPath(); f.ellipse(cx + Math.sin(t*2.4)*W*.05*t, y, w, w*.32, 0, 0, Math.PI*2); f.fill(); } f.restore();
      [[-1, .25], [1, .32], [-1, .6], [1, .7]].forEach(([d, t]) => { const lx = cx + d*(30 + 120*t)*u, ly = base + (H - base)*t*.8; f.fillStyle = "#06041A"; f.fillRect(lx - 2*u, ly - 34*u*(.6 + t), 4*u, 34*u*(.6 + t)); glow(f, lx, ly - 36*u*(.6 + t), 40*u*(.6 + t), C.orange, .5); f.fillStyle = "#FFC27A"; f.beginPath(); f.ellipse(lx, ly - 36*u*(.6 + t), 5*u*(.6 + t), 7*u*(.6 + t), 0, 0, Math.PI*2); f.fill(); });
      f.fillStyle = "#05031A"; for (let px = 0; px < W; px += 5*u){ const h = (8 + r()*26)*u*(px < W*.25 || px > W*.8 ? 1.6 : .7); f.beginPath(); f.moveTo(px, H + 2); f.lineTo(px + 2*u + r()*4*u, H - h); f.lineTo(px + 5*u, H + 2); f.fill(); }
      for (let i = 0; i < 3; i++) ghost(f, W*(.58 + i*.13 + r()*.05), hz*(.42 + r()*.3), (26 + r()*16)*u, mix(col, "#FFFFFF", .15), r);
    }},
    space: { hz:.78, paint(X, k){
      const { W, H, hz, s, r, col, sx } = k, b = X.back;
      let g = b.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#05041A"); g.addColorStop(.5, mix("#140C3A", col, .08)); g.addColorStop(1, "#0A0620"); b.fillStyle = g; b.fillRect(0, 0, W, H);
      for (let i = 0; i < 26; i++) glow(b, W*r(), H*r()*.8, Math.min(W, H)*(.12 + r()*.3), r() < .5 ? col : r() < .5 ? C.violet : C.pink, .09 + r()*.08);
      for (let i = 0, n = W*H/700; i < n; i++){ b.fillStyle = `rgba(255,245,255,${.1 + r()*.7})`; const z = r() < .06 ? 2*s : Math.max(1, s*.8); b.fillRect(r()*W, r()*H, z, z); }
      // hành tinh có vành đai
      const px = sx, py = H*(.32 + r()*.08), PR = Math.min(W, H)*.2;
      const ring = (front) => { b.save(); b.translate(px, py); b.rotate(-.32); b.scale(1, .28); b.lineWidth = PR*.16; b.strokeStyle = rgba(mix(col, "#FFFFFF", .3), .55); b.beginPath(); b.arc(0, 0, PR*1.75, front ? 0 : Math.PI, front ? Math.PI : Math.PI*2); b.stroke(); b.lineWidth = PR*.05; b.strokeStyle = rgba(C.pink, .5); b.beginPath(); b.arc(0, 0, PR*2.02, front ? 0 : Math.PI, front ? Math.PI : Math.PI*2); b.stroke(); b.restore(); };
      ring(false); glow(b, px, py, PR*2.4, col, .3);
      g = b.createRadialGradient(px - PR*.45, py - PR*.45, PR*.1, px, py, PR); g.addColorStop(0, mix(col, "#FFFFFF", .45)); g.addColorStop(.55, col); g.addColorStop(1, mix(col, "#1A0A3A", .75));
      b.fillStyle = g; b.beginPath(); b.arc(px, py, PR, 0, Math.PI*2); b.fill();
      b.save(); b.beginPath(); b.arc(px, py, PR, 0, Math.PI*2); b.clip(); b.globalAlpha = .18; b.fillStyle = "#1A0A3A"; for (let i = 0; i < 6; i++){ b.fillRect(px - PR, py - PR + (i*.33 + r()*.1)*PR, PR*2, PR*(.05 + r()*.08)); } b.restore();
      ring(true);
      glow(b, W*(.1 + r()*.3), H*(.15 + r()*.2), Math.min(W, H)*.03, "#FFFFFF", .5);
      // bề mặt hành tinh gần (đường cong) + đèn thành phố
      const f = X.front, cy = H*2.4, cr = H*2.4 - hz;
      g = f.createRadialGradient(W/2, cy, cr*.98, W/2, cy, cr*1.06); g.addColorStop(0, rgba(col, .0)); g.addColorStop(.35, rgba(col, .55)); g.addColorStop(1, rgba(col, 0));
      f.fillStyle = g; f.fillRect(0, 0, W, H);
      f.fillStyle = "#0B0722"; f.beginPath(); f.arc(W/2, cy, cr, 0, Math.PI*2); f.fill();
      f.save(); f.beginPath(); f.arc(W/2, cy, cr, 0, Math.PI*2); f.clip(); f.globalCompositeOperation = "lighter"; for (let i = 0; i < W*H/1600; i++){ const a = -Math.PI/2 + (r() - .5)*1.4*(W/cr), d = cr - r()*H*.25; f.fillStyle = rgba(r() < .7 ? C.gold : col, .3 + r()*.6); f.fillRect(W/2 + Math.cos(a)*d, cy + Math.sin(a)*d, 1.5*s, 1.5*s); } f.restore();
      // phi thuyền nhỏ
      const shx = W*(.15 + r()*.25), shy = H*(.55 + r()*.1), u = Math.min(W, H)/500;
      f.save(); f.globalCompositeOperation = "lighter"; g = f.createLinearGradient(shx - 160*u, shy + 40*u, shx, shy); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(mix(col, "#FFFFFF", .4), .9)); f.strokeStyle = g; f.lineWidth = 3*u; f.beginPath(); f.moveTo(shx - 160*u, shy + 40*u); f.lineTo(shx, shy); f.stroke(); f.restore();
      f.fillStyle = "#E8E2FF"; f.beginPath(); f.moveTo(shx + 14*u, shy - 4*u); f.lineTo(shx - 6*u, shy - 8*u); f.lineTo(shx - 2*u, shy + 2*u); f.lineTo(shx - 8*u, shy + 8*u); f.closePath(); f.fill();
    }},
    castle: { hz:.7, paint(X, k){
      const { W, H, hz, s, r, col, sx } = k, R = Math.min(H*.12, W*.13);
      paintSky(X.back, W, hz, col, r, s, { top:"#0A0722", mid:"#211546", low:"#4A2268", hor:"#A03E72" });
      paintMoon(X.back, sx, hz*.36, R, col);
      X.back.drawImage(mountains(W, H, r, { base:hz, amp:H*.22, top:mix("#33205E", col, .1), bottom:mix("#20123E", col, .05), rim:rgba(mix(col, "#FFFFFF", .3), .4), scale:s }), 0, 0);
      const m = X.mid, cx = W - sx*.5 - W*.15, u = Math.min(W, H*1.6)/700, base = hz + H*.04;
      m.fillStyle = "#0E0824";
      m.beginPath(); m.moveTo(cx - 200*u, H); m.lineTo(cx - 150*u, base - 30*u); m.lineTo(cx + 160*u, base - 34*u); m.lineTo(cx + 230*u, H); m.closePath(); m.fill();
      const tower = (x0, w, h, cap) => { m.fillRect(x0, base - 30*u - h, w, h); for (let i = 0; i < 4; i++) m.fillRect(x0 + i*w/3.5, base - 30*u - h - 7*u, w/7, 8*u); if (cap){ m.beginPath(); m.moveTo(x0 - 4*u, base - 30*u - h); m.lineTo(x0 + w/2, base - 30*u - h - w*1.4); m.lineTo(x0 + w + 4*u, base - 30*u - h); m.closePath(); m.fill(); } };
      m.fillRect(cx - 110*u, base - 90*u, 220*u, 62*u);
      tower(cx - 130*u, 34*u, 110*u, true); tower(cx + 96*u, 34*u, 120*u, true); tower(cx - 30*u, 56*u, 170*u, true); tower(cx - 75*u, 28*u, 90*u, false); tower(cx + 50*u, 28*u, 84*u, false);
      [[-115, -120], [-17, -175], [5, -175], [-17, -140], [108, -128], [-60, -95], [60, -92]].forEach(([dx, dy]) => { glow(m, cx + dx*u + 4*u, base + dy*u + 6*u, 22*u, C.gold, .4); m.fillStyle = "#FFD27A"; m.fillRect(cx + dx*u, base + dy*u, 8*u, 12*u); m.fillStyle = "#0E0824"; });
      m.strokeStyle = "#0E0824"; m.lineWidth = 2*u; m.beginPath(); m.moveTo(cx - 2*u, base - 30*u - 170*u - 78*u); m.lineTo(cx - 2*u, base - 30*u - 170*u - 112*u); m.stroke();
      m.fillStyle = col; m.beginPath(); m.moveTo(cx - 2*u, base - 312*u); m.lineTo(cx + 26*u, base - 304*u); m.lineTo(cx - 2*u, base - 296*u); m.closePath(); m.fill();
      const f = X.front; f.fillStyle = "#0A0620"; f.fillRect(0, hz + H*.1, W, H);
      pines(f, W, H + 2, { fill:"#07051A", minH:H*.2, maxH:H*.42, gap:W*.06, shape:t => t < .3 ? 1 : t > .9 ? .8 : .25 }, r);
      sparks(f, r, W*H/9000, C.orange, 0, hz*.4, W, H*.6, 2*s, 9*s, col);
    }}
  };
  const SCENE_KEYS = [
    ["road",   /\b(dua xe|racing|race|racer|drift|xe|o to|toc do|speed|duong dua|moto)\b/],
    ["desert", /\b(sinh ton|survival|sa mac|desert|bao cat|cat|dune|hoang mac|ai cap|egypt)\b/],
    ["haunt",  /\b(ma|hon ma|ghost|kinh di|horror|cozy|quan ly|management|nong trai|farm|quan tro|nha tro|inn|nau an|cooking)\b/],
    ["forest", /\b(platformer|giai do|puzzle|rung|forest|dom dom|phieu luu|adventure|metroidvania)\b/],
    ["space",  /\b(vu tru|space|ban sung|shooter|shmup|sci ?fi|thien ha|galaxy|hanh tinh|planet|phi thuyen)\b/],
    ["castle", /\b(nhap vai|rpg|fantasy|kiem|sword|dungeon|ham nguc|lau dai|castle|hiep si|knight|roguelike|roguelite)\b/]
  ];
  const sceneOf = g => {
    if (g.scene && SCENES[g.scene]) return g.scene;
    const score = {}, add = (txt, w) => { const f = " " + fold(txt).replace(/[^a-z0-9]+/g, " ") + " "; SCENE_KEYS.forEach(([k, re]) => { if (re.test(f)) score[k] = (score[k] || 0) + w; }); };
    add((g.genres || []).join(" , "), 3); add(g.title, 2); add(g.desc, 1);
    let best = "city", bs = 0; for (const k in score) if (score[k] > bs){ bs = score[k]; best = k; }
    return best;
  };
  const ART = {};
  // vẽ tranh: trả về 1 canvas, hoặc 3 lớp {back, mid, front} khi o.layers = true
  function paintArt(kind, seed, col, W, H, o = {}){
    const key = !o.layers && [kind, seed, col, W, H, o.hz, o.sx].join("|");
    if (key && ART[key]) return copyCanvas(ART[key]);
    const r = rng(hash(seed)), s = Math.max(.45, Math.min(W, H*1.6)/760), sc = SCENES[kind] || SCENES.city;
    const k = { W, H, hz: H*(o.hz ?? sc.hz), s, r, col, sx: W*(o.sx ?? (.3 + r()*.4)) };
    const L = { back: mkCanvas(W, H), mid: mkCanvas(W, H), front: mkCanvas(W, H) };
    sc.paint({ back: L.back.getContext("2d"), mid: L.mid.getContext("2d"), front: L.front.getContext("2d") }, k);
    if (o.layers) return L;
    const x = L.back.getContext("2d"); x.drawImage(L.mid, 0, 0); x.drawImage(L.front, 0, 0); vignette(x, W, H);
    ART[key] = L.back;
    return copyCanvas(L.back);
  }
  const copyCanvas = src => { const c = mkCanvas(src.width, src.height); c.getContext("2d").drawImage(src, 0, 0); return c; };
  // ảnh của game: ảnh thật trong data.js, hoặc tranh tự vẽ theo thể loại
  const gameArt = (g, W, H, o = {}) => {
    if (g.image){ const im = new Image(); im.src = g.image; im.alt = `Ảnh game ${g.title}`; im.decoding = "async"; if (!o.eager) im.loading = "lazy"; im.onerror = () => { const c = drawn(); c.className = im.className; c.style.cssText = im.style.cssText; im.replaceWith(c); }; return im; }
    return drawn();
    function drawn(){ const cv = paintArt(sceneOf(g), g.title, gColor(g), W, H, o); cv.setAttribute("role", "img"); cv.setAttribute("aria-label", `Ảnh minh họa cho ${g.title}`); return cv; }
  };
  const portrait = (el, size) => {
    const draw = () => { el.append(paintArt("city", P.name + "-id", C.pink, size, size, { hz:.7, sx:.5 })); const d = document.createElement("div"); d.className = "ini"; d.textContent = initials(P.name); el.append(d); };
    if (P.avatar){ const im = new Image(); im.src = P.avatar; im.alt = `Ảnh đại diện của ${P.name}`; im.onerror = () => { im.remove(); draw(); }; el.append(im); return; }
    draw();
  };

  /* =========================================================
     CẢNH 3D TRANG CHỦ (WebGL): bầu trời, mặt trời sọc, thành phố,
     núi khung lưới bay tới, đom đóm. Máy không hỗ trợ WebGL thì
     tự quay về cảnh vẽ 2D.
     ========================================================= */
  function Hero3D(cv, opt){
    let gl;
    try { gl = cv.getContext("webgl", { antialias:true, alpha:false, depth:true, stencil:false, premultipliedAlpha:false, preserveDrawingBuffer:false, powerPreference:"high-performance" }); } catch(e){ gl = null; }
    if (!gl || !gl.getExtension("OES_standard_derivatives")) return null;

    const NOISE = `
      float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      float vnoise(vec2 p, float per){
        vec2 i = floor(p), f = fract(p), u = f*f*(3.0 - 2.0*f);
        float y0 = mod(i.y, per), y1 = mod(i.y + 1.0, per);
        return mix(mix(hash(vec2(i.x, y0)), hash(vec2(i.x + 1.0, y0)), u.x), mix(hash(vec2(i.x, y1)), hash(vec2(i.x + 1.0, y1)), u.x), u.y);
      }
      float fbm(vec2 p, float per){ float s = 0.0, a = 0.5; for (int k = 0; k < 5; k++){ s += a*vnoise(p, per); p *= 2.0; per *= 2.0; a *= 0.5; } return s; }
    `;
    // dùng chung cho nền và núi: tô lưới sàn + sương + phản chiếu mặt trời
    const SHADE = `
      uniform vec3 uLine, uLine2, uFog, uGround, uSunCol, uSunDir;
      uniform float uCell;
      vec3 grid(vec2 g, float dist, vec3 base, float boost){
        vec2 gw = max(fwidth(g), vec2(1e-4));
        vec2 d = abs(fract(g - 0.5) - 0.5) / gw;
        float m = min(d.x, d.y);
        float core = 1.0 - smoothstep(0.2, 1.4, m);
        float glow = exp(-m*0.3);
        float lod = 1.0 - smoothstep(0.16, 0.6, max(gw.x, gw.y));
        vec3 lc = mix(uLine, uLine2, smoothstep(12.0, 75.0, dist));
        return base + lc*((core*1.15 + glow*0.32)*lod + 0.16*(1.0 - lod))*boost;
      }
      vec3 floorLight(vec3 dir, vec3 col, float dist){
        vec3 r = normalize(vec3(dir.x, -dir.y, dir.z));
        float s = max(dot(r, uSunDir), 0.0);
        float streak = exp(-abs(atan(r.x, -r.z) - atan(uSunDir.x, -uSunDir.z))*14.0) * smoothstep(0.0, 0.9, s);
        col += uSunCol*(pow(s, 90.0)*0.9 + streak*0.35);
        float fog = smoothstep(14.0, 120.0, dist);
        float sh = pow(max(dot(normalize(vec3(dir.x, 0.0, dir.z)), normalize(vec3(uSunDir.x, 0.0, uSunDir.z))), 0.0), 60.0);
        vec3 fc = uFog + uSunCol*sh*.55;
        return mix(col, fc, fog*fog*0.92 + fog*0.08);
      }
    `;
    const VS_BG = `attribute vec2 aP; void main(){ gl_Position = vec4(aP, 0.0, 1.0); }`;
    const FS_BG = `#extension GL_OES_standard_derivatives : enable
      precision highp float;
      uniform vec2 uRes, uShift; uniform float uF, uAsp, uTime, uTravel, uSunR;
      uniform vec3 uCam; uniform mat3 uRot; uniform vec4 uShoot;
      ${NOISE}${SHADE}
      void main(){
        vec2 ndc = gl_FragCoord.xy/uRes*2.0 - 1.0 - uShift;
        vec3 d = normalize(uRot*vec3(ndc.x*uAsp/uF, ndc.y/uF, -1.0));
        float hl = length(d.xz), el = d.y/hl, az = atan(d.x, -d.z);
        // ---- bầu trời
        float h = clamp(el*2.4, 0.0, 1.0);
        vec3 sky = mix(vec3(.80,.24,.47), vec3(.30,.09,.40), smoothstep(0.0, .22, h));
        sky = mix(sky, vec3(.10,.05,.24), smoothstep(.18, .6, h));
        sky = mix(sky, vec3(.025,.016,.07), smoothstep(.5, 1.0, h));
        float sd = dot(d, uSunDir);
        sky += uSunCol*pow(max(sd, 0.0), 30.0)*0.55 + vec3(1.,.42,.35)*pow(max(sd, 0.0), 6.0)*0.18;
        // tinh vân mờ
        float nb = fbm(vec2(az*2.2 + uTime*.006, el*5.0), 1e4);
        sky += vec3(.42,.16,.62)*smoothstep(.45, .85, nb)*.32*smoothstep(.05, .5, h) + vec3(.9,.25,.5)*smoothstep(.55, .9, fbm(vec2(az*3.1 - 4.0, el*7.0 + 2.0), 1e4))*.12*smoothstep(.02, .3, h);
        // sao
        vec2 sg = vec2(az, el)*vec2(130.0, 130.0);
        vec2 si = floor(sg), sf = fract(sg) - 0.5;
        float sr = hash(si);
        if (sr > .86){
          vec2 o = vec2(hash(si + 3.1), hash(si + 7.7)) - 0.5;
          float tw = .55 + .45*sin(uTime*(1.0 + sr*3.0) + sr*40.0);
          float st = smoothstep(.09 + (sr - .86)*1.4, 0.0, length(sf - o*.6))*tw;
          sky += mix(vec3(1.,.85,.95), vec3(.8,.9,1.), hash(si + 1.3))*st*smoothstep(.04, .25, h)*1.3;
        }
        // sao băng
        if (uShoot.w > 0.0){
          vec2 sp = vec2(az, el) - uShoot.xy; vec2 dir = normalize(vec2(1.0, -.45));
          float along = dot(sp, dir), across = abs(dot(sp, vec2(-dir.y, dir.x)));
          float L = .32;
          float k = smoothstep(-L, 0.0, along)*step(along, 0.0)*smoothstep(.003, 0.0, across);
          sky += vec3(1.,.9,.97)*k*(1.0 + along/L)*uShoot.w*1.6;
        }
        // ---- mặt trời sọc
        vec3 right = normalize(cross(uSunDir, vec3(0.,1.,0.))), up = cross(right, uSunDir);
        vec2 sl = vec2(dot(d, right), dot(d, up))/uSunR;
        float sdist = length(sl);
        float disk = smoothstep(1.0, .985, sdist);
        float band = sl.y;
        float stripe = 1.0;
        if (band < .1){
          float t = (0.1 - band)/1.1;
          float per = 0.115;
          float ph = fract((band + uTime*.022)/per);
          float gap = .07 + t*.62;
          stripe = smoothstep(gap - .03, gap + .03, ph);
        }
        vec3 sunC = mix(vec3(1.,.95,.72), vec3(1.,.78,.36), smoothstep(.9, .2, band));
        sunC = mix(sunC, vec3(1.,.5,.3), smoothstep(.25, -.35, band));
        sunC = mix(sunC, vec3(1.,.3,.6), smoothstep(-.3, -.95, band));
        vec3 col = mix(sky, sunC*1.08, disk*stripe);
        col += uSunCol*smoothstep(1.6, 1.0, sdist)*.10*(1.0 - disk*stripe);
        // ---- núi xa (2 lớp)
        float m1 = (fbm(vec2(az*3.0 + 11.0, 0.0), 1e4) - .25)*.11 + .012;
        m1 *= .45 + .55*smoothstep(.05, .5, abs(az - atan(uSunDir.x, -uSunDir.z)));
        float m2 = (fbm(vec2(az*5.5 - 3.0, 4.0), 1e4) - .3)*.07 + .006;
        m2 *= .3 + .7*smoothstep(.08, .55, abs(az - atan(uSunDir.x, -uSunDir.z)));
        if (el < m1 && el > -.02){ float e = smoothstep(m1 - .004, m1, el); col = mix(vec3(.23,.10,.36), vec3(1.,.55,.75)*.85, e*.8); col = mix(col, vec3(.85,.3,.55), .25); }
        if (el < m2 && el > -.02){ float e = smoothstep(m2 - .003, m2, el); col = mix(vec3(.13,.05,.22), vec3(1.,.45,.7), e*.85); }
        // ---- thành phố ở cuối đường chân trời
        float caz = az - atan(uSunDir.x, -uSunDir.z);
        float bw = .0125, bid = floor(caz/bw), bx = fract(caz/bw);
        float bh = (pow(hash(vec2(bid, 7.0)), 2.2)*.085 + .012)*smoothstep(.62, .12, abs(caz))*(.4 + .6*smoothstep(.0, .05, abs(caz)));
        float gapB = step(.06, bx)*step(bx, .97);
        if (el < bh && el > -.01 && gapB > 0.5){
          vec3 bc = vec3(.055,.026,.10);
          vec2 wg = vec2(bx*6.0, el*240.0); vec2 wi = floor(wg), wf = fract(wg);
          float lit = step(.72, hash(wi + bid*13.0))*step(.25, wf.x)*step(wf.x, .75)*step(.3, wf.y)*step(wf.y, .7)*step(el, bh - .004);
          vec3 wc = mix(vec3(1.,.78,.4), vec3(1.,.45,.75), hash(wi + bid));
          bc += wc*lit*.9;
          float top = smoothstep(bh - .0015, bh, el);
          bc += vec3(1.,.4,.6)*top*.6;
          col = bc;
        }
        // ---- sàn lưới phẳng phía xa
        float t = uCam.y/max(-d.y, 1e-3);
        vec3 hp = uCam + d*t;
        vec2 g = vec2(hp.x, hp.z - uTravel)/uCell;
        vec3 fl = grid(g, t, uGround, 1.0);
        fl = floorLight(d, fl, t);
        float below = smoothstep(.0005, -.0015, el);
        col = mix(col, fl, below);
        // dải sáng đường chân trời
        col += vec3(1.,.38,.62)*exp(-abs(el)*90.0)*.35 + vec3(1.,.55,.4)*exp(-abs(el)*400.0)*.4*smoothstep(.9, .0, abs(caz));
        gl_FragColor = vec4(col, 1.0);
      }`;
    const VS_MESH = `
      attribute vec2 aXZ;
      uniform mat4 uPV; uniform vec2 uShift; uniform float uTravel, uStep, uPer;
      varying vec3 vW; varying float vH;
      ${NOISE}
      void main(){
        float off = mod(uTravel, uStep);
        float z = aXZ.y + off;
        float nz = (z - uTravel)*.07;
        float ax = abs(aXZ.x);
        float valley = smoothstep(5.5, 19.0, ax);
        float n = fbm(vec2(aXZ.x*.07 + 3.0, nz), uPer);
        float hgt = valley*(pow(n, 1.7)*15.0 + valley*1.2) + smoothstep(30.0, 56.0, ax)*5.0*n;
        hgt *= smoothstep(-112.0, -84.0, z)*(.5 + .5*smoothstep(-3.0, -28.0, z));
        vW = vec3(aXZ.x, hgt, z); vH = hgt/16.0;
        gl_Position = uPV*vec4(vW, 1.0);
        gl_Position.xy += uShift*gl_Position.w;
      }`;
    const FS_MESH = `#extension GL_OES_standard_derivatives : enable
      precision highp float;
      uniform vec3 uCam; uniform float uTravel;
      varying vec3 vW; varying float vH;
      ${SHADE}
      void main(){
        vec3 toC = vW - uCam; float dist = length(toC);
        vec3 N = normalize(cross(dFdx(vW), dFdy(vW)));
        vec3 V = -toC/dist;
        float rim = pow(1.0 - clamp(abs(dot(N, V)), 0.0, 1.0), 3.0);
        float hh = clamp(vH, 0.0, 1.0);
        vec3 base = mix(uGround, vec3(.10,.04,.20), smoothstep(.0, .5, hh));
        base += vec3(.9,.25,.55)*rim*.22*smoothstep(.02, .25, hh);
        vec2 g = vec2(vW.x, vW.z - uTravel)/uCell;
        vec3 c = grid(g, dist, base, 1.0 + hh*.35);
        c += vec3(.25,.85,1.)*smoothstep(.45, 1.0, hh)*.14;
        c = floorLight(toC/dist, c, dist);
        gl_FragColor = vec4(c, 1.0);
      }`;
    const VS_PT = `
      attribute vec4 aP;
      uniform mat4 uPV; uniform vec2 uShift; uniform float uTime, uTravel, uPx;
      varying float vA, vC;
      void main(){
        float z = -mod(-aP.z - uTravel*.8, 92.0) - 3.0;
        vec3 p = vec3(aP.x + sin(uTime*.5 + aP.w*10.0)*.7, aP.y + sin(uTime*.8 + aP.w*6.28)*.35, z);
        gl_Position = uPV*vec4(p, 1.0);
        gl_Position.xy += uShift*gl_Position.w;
        float w = gl_Position.w;
        gl_PointSize = clamp((.05 + aP.w*.1)*uPx/max(w, .1), 1.0, 28.0);
        vA = (.45 + .55*sin(uTime*(1.5 + aP.w*2.0) + aP.w*40.0))*smoothstep(-95.0, -60.0, z)*smoothstep(-3.0, -9.0, z);
        vC = aP.w;
      }`;
    const FS_PT = `precision mediump float;
      varying float vA, vC;
      void main(){
        float r = length(gl_PointCoord - .5)*2.0;
        float a = pow(max(1.0 - r, 0.0), 2.2)*vA;
        vec3 c = mix(vec3(1.,.78,.36), vec3(1.,.42,.7), step(.62, vC));
        gl_FragColor = vec4(c*a + vec3(1.)*pow(max(1.0 - r*2.2, 0.0), 3.0)*vA*.6, a);
      }`;

    const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)){ const e = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error(e); } return s; };
    const program = (vs, fs) => { const p = gl.createProgram(); gl.attachShader(p, compile(gl.VERTEX_SHADER, vs)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++){ const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, "")] = gl.getUniformLocation(p, a.name); } return { p, u, a: name => gl.getAttribLocation(p, name) }; };
    let P;
    try { P = { bg: program(VS_BG, FS_BG), mesh: program(VS_MESH, FS_MESH), pt: program(VS_PT, FS_PT) }; }
    catch(e){ if (window.console) console.warn("Hero3D:", e.message); return null; }

    // tam giác phủ màn hình
    const bgBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    // lưới địa hình
    const GX = 120, GZ = 132, X0 = -62, X1 = 62, Z0 = -2, Z1 = -114, STEP = (Z0 - Z1)/GZ;
    const verts = new Float32Array((GX + 1)*(GZ + 1)*2);
    for (let j = 0, k = 0; j <= GZ; j++) for (let i = 0; i <= GX; i++){ verts[k++] = X0 + (X1 - X0)*i/GX; verts[k++] = Z0 - STEP*j; }
    const idx = new Uint16Array(GX*GZ*6);
    for (let j = 0, k = 0; j < GZ; j++) for (let i = 0; i < GX; i++){ const a = j*(GX + 1) + i, b = a + 1, c = a + GX + 1, d = c + 1; idx.set([a, c, b, b, c, d], k); k += 6; }
    const meshBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf); gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const ibuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    // đom đóm
    const NP = 170, pts = new Float32Array(NP*4), pr = rng(77);
    for (let i = 0; i < NP; i++){ const side = pr() < .5 ? -1 : 1; pts.set([ (pr() < .3 ? (pr() - .5)*8 : side*(3 + pr()*26)), .4 + pr()*7, -pr()*92, pr() ], i*4); }
    const ptBuf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf); gl.bufferData(gl.ARRAY_BUFFER, pts, gl.STATIC_DRAW);

    const hex3 = h => rgb(h).map(v => v/255);
    const COL = { line: hex3("#FF4F9A"), line2: hex3("#9A6BFF"), fog: hex3("#8A2A62"), ground: hex3("#0E0620"), sunCol: hex3("#FF8A5C") };
    const PER = 64, SPEED = 3.2;
    const st = { W:1, H:1, dpr:1, scale:1, mx:0, my:0, tmx:0, tmy:0, travel:0, last:0, shoot:null, nextShoot:4, scroll:0 };
    const S = { fov:50, vx:.66, hz:.64, camH:2.3 };

    function resize(){
      const r = cv.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height);
      st.dpr = Math.min(window.devicePixelRatio || 1, opt.maxDpr || 1.5);
      // giới hạn tổng số điểm ảnh (màn 2K/4K): cảnh tô từng điểm ảnh nên chi phí tăng theo diện tích
      if (opt.maxPx && w*h*st.dpr*st.dpr > opt.maxPx) st.dpr = Math.sqrt(opt.maxPx/(w*h));
      st.dpr *= st.scale;
      cv.width = Math.round(w*st.dpr); cv.height = Math.round(h*st.dpr);
      st.W = w; st.H = h;
      const portrait = w < 700 || h > w*1.05;
      S.fov = portrait ? 62 : 48; S.vx = portrait ? .5 : (w < 1000 ? .6 : .66); S.hz = portrait ? .42 : .63;
    }
    const mul = (a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++){ let s = 0; for (let k = 0; k < 4; k++) s += a[k*4 + r]*b[c*4 + k]; o[c*4 + r] = s; } return o; };
    function frame(now){
      const t = now/1000, dt = Math.min(.1, st.last ? t - st.last : 0); st.last = t;
      if (!opt.still) st.travel = (st.travel + dt*SPEED) % (PER/.07);
      st.mx += (st.tmx - st.mx)*.04; st.my += (st.tmy - st.my)*.04;
      const W = cv.width, H = cv.height, asp = W/H;
      gl.viewport(0, 0, W, H);
      const f = 1/Math.tan(S.fov*Math.PI/360);
      const yaw = st.mx*.045, pitch = -.012 + st.my*.02 - st.scroll*.08;
      const cam = [st.mx*1.4, S.camH + st.scroll*1.6 - st.my*.25, 0];
      const shift = [(S.vx - .5)*2, (1 - S.hz)*2 - 1];
      // ma trận
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      // R = Ry(yaw) * Rx(pitch) (camera -> world), cột-major
      const R = [cy, 0, -sy,  sy*sp, cp, cy*sp,  sy*cp, -sp, cy*cp];
      const n = .1, fa = 400, nf = 1/(n - fa);
      const proj = new Float32Array([f/asp,0,0,0, 0,f,0,0, 0,0,(fa + n)*nf,-1, 0,0,2*fa*n*nf,0]);
      // view = R^T * T(-cam)
      const Rt = [R[0], R[3], R[6], R[1], R[4], R[7], R[2], R[5], R[8]];
      const view = new Float32Array([Rt[0],Rt[1],Rt[2],0, Rt[3],Rt[4],Rt[5],0, Rt[6],Rt[7],Rt[8],0, 0,0,0,1]);
      view[12] = -(Rt[0]*cam[0] + Rt[3]*cam[1] + Rt[6]*cam[2]);
      view[13] = -(Rt[1]*cam[0] + Rt[4]*cam[1] + Rt[7]*cam[2]);
      view[14] = -(Rt[2]*cam[0] + Rt[5]*cam[1] + Rt[8]*cam[2]);
      const PV = mul(proj, view);
      const sunDir = (() => { const v = [0, .085, -1], l = Math.hypot(...v); return v.map(x => x/l); })();
      const sunR = Math.min(.2, .42*asp/f);
      // sao băng
      if (!opt.still && t > st.nextShoot && !st.shoot){ st.shoot = { az:(Math.random() - .5)*.9, el:.25 + Math.random()*.25, t0:t }; st.nextShoot = t + 6 + Math.random()*8; }
      let shoot = [0,0,0,0];
      if (st.shoot){ const k = (t - st.shoot.t0)/1.1; if (k > 1) st.shoot = null; else shoot = [st.shoot.az + k*.5, st.shoot.el - k*.22, 0, Math.sin(k*Math.PI)]; }

      gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      // nền
      let p = P.bg; gl.useProgram(p.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, bgBuf); const aP = p.a("aP"); gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(p.u.uRes, W, H); gl.uniform2f(p.u.uShift, shift[0], shift[1]); gl.uniform1f(p.u.uF, f); gl.uniform1f(p.u.uAsp, asp);
      gl.uniform1f(p.u.uTime, t); gl.uniform1f(p.u.uTravel, st.travel); gl.uniform1f(p.u.uSunR, sunR);
      gl.uniform3f(p.u.uCam, cam[0], cam[1], cam[2]); gl.uniformMatrix3fv(p.u.uRot, false, new Float32Array(R)); gl.uniform4f(p.u.uShoot, ...shoot);
      setShade(p);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.disableVertexAttribArray(aP);
      // núi
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.clear(gl.DEPTH_BUFFER_BIT);
      p = P.mesh; gl.useProgram(p.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, meshBuf); const aX = p.a("aXZ"); gl.enableVertexAttribArray(aX); gl.vertexAttribPointer(aX, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
      gl.uniformMatrix4fv(p.u.uPV, false, PV); gl.uniform2f(p.u.uShift, shift[0], shift[1]); gl.uniform1f(p.u.uTravel, st.travel); gl.uniform1f(p.u.uStep, STEP); gl.uniform1f(p.u.uPer, PER);
      gl.uniform3f(p.u.uCam, cam[0], cam[1], cam[2]);
      setShade(p);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      gl.disableVertexAttribArray(aX);
      // đom đóm
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthMask(false);
      p = P.pt; gl.useProgram(p.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, ptBuf); const aQ = p.a("aP"); gl.enableVertexAttribArray(aQ); gl.vertexAttribPointer(aQ, 4, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(p.u.uPV, false, PV); gl.uniform2f(p.u.uShift, shift[0], shift[1]); gl.uniform1f(p.u.uTime, t); gl.uniform1f(p.u.uTravel, st.travel); gl.uniform1f(p.u.uPx, f*H/2);
      gl.drawArrays(gl.POINTS, 0, NP);
      gl.disableVertexAttribArray(aQ);
      gl.depthMask(true); gl.disable(gl.BLEND);

      function setShade(p){
        gl.uniform3fv(p.u.uLine, COL.line); gl.uniform3fv(p.u.uLine2, COL.line2); gl.uniform3fv(p.u.uFog, COL.fog); gl.uniform3fv(p.u.uGround, COL.ground);
        gl.uniform3fv(p.u.uSunCol, COL.sunCol); gl.uniform3f(p.u.uSunDir, sunDir[0], sunDir[1], sunDir[2]); gl.uniform1f(p.u.uCell, 2.0);
      }
    }
    resize();
    return {
      gl, resize, frame,
      mouse(x, y){ st.tmx = x; st.tmy = y; },
      scroll(k){ st.scroll = k; },
      quality(s){ st.scale = s; resize(); },
      lost: () => gl.isContextLost(), kind:"3d"
    };
  }

  // cảnh 2D dự phòng (khi trình duyệt không có WebGL): hoàng hôn, núi, thành phố, lưới sàn
  function Hero2D(cv, opt){
    const x = cv.getContext("2d"); if (!x) return null;
    const st = { mx:0, my:0, tmx:0, tmy:0, scroll:0 };
    let W, H, hz, s, R, sky, floor, sunBase, sunWork = null, layers = [], stars = [], flies = [], shoot = null, nextShoot = 6;
    function edgeTowers(LW, H, r, s){
      const c = mkCanvas(LW, H), x2 = c.getContext("2d"), o = { base:H + 4, minW:W*.05, maxW:W*.09, minH:H*.42, maxH:H*.66, gap:W*.02, fill:"#08050F", wins:[C.pink, C.gold], winP:.05, winA:.6, signP:.8, scale:s };
      const side = Math.max(W*.1, 70*s);
      x2.drawImage(skyline(side, H, r, o), -side*.25, 0); x2.drawImage(skyline(side, H, r, o), LW - side*.9, 0);
      return c;
    }
    function resize(){
      W = cv.width = Math.max(1, cv.clientWidth); H = cv.height = Math.max(1, cv.clientHeight); hz = W < 700 ? Math.min(H*.5, innerHeight*.44) : H*.64;
      s = Math.max(1, W/1100); const r = rng(2077), LW = Math.ceil(W*1.12);
      R = W < 700 ? W*.27 : Math.min(W*.16, H*.27);
      sky = x.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, "#0A0818"); sky.addColorStop(.38, "#1A1242"); sky.addColorStop(.7, "#43205F"); sky.addColorStop(.9, "#92306F"); sky.addColorStop(1, "#C9446F");
      floor = x.createLinearGradient(0, hz, 0, H); floor.addColorStop(0, "#26103F"); floor.addColorStop(1, "#0A0818");
      sunBase = sunDisc(R, ["#FFF1BE", C.gold, C.orange, C.pink, "#C93A8E"]);
      layers = [
        mountains(LW, H, r, { base:hz, amp:hz*.2, top:"#3B1F68", bottom:"#28154A", rim:"rgba(255,150,200,.6)", scale:s }),
        skyline(LW, H, r, { base:hz, minW:W*.018, maxW:W*.045, minH:hz*.05, maxH:hz*.17, gap:3*s, fill:"#1D1338", wins:[C.pink, C.gold, C.lilac], winP:.1, winA:.45, scale:s }),
        skyline(LW, H, r, { base:hz + 2, minW:W*.03, maxW:W*.07, minH:hz*.07, maxH:hz*.33, gap:7*s, fill:"#110A24", wins:[C.pink, "#FFFFFF", C.gold, C.violet], winP:.15, winA:.85, signP:.45, blink:true, scale:s }),
        edgeTowers(LW, H, r, s)
      ];
      stars = Array.from({length: Math.round(W*hz/2400)}, () => ({ x:Math.random()*W*1.05, y:Math.random()*hz*.78, z:(Math.random() < .1 ? 2 : 1)*s, p:Math.random()*6.28, v:.5 + Math.random()*1.8 }));
      flies = Array.from({length: Math.round(W*H/15000)}, () => ({ x:Math.random()*W, y:hz*.55 + Math.random()*(H - hz*.55), z:(5 + Math.random()*13)*s, v:(.12 + Math.random()*.45)*s, p:Math.random()*6.28, c:Math.random() < .55 ? C.gold : Math.random() < .6 ? C.pink : C.lilac }));
    }
    const D = [5, 10, 22, 46];
    function frame(now){
      const t = now/1000 + 4, m = st;
      m.mx += (m.tmx - m.mx)*.05; m.my += (m.tmy - m.my)*.05;
      x.fillStyle = sky; x.fillRect(0, 0, W, hz + 2);
      for (const p of stars){ x.fillStyle = `rgba(255,240,255,${(.25 + .75*Math.abs(Math.sin(p.p + t*p.v)))*.85})`; x.fillRect(p.x - m.mx*4, p.y - m.my*3, p.z, p.z); }
      if (!opt.still && t > nextShoot){ shoot = { x:W*(.15 + Math.random()*.55), y:H*(.06 + Math.random()*.18), t0:t }; nextShoot = t + 5 + Math.random()*7; }
      if (shoot){ const k = (t - shoot.t0)/1.1;
        if (k > 1) shoot = null;
        else { const L = 180*s, hx = shoot.x + k*W*.22, hy = shoot.y + k*W*.09, g = x.createLinearGradient(hx, hy, hx - L, hy - L*.41);
          g.addColorStop(0, `rgba(255,245,252,${Math.sin(k*Math.PI)})`); g.addColorStop(1, "rgba(255,141,193,0)"); x.strokeStyle = g; x.lineWidth = 1.6*s; x.beginPath(); x.moveTo(hx, hy); x.lineTo(hx - L, hy - L*.41); x.stroke(); } }
      const cx = W*(W < 700 ? .5 : W < 1000 ? .6 : .66) - m.mx*10, cy = hz - R*.66 + m.my*5;
      x.save(); x.globalCompositeOperation = "lighter";
      let g = x.createRadialGradient(cx, cy, R*.5, cx, cy, R*3); g.addColorStop(0, "rgba(255,122,69,.5)"); g.addColorStop(.45, "rgba(255,79,154,.18)"); g.addColorStop(1, "rgba(255,79,154,0)");
      x.fillStyle = g; x.fillRect(cx - R*3, cy - R*3, R*6, R*6); x.restore();
      sunWork = stripeSun(sunBase, R, opt.still ? .35 : (t*.11) % 1, sunWork);
      x.drawImage(sunWork, cx - R, cy - R);
      x.drawImage(layers[0], -W*.06 - m.mx*D[0], m.my*D[0]*.3);
      g = x.createLinearGradient(0, hz - H*.16, 0, hz); g.addColorStop(0, "rgba(255,79,154,0)"); g.addColorStop(1, "rgba(255,79,154,.24)"); x.fillStyle = g; x.fillRect(0, hz - H*.16, W, H*.16);
      x.drawImage(layers[1], -W*.06 - m.mx*D[1], m.my*D[1]*.3);
      x.drawImage(layers[2], -W*.06 - m.mx*D[2], m.my*D[2]*.3);
      x.fillStyle = floor; x.fillRect(0, hz, W, H - hz);
      floorGrid(x, W, H, hz, C.pink, opt.still ? 0 : (t*.6) % 18, .6, "#26103F", cx);
      reflect(x, cx, hz, H, R*1.3, C.orange);
      horizonLine(x, W, hz, "#FFB3D4", .9);
      x.drawImage(layers[3], -W*.06 - m.mx*D[3], m.my*D[3]*.3);
      x.save(); x.globalCompositeOperation = "lighter";
      for (const f of flies){
        x.globalAlpha = .3 + .6*Math.abs(Math.sin(f.p + t*1.3));
        x.drawImage(sprite(f.c), f.x + Math.sin(f.p + t*.6)*18*s - f.z/2 - m.mx*D[2]*.6, f.y - f.z/2, f.z, f.z);
        if (!opt.still){ f.y -= f.v; if (f.y < hz*.45){ f.y = H + 10; f.x = Math.random()*W; } }
      }
      x.restore();
    }
    resize();
    return { resize, frame, mouse(a, b){ st.tmx = a; st.tmy = b; }, scroll(k){ st.scroll = k; }, quality(){}, lost: () => false, kind:"2d" };
  }

  /* =========================================================
     ÂM THANH UI (tự tổng hợp — không cần file)
     ========================================================= */
  const Snd = {
    on: ls.get("sound") === "1", ctx: null, last: 0, bus: null,
    ensure(){
      if (!this.ctx){ try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); const c = this.ctx.createDynamicsCompressor(); c.connect(this.ctx.destination); this.bus = c; } catch(e){} }
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    },
    tone(f, d, type = "square", vol = .03, to = null, delay = 0, attack = .004){
      if (!this.on || !this.ctx || this.ctx.state !== "running") return;
      const t = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(this.bus); o.start(t); o.stop(t + d + .03);
    },
    noise(d, vol = .05, delay = 0, hp = 800){
      if (!this.on || !this.ctx || this.ctx.state !== "running") return;
      const t = this.ctx.currentTime + delay, n = Math.floor(this.ctx.sampleRate*d), b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), ch = b.getChannelData(0);
      for (let i = 0; i < n; i++) ch[i] = (Math.random()*2 - 1)*(1 - i/n);
      const s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
      s.buffer = b; f.type = "highpass"; f.frequency.value = hp; g.gain.value = vol; s.connect(f).connect(g).connect(this.bus); s.start(t);
    },
    hover(){ const n = performance.now(); if (n - this.last < 50) return; this.last = n; this.tone(1900, .03, "sine", .018); },
    click(){ this.tone(620, .05, "square", .022); this.tone(1240, .08, "sine", .03, null, .04); },
    move(){ this.tone(1320, .035, "triangle", .03); },
    swap(){ this.tone(160, .32, "sawtooth", .02, 1500); this.noise(.25, .025, .02, 2400); },
    whoosh(){ this.noise(.45, .05, 0, 900); this.tone(300, .4, "sine", .02, 90); },
    type(){ this.tone(900 + Math.random()*500, .014, "square", .006); },
    blip(){ this.tone(520 + Math.random()*90, .04, "triangle", .028); },
    obj(){ this.tone(880, .09, "sine", .04); this.tone(1320, .14, "sine", .04, null, .08); },
    ach(){ [784,1047,1319,1568,2093].forEach((f,i) => this.tone(f, .16, "triangle", .045, null, i*.065)); this.tone(392, .5, "sine", .03, null, .05); },
    coin(){ this.tone(988, .06, "square", .03); this.tone(1319, .18, "square", .03, null, .06); },
    crash(){ this.noise(.5, .12, 0, 200); this.tone(220, .5, "sawtooth", .04, 40); },
    start(){ this.tone(55, 1.1, "sawtooth", .045, 880); [523,659,784,1047].forEach((f,i) => this.tone(f, .6, "sine", .035, null, .3 + i*.09, .02)); this.noise(.8, .03, .1, 3000); }
  };
  addEventListener("pointerdown", () => Snd.ensure(), { once:true });
  addEventListener("keydown", () => Snd.ensure(), { once:true });

  /* =========================================================
     KHUNG TRANG CHUNG: HUD, thanh hệ thống, nền, chuyển trang
     ========================================================= */
  const NAV = [["home","index.html","Trang chủ"],["games","games.html","Game"],["profile","profile.html","Hồ sơ"],["journey","journey.html","Nhiệm vụ"],["contact","contact.html","Liên hệ"]];
  const CUR = PAGE === "game" ? "games" : PAGE;
  const SECTOR = { home:"Trung tâm", games:"Thư viện game", game:"Chi tiết game", profile:"Hồ sơ nhân vật", journey:"Nhật ký nhiệm vụ", contact:"Kênh liên lạc", "404":"Vùng mất tín hiệu" }[PAGE] || "";
  const OBJ = [["games","Truy cập thư viện game"],["detail","Xem chi tiết một game"],["profile","Mở hồ sơ nhân vật"],["quest","Đọc một nhiệm vụ trong nhật ký"],["talk","Nói chuyện với NPC ở trang Liên hệ"],["cmd","Chạy một lệnh trong terminal"]];
  const ACH = {
    boot:      ["Kết nối thành công", "Hoàn tất khởi động hệ thống"],
    netrunner: ["Netrunner", "Ghé đủ 5 khu vực trên bản đồ mạng"],
    collector: ["Nhà sưu tầm", `Xem chi tiết ${games.length > 1 ? Math.min(3, games.length) + " game" : "game của bạn"}`],
    hacker:    ["Hacker", "Chạy lệnh trong terminal bảo mật"],
    link:      ["Kết nối mạng lưới", "Mở một kênh liên lạc"],
    campaign:  ["Hoàn thành chiến dịch", "Xong toàn bộ mục tiêu"],
    racer:     ["Tay đua neon", "Đạt 300 điểm trong Neon Drift mini"],
    secret:    ["Mã bí mật", "↑↑↓↓←→←→ B A — đúng chất game thủ"]
  };
  const NODES = { home:[38,78], games:[128,30], profile:[128,126], journey:[230,30], contact:[230,126] };
  const LINKS = [["home","games"],["home","profile"],["games","profile"],["games","journey"],["profile","contact"],["journey","contact"]];
  const navIndex = NAV.findIndex(([k]) => k === CUR);
  const visited = getSet("visited"); if (navIndex >= 0){ visited.add(CUR); putSet("visited", visited); }
  const TRN = 12; // số dải của màn chuyển trang
  const trBands = Array.from({length:TRN}, (_,k) => { const t = k/(TRN - 1); return `<i style="--k:${k};--c1:${mix("#0A0818", "#2A1150", t*t)};--c2:${mix("#0E0A22", "#3A1658", Math.pow((k + 1)/TRN, 2))}"></i>`; }).join("");

  document.body.insertAdjacentHTML("afterbegin", `
    <a class="skip" href="#main">Bỏ qua, tới nội dung chính</a>
    <div class="bg" aria-hidden="true"><i class="bg-a"></i><i class="bg-b"></i><i class="bg-c"></i></div><canvas id="motes" aria-hidden="true"></canvas>
    <div class="fx fx-grain" aria-hidden="true"></div><div class="fx fx-vig" aria-hidden="true"></div><div class="fx fx-flash" id="flash" aria-hidden="true"></div>
    <header class="hud" id="hud">
      <a class="plate" href="index.html" aria-label="Về trang chủ">
        <span class="plate-av"><b>${esc(initials(P.name))}</b></span><span class="plate-lv">LV${esc(P.level)}</span>
        <span class="plate-txt"><span class="plate-name">${esc(P.name)}</span>
          <span class="bars" aria-hidden="true"><span class="bar hp"><em>HP</em><i style="--v:100%"></i></span><span class="bar mp"><em>MP</em><i id="mp" style="--v:80%"></i></span></span></span>
      </a>
      <nav class="tabs" id="tabs" aria-label="Điều hướng chính">
        <span class="tab-hover" id="tabHover" aria-hidden="true"></span><span class="tab-pill" id="tabPill" aria-hidden="true"></span>
        ${NAV.map(([k,h,t],i) => `<a href="${h}" class="${k === CUR ? "on" : ""}" ${k === CUR ? 'aria-current="page"' : ""}><kbd>${i+1}</kbd><span data-scr>${t}</span></a>`).join("")}
      </nav>
      <div class="hud-tools">
        <div class="qwrap">
          <button class="ibtn qbtn" id="qBtn" aria-expanded="false" aria-controls="tracker"><span class="qlabel">Mục tiêu</span><span class="cnt" id="qCnt">0/0</span></button>
          <div class="tracker" id="tracker">
            <p class="ptag">Bản đồ mạng <span>// phím M</span></p>
            <svg class="netmap" id="netmap" viewBox="0 0 270 160" role="img" aria-label="Bản đồ các trang"></svg>
            <p class="ptag">Mục tiêu</p>
            <ul class="objs" id="objs"></ul>
            <p class="hint">Phím 1–5 chuyển trang · M mở bản đồ</p>
          </div>
        </div>
        <button class="ibtn fxbtn" id="fxBtn" aria-pressed="${!reduce}" title="Bật/tắt hiệu ứng chuyển động"><span>FX</span><span class="fx-dot"></span></button>
        <button class="ibtn" id="sndBtn" aria-pressed="false" aria-label="Bật âm thanh"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path id="sOn" d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/><path id="sOff" d="m22 9-6 6m0-6 6 6"/></svg></button>
        ${P.cvFile ? `<a class="ibtn cv" href="${esc(safeUrl(P.cvFile))}" download>Tải CV</a>` : ""}
        <button class="ibtn burger" id="burger" aria-expanded="false" aria-controls="tabs" aria-label="Mở menu"><i></i><i></i><i></i></button>
      </div>
    </header>
    <div class="toasts" id="toasts" aria-live="polite"></div>
    <div class="tip" id="tip" role="tooltip"></div>
    <div class="cur cur-r" id="curR" aria-hidden="true"></div><div class="cur cur-d" id="curD" aria-hidden="true"></div>
    <div class="tr" id="tr" aria-hidden="true"><div class="tr-bands">${trBands}</div>
      <div class="tr-mid"><div class="sunmark"></div><p class="tr-k" id="trK">Đang truy cập</p><p class="tr-to" id="trTo"></p><div class="tr-bar"><i id="trBar"></i></div><div class="tr-meta"><b id="trPct">000%</b><span id="trHex"></span></div></div></div>
    <div class="sprog" id="sprog" aria-hidden="true"></div>`);
  const footerNav = NAV.map(([k,h,t]) => `<a href="${h}" class="${k === CUR ? "on" : ""}">${t}</a>`).join("");
  document.body.insertAdjacentHTML("beforeend", `
    <footer class="foot">
      <div class="foot-scene" aria-hidden="true"><div class="sunmark big"></div><div class="floor"></div></div>
      ${PAGE !== "contact" && PAGE !== "404" ? `<div class="wrap foot-big"><h2><span class="t1">Cùng làm</span><span class="t2">game tiếp theo?</span></h2><div class="foot-cta"><p>Mình luôn sẵn lòng nghe ý tưởng mới, lời mời hợp tác hay chỉ là một câu chào.</p><a class="btn btn-p" href="contact.html">Mở kênh liên lạc ${ICON.arrow}</a></div></div>` : ""}
      <div class="wrap foot-in">
        <span>© ${YEAR} ${esc(P.name)}${P.role ? ` · ${esc(P.role)}` : ""}</span>
        <nav aria-label="Liên kết chân trang">${footerNav}</nav>
        <button class="totop" id="toTop" type="button">Lên đầu trang <span aria-hidden="true">↑</span></button>
      </div>
    </footer>
    <div class="sysbar" aria-hidden="true">
      <span class="sys-sec">Sector <b>${esc(SECTOR)}</b></span>
      <div class="sync"><span>Đồng bộ</span><div class="sync-t"><i id="syncI"></i></div><b id="syncP">0%</b></div>
      <span class="sys-fps">FPS <b id="fps">--</b></span>
      <span class="sys-node">${esc(ID)}</span>
      <span><b id="clock">--:--:--</b></span>
    </div>`);

  /* ---------- thông báo, mục tiêu, thành tựu ---------- */
  const toast = (html, cls = "") => {
    const t = document.createElement("div"); t.className = "toast " + cls; t.innerHTML = html; $("toasts").append(t);
    while ($("toasts").children.length > 3) $("toasts").firstElementChild.remove();
    setTimeout(() => { t.classList.add("bye"); setTimeout(() => t.remove(), 500); }, cls.includes("obj") ? 3200 : cls.includes("info") ? 2600 : 4600);
  };
  const unlock = id => {
    const got = getSet("ach"); if (got.has(id) || !ACH[id]) return; got.add(id); putSet("ach", got);
    toast(`<div class="toast-ic">${ICON.trophy}</div><div class="toast-tx"><small>Thành tựu mở khóa · ${got.size}/${Object.keys(ACH).length}</small><b>${ACH[id][0]}</b><span>${ACH[id][1]}</span></div>`, "t-ach");
    Snd.ach();
    document.dispatchEvent(new CustomEvent("ach", { detail:id }));
  };
  const objDone = getSet("obj");
  const renderTracker = () => {
    $("objs").innerHTML = OBJ.map(([k,t]) => `<li class="${objDone.has(k) ? "done" : ""}"><span>${t}</span></li>`).join("");
    $("qCnt").textContent = `${objDone.size}/${OBJ.length}`;
    let s = LINKS.map(([a,b]) => { const on = visited.has(a) && visited.has(b); return `<line class="${on ? "ln-on" : ""}" x1="${NODES[a][0]}" y1="${NODES[a][1]}" x2="${NODES[b][0]}" y2="${NODES[b][1]}"/>`; }).join("");
    NAV.forEach(([k,h,t],i) => { const [cx,cy] = NODES[k], hx = Array.from({length:6}, (_,j) => { const a = Math.PI/3*j + Math.PI/6; return `${(cx + Math.cos(a)*12).toFixed(1)},${(cy + Math.sin(a)*12).toFixed(1)}`; }).join(" ");
      s += `<g class="${k === CUR ? "here" : visited.has(k) ? "seen" : ""}" data-h="${h}" tabindex="0" role="link" aria-label="${t}">${k === CUR ? `<circle class="pulse" cx="${cx}" cy="${cy}" r="12"/>` : ""}<polygon points="${hx}"/><text x="${cx}" y="${cy + (cy > 80 ? 28 : -19)}" text-anchor="middle">${i+1}·${t}</text></g>`; });
    $("netmap").innerHTML = s;
    const p = Math.round((visited.size + objDone.size)/(NAV.length + OBJ.length)*100);
    $("syncI").style.width = p + "%"; $("syncP").textContent = p + "%";
  };
  const completeObj = k => {
    if (objDone.has(k)) return; objDone.add(k); putSet("obj", objDone); renderTracker();
    const t = OBJ.find(o => o[0] === k);
    toast(`<div class="toast-ic">${ICON.check}</div><div class="toast-tx"><small>Mục tiêu hoàn thành · ${objDone.size}/${OBJ.length}</small><b>${t ? t[1] : ""}</b></div>`, "obj");
    Snd.obj(); $("qBtn").classList.remove("ping"); void $("qBtn").offsetWidth; $("qBtn").classList.add("ping");
    if (objDone.size === OBJ.length) setTimeout(() => unlock("campaign"), 1200);
  };
  renderTracker();
  if (visited.size >= NAV.length) setTimeout(() => unlock("netrunner"), 1600);

  const tracker = $("tracker");
  const setTracker = o => { tracker.classList.toggle("open", o); $("qBtn").setAttribute("aria-expanded", o); };
  $("qBtn").addEventListener("click", e => { e.stopPropagation(); setTracker(!tracker.classList.contains("open")); Snd.click(); });
  document.addEventListener("click", e => { if (!e.target.closest(".qwrap")) setTracker(false); if (!e.target.closest(".hud")) setMenu(false); });
  $("netmap").addEventListener("click", e => { const g = e.target.closest("g[data-h]"); if (g) go(g.dataset.h); });
  $("netmap").addEventListener("keydown", e => { const g = e.target.closest("g[data-h]"); if (g && e.key === "Enter") go(g.dataset.h); });

  /* ---------- âm thanh, menu, đồng hồ ---------- */
  const setSound = on => {
    Snd.on = on; if (on) Snd.ensure(); ls.set("sound", on ? "1" : "0");
    $("sndBtn").setAttribute("aria-pressed", on); $("sndBtn").setAttribute("aria-label", on ? "Tắt âm thanh" : "Bật âm thanh");
    $("sOn").style.display = on ? "" : "none"; $("sOff").style.display = on ? "none" : "";
  };
  setSound(Snd.on);
  $("fxBtn").addEventListener("click", () => { ls.set("fx", reduce ? "1" : "0"); Snd.click(); location.reload(); });
  $("sndBtn").addEventListener("click", () => { setSound(!Snd.on); Snd.click(); });
  document.addEventListener("pointerover", e => { const el = e.target.closest("a,button,.item,[data-hover]"); if (el && !el.contains(e.relatedTarget)) Snd.hover(); });
  const hud = $("hud");
  const setMenu = o => { hud.classList.toggle("open", o); $("burger").setAttribute("aria-expanded", o); $("burger").setAttribute("aria-label", o ? "Đóng menu" : "Mở menu"); };
  $("burger").addEventListener("click", e => { e.stopPropagation(); setMenu(!hud.classList.contains("open")); Snd.click(); });
  const tick = () => { const d = new Date(); $("clock").textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  tick(); setInterval(tick, 1000);
  $("toTop").addEventListener("click", () => scrollTo({ top:0, behavior: reduce ? "auto" : "smooth" }));
  let hudSolid = false;
  const hudScroll = () => { const s = scrollY > 24; if (s !== hudSolid){ hudSolid = s; hud.classList.toggle("solid", s); } };
  addEventListener("scroll", hudScroll, { passive:true }); hudScroll();

  // chữ giải mã khi rê chuột
  const GLYPH = "▓▒░█<>/\\_=+*#01アイウエオカキクケコ";
  // chữ nhảy loạn rồi hiện dần. Mỗi từ được giữ đúng bề rộng của chữ thật trong lúc chạy,
  // nên ký tự thay thế rộng hơn cũng không làm tiêu đề dài bị xuống dòng hay đẩy bố cục
  const scramble = (el, text = el.dataset.t || el.textContent, dur = 480) => {
    if (reduce){ el.textContent = text; return; }
    // đang xáo đúng chữ này thì thôi: thay các ô chữ dưới con trỏ có thể làm trình duyệt báo "rê chuột vào" lần nữa
    if (el._busy && el.dataset.t === text) return;
    el.dataset.t = text; cancelAnimationFrame(el._r); el._busy = true;
    // dùng lại các ô chữ đã có (không xóa phần tử dưới con trỏ), chưa có thì tạo
    if (el._src !== text || !el.querySelector(".scw")){
      const parts = text.split(/(\s+)/);
      el.innerHTML = parts.map(w => w && !/^\s+$/.test(w) ? `<span class="scw">${esc(w)}</span>` : esc(w)).join("");
      el._src = text;
    }
    const words = [...el.querySelectorAll(".scw")], max = el.clientWidth || Infinity;
    words.forEach(s => { s.classList.remove("on"); s.style.width = ""; });
    const ws = words.map(s => s.getBoundingClientRect().width);
    const real = text.split(/\s+/).filter(Boolean);
    const slots = words.map((s, i) => {
      const ch = [...(real[i] || s.textContent)], fix = ws[i] > max;    // từ dài hơn cả khung: để nguyên, không xáo
      s.style.width = ws[i] + "px"; s.classList.add("on");
      return { s, ch, fix, at: ch.map(() => Math.random()*.7) };
    });
    const st = performance.now();
    const step = n => {
      const k = (n - st)/dur;
      if (k >= 1.05){ slots.forEach(w => { w.s.textContent = w.ch.join(""); w.s.classList.remove("on"); w.s.style.width = ""; }); el._busy = false; return; }
      for (const w of slots) if (!w.fix) w.s.textContent = w.ch.map((c, i) => k > w.at[i] + .3 ? c : GLYPH[Math.floor(Math.random()*GLYPH.length)]).join("");
      el._r = requestAnimationFrame(step);
    };
    el._r = requestAnimationFrame(step);
  };
  document.querySelectorAll("[data-scr]").forEach(el => { el.dataset.t = el.textContent; el.closest("a").addEventListener("pointerenter", () => scramble(el)); });

  /* ---------- vệt sáng chỉ tab đang mở (trượt theo khi đổi trang / rê chuột) ---------- */
  const tabs = $("tabs"), tabLinks = [...tabs.querySelectorAll("a")];
  const placePill = (el, pill, instant) => {
    if (!el){ pill.style.opacity = 0; return; }
    if (instant) pill.style.transition = "none";
    pill.style.setProperty("--x", el.offsetLeft + "px"); pill.style.setProperty("--w", el.offsetWidth + "px"); pill.style.opacity = 1;
    if (instant){ void pill.offsetWidth; pill.style.transition = ""; }
  };
  const syncPills = () => { if (getComputedStyle(tabs).flexDirection === "column") return; placePill(tabLinks[navIndex], $("tabPill"), true); };
  const fromTab = +ss.get("tabFrom");
  ss.del("tabFrom");
  requestAnimationFrame(() => {
    if (getComputedStyle(tabs).flexDirection === "column") return;
    if (!reduce && fromTab >= 0 && fromTab !== navIndex && tabLinks[fromTab] && document.documentElement.classList.contains("transit")){
      placePill(tabLinks[fromTab], $("tabPill"), true); setTimeout(() => placePill(tabLinks[navIndex], $("tabPill")), 420);
    } else placePill(tabLinks[navIndex], $("tabPill"), true);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncPills);
  addEventListener("resize", syncPills);
  tabLinks.forEach(a => a.addEventListener("pointerenter", () => placePill(a, $("tabHover"))));
  tabs.addEventListener("pointerleave", () => { $("tabHover").style.opacity = 0; });

  /* ---------- chuyển trang ---------- */
  const tr = $("tr");
  const labelFor = href => { const f = href.split(/[?#]/)[0].split("/").pop() || "index.html"; const n = NAV.find(([,h]) => h === f); if (n) return n[0] === "home" ? "Trung tâm" : SECTORS[n[0]]; if (f === "game.html"){ const m = href.match(/id=(\d+)/), g = games[m ? +m[1] : featuredIndex]; return g ? g.title : "Chi tiết game"; } return "Trang mới"; };
  const SECTORS = { games:"Thư viện game", profile:"Hồ sơ nhân vật", journey:"Nhật ký nhiệm vụ", contact:"Kênh liên lạc" };
  let leaving = false;
  const hexAddr = () => "0x" + Math.floor(Math.random()*0xFFFFFF).toString(16).toUpperCase().padStart(6, "0");
  // thanh tải trong màn chuyển trang: chạy từ `from` đến `to` phần trăm
  const trLoad = (from, to, dur) => {
    const t0 = performance.now();
    const step = n => { const k = clamp((n - t0)/dur, 0, 1), v = Math.round(from + (to - from)*(1 - Math.pow(1 - k, 2)));
      $("trBar").style.width = v + "%"; $("trPct").textContent = pad(v, 3) + "%"; $("trHex").textContent = `ADDR ${hexAddr()} · PKT ${pad(Math.floor(v*1.27), 3)}`;
      if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  function go(href){
    if (leaving) return; leaving = true;
    setMenu(false); setTracker(false);
    if (reduce){ location.href = href; return; }
    ss.set("transit","1"); if (navIndex >= 0) ss.set("tabFrom", navIndex);
    const to = labelFor(href); $("trK").textContent = "Đang truy cập"; $("trTo").textContent = to; scramble($("trTo"), to, 420);
    document.body.classList.remove("arrive"); document.body.classList.add("leaving");
    tr.classList.remove("out","cover"); void tr.offsetWidth; tr.classList.add("in"); Snd.swap();
    trLoad(0, 72, 560);
    setTimeout(() => location.href = href, 620);
  }
  document.addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a || e.defaultPrevented) return;
    const href = a.getAttribute("href") || "";
    if (a.target === "_blank" || a.hasAttribute("download") || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button) return;
    if (!href || href.startsWith("#") || /^(mailto:|tel:|https?:|\/\/|javascript:)/i.test(href)) return;
    e.preventDefault(); go(href);
  });
  if (document.documentElement.classList.contains("transit")){
    tr.classList.add("cover"); $("trK").textContent = "Kết nối thiết lập"; $("trTo").textContent = SECTOR; $("trBar").style.width = "72%"; $("trPct").textContent = "072%";
    ss.del("transit");
    document.body.classList.add("arrive"); trLoad(72, 100, 300);
    requestAnimationFrame(() => document.documentElement.classList.remove("transit"));
    setTimeout(() => { tr.classList.remove("cover"); tr.classList.add("out"); }, 260);
    setTimeout(() => document.body.classList.remove("arrive"), 1900);
  }
  addEventListener("pageshow", e => { if (e.persisted){ leaving = false; document.body.classList.remove("leaving"); tr.classList.remove("in","cover"); tr.classList.add("out"); } });

  /* ---------- con trỏ: vòng tròn ôm lấy nút khi rê qua ---------- */
  const cur = { x:-200, y:-200, rx:-200, ry:-200, w:34, h:34, r:17, snap:null, br:17, down:false };
  const SNAP = ".btn,.ibtn,.tabs a,.more,.ftabs button,.qtabs button,.cmds button,.pv-nav,.lib-nav,.shelf-nav button,.totop,.plate,.chip-a";
  if (finePointer && !reduce){
    document.body.classList.add("has-cursor");
    addEventListener("pointermove", e => {
      cur.x = e.clientX; cur.y = e.clientY; document.body.classList.add("cur-on");
      const t = e.target.closest ? e.target : null, sn = t && t.closest(SNAP);
      if (sn !== cur.snap){ cur.snap = sn; if (sn){ const cs = getComputedStyle(sn); cur.br = parseFloat(cs.borderTopLeftRadius) || 12; } }
      $("curR").classList.toggle("hot", !sn && !!(t && t.closest("a,button,input,.item,.slot,.qitem,g[data-h],[data-hover]")));
      document.body.classList.toggle("cur-text", !!(t && t.closest("input,textarea")));
    }, { passive:true });
    addEventListener("pointerdown", e => { cur.down = true; const r = document.createElement("div"); r.className = "ripple"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px"; document.body.append(r); setTimeout(() => r.remove(), 560); });
    addEventListener("pointerup", () => cur.down = false);
    document.addEventListener("mouseleave", () => { document.body.classList.remove("cur-on"); });
  }
  const drawCursor = () => {
    let tx = cur.x, ty = cur.y, tw = cur.down ? 24 : 34, th = tw, tr2 = tw/2;
    if (cur.snap && cur.snap.isConnected){ const b = cur.snap.getBoundingClientRect(); tx = b.left + b.width/2; ty = b.top + b.height/2; tw = b.width + 10; th = b.height + 10; tr2 = cur.br + 5; }
    const k = cur.snap ? .3 : .22;
    cur.rx += (tx - cur.rx)*k; cur.ry += (ty - cur.ry)*k; cur.w += (tw - cur.w)*.25; cur.h += (th - cur.h)*.25; cur.r += (tr2 - cur.r)*.25;
    // chỉ ghi vào DOM khi giá trị thật sự đổi: con trỏ đứng yên thì không tốn gì
    const R = $("curR"), k1 = `${(cur.rx - cur.w/2).toFixed(1)},${(cur.ry - cur.h/2).toFixed(1)}`, k2 = `${cur.w.toFixed(1)},${cur.h.toFixed(1)},${cur.r.toFixed(1)}`;
    if (k1 !== cur.k1){ cur.k1 = k1; R.style.transform = `translate(${k1.replace(",", "px,")}px)`; }
    if (k2 !== cur.k2){ cur.k2 = k2; R.style.width = cur.w.toFixed(1) + "px"; R.style.height = cur.h.toFixed(1) + "px"; R.style.borderRadius = cur.r.toFixed(1) + "px"; }
    if (!!cur.snap !== cur.sn){ cur.sn = !!cur.snap; R.classList.toggle("snap", cur.sn); }
    const k3 = cur.x + "," + cur.y; if (k3 !== cur.k3){ cur.k3 = k3; $("curD").style.transform = `translate(${cur.x}px,${cur.y}px)`; }
  };

  /* ---------- bụi sáng bay lơ lửng (có chiều sâu khi cuộn) + vòng lặp chung ---------- */
  const motes = $("motes"), mx = motes.getContext("2d"), MCOL = [C.pink, C.gold, C.lilac, C.pink, C.mint, C.cyan];
  let ms = [], mDpr = 1, motesHidden = false;
  const motesCover = f => { if (f === motesHidden) return; motesHidden = f; motes.style.visibility = f ? "hidden" : ""; document.querySelector(".bg").style.visibility = f ? "hidden" : ""; };
  const newMote = any => ({ x:Math.random()*innerWidth, y:any ? Math.random()*innerHeight : innerHeight + 20, z:.3 + Math.random()*.7, v:.1 + Math.random()*.35, ph:Math.random()*6.28, a:.18 + Math.random()*.45, c:MCOL[Math.floor(Math.random()*MCOL.length)] });
  // canvas phủ cả màn hình: vẽ ở độ phân giải thấp hơn (bụi vốn mờ nhòe), trình duyệt tự phóng lên
  const sizeMotes = () => { mDpr = .75; motes.width = innerWidth*mDpr; motes.height = innerHeight*mDpr; ms = Array.from({length: Math.round(innerWidth*innerHeight/((PAGE === "home" ? 42000 : 32000)*(lite ? 2 : 1)))}, () => newMote(true)); };
  sizeMotes(); addEventListener("resize", () => { sizeMotes(); if (reduce) drawMotes(); });
  const drawMotes = (t = 0) => {
    const H = innerHeight, sy = scrollY;
    mx.setTransform(mDpr, 0, 0, mDpr, 0, 0); mx.clearRect(0, 0, innerWidth, H); mx.globalCompositeOperation = "lighter";
    for (const m of ms){
      const z = m.z*8*(1 + m.v), y = ((m.y - sy*m.z*.18) % (H + 40) + H + 40) % (H + 40) - 20;
      mx.globalAlpha = m.a*(.55 + .45*Math.sin(m.ph + t*.0018));
      mx.drawImage(sprite(m.c), m.x + Math.sin(m.ph + t*.0005)*16 - z/2, y - z/2, z, z);
      if (!reduce){ m.y -= m.v; if (m.y < -24) Object.assign(m, newMote(false), { y: m.y + H + 44 }); }
    }
    mx.globalAlpha = 1; mx.globalCompositeOperation = "source-over";
  };
  const frameHooks = [];
  let lastMote = 0, fpsN = 0, fpsT = performance.now(), hidden = false;
  document.addEventListener("visibilitychange", () => { hidden = document.hidden; });
  const loop = now => {
    if (!hidden){
      if (now - lastMote > (lite ? 55 : 40) && !motesHidden){ drawMotes(now); lastMote = now; }
      if (finePointer) drawCursor();
      for (const f of frameHooks) f(now);
      fpsN++; if (now - fpsT > 1000){ $("fps").textContent = fpsN; fpsN = 0; fpsT = now; }
    }
    requestAnimationFrame(loop);
  };
  if (!reduce) requestAnimationFrame(loop); else drawMotes();

  /* ---------- bàn phím chung ---------- */
  const KON = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"]; let kp = 0;
  let pageKeys = null, CHOICE_KEYS = null, modal = null;
  addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (modal){ modal(e, k); return; }
    kp = k === KON[kp] ? kp + 1 : (k === KON[0] ? 1 : 0);
    if (kp === KON.length){ kp = 0; secret(); return; }
    if (/input|textarea|select/i.test(e.target.tagName) || $("boot")) return;
    if (/^[1-9]$/.test(k) && CHOICE_KEYS && CHOICE_KEYS(+k)) return;
    if (/^[1-5]$/.test(k)){ const n = NAV[+k - 1]; if (n && n[0] !== CUR) go(n[1]); return; }
    if (k === "m"){ setTracker(!tracker.classList.contains("open")); Snd.click(); return; }
    if (k === "Escape"){ setTracker(false); setMenu(false); return; }
    if (pageKeys) pageKeys(e, k);
  });
  function secret(){
    unlock("secret"); const f = $("flash"); f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); setTimeout(() => f.classList.remove("go"), 800);
    document.querySelectorAll(".glitch").forEach(g => { g.classList.remove("burst"); void g.offsetWidth; g.classList.add("burst"); });
    setTimeout(() => Arcade.open(), 500);
  }

  /* ---------- tiện ích nội dung ---------- */
  const main = $("main");
  const pageHead = (key, title, sub, hint = "", extra = "") => `
    <header class="phead">
      <div class="phead-scene" aria-hidden="true"><div class="sunmark"></div><div class="floor"></div></div>
      <div class="wrap phead-in">
        <div class="crumb"><a href="index.html">Root</a><i>/</i><b>${esc(key)}</b></div>
        <h1 class="ttl glitch" data-text="${esc(title)}">${esc(title)}</h1>
        ${sub ? `<p class="phead-p">${esc(sub)}</p>` : ""}
        ${hint ? `<div class="keyhint">${hint}</div>` : ""}
        ${extra}
      </div>
    </header>`;
  const ytEmbed = u => { const m = String(u || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? `https://www.youtube.com/embed/${m[1]}` : null; };
  const reveal = () => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)){ els.forEach(el => { el.classList.add("in"); if (el._onIn) el._onIn(); }); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); if (e.target._onIn) e.target._onIn(); } }), { threshold:.12, rootMargin:"0px 0px -4% 0px" });
    els.forEach(el => io.observe(el));
  };
  const countUp = root => root.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count, w = +el.dataset.pad || 2; if (reduce){ el.textContent = pad(to, w); return; }
    const t0 = performance.now(), step = n => { const k = clamp((n - t0)/1400, 0, 1); el.textContent = pad(Math.round(to*(1 - Math.pow(1-k,3))), w); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
  const onVisible = (el, fn, th = .2) => {
    if (!("IntersectionObserver" in window)) return fn();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting){ io.disconnect(); fn(); } }, { threshold:th }); io.observe(el);
  };
  const bk = '<span class="bk" aria-hidden="true"></span>';
  const statusPill = g => `<span class="st ${isDev(g) ? "dev" : "released"}">${stText(g)}</span>`;
  const playBtn = (g, cls = "btn btn-p") => g.itch ? `<a class="${cls}" href="${esc(safeUrl(g.itch))}" target="_blank" rel="noopener">${isDev(g) ? "Theo dõi dự án" : `${ICON.play} Chơi ngay`}</a>` : "";
  const pages = {};

  /* =========================================================
     TRANG CHỦ — cảnh 3D, menu chính, game nổi bật, bộ sưu tập
     ========================================================= */
  let start = () => {};
  // tranh nhiều lớp (trời / bóng dáng / mặt đất): các lớp lệch nhau khi rê chuột, cuộn trang
  const layered = (g, W, H, o = {}) => {
    const box = document.createElement("div"); box.className = "lys";
    if (g.image){ const im = gameArt(g, W, H, { eager:o.eager }); im.classList.add("ly"); im.style.setProperty("--z", .6); box.append(im); return box; }
    const L = paintArt(sceneOf(g), g.title, gColor(g), W, H, { layers:true, sx:o.sx, hz:o.hz });
    [["back", .3], ["mid", .75], ["front", 1.25]].forEach(([k, z]) => { const c = L[k]; c.className = "ly ly-" + k; c.style.setProperty("--z", z); box.append(c); });
    box.setAttribute("role", "img"); box.setAttribute("aria-label", `Ảnh minh họa cho ${g.title}`);
    return box;
  };
  // kích thước tranh theo khung chứa (giữ nét trên màn hình lớn, nhẹ trên điện thoại)
  const artSize = (el, maxW = 1600) => {
    const r = el.getBoundingClientRect(), ar = r.width > 0 && r.height > 0 ? r.width/r.height : 16/9;
    let W = Math.min(maxW, Math.max(640, Math.round(r.width*Math.min(devicePixelRatio || 1, 1.6)*1.08)));
    let H = Math.round(W/ar); if (H > 1600){ H = 1600; W = Math.round(H*ar); }
    return [W, H];
  };

  pages.home = () => {
    document.title = `${P.name}${P.role ? ` — ${P.role}` : ""}`;
    const fi = featuredIndex, fg = games[fi];
    const menu = [
      ["Bắt đầu", "games.html", "Thư viện game"],
      ["Hồ sơ nhân vật", "profile.html", "Kỹ năng & túi đồ"],
      ["Nhật ký nhiệm vụ", "journey.html", "Kinh nghiệm"],
      ["Kênh liên lạc", "contact.html", "Liên hệ"],
      P.cvFile ? ["Tải CV", P.cvFile, "File PDF", 1] : null
    ].filter(Boolean);
    const notes = games.map((g,i) => ({ ...g, i })).sort((a,b) => (+b.year || 0) - (+a.year || 0));
    const words = [...P.tools, ...P.skills.map(s => s.name)].filter(Boolean);
    const topSk = [...P.skills].sort((a,b) => b.level - a.level).slice(0, 3);
    const about = P.about.length > 230 ? P.about.slice(0, 225).replace(/\s+\S*$/, "") + "…" : P.about;
    main.innerHTML = `
      <section class="hero" id="hero">
        <div class="hero-stage" aria-hidden="true"><canvas id="scene"></canvas></div>
        <div class="hero-shade" aria-hidden="true"></div>
        <div class="wrap hero-in" id="heroIn">
          <p class="hero-k seq"><i></i>Hồ sơ nhà phát triển<span> // đã xác thực</span></p>
          <h1 class="hero-name seq${lenCls(P.name, 16, 26)}" style="--d:.08s"><span class="glitch" id="heroName" data-text="${esc(P.name)}">${esc(P.name)}</span></h1>
          ${P.codename ? `<p class="hero-code seq" style="--d:.13s"><span>Code name</span><b>${esc(P.codename)}</b></p>` : ""}
          ${P.role ? `<p class="hero-role seq" style="--d:.18s"><b aria-hidden="true">&gt;</b> <span id="roleTxt" aria-label="${esc(P.role)}"></span><span class="caret" aria-hidden="true"></span></p>` : ""}
          ${P.tagline ? `<p class="hero-p seq" style="--d:.26s">${esc(P.tagline)}</p>` : ""}
          <ul class="mmenu" id="mmenu">${menu.map(([t,h,s,dl],i) => `<li class="seq" style="--d:${(.34 + i*.06).toFixed(2)}s"><a href="${esc(safeUrl(h))}" ${dl ? "download" : ""}><span class="mm-i">${pad(i+1)}</span><span class="mm-t">${esc(t)}</span><small>${esc(s)}</small></a></li>`).join("")}</ul>
          <div class="keyhint seq" style="--d:.7s"><kbd>↑</kbd><kbd>↓</kbd> chọn <kbd>Enter</kbd> xác nhận <kbd>1</kbd>–<kbd>5</kbd> chuyển trang</div>
        </div>
        <div class="hero-foot">
          <div class="wrap hero-foot-in">
            ${fg ? `<a class="ticker seq" style="--d:.8s" href="game.html?id=${fi}"><span class="tk-k"><i></i>Tin mới</span><span class="tk-t"><b>${esc(fg.title)}</b><span>${stText(fg)}${fg.genres.length ? ` · ${esc(fg.genres.join(", "))}` : ""}</span></span>${ICON.arrow}</a>` : "<span></span>"}
            <dl class="hstats seq" style="--d:.88s">
              <div><dt>Năm kinh nghiệm</dt><dd data-count="${P.level}">00</dd></div>
              <div><dt>Đã phát hành</dt><dd data-count="${released}">00</dd></div>
              <div><dt>Đang phát triển</dt><dd data-count="${games.length - released}">00</dd></div>
            </dl>
            <a class="scue seq" style="--d:.96s" href="#feat" aria-label="Cuộn xuống phần tiếp theo"><span>Cuộn</span><i></i></a>
          </div>
        </div>
      </section>

      ${fg ? `<section class="wrap sec" id="feat">
        <div class="sec-h" data-reveal><div><small>// Dự án tiêu điểm</small><h2>Game nổi bật</h2></div><a class="more" href="games.html">Mở thư viện ${ICON.arrow}</a></div>
        <a class="feature" href="game.html?id=${fi}" style="--ac:${gColor(fg)}" data-reveal>
          <div class="feature-art" id="featArt" data-par><span class="feature-badge">${ICON.trophy}Tiêu điểm</span></div>
          <div class="feature-body">
            <small class="kick">#${pad(fi+1)}${fg.engine ? ` // ${esc(fg.engine)}` : ""}${fg.year ? ` // ${esc(fg.year)}` : ""}</small>
            <h3 class="${lenCls(fg.title, 22, 38).trim()}">${esc(fg.title)}</h3>
            <div class="row">${statusPill(fg)}${fg.genres.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
            <p>${esc(fg.desc)}</p>
            ${fg.features.length ? `<ul class="fmini">${fg.features.slice(0, 3).map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
            <span class="go">Xem chi tiết ${ICON.arrow}</span>
          </div>
        </a>
      </section>` : ""}

      ${games.length ? `<section class="wrap sec">
        <div class="sec-h" data-reveal><div><small>// ${games.length} dự án</small><h2>Bộ sưu tập</h2></div>
          <div class="shelf-nav" id="shelfNav"><button type="button" aria-label="Cuộn sang trái">${ICON.left}</button><button type="button" aria-label="Cuộn sang phải">${ICON.right}</button></div></div>
        <div class="shelf" id="shelf" data-reveal style="--d:.08s">${games.map((g,i) => `
          <a class="poster" href="game.html?id=${i}" style="--ac:${gColor(g)}">
            <span class="poster-art"></span><span class="poster-n">${pad(i+1)}</span>
            <span class="poster-tx">${statusPill(g)}<b>${esc(g.title)}</b><small>${[g.year, g.engine, g.genres[0]].filter(Boolean).map(esc).join(" · ")}</small></span>
          </a>`).join("")}
        </div>
      </section>` : ""}

      <section class="wrap sec duo">
        <div class="panel pmini" data-reveal>
          <p class="ptag">Hồ sơ nhanh</p>
          <div class="pmini-top"><div class="pmini-av" id="miniAv"></div><div><b>${esc(P.name)}</b>${P.className ? `<span>${esc(P.className)}</span>` : ""}${P.status ? `<em>${esc(P.status)}</em>` : ""}</div></div>
          ${about ? `<p class="pmini-ab">${esc(about)}</p>` : ""}
          ${topSk.length ? `<div class="pmini-sk">${topSk.map((k,i) => `<div><span>${esc(k.name)}</span><b>${k.level}/10</b><i style="--v:${k.level*10}%;--d:${.2 + i*.12}s"></i></div>`).join("")}</div>` : ""}
          <a class="more" href="profile.html">Mở hồ sơ đầy đủ ${ICON.arrow}</a>
        </div>
        <div class="panel patch" data-reveal style="--d:.1s">
          <p class="ptag">Nhật ký cập nhật</p>
          ${notes.length ? `<ol>${notes.map(g => `<li><a href="game.html?id=${g.i}"><time>${esc(g.year || "—")}</time><span><b>${esc(g.title)}</b><small>${stText(g)}${g.engine ? ` · ${esc(g.engine)}` : ""}</small></span>${ICON.right}</a></li>`).join("")}</ol>` : `<p class="empty">Chưa có game nào trong data.js.</p>`}
          ${games.length ? `<a class="more" href="games.html">Mở thư viện game ${ICON.arrow}</a>` : ""}
        </div>
      </section>
      ${words.length ? `<div class="marquee" aria-hidden="true"><div>${[...words, ...words].map(w => `<span>${esc(w)}</span>`).join("")}</div></div>` : ""}`;

    // tranh minh họa
    if (fg){ const fa = $("featArt"); const [W, H] = artSize(fa); fa.prepend(layered(fg, W, H, { sx:.62 })); }
    document.querySelectorAll(".poster").forEach((p, i) => p.querySelector(".poster-art").append(gameArt(games[i], 600, 800)));
    portrait($("miniAv"), 160);

    // kệ game: nút cuộn + kéo bằng chuột
    const shelf = $("shelf");
    if (shelf){
      const nav = $("shelfNav"), upd = () => { const max = shelf.scrollWidth - shelf.clientWidth - 2; nav.classList.toggle("hide", max <= 0); nav.children[0].disabled = shelf.scrollLeft <= 2; nav.children[1].disabled = shelf.scrollLeft >= max; };
      nav.children[0].addEventListener("click", () => shelf.scrollBy({ left: -shelf.clientWidth*.8, behavior: reduce ? "auto" : "smooth" }));
      nav.children[1].addEventListener("click", () => shelf.scrollBy({ left: shelf.clientWidth*.8, behavior: reduce ? "auto" : "smooth" }));
      shelf.addEventListener("scroll", upd, { passive:true }); addEventListener("resize", upd); upd();
      let drag = null;
      shelf.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || shelf.scrollWidth <= shelf.clientWidth) return; drag = { x:e.clientX, s:shelf.scrollLeft, moved:false }; });
      addEventListener("pointermove", e => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 6){ drag.moved = true; shelf.classList.add("dragging"); } if (drag.moved) shelf.scrollLeft = drag.s - dx; });
      addEventListener("pointerup", () => { if (!drag) return; const m = drag.moved; drag = null; shelf.classList.remove("dragging"); if (m){ const stop = e => { e.preventDefault(); e.stopPropagation(); }; shelf.addEventListener("click", stop, { capture:true, once:true }); setTimeout(() => shelf.removeEventListener("click", stop, { capture:true }), 50); } });
    }
    document.querySelector(".scue").addEventListener("click", e => { const t = $("feat") || document.querySelector(".sec"); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); });

    // menu chính điều khiển bằng phím
    const links = [...$("mmenu").querySelectorAll("a")]; let sel = 0;
    const setSel = (i, snd = true) => { sel = (i + links.length) % links.length; links.forEach((a,k) => a.classList.toggle("sel", k === sel)); if (snd) Snd.move(); };
    setSel(0, false);
    links.forEach((a,i) => { a.addEventListener("pointerenter", () => setSel(i, false)); a.addEventListener("focus", () => setSel(i, false)); });
    pageKeys = (e, k) => {
      if (scrollY > innerHeight*.5) return;
      if (k === "ArrowDown" || k === "ArrowUp"){ e.preventDefault(); setSel(sel + (k === "ArrowDown" ? 1 : -1)); links[sel].focus({ preventScroll:true }); }
      else if (k === "Enter" && !e.target.closest("a,button")){ Snd.click(); links[sel].click(); }
    };

    // cảnh 3D (WebGL); máy không hỗ trợ thì dùng cảnh vẽ 2D
    let cv = $("scene"), S3 = null;
    const use2D = () => { const c = document.createElement("canvas"); c.id = "scene"; cv.replaceWith(c); cv = c; S3 = Hero2D(cv, { still:reduce }); };
    try { S3 = Hero3D(cv, { maxDpr: lite ? 1 : 1.1, maxPx: lite ? 1e6 : 1.6e6, still:reduce }); } catch(e){ S3 = null; }
    if (!S3) use2D();
    document.documentElement.classList.add(S3 && S3.kind === "3d" ? "gl" : "no-gl");
    const draw1 = () => { if (S3) try { S3.frame(performance.now()); } catch(e){} };
    if (S3 && S3.kind === "3d") cv.addEventListener("webglcontextlost", e => { e.preventDefault(); use2D(); draw1(); });
    let heroVis = true;
    if ("IntersectionObserver" in window) new IntersectionObserver(([e]) => { heroVis = e.isIntersecting; }).observe($("hero"));
    // màn hình thấp (laptop): màn đầu không chứa hết thì thu gọn khoảng cách, đưa "tin mới" + chỉ số sang cột phải
    const heroEl = $("hero"), tall = matchMedia("(max-width:700px),(max-aspect-ratio:20/21)");
    const fit = () => {
      if (tall.matches){ heroEl.classList.remove("tight", "tight-n", "tight2"); return; }
      heroEl.classList.add("fitting"); // tạm tắt transition để đo đúng kích thước cuối
      heroEl.classList.remove("tight", "tight-n", "tight2");
      const room = Math.max(innerHeight - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--bar-h")) || 28), 620);
      // màn hẹp (< 1000px): cột phải không đủ chỗ, chỉ thu gọn theo chiều cao và giữ hàng chỉ số ở dưới
      if (heroEl.offsetHeight > room + 1){
        heroEl.classList.add("tight", ...(innerWidth < 1000 ? ["tight-n"] : []));
        // vẫn chưa vừa (tên, giới thiệu rất dài): thu thêm một nấc
        if (heroEl.offsetHeight > room + 1) heroEl.classList.add("tight2");
      }
      void heroEl.offsetHeight;
      heroEl.classList.remove("fitting");
    };
    fit(); if (S3) S3.resize();
    const resize = () => { fit(); if (S3){ S3.resize(); if (reduce) draw1(); } };
    addEventListener("resize", resize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    addEventListener("pointermove", e => { if (S3 && e.pointerType === "mouse") S3.mouse(e.clientX/innerWidth*2 - 1, e.clientY/innerHeight*2 - 1); }, { passive:true });
    const heroIn = $("heroIn");
    // ghi thẳng transform/opacity (không qua biến CSS) để trình duyệt khỏi tính lại style cả khối con; gộp theo khung hình
    let skQ = false, skL = "";
    const onScroll = () => {
      skQ = false;
      const k = clamp(scrollY/Math.max(1, innerHeight), 0, 1.2); if (S3) S3.scroll(Math.min(1, k));
      if (!reduce){ const v = tall.matches ? "m" : k.toFixed(3); if (v !== skL){ skL = v; heroIn.style.transform = v === "m" ? "" : `translate3d(0,${(-70*k).toFixed(1)}px,0)`; heroIn.style.opacity = v === "m" ? "" : (1 - k*.9).toFixed(3); } }
      // cảnh 3D (nền đục) phủ kín màn hình thì không cần vẽ lớp bụi sáng nằm phía sau
      motesCover(heroEl.getBoundingClientRect().bottom >= innerHeight - 1);
      if (reduce) draw1();
    };
    addEventListener("scroll", () => { if (!skQ){ skQ = true; requestAnimationFrame(onScroll); } }, { passive:true }); onScroll();
    addEventListener("resize", onScroll);
    // máy yếu: chậm hơn ~50 khung hình/giây thì hạ độ phân giải cảnh 3D từng nấc;
    // nấc thấp nhất vẫn chậm thì vẽ cảnh 3D cách một khung hình (phần còn lại của trang vẫn mượt)
    const QL = [1, .8, .65, .5, .4];
    let qi = 0, half = false, odd = false, fN = 0, fT = 0, fLast = 0, fWarm = 0;
    if (S3 && lite && S3.kind === "3d"){ qi = 1; S3.quality(QL[qi]); }   // máy yếu: bắt đầu từ nấc thấp hơn
    frameHooks.push(now => {
      if (!heroVis || !S3) { fLast = 0; return; }
      if (!finePointer) S3.mouse(Math.sin(now/3400)*.4, Math.cos(now/4700)*.12);
      odd = !odd;
      if (!half || odd) S3.frame(now);
      if (S3.kind !== "3d" || half) return;
      if (!fWarm) fWarm = now + 1200; // bỏ qua lúc trang vừa tải
      if (now < fWarm){ fLast = now; return; }
      if (fLast && now - fLast < 1000){ fT += now - fLast; fN++; }
      fLast = now;
      if (fN >= 45 || (fN >= 4 && fT > 1200)){
        if (fT/fN > 18.5){ if (qi < QL.length - 1) S3.quality(QL[++qi]); else half = true; fWarm = now + 400; }
        fN = 0; fT = 0;
      }
    });
    if (reduce) requestAnimationFrame(draw1);

    start = () => {
      $("hero").classList.add("ready"); countUp($("hero"));
      if (!reduce) setTimeout(() => scramble($("heroName"), P.name, 1200), 160);
      const el = $("roleTxt"); if (!el) return;
      const txt = P.role; if (reduce){ el.textContent = txt; return; }
      let i = 0; const ty = () => { el.textContent = txt.slice(0, ++i); Snd.type(); if (i < txt.length) setTimeout(ty, 55); }; setTimeout(ty, 700);
    };
  };

  /* =========================================================
     THƯ VIỆN GAME — xem trước lớn + danh sách băng game
     ========================================================= */
  pages.games = () => {
    document.title = `Thư viện game — ${P.name}`;
    completeObj("games");
    const nDev = games.length - released;
    main.innerHTML = `${pageHead("Games", "Chọn game", "Duyệt qua các dự án. Chọn một game để xem trước, bấm lần nữa để mở trang chi tiết.", `<kbd>←</kbd><kbd>→</kbd> đổi game <kbd>Enter</kbd> mở chi tiết`)}
      <section class="wrap lib">
        <div class="pv" id="pv" data-reveal>
          <div class="pv-art" id="pvArt" data-par></div>
          <div class="pv-shade" aria-hidden="true"></div><div class="pv-scan" aria-hidden="true"></div>
          <div class="pv-top"><span class="st" id="pvSt"></span><span class="pv-n" id="pvN"></span></div>
          <div class="pv-info" id="pvInfo" aria-live="polite"></div>
          <button class="pv-nav l" id="pvL" type="button" aria-label="Game trước">${ICON.left}</button><button class="pv-nav r" id="pvR" type="button" aria-label="Game sau">${ICON.right}</button>
          <div class="pv-dots" id="pvDots" aria-hidden="true"></div>
        </div>
        <div class="side" data-reveal style="--d:.1s">
          <div class="ftabs" role="tablist" aria-label="Lọc game">
            <button class="on" data-f="all" role="tab" aria-selected="true">Tất cả <i>${games.length}</i></button><button data-f="released" role="tab" aria-selected="false">Phát hành <i>${released}</i></button><button data-f="dev" role="tab" aria-selected="false">Đang làm <i>${nDev}</i></button>
          </div>
          <div class="slots" id="slots" role="listbox" aria-label="Danh sách game">${games.map((g,i) => `
            <button class="slot" type="button" role="option" aria-selected="false" data-i="${i}" style="--ac:${gColor(g)}"><span class="slot-art"></span><span class="slot-tx"><small>Slot ${pad(i+1)}${g.year ? ` · ${esc(g.year)}` : ""}</small><b>${esc(g.title)}</b><em class="${isDev(g) ? "dev" : ""}">${stText(g)}</em></span><span class="slot-go" aria-hidden="true">${ICON.right}</span></button>`).join("")}
          </div>
          <p class="side-hint">Bấm một băng game để xem trước, bấm lần nữa để mở.</p>
        </div>
      </section>`;
    if (!games.length){ $("pv").classList.add("empty"); $("pvInfo").innerHTML = `<h2>Chưa có game</h2><p class="pv-desc">Hãy thêm game vào mục games trong file data.js.</p>`; ["pvL","pvR"].forEach(k => $(k).hidden = true); return; }
    const slots = [...$("slots").querySelectorAll(".slot")];
    let gi = featuredIndex, filter = "all";
    slots.forEach((s,i) => { s.querySelector(".slot-art").append(gameArt(games[i], 320, 200)); s.addEventListener("click", () => { if (i === gi) go(`game.html?id=${i}`); else show(i, true, i > gi ? 1 : -1); }); });
    const big = new Map(), box = $("pvArt");
    const visibleIdx = () => slots.filter(s => !s.hidden).map(s => +s.dataset.i);
    const dots = () => { const v = visibleIdx(); $("pvDots").innerHTML = v.map(i => `<i class="${i === gi ? "on" : ""}"></i>`).join(""); };
    function show(i, snd = true, dir = 1){
      gi = i; const g = games[i];
      $("pv").style.setProperty("--ac", gColor(g));
      slots.forEach((s,k) => { s.classList.toggle("sel", k === i); s.setAttribute("aria-selected", k === i); });
      if (!big.has(i)){ const [W, H] = artSize(box, 1500); big.set(i, layered(g, W, H, { sx:.7 })); }
      const el = big.get(i);
      [...box.children].forEach(c => { if (c !== el){ c.classList.remove("in"); c.classList.add("out"); setTimeout(() => { if (c.classList.contains("out")) c.remove(); }, 900); } });
      el.classList.remove("out", "in"); el.style.setProperty("--dir", dir); box.append(el);
      if (!reduce){ void el.offsetWidth; el.classList.add("in"); } else el.classList.add("in");
      $("pvSt").className = "st " + (isDev(g) ? "dev" : "released"); $("pvSt").textContent = stText(g);
      $("pvN").innerHTML = `Slot <b>${pad(i+1)}</b> / ${pad(games.length)}`;
      $("pvInfo").innerHTML = `
        <h2 class="glitch${reduce ? "" : " burst"}${lenCls(g.title, 20, 34)}" data-text="${esc(g.title)}">${esc(g.title)}</h2>
        <div class="pv-meta">
          ${g.genres.length ? `<div><small>Thể loại</small><b>${esc(g.genres.join(" / "))}</b></div>` : ""}
          ${g.engine ? `<div><small>Engine</small><b>${esc(g.engine)}</b></div>` : ""}
          ${g.platform ? `<div><small>Nền tảng</small><b>${esc(g.platform)}</b></div>` : ""}
          ${g.year ? `<div><small>Năm</small><b>${esc(g.year)}</b></div>` : ""}
        </div>
        ${g.desc ? `<p class="pv-desc">${esc(g.desc)}</p>` : ""}
        <div class="pv-act"><a class="btn btn-p" href="game.html?id=${i}">Xem chi tiết ${ICON.arrow}</a>${playBtn(g, "btn btn-o")}</div>`;
      if (!reduce) $("pvInfo").querySelectorAll(".pv-meta > div, .pv-desc, .pv-act").forEach((n, k) => { n.classList.add("pop"); n.style.setProperty("--i", k); });
      dots();
      if (snd) Snd.swap();
      if (finePointer){ const sl = $("slots"), s = slots[i]; if (s.offsetTop < sl.scrollTop || s.offsetTop + s.offsetHeight > sl.scrollTop + sl.clientHeight) sl.scrollTo({ top: s.offsetTop - 8, behavior: reduce ? "auto" : "smooth" }); }
    }
    const step = d => { const v = visibleIdx(); if (!v.length) return; const p = v.indexOf(gi); show(v[((p < 0 ? 0 : p + d) + v.length) % v.length], true, d); };
    show(gi, false);
    $("pvL").addEventListener("click", () => step(-1)); $("pvR").addEventListener("click", () => step(1));
    document.querySelector(".ftabs").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return; filter = b.dataset.f; Snd.click();
      document.querySelectorAll(".ftabs button").forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
      slots.forEach(s => { const g = games[+s.dataset.i]; s.hidden = !(filter === "all" || (filter === "dev") === isDev(g)); });
      const v = visibleIdx(); if (v.length && !v.includes(gi)) show(v[0]); else dots();
    });
    let sx = null, sy = null;
    $("pv").addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive:true });
    $("pv").addEventListener("touchend", e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)*1.3) step(dx < 0 ? 1 : -1); sx = null; });
    pageKeys = (e, k) => {
      if (k === "ArrowRight" || k === "ArrowDown"){ e.preventDefault(); step(1); }
      else if (k === "ArrowLeft" || k === "ArrowUp"){ e.preventDefault(); step(-1); }
      else if (k === "Enter" && !e.target.closest("a,button")) go(`game.html?id=${gi}`);
    };
  };

  /* =========================================================
     CHI TIẾT GAME — banner nhiều lớp, điểm nổi bật, trailer, ảnh
     ========================================================= */
  pages.game = () => {
    let id = parseInt(new URLSearchParams(location.search).get("id"), 10);
    if (!(id >= 0 && id < games.length)) id = featuredIndex;
    const g = games[id];
    if (!g){ main.innerHTML = pageHead("Games", "Chưa có game", "Hãy thêm game vào file data.js."); return; }
    document.title = `${g.title} — ${P.name}`;
    completeObj("detail");
    const views = getSet("gviews"); views.add(id); putSet("gviews", views); if (views.size >= Math.min(3, games.length)) setTimeout(() => unlock("collector"), 1000);
    const ac = gColor(g), yt = ytEmbed(g.trailer), pi = (id - 1 + games.length) % games.length, ni = (id + 1) % games.length;
    const play = playBtn(g);
    const trl = g.trailer && !yt ? `<a class="btn btn-o" href="${esc(safeUrl(g.trailer))}" target="_blank" rel="noopener">${ICON.play} Xem trailer</a>` : "";
    const meta = [["Engine", g.engine], ["Nền tảng", g.platform], ["Năm", g.year]].filter(m => m[1]);
    main.innerHTML = `
      <section class="gban" id="gban" style="--ac:${ac}">
        <div class="gban-art" id="gArt" data-par></div>
        <div class="gban-shade" aria-hidden="true"></div>
        <div class="wrap gban-in">
          <div class="crumb"><a href="index.html">Root</a><i>/</i><a href="games.html">Games</a><i>/</i><b>Slot ${pad(id+1)}</b></div>
          <h1 class="ttl glitch${lenCls(g.title, 20, 34)}" data-text="${esc(g.title)}">${esc(g.title)}</h1>
          <div class="row">${statusPill(g)}${g.genres.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
          ${meta.length ? `<dl class="gban-meta">${meta.map(([k,v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
          ${play || trl ? `<div class="actions">${play}${trl}</div>` : ""}
        </div>
      </section>
      <section class="wrap gdetail" style="--ac:${ac}">
        <div class="gmain">
          <div class="blk" data-reveal>
            <p class="ptag">Giới thiệu</p>
            ${g.desc ? `<p class="lead">${esc(g.desc)}</p>` : `<p class="lead muted">Chưa có mô tả cho game này.</p>`}
            ${g.highlight ? `<div class="trophy"><span class="trophy-ic">${ICON.trophy}</span><div><small>Thành tích</small><b>${esc(g.highlight)}</b></div></div>` : ""}
          </div>
          ${g.features.length ? `<div class="blk" data-reveal><p class="ptag">Điểm nổi bật</p><ul class="feats">${g.features.map((t,k) => `<li><i>MOD.${pad(k+1)}</i><span>${esc(t)}</span></li>`).join("")}</ul></div>` : ""}
          ${yt ? `<div class="blk" data-reveal><p class="ptag">Trailer</p><div class="video"><iframe src="${yt}" title="Trailer ${esc(g.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div><a class="vlink" href="${esc(safeUrl(g.trailer))}" target="_blank" rel="noopener">Không xem được? Mở trailer trên YouTube ${ICON.arrow}</a></div>` : ""}
          ${g.screenshots.length ? `<div class="blk" data-reveal><p class="ptag">Hình ảnh <span>// ${g.screenshots.length} ảnh</span></p><div class="shots" id="shots">${g.screenshots.map((s,k) => `<button type="button" class="shot" data-k="${k}" aria-label="Phóng to ảnh ${k+1}"><img src="${esc(safeUrl(s))}" alt="Ảnh ${k+1} của ${esc(g.title)}" loading="lazy"></button>`).join("")}</div></div>` : ""}
        </div>
        <aside class="spec panel" data-reveal style="--d:.1s">
          <p class="ptag">Thông số</p>
          <dl>
            <div><dt>Trạng thái</dt><dd class="${isDev(g) ? "c-gold" : "c-mint"}">${stText(g)}</dd></div>
            ${g.genres.length ? `<div><dt>Thể loại</dt><dd>${esc(g.genres.join(", "))}</dd></div>` : ""}
            ${g.engine ? `<div><dt>Engine</dt><dd>${esc(g.engine)}</dd></div>` : ""}
            ${g.platform ? `<div><dt>Nền tảng</dt><dd>${esc(g.platform)}</dd></div>` : ""}
            ${g.year ? `<div><dt>Năm</dt><dd>${esc(g.year)}</dd></div>` : ""}
          </dl>
          <div class="actions">${play}${trl}<a class="btn btn-o btn-sm" href="games.html">${ICON.left} Về thư viện</a></div>
        </aside>
      </section>
      ${games.length > 1 ? `<nav class="wrap pn" aria-label="Game khác" data-reveal>
        <a href="game.html?id=${pi}" style="--ac:${gColor(games[pi])}"><span class="pn-art" id="pnP"></span><span class="pn-tx"><small><kbd>←</kbd> Game trước</small><b>${esc(games[pi].title)}</b></span></a>
        <a class="nx" href="game.html?id=${ni}" style="--ac:${gColor(games[ni])}"><span class="pn-art" id="pnN"></span><span class="pn-tx"><small>Game sau <kbd>→</kbd></small><b>${esc(games[ni].title)}</b></span></a>
      </nav>` : ""}`;
    const ga = $("gArt"), [W, H] = artSize(ga, 1800);
    ga.append(layered(g, W, H, { sx:.72, eager:true }));
    if (games.length > 1){ $("pnP").append(gameArt(games[pi], 480, 270)); $("pnN").append(gameArt(games[ni], 480, 270)); }
    pageKeys = (e, k) => {
      if (games.length > 1 && k === "ArrowLeft") go(`game.html?id=${pi}`);
      else if (games.length > 1 && k === "ArrowRight") go(`game.html?id=${ni}`);
      else if (k === "Backspace") go("games.html");
    };

    // xem ảnh phóng to (phím ← → để chuyển, Esc để đóng)
    if (!g.screenshots.length) return;
    let lb = null, li = 0, back = null;
    const lbShow = k => { li = (k + g.screenshots.length) % g.screenshots.length; const im = lb.querySelector("img"); im.classList.remove("in"); im.src = safeUrl(g.screenshots[li]); im.alt = `Ảnh ${li+1} của ${g.title}`; void im.offsetWidth; im.classList.add("in"); lb.querySelector(".lb-n").textContent = `${pad(li+1)} / ${pad(g.screenshots.length)}`; };
    const lbClose = () => { if (!lb) return; const l = lb; lb = null; modal = null; l.classList.remove("open"); setTimeout(() => l.remove(), 300); if (back) back.focus({ preventScroll:true }); };
    const lbOpen = k => {
      back = document.activeElement; Snd.whoosh();
      document.body.insertAdjacentHTML("beforeend", `<div class="lb" id="lb" role="dialog" aria-modal="true" aria-label="Xem ảnh"><img alt=""><button class="lb-x" type="button" aria-label="Đóng">${ICON.close}</button>${g.screenshots.length > 1 ? `<button class="lb-nav l" type="button" aria-label="Ảnh trước">${ICON.left}</button><button class="lb-nav r" type="button" aria-label="Ảnh sau">${ICON.right}</button>` : ""}<span class="lb-n"></span></div>`);
      lb = $("lb"); lbShow(k); requestAnimationFrame(() => lb.classList.add("open"));
      lb.addEventListener("click", e => { if (e.target.closest(".lb-x") || e.target === lb) lbClose(); else if (e.target.closest(".lb-nav.l")) { lbShow(li - 1); Snd.move(); } else if (e.target.closest(".lb-nav.r")) { lbShow(li + 1); Snd.move(); } });
      lb.querySelector(".lb-x").focus({ preventScroll:true });
      modal = (e, key) => { if (key === "Escape") lbClose(); else if (key === "ArrowLeft"){ lbShow(li - 1); Snd.move(); } else if (key === "ArrowRight"){ lbShow(li + 1); Snd.move(); } else if (key === "Tab"){ e.preventDefault(); const b = [...lb.querySelectorAll("button")]; b[(b.indexOf(document.activeElement) + (e.shiftKey ? -1 : 1) + b.length) % b.length].focus(); } };
    };
    $("shots").addEventListener("click", e => { const b = e.target.closest(".shot"); if (b) lbOpen(+b.dataset.k); });
  };

  /* =========================================================
     HỒ SƠ NHÂN VẬT — thẻ hologram, chỉ số, túi đồ, thành tựu
     ========================================================= */
  const radarSVG = sk => {
    const n = sk.length, cx = 200, cy = 170, R = 118; if (n < 3) return "";
    const pt = (i, r) => { const a = -Math.PI/2 + i*2*Math.PI/n; return [cx + Math.cos(a)*r, cy + Math.sin(a)*r]; };
    let s = "";
    for (let l = 1; l <= 5; l++) s += `<polygon class="grid" points="${sk.map((_,i) => pt(i, R*l/5).map(v => v.toFixed(1)).join(",")).join(" ")}"/>`;
    sk.forEach((_,i) => { const [x,y] = pt(i, R); s += `<line class="axis" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; });
    const dp = sk.map((k,i) => pt(i, R*k.level/10).map(v => v.toFixed(1)).join(",")).join(" ");
    s += `<g class="dgrp"><polygon class="data" points="${dp}"/>`;
    sk.forEach((k,i) => { const [x,y] = pt(i, R*k.level/10); s += `<circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" style="--i:${i}"/>`; });
    s += `</g>`;
    sk.forEach((k,i) => { const [lx,ly] = pt(i, R + 22); s += `<g class="axl" data-i="${i}"><rect x="${(lx-14).toFixed(1)}" y="${(ly-11).toFixed(1)}" width="28" height="22" rx="6"/><text x="${lx.toFixed(1)}" y="${(ly+4.5).toFixed(1)}" text-anchor="middle">${pad(i+1)}</text></g>`; });
    const defs = `<defs><linearGradient id="rdF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4F9A" stop-opacity=".55"/><stop offset="1" stop-color="#8B6CFF" stop-opacity=".3"/></linearGradient><linearGradient id="rdS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF8DC1"/><stop offset="1" stop-color="#FFC65C"/></linearGradient></defs>`;
    // vệt quét nằm ở SVG riêng phía dưới: xoay bằng transform, không phải vẽ lại cả biểu đồ mỗi khung hình
    return `<div class="radar-w"><svg class="rd-scan" viewBox="40 10 320 320" aria-hidden="true"><path d="M200 170 L200 52 A118 118 0 0 1 302 111 Z"/></svg><svg class="radar" viewBox="40 10 320 320" role="img" aria-label="Biểu đồ kỹ năng: ${esc(sk.map(k => `${k.name} ${k.level}/10`).join(", "))}">${defs}${s}</svg></div>`;
  };
  const ACH_HINT = { secret: "Một tổ hợp phím huyền thoại của làng game…" };
  pages.profile = () => {
    document.title = `Hồ sơ — ${P.name}`;
    completeObj("profile");
    const sk = P.skills.slice(0, 8), avg = sk.length ? sk.reduce((a,k) => a + k.level, 0)/sk.length : 0;
    const rar = i => i < 2 ? ["r1","Huyền thoại","★★★"] : i < 4 ? ["r2","Sử thi","★★"] : ["r3","Hiếm","★"];
    const abbr = t => (t.replace(/[^A-Za-zÀ-ỹ0-9+#]/g, "").slice(0, 2) || "?").toUpperCase();
    main.innerHTML = `${pageHead("Profile", "Hồ sơ nhân vật", "Thẻ định danh, chỉ số kỹ năng, túi đồ công cụ và các thành tựu bạn đã mở trên trang này.")}
      <section class="wrap char">
        <div class="idwrap" data-reveal>
          <article class="idcard" id="idcard">
            <div class="id-foil" aria-hidden="true"></div><div class="id-shine" aria-hidden="true"></div>
            <div class="id-top"><span>Thẻ định danh</span><b>${esc(ID)}</b></div>
            <div class="holo">
              <svg class="ring r1" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="none" stroke="url(#hg1)" stroke-opacity=".8" stroke-dasharray="2 6"/><path d="M100 1 104 9h-8zM100 199l4-8h-8z" fill="#FFC65C"/><defs><linearGradient id="hg1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF4F9A"/><stop offset="1" stop-color="#FFC65C"/></linearGradient></defs></svg>
              <svg class="ring r2" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="84" fill="none" stroke="url(#hg2)" stroke-opacity=".85" stroke-width="2" stroke-dasharray="40 14 6 14"/><defs><linearGradient id="hg2" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8B6CFF"/><stop offset="1" stop-color="#FF4F9A"/></linearGradient></defs></svg>
              <div class="holo-pic" id="idPic"></div>
              <span class="holo-lbl tl">SCAN // OK</span>
              <span class="holo-lbl br">BIO-ID<br>${esc(ID)}</span>
            </div>
            <div class="id-body">
              <h2>${esc(P.name)}</h2>
              ${P.role ? `<div class="role">&gt; ${esc(P.role)}</div>` : ""}
              <dl>
                ${P.codename ? `<div><dt>Biệt danh</dt><dd class="cn">${esc(P.codename)}</dd></div>` : ""}
                ${P.className ? `<div><dt>Lớp</dt><dd>${esc(P.className)}</dd></div>` : ""}
                <div><dt>Cấp độ</dt><dd>LV ${esc(P.level)}</dd></div>
                <div><dt>Dự án</dt><dd>${games.length} game</dd></div>
                <div><dt>Trạng thái</dt><dd class="ok">${esc(P.status || "Trực tuyến")}</dd></div>
              </dl>
              <div class="xpbar"><div><span>Chỉ số trung bình</span><b>${avg.toFixed(1)}/10</b></div><i style="--v:${(avg*10).toFixed(1)}%"></i></div>
              ${P.cvFile ? `<a class="btn btn-p" href="${esc(safeUrl(P.cvFile))}" download>Tải CV (PDF)</a>` : ""}
            </div>
          </article>
        </div>
        <div class="cmain">
          ${P.about ? `<div class="panel" data-reveal><p class="ptag">Tiểu sử</p><p class="about">${esc(P.about)}</p></div>` : ""}
          ${sk.length ? `<div class="panel" data-reveal style="--d:.06s">
            <p class="ptag">Chỉ số kỹ năng <span>// ${sk.length} chỉ số</span></p>
            <div class="sk${sk.length < 3 ? " no-radar" : ""}" id="sk">${radarSVG(sk)}
              <div class="mods">${sk.map((k,i) => `
                <div class="mod" data-i="${i}"><div class="mod-top"><span><i>${pad(i+1)}</i>${esc(k.name)}</span><b>${k.level}/10</b></div>
                <div class="mod-bar">${Array.from({length:10}, (_,j) => `<i class="${j < k.level ? "on" : ""}${j >= 7 && j < k.level ? " hi" : ""}" style="--k:${j}"></i>`).join("")}</div></div>`).join("")}
              </div>
            </div>
          </div>` : ""}
          ${P.tools.length ? `<div class="panel" data-reveal style="--d:.1s">
            <p class="ptag">Túi đồ <span>// ${P.tools.length} vật phẩm</span></p>
            <div class="inv" id="inv">${P.tools.map((t,i) => { const [c,lab,st] = rar(i); return `<div class="item ${c}" tabindex="0" data-n="${esc(t)}" data-r="${lab}" data-k="${i+1}"><span class="stars">${st}</span><i>${esc(abbr(t))}</i><span class="nm">${esc(t)}</span></div>`; }).join("")}</div>
            <div class="legend"><span style="--rc:var(--gold)">Huyền thoại · dùng chính</span><span style="--rc:var(--violet-2)">Sử thi · thường dùng</span><span style="--rc:var(--blue)">Hiếm · hỗ trợ</span></div>
          </div>` : ""}
          <div class="panel" data-reveal style="--d:.14s">
            <p class="ptag">Thành tựu <span id="achN"></span></p>
            <div class="achs" id="achs"></div>
            <p class="ach-hint">Thành tựu được lưu trong phiên duyệt web này. Khám phá trang để mở khóa thêm.</p>
          </div>
        </div>
      </section>`;
    portrait($("idPic"), 420);

    // thành tựu: cập nhật ngay khi mở khóa
    const renderAch = (fresh) => {
      const got = getSet("ach"), keys = Object.keys(ACH);
      $("achN").textContent = `// ${got.size}/${keys.length}`;
      $("achs").innerHTML = keys.map(k => { const on = got.has(k); return `<div class="ach ${on ? "on" : ""}${fresh === k ? " fresh" : ""}"><span class="ach-ic">${on ? ICON.trophy : ICON.lock}</span><span><b>${ACH[k][0]}</b><small>${on || !ACH_HINT[k] ? ACH[k][1] : ACH_HINT[k]}</small></span></div>`; }).join("");
    };
    renderAch(); document.addEventListener("ach", e => renderAch(e.detail));

    // kỹ năng: rê chuột lên thanh thì sáng đỉnh tương ứng trên biểu đồ
    const skEl = $("sk");
    if (skEl){
      const hi = i => { skEl.querySelectorAll(".mod").forEach(m => m.classList.toggle("hot", +m.dataset.i === i)); skEl.querySelectorAll(".axl").forEach(a => a.classList.toggle("hot", +a.dataset.i === i)); skEl.querySelectorAll(".dot").forEach((d,k) => d.classList.toggle("hot", k === i)); };
      skEl.addEventListener("pointerover", e => { const m = e.target.closest(".mod,.axl"); hi(m ? +m.dataset.i : -1); });
      skEl.addEventListener("pointerleave", () => hi(-1));
    }

    // túi đồ: chú thích khi rê chuột / chọn bằng bàn phím
    const tip = $("tip"), inv = $("inv");
    if (inv){
      const showTip = (el, x, y) => { tip.innerHTML = `<em class="${el.classList[1]}">${esc(el.dataset.r)}</em><b>${esc(el.dataset.n)}</b><span>Vật phẩm #${pad(el.dataset.k)} trong túi đồ</span>`; tip.classList.add("show"); tip.style.left = Math.max(8, Math.min(x + 16, innerWidth - 250)) + "px"; tip.style.top = Math.min(y + 18, innerHeight - 90) + "px"; };
      inv.addEventListener("pointermove", e => { const it = e.target.closest(".item"); if (it && e.pointerType === "mouse") showTip(it, e.clientX, e.clientY); else tip.classList.remove("show"); });
      inv.addEventListener("pointerleave", () => tip.classList.remove("show"));
      inv.addEventListener("focusin", e => { const it = e.target.closest(".item"); if (it){ const r = it.getBoundingClientRect(); showTip(it, r.left, r.bottom - 10); } });
      inv.addEventListener("focusout", () => tip.classList.remove("show"));
      addEventListener("scroll", () => tip.classList.remove("show"), { passive:true });
    }

    // thẻ hologram nghiêng theo chuột, ánh kim chạy theo góc nghiêng
    const card = $("idcard");
    if (!reduce){
      const st = { x:0, y:0, tx:0, ty:0, on:false };
      card.addEventListener("pointermove", e => { if (e.pointerType !== "mouse") return; const r = card.getBoundingClientRect(); st.tx = (e.clientX - r.left)/r.width - .5; st.ty = (e.clientY - r.top)/r.height - .5; st.on = true; });
      card.addEventListener("pointerleave", () => { st.tx = 0; st.ty = 0; st.on = false; });
      frameHooks.push(now => {
        if (!finePointer){ st.tx = Math.sin(now/2600)*.22; st.ty = Math.cos(now/3300)*.14; }
        st.x += (st.tx - st.x)*.1; st.y += (st.ty - st.y)*.1;
        if (Math.abs(st.x) + Math.abs(st.y) < .0005 && !st.on && finePointer){ card.style.transform = ""; return; }
        card.style.transform = `perspective(1100px) rotateY(${(st.x*16).toFixed(2)}deg) rotateX(${(-st.y*12).toFixed(2)}deg)`;
        card.style.setProperty("--px", ((st.x + .5)*100).toFixed(1) + "%"); card.style.setProperty("--py", ((st.y + .5)*100).toFixed(1) + "%");
        card.style.setProperty("--ang", (st.x*120 + st.y*60).toFixed(1) + "deg");
      });
    }
  };

  /* =========================================================
     NHẬT KÝ NHIỆM VỤ — tổng kết + dòng thời gian + chi tiết
     ========================================================= */
  pages.journey = () => {
    document.title = `Nhật ký nhiệm vụ — ${P.name}`;
    const Q = P.quests.map((q,i) => {
      const time = String(q.time || ""), ys = time.match(/\d{4}/g) || [], a = +ys[0] || YEAR, b = ys[1] ? +ys[1] : (/nay|now|hiện/i.test(time) ? YEAR : a);
      return { title: String(q.title || "Nhiệm vụ"), place: String(q.place || ""), desc: String(q.desc || ""), time, done: !!q.done, i, dur: Math.max(1, b - a), xp: Math.max(1, b - a)*500 };
    });
    const totalXP = Q.reduce((s,q) => s + q.xp, 0), nDone = Q.filter(q => q.done).length, pct = Q.length ? Math.round(nDone/Q.length*100) : 0;
    let f = "all", sel = 0;
    main.innerHTML = `${pageHead("Journey", "Nhật ký nhiệm vụ", "Kinh nghiệm làm việc và học vấn, xếp như các nhiệm vụ đã nhận. Chọn một nhiệm vụ để xem chi tiết.", `<kbd>↑</kbd><kbd>↓</kbd> chọn nhiệm vụ`)}
      <section class="wrap jsum" data-reveal>
        <div class="jst"><small>Tổng kinh nghiệm</small><b><span data-count="${totalXP}" data-pad="1">0</span><em>XP</em></b></div>
        <div class="jst"><small>Hoàn thành</small><b><span data-count="${nDone}">00</span><em>nhiệm vụ</em></b></div>
        <div class="jst"><small>Đang thực hiện</small><b><span data-count="${Q.length - nDone}">00</span><em>nhiệm vụ</em></b></div>
        <div class="jst jbar"><small>Tiến độ chiến dịch</small><b><span data-count="${pct}" data-pad="1">0</span><em>%</em></b><i style="--v:${pct}%"></i></div>
      </section>
      <section class="wrap qlog">
        <div class="qcol" data-reveal style="--d:.06s">
          <div class="qtabs" id="qtabs" role="tablist" aria-label="Lọc nhiệm vụ"><button class="on" data-f="all" role="tab" aria-selected="true">Tất cả</button><button data-f="run" role="tab" aria-selected="false">Đang làm</button><button data-f="fin" role="tab" aria-selected="false">Hoàn thành</button></div>
          <ul class="qlist" id="qlist"></ul>
        </div>
        <div class="panel qd" id="qd" data-reveal style="--d:.12s" aria-live="polite"><div id="qdIn"></div></div>
      </section>`;
    const js = document.querySelector(".jsum"); onVisible(js, () => countUp(js), .3);
    const list = () => Q.filter(q => f === "all" || (f === "fin") === q.done);
    const render = (snd = false) => {
      const L = list(); if (L.length && !L.some(q => q.i === sel)) sel = L[0].i;
      $("qlist").innerHTML = L.length ? L.map((q,k) => `<li style="--i:${k}"><button type="button" class="qitem ${q.i === sel ? "sel" : ""}" data-i="${q.i}" aria-pressed="${q.i === sel}"><span class="node ${q.done ? "fin" : "run"}" aria-hidden="true">${q.done ? ICON.check : ""}</span><span class="qtx"><small>${esc(q.time)}</small><b>${esc(q.title)}</b>${q.place ? `<em>${esc(q.place)}</em>` : ""}</span><span class="xp">+${q.xp} XP</span></button></li>`).join("") : `<li class="empty">Không có nhiệm vụ nào ở mục này.</li>`;
      const q = Q[sel];
      if (!q){ $("qdIn").innerHTML = `<p class="empty">Chưa có nhiệm vụ nào. Hãy thêm vào mục quests trong data.js.</p>`; return; }
      $("qdIn").innerHTML = `<div class="swap">
        <div class="qd-head"><span class="qd-st ${q.done ? "fin" : "run"}">${q.done ? `${ICON.check} Đã hoàn thành` : "◆ Đang thực hiện"}</span><span class="qd-id">Q-${pad(q.i + 1, 3)}</span></div>
        <h2>${esc(q.title)}</h2>
        ${q.place ? `<div class="qd-place">@ ${esc(q.place)}</div>` : ""}
        <dl class="qd-grid"><div><dt>Thời gian</dt><dd>${esc(q.time || "—")}</dd></div><div><dt>Thời lượng</dt><dd>${q.dur} năm</dd></div><div><dt>Phần thưởng</dt><dd>+${q.xp} XP</dd></div></dl>
        ${q.desc ? `<div class="qd-sec"><h3>Mô tả nhiệm vụ</h3><p>${esc(q.desc)}</p></div>` : ""}
        <div class="prog"><div><span>Tiến độ</span><span>${q.done ? "100%" : "Đang chạy"}</span></div><i class="${q.done ? "" : "run"}" style="--v:${q.done ? 100 : 62}%"></i></div>
      </div>`;
      if (snd) Snd.click();
    };
    const pick = i => { sel = i; render(true); completeObj("quest"); };
    $("qlist").addEventListener("click", e => { const b = e.target.closest(".qitem"); if (b){ pick(+b.dataset.i); if (innerWidth < 900) $("qd").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block:"nearest" }); } });
    $("qtabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; f = b.dataset.f;
      [...$("qtabs").children].forEach(x => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); }); render(true); });
    pageKeys = (e, k) => { if (k !== "ArrowDown" && k !== "ArrowUp") return; e.preventDefault(); const L = list(); if (!L.length) return; const p = L.findIndex(q => q.i === sel); pick(L[(p + (k === "ArrowDown" ? 1 : -1) + L.length) % L.length].i); };
    render();
  };

  /* =========================================================
     KÊNH LIÊN LẠC — cảnh hội thoại kiểu JRPG + terminal
     ========================================================= */
  const copyText = txt => {
    const ok = () => { toast(`<div class="toast-ic">${ICON.copy}</div><div class="toast-tx"><small>Bộ nhớ tạm</small><b>Đã sao chép</b><span>${esc(txt)}</span></div>`, "info"); Snd.coin(); };
    const legacy = () => { const t = document.createElement("textarea"); t.value = txt; t.setAttribute("readonly", ""); t.style.cssText = "position:fixed;left:-9999px;opacity:0"; document.body.append(t); t.select(); let r = false; try { r = document.execCommand("copy"); } catch(e){} t.remove(); r ? ok() : toast(`<div class="toast-tx"><small>Không sao chép được</small><b>${esc(txt)}</b></div>`, "info"); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, legacy); else legacy();
  };
  pages.contact = () => {
    document.title = `Liên hệ — ${P.name}`;
    const key = c => fold(c.label).replace(/[^a-z0-9]/g, "") || "lienhe";
    const N = P.contacts.length, mail = c => /^mailto:/i.test(c.url);
    const nChoices = N + 1 + (P.cvFile ? 1 : 0);
    main.innerHTML = `${pageHead("Contact", "Kênh liên lạc", "Nói chuyện với NPC để chọn cách liên hệ, hoặc mở terminal bảo mật để gõ lệnh.", `<kbd>1</kbd>–<kbd>${nChoices}</kbd> chọn lựa chọn trong hội thoại`)}
      <section class="wrap talk">
        <div class="stage" id="stage" data-reveal>
          <div class="stage-art" id="stageArt" data-par aria-hidden="true"></div>
          <div class="stage-shade" aria-hidden="true"></div>
          <div class="dialog" id="dialog">
            <div class="npc">
              <div class="npc-av" id="npcAv"></div>
              <div class="npc-meta"><span class="npc-name">${esc(P.name)}</span>${P.role ? `<span class="npc-role">${esc(P.role)}</span>` : ""}<span class="wave" aria-hidden="true">${Array.from({length:9}, (_,k) => `<i style="--k:${k}"></i>`).join("")}</span></div>
            </div>
            <div class="dl-body">
              <p class="say" id="say"></p>
              <ol class="choices" id="choices">
                ${P.contacts.map((c,i) => `<li style="--d:${(i*.07).toFixed(2)}s"><a href="${esc(safeUrl(c.url))}" ${mail(c) ? "" : 'target="_blank" rel="noopener"'} data-ch><kbd>${i+1}</kbd><b>${esc(c.label)}</b><span>${esc(c.value)}</span></a>${mail(c) ? `<button type="button" class="copy" data-copy="${esc(c.url.replace(/^mailto:/i, "").split("?")[0])}" aria-label="Sao chép địa chỉ email" title="Sao chép email">${ICON.copy}</button>` : ""}</li>`).join("")}
                <li style="--d:${(N*.07).toFixed(2)}s"><button type="button" id="openTerm"><kbd>${N+1}</kbd><b>Mở terminal bảo mật</b><span>Dành cho dân kỹ thuật</span></button></li>
                ${P.cvFile ? `<li style="--d:${((N+1)*.07).toFixed(2)}s"><a href="${esc(safeUrl(P.cvFile))}" download><kbd>${N+2}</kbd><b>Tải CV</b><span>File PDF</span></a></li>` : ""}
              </ol>
              <span class="dl-next" aria-hidden="true"></span>
            </div>
          </div>
        </div>
        <div class="panel term" id="term" hidden>
          <div class="term-bar"><i></i><i></i><i></i><span>khach@neural-link: ~/lien-he</span></div>
          <div class="term-out" id="tout" aria-live="polite"></div>
          <form class="term-in" id="tform" autocomplete="off"><label for="tin">khach@net:~$</label><input id="tin" spellcheck="false" autocapitalize="off" aria-label="Nhập lệnh"></form>
          <div class="cmds" id="tcmds">${["help","whoami", ...P.contacts.map(key), "games", "play", P.cvFile ? "cv" : null, "clear"].filter(Boolean).map(c => `<button type="button" data-c="${esc(c)}">${esc(c)}</button>`).join("")}</div>
        </div>
      </section>`;
    const sa = $("stageArt"), [W, H] = artSize(sa, 1600);
    sa.append(layered({ title: P.name + "-contact", scene:"city", color: C.pink, genres:[] }, W, H, { sx:.72, hz:.44 }));
    portrait($("npcAv"), 220);
    $("choices").addEventListener("click", e => {
      const cp = e.target.closest(".copy"); if (cp){ e.preventDefault(); copyText(cp.dataset.copy); unlock("link"); return; }
      if (e.target.closest("[data-ch]")){ Snd.click(); unlock("link"); }
    });

    // lời thoại gõ từng chữ; bấm vào khung để hiện hết
    const line = `Chào người lữ khách! Bạn đang tìm đồng đội làm game, muốn hợp tác, hay chỉ muốn tán gẫu về game? Chọn một kênh bên dưới để liên lạc với mình nhé.`;
    let typed = false, skip = false;
    const typeLine = () => {
      if (typed) return; typed = true; const el = $("say"), d = $("dialog");
      const end = () => { el.textContent = line; el.classList.add("done"); d.classList.remove("talking"); d.classList.add("ready"); $("choices").classList.add("show"); completeObj("talk"); };
      if (reduce) return end();
      d.classList.add("talking"); let i = 0;
      const step = () => { if (skip) return end(); i += 2; el.textContent = line.slice(0, i); if (i % 6 === 0) Snd.type(); if (i < line.length) setTimeout(step, 24); else end(); };
      setTimeout(step, 300);
      d.addEventListener("click", function sk(){ skip = true; d.removeEventListener("click", sk); });
    };
    $("stage")._onIn = typeLine;

    // terminal
    const out = $("tout"), input = $("tin");
    const print = (html, cls = "") => { const p = document.createElement("p"); if (cls) p.className = cls; p.innerHTML = html; out.append(p); out.scrollTop = out.scrollHeight; };
    const open = c => { print(`Đang mở ${esc(c.label)}: <a href="${esc(safeUrl(c.url))}" ${mail(c) ? "" : 'target="_blank" rel="noopener"'}>${esc(c.value)}</a>`, "w"); unlock("link"); window.open(safeUrl(c.url), mail(c) ? "_self" : "_blank", "noopener"); };
    const CMD = {
      help: () => { print("Các lệnh có sẵn:", "c"); print([["whoami","thông tin về mình"], ...P.contacts.map(c => [key(c), `mở ${c.label}`]), ["games","danh sách game"], ["game <số>","mở chi tiết game"], ["play","chơi Neon Drift mini"], ["ach","xem thành tựu đã mở"], P.cvFile ? ["cv","tải CV"] : null, ["clear","xóa màn hình"]].filter(Boolean).map(([a,b]) => `  ${esc(a.padEnd(11))} ${esc(b)}`).join("\n")); },
      whoami: () => { print(`${esc(P.name)}${P.role ? ` // ${esc(P.role)}` : ""}`, "w"); if (P.codename) print(`Code name: <span class="c">${esc(P.codename)}</span>`); print(`${P.className ? esc(P.className) + " · " : ""}LV ${P.level} · ${games.length} dự án`); if (P.tagline) print(esc(P.tagline), "d"); },
      games: () => { if (!games.length) return print("Chưa có game nào.", "e"); games.forEach((g,i) => print(`  [${pad(i+1)}] ${esc(g.title.padEnd(22))} <span class="${isDev(g) ? "w" : "c"}">${stText(g)}</span>`)); print("Gõ: game 1, game 2… để mở chi tiết.", "d"); },
      cv: () => { if (!P.cvFile) return print("Chưa có file CV.", "e"); print("Đang tải CV…", "w"); const a = document.createElement("a"); a.href = safeUrl(P.cvFile); a.download = ""; document.body.append(a); a.click(); a.remove(); },
      play: () => { print("Khởi động Neon Drift mini… chúc may mắn!", "w"); setTimeout(() => Arcade.open(), 350); },
      ach: () => { const got = getSet("ach"), keys = Object.keys(ACH); print(`Thành tựu: ${got.size}/${keys.length}`, "c"); keys.forEach(k => print(`  ${got.has(k) ? '<span class="c">[x]</span>' : "[ ]"} ${got.has(k) || !ACH_HINT[k] ? esc(ACH[k][0]) : "???"}`)); },
      clear: () => { out.innerHTML = ""; },
      sudo: () => print("Quyền bị từ chối. Nhưng bạn có thể tuyển mình — gõ 'hire'.", "e"),
      hire: () => { print("Tuyệt vời! Đang mở kênh liên lạc chính…", "w"); if (P.contacts[0]) open(P.contacts[0]); }
    };
    P.contacts.forEach(c => { if (!CMD[key(c)]) CMD[key(c)] = () => open(c); });
    if (CMD.itchio && !CMD.itch) CMD.itch = CMD.itchio;
    CMD.choi = CMD.play; CMD.thanhtuu = CMD.ach;
    // bước nhập mật khẩu sau lệnh bí mật: ô nhập chuyển sang dạng ẩn ký tự, không lưu lịch sử
    let askPw = false;
    const pwMode = on => { askPw = on; input.type = on ? "password" : "text"; input.value = ""; $("tform").querySelector("label").textContent = on ? "mật khẩu:" : "khach@net:~$"; };
    const runPw = pw => {
      pwMode(false);
      if (!pw){ print("Đã hủy.", "d"); return; }
      print(`<span class="c">mật khẩu:</span> ${"•".repeat(Math.min(pw.length, 12))}`);
      const r = NL_GATE.tryPass(pw);
      if (r === true){ print("Xác thực thành công. Đang mở chế độ chỉnh sửa…", "w"); Snd.coin(); setTimeout(() => NL_GATE.openEditor(), 400); }
      else if (r > 0) print(`Tạm khóa do nhập sai nhiều lần. Thử lại sau ${r} giây.`, "e");
      else print("Sai mật khẩu. Truy cập bị từ chối.", "e");
    };
    const run = raw => {
      if (askPw) return runPw(raw);
      const l = raw.trim(); if (!l) return;
      print(`<span class="c">khach@net:~$</span> ${esc(l)}`);
      if (NL_GATE.isCmd(l)){
        const w = NL_GATE.wait();
        if (w > 0) return print(`Tạm khóa do nhập sai nhiều lần. Thử lại sau ${w} giây.`, "e");
        print("Yêu cầu quyền quản trị. Nhập mật khẩu rồi bấm Enter (để trống để hủy).", "c"); pwMode(true); input.focus({ preventScroll:true }); return;
      }
      const [c, arg] = fold(l).split(/\s+/);
      if (c === "game" && arg){ const i = parseInt(arg, 10) - 1; if (games[i]){ print(`Mở ${esc(games[i].title)}…`, "w"); setTimeout(() => go(`game.html?id=${i}`), 250); } else print("Không có game số đó.", "e"); }
      else if (CMD[c]) CMD[c]();
      else print(`Không tìm thấy lệnh: ${esc(c)}. Gõ <span class="c">help</span> để xem danh sách.`, "e");
      Snd.click(); completeObj("cmd"); unlock("hacker");
    };
    $("tform").addEventListener("submit", e => { e.preventDefault(); run(input.value); input.value = ""; });
    $("tcmds").addEventListener("click", e => { const b = e.target.closest("button"); if (b){ if (askPw) pwMode(false); run(b.dataset.c); input.focus({ preventScroll:true }); } });
    out.addEventListener("click", () => input.focus({ preventScroll:true }));
    // lịch sử lệnh bằng phím ↑ ↓
    const hist = []; let hp = 0;
    input.addEventListener("keydown", e => {
      if (askPw){ if (e.key === "Escape"){ e.preventDefault(); runPw(""); } return; }
      if (e.key === "Enter" && input.value.trim()){ hist.push(input.value.trim()); hp = hist.length; }
      else if (e.key === "ArrowUp" && hist.length){ e.preventDefault(); hp = Math.max(0, hp - 1); input.value = hist[hp]; }
      else if (e.key === "ArrowDown" && hist.length){ e.preventDefault(); hp = Math.min(hist.length, hp + 1); input.value = hist[hp] || ""; }
    });
    let termOpen = false;
    const openTerm = () => {
      const t = $("term"); Snd.swap();
      if (!termOpen){ termOpen = true; t.hidden = false; void t.offsetWidth; t.classList.add("open");
        [["NEURAL-LINK // kênh liên lạc bảo mật đã mở.","c"],[`Xin chào! Đây là terminal liên hệ của ${esc(P.name)}.`,""],['Gõ <span class="c">help</span> để xem lệnh, hoặc bấm các nút bên dưới.',"d"]].forEach(([s,c],i) => setTimeout(() => print(s, c), reduce ? 0 : 200 + i*300)); }
      t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block:"center" }); setTimeout(() => input.focus({ preventScroll:true }), 500);
    };
    $("openTerm").addEventListener("click", openTerm);
    const items = [...$("choices").querySelectorAll("li > a, li > button:not(.copy)")];
    // trên trang này, phím số chọn lựa chọn trong hội thoại thay vì chuyển trang
    CHOICE_KEYS = n => { if (!$("choices").classList.contains("show") || !items[n-1]) return false; items[n-1].focus({ preventScroll:true }); items[n-1].click(); return true; };
  };

  /* =========================================================
     404 — mất tín hiệu (kèm mini-game để giết thời gian)
     ========================================================= */
  pages["404"] = () => {
    document.title = `Mất tín hiệu — ${P.name}`;
    main.innerHTML = `<section class="lost">
      <div class="lost-scene" aria-hidden="true"><div class="sunmark big"></div><div class="floor"></div></div>
      <div class="lost-in">
        <div class="crumb"><span>Lỗi</span><i>/</i><b>404</b></div>
        <h1 class="lost-n glitch" data-text="404">404</h1>
        <p class="lost-t">Tín hiệu bị mất</p>
        <p class="lost-p">Trang bạn tìm không tồn tại hoặc đã bị di chuyển. Trong lúc chờ, thử một vòng Neon Drift nhé?</p>
        <div class="actions"><a class="btn btn-p" href="index.html">Về trung tâm ${ICON.arrow}</a><button class="btn btn-o" type="button" id="play404">${ICON.pad} Chơi Neon Drift mini</button></div>
        <p class="lost-best">Kỷ lục của bạn: <b id="best404">${Arcade.best()}</b> điểm</p>
      </div>
    </section>`;
    $("play404").addEventListener("click", () => Arcade.open());
    document.addEventListener("arcade", () => { $("best404").textContent = Arcade.best(); });
  };

  /* =========================================================
     MINI-GAME "NEON DRIFT MINI"
     Mở bằng mã bí mật ↑↑↓↓←→←→ B A, lệnh "play" trong terminal hoặc nút ở trang 404
     ========================================================= */
  const Arcade = (() => {
    let box = null, cv = null, x = null, W = 1, H = 1, dpr = 1, raf = 0, back = null, bgC = null, ground = null, state = "ready", paused = false, lastT = 0, hz = 1, cx = 1, RW = 1;
    // chất lượng tự điều chỉnh: máy yếu thì bỏ viền phát sáng và giảm độ phân giải để giữ mượt
    let hq = true, qN = 0, qT = 0;
    const blur = v => hq ? v : 0;
    const DMAX = 120, DCAR = 2.6, FOC = 8;
    const G = { objs:[], parts:[] };
    const best = () => +ls.get("arcadeBest") || 0;
    const p = d => 1/(1 + Math.max(-FOC*.85, d)/FOC);
    const Y = d => hz + (H - hz)*p(d);
    const HW = d => RW*p(d);
    const LX = (l, d) => cx + (l - 1)*HW(d)*.667;
    function reset(){ Object.assign(G, { lane:1, lx:1, tilt:0, speed:28, dist:0, coins:0, score:0, t:0, next:10, objs:[], parts:[], shake:0, flash:0, shown:-1, newBest:false, racer:false }); }

    function size(){
      if (!box) return;
      W = Math.max(1, cv.clientWidth); H = Math.max(1, cv.clientHeight); dpr = Math.min(devicePixelRatio || 1, hq ? (finePointer ? 2 : 1.75) : 1);
      cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
      hz = Math.round(H*.4); cx = W/2; RW = Math.min(W*.6, H*.95);
      bgC = mkCanvas(W*dpr, (hz + 2)*dpr); const b = bgC.getContext("2d"); b.scale(dpr, dpr);
      const r = rng(4242), s = Math.max(.6, Math.min(W, H*1.6)/900);
      paintSky(b, W, hz, C.pink, r, s, { starDiv:1700 });
      const R = Math.min(W*.15, hz*.6);
      paintSun(b, cx, hz - R*.4, R, C.gold, () => .3, true);
      b.drawImage(mountains(W, hz + 2, r, { base:hz + 1, amp:hz*.2, top:"#3B1F68", bottom:"#28154A", rim:"rgba(255,150,200,.55)", scale:s, shape: t => .35 + Math.abs(t - .5)*1.3 }), 0, 0);
      b.drawImage(skyline(W, hz + 2, r, { base:hz + 1, minW:W*.018, maxW:W*.045, minH:hz*.05, maxH:hz*.26, gap:4*s, fill:"#120A26", wins:[C.pink, C.gold, C.lilac], winP:.12, winA:.85, signP:.35, scale:s, shape: t => .25 + Math.abs(t - .5)*1.6 }), 0, 0);
      horizonLine(b, W, hz, "#FFB3D4", .95);
      ground = x.createLinearGradient(0, hz, 0, H); ground.addColorStop(0, "#3A1450"); ground.addColorStop(.18, "#1C0B34"); ground.addColorStop(1, "#090514");
      if (state !== "run") render(performance.now()/1000);
    }

    /* ---------- luật chơi ---------- */
    function spawnRow(){
      const lanes = [0,1,2].sort(() => Math.random() - .5), two = G.t > 10 && Math.random() < .5;
      G.objs.push({ l:lanes[0], d:DMAX, type: Math.random() < .35 ? "car" : "bar" });
      if (two) G.objs.push({ l:lanes[1], d:DMAX, type: Math.random() < .35 ? "car" : "bar" });
      if (Math.random() < .6) G.objs.push({ l:lanes[2], d:DMAX + (Math.random() < .5 ? 0 : 7), type:"coin", ph:Math.random()*6 });
    }
    const burst = (px, py, col, n, sp = 1) => { for (let i = 0; i < n; i++){ const a = Math.random()*Math.PI*2, v = (60 + Math.random()*260)*sp; G.parts.push({ x:px, y:py, vx:Math.cos(a)*v, vy:Math.sin(a)*v - 60, life:.5 + Math.random()*.6, age:0, z:6 + Math.random()*14, c:col }); } };
    function move(dir){ if (state !== "run" || paused) return; const n = clamp(G.lane + dir, 0, 2); if (n !== G.lane){ G.lane = n; Snd.move(); } }
    function crash(){
      state = "over"; G.shake = .6; G.flash = 1; Snd.crash();
      const px = LX(G.lx, DCAR), py = Y(DCAR) - HW(DCAR)*.12;
      burst(px, py, C.pink, 46, 1.2); burst(px, py, C.gold, 34); burst(px, py, "#FFFFFF", 12, .6);
      if (G.score > best()){ ls.set("arcadeBest", G.score); G.newBest = true; }
      document.dispatchEvent(new CustomEvent("arcade"));
      setTimeout(() => { if (box && state === "over") overlay("over"); }, 700);
    }
    function update(dt){
      G.t += dt; G.speed = Math.min(80, 28 + G.t*1.15);
      const mv = G.speed*dt; G.dist += mv;
      G.lx += (G.lane - G.lx)*Math.min(1, dt*13);
      G.tilt += ((G.lane - G.lx) - G.tilt)*Math.min(1, dt*9);
      G.next -= mv; if (G.next <= 0){ spawnRow(); G.next = 26 - Math.min(10, G.t*.2); }
      for (const o of G.objs){
        const pd = o.d; o.d -= mv;
        if (o.hit) continue;
        // va chạm khi vật đi qua hàng của xe (kể cả khi tốc độ cao nhảy qua trong một khung hình)
        if (pd >= DCAR - 1.2 && o.d <= DCAR + 1.2 && Math.abs(o.l - G.lx) < .52){
          o.hit = true;
          if (o.type === "coin"){ G.coins++; burst(LX(o.l, DCAR), Y(DCAR) - HW(DCAR)*.25, C.gold, 20, .8); Snd.coin(); }
          else { crash(); return; }
        }
      }
      G.objs = G.objs.filter(o => o.d > -4 && !(o.type === "coin" && o.hit));
      G.score = Math.floor(G.dist*.25) + G.coins*25;
      if (G.score >= 300 && !G.racer){ G.racer = true; unlock("racer"); }
      // tia lửa ống xả
      if (Math.random() < .7){ const w = HW(DCAR)*.5, px = LX(G.lx, DCAR); G.parts.push({ x:px + (Math.random() < .5 ? -1 : 1)*w*.22, y:Y(DCAR) - 2, vx:(Math.random() - .5)*40, vy:60 + Math.random()*80, life:.35 + Math.random()*.3, age:0, z:5 + Math.random()*7, c: Math.random() < .5 ? C.pink : C.gold }); }
    }
    function stepParts(dt){
      for (const q of G.parts){ q.age += dt; q.x += q.vx*dt; q.y += q.vy*dt; q.vy += 240*dt; q.vx *= .985; }
      G.parts = G.parts.filter(q => q.age < q.life);
    }

    /* ---------- vẽ ---------- */
    function quad(x0, y0, w0, x1, y1, w1){ x.beginPath(); x.moveTo(x0 - w0, y0); x.lineTo(x0 + w0, y0); x.lineTo(x1 + w1, y1); x.lineTo(x1 - w1, y1); x.closePath(); }
    function drawBar(px, py, w, a){
      const h = w*.46;
      x.save(); x.globalAlpha = a;
      x.globalCompositeOperation = "lighter"; x.drawImage(sprite(C.pink), px - w, py - h*1.6, w*2, h*2.6); x.globalCompositeOperation = "source-over";
      x.fillStyle = "#1A0B2E"; x.fillRect(px - w/2, py - h, w, h*.72);
      x.save(); x.beginPath(); x.rect(px - w/2, py - h, w, h*.72); x.clip();
      x.fillStyle = C.gold; for (let k = -2; k < 7; k++){ const sx = px - w/2 + k*w*.2; x.beginPath(); x.moveTo(sx, py - h); x.lineTo(sx + w*.1, py - h); x.lineTo(sx + w*.1 - h*.72, py - h*.28); x.lineTo(sx - h*.72, py - h*.28); x.closePath(); x.fill(); }
      x.restore();
      x.strokeStyle = C.pink; x.lineWidth = Math.max(1, w*.035); x.shadowColor = C.pink; x.shadowBlur = blur(w*.3); x.strokeRect(px - w/2, py - h, w, h*.72);
      x.shadowBlur = 0; x.fillStyle = "#2A1446"; x.fillRect(px - w*.42, py - h*.28, w*.08, h*.28); x.fillRect(px + w*.34, py - h*.28, w*.08, h*.28);
      x.restore();
    }
    function drawCar(px, py, w, tilt, body, light, a = 1, me = false){
      const h = w*.5;
      x.save(); x.globalAlpha = a; x.translate(px, py); x.rotate(tilt*.1);
      x.globalCompositeOperation = "lighter"; x.drawImage(sprite(light), -w*1.1, -h*.7, w*2.2, h*1.4); x.globalCompositeOperation = "source-over";
      // bánh xe
      x.fillStyle = "#05030A"; x.fillRect(-w*.5, -h*.3, w*.16, h*.3); x.fillRect(w*.34, -h*.3, w*.16, h*.3);
      // thân xe
      x.beginPath(); x.moveTo(-w*.52, -h*.12); x.lineTo(w*.52, -h*.12); x.lineTo(w*.5, -h*.55); x.lineTo(w*.32, -h*.98); x.lineTo(-w*.32, -h*.98); x.lineTo(-w*.5, -h*.55); x.closePath();
      const g = x.createLinearGradient(0, -h, 0, 0); g.addColorStop(0, mix(body, "#FFFFFF", .15)); g.addColorStop(1, mix(body, "#05030A", .6));
      x.fillStyle = g; x.fill();
      x.strokeStyle = light; x.lineWidth = Math.max(1, w*.02); x.shadowColor = light; x.shadowBlur = blur(w*.15); x.stroke(); x.shadowBlur = 0;
      // kính sau
      x.beginPath(); x.moveTo(-w*.27, -h*.92); x.lineTo(w*.27, -h*.92); x.lineTo(w*.38, -h*.62); x.lineTo(-w*.38, -h*.62); x.closePath();
      const gw = x.createLinearGradient(0, -h*.92, 0, -h*.62); gw.addColorStop(0, me ? "rgba(89,227,255,.55)" : "rgba(187,169,255,.35)"); gw.addColorStop(1, "rgba(20,10,40,.9)"); x.fillStyle = gw; x.fill();
      // đèn hậu
      x.fillStyle = light; x.shadowColor = light; x.shadowBlur = blur(w*.22);
      x.fillRect(-w*.47, -h*.5, w*.3, h*.11); x.fillRect(w*.17, -h*.5, w*.3, h*.11);
      x.fillRect(-w*.08, -h*.34, w*.16, h*.06);
      x.shadowBlur = 0; x.restore();
    }
    function drawCoin(px, py, r, ph, t, a){
      const sq = Math.abs(Math.cos(t*4 + ph)), y = py - r*1.8 - Math.sin(t*3 + ph)*r*.35;
      x.save(); x.globalAlpha = a; x.globalCompositeOperation = "lighter"; x.drawImage(sprite(C.gold), px - r*3, y - r*3, r*6, r*6); x.globalCompositeOperation = "source-over";
      const g = x.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, "#FFF4C2"); g.addColorStop(1, C.orange);
      x.fillStyle = g; x.beginPath(); x.ellipse(px, y, Math.max(1, r*sq), r, 0, 0, Math.PI*2); x.fill();
      x.fillStyle = "rgba(120,50,0,.45)"; x.beginPath(); x.ellipse(px, y, Math.max(.5, r*sq*.45), r*.5, 0, 0, Math.PI*2); x.fill();
      x.restore();
    }
    function render(t){
      if (!x || !bgC) return;
      x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, W, H);
      if (G.shake > 0) x.translate((Math.random() - .5)*20*G.shake, (Math.random() - .5)*14*G.shake);
      x.drawImage(bgC, 0, 0, W, hz + 2);
      // vạch tốc độ trên trời khi chạy nhanh
      const sp = clamp((G.speed - 45)/35, 0, 1);
      if (state === "run" && sp > 0){ x.save(); x.globalCompositeOperation = "lighter"; x.strokeStyle = `rgba(255,200,230,${.18*sp})`; x.lineWidth = 1; x.beginPath(); for (let k = 0; k < 14; k++){ const a = Math.random()*Math.PI, r0 = W*(.2 + Math.random()*.3); x.moveTo(cx + Math.cos(a)*r0, hz - Math.sin(a)*r0*.5); x.lineTo(cx + Math.cos(a)*(r0 + 60), hz - Math.sin(a)*(r0 + 60)*.5); } x.stroke(); x.restore(); }
      // mặt đất + lưới
      x.fillStyle = ground; x.fillRect(-30, hz, W + 60, H - hz + 30);
      x.save(); x.globalCompositeOperation = "lighter";
      x.lineWidth = 1; x.strokeStyle = "rgba(255,79,154,.3)"; x.beginPath();
      for (let k = -16; k <= 16; k++){ if (Math.abs(k) < 2) continue; x.moveTo(cx, hz); x.lineTo(cx + k*RW*.5, Y(-1)); }
      x.stroke();
      const SP = 6, off = G.dist % SP;
      for (let k = 0; k < 22; k++){ const d = k*SP - off; if (d < -1) continue; const y = Y(d), a = clamp(p(d)*1.4 - .08, 0, 1); x.strokeStyle = `rgba(255,79,154,${(.55*a).toFixed(3)})`; x.beginPath(); x.moveTo(-10, y); x.lineTo(W + 10, y); x.stroke(); }
      x.restore();
      // đường đua
      const yF = Y(DMAX), yN = Y(-1.5);
      quad(cx, yF, HW(DMAX), cx, yN, HW(-1.5));
      const rg = x.createLinearGradient(0, yF, 0, yN); rg.addColorStop(0, "#2A1144"); rg.addColorStop(.25, "#150A2A"); rg.addColorStop(1, "#0C0618"); x.fillStyle = rg; x.fill();
      // vạch chia làn chạy về phía người chơi
      x.fillStyle = "rgba(255,198,92,.85)";
      const DS = 8, doff = G.dist % DS;
      for (let k = 0; k < 16; k++){ const d0 = k*DS - doff, d1 = d0 + 3.4; if (d1 < -1.5 || d0 > DMAX) continue; for (const s of [-1, 1]){ const a0 = Math.max(d0, -1.5), a1 = Math.min(d1, DMAX), x0 = cx + s*HW(a0)*.333, x1 = cx + s*HW(a1)*.333; quad(x0, Y(a0), Math.max(.6, HW(a0)*.012), x1, Y(a1), Math.max(.4, HW(a1)*.012)); x.fill(); } }
      // mép đường phát sáng
      x.save(); x.globalCompositeOperation = "lighter";
      for (const s of [-1, 1]){ for (const [lw, al] of [[10, .12], [4, .35], [1.6, 1]]){ x.strokeStyle = s < 0 ? `rgba(255,79,154,${al})` : `rgba(89,227,255,${al})`; x.lineWidth = lw; x.beginPath(); x.moveTo(cx + s*HW(DMAX), yF); x.lineTo(cx + s*HW(-1.5), yN); x.stroke(); } }
      x.restore();
      // sương ở đường chân trời
      const fg = x.createLinearGradient(0, hz, 0, hz + (H - hz)*.22); fg.addColorStop(0, "rgba(255,110,170,.42)"); fg.addColorStop(1, "rgba(255,110,170,0)"); x.fillStyle = fg; x.fillRect(0, hz, W, (H - hz)*.22);
      // vật cản & xu (xa vẽ trước)
      const objs = [...G.objs].sort((a,b) => b.d - a.d);
      for (const o of objs){
        if (o.d < -2) continue;
        const a = clamp((DMAX - o.d)/14, 0, 1), px = LX(o.l, o.d), py = Y(o.d), w = HW(o.d)*.48;
        if (o.type === "coin") drawCoin(px, py, HW(o.d)*.085, o.ph, t, a);
        else if (o.type === "car") drawCar(px, py, w*.95, 0, "#3A1D6E", "#FF5C6C", a);
        else drawBar(px, py, w, a);
      }
      // xe người chơi
      if (state !== "over" || G.flash > .3) drawCar(LX(G.lx, DCAR), Y(DCAR), HW(DCAR)*.5, G.tilt, "#5A2A9A", C.pink, 1, true);
      // hạt sáng
      x.save(); x.globalCompositeOperation = "lighter";
      for (const q of G.parts){ const k = 1 - q.age/q.life; x.globalAlpha = k; x.drawImage(sprite(q.c), q.x - q.z/2, q.y - q.z/2, q.z, q.z); }
      x.restore();
      if (G.flash > 0){ x.fillStyle = `rgba(255,220,240,${(G.flash*.5).toFixed(3)})`; x.fillRect(-20, -20, W + 40, H + 40); }
      // viền tối
      x.setTransform(dpr, 0, 0, dpr, 0, 0); vignette(x, W, H, .5);
    }

    /* ---------- giao diện ---------- */
    function hud(){
      if (G.score !== G.shown){ G.shown = G.score; $("arS").textContent = G.score; }
      $("arB").textContent = Math.max(best(), G.score);
      $("arV").textContent = Math.round(G.speed*4.2);
    }
    function overlay(kind){
      const ov = $("arOv"); if (!ov) return;
      if (!kind){ ov.className = "ar-ov"; ov.innerHTML = ""; cv.focus({ preventScroll:true }); return; }
      const touch = !finePointer;
      const ctl = touch ? "Chạm nửa trái / phải màn hình (hoặc nút bên dưới) để đổi làn" : "Phím ← → hoặc A D để đổi làn · P tạm dừng · Esc thoát";
      ov.className = "ar-ov show " + kind;
      ov.innerHTML = kind === "ready" ? `<div class="ar-card"><p class="ar-k">Mini-game // Arcade</p><h3>Neon Drift <em>mini</em></h3><p>Né rào chắn và xe khác, nhặt xu vàng để cộng điểm. Đạt <b>300 điểm</b> để mở thành tựu ẩn.</p><p class="ar-ctl">${ctl}</p><button class="btn btn-p" type="button" data-a="go">${ICON.play} Bắt đầu <kbd>Space</kbd></button></div>`
        : kind === "pause" ? `<div class="ar-card"><h3>Tạm dừng</h3><p>Điểm hiện tại: <b>${G.score}</b></p><button class="btn btn-p" type="button" data-a="resume">${ICON.play} Tiếp tục <kbd>Space</kbd></button></div>`
        : `<div class="ar-card"><p class="ar-k">Va chạm!</p><h3>${G.score} <em>điểm</em></h3>${G.newBest ? `<p class="ar-new">${ICON.trophy} Kỷ lục mới!</p>` : `<p>Kỷ lục: <b>${best()}</b> điểm</p>`}<p class="ar-sub">${G.coins} xu · ${Math.round(G.dist)} m · ${Math.round(G.t)} giây</p><div class="ar-btns"><button class="btn btn-p" type="button" data-a="go">Chơi lại <kbd>Space</kbd></button><button class="btn btn-o" type="button" data-a="close">Thoát <kbd>Esc</kbd></button></div></div>`;
      const b = ov.querySelector("button"); if (b) b.focus({ preventScroll:true });
    }
    function begin(){ reset(); state = "run"; paused = false; overlay(null); Snd.coin(); }
    function pause(){ if (state === "run" && !paused){ paused = true; overlay("pause"); } }
    function resume(){ if (paused){ paused = false; lastT = 0; overlay(null); } }
    function loop(now){
      if (!box) return;
      const dt = lastT ? Math.min(.05, (now - lastT)/1000) : 0;
      if (hq && lastT && state === "run" && !paused && now - lastT < 250){ qT += now - lastT; if (++qN >= 90){ if (qT/qN > 24){ hq = false; size(); } qN = 0; qT = 0; } }
      lastT = now;
      if (state === "run" && !paused) update(dt);
      else if (state === "ready") G.dist += 9*dt;
      stepParts(dt); G.shake = Math.max(0, G.shake - dt*1.5); G.flash = Math.max(0, G.flash - dt*2.2);
      render(now/1000); hud();
      raf = requestAnimationFrame(loop);
    }
    const onVis = () => { if (document.hidden) pause(); };
    function keys(e, k){
      if (k === "Escape"){ e.preventDefault(); close(); return; }
      if (k === "Tab"){ e.preventDefault(); const b = [...box.querySelectorAll("button:not([hidden])")].filter(n => n.offsetParent); if (b.length){ b[(b.indexOf(document.activeElement) + (e.shiftKey ? -1 : 1) + b.length) % b.length].focus(); } return; }
      if (k === "Enter" && e.target.closest && e.target.closest("button")) return;
      if (state === "run" && !paused){
        if (k === "ArrowLeft" || k === "a"){ e.preventDefault(); move(-1); }
        else if (k === "ArrowRight" || k === "d"){ e.preventDefault(); move(1); }
        else if (k === "p"){ e.preventDefault(); pause(); }
        else if (k === " " || k === "ArrowUp" || k === "ArrowDown") e.preventDefault();
      } else if (k === " " || k === "Enter"){ e.preventDefault(); paused ? resume() : begin(); }
    }
    function open(){
      if (box) return;
      back = document.activeElement;
      setTracker(false); setMenu(false);
      document.body.insertAdjacentHTML("beforeend", `<div class="arcade" id="arcade" role="dialog" aria-modal="true" aria-label="Mini-game Neon Drift">
        <div class="ar-box">
          <div class="ar-top"><span class="ar-logo">Neon Drift <em>mini</em></span><span class="ar-hud"><span>Điểm <b id="arS">0</b></span><span>Kỷ lục <b id="arB">0</b></span><span class="ar-spd"><b id="arV">0</b> km/h</span></span><button class="ar-x" id="arX" type="button" aria-label="Đóng mini-game">${ICON.close}</button></div>
          <div class="ar-view"><canvas id="arCv" tabindex="-1" aria-label="Màn hình trò chơi"></canvas><div class="ar-ov" id="arOv"></div></div>
          <div class="ar-pad"><button type="button" data-m="-1" aria-label="Sang trái">${ICON.left}</button><button type="button" data-m="1" aria-label="Sang phải">${ICON.right}</button></div>
        </div>
      </div>`);
      box = $("arcade"); cv = $("arCv"); x = cv.getContext("2d");
      reset(); state = "ready"; paused = false; lastT = 0;
      document.documentElement.classList.add("ar-lock");
      size(); overlay("ready");
      requestAnimationFrame(() => box && box.classList.add("open"));
      $("arX").addEventListener("click", close);
      box.querySelector(".ar-pad").addEventListener("pointerdown", e => { const b = e.target.closest("[data-m]"); if (!b) return; e.preventDefault(); if (state === "run" && !paused) move(+b.dataset.m); else if (state !== "over") paused ? resume() : begin(); });
      $("arOv").addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (!b) return; const a = b.dataset.a; if (a === "go") begin(); else if (a === "resume") resume(); else if (a === "close") close(); });
      cv.addEventListener("pointerdown", e => { if (state !== "run" || paused) return; const r = cv.getBoundingClientRect(); move(e.clientX - r.left < r.width/2 ? -1 : 1); });
      box.addEventListener("pointerdown", e => { if (e.target === box) close(); });
      addEventListener("resize", size); document.addEventListener("visibilitychange", onVis);
      modal = keys;
      Snd.whoosh();
      raf = requestAnimationFrame(loop);
    }
    function close(){
      if (!box) return;
      cancelAnimationFrame(raf); const b = box; box = null; modal = null; x = null;
      b.classList.remove("open"); setTimeout(() => b.remove(), 380);
      document.documentElement.classList.remove("ar-lock");
      removeEventListener("resize", size); document.removeEventListener("visibilitychange", onVis);
      if (back && back.focus && back !== document.body) back.focus({ preventScroll:true });
    }
    return { open, close, best };
  })();

  /* =========================================================
     MÀN HÌNH BẮT ĐẦU (lần đầu mỗi phiên duyệt web)
     ========================================================= */
  function boot(done){
    if (reduce || ss.get("booted")){ done(); return; }
    ss.set("booted", "1");
    document.body.insertAdjacentHTML("beforeend", `<div class="boot${PAGE === "home" ? " boot-home" : ""}" id="boot" role="dialog" aria-modal="true" aria-label="Màn hình khởi động">
      <div class="boot-scene" aria-hidden="true"><div class="sunmark big"></div><div class="floor"></div></div>
      <div class="boot-in">
        <p class="boot-k"><i></i>NEURAL-LINK OS <span>v${YEAR}.${esc(P.level)}</span></p>
        <h2 class="boot-name glitch${lenCls(P.name, 16, 26)}" data-text="${esc(P.name)}">${esc(P.name)}</h2>
        ${P.role ? `<p class="boot-role">${esc(P.role)}</p>` : ""}
        <pre class="boot-log" id="bootLog" aria-hidden="true"></pre>
        <div class="boot-bar" aria-hidden="true"><i id="bootBar"></i></div>
        <button class="boot-btn" id="bootBtn" type="button"><span>Nhấn để bắt đầu</span></button>
        <p class="boot-hint">Trang có âm thanh nhẹ · tắt bằng nút loa trên thanh HUD</p>
      </div>
    </div>`);
    const lines = [
      [`Khởi động hệ thống // ${new Date().toLocaleDateString("vi-VN")}`, ""],
      ["Thiết lập kết nối mạng lưới", "OK"],
      [`Giải mã hồ sơ: ${P.name.toUpperCase()}`, "OK"],
      [`Nạp ${games.length} dự án game`, "OK"],
      [`Đồng bộ ${P.skills.length} kỹ năng, ${P.tools.length} vật phẩm`, "OK"],
      ["Truy cập được cấp phép.", "*"]
    ];
    const log = $("bootLog"), btn = $("bootBtn"); let li = 0, fast = false, ended = false;
    const fill = (row, full, s) => {
      if (s === "OK") row.innerHTML = `${esc(full)}<span class="dots"></span><span class="ok">[OK]</span>`;
      else if (s === "*") row.innerHTML = `<span class="hi">${esc(full)}</span>`;
      else row.textContent = full;
    };
    const showBtn = () => { if (ended || !$("bootBar")) return; ended = true; $("bootBar").style.width = "100%"; btn.classList.add("show"); btn.focus({ preventScroll:true }); };
    const next = () => {
      if (!$("bootBar")) return;   // màn khởi động đã đóng giữa chừng
      $("bootBar").style.width = (li/lines.length*100) + "%";
      if (li >= lines.length) return showBtn();
      const [t, s] = lines[li++], row = document.createElement("div"); log.append(row);
      const full = `> ${t}`;
      if (fast){ fill(row, full, s); return next(); }
      let i = 0;
      const ty = () => { if (fast){ fill(row, full, s); return setTimeout(next, 0); } i += 2; row.textContent = full.slice(0, i); if (i % 4 === 0) Snd.type(); if (i < full.length) setTimeout(ty, 12); else { fill(row, full, s); setTimeout(next, 110); } };
      ty();
    };
    setTimeout(next, 300);
    const finish = () => {
      const b = $("boot"); if (!b || b.classList.contains("out")) return;
      setSound(ls.get("sound") !== "0"); Snd.ensure(); setTimeout(() => Snd.start(), 30);
      b.classList.add("out"); setTimeout(() => b.remove(), 900);
      // nuốt thêm các phím bấm dồn trong lúc màn hình mờ dần (tránh Enter lần nữa mở luôn mục menu)
      setTimeout(() => document.removeEventListener("keydown", key, true), 700);
      done(); setTimeout(() => unlock("boot"), 1200);
    };
    // lần bấm đầu: tua nhanh dòng chữ; khi đã hiện nút thì vào trang
    const poke = () => { if (btn.classList.contains("show")) finish(); else fast = true; };
    btn.addEventListener("click", e => { e.stopPropagation(); finish(); });
    $("boot").addEventListener("pointerdown", e => { if (e.target !== btn && !btn.contains(e.target)) poke(); });
    function key(e){ if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Tab") return; e.preventDefault(); e.stopPropagation(); if (!$("boot").classList.contains("out")) poke(); }
    document.addEventListener("keydown", key, true);
  }

  /* =========================================================
     HIỆU ỨNG CHUNG CHO MỌI TRANG
     ========================================================= */
  // giảm tải: hoạt ảnh lặp vô hạn của phần đang ở ngoài màn hình thì dừng
  function calm(){
    if ("IntersectionObserver" in window){
      const io = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle("zz", !en.isIntersecting)), { rootMargin:"120px 0px" });
      document.querySelectorAll(".phead, .sec, .panel, .marquee, .foot, .stage, .term, .lost-scene").forEach(el => io.observe(el));
    }
  }
  function fx(){
    // thanh tiến độ cuộn ngay dưới HUD
    const sp = $("sprog"); let spQ = false;
    const upd = () => { spQ = false; const h = document.documentElement.scrollHeight - innerHeight; sp.style.transform = `scaleX(${h > 0 ? clamp(scrollY/h, 0, 1) : 0})`; };
    addEventListener("scroll", () => { if (!spQ){ spQ = true; requestAnimationFrame(upd); } }, { passive:true }); upd();
    if (reduce) return;
    // sàn lưới ra khỏi màn hình thì dừng chạy (đỡ vẽ lại vô ích)
    if ("IntersectionObserver" in window){ const fio = new IntersectionObserver(es => es.forEach(e => { e.target.classList.toggle("off", !e.isIntersecting); })); document.querySelectorAll("main .floor, .foot .floor").forEach(f => fio.observe(f)); }

    // tiêu đề trang tự giải mã khi vào trang; rê chuột để giải mã lại
    document.querySelectorAll(".phead h1, .gban h1").forEach(h => {
      const t = h.textContent; setTimeout(() => scramble(h, t, 900), document.body.classList.contains("arrive") ? 420 : 160);
      h.addEventListener("pointerenter", () => scramble(h, t, 520));
    });
    // tiêu đề mục giải mã khi cuộn tới
    document.querySelectorAll(".sec-h[data-reveal]").forEach(s => { const h = s.querySelector("h2"); if (h){ const t = h.textContent; s._onIn = () => scramble(h, t, 700); } });

    // phần tử con hiện lần lượt khi khối cha xuất hiện
    [".patch li", ".feats li", ".spec dl > div", ".id-body dl > div", ".mods > .mod", ".inv .item", ".slots .slot", ".legend span", ".pn a", ".gban .row > *", ".gban-meta > div", ".gban .actions > *", ".poster", ".jsum .jst", ".pmini-sk > div", ".fmini li", ".feature-body > *"].forEach(sel => {
      document.querySelectorAll(sel).forEach((el,i) => { el.classList.add("stg"); el.style.setProperty("--i", i); });
    });
    document.querySelectorAll(".gban .stg").forEach(el => el.classList.add("now"));

    // tranh nhiều lớp: lệch theo chuột và theo vị trí cuộn
    // (danh sách lớp được nhớ sẵn; vị trí khối chỉ đo lại khi cuộn; đứng yên thì không ghi gì vào DOM)
    const pars = [...document.querySelectorAll("[data-par]")].map(el => ({ el, mx:0, my:0, k:0, vis:true, ls:null, last:"" }));
    let ptx = 0, pty = 0, parMoved = true;
    if (pars.length){
      if ("IntersectionObserver" in window){ const io = new IntersectionObserver(es => es.forEach(e => { const q = pars.find(p => p.el === e.target); if (q){ q.vis = e.isIntersecting; parMoved = true; } })); pars.forEach(p => io.observe(p.el)); }
      if ("MutationObserver" in window) pars.forEach(p => new MutationObserver(() => { p.ls = null; p.last = ""; }).observe(p.el, { childList:true, subtree:true }));
      addEventListener("pointermove", e => { if (e.pointerType === "mouse"){ ptx = e.clientX/innerWidth*2 - 1; pty = e.clientY/innerHeight*2 - 1; } }, { passive:true });
      addEventListener("scroll", () => { parMoved = true; }, { passive:true });
      addEventListener("resize", () => { parMoved = true; });
      frameHooks.push(now => {
        const moved = parMoved; parMoved = false;
        pars.forEach(p => {
          if (!p.vis) return;
          const tx = finePointer ? ptx : Math.sin(now/3000)*.5, ty = finePointer ? pty : Math.cos(now/3900)*.3;
          p.mx += (tx - p.mx)*.06; p.my += (ty - p.my)*.06;
          if (moved || !p.ls){ const r = p.el.getBoundingClientRect(); p.k = clamp(((r.top + r.height/2) - innerHeight/2)/innerHeight, -1, 1); }
          if (!p.ls) p.ls = [...p.el.querySelectorAll(".ly")].map(l => ({ l, z: parseFloat(l.style.getPropertyValue("--z")) || .6 }));
          const key = `${p.mx.toFixed(3)},${p.my.toFixed(3)},${p.k.toFixed(3)}`;
          if (key === p.last) return; p.last = key;
          p.ls.forEach(({ l, z }) => { l.style.transform = `translate3d(${(-p.mx*z*16).toFixed(2)}px,${(-p.my*z*9 - p.k*z*22).toFixed(2)}px,0) scale(1.1)`; });
        });
      });
    }

    // kéo nhẹ nội dung banner chi tiết game khi cuộn
    const gb = document.querySelector(".gban-in");
    let gbQ = false;
    const gbUpd = () => { gbQ = false; const k = clamp(scrollY/innerHeight, 0, 1); gb.style.transform = `translateY(${(k*-50).toFixed(1)}px)`; gb.style.opacity = (1 - k*1.1).toFixed(3); };
    if (gb) addEventListener("scroll", () => { if (!gbQ){ gbQ = true; requestAnimationFrame(gbUpd); } }, { passive:true });

    if (!finePointer) return;
    // đèn rọi theo chuột trên các khung + nghiêng 3D cho thẻ
    const SPOT = "main .panel, .slot, .pn a, .feats li, .poster, .feature, .ach, .stage, .jst";
    const TILT = ".poster, .pn a, .feature";
    let tilted = null;
    const untilt = () => { if (!tilted) return; tilted.style.transition = "transform .7s var(--ease)"; tilted.style.transform = ""; tilted = null; };
    // gộp sự kiện chuột theo khung hình (chuột 1000Hz không làm trang tính lại hàng trăm lần mỗi giây)
    let pe = null, peQ = false;
    document.addEventListener("pointermove", e => { pe = e; if (!peQ){ peQ = true; requestAnimationFrame(onPtr); } }, { passive:true });
    const onPtr = () => {
      peQ = false; const e = pe; if (!e || !e.target || !e.target.closest) return;
      const s = e.target.closest(SPOT);
      if (s){ const r = s.getBoundingClientRect(); s.style.setProperty("--mx", (e.clientX - r.left) + "px"); s.style.setProperty("--my", (e.clientY - r.top) + "px"); }
      const t = e.target.closest(TILT), rv = t && t.closest("[data-reveal]");
      if (t !== tilted) untilt();
      if (t && (!rv || rv.classList.contains("in"))){
        const r = t.getBoundingClientRect(), x = (e.clientX - r.left)/r.width - .5, y = (e.clientY - r.top)/r.height - .5, f = t.classList.contains("feature") ? .35 : 1;
        t.style.transition = "transform .15s ease-out"; t.style.transform = `perspective(900px) rotateX(${(-y*9*f).toFixed(2)}deg) rotateY(${(x*11*f).toFixed(2)}deg) translateZ(0)`; tilted = t;
      }
      magnet(e);
    };
    document.addEventListener("pointerleave", untilt);

    // nút "nam châm" hút nhẹ theo con trỏ
    // chỉ xét các nút đang trong màn hình; nút đã về chỗ thì thôi ghi
    const mags = [...document.querySelectorAll(".btn, .more")].map(el => ({ el, x:0, y:0, tx:0, ty:0, vis:!("IntersectionObserver" in window), on:false }));
    if ("IntersectionObserver" in window){ const io = new IntersectionObserver(es => es.forEach(en => { const m = mags.find(q => q.el === en.target); if (m) m.vis = en.isIntersecting; }), { rootMargin:"60px" }); mags.forEach(m => io.observe(m.el)); }
    function magnet(e){ mags.forEach(m => {
      if (!m.vis || !m.el.isConnected){ m.tx = m.ty = 0; return; }
      const r = m.el.getBoundingClientRect(), cx = r.left + r.width/2 - m.x, cy = r.top + r.height/2 - m.y, dx = e.clientX - cx, dy = e.clientY - cy;
      const near = Math.abs(dx) < r.width/2 + 40 && Math.abs(dy) < r.height/2 + 30;
      m.tx = near ? dx*.2 : 0; m.ty = near ? dy*.3 : 0;
    }); }
    frameHooks.push(() => mags.forEach(m => {
      if (!m.on && !m.tx && !m.ty) return;
      m.x += (m.tx - m.x)*.18; m.y += (m.ty - m.y)*.18;
      if (!m.tx && !m.ty && Math.abs(m.x) + Math.abs(m.y) < .05){ m.x = m.y = 0; m.on = false; m.el.style.translate = ""; return; }
      m.on = true; m.el.style.translate = `${m.x.toFixed(2)}px ${m.y.toFixed(2)}px`;
    }));
  }

  (pages[PAGE] || pages.home)();
  fx();
  reveal();
  calm();
  boot(() => start());
}

/* =========================================================
   CHẾ ĐỘ CHỈNH SỬA ẨN — khóa bằng lệnh bí mật + mật khẩu,
   xem bản nháp trên máy của chủ trang, nút mở lại trình chỉnh sửa.
   Lệnh và mật khẩu chỉ lưu dưới dạng mã băm SHA-256, không có chữ gốc.
   Lưu ý: trang tĩnh kiểm tra mật khẩu ngay trong trình duyệt, nên khóa này
   chặn người xem bình thường chứ không phải bảo mật mạnh.
   ========================================================= */
var NL_GATE = (function(){
  "use strict";
  // SHA-256 viết tay (chạy được cả khi mở file trực tiếp, không cần https)
  const sha256 = (() => {
    const K = new Uint32Array(64), H0 = new Uint32Array(8), W = new Uint32Array(64), frac = x => ((x - Math.floor(x))*4294967296) >>> 0;
    for (let n = 2, c = 0; c < 64; n++){ let p = true; for (let d = 2; d*d <= n; d++) if (n % d === 0){ p = false; break; } if (p){ if (c < 8) H0[c] = frac(Math.sqrt(n)); K[c++] = frac(Math.cbrt(n)); } }
    const enc = new TextEncoder();
    return str => {
      const b = enc.encode(String(str)), l = b.length, n = ((l + 72) >> 6) << 6, m = new Uint8Array(n), bits = l*8;
      m.set(b); m[l] = 0x80; m[n-5] = (l / 0x20000000) | 0; m[n-4] = bits >>> 24; m[n-3] = bits >>> 16; m[n-2] = bits >>> 8; m[n-1] = bits;
      const h = H0.slice();
      for (let o = 0; o < n; o += 64){
        for (let i = 0; i < 16; i++) W[i] = m[o+i*4] << 24 | m[o+i*4+1] << 16 | m[o+i*4+2] << 8 | m[o+i*4+3];
        for (let i = 16; i < 64; i++){ const a = W[i-15], d = W[i-2]; W[i] = W[i-16] + ((a>>>7|a<<25) ^ (a>>>18|a<<14) ^ (a>>>3)) + W[i-7] + ((d>>>17|d<<15) ^ (d>>>19|d<<13) ^ (d>>>10)); }
        let A = h[0], B = h[1], C = h[2], D = h[3], E = h[4], F = h[5], G = h[6], H = h[7];
        for (let i = 0; i < 64; i++){
          const t1 = (H + ((E>>>6|E<<26) ^ (E>>>11|E<<21) ^ (E>>>25|E<<7)) + ((E & F) ^ (~E & G)) + K[i] + W[i]) | 0;
          const t2 = (((A>>>2|A<<30) ^ (A>>>13|A<<19) ^ (A>>>22|A<<10)) + ((A & B) ^ (A & C) ^ (B & C))) | 0;
          H = G; G = F; F = E; E = (D + t1) | 0; D = C; C = B; B = A; A = (t1 + t2) | 0;
        }
        h[0] += A; h[1] += B; h[2] += C; h[3] += D; h[4] += E; h[5] += F; h[6] += G; h[7] += H;
      }
      return Array.from(h, x => x.toString(16).padStart(8, "0")).join("");
    };
  })();
  // khóa mặc định; data.js có EDITOR_LOCK (tạo bởi trình chỉnh sửa) thì dùng khóa đó
  const DEFAULT_LOCK = {"v":1,"it":20000,"cs":"7c1e4a92d05b38f6","cmd":"f29a2236dc5833e73b64879f7371d9a86fd8dd7445bf97e0777fde84af2b3a37","ps":"e83b07d6a419c25f","pass":"feddb2e4722d715d8382bfe4b9a45588a6502cde219e37bcc5994d777fa47308"};
  const pubLock = (typeof EDITOR_LOCK !== "undefined" && EDITOR_LOCK && EDITOR_LOCK.pass && EDITOR_LOCK.cmd) ? EDITOR_LOCK : DEFAULT_LOCK;
  const PUB = (() => { try { return typeof PROFILE === "undefined" ? null : JSON.parse(JSON.stringify(PROFILE)); } catch(e){ return null; } })();
  const lsGet = k => { try { return localStorage.getItem(k); } catch(e){ return null; } };
  const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); return true; } catch(e){ return false; } };
  const ssGet = k => { try { return sessionStorage.getItem(k); } catch(e){ return null; } };
  const ssSet = (k, v) => { try { v == null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch(e){} };
  const readDraft = () => { try { const d = JSON.parse(lsGet("nl_draft")); return d && d.profile && typeof d.profile === "object" ? d : null; } catch(e){ return null; } };
  const locks = () => { const d = readDraft(); return [pubLock, d && d.lock].filter(l => l && l.pass && l.cmd); };
  const fold = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/\s+/g, " ").trim();
  const cmdHash = (salt, cmd) => sha256(salt + "|cmd|" + fold(cmd));
  const derive = (l, pw) => { let h = sha256(l.ps + "|pw|" + pw); for (let i = 0; i < (l.it || 20000); i++) h = sha256(h + l.ps); return h; };
  const passHash = t => sha256(t + "|ok");
  const salt = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, "0")).join("");
  // tạo khóa mới; giữ phần nào không đổi từ khóa cũ
  const makeLock = (base, cmd, pw) => {
    const l = { v:1, it:20000, cs: base.cs, cmd: base.cmd, ps: base.ps, pass: base.pass };
    if (cmd){ l.cs = salt(); l.cmd = cmdHash(l.cs, cmd); }
    if (pw){ l.ps = salt(); l.pass = passHash(derive(l, pw)); }
    return l;
  };
  // nhập sai 5 lần thì khóa 2 phút
  const fails = () => { try { return JSON.parse(lsGet("nl_fail")) || { n:0, t:0 }; } catch(e){ return { n:0, t:0 }; } };
  const wait = () => Math.max(0, Math.ceil((fails().t - Date.now())/1000));
  const isCmd = line => locks().some(l => cmdHash(l.cs, line) === l.cmd);
  const tryPass = pw => {
    const w = wait(); if (w > 0) return w;
    for (const l of locks()){ const t = derive(l, pw); if (passHash(t) === l.pass){ ssSet("nl_ed", t); lsSet("nl_fail", null); return true; } }
    const f = fails(); f.n++; if (f.n >= 5){ f.n = 0; f.t = Date.now() + 120000; } lsSet("nl_fail", JSON.stringify(f));
    return f.t > Date.now() ? wait() : false;
  };
  const unlocked = () => { const t = ssGet("nl_ed"); return !!t && locks().some(l => passHash(t) === l.pass); };
  const lock = () => ssSet("nl_ed", null);
  const previewOn = () => lsGet("nl_preview") !== "0";

  // ảnh/tệp tải lên trong trình chỉnh sửa được giữ trong IndexedDB của trình duyệt
  const idb = (() => {
    let dbp = null;
    const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open("Web_Portfolio_editor", 1); r.onupgradeneeded = () => r.result.createObjectStore("files"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
    const tx = (mode, fn) => db().then(d => new Promise((res, rej) => { const t = d.transaction("files", mode), s = t.objectStore("files"), out = fn(s); t.oncomplete = () => res(out && "result" in out ? out.result : undefined); t.onerror = () => rej(t.error); }));
    return {
      get: k => tx("readonly", s => s.get(k)),
      put: (k, v) => tx("readwrite", s => s.put(v, k)),
      del: k => tx("readwrite", s => s.delete(k)),
      keys: () => tx("readonly", s => s.getAllKeys()),
      clear: () => tx("readwrite", s => s.clear())
    };
  })();
  const filePaths = p => [p.avatar, p.cvFile, ...(Array.isArray(p.games) ? p.games : []).flatMap(g => g ? [g.image, ...(Array.isArray(g.screenshots) ? g.screenshots : [])] : [])].filter(s => typeof s === "string" && s);
  const swapPaths = (p, map) => {
    const f = s => (typeof s === "string" && map[s]) || s;
    p.avatar = f(p.avatar); p.cvFile = f(p.cvFile);
    (Array.isArray(p.games) ? p.games : []).forEach(g => { if (!g) return; g.image = f(g.image); if (Array.isArray(g.screenshots)) g.screenshots = g.screenshots.map(f); });
  };

  // chạy trang: nếu có bản nháp và đang bật xem nháp thì dựng trang từ bản nháp
  const start = run => {
    const d0 = readDraft();
    // bản nháp đã đăng lên GitHub và trang đã cập nhật xong: dọn bản nháp cùng ảnh tạm
    if (d0 && d0.pushed && PUB && JSON.stringify(PUB) === JSON.stringify(d0.profile)){ lsSet("nl_draft", null); if (window.indexedDB) idb.clear().catch(() => {}); return run(); }
    const d = previewOn() && d0;
    if (!d) return run();
    let prof; try { prof = JSON.parse(JSON.stringify(d.profile)); } catch(e){ return run(); }
    const paths = filePaths(prof);
    let done = false;
    const fin = map => { if (done) return; done = true; swapPaths(prof, map); window.NL_PREVIEW = { profile: prof }; run(); };
    if (!paths.length || !window.indexedDB) return fin({});
    setTimeout(() => fin({}), 1500);
    Promise.all(paths.map(k => idb.get(k).then(v => [k, v], () => [k, null]))).then(rs => {
      const map = {}; rs.forEach(([k, v]) => { if (v && v.blob) map[k] = URL.createObjectURL(v.blob); }); fin(map);
    }, () => fin({}));
  };

  // nút nhỏ góc màn hình: chỉ hiện với chủ trang (đã mở khóa trong tab này, hoặc đang xem bản nháp)
  const chip = () => {
    const old = document.getElementById("nlChip"); if (old) old.remove();
    const ok = unlocked(), d = readDraft(), pv = !!window.NL_PREVIEW;
    if (!ok && !pv) return;
    if (!document.getElementById("nlChipCss")){
      const st = document.createElement("style"); st.id = "nlChipCss";
      st.textContent = `.nl-chip{position:fixed;left:50%;bottom:calc(var(--bar-h,40px) + 12px);transform:translateX(-50%);z-index:340;display:flex;align-items:center;gap:6px;padding:6px;border-radius:14px;background:#151032;border:1px solid rgba(255,198,92,.45);box-shadow:0 14px 36px -12px rgba(0,0,0,.9);font:600 12.5px/1 "Be Vietnam Pro",system-ui,sans-serif;color:#F7F3FF;max-width:calc(100vw - 24px)}
.nl-chip,.nl-chip *{cursor:auto!important}.nl-chip button{cursor:pointer!important}
.nl-chip span{padding:0 8px;color:#FFC65C;white-space:nowrap;display:flex;align-items:center;gap:6px}.nl-chip span::before{content:"";width:7px;height:7px;border-radius:50%;background:#FFC65C;box-shadow:0 0 8px #FFC65C}
.nl-chip button{border:0;border-radius:10px;padding:9px 12px;font:inherit;color:inherit;background:rgba(255,255,255,.07);white-space:nowrap}.nl-chip button:hover{background:rgba(255,255,255,.14)}
.nl-chip button.p{background:linear-gradient(90deg,#FF4F9A,#FFC65C);color:#1A0718}
@media (max-width:560px){.nl-chip{bottom:calc(var(--bar-h,40px) + 8px)}.nl-chip span{padding:0 4px}.nl-chip button{padding:9px 10px}}`;
      document.head.append(st);
    }
    const c = document.createElement("div"); c.id = "nlChip"; c.className = "nl-chip";
    c.innerHTML = (pv ? `<span title="Trang đang hiện bản nháp chỉ có trên trình duyệt này">Bản nháp</span>` : "") + (ok ? `<button type="button" class="p" data-a="edit">Chỉnh sửa</button>` : "") +
      (pv ? `<button type="button" data-a="pub" title="Hiện bản đang đăng trên web">Tắt nháp</button>` : ok && d ? `<button type="button" data-a="draft">Xem bản nháp</button>` : "") +
      (ok ? `<button type="button" data-a="lock">Khóa</button>` : "");
    c.addEventListener("click", e => {
      const a = e.target.closest("button"); if (!a) return;
      if (a.dataset.a === "edit") openEditor();
      else if (a.dataset.a === "pub"){ lsSet("nl_preview", "0"); location.reload(); }
      else if (a.dataset.a === "draft"){ lsSet("nl_preview", "1"); location.reload(); }
      else if (a.dataset.a === "lock"){ lock(); chip(); }
    });
    document.body.append(c);
  };

  // tải trình chỉnh sửa (editor.js) chỉ khi đã mở khóa
  let loading = null;
  const openEditor = () => {
    if (!unlocked()) return;
    const api = { sha256, makeLock, pubLock, published: PUB, readDraft, lsGet, lsSet, idb, filePaths, unlocked, lock, chip, previewOn, sessionKey: () => ssGet("nl_ed") };
    if (window.NL_EDITOR) return window.NL_EDITOR.open(api);
    if (loading) return;
    loading = document.createElement("script"); loading.src = "editor.js";
    loading.onload = () => { loading = null; window.NL_EDITOR && window.NL_EDITOR.open(api); };
    loading.onerror = () => { loading.remove(); loading = null; alert("Không tải được editor.js. Hãy kiểm tra file editor.js đã được tải lên cùng thư mục với app.js."); };
    document.head.append(loading);
  };

  return { start, isCmd, tryPass, wait, unlocked, openEditor, chip, lock };
})();

NL_GATE.start(() => {
  NL_MAIN();
  try { NL_GATE.chip(); } catch(e){}
});
