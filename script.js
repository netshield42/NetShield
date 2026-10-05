// Live demo: a stream of web requests, some allowed, some blocked.
const requests = [
  ["daily-news.example", true],
  ["ads.tracker-net.example", false],
  ["recipes.example", true],
  ["pixel.adserve.example", false],
  ["free-prizes-win.example", false],
  ["school-portal.example", true],
  ["analytics.spyscript.example", false],
  ["weather.example", true],
  ["login-verify-account.example", false],
  ["library.example", true],
  ["popup.bannerzone.example", false],
  ["maps.example", true]
];

const feed = document.getElementById("feed");
const countEl = document.getElementById("count");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let blocked = 0;
let i = 0;

function addRow() {
  const [domain, ok] = requests[i % requests.length];
  i++;

  const row = document.createElement("li");
  row.className = "row" + (ok ? "" : " blocked");
  row.innerHTML = `<span></span><span class="tag">${ok ? "Allowed" : "Blocked"}</span>`;
  row.firstChild.textContent = domain;
  feed.appendChild(row);

  while (feed.children.length > 6) feed.removeChild(feed.firstChild);

  if (!ok) {
    blocked++;
    countEl.textContent = blocked;
    countEl.classList.remove("bump");
    void countEl.offsetWidth; // restart the animation
    countEl.classList.add("bump");
  }
}

if (reduceMotion) {
  for (let n = 0; n < 6; n++) addRow();
} else {
  addRow();
  setInterval(addRow, 1100);
}

// Draw the line between the setup steps when they scroll into view.
const steps = document.querySelector(".steps");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        steps.classList.add("in");
        io.disconnect();
      }
    });
  }, { threshold: 0.4 });
  io.observe(steps);
} else {
  steps.classList.add("in");
}

document.getElementById("year").textContent = new Date().getFullYear();
