const canvas = document.getElementById('galaxy-canvas');
const ctx = canvas.getContext('2d');

let W, H, cx, cy;
let stars = [], nebulaClouds = [], shootingStars = [];
let rotation = 0;
let animId;
let mouseX = null, mouseY = null;

const params = {
    starCount: 900,
    speed: 3,
    arms: 4,
    nebula: 50
};

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    cx = W / 2;
    cy = H / 2;
    initGalaxy();
}

function randRange(a, b) { return a + Math.random() * (b - a); }
function lerp(a, b, t) { return a + (b - a) * t; }

const armColors = [
    ['#7b6cf6','#c4b5fd','#e0d9ff'],
    ['#38bdf8','#7dd3fc','#bae6fd'],
    ['#f472b6','#f9a8d4','#fce7f3'],
    ['#34d399','#6ee7b7','#d1fae5'],
    ['#fb923c','#fdba74','#fed7aa'],
    ['#a78bfa','#c4b5fd','#ddd6fe'],
    ['#f87171','#fca5a5','#fee2e2'],
    ['#4ade80','#86efac','#dcfce7'],
];

function lerp_color(a, b, t) {
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const r = Math.round(lerp((pa>>16)&255, (pb>>16)&255, t));
    const g = Math.round(lerp((pa>>8)&255, (pb>>8)&255, t));
    const bl = Math.round(lerp(pa&255, pb&255, t));
    return `rgb(${r},${g},${bl})`;
}

function makeStar() {
    const arm = Math.floor(Math.random() * params.arms);
    const dist = Math.pow(Math.random(), 0.55) * (Math.min(W, H) * 0.46);
    const baseAngle = (arm / params.arms) * Math.PI * 2;
    const spread = randRange(-0.3, 0.3) + (dist / (Math.min(W, H) * 0.46)) * randRange(-0.6, 0.6);
    const angle = baseAngle + dist * 0.0065 + spread;
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist * 0.52;
    const colors = armColors[arm % armColors.length];
    const t = Math.random();
    const col = t < 0.5 ? lerp_color(colors[0], colors[1], t*2) : lerp_color(colors[1], colors[2], (t-0.5)*2);
    const size = randRange(0.4, dist < 60 ? 3.2 : 1.8);
    const brightness = randRange(0.5, 1.0);
    const twinklePeriod = randRange(1200, 5000);
    const twinkleOffset = Math.random() * twinklePeriod;
    return { x, y, size, col, brightness, arm, dist, angle, twinklePeriod, twinkleOffset };
}

function makeNebula() {
    const arm = Math.floor(Math.random() * params.arms);
    const dist = randRange(30, Math.min(W, H) * 0.44);
    const baseAngle = (arm / params.arms) * Math.PI * 2;
    const angle = baseAngle + dist * 0.0065 + randRange(-0.5, 0.5);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist * 0.52;
    const colors = armColors[arm % armColors.length];
    const r = randRange(30, 90);
    const opacity = randRange(0.03, 0.09) * (params.nebula / 50);
    return { x, y, r, color: colors[0], opacity };
}

function makeShootingStar() {
    const startX = randRange(0, W);
    const startY = randRange(0, H * 0.4);
    const angle = randRange(20, 50) * Math.PI / 180;
    const speed = randRange(8, 18);
    const length = randRange(60, 180);
    return { x: startX, y: startY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, length, life: 1, decay: randRange(0.012, 0.025) };
}

function initGalaxy() {
    stars = Array.from({length: params.starCount}, makeStar);
    nebulaClouds = Array.from({length: 28}, makeNebula);
    shootingStars = [];
}

const bgStars = Array.from({length: 220}, () => ({
    x: Math.random() * 2000, y: Math.random() * 2000,
    r: Math.random() * 0.8 + 0.1,
    a: Math.random()
}));

function drawGalaxyFrame(ts) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, W, H);

    bgStars.forEach(s => {
        const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(ts / 1800 + s.x));
        ctx.beginPath();
        ctx.arc(s.x % W, s.y % H, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(200,220,255,${twinkle * 0.5})`;
        ctx.fill();
    });

    const speedFactor = params.speed * 0.00008;
    rotation += speedFactor;

    ctx.save();
    ctx.translate(cx, cy);

    const nebulaOpacityFactor = params.nebula / 50;
    nebulaClouds.forEach(n => {
        const nx = n.x - cx;
        const ny = n.y - cy;
        const cos = Math.cos(rotation); const sin = Math.sin(rotation);
        const rx = nx * cos - ny * sin;
        const ry = nx * sin + ny * cos;
        const grad = ctx.createRadialGradient(rx, ry * 0.52, 0, rx, ry * 0.52, n.r);
        grad.addColorStop(0, n.color + 'cc');
        grad.addColorStop(1, 'transparent');
        ctx.globalAlpha = n.opacity * nebulaOpacityFactor;
        ctx.beginPath();
        ctx.ellipse(rx, ry * 0.52, n.r, n.r * 0.52, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 65);
    coreGrad.addColorStop(0, 'rgba(255,240,200,0.95)');
    coreGrad.addColorStop(0.15, 'rgba(255,200,120,0.6)');
    coreGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.ellipse(0, 0, 65, 38, 0, 0, Math.PI*2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    stars.forEach(s => {
        const cos = Math.cos(rotation); const sin = Math.sin(rotation);
        const ox = s.x - cx; const oy = s.y - cy;
        const rx = ox * cos - oy * sin;
        const ry = (ox * sin + oy * cos) * 0.52;

        const twinkle = 0.55 + 0.45 * Math.sin((ts + s.twinkleOffset) / s.twinklePeriod * Math.PI * 2);
        const alpha = s.brightness * twinkle;

        ctx.beginPath();
        ctx.arc(rx, ry, s.size, 0, Math.PI*2);
        ctx.fillStyle = s.col.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    });

    ctx.restore();

    if (Math.random() < 0.004) shootingStars.push(makeShootingStar());
    shootingStars = shootingStars.filter(s => s.life > 0);
    shootingStars.forEach(s => {
        const tailX = s.x - s.vx * (s.length / (s.vx || 1));
        const tailY = s.y - s.vy * (s.length / (s.vy || 1));
        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(255,255,255,${s.life * 0.9})`);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= s.decay;
    });

    requestAnimationFrame(drawGalaxyFrame);
}

resize();
window.addEventListener('resize', resize);
requestAnimationFrame(drawGalaxyFrame);
