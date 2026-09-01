document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const CONFIG = {
    weddingDate: '2026-12-12T09:00:00',
    whatsappNumber: '6281234567890',
    galleryCaptions: [
      'Prewedding — Moment I',
      'Prewedding — Moment II',
      'Prewedding — Moment III',
      'Prewedding — Moment IV',
      'Prewedding — Moment V'
    ]
  };

  const $ = (id) => document.getElementById(id);

  const opening = $('opening');
  const openInvitation = $('openInvitation');
  const mainContent = $('mainContent');
  const music = $('weddingMusic');
  const musicToggle = $('musicToggle');
  const guestName = $('guestName');
  const toast = $('toast');

  const params = new URLSearchParams(window.location.search);
  const guestText = (params.get('to') || 'Nama Tamu')
    .replace(/\+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Nama Tamu';

  guestName.textContent = guestText;

  let musicPlaying = false;
  let toastTimer;

  function setMusicState(isPlaying) {
    musicPlaying = isPlaying;
    musicToggle.classList.toggle('playing', isPlaying);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.setAttribute(
      'aria-label',
      isPlaying ? 'Matikan musik' : 'Putar musik'
    );
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  openInvitation.addEventListener('click', async () => {
    opening.classList.add('is-closing');
    mainContent.classList.add('is-open');
    mainContent.setAttribute('aria-hidden', 'false');
    document.body.classList.remove('locked');

    try {
      await music.play();
      setMusicState(true);
    } catch (error) {
      setMusicState(false);
    }

    setTimeout(() => {
      opening.style.display = 'none';
      opening.setAttribute('aria-hidden', 'true');
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 1800);
  });

  musicToggle.addEventListener('click', async () => {
    if (musicPlaying) {
      music.pause();
      setMusicState(false);
      return;
    }

    try {
      await music.play();
      setMusicState(true);
    } catch (error) {
      showToast('Tambahkan assets/music/wedding.mp3 terlebih dahulu.');
    }
  });

  const scrollProgressBar = document.getElementById('scrollProgressBar');

  function updateScrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    const clamped = Math.min(Math.max(progress, 0), 100);

    if (scrollProgressBar) {
      scrollProgressBar.style.width = `${clamped}%`;
    }
  }

  updateScrollProgress();
  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);

  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  revealElements.forEach((element, index) => {
    element.style.setProperty('--delay', `${Math.min(index * 0.16, 0.8)}s`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -5% 0px'
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  const desktopNav = $('desktopNav');
  const updateNav = () => {
    if (!desktopNav) return;
    desktopNav.classList.toggle('scrolled', window.scrollY > 50);
  };

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  const targetDate = new Date(CONFIG.weddingDate).getTime();
  const daysEl = $('days');
  const hoursEl = $('hours');
  const minutesEl = $('minutes');
  const secondsEl = $('seconds');

  const pad = (value) => String(value).padStart(2, '0');

  function updateCountdown() {
    let timeLeft = targetDate - Date.now();

    if (timeLeft <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(timeLeft / 86400000);
    timeLeft %= 86400000;

    const hours = Math.floor(timeLeft / 3600000);
    timeLeft %= 3600000;

    const minutes = Math.floor(timeLeft / 60000);
    timeLeft %= 60000;

    const seconds = Math.floor(timeLeft / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const lightbox = $('lightbox');
  const lightboxClose = $('lightboxClose');
  const lightboxImage = $('lightboxImage');
  const lightboxCaption = $('lightboxCaption');

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.addEventListener('click', () => {
      const index = Number(item.dataset.gallery);
      const galleryImage = item.style.getPropertyValue('--gallery-image') || '';

      lightboxImage.style.backgroundImage = galleryImage || 'none';
      lightboxImage.style.backgroundPosition = 'center';
      lightboxImage.style.backgroundSize = 'cover';
      lightboxImage.textContent = '';
      lightboxCaption.textContent = CONFIG.galleryCaptions[index] || 'Wedding Moment';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('locked');
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('locked');
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });

  const rsvpForm = $('rsvpForm');
  const wishes = $('wishes');

  const escapeHtml = (value) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  rsvpForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = $('rsvpName').value.trim();
    const attendance = $('rsvpAttendance').value;
    const guestCount = $('rsvpGuests').value;
    const message = $('rsvpMessage').value.trim();

    if (!name || !attendance) {
      showToast('Mohon lengkapi nama dan konfirmasi kehadiran.');
      return;
    }

    const wish = document.createElement('article');
    wish.className = 'wish';
    wish.innerHTML = `
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(attendance)} · ${escapeHtml(guestCount)} Orang</span>
      <p>${escapeHtml(message || 'Terima kasih atas doa dan perhatian Anda.')}</p>
    `;

    wishes.prepend(wish);
    rsvpForm.reset();
    showToast('Konfirmasi berhasil disimpan di browser.');
  });

  document.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copy;

      try {
        await navigator.clipboard.writeText(value);
        showToast('Nomor berhasil disalin.');
      } catch (error) {
        const helper = document.createElement('textarea');
        helper.value = value;
        document.body.appendChild(helper);
        helper.select();

        try {
          document.execCommand('copy');
          showToast('Nomor berhasil disalin.');
        } catch (copyError) {
          showToast(`Nomor: ${value}`);
        }

        helper.remove();
      }
    });
  });

  $('calendarBtn').addEventListener('click', () => {
    const calendarText = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Javanese Luxury Wedding//ID',
      'BEGIN:VEVENT',
      'UID:wedding-alfin-octa-2026@example.local',
      'DTSTAMP:20260831T000000Z',
      'DTSTART:20261212T090000',
      'DTEND:20261212T140000',
      'SUMMARY:The Wedding of Alfin & Octa',
      'LOCATION:Yogyakarta, Indonesia',
      'DESCRIPTION:Akad Nikah dan Resepsi Alfin & Octa',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([calendarText], {
      type: 'text/calendar;charset=utf-8'
    });

    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'wedding-alfin-octa.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    showToast('File kalender berhasil dibuat.');
  });

  const mobileLinks = [...document.querySelectorAll('.mobile-nav a')];
  const sections = ['home', 'couple', 'event', 'gallery', 'rsvp'].map((id) => $(id));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        mobileLinks.forEach((link) => link.classList.remove('active'));

        const activeLink = mobileLinks.find(
          (link) => link.getAttribute('href') === `#${entry.target.id}`
        );

        if (activeLink) {
          activeLink.classList.add('active');
        }
      });
    },
    {
      rootMargin: '-35% 0px -55% 0px'
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});
