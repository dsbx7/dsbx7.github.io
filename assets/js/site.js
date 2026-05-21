const header = document.querySelector("[data-page-header]");
const canvas = document.querySelector("[data-schedule-canvas]");
const ctx = canvas.getContext("2d");

const colors = ["#0e9f9b", "#2563eb", "#c58a1e", "#cf4a3c", "#2f855a"];
const lanes = 9;
let width = 0;
let height = 0;
let ratio = 1;
let jobs = [];

function resizeCanvas() {
  ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  if (width === 0 || height === 0) {
    return;
  }
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  buildJobs();
}

function buildJobs() {
  jobs = [];
  const laneHeight = height / (lanes + 2);
  for (let lane = 0; lane < lanes; lane += 1) {
    for (let i = 0; i < 9; i += 1) {
      const base = (i * 210 + lane * 47) % Math.max(width, 1);
      const duration = 70 + ((i * 23 + lane * 17) % 110);
      jobs.push({
        x: base - width * 0.25,
        y: laneHeight * (lane + 1.45),
        w: duration,
        h: Math.max(12, laneHeight * 0.34),
        speed: 0.22 + ((lane + i) % 4) * 0.045,
        color: colors[(lane + i) % colors.length],
        alpha: 0.45 + ((lane + i) % 3) * 0.13,
      });
    }
  }
}

function drawGrid(time) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#101820";
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#f7f4ef";
  ctx.lineWidth = 1;
  const gapX = 86;
  const offset = (time * 0.018) % gapX;
  for (let x = -gapX + offset; x < width + gapX; x += gapX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  const laneHeight = height / (lanes + 2);
  for (let lane = 0; lane < lanes; lane += 1) {
    const y = laneHeight * (lane + 1.65);
    ctx.globalAlpha = 0.24;
    ctx.beginPath();
    ctx.moveTo(width * 0.42, y);
    ctx.lineTo(width + 40, y);
    ctx.stroke();

    ctx.globalAlpha = 0.58;
    ctx.fillStyle = "#f7f4ef";
    ctx.font = "700 12px JetBrains Mono, monospace";
    ctx.fillText(`M${String(lane + 1).padStart(2, "0")}`, width * 0.42 + 8, y - 10);
  }
  ctx.globalAlpha = 1;
}

function drawJobs(time) {
  for (const job of jobs) {
    let x = job.x + time * job.speed;
    const cycle = width + 360;
    x = ((x % cycle) + cycle) % cycle - 220;
    if (x < width * 0.38) continue;

    ctx.globalAlpha = job.alpha;
    ctx.fillStyle = job.color;
    ctx.fillRect(x, job.y, job.w, job.h);

    ctx.globalAlpha = 0.82;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + job.w - 6, job.y, 6, job.h);
  }
  ctx.globalAlpha = 1;
}

function drawEvents(time) {
  const laneHeight = height / (lanes + 2);
  for (let i = 0; i < 18; i += 1) {
    const x = width * 0.42 + ((time * 0.15 + i * 137) % (width * 0.7));
    const y = laneHeight * (((i * 5) % lanes) + 1.62);
    const radius = 3 + ((i + Math.floor(time / 120)) % 3);
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function animate(time) {
  if (width === 0 || height === 0) {
    requestAnimationFrame(animate);
    return;
  }
  drawGrid(time);
  drawJobs(time);
  drawEvents(time);
  requestAnimationFrame(animate);
}

function updateHeader() {
  if (window.scrollY > 30) {
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", updateHeader, { passive: true });
resizeCanvas();
updateHeader();
requestAnimationFrame(animate);
