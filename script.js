const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Nav background after scrolling
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });

// Glow that follows the cursor (also drives star parallax)
let mx = 0, my = 0;
addEventListener("pointermove", (e) => {
  document.body.style.setProperty("--gx", e.clientX + "px");
  document.body.style.setProperty("--gy", e.clientY + "px");
  mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5;
});

// Loop the marquee seamlessly
const track = $(".track");
track.innerHTML += track.innerHTML + track.innerHTML + track.innerHTML;

// Scroll reveals and the glowing step line
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.matches(".steps li")) $(".steps").classList.add("in");
    io.unobserve(e.target);
  });
}, { threshold: 0.25 });
$$(".rv").forEach((el) => io.observe(el));

// Card spotlight and tilt
$$(".card").forEach((c) => {
  c.addEventListener("pointermove", (e) => {
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty("--mx", x * 100 + "%");
    c.style.setProperty("--my", y * 100 + "%");
    if (!reduce) {
      c.style.setProperty("--ry", (x - 0.5) * 8 + "deg");
      c.style.setProperty("--rx", (0.5 - y) * 8 + "deg");
    }
  });
  c.addEventListener("pointerleave", () => {
    c.style.setProperty("--rx", "0deg");
    c.style.setProperty("--ry", "0deg");
  });
});

// Starfield: twinkling stars, mouse and scroll parallax, shooting stars
const sc = $("#stars"), sx = sc.getContext("2d");
let SW, SH, stars = [], shooters = [];
function sizeStars() {
  const dpr = devicePixelRatio || 1;
  SW = innerWidth; SH = innerHeight;
  sc.width = SW * dpr; sc.height = SH * dpr;
  sx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stars = Array.from({ length: Math.round(SW * SH / 6500) }, () => ({
    x: Math.random() * SW, y: Math.random() * SH, z: Math.random(),
    r: Math.random() * 1.4 + 0.3, p: Math.random() * 7, hue: Math.random() < 0.2 ? "160,230,255" : Math.random() < 0.15 ? "255,180,240" : "255,255,255"
  }));
}
addEventListener("resize", sizeStars);
sizeStars();

function drawStars(t) {
  sx.clearRect(0, 0, SW, SH);
  for (const s of stars) {
    const x = ((s.x - mx * 40 * s.z) % SW + SW) % SW;
    const y = ((s.y - my * 40 * s.z - scrollY * 0.15 * s.z) % SH + SH) % SH;
    const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t / 700 + s.p));
    sx.fillStyle = `rgba(${s.hue},${a})`;
    sx.beginPath(); sx.arc(x, y, s.r, 0, 7); sx.fill();
  }
  if (Math.random() < 0.006 && shooters.length < 2)
    shooters.push({ x: Math.random() * SW, y: Math.random() * SH * 0.4, vx: 9 + Math.random() * 5, vy: 4 + Math.random() * 3, life: 1 });
  shooters = shooters.filter((s) => {
    s.x += s.vx; s.y += s.vy; s.life -= 0.018;
    const g = sx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
    g.addColorStop(0, `rgba(255,255,255,${s.life})`); g.addColorStop(1, "rgba(62,231,255,0)");
    sx.strokeStyle = g; sx.lineWidth = 2;
    sx.beginPath(); sx.moveTo(s.x, s.y); sx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9); sx.stroke();
    return s.life > 0;
  });
}

// Hero: red "inappropriate" objects streak in and burst on the planet
const cv = $("#fx"), ctx = cv.getContext("2d");
const planet = $("#planet"), countEl = $("#count");
let W, H, cx, cy, R, threats = [], sparks = [], blocked = 0, last = 0;
function size() {
  const dpr = devicePixelRatio || 1, r = cv.getBoundingClientRect(), s = planet.getBoundingClientRect();
  W = r.width; H = r.height;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx = s.left - r.left + s.width / 2; cy = s.top - r.top + s.height / 2; R = s.width * 0.5;
}
addEventListener("resize", size);
setTimeout(size, 1300);
size();

function spawn() {
  const a = Math.random() * Math.PI * 2, d = Math.hypot(W, H) * 0.55;
  threats.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, v: 2.2 + Math.random() * 2, s: 3 + Math.random() * 3 });
}
function burst(x, y) {
  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 3.2;
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
  }
  countEl.textContent = ++blocked;
  planet.classList.remove("hit"); void planet.offsetWidth; planet.classList.add("hit");
}

function frame(t) {
  drawStars(t);
  ctx.clearRect(0, 0, W, H);
  if (t - last > 450 && threats.length < 14) { spawn(); last = t; }
  threats = threats.filter((p) => {
    const dx = cx - p.x, dy = cy - p.y, d = Math.hypot(dx, dy);
    if (d < R) { burst(p.x, p.y); return false; }
    const ux = dx / d, uy = dy / d;
    p.x += ux * p.v; p.y += uy * p.v;
    const g = ctx.createLinearGradient(p.x, p.y, p.x - ux * 50, p.y - uy * 50);
    g.addColorStop(0, "rgba(255,84,112,.95)"); g.addColorStop(1, "rgba(255,84,112,0)");
    ctx.strokeStyle = g; ctx.lineWidth = p.s * 0.7;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - ux * 50, p.y - uy * 50); ctx.stroke();
    ctx.shadowColor = "#FF5470"; ctx.shadowBlur = 14;
    ctx.fillStyle = "#FF5470"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill();
    ctx.shadowBlur = 0;
    return true;
  });
  sparks = sparks.filter((s) => {
    s.x += s.vx; s.y += s.vy; s.life -= 0.028;
    ctx.fillStyle = `rgba(62,231,255,${Math.max(s.life, 0)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, 7); ctx.fill();
    return s.life > 0;
  });
  requestAnimationFrame(frame);
}
if (reduce) { drawStars(0); countEl.textContent = "12"; } else requestAnimationFrame(frame);

$("#year").textContent = new Date().getFullYear();
