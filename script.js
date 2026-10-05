const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Nav background after scrolling
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 30), { passive: true });

// Soft glow that follows the cursor
addEventListener("pointermove", (e) => {
  document.body.style.setProperty("--gx", e.clientX + "px");
  document.body.style.setProperty("--gy", e.clientY + "px");
});

// Duplicate the marquee so it loops seamlessly
const track = $(".track");
track.innerHTML += track.innerHTML;

// Scroll reveals, step line and count-up numbers
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target.matches(".stats > div")) countUp($("[data-to]", e.target));
    if (e.target.matches(".steps li")) $(".steps").classList.add("in");
    io.unobserve(e.target);
  });
}, { threshold: 0.25 });
$$(".rv").forEach((el) => io.observe(el));

function countUp(el) {
  const to = +el.dataset.to;
  if (reduce || to === 0) return (el.textContent = to);
  const t0 = performance.now();
  (function tick(t) {
    const p = Math.min((t - t0) / 1400, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

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

// Hero: threats fly in and burst against the shield
const cv = $("#fx"), ctx = cv.getContext("2d");
const shield = $("#shield"), countEl = $("#count");
let W, H, cx, cy, R, threats = [], sparks = [], blocked = 0, last = 0;

function size() {
  const dpr = devicePixelRatio || 1, r = cv.getBoundingClientRect(), s = shield.getBoundingClientRect();
  W = r.width; H = r.height;
  cv.width = W * dpr; cv.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx = s.left - r.left + s.width / 2; cy = s.top - r.top + s.height / 2; R = s.width * 0.42;
}
addEventListener("resize", size);
setTimeout(size, 1200);
size();

function spawn() {
  const a = Math.random() * Math.PI * 2, d = Math.hypot(W, H) * 0.55;
  threats.push({ x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, v: 2 + Math.random() * 1.8, s: 3 + Math.random() * 3 });
}

function burst(x, y) {
  for (let i = 0; i < 16; i++) {
    const a = Math.random() * Math.PI * 2, v = 1 + Math.random() * 3;
    sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 });
  }
  blocked++;
  countEl.textContent = blocked;
  shield.classList.remove("hit"); void shield.offsetWidth; shield.classList.add("hit");
}

function frame(t) {
  ctx.clearRect(0, 0, W, H);
  if (t - last > 450 && threats.length < 14) { spawn(); last = t; }
  threats = threats.filter((p) => {
    const dx = cx - p.x, dy = cy - p.y, d = Math.hypot(dx, dy);
    if (d < R) { burst(p.x, p.y); return false; }
    p.x += (dx / d) * p.v; p.y += (dy / d) * p.v;
    const g = ctx.createLinearGradient(p.x, p.y, p.x - (dx / d) * 40, p.y - (dy / d) * 40);
    g.addColorStop(0, "rgba(255,77,106,.9)"); g.addColorStop(1, "rgba(255,77,106,0)");
    ctx.strokeStyle = g; ctx.lineWidth = p.s * 0.6;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - (dx / d) * 40, p.y - (dy / d) * 40); ctx.stroke();
    ctx.fillStyle = "#FF4D6A"; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill();
    return true;
  });
  sparks = sparks.filter((s) => {
    s.x += s.vx; s.y += s.vy; s.life -= 0.03;
    ctx.fillStyle = `rgba(34,227,195,${Math.max(s.life, 0)})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, 7); ctx.fill();
    return s.life > 0;
  });
  requestAnimationFrame(frame);
}
if (reduce) countEl.textContent = "12"; else requestAnimationFrame(frame);

$("#year").textContent = new Date().getFullYear();
