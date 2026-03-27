/* =============================================
   js/main.js — Maxim Beauchemin Portfolio
   ============================================= */

// ---- NAV: scroll shadow + mobile toggle ----
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});


// ---- SCROLL ANIMATIONS ----
const animateOnScroll = (selector, options = {}) => {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = options.stagger
          ? Array.from(elements).indexOf(entry.target) * 110
          : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: options.threshold || 0.12 });

  elements.forEach(el => observer.observe(el));
};

animateOnScroll('[data-animate]',     { stagger: true });
animateOnScroll('.highlight-card',    { stagger: true, threshold: 0.1 });
animateOnScroll('.project-card',      { stagger: true, threshold: 0.1 });
animateOnScroll('.project-featured',  { threshold: 0.08 });


// ---- SKILL BARS (About page) ----
const skillSection = document.querySelector('.about-skills');
if (skillSection) {
  const skillObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.skill-fill').forEach(bar => bar.classList.add('animated'));
      skillObserver.disconnect();
    }
  }, { threshold: 0.2 });
  skillObserver.observe(skillSection);
}


// ---- CONTACT FORM (Formspree) ----
// How Formspree works:
//   The <form> in contact.html has action="https://formspree.io/f/YOUR_FORMSPREE_ID"
//   When submitted, the browser POSTs the form data to Formspree's server,
//   and Formspree emails it to you. No server-side code needed.
//
//   Setup steps:
//   1. Go to https://formspree.io and create a free account
//   2. Create a new form — set the email to ma2beauc@uwaterloo.ca
//   3. Copy the endpoint URL (e.g. https://formspree.io/f/xabcdefg)
//   4. In contact.html, replace YOUR_FORMSPREE_ID in the form's action attribute
//
//   The JS below intercepts the submit event to show a loading state
//   and a success/error message without redirecting the page.

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = document.getElementById('submitBtn');
  const formNote  = document.getElementById('formNote');

  // Client-side validation before sending
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = contactForm.name.value.trim();
    const email   = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      setNote('Please fill in your name, email, and message.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      setNote('Please enter a valid email address.', 'error');
      return;
    }

    // Check if Formspree has been set up
    const action = contactForm.getAttribute('action');
    if (action.includes('YOUR_FORMSPREE_ID')) {
      setNote('Form not yet connected — see the README for Formspree setup instructions.', 'error');
      return;
    }

    // Submit to Formspree
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const response = await fetch(action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        setNote('✓ Message sent! I\'ll get back to you soon.', 'success');
        contactForm.reset();
      } else {
        const data = await response.json();
        const msg = data.errors?.map(e => e.message).join(', ') || 'Something went wrong. Please try again.';
        setNote(msg, 'error');
      }
    } catch (err) {
      setNote('Could not send message. Please email me directly at ma2beauc@uwaterloo.ca', 'error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  });

  function setNote(msg, type) {
    formNote.textContent = msg;
    formNote.className   = 'form-note ' + type;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ---- SMOOTH ANCHOR SCROLL (#mte100 etc.) ----
document.querySelectorAll('a[href*="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    const hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;

    const targetId = href.slice(hashIndex + 1);
    const isSamePage = !href.includes('.html') || window.location.pathname.endsWith('projects.html');
    if (!isSamePage) return;

    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    }
  });
});

// GitHub
async function loadGitHubStats() {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/users/maximbeauc'),
      fetch('https://api.github.com/users/maximbeauc/repos?per_page=100')
    ]);
    const user  = await userRes.json();
    const repos = await reposRes.json();

    const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

    document.getElementById('gh-repos').textContent     = user.public_repos ?? '—';
    document.getElementById('gh-followers').textContent = user.followers    ?? '—';
    document.getElementById('gh-stars').textContent     = stars;
  } catch (e) {
    console.warn('GitHub stats unavailable', e);
  }
}

// LeetCode
async function loadLeetCodeStats() {
  try {
    const res  = await fetch('https://alfa-leetcode-api.onrender.com/Bestofmax07/solved');
    const data = await res.json();

    if (data.status === 'error') throw new Error(data.message);

    document.getElementById('lc-total').textContent  = data.easySolved + data.mediumSolved + data.hardSolved;
    document.getElementById('lc-easy').textContent   = data.easySolved;
    document.getElementById('lc-medium').textContent = data.mediumSolved;
    document.getElementById('lc-hard').textContent   = data.hardSolved;

    // Progress bar — proportional to total questions in each category
    const total = data.totalEasy + data.totalMedium + data.totalHard;
    document.getElementById('lc-bar-easy').style.width   = ((data.easySolved   / total) * 100) + '%';
    document.getElementById('lc-bar-medium').style.width = ((data.mediumSolved / total) * 100) + '%';
    document.getElementById('lc-bar-hard').style.width   = ((data.hardSolved   / total) * 100) + '%';

  } catch (e) {
    console.warn('LeetCode stats unavailable', e);
    // Silently fail — dashes stay in place
  }
}

loadGitHubStats();
loadLeetCodeStats();