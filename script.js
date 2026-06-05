// ===== KONFIGURASI =====
const CONFIG = {
  recipientName: "Rara",
  music: {
    title: "drop dead",
    artist: "olivia rodrigo",
    spotifyUrl: "https://open.spotify.com/track/0HAqq2tQHqEueOGGdj4V2r",
    audioFile: "lagu.mp3"
  }
};

// ===== STATE =====
let currentPage = 0;
const totalPages = 7;
let isEnvelopeOpen = false;
let isMusicPlaying = false;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initEnvelope();
  initNavigation();
  initMusic();
  initSwipe();
  updatePageDisplay();
});

// ===== PARTICLES =====
function initParticles() {
  const container = document.getElementById('particles');
  const particleCount = 25;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    particle.style.width = (Math.random() * 3 + 1) + 'px';
    particle.style.height = particle.style.width;
    container.appendChild(particle);
  }
}

// ===== ENVELOPE =====
function initEnvelope() {
  const envelope = document.getElementById('envelope');

  envelope.addEventListener('click', openEnvelope);

  setTimeout(() => {
    if (!isEnvelopeOpen) {
      envelope.style.transform = 'translateY(-5px)';
      setTimeout(() => {
        if (!isEnvelopeOpen) envelope.style.transform = '';
      }, 300);
    }
  }, 2000);
}

function openEnvelope() {
  if (isEnvelopeOpen) return;
  isEnvelopeOpen = true;

  const envelope = document.getElementById('envelope');
  const letter = document.getElementById('letter');

  envelope.classList.add('opening');
  playPaperSound();

  setTimeout(() => {
    envelope.style.display = 'none';
    letter.classList.add('visible');

    setTimeout(() => {
      toggleMusic();
    }, 1000);

  }, 700);
}

function playPaperSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 0.3;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.05 * Math.exp(-i / (bufferSize * 0.3));
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    source.connect(filter);
    filter.connect(audioContext.destination);
    source.start();
  } catch (e) {}
}

// ===== NAVIGATION =====
function initNavigation() {
  const dotsContainer = document.getElementById('pageDots');

  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.onclick = () => goToPage(i);
    dotsContainer.appendChild(dot);
  }

  document.addEventListener('keydown', (e) => {
    if (!isEnvelopeOpen) return;

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      goToPage(currentPage + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPage(currentPage - 1);
    }
  });
}

function goToPage(page) {
  if (page < 0 || page >= totalPages) return;
  if (!isEnvelopeOpen && page > 0) return;

  const pages = document.querySelectorAll('.page');
  const dots = document.querySelectorAll('.dot');

  pages.forEach((p, i) => {
    p.classList.remove('active', 'prev');
    if (i === page) {
      p.classList.add('active');
    } else if (i < page) {
      p.classList.add('prev');
    }
  });

  dots.forEach((d, i) => {
    d.classList.toggle('active', i === page);
  });

  currentPage = page;
  updatePageDisplay();
}

function updatePageDisplay() {
  const currentEl = document.getElementById('currentPage');
  const totalEl = document.getElementById('totalPages');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (currentEl) currentEl.textContent = currentPage + 1;
  if (totalEl) totalEl.textContent = totalPages;

  if (prevBtn) {
    prevBtn.disabled = currentPage === 0;
    prevBtn.style.opacity = currentPage === 0 ? '0.3' : '1';
  }
  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages - 1;
    nextBtn.style.opacity = currentPage === totalPages - 1 ? '0.3' : '1';
  }
}

// ===== SWIPE =====
function initSwipe() {
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;

    const diffY = Math.abs(touchEndY - touchStartY);
    const diffX = touchStartX - touchEndX;

    if (diffY < 100 && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        goToPage(currentPage + 1);
      } else {
        goToPage(currentPage - 1);
      }
    }
  }, { passive: true });
}

// ===== MUSIC =====
function initMusic() {
  const audio = document.getElementById('bgMusic');
  if (CONFIG.music.audioFile) {
    audio.querySelector('source').src = CONFIG.music.audioFile;
    audio.load();
  }
}

function toggleMusic() {
  const audio = document.getElementById('bgMusic');
  const icon = document.getElementById('musicIcon');

  if (!audio) return;

  if (isMusicPlaying) {
    audio.pause();
    icon.textContent = '🎵';
    isMusicPlaying = false;
  } else {
    audio.play().then(() => {
      icon.textContent = '⏸';
      isMusicPlaying = true;
    }).catch(() => {
      icon.textContent = '🎵';
      window.open(CONFIG.music.spotifyUrl, '_blank');
    });
  }
}

// ===== UTILITY =====
function updateRecipientName(name) {
  CONFIG.recipientName = name;
  const display = document.getElementById('recipientDisplay');
  if (display) display.textContent = name;
  document.querySelectorAll('.highlight-name').forEach(el => {
    el.textContent = name;
  });
}

window.goToPage = goToPage;
window.toggleMusic = toggleMusic;
window.updateRecipientName = updateRecipientName;
