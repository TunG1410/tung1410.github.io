/* =========================================================
   TRÌNH CHỈNH SỬA ẨN — thêm, sửa, xóa mọi dữ liệu của trang.
   File này chỉ được tải sau khi nhập đúng lệnh bí mật và mật khẩu
   trong terminal ở trang Liên hệ. Bạn không cần sửa file này.

   Trang tĩnh (GitHub Pages) không có máy chủ để lưu, nên:
   - Mọi thay đổi được lưu thành "bản nháp" trong trình duyệt của bạn.
   - Muốn người khác thấy, bấm "Tải Web_Portfolio.zip" ở mục Xuất bản rồi
     tải data.js và thư mục images trong đó lên repo GitHub.
   ========================================================= */
window.NL_EDITOR = (function(){
  "use strict";
  let G = null, D = null, LOCK = null, ov = null, tab = "profile", openG = -1, saveT = 0, savedAt = 0, dirty = false, prevFocus = null;
  const URLS = {};          // đường dẫn ảnh/tệp đã tải lên → địa chỉ blob để xem trước
  let FILES = new Set();    // đường dẫn đang có trong kho tệp của trình duyệt

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const YEAR = new Date().getFullYear();
  const COLORS = [["#FFC65C","Vàng"],["#FF4F9A","Hồng"],["#5EF0C8","Bạc hà"],["#FF7A45","Cam"],["#A68BFF","Tím"],["#62B6FF","Xanh"]];
  const SCENES = [["","Tự chọn theo thể loại"],["city","Thành phố neon"],["forest","Rừng đom đóm"],["road","Đường đua"],["desert","Sa mạc"],["haunt","Quán trọ ma"],["space","Vũ trụ"],["castle","Lâu đài"]];
  const TABS = [["profile","Hồ sơ"],["skills","Kỹ năng"],["tools","Túi đồ"],["games","Dự án game"],["quests","Kinh nghiệm"],["contacts","Liên hệ"],["publish","Xuất bản"],["security","Bảo mật"]];
  const IC = {
    up:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>`,
    down:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    dup:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>`,
    del:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>`,
    plus:`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
    x:`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    star:`<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>`
  };

  /* ---------- dữ liệu ---------- */
  const GAME = () => ({ title:"Game mới", featured:false, status:"dev", year:YEAR, engine:"", platform:"", genres:[], desc:"", features:[], highlight:"", itch:"", trailer:"", image:"", screenshots:[], color:"#FF4F9A" });
  const NEW = {
    skills: () => ({ name:"Kỹ năng mới", level:5 }),
    tools: () => "Vật phẩm mới",
    games: GAME,
    quests: () => ({ time:String(YEAR), title:"Vị trí mới", place:"", desc:"", done:false }),
    contacts: () => ({ label:"Kênh mới", value:"", url:"https://" })
  };
  // điền các trường còn thiếu, giữ nguyên các trường lạ (ví dụ "scene")
  const norm = p => {
    p = p && typeof p === "object" ? p : {};
    // data.js cũ chưa có "codename": chèn ngay sau "name" cho file xuất ra dễ đọc
    if (!("codename" in p)){ const o = {}; for (const k in p){ o[k] = p[k]; if (k === "name") o.codename = ""; } if (!("codename" in o)) o.codename = ""; p = o; }
    const base = { name:"", codename:"", role:"", tagline:"", avatar:"", cvFile:"", level:0, className:"", status:"", about:"" };
    for (const k in base) if (p[k] == null) p[k] = base[k];
    ["skills","tools","games","quests","contacts"].forEach(k => { if (!Array.isArray(p[k])) p[k] = []; p[k] = p[k].filter(x => x != null); });
    p.games = p.games.map(g => { const o = Object.assign(GAME(), g); ["genres","features","screenshots"].forEach(k => { if (!Array.isArray(o[k])) o[k] = o[k] ? [String(o[k])] : []; }); return o; });
    p.skills = p.skills.map(s => typeof s === "object" ? Object.assign({ name:"", level:5 }, s) : { name:String(s), level:5 });
    p.tools = p.tools.map(String);
    p.quests = p.quests.map(q => Object.assign({ time:"", title:"", place:"", desc:"", done:true }, q));
    p.contacts = p.contacts.map(c => Object.assign({ label:"", value:"", url:"" }, c));
    return p;
  };
  const getP = path => path.split(".").reduce((o, k) => o == null ? o : o[k], D);
  const setP = (path, v) => { const ks = path.split("."), last = ks.pop(), o = ks.reduce((o, k) => o[k], D); o[last] = v; };

  const save = (now) => {
    clearTimeout(saveT); dirty = true;
    const go = () => {
      const rec = { profile: D, lock: LOCK, updated: Date.now() };
      if (G.lsSet("nl_draft", JSON.stringify(rec))){ savedAt = Date.now(); if (G.lsGet("nl_preview") == null) G.lsSet("nl_preview", "1"); setStatus(); }
      else setStatus("Không lưu được: bộ nhớ trình duyệt bị đầy hoặc bị chặn.", true);
    };
    now === true ? go() : (saveT = setTimeout(go, 350), setStatus("Đang lưu…"));
  };
  const setStatus = (msg, err) => {
    const el = ov && ov.querySelector("#neSave"); if (!el) return;
    const t = new Date(savedAt), hm = savedAt ? `${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}:${String(t.getSeconds()).padStart(2,"0")}` : "";
    el.textContent = msg || (savedAt ? `Đã lưu bản nháp lúc ${hm}` : "Chưa có thay đổi");
    el.classList.toggle("err", !!err);
  };
  const toast = (msg, err) => {
    const t = document.createElement("div"); t.className = "ne-toast" + (err ? " err" : ""); t.textContent = msg; ov.append(t);
    setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3000);
  };

  /* ---------- ảnh & tệp ---------- */
  const srcOf = p => !p ? "" : (URLS[p] || p);
  const slug = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  const usedPaths = () => new Set([...FILES, ...G.filePaths(D)]);
  const uniquePath = (dir, base, ext) => { const used = usedPaths(); let p = `${dir}${base}.${ext}`, n = 2; while (used.has(p)) p = `${dir}${base}-${n++}.${ext}`; return p; };
  // thu nhỏ ảnh quá lớn để web tải nhanh; ảnh nhỏ, GIF, SVG giữ nguyên
  const prepImage = (file, max) => new Promise(res => {
    const ext0 = (file.name.split(".").pop() || "jpg").toLowerCase().replace("jpeg", "jpg");
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return res({ blob:file, ext:ext0 });
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const w = im.naturalWidth, h = im.naturalHeight, s = Math.min(1, max/Math.max(w, h));
      if (s === 1 && file.size < 700e3){ URL.revokeObjectURL(url); return res({ blob:file, ext:ext0 }); }
      const c = document.createElement("canvas"); c.width = Math.round(w*s); c.height = Math.round(h*s);
      const x = c.getContext("2d"); x.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
      let alpha = false;
      if (file.type !== "image/jpeg"){ try { const d = x.getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 16) if (d[i] < 250){ alpha = true; break; } } catch(e){} }
      const type = alpha ? "image/png" : "image/jpeg";
      c.toBlob(b => res(b ? { blob:b, ext: alpha ? "png" : "jpg" } : { blob:file, ext:ext0 }), type, .86);
    };
    im.onerror = () => { URL.revokeObjectURL(url); res({ blob:file, ext:ext0 }); };
    im.src = url;
  });
  const storeFile = async (file, kind) => {
    const isImg = kind !== "file";
    const max = kind === "avatar" ? 900 : 1920;
    const { blob, ext } = isImg ? await prepImage(file, max) : { blob:file, ext:(file.name.split(".").pop() || "pdf").toLowerCase() };
    const base = slug(file.name.replace(/\.[^.]+$/, "")) || (isImg ? "anh" : "tep");
    const path = uniquePath(isImg ? "images/" : "", base, ext);
    await G.idb.put(path, { blob, name: path.split("/").pop(), type: blob.type || file.type, added: Date.now() });
    FILES.add(path); URLS[path] = URL.createObjectURL(blob);
    return path;
  };
  const loadFiles = async () => {
    try {
      const keys = await G.idb.keys(), used = new Set(G.filePaths(D));
      for (const k of keys){
        if (!used.has(k)){ await G.idb.del(k); continue; }   // dọn tệp không còn dùng
        const v = await G.idb.get(k); if (v && v.blob){ FILES.add(k); URLS[k] = URL.createObjectURL(v.blob); }
      }
    } catch(e){}
  };

  /* ---------- xuất data.js ---------- */
  const key = k => /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
  const prim = v => v === null || typeof v !== "object";
  const ser = (v, ind) => {
    if (Array.isArray(v)){
      if (!v.length) return "[]";
      if (v.every(prim)){ const one = "[" + v.map(x => JSON.stringify(x)).join(", ") + "]"; if (one.length < 110) return one; }
      return "[\n" + v.map(x => ind + "  " + ser(x, ind + "  ")).join(",\n") + "\n" + ind + "]";
    }
    if (v && typeof v === "object"){
      const ks = Object.keys(v); if (!ks.length) return "{}";
      if (ks.every(k => prim(v[k]))){ const one = "{ " + ks.map(k => `${key(k)}: ${JSON.stringify(v[k])}`).join(", ") + " }"; if (one.length < 150) return one; }
      return "{\n" + ks.map(k => `${ind}  ${key(k)}: ${ser(v[k], ind + "  ")}`).join(",\n") + "\n" + ind + "}";
    }
    return JSON.stringify(v);
  };
  const NOTE = {
    codename: "biệt danh, hiện dưới tên ở trang chủ và trên thẻ hồ sơ — để trống \"\" nếu không dùng",
    avatar: "ví dụ \"images/avatar.jpg\" — để trống sẽ tự tạo ảnh chân dung",
    cvFile: "file CV để người xem tải về — để trống \"\" nếu không có",
    level: "số năm kinh nghiệm",
    status: "trạng thái hiện trên thẻ hồ sơ"
  };
  const BLOCK = {
    skills: ["level từ 1 đến 10 — nên giữ 5 đến 8 kỹ năng để biểu đồ đẹp"],
    tools: ["Túi đồ: công cụ, xếp từ dùng nhiều nhất"],
    games: ["status: \"released\" = Đã phát hành, \"dev\" = Đang phát triển", "featured: true = game nổi bật trên trang chủ (chỉ chọn 1 game)", "trailer: dán link YouTube để hiện video ngay trên trang chi tiết game", "screenshots: ảnh chụp màn hình, ví dụ [\"images/g1-1.jpg\", \"images/g1-2.jpg\"]"],
    quests: ["Kinh nghiệm & học vấn, mới nhất ở trên. done: false = đang làm"]
  };
  const dataJs = () => {
    const p = clone(D), ks = Object.keys(p);
    const body = ks.map((k, i) => {
      const pre = BLOCK[k] ? "\n" + BLOCK[k].map(c => `  // ${c}`).join("\n") + "\n" : "";
      const comma = i < ks.length - 1 ? "," : "";
      return `${pre}  ${key(k)}: ${ser(p[k], "  ")}${comma}${NOTE[k] ? "   // " + NOTE[k] : ""}`;
    }).join("\n");
    const lock = LOCK || G.pubLock;
    return `/* =====================================================================
   ★ SỬA THÔNG TIN CỦA BẠN Ở ĐÂY — DÙNG CHUNG CHO TẤT CẢ CÁC TRANG ★
   File này được tạo bởi chế độ chỉnh sửa lúc ${new Date().toLocaleString("vi-VN")}.
   Bạn vẫn có thể sửa tay: chỉ thay chữ trong dấu ngoặc kép "...".
   - Để trống "" nếu không dùng (ví dụ chưa có trailer).
   - Ảnh: đặt vào thư mục "images" rồi ghi đường dẫn, ví dụ "images/game1.jpg".
     Nếu để trống, trang sẽ tự vẽ ảnh minh họa theo màu "color" của game.
   ===================================================================== */
const PROFILE = {
${body}
};

/* Khóa của chế độ chỉnh sửa: chỉ là mã băm, không chứa lệnh hay mật khẩu thật.
   Đừng sửa tay. Muốn đổi lệnh hoặc mật khẩu, dùng mục "Bảo mật" trong chế độ chỉnh sửa.
   Xóa khối này thì trang dùng lại lệnh và mật khẩu mặc định. */
const EDITOR_LOCK = ${JSON.stringify({ v:lock.v || 1, it:lock.it || 20000, cs:lock.cs, cmd:lock.cmd, ps:lock.ps, pass:lock.pass })};
`;
  };

  /* ---------- nén zip (không nén, chỉ đóng gói) ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u => { let c = -1; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const zip = files => {
    const enc = new TextEncoder(), parts = [], cd = []; let off = 0, cdLen = 0;
    const d = new Date(), dt = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), dd = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach(f => {
      const nm = enc.encode(f.name), c = crc32(f.data), n = f.data.length, h = new DataView(new ArrayBuffer(30)), e = new DataView(new ArrayBuffer(46));
      [[0,0x04034b50,4],[4,20,2],[6,0x0800,2],[8,0,2],[10,dt,2],[12,dd,2],[14,c,4],[18,n,4],[22,n,4],[26,nm.length,2],[28,0,2]].forEach(([o,v,s]) => s === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true));
      [[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x0800,2],[10,0,2],[12,dt,2],[14,dd,2],[16,c,4],[20,n,4],[24,n,4],[28,nm.length,2],[42,off,4]].forEach(([o,v,s]) => s === 4 ? e.setUint32(o, v, true) : e.setUint16(o, v, true));
      parts.push(h.buffer, nm, f.data); cd.push(e.buffer, nm); off += 30 + nm.length + n; cdLen += 46 + nm.length;
    });
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cdLen, true); end.setUint32(16, off, true);
    return new Blob([...parts, ...cd, end.buffer], { type:"application/zip" });
  };
  const download = (blob, name) => { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const newFiles = () => G.filePaths(D).filter((p, i, a) => FILES.has(p) && a.indexOf(p) === i);
  const exportZip = async () => {
    const enc = new TextEncoder(), list = [{ name:"data.js", data: enc.encode(dataJs()) }];
    for (const p of newFiles()){ const v = await G.idb.get(p); if (v && v.blob) list.push({ name:p, data: new Uint8Array(await v.blob.arrayBuffer()) }); }
    download(zip(list), "Web_Portfolio.zip");
    toast(`Đã tạo Web_Portfolio.zip: data.js${list.length > 1 ? ` và ${list.length - 1} tệp mới` : ""}.`);
  };

  /* ---------- lưu thẳng lên GitHub (qua GitHub API, bằng token của bạn) ----------
     Token chỉ nằm trong trình duyệt này, được mã hóa bằng khóa sinh từ mật khẩu chế độ chỉnh sửa,
     nên chỉ đọc được sau khi đã mở khóa. Trang không gửi token đi đâu khác ngoài api.github.com. */
  const GH_API = "https://api.github.com";
  const ghGuess = () => {
    const h = location.hostname, m = h.match(/^([a-z0-9-]+)\.github\.io$/i), seg = location.pathname.split("/").filter(Boolean);
    if (!m) return { owner:"", repo:"", dir:"" };
    const first = seg[0] && !/\.html?$/i.test(seg[0]) ? seg[0] : "";
    return { owner: m[1], repo: first || `${m[1]}.github.io`, dir:"" };
  };
  const ghCfg = () => { try { return Object.assign({ owner:"", repo:"", branch:"", dir:"", remember:true }, ghGuess(), JSON.parse(G.lsGet("nl_gh") || "{}")); } catch(e){ return ghGuess(); } };
  const subtle = window.crypto && crypto.subtle;
  const b64 = u => { let s = ""; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
  const aesKey = () => subtle.importKey("raw", new TextEncoder().encode(G.sha256("gh|" + G.sessionKey())).slice(0, 32), "AES-GCM", false, ["encrypt", "decrypt"]);
  const saveToken = async (tok, remember) => {
    const c = ghCfg(); delete c.tok; delete c.tokPlain; c.remember = remember;
    if (!remember){ try { sessionStorage.setItem("nl_ghtok", tok); } catch(e){} G.lsSet("nl_gh", JSON.stringify(c)); return; }
    try { sessionStorage.removeItem("nl_ghtok"); } catch(e){}
    if (!subtle){ try { sessionStorage.setItem("nl_ghtok", tok); } catch(e){} c.remember = false; G.lsSet("nl_gh", JSON.stringify(c)); return; }
    const iv = crypto.getRandomValues(new Uint8Array(12)), k = await aesKey();
    const enc = new Uint8Array(await subtle.encrypt({ name:"AES-GCM", iv }, k, new TextEncoder().encode(tok)));
    c.tok = { iv: b64(iv), d: b64(enc) }; G.lsSet("nl_gh", JSON.stringify(c));
  };
  const loadToken = async () => {
    let t = null; try { t = sessionStorage.getItem("nl_ghtok"); } catch(e){}
    if (t) return t;
    const c = ghCfg(); if (!c.tok || !subtle) return "";
    // mật khẩu đã đổi thì khóa giải mã khác: cần nhập lại token
    try { const k = await aesKey(); return new TextDecoder().decode(await subtle.decrypt({ name:"AES-GCM", iv: unb64(c.tok.iv) }, k, unb64(c.tok.d))); } catch(e){ return ""; }
  };
  const forgetToken = () => { const c = ghCfg(); delete c.tok; G.lsSet("nl_gh", JSON.stringify(c)); try { sessionStorage.removeItem("nl_ghtok"); } catch(e){} };
  const gh = async (tok, path, opt = {}) => {
    const r = await fetch(GH_API + path, { method: opt.method || "GET", headers: { "Accept":"application/vnd.github+json", "Authorization":`Bearer ${tok}`, "X-GitHub-Api-Version":"2022-11-28", ...(opt.body ? { "Content-Type":"application/json" } : {}) }, body: opt.body ? JSON.stringify(opt.body) : undefined, cache:"no-store" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok){ const e = new Error(j.message || `HTTP ${r.status}`); e.status = r.status; throw e; }
    return j;
  };
  const ghErr = e => e.status === 401 ? "Token không hợp lệ hoặc đã hết hạn." : e.status === 403 ? "Token không có quyền ghi vào repo này (cần quyền Contents: Read and write)." : e.status === 404 ? "Không tìm thấy repo hoặc nhánh. Kiểm tra lại tên tài khoản, tên repo, nhánh; với token loại fine-grained, nhớ chọn đúng repo này." : e.status === 409 ? "Repo đang trống hoặc bị xung đột. Thử lại sau ít phút." : e.status === 422 ? "GitHub từ chối thay đổi (tệp quá lớn hoặc dữ liệu không hợp lệ)." : (/fetch/i.test(e.message) ? "Không kết nối được tới GitHub. Kiểm tra mạng." : e.message);
  const ghRepo = c => `/repos/${encodeURIComponent(c.owner.trim())}/${encodeURIComponent(c.repo.trim())}`;
  const ghDir = c => { const d = String(c.dir || "").trim().replace(/^\/+|\/+$/g, ""); return d ? d + "/" : ""; };
  const ghTest = async (c, tok) => {
    const repo = await gh(tok, ghRepo(c));
    if (repo.permissions && !repo.permissions.push) { const e = new Error("no push"); e.status = 403; throw e; }
    const branch = c.branch.trim() || repo.default_branch;
    let hasData = true; try { await gh(tok, `${ghRepo(c)}/contents/${ghDir(c)}data.js?ref=${encodeURIComponent(branch)}`); } catch(e){ if (e.status === 404) hasData = false; else throw e; }
    return { branch, hasData, full: repo.full_name };
  };
  // gom data.js và mọi ảnh mới vào MỘT lần commit
  const ghPush = async (c, tok, step) => {
    const R = ghRepo(c), dir = ghDir(c), { branch } = await ghTest(c, tok);
    step("Đang đọc nhánh " + branch + "…");
    const ref = await gh(tok, `${R}/git/ref/heads/${encodeURIComponent(branch)}`), head = ref.object.sha;
    const base = await gh(tok, `${R}/git/commits/${head}`);
    const tree = [], nf = newFiles();
    for (let i = 0; i < nf.length; i++){
      step(`Đang tải ảnh ${i + 1}/${nf.length}…`);
      const v = await G.idb.get(nf[i]); if (!v || !v.blob) continue;
      const bl = await gh(tok, `${R}/git/blobs`, { method:"POST", body:{ content: b64(new Uint8Array(await v.blob.arrayBuffer())), encoding:"base64" } });
      tree.push({ path: dir + nf[i], mode:"100644", type:"blob", sha: bl.sha });
    }
    step("Đang tải data.js…");
    const js = await gh(tok, `${R}/git/blobs`, { method:"POST", body:{ content: dataJs(), encoding:"utf-8" } });
    tree.push({ path: dir + "data.js", mode:"100644", type:"blob", sha: js.sha });
    const t = await gh(tok, `${R}/git/trees`, { method:"POST", body:{ base_tree: base.tree.sha, tree } });
    step("Đang tạo commit…");
    const cm = await gh(tok, `${R}/git/commits`, { method:"POST", body:{ message: `Cập nhật nội dung từ chế độ chỉnh sửa (${new Date().toLocaleString("vi-VN")})`, tree: t.sha, parents:[head] } });
    await gh(tok, `${R}/git/refs/heads/${encodeURIComponent(branch)}`, { method:"PATCH", body:{ sha: cm.sha } });
    return { branch, n: nf.length, url: cm.html_url };
  };
  let ghBusy = false, ghMsg = null;
  const ghRun = async (kind) => {
    if (ghBusy) return;
    const c = ghCfg(), f = id => ov.querySelector(id);
    c.owner = f("#neGhOwner").value.trim(); c.repo = f("#neGhRepo").value.trim(); c.branch = f("#neGhBranch").value.trim(); c.dir = f("#neGhDir").value.trim();
    const remember = f("#neGhRem").checked, typed = f("#neGhTok").value.trim();
    delete c.tokPlain; const keepTok = c.tok; c.remember = remember;
    G.lsSet("nl_gh", JSON.stringify(Object.assign(c, { tok: keepTok })));
    if (!c.owner || !c.repo) return toast("Nhập tên tài khoản GitHub và tên repo.", true);
    if (typed) await saveToken(typed, remember);
    const tok = typed || await loadToken();
    if (!tok) return toast(c.tok ? "Không mở được token đã lưu (có thể do đã đổi mật khẩu). Hãy dán lại token." : "Dán token GitHub vào ô Token trước.", true);
    ghBusy = true; const out = f("#neGhOut");
    const step = m => { out.className = "ne-note"; out.textContent = m; out.hidden = false; };
    try {
      if (kind === "test"){
        step("Đang kiểm tra…");
        const r = await ghTest(c, tok);
        ghMsg = ["ok", `Kết nối được với ${r.full}, nhánh ${r.branch}. ${r.hasData ? "Đã thấy data.js." : `Chưa thấy ${ghDir(c)}data.js ở nhánh này: kiểm tra ô "Thư mục trong repo".`}`];
      } else {
        if (!confirm("Đăng bản nháp lên GitHub? Trang web thật sẽ đổi theo sau vài phút.")) { ghBusy = false; out.hidden = true; return; }
        save(true);
        const r = await ghPush(c, tok, step);
        const d = G.readDraft(); if (d){ d.pushed = Date.now(); G.lsSet("nl_draft", JSON.stringify(d)); }
        ghMsg = ["ok", `Đã đăng lên nhánh ${r.branch}: data.js${r.n ? ` và ${r.n} ảnh mới` : ""}. GitHub Pages cần vài phút để cập nhật trang (đôi khi tới 10 phút do trình duyệt nhớ bản cũ). Khi trang đã đổi, bản nháp trên máy này tự được dọn.`, r.url];
        toast("Đã đăng lên GitHub.");
      }
    } catch(e){ ghMsg = ["err", ghErr(e)]; }
    ghBusy = false; render(true);
  };

  /* ---------- giao diện ---------- */
  const CSS = `
#nled{--bg:#0A0818;--pn:#141030;--pn2:#1B1640;--ln:rgba(255,255,255,.1);--ln2:rgba(255,255,255,.18);--tx:#F7F3FF;--mu:#B4AAD8;--pk:#FF4F9A;--gd:#FFC65C;--mt:#5EF0C8;--rd:#FF5C6C;
  position:fixed;inset:0;z-index:600;display:grid;grid-template-rows:auto 1fr;background:var(--bg);color:var(--tx);font:14.5px/1.5 "Be Vietnam Pro",system-ui,sans-serif;opacity:0;transition:opacity .2s}
#nled.in{opacity:1}
#nled,#nled *{cursor:auto!important;box-sizing:border-box}
#nled button,#nled label.ne-b,#nled select,#nled input[type=checkbox],#nled input[type=radio],#nled input[type=range],#nled input[type=color],#nled .ne-gh{cursor:pointer!important}
#nled input:not([type]),#nled input[type=text],#nled input[type=url],#nled input[type=number],#nled input[type=password],#nled textarea{cursor:text!important}
body.ne-open .cur{display:none!important}
body.ne-open{overflow:hidden}
.ne-top{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--ln);background:#0E0B22;flex-wrap:wrap}
.ne-brand{font:700 15px/1 "Tektur",system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;display:flex;align-items:center;gap:10px}
.ne-brand i{width:10px;height:10px;border-radius:3px;background:linear-gradient(135deg,var(--pk),var(--gd));box-shadow:0 0 12px var(--pk)}
.ne-brand small{font:600 11px/1 "JetBrains Mono",monospace;color:var(--mu);letter-spacing:.04em;text-transform:none}
#neSave{font:500 12px/1.3 "JetBrains Mono",monospace;color:var(--mt);margin-right:auto}
#neSave.err{color:var(--rd)}
.ne-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:38px;padding:8px 14px;border-radius:11px;border:1px solid var(--ln2);background:rgba(255,255,255,.05);color:var(--tx);font:600 13.5px/1.2 "Be Vietnam Pro",system-ui,sans-serif;text-decoration:none;white-space:nowrap}
.ne-btn:hover{background:rgba(255,255,255,.11)}
.ne-btn:focus-visible,.ne-ib:focus-visible,.ne-nav button:focus-visible,#nled input:focus-visible,#nled textarea:focus-visible,#nled select:focus-visible{outline:2px solid var(--gd);outline-offset:2px}
.ne-btn.p{border:0;background:linear-gradient(90deg,var(--pk),var(--gd));color:#1A0718}
.ne-btn.p:hover{filter:brightness(1.08)}
.ne-btn.d{border-color:rgba(255,92,108,.5);color:#FF9AA4}
.ne-btn.d:hover{background:rgba(255,92,108,.12)}
.ne-btn.s{min-height:32px;padding:6px 11px;font-size:12.5px;border-radius:9px}
.ne-body{display:grid;grid-template-columns:210px 1fr;min-height:0}
.ne-nav{display:flex;flex-direction:column;gap:4px;padding:16px 12px;border-right:1px solid var(--ln);background:#0D0A20;overflow:auto}
.ne-nav button{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:11px 12px;border:0;border-radius:10px;background:none;color:var(--mu);font:600 14px/1.2 "Be Vietnam Pro",system-ui,sans-serif;text-align:left}
.ne-nav button:hover{background:rgba(255,255,255,.06);color:var(--tx)}
.ne-nav button.on{background:linear-gradient(90deg,rgba(255,79,154,.22),rgba(255,198,92,.08));color:var(--tx);box-shadow:inset 3px 0 0 var(--pk)}
.ne-nav em{font:600 11px/1 "JetBrains Mono",monospace;font-style:normal;color:var(--mu);background:rgba(255,255,255,.07);padding:4px 6px;border-radius:6px}
.ne-nav hr{border:0;border-top:1px solid var(--ln);margin:8px 4px}
.ne-main{overflow:auto;padding:24px clamp(16px,3vw,40px) 80px;overscroll-behavior:contain}
.ne-in{max-width:880px;margin:0 auto;display:grid;gap:18px}
.ne-h{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ne-h h2{margin:0;font:700 26px/1.1 "Tektur",system-ui,sans-serif}
.ne-h p{margin:6px 0 0;color:var(--mu);font-size:13.5px;max-width:60ch}
.ne-card{background:var(--pn);border:1px solid var(--ln);border-radius:16px;padding:18px}
.ne-card h3{margin:0 0 12px;font:700 15px/1.2 "Tektur",system-ui,sans-serif;letter-spacing:.03em}
.ne-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.ne-grid .w{grid-column:1/-1}
.ne-f{display:grid;gap:6px;min-width:0}
.ne-f>span{font:600 12px/1.2 "Be Vietnam Pro",system-ui,sans-serif;color:var(--mu);letter-spacing:.02em}
.ne-f>small{color:var(--mu);font-size:12px;opacity:.85}
#nled input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color]):not([type=file]),#nled textarea,#nled select{width:100%;min-height:40px;padding:9px 12px;border-radius:10px;border:1px solid var(--ln2);background:#0C0920;color:var(--tx);font:500 14px/1.4 "Be Vietnam Pro",system-ui,sans-serif}
#nled textarea{min-height:84px;resize:vertical}
#nled input:focus,#nled textarea:focus,#nled select:focus{border-color:var(--gd);outline:none}
#nled input[type=file]{display:none}
#nled input[type=range]{accent-color:var(--pk);width:100%}
#nled input[type=checkbox],#nled input[type=radio]{accent-color:var(--pk);width:18px;height:18px;margin:0}
.ne-ck{display:inline-flex;align-items:center;gap:9px;font-weight:600;font-size:13.5px}
.ne-list{display:grid;gap:10px}
.ne-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;background:var(--pn);border:1px solid var(--ln);border-radius:14px;padding:12px}
.ne-row .ne-grid{gap:10px}
.ne-acts{display:flex;gap:4px;align-items:center}
.ne-ib{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;border:1px solid var(--ln);background:rgba(255,255,255,.04);color:var(--mu);padding:0}
.ne-ib:hover{color:var(--tx);background:rgba(255,255,255,.1)}
.ne-ib.d:hover{color:#FF9AA4;border-color:rgba(255,92,108,.5);background:rgba(255,92,108,.12)}
.ne-ib:disabled{opacity:.3;pointer-events:none}
.ne-add{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:13px;border-radius:14px;border:1.5px dashed var(--ln2);background:none;color:var(--gd);font:700 14px/1 "Be Vietnam Pro",system-ui,sans-serif}
.ne-add:hover{background:rgba(255,198,92,.07);border-color:var(--gd)}
.ne-sk{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) 40px;gap:12px;align-items:center}
.ne-sk b{font:700 15px/1 "JetBrains Mono",monospace;color:var(--gd);text-align:right}
.ne-img{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start}
.ne-th{position:relative;width:132px;aspect-ratio:16/10;border-radius:12px;overflow:hidden;background:repeating-linear-gradient(45deg,#18133A 0 8px,#130F2E 8px 16px);border:1px solid var(--ln2);display:grid;place-items:center;color:var(--mu);font-size:11.5px;text-align:center;padding:4px}
.ne-th.sq{width:96px;aspect-ratio:1}
.ne-th img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ne-th .miss{position:absolute;inset:auto 0 0;background:rgba(10,8,24,.88);color:#FFB3BB;font-size:10.5px;padding:3px}
.ne-th em{position:absolute;left:5px;top:5px;font:700 9.5px/1 "JetBrains Mono",monospace;font-style:normal;background:var(--mt);color:#05231B;padding:3px 5px;border-radius:5px}
.ne-img .ne-f{gap:8px}
.ne-bts{display:flex;flex-wrap:wrap;gap:6px}
.ne-shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.ne-shot{background:#0C0920;border:1px solid var(--ln);border-radius:12px;padding:6px;display:grid;gap:6px}
.ne-shot .ne-th{width:100%}
.ne-shot .ne-acts{justify-content:center}
.ne-game{background:var(--pn);border:1px solid var(--ln);border-radius:16px;overflow:hidden}
.ne-game.open{border-color:rgba(255,198,92,.4)}
.ne-gh{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:12px 12px 12px 14px}
.ne-gh:hover{background:rgba(255,255,255,.03)}
.ne-dot{width:14px;height:40px;border-radius:5px}
.ne-gt{min-width:0}
.ne-gt b{display:block;font:700 16px/1.25 "Tektur",system-ui,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ne-gt small{display:flex;gap:8px;flex-wrap:wrap;align-items:center;color:var(--mu);font-size:12px;margin-top:3px}
.ne-tag{font:600 10.5px/1 "JetBrains Mono",monospace;padding:4px 6px;border-radius:6px;background:rgba(255,255,255,.07)}
.ne-tag.f{background:rgba(255,198,92,.16);color:var(--gd);display:inline-flex;gap:4px;align-items:center}
.ne-tag.r{color:var(--mt)}
.ne-gb{padding:4px 16px 18px;border-top:1px solid var(--ln);display:grid;gap:16px}
.ne-sw{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.ne-sw button{width:28px;height:28px;border-radius:8px;border:2px solid transparent;padding:0}
.ne-sw button.on{border-color:#fff}
.ne-sw input[type=color]{width:44px;height:32px;border:1px solid var(--ln2);border-radius:8px;background:none;padding:2px}
.ne-note{border-radius:14px;padding:14px 16px;background:rgba(98,182,255,.08);border:1px solid rgba(98,182,255,.3);font-size:13.5px;color:#D6E9FF}
.ne-note.w{background:rgba(255,198,92,.08);border-color:rgba(255,198,92,.35);color:#FFE8BD}
.ne-note b{color:#fff}
.ne-note ol,.ne-note ul{margin:8px 0 0;padding-left:20px;display:grid;gap:5px}
.ne-note code,.ne-card code{font:600 12.5px/1 "JetBrains Mono",monospace;background:rgba(255,255,255,.08);padding:2px 5px;border-radius:5px}
.ne-files{display:grid;gap:6px;margin:10px 0 0;padding:0;list-style:none;font:500 12.5px/1.4 "JetBrains Mono",monospace;color:var(--mu)}
.ne-stat{display:flex;align-items:center;gap:10px;font-weight:600}
.ne-stat i{width:10px;height:10px;border-radius:50%;background:var(--mt);box-shadow:0 0 10px var(--mt)}
.ne-stat.ch i{background:var(--gd);box-shadow:0 0 10px var(--gd)}
.ne-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:5;max-width:calc(100vw - 32px);padding:12px 16px;border-radius:12px;background:#1F1A48;border:1px solid var(--mt);color:var(--tx);font-weight:600;font-size:13.5px;box-shadow:0 18px 40px -12px #000;transition:opacity .3s}
.ne-toast.err{border-color:var(--rd)}
.ne-toast.out{opacity:0}
.ne-sm{display:none}
.ne-empty{padding:22px;text-align:center;color:var(--mu);border:1px dashed var(--ln2);border-radius:14px}
@media (max-width:760px){
  .ne-top{padding:10px 12px;gap:8px}
  .ne-top .ne-btn{min-height:34px;padding:7px 10px;font-size:12.5px}
  .ne-brand small,.ne-hm{display:none}
  .ne-sm{display:inline}
  .ne-brand{margin-right:auto;font-size:13.5px}
  .ne-top .ne-ib{width:34px;height:34px}
  #neSave{order:9;width:100%;margin:0}
  .ne-body{grid-template-columns:1fr;grid-template-rows:auto 1fr}
  .ne-nav{flex-direction:row;padding:8px 10px;border-right:0;border-bottom:1px solid var(--ln);overflow-x:auto;scrollbar-width:none}
  .ne-nav button{width:auto;white-space:nowrap;padding:9px 11px;font-size:13px}
  .ne-nav button.on{box-shadow:inset 0 -2px 0 var(--pk)}
  .ne-nav hr{display:none}
  .ne-main{padding:18px 14px 70px}
  .ne-grid{grid-template-columns:1fr}
  .ne-h h2{font-size:22px}
  .ne-row{grid-template-columns:1fr;}
  .ne-row>.ne-acts{justify-content:flex-end}
  .ne-sk{grid-template-columns:1fr 34px}
  .ne-sk input[type=range]{grid-column:1/-1;grid-row:2}
  .ne-img{grid-template-columns:1fr}
  .ne-gh{grid-template-columns:auto 1fr;}
  .ne-gh .ne-acts{grid-column:1/-1;justify-content:flex-end}
}`;

  const fld = (label, path, o = {}) => {
    const v = getP(path), t = o.t || "s", ph = o.ph ? ` placeholder="${esc(o.ph)}"` : "", cls = o.w ? " w" : "";
    let inp;
    if (t === "area") inp = `<textarea data-p="${path}" data-t="s" rows="${o.rows || 3}"${ph}>${esc(v)}</textarea>`;
    else if (t === "lines") inp = `<textarea data-p="${path}" data-t="lines" rows="${o.rows || 3}"${ph}>${esc((v || []).join("\n"))}</textarea>`;
    else if (t === "csv") inp = `<input type="text" data-p="${path}" data-t="csv" value="${esc((v || []).join(", "))}"${ph}>`;
    else if (t === "n") inp = `<input type="number" data-p="${path}" data-t="n" value="${esc(v)}" ${o.min != null ? `min="${o.min}"` : ""} ${o.max != null ? `max="${o.max}"` : ""}${ph}>`;
    else inp = `<input type="${o.url ? "url" : "text"}" data-p="${path}" data-t="s" value="${esc(v)}"${ph}${o.re ? ' data-re="1"' : ""}>`;
    return `<label class="ne-f${cls}"><span>${label}</span>${inp}${o.hint ? `<small>${o.hint}</small>` : ""}</label>`;
  };
  const acts = (list, i, n, o = {}) => `<div class="ne-acts">
    <button type="button" class="ne-ib" data-a="up" data-x="${list}.${i}" ${i === 0 ? "disabled" : ""} title="Đưa lên" aria-label="Đưa lên">${IC.up}</button>
    <button type="button" class="ne-ib" data-a="down" data-x="${list}.${i}" ${i === n - 1 ? "disabled" : ""} title="Đưa xuống" aria-label="Đưa xuống">${IC.down}</button>
    ${o.dup ? `<button type="button" class="ne-ib" data-a="dup" data-x="${list}.${i}" title="Nhân bản" aria-label="Nhân bản">${IC.dup}</button>` : ""}
    <button type="button" class="ne-ib d" data-a="del" data-x="${list}.${i}" title="Xóa" aria-label="Xóa">${IC.del}</button></div>`;
  const thumb = (path, o = {}) => {
    const p = getP(path) || "";
    return `<div class="ne-th${o.sq ? " sq" : ""}">${p ? `<img src="${esc(srcOf(p))}" alt="" data-miss>${FILES.has(p) ? "<em>MỚI</em>" : ""}` : esc(o.empty || "Chưa có ảnh")}</div>`;
  };
  const imgField = (label, path, o = {}) => `<div class="ne-f w"><span>${label}</span><div class="ne-img">
      ${thumb(path, o)}
      <div class="ne-f">
        <input type="text" data-p="${path}" data-t="s" data-re="1" value="${esc(getP(path))}" placeholder="${esc(o.ph || "images/ten-anh.jpg")}">
        <div class="ne-bts">
          <label class="ne-btn s p">Tải ảnh lên<input type="file" accept="image/*" data-up="${path}" data-k="${o.kind || "image"}"></label>
          ${getP(path) ? `<button type="button" class="ne-btn s d" data-a="clr" data-x="${path}">Bỏ ảnh</button>` : ""}
        </div>
        ${o.hint ? `<small>${o.hint}</small>` : ""}
      </div></div></div>`;

  const V = {};
  V.profile = () => `
    <div class="ne-h"><div><h2>Hồ sơ</h2><p>Tên, công việc, ảnh đại diện và phần giới thiệu. Dùng ở trang chủ, trang Hồ sơ và khắp nơi khác.</p></div></div>
    <div class="ne-card"><h3>Thông tin chính</h3><div class="ne-grid">
      ${fld("Họ tên", "name", { ph:"Nguyễn Văn A" })}
      ${fld("Biệt danh (code name)", "codename", { ph:"Đom Đóm", hint:"Hiện dưới tên ở trang chủ và trên thẻ hồ sơ. Để trống nếu không dùng." })}
      ${fld("Công việc / vai trò", "role", { ph:"Indie Game Developer" })}
      ${fld("Số năm kinh nghiệm (LV)", "level", { t:"n", min:0, max:99 })}
      ${fld("Câu giới thiệu ngắn (tagline)", "tagline", { t:"area", w:true, rows:2 })}
      ${fld("Lớp nhân vật", "className", { ph:"Lập trình viên gameplay" })}
      ${fld("Trạng thái", "status", { ph:"Sẵn sàng nhận dự án" })}
      ${fld("Giới thiệu bản thân", "about", { t:"area", w:true, rows:5 })}
    </div></div>
    <div class="ne-card"><h3>Ảnh & CV</h3><div class="ne-grid">
      ${imgField("Ảnh đại diện", "avatar", { sq:true, kind:"avatar", empty:"Tự vẽ", ph:"images/avatar.jpg", hint:"Để trống thì trang tự vẽ ảnh chân dung. Ảnh lớn được thu nhỏ còn 900px." })}
      <div class="ne-f w"><span>File CV</span><div class="ne-f">
        <input type="text" data-p="cvFile" data-t="s" data-re="1" value="${esc(D.cvFile)}" placeholder="cv.pdf">
        <div class="ne-bts"><label class="ne-btn s p">Tải file CV lên<input type="file" accept=".pdf,application/pdf" data-up="cvFile" data-k="file"></label>${D.cvFile ? `<button type="button" class="ne-btn s d" data-a="clr" data-x="cvFile">Bỏ CV</button>` : ""}${FILES.has(D.cvFile) ? `<span class="ne-tag r" style="align-self:center">MỚI · cần tải lên</span>` : ""}</div>
        <small>Để trống thì trang ẩn nút "Tải CV".</small></div></div>
    </div></div>`;

  V.skills = () => `
    <div class="ne-h"><div><h2>Kỹ năng</h2><p>Hiện thành biểu đồ radar ở trang Hồ sơ. Mức từ 1 đến 10. Nên giữ 5 đến 8 kỹ năng để biểu đồ đẹp.</p></div></div>
    <div class="ne-list">${D.skills.map((s, i) => `<div class="ne-row"><div class="ne-sk">
        <input type="text" data-p="skills.${i}.name" data-t="s" value="${esc(s.name)}" aria-label="Tên kỹ năng">
        <input type="range" min="1" max="10" step="1" data-p="skills.${i}.level" data-t="n" value="${esc(s.level)}" aria-label="Mức kỹ năng">
        <b data-lv="skills.${i}.level">${esc(s.level)}</b></div>${acts("skills", i, D.skills.length)}</div>`).join("") || `<div class="ne-empty">Chưa có kỹ năng nào.</div>`}
      <button type="button" class="ne-add" data-a="add" data-x="skills">${IC.plus} Thêm kỹ năng</button></div>`;

  V.tools = () => `
    <div class="ne-h"><div><h2>Túi đồ</h2><p>Công cụ bạn dùng, hiện thành các ô vật phẩm ở trang Hồ sơ. Xếp từ dùng nhiều nhất: 2 món đầu là "huyền thoại", 2 món sau là "sử thi".</p></div></div>
    <div class="ne-list">${D.tools.map((t, i) => `<div class="ne-row"><input type="text" data-p="tools.${i}" data-t="s" value="${esc(t)}" aria-label="Tên vật phẩm">${acts("tools", i, D.tools.length)}</div>`).join("") || `<div class="ne-empty">Túi đồ đang trống.</div>`}
      <button type="button" class="ne-add" data-a="add" data-x="tools">${IC.plus} Thêm vật phẩm</button></div>`;

  const gameBody = i => {
    const g = D.games[i], P = `games.${i}`, col = String(g.color || "").toUpperCase();
    return `<div class="ne-gb"><div class="ne-grid">
      ${fld("Tên game", `${P}.title`, { w:true })}
      <label class="ne-f"><span>Trạng thái</span><select data-p="${P}.status" data-t="s" data-re="1"><option value="released" ${g.status !== "dev" ? "selected" : ""}>Đã phát hành</option><option value="dev" ${g.status === "dev" ? "selected" : ""}>Đang phát triển</option></select></label>
      ${fld("Năm", `${P}.year`, { t:"n", min:1990, max:2100 })}
      ${fld("Engine", `${P}.engine`, { ph:"Unity, Godot…" })}
      ${fld("Nền tảng", `${P}.platform`, { ph:"PC, Web, Mobile" })}
      ${fld("Thể loại", `${P}.genres`, { t:"csv", w:true, ph:"Platformer, Giải đố", hint:"Cách nhau bằng dấu phẩy. Thể loại cũng quyết định tranh minh họa tự vẽ." })}
      ${fld("Mô tả", `${P}.desc`, { t:"area", w:true, rows:4 })}
      ${fld("Điểm nổi bật của game", `${P}.features`, { t:"lines", w:true, rows:3, hint:"Mỗi dòng một ý." })}
      ${fld("Thành tích / giải thưởng", `${P}.highlight`, { w:true, ph:"Top 10 tại một game jam 48 giờ" })}
      ${fld("Link chơi (itch.io, Steam…)", `${P}.itch`, { url:true, ph:"https://tenban.itch.io/ten-game" })}
      ${fld("Link trailer YouTube", `${P}.trailer`, { url:true, ph:"https://www.youtube.com/watch?v=…" })}
      <div class="ne-f w"><span>Màu chủ đạo</span><div class="ne-sw">${COLORS.map(([c, n]) => `<button type="button" data-a="color" data-x="${P}" data-c="${c}" class="${col === c ? "on" : ""}" style="background:${c}" title="${n}" aria-label="Màu ${n}"></button>`).join("")}<input type="color" data-p="${P}.color" data-t="s" data-re="1" value="${/^#[0-9a-f]{6}$/i.test(g.color) ? esc(g.color) : "#ff4f9a"}" aria-label="Chọn màu khác"></div><small>Dùng cho tranh minh họa tự vẽ và các điểm nhấn của game.</small></div>
      <label class="ne-f"><span>Tranh minh họa (khi không có ảnh bìa)</span><select data-p="${P}.scene" data-t="s" data-re="1">${SCENES.map(([k, n]) => `<option value="${k}" ${(g.scene || "") === k ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      <label class="ne-f" style="align-self:end"><span class="ne-ck"><input type="checkbox" data-a="feat" data-x="${i}" ${g.featured ? "checked" : ""}> Game nổi bật trên trang chủ</span></label>
      ${imgField("Ảnh bìa", `${P}.image`, { hint:"Để trống thì trang tự vẽ tranh theo thể loại và màu. Ảnh lớn được thu nhỏ còn 1920px." })}
      <div class="ne-f w"><span>Ảnh chụp màn hình (${g.screenshots.length})</span>
        <div class="ne-shots">${g.screenshots.map((s, k) => `<div class="ne-shot">${thumb(`${P}.screenshots.${k}`)}${acts(`${P}.screenshots`, k, g.screenshots.length)}</div>`).join("")}
          <label class="ne-add" style="min-height:100px;flex-direction:column">${IC.plus} Thêm ảnh<input type="file" accept="image/*" multiple data-up="${P}.screenshots" data-k="shot"></label></div>
        <small>Có thể chọn nhiều ảnh một lúc.</small></div>
    </div></div>`;
  };
  V.games = () => `
    <div class="ne-h"><div><h2>Dự án game</h2><p>Bấm vào một game để sửa. Thứ tự ở đây là thứ tự hiện trên trang Thư viện game.</p></div></div>
    <div class="ne-list">${D.games.map((g, i) => `<div class="ne-game${openG === i ? " open" : ""}">
        <div class="ne-gh" data-a="toggle" data-x="${i}" role="button" tabindex="0" aria-expanded="${openG === i}">
          <i class="ne-dot" style="background:${esc(/^#[0-9a-f]{3,6}$/i.test(g.color) ? g.color : "#FF4F9A")}"></i>
          <div class="ne-gt"><b>${esc(g.title || "Game chưa đặt tên")}</b><small>${g.featured ? `<span class="ne-tag f">${IC.star} Nổi bật</span>` : ""}<span class="ne-tag ${g.status === "dev" ? "" : "r"}">${g.status === "dev" ? "Đang phát triển" : "Đã phát hành"}</span>${g.year ? `<span>${esc(g.year)}</span>` : ""}${g.engine ? `<span>${esc(g.engine)}</span>` : ""}</small></div>
          ${acts("games", i, D.games.length, { dup:true })}
        </div>${openG === i ? gameBody(i) : ""}</div>`).join("") || `<div class="ne-empty">Chưa có game nào.</div>`}
      <button type="button" class="ne-add" data-a="add" data-x="games">${IC.plus} Thêm game</button></div>`;

  V.quests = () => `
    <div class="ne-h"><div><h2>Kinh nghiệm</h2><p>Kinh nghiệm làm việc và học vấn, hiện ở trang Nhật ký nhiệm vụ. Mới nhất để trên cùng.</p></div></div>
    <div class="ne-list">${D.quests.map((q, i) => `<div class="ne-row"><div class="ne-grid">
        ${fld("Thời gian", `quests.${i}.time`, { ph:"2022 – 2024" })}
        ${fld("Chức danh / tên", `quests.${i}.title`)}
        ${fld("Nơi làm / tổ chức", `quests.${i}.place`)}
        <label class="ne-f" style="align-self:end"><span class="ne-ck"><input type="checkbox" data-p="quests.${i}.done" data-t="nb" ${q.done === false ? "checked" : ""}> Đang làm (chưa kết thúc)</span></label>
        ${fld("Mô tả", `quests.${i}.desc`, { t:"area", w:true, rows:2 })}
      </div>${acts("quests", i, D.quests.length, { dup:true })}</div>`).join("") || `<div class="ne-empty">Chưa có mục nào.</div>`}
      <button type="button" class="ne-add" data-a="add" data-x="quests">${IC.plus} Thêm kinh nghiệm</button></div>`;

  V.contacts = () => `
    <div class="ne-h"><div><h2>Liên hệ</h2><p>Các kênh hiện ở trang Liên hệ và chân trang. Kênh đầu tiên là kênh chính.</p></div></div>
    <div class="ne-note">Email: ghi <code>mailto:</code> trước địa chỉ ở ô Đường link, ví dụ <code>mailto:ban@gmail.com</code>. Kênh nào để trống đường link sẽ bị ẩn.</div>
    <div class="ne-list">${D.contacts.map((c, i) => `<div class="ne-row"><div class="ne-grid">
        ${fld("Tên kênh", `contacts.${i}.label`, { ph:"Email, GitHub…" })}
        ${fld("Chữ hiển thị", `contacts.${i}.value`, { ph:"github.com/tenban" })}
        ${fld("Đường link", `contacts.${i}.url`, { w:true, ph:"https://…" })}
      </div>${acts("contacts", i, D.contacts.length)}</div>`).join("") || `<div class="ne-empty">Chưa có kênh liên hệ nào.</div>`}
      <button type="button" class="ne-add" data-a="add" data-x="contacts">${IC.plus} Thêm kênh liên hệ</button></div>`;

  const same = () => { try { return JSON.stringify(norm(clone(G.published || {}))) === JSON.stringify(D) && !LOCK; } catch(e){ return false; } };
  const ghCard = () => {
    const c = ghCfg(), has = !!(c.tok || (() => { try { return sessionStorage.getItem("nl_ghtok"); } catch(e){ return null; } })());
    return `<div class="ne-card"><h3>Lưu thẳng lên GitHub</h3>
      <p style="margin:0 0 12px;color:var(--mu);font-size:13.5px">Kết nối một lần bằng token GitHub, sau đó chỉ cần bấm <b>Đăng lên GitHub</b>. Trang tự commit data.js và ảnh mới vào repo.</p>
      <div class="ne-grid">
        <label class="ne-f"><span>Tài khoản GitHub</span><input type="text" id="neGhOwner" value="${esc(c.owner)}" placeholder="ten-tai-khoan" autocomplete="off" spellcheck="false"></label>
        <label class="ne-f"><span>Tên repo</span><input type="text" id="neGhRepo" value="${esc(c.repo)}" placeholder="ten-tai-khoan.github.io" autocomplete="off" spellcheck="false"></label>
        <label class="ne-f"><span>Nhánh</span><input type="text" id="neGhBranch" value="${esc(c.branch)}" placeholder="để trống = nhánh mặc định" autocomplete="off" spellcheck="false"></label>
        <label class="ne-f"><span>Thư mục trong repo</span><input type="text" id="neGhDir" value="${esc(c.dir)}" placeholder="để trống nếu data.js nằm ngay ngoài cùng" autocomplete="off" spellcheck="false"></label>
        <label class="ne-f w"><span>Token</span><input type="password" id="neGhTok" placeholder="${has ? "Đã lưu token. Dán token mới nếu muốn thay." : "github_pat_…"}" autocomplete="off" spellcheck="false">
          <small>Tạo ở GitHub: Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token. Ở "Repository access" chọn <b>Only select repositories</b> và chọn đúng repo trang web; ở "Permissions" đặt <b>Contents: Read and write</b>.</small></label>
        <label class="ne-ck w"><input type="checkbox" id="neGhRem" ${c.remember !== false ? "checked" : ""}> Ghi nhớ token trên trình duyệt này (được mã hóa bằng mật khẩu chế độ chỉnh sửa)</label>
      </div>
      <div class="ne-bts" style="margin-top:14px"><button type="button" class="ne-btn p" data-a="ghpush">Đăng lên GitHub</button><button type="button" class="ne-btn" data-a="ghtest">Kiểm tra kết nối</button>${has ? `<button type="button" class="ne-btn d" data-a="ghforget">Xóa token đã lưu</button>` : ""}</div>
      <div id="neGhOut" class="ne-note${ghMsg && ghMsg[0] === "err" ? " w" : ""}" style="margin-top:12px" ${ghMsg ? "" : "hidden"}>${ghMsg ? esc(ghMsg[1]) + (ghMsg[2] ? ` <a href="${esc(ghMsg[2])}" target="_blank" rel="noopener" style="color:#fff">Xem commit</a>` : "") : ""}</div>
      <p style="margin:12px 0 0;color:var(--mu);font-size:12.5px">Ai có token này đều sửa được repo, nên chỉ dùng token giới hạn đúng một repo, đặt hạn dùng, và bấm "Xóa token đã lưu" trên máy không phải của bạn.</p></div>`;
  };
  V.publish = () => {
    const dr = G.readDraft(), pushed = dr && dr.pushed, nf = pushed ? [] : newFiles(), eq = same();
    const pt = pushed ? new Date(pushed) : null;
    return `
    <div class="ne-h"><div><h2>Xuất bản</h2><p>Thay đổi đang nằm trong trình duyệt này. Đăng lên GitHub để mọi người thấy: bấm một nút nếu đã kết nối GitHub, hoặc tải file về rồi tự tải lên.</p></div></div>
    <div class="ne-card"><div class="ne-stat ${eq || pushed ? "" : "ch"}"><i></i>${pushed ? `Đã đăng lên GitHub lúc ${String(pt.getHours()).padStart(2,"0")}:${String(pt.getMinutes()).padStart(2,"0")}. Đang chờ trang web cập nhật.` : eq ? "Bản nháp giống bản đang đăng." : "Bản nháp có thay đổi chưa đăng lên web."}</div>
      ${nf.length ? `<p style="margin:12px 0 0;color:var(--mu);font-size:13.5px">${nf.length} tệp mới cần tải lên cùng data.js:</p><ul class="ne-files">${nf.map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}</div>
    ${ghCard()}
    <div class="ne-card"><h3>Hoặc đăng bằng tay</h3>
      <div class="ne-note w"><ol>
        <li>Bấm <b>Tải Web_Portfolio.zip</b>. Trong file có <code>data.js</code>${nf.length ? ` và thư mục <code>images</code> chứa ảnh mới` : ""}.</li>
        <li>Giải nén. Mở repo trang web trên GitHub, chọn <b>Add file → Upload files</b>, kéo <code>data.js</code>${nf.length ? ` và thư mục <code>images</code>` : ""} vào, rồi bấm <b>Commit changes</b>.</li>
        <li>Đợi 1 đến 2 phút rồi tải lại trang web. Xong thì có thể bấm "Bỏ bản nháp" ở dưới cho gọn.</li>
      </ol></div>
      <div class="ne-bts" style="margin-top:14px"><button type="button" class="ne-btn p" data-a="zip">Tải Web_Portfolio.zip</button><button type="button" class="ne-btn" data-a="js">Chỉ tải data.js</button></div></div>
    <div class="ne-card"><h3>Xem trên máy này</h3>
      <label class="ne-ck"><input type="checkbox" data-a="pv" ${G.lsGet("nl_preview") !== "0" ? "checked" : ""}> Hiện bản nháp khi mình mở trang trên trình duyệt này</label>
      <p style="margin:10px 0 0;color:var(--mu);font-size:13px">Người xem khác luôn thấy bản đang đăng. Bản nháp chỉ có trong trình duyệt này: đổi máy, đổi trình duyệt hoặc xóa dữ liệu duyệt web sẽ không còn.</p></div>
    <div class="ne-card"><h3>Khác</h3><div class="ne-bts">
      <label class="ne-btn">Nạp data.js từ máy<input type="file" accept=".js,text/javascript" data-a="import"></label>
      <button type="button" class="ne-btn d" data-a="reset">Bỏ bản nháp, quay về bản đang đăng</button></div>
      <p style="margin:10px 0 0;color:var(--mu);font-size:13px">"Nạp data.js" thay toàn bộ bản nháp bằng nội dung file bạn chọn, tiện khi đổi máy.</p></div>`;
  };

  V.security = () => `
    <div class="ne-h"><div><h2>Bảo mật</h2><p>Đổi mật khẩu và lệnh bí mật mở chế độ chỉnh sửa.</p></div></div>
    <div class="ne-note w"><b>Nên biết:</b> trang của bạn là trang tĩnh, mật khẩu được kiểm tra ngay trong trình duyệt. Khóa này chặn người xem bình thường, nhưng không phải bảo mật mạnh. Dù vậy người khác không sửa được trang thật của bạn: muốn đổi nội dung trên web vẫn cần quyền ghi vào repo GitHub (tài khoản hoặc token của bạn). Token lưu trong trình duyệt được mã hóa bằng mật khẩu này, nên hãy đặt mật khẩu đủ khó.</div>
    <div class="ne-card"><h3>Đổi mật khẩu</h3><div class="ne-grid">
      <label class="ne-f"><span>Mật khẩu mới</span><input type="password" id="nePw1" autocomplete="new-password"></label>
      <label class="ne-f"><span>Nhập lại mật khẩu mới</span><input type="password" id="nePw2" autocomplete="new-password"></label></div>
      <div class="ne-bts" style="margin-top:12px"><button type="button" class="ne-btn p" data-a="setpw">Đổi mật khẩu</button></div></div>
    <div class="ne-card"><h3>Đổi lệnh bí mật</h3><div class="ne-grid">
      <label class="ne-f w"><span>Lệnh mới</span><input type="text" id="neCmd" autocomplete="off" spellcheck="false" placeholder="ví dụ: mo-khoa abc123"><small>Không phân biệt hoa thường và dấu tiếng Việt. Tránh trùng các lệnh có sẵn như help, games, play.</small></label></div>
      <div class="ne-bts" style="margin-top:12px"><button type="button" class="ne-btn p" data-a="setcmd">Đổi lệnh</button></div></div>
    <div class="ne-note">Lệnh và mật khẩu mới có hiệu lực ngay trên trình duyệt này. Trên máy khác, chúng có hiệu lực sau khi bạn tải data.js mới lên GitHub (mục Xuất bản). Trước đó, lệnh và mật khẩu cũ vẫn dùng được.${LOCK ? "<br><b>Bản nháp đang có lệnh hoặc mật khẩu mới chưa đăng.</b>" : ""}</div>
    <div class="ne-card"><h3>Khóa lại</h3><p style="margin:0 0 12px;color:var(--mu);font-size:13.5px">Tab này đang mở khóa đến khi bạn đóng tab. Bấm khóa nếu dùng máy chung.</p><button type="button" class="ne-btn d" data-a="lock">Khóa chế độ chỉnh sửa</button></div>`;

  const counts = { skills: () => D.skills.length, tools: () => D.tools.length, games: () => D.games.length, quests: () => D.quests.length, contacts: () => D.contacts.length };
  const render = (keepScroll) => {
    const m = ov.querySelector(".ne-main"), y = m.scrollTop;
    ov.querySelector(".ne-nav").innerHTML = TABS.map(([k, n], i) => `${i === 6 ? "<hr>" : ""}<button type="button" data-a="tab" data-x="${k}" class="${tab === k ? "on" : ""}" ${tab === k ? 'aria-current="page"' : ""}>${n}${counts[k] ? `<em>${counts[k]()}</em>` : ""}</button>`).join("");
    m.innerHTML = `<div class="ne-in">${V[tab]()}</div>`;
    // ảnh có đường dẫn nhưng không tìm thấy (thường là chưa tải lên GitHub, hoặc gõ sai tên)
    m.querySelectorAll("img[data-miss]").forEach(im => im.addEventListener("error", () => { const th = im.parentNode; im.remove(); if (th) th.insertAdjacentHTML("beforeend", `<span class="miss">Không thấy ảnh</span>`); }, { once:true }));
    m.scrollTop = keepScroll ? y : 0;
  };

  /* ---------- thao tác ---------- */
  const onInput = e => {
    const el = e.target, path = el.dataset.p; if (!path) return;
    const t = el.dataset.t; let v;
    if (t === "n"){ v = el.value === "" ? 0 : +el.value; const b = ov.querySelector(`[data-lv="${path}"]`); if (b) b.textContent = v; }
    else if (t === "nb") v = !el.checked;
    else if (t === "csv") v = el.value.split(",").map(s => s.trim()).filter(Boolean);
    else if (t === "lines") v = el.value.split("\n").map(s => s.trim()).filter(Boolean);
    else v = el.value;
    if (path.endsWith(".scene") && !v){ const ks = path.split("."); delete D.games[+ks[1]].scene; }
    else setP(path, v);
    save();
    // tiêu đề / màu của thẻ game cập nhật ngay
    if (/^games\.\d+\.(title|color)$/.test(path) && e.type === "input"){ const card = el.closest(".ne-game"); if (card){ const i = +path.split(".")[1], g = D.games[i]; card.querySelector(".ne-gt b").textContent = g.title || "Game chưa đặt tên"; card.querySelector(".ne-dot").style.background = g.color; } }
  };
  const onChange = async e => {
    const el = e.target;
    if (el.type === "file" && el.dataset.up){
      const files = [...el.files]; el.value = ""; if (!files.length) return;
      const path = el.dataset.up, kind = el.dataset.k;
      setStatus("Đang xử lý ảnh…");
      try {
        for (const f of files){
          const p = await storeFile(f, kind);
          if (kind === "shot") getP(path).push(p); else setP(path, p);
        }
        save(true); render(true); toast(files.length > 1 ? `Đã thêm ${files.length} ảnh.` : "Đã thêm tệp.");
      } catch(err){ setStatus("Không lưu được tệp trong trình duyệt.", true); toast("Không lưu được tệp. Trình duyệt có thể đang ở chế độ ẩn danh hoặc hết bộ nhớ.", true); }
      return;
    }
    if (el.dataset.a === "import" && el.files[0]){
      const f = el.files[0]; el.value = "";
      try {
        const txt = await f.text();
        const [p, l] = new Function(txt + "\n;return [typeof PROFILE !== 'undefined' ? PROFILE : null, typeof EDITOR_LOCK !== 'undefined' ? EDITOR_LOCK : null];")();
        if (!p) throw 0;
        if (!confirm("Thay toàn bộ bản nháp hiện tại bằng nội dung file này?")) return;
        D = norm(clone(p)); if (l && l.pass && l.cmd) LOCK = l; openG = -1; save(true); render(); toast("Đã nạp data.js vào bản nháp.");
      } catch(err){ toast("File này không đọc được. Hãy chọn đúng file data.js của trang.", true); }
      return;
    }
    if (el.dataset.re){ onInput(e); render(true); }
  };
  const move = (list, i, d) => { const a = getP(list), j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; if (list === "games"){ if (openG === i) openG = j; else if (openG === j) openG = i; } save(); render(true); };
  const onClick = e => {
    const b = e.target.closest("[data-a]"); if (!b || !ov.contains(b)) return;
    if (b.matches("input[type=file]")) return;
    const a = b.dataset.a, x = b.dataset.x;
    const split = s => { const ks = s.split("."), i = +ks.pop(); return [ks.join("."), i]; };
    if (a === "tab"){ tab = x; ghMsg = null; render(); return; }
    if (a === "toggle"){ if (e.target.closest(".ne-acts")) return; openG = openG === +x ? -1 : +x; render(true); return; }
    if (a === "up" || a === "down"){ e.stopPropagation(); const [l, i] = split(x); move(l, i, a === "up" ? -1 : 1); return; }
    if (a === "dup"){ e.stopPropagation(); const [l, i] = split(x), arr = getP(l), c = clone(arr[i]); if (l === "games"){ c.featured = false; c.title = (c.title || "") + " (bản sao)"; } arr.splice(i + 1, 0, c); if (l === "games") openG = i + 1; save(); render(true); return; }
    if (a === "del"){
      e.stopPropagation(); const [l, i] = split(x), arr = getP(l), it = arr[i];
      const name = typeof it === "string" ? (l.endsWith("screenshots") ? "ảnh này" : `"${it}"`) : `"${it.title || it.name || it.label || "mục này"}"`;
      if (!confirm(`Xóa ${name}?`)) return;
      arr.splice(i, 1); if (l === "games"){ if (openG === i) openG = -1; else if (openG > i) openG--; } save(); render(true); return;
    }
    if (a === "add"){ const arr = getP(x); arr.push(NEW[x]()); if (x === "games") openG = arr.length - 1; save(); render(true);
      requestAnimationFrame(() => { const m = ov.querySelector(".ne-main"); m.scrollTop = m.scrollHeight; const ins = m.querySelectorAll(x === "games" ? ".ne-game.open input[type=text]" : ".ne-row input[type=text]"); const last = x === "games" ? ins[0] : ins[ins.length - (x === "quests" ? 3 : x === "contacts" ? 3 : 1)]; if (last){ last.focus(); last.select && last.select(); } }); return; }
    if (a === "clr"){ setP(x, ""); save(); render(true); return; }
    if (a === "color"){ setP(`${x}.color`, b.dataset.c); save(); render(true); return; }
    if (a === "feat"){ const i = +x, on = b.checked; D.games.forEach((g, k) => g.featured = on && k === i); save(); render(true); return; }
    if (a === "pv"){ G.lsSet("nl_preview", b.checked ? "1" : "0"); dirty = true; toast(b.checked ? "Sẽ hiện bản nháp khi bạn đóng trình chỉnh sửa." : "Sẽ hiện bản đang đăng khi bạn đóng trình chỉnh sửa."); return; }
    if (a === "ghtest" || a === "ghpush"){ ghRun(a === "ghtest" ? "test" : "push"); return; }
    if (a === "ghforget"){ forgetToken(); ghMsg = null; render(true); toast("Đã xóa token trên trình duyệt này."); return; }
    if (a === "zip"){ save(true); exportZip().catch(() => toast("Không tạo được file zip.", true)); return; }
    if (a === "js"){ save(true); download(new Blob([dataJs()], { type:"text/javascript" }), "data.js"); toast("Đã tải data.js."); return; }
    if (a === "reset"){
      if (!confirm("Bỏ toàn bộ bản nháp và ảnh mới chưa đăng? Không hoàn tác được.")) return;
      G.lsSet("nl_draft", null); G.idb.clear().catch(() => {}); FILES = new Set();
      D = norm(clone(G.published || {})); LOCK = null; openG = -1; savedAt = 0; dirty = true; setStatus(); render(); toast("Đã quay về bản đang đăng."); return;
    }
    if (a === "setpw"){
      const p1 = ov.querySelector("#nePw1").value, p2 = ov.querySelector("#nePw2").value;
      if (p1.length < 6) return toast("Mật khẩu cần ít nhất 6 ký tự.", true);
      if (p1 !== p2) return toast("Hai lần nhập mật khẩu không khớp.", true);
      setStatus("Đang tạo mã băm…");
      setTimeout(() => { LOCK = G.makeLock(LOCK || G.pubLock, null, p1); save(true); render(true); toast("Đã đổi mật khẩu. Nhớ xuất bản data.js để áp dụng trên web."); }, 30);
      return;
    }
    if (a === "setcmd"){
      const c = ov.querySelector("#neCmd").value.trim();
      if (c.length < 4) return toast("Lệnh cần ít nhất 4 ký tự.", true);
      if (/^(help|whoami|games?|play|choi|cv|ach|thanhtuu|clear|sudo|hire|itch|itchio|email|github|linkedin)$/i.test(c)) return toast("Lệnh này trùng lệnh có sẵn, hãy chọn lệnh khác.", true);
      LOCK = G.makeLock(LOCK || G.pubLock, c, null); save(true); render(true); toast(`Đã đổi lệnh thành "${c}". Nhớ ghi lại lệnh này.`); return;
    }
    if (a === "lock"){ G.lock(); close(); return; }
    if (a === "view"){ save(true); if (G.lsGet("nl_preview") === "0") G.lsSet("nl_preview", "1"); location.reload(); return; }
    if (a === "close"){ close(); return; }
  };
  const close = () => {
    clearTimeout(saveT); if (dirty) save(true);
    ov.classList.remove("in"); document.body.classList.remove("ne-open");
    setTimeout(() => { ov.remove(); ov = null; if (dirty) location.reload(); else { G.chip(); prevFocus && prevFocus.focus && prevFocus.focus({ preventScroll:true }); } }, 200);
  };

  const open = async api => {
    G = api;
    if (!G.unlocked() || ov) return;
    if (!document.getElementById("neCss")){ const st = document.createElement("style"); st.id = "neCss"; st.textContent = CSS; document.head.append(st); }
    const d = G.readDraft();
    D = norm(clone(d ? d.profile : (G.published || {})));
    LOCK = d && d.lock ? d.lock : null; savedAt = d ? d.updated || 0 : 0; dirty = false;
    prevFocus = document.activeElement;
    ov = document.createElement("div"); ov.id = "nled"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Chế độ chỉnh sửa");
    ov.innerHTML = `<header class="ne-top"><div class="ne-brand"><i></i><span><span class="ne-hm">Chế độ </span>chỉnh sửa</span><small>Web_Portfolio</small></div><span id="neSave"></span>
      <button type="button" class="ne-btn" data-a="view"><span class="ne-hm">Lưu &amp; xem trang</span><span class="ne-sm">Xem trang</span></button>
      <button type="button" class="ne-btn p" data-a="tab" data-x="publish">Xuất bản</button>
      <button type="button" class="ne-ib" data-a="close" title="Đóng" aria-label="Đóng">${IC.x}</button></header>
      <div class="ne-body"><nav class="ne-nav" aria-label="Mục dữ liệu"></nav><main class="ne-main"></main></div>`;
    document.body.append(ov); document.body.classList.add("ne-open");
    const chipEl = document.getElementById("nlChip"); if (chipEl) chipEl.remove();
    // phím tắt của trang (1–5 chuyển trang, M, mã bí mật…) không chạy khi đang sửa
    ov.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key === "Escape" && !e.target.closest("input,textarea,select")) close();
      if ((e.key === "Enter" || e.key === " ") && e.target.matches(".ne-gh")){ e.preventDefault(); e.target.click(); }
    });
    ov.addEventListener("input", onInput); ov.addEventListener("change", onChange); ov.addEventListener("click", onClick);
    await loadFiles();
    setStatus(); render();
    requestAnimationFrame(() => { ov.classList.add("in"); const b = ov.querySelector(".ne-nav button.on"); b && b.focus({ preventScroll:true }); });
  };

  return { open };
})();
