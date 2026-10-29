// --- Config ---
const STORAGE_KEY = 'birthday_config';

let config = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  name: 'Friend',
  birthday: getTodayString() // defaults to today so timer starts immediately
};

// --- Init ---
document.getElementById('name-input').value = config.name;
document.getElementById('birthday-input').value = config.birthday;
applyConfig();
startConfetti();

document.getElementById('apply-btn').addEventListener('click', () => {
  const name = document.getElementById('name-input').value.trim() || 'Friend';
  const birthday = document.getElementById('birthday-input').value;
  config = { name, birthday };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  applyConfig();
});

function applyConfig() {
  document.getElementById('name').textContent = config.name;
  document.getElementById('current-date').textContent = formatDate(new Date());
  updateCountdown();
}

// --- Date helpers ---
function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// --- Countdown ---
function updateCountdown() {
  clearInterval(window._countdownInterval);
  window._countdownInterval = setInterval(tick, 1000);
  tick();
}

function tick() {
  const sub = document.getElementById('countdown-sub');

  if (!config.birthday) {
    sub.textContent = 'Set a birthday date below!';
    return;
  }

  const now = new Date();
  const [year, month, day] = config.birthday.split('-').map(Number);

  // Birthday at midnight this year
  const birthdayThisYear = new Date(now.getFullYear(), month - 1, day, 0, 0, 0);

  // Check if today is the birthday
  const isBirthday =
    now.getMonth() === month - 1 &&
    now.getDate() === day;

  if (isBirthday) {
    // Count up from midnight
    const midnight = new Date(now.getFullYear(), month - 1, day, 0, 0, 0);
    const elapsed = Math.floor((now - midnight) / 1000);
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    setDisplay(h, m, s);
    sub.textContent = `🎉 Happy Birthday, ${config.name}! You've been celebrating for ${elapsed} seconds!`;
  } else {
    // Count down to next birthday
    let next = new Date(now.getFullYear(), month - 1, day, 0, 0, 0);
    if (next <= now) next.setFullYear(now.getFullYear() + 1);

    const diff = Math.floor((next - now) / 1000);
    const days = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    // Show days in sub, hours/min/sec in timer
    setDisplay(h, m, s);
    sub.textContent = days === 0
      ? `Tomorrow is the big day! 🎈`
      : `${days} day${days !== 1 ? 's' : ''} until the big day! 🎈`;

    // Relabel to "countdown" context
    document.querySelector('.countdown-label').textContent = '⏳ Countdown to the Big Day';
  }
}

function setDisplay(h, m, s) {
  document.getElementById('hours').textContent = String(h).padStart(2, '0');
  document.getElementById('minutes').textContent = String(m).padStart(2, '0');
  document.getElementById('seconds').textContent = String(s).padStart(2, '0');
}

// --- Confetti ---
function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  const pieces = [];
  const colors = ['#d94f1e','#ff7a45','#ffcba4','#ffe5d0','#fff','#ffd700','#ff69b4'];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 80; i++) {
    pieces.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      r: Math.random() * 7 + 4,
      d: Math.random() * 80 + 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      speed: Math.random() * 1.5 + 0.5,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    });
  }

  let angle = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    angle += 0.01;

    for (const p of pieces) {
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.translate(p.x + p.tilt, p.y);
      ctx.rotate((p.tiltAngle * Math.PI) / 180);

      if (p.shape === 'circle') {
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      } else {
        ctx.rect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      }

      ctx.fill();
      ctx.restore();

      p.y += p.speed;
      p.tiltAngle += p.tiltSpeed;
      p.x += Math.sin(angle + p.d) * 0.8;

      if (p.y > canvas.height + 10) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}


// --- Background Audio ---
const audio = document.getElementById('birthday-audio');
const musicBtn = document.getElementById('music-btn');
const musicIcon = document.getElementById('music-icon');
const musicLabel = document.getElementById('music-label');
let audioStarted = false;

function startAudio() {
  if (!audio.src || audio.src === window.location.href) return;
  audio.volume = 0.5;
  audio.play().then(() => { setPlaying(true); audioStarted = true; }).catch(() => {});
}

function setPlaying(playing) {
  if (playing) {
    musicBtn.classList.add('playing');
    musicIcon.className = 'fa-solid fa-pause';
    musicLabel.textContent = 'Playing';
  } else {
    musicBtn.classList.remove('playing');
    musicIcon.className = 'fa-solid fa-music';
    musicLabel.textContent = 'Paused';
  }
}

// Try autoplay on load
window.addEventListener('load', () => {
  audio.play().then(() => { setPlaying(true); audioStarted = true; }).catch(() => {
    musicLabel.textContent = 'Tap to play';
  });
});

// First-interaction fallback (browser blocked autoplay)
function onFirstInteraction(e) {
  // Don't interfere if the music button itself triggered this
  if (e.target.closest('#music-btn')) return;
  if (!audioStarted) startAudio();
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('keydown', onFirstInteraction);
}
document.addEventListener('click', onFirstInteraction);
document.addEventListener('keydown', onFirstInteraction);

// Toggle button
musicBtn.addEventListener('click', () => {
  if (!audio.src || audio.src === window.location.href) return;
  // Remove the first-interaction listener so it doesn't fight the toggle
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('keydown', onFirstInteraction);
  audioStarted = true;

  if (audio.paused) {
    audio.play().then(() => setPlaying(true)).catch(() => {});
  } else {
    audio.pause();
    setPlaying(false);
  }
});
