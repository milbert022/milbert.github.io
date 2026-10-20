/**
 * MILBERT PORTFOLIO - MAIN INTERACTION SCRIPT
 * Depth HUD Telemetry, Navigation, Filter Engines, Modals & Form Handlers
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. PROJECT DATA ARCHIVE
  // =========================================================================
  const projectDatabase = {
    leviathan: {
      title: "Project Leviathan: Ocean Telemetry Platform",
      code: "EXPEDITION 01 // LEVIATHAN",
      status: "PRODUCTION LIVE",
      depth: "5,200m (Abyssal Trench)",
      category: "Full-Stack Architecture",
      summary: "A real-time oceanographic dashboard built for researchers and sub-surface vessels, aggregating environmental sensors, tidal metrics, and seismic acoustic waves with ultra-low latency.",
      achievements: [
        "Processes 15,000+ incoming WebSocket telemetry packets per second with <12ms server latency.",
        "Built dynamic bathymetric contour rendering using Canvas2D and WebGL layers.",
        "Engineered an automated alert pipeline notifying crews of barometric anomalies.",
        "99.98% uptime achieved across 18 consecutive months in operational deployment."
      ],
      techStack: ["Next.js 14", "TypeScript", "Node.js", "PostgreSQL", "WebSockets", "Docker", "Tailwind CSS"],
      liveDemoUrl: "#contact",
      sourceUrl: "#contact"
    },
    thalassa: {
      title: "Thalassa Core: 3D Abyssal Ecosystem",
      code: "EXPEDITION 02 // THALASSA",
      status: "WEBGL 60 FPS",
      depth: "6,800m (Hadopelagic Zone)",
      category: "3D & Creative Engineering",
      summary: "An interactive browser-based simulation reconstructing deep-sea marine biology, caustic lighting physics, and fluid particle swarming using procedural WebGL shaders and audio synthesis.",
      achievements: [
        "Simulates 3,000+ bioluminescent autonomous organisms navigating with boid flocking algorithms.",
        "Custom GLSL fragment shaders rendering volumetric underwater god rays and water turbulence.",
        "Integrated Web Audio API soundscape reactive to proximity with sea entities.",
        "Optimized draw calls to sustain a locked 60 FPS on both desktop and mobile GPU targets."
      ],
      techStack: ["Three.js", "WebGL", "GLSL Shaders", "Web Audio API", "Vite", "Canvas"],
      liveDemoUrl: "#contact",
      sourceUrl: "#contact"
    },
    abyssos: {
      title: "AbyssOS: Glassmorphic Cloud Platform",
      code: "EXPEDITION 03 // ABYSSOS",
      status: "ENTERPRISE READY",
      depth: "4,600m (Abyssal Plain)",
      category: "Cloud Infrastructure",
      summary: "A dark-mode cloud infrastructure management console designed for complex server topologies, container deployments, and real-time observability.",
      achievements: [
        "Granular Role-Based Access Control (RBAC) with cryptographic JWT session validation.",
        "Asynchronous task workers managed via FastAPI and Redis for real-time log ingestion.",
        "Comprehensive dark-mode UI with high contrast accessibility standards (WCAG AAA).",
        "Reduces infrastructure debugging time by 35% through consolidated metric overlays."
      ],
      techStack: ["React", "FastAPI", "Python", "Docker", "Redis", "Tailwind CSS"],
      liveDemoUrl: "#contact",
      sourceUrl: "#contact"
    },
    biolumina: {
      title: "Biolumina: Neon Ocean Design Tokens",
      code: "EXPEDITION 04 // BIOLUMINA",
      status: "OPEN SOURCE",
      depth: "3,800m (Midnight Rim)",
      category: "UI/UX & Design Systems",
      summary: "A comprehensive open-source design system and React component framework inspired by oceanic bioluminescence, built for developer tools and dark-first applications.",
      achievements: [
        "Features 40+ production-ready accessible components built on Radix UI primitives.",
        "Automated design token pipeline syncing Figma variables directly to CSS custom properties.",
        "Full keyboard navigation and screen-reader accessibility validated across all major browsers.",
        "Downloaded over 10,000+ times by developers worldwide for dark-themed web projects."
      ],
      techStack: ["Figma Tokens", "CSS Custom Properties", "Radix UI", "Storybook", "TypeScript"],
      liveDemoUrl: "#contact",
      sourceUrl: "#contact"
    }
  };

  // =========================================================================
  // 2. BATHYMETRIC DEPTH HUD TELEMETRY
  // =========================================================================
  const hudDepthVal = document.getElementById('hud-depth-value');
  const hudZoneName = document.getElementById('hud-zone-name');
  const hudGaugeFill = document.getElementById('hud-gauge-fill');
  const hudGaugePin = document.getElementById('hud-gauge-pin');
  const hudPressureVal = document.getElementById('hud-pressure-value');
  const hudTempVal = document.getElementById('hud-temp-value');
  const mobileDepthCounter = document.getElementById('mobile-depth-counter');
  const timelineProgressLine = document.getElementById('timeline-progress-line');

  const depthZones = [
    { max: 200, name: "SUNLIGHT ZONE", tempStart: 28.0, tempEnd: 15.0 },
    { max: 1000, name: "TWILIGHT ZONE", tempStart: 15.0, tempEnd: 4.0 },
    { max: 4000, name: "MIDNIGHT ZONE", tempStart: 4.0, tempEnd: 2.2 },
    { max: 6000, name: "THE ABYSS", tempStart: 2.2, tempEnd: 1.8 },
    { max: 11000, name: "CHALLENGER DEEP", tempStart: 1.8, tempEnd: 1.1 }
  ];

  function updateDepthTelemetry() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY;
    const scrollFraction = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

    // Simulated depth in meters (0 to 11,000m)
    const currentDepth = Math.round(scrollFraction * 11000);
    const pressureAtm = (1 + (currentDepth / 10)).toFixed(1);

    // Determine current oceanographic zone & temperature
    let zoneName = "SUNLIGHT ZONE";
    let currentTemp = "28.0";

    for (let zone of depthZones) {
      if (currentDepth <= zone.max) {
        zoneName = zone.name;
        // Interpolate temperature
        const prevMax = zone.max === 200 ? 0 : (depthZones[depthZones.indexOf(zone) - 1]?.max || 0);
        const zoneProgress = (currentDepth - prevMax) / (zone.max - prevMax);
        const temp = zone.tempStart - zoneProgress * (zone.tempStart - zone.tempEnd);
        currentTemp = temp.toFixed(1);
        break;
      }
    }

    // Update HUD text
    if (hudDepthVal) hudDepthVal.textContent = currentDepth.toLocaleString();
    if (mobileDepthCounter) mobileDepthCounter.textContent = currentDepth.toLocaleString();
    if (hudZoneName) hudZoneName.textContent = zoneName;
    if (hudPressureVal) hudPressureVal.textContent = `${pressureAtm} atm`;
    if (hudTempVal) hudTempVal.textContent = `${currentTemp} °C`;

    // Update Gauge Fill & Submersible Pin
    const gaugePercent = (scrollFraction * 100).toFixed(1);
    if (hudGaugeFill) hudGaugeFill.style.height = `${gaugePercent}%`;
    if (hudGaugePin) hudGaugePin.style.top = `${gaugePercent}%`;

    // Update central cable glow line in the timeline
    if (timelineProgressLine) {
      const journeySection = document.getElementById('journey');
      if (journeySection) {
        const rect = journeySection.getBoundingClientRect();
        const winHeight = window.innerHeight;
        if (rect.top < winHeight && rect.bottom > 0) {
          const visibleProgress = Math.min(Math.max((winHeight - rect.top) / (rect.height + winHeight * 0.5), 0), 1);
          timelineProgressLine.style.height = `${(visibleProgress * 100).toFixed(1)}%`;
        }
      }
    }
  }

  window.addEventListener('scroll', updateDepthTelemetry, { passive: true });
  updateDepthTelemetry();

  // Quick Ascent Button in HUD
  const hudAscentBtn = document.getElementById('hud-ascent-btn');
  if (hudAscentBtn) {
    hudAscentBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.oceanAudio) window.oceanAudio.playSonarPing(1400, 1.5);
    });
  }

  // =========================================================================
  // 3. FLASHLIGHT BEAM CURSOR TRACKING
  // =========================================================================
  const flashlightBeam = document.getElementById('flashlight-beam');
  if (flashlightBeam) {
    window.addEventListener('mousemove', (e) => {
      flashlightBeam.style.left = `${e.clientX}px`;
      flashlightBeam.style.top = `${e.clientY}px`;
    });
  }

  // =========================================================================
  // 4. AUDIO TOGGLE & SOUND FX
  // =========================================================================
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioStatusText = document.getElementById('audio-status');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (!window.oceanAudio) return;
      const isPlaying = window.oceanAudio.toggleAmbient();

      if (isPlaying) {
        audioToggleBtn.classList.add('playing');
        if (audioStatusText) audioStatusText.textContent = "SONAR ON";
      } else {
        audioToggleBtn.classList.remove('playing');
        if (audioStatusText) audioStatusText.textContent = "SONAR OFF";
      }
    });
  }

  // Attach Sonar Ping to Interactive Clickable Elements
  document.querySelectorAll('.sound-click, .nav-link, .btn, .skill-card, .filter-tab, .proj-filter-btn').forEach(elem => {
    elem.addEventListener('click', () => {
      if (window.oceanAudio) {
        window.oceanAudio.playSonarPing(920 + Math.random() * 200, 0.4);
      }
    });
  });

  // =========================================================================
  // 5. NAVIGATION & MOBILE DRAWER
  // =========================================================================
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active Link Highlight using Intersection Observer
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('data-nav') === id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => navObserver.observe(sec));

  // =========================================================================
  // 6. ABOUT ME INTERACTIVE CARDS
  // =========================================================================
  const bioCards = document.querySelectorAll('.bio-interactive-card');
  bioCards.forEach(card => {
    card.addEventListener('click', () => {
      bioCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      if (window.oceanAudio) window.oceanAudio.playSonarPing(800, 0.3);
    });
  });

  // =========================================================================
  // 7. SKILLS FILTER & TELEMETRY MODAL
  // =========================================================================
  const skillTabs = document.querySelectorAll('.filter-tab');
  const skillCards = document.querySelectorAll('.skill-card');
  const skillModal = document.getElementById('skill-modal');
  const modalSkillTitle = document.getElementById('modal-skill-title');
  const modalSkillPercent = document.getElementById('modal-skill-percent');
  const modalSkillDesc = document.getElementById('modal-skill-description');

  // Filter skills
  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filterVal = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterVal === 'all' || category === filterVal) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Skill Card Click -> Open Detail Modal
  skillCards.forEach(card => {
    card.addEventListener('click', () => {
      const name = card.getAttribute('data-skill-name');
      const percent = card.getAttribute('data-percent');
      const desc = card.getAttribute('data-desc');

      if (modalSkillTitle) modalSkillTitle.textContent = name;
      if (modalSkillPercent) modalSkillPercent.textContent = `${percent}%`;
      if (modalSkillDesc) modalSkillDesc.textContent = desc;

      if (skillModal) {
        skillModal.classList.add('open');
        skillModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  // Close Skill Modal
  if (skillModal) {
    const closeBtn = skillModal.querySelector('.modal-close');
    const backdrop = skillModal.querySelector('.modal-backdrop');

    const closeModal = () => {
      skillModal.classList.remove('open');
      skillModal.setAttribute('aria-hidden', 'true');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
  }

  // =========================================================================
  // 8. PROJECTS FILTER & DEEP-DIVE MODAL
  // =========================================================================
  const projFilterBtns = document.querySelectorAll('.proj-filter-btn');
  const projectArticles = document.querySelectorAll('.project-card');
  const projectModal = document.getElementById('project-modal');
  const modalProjectBody = document.getElementById('modal-project-body');

  // Filter Projects
  projFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      projFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      projectArticles.forEach(art => {
        const cat = art.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          art.style.display = 'flex';
        } else {
          art.style.display = 'none';
        }
      });
    });
  });

  // Project Open Modal
  document.querySelectorAll('[data-project-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const projId = btn.getAttribute('data-project-open');
      openProjectModal(projId);
    });
  });

  function openProjectModal(projKey) {
    const proj = projectDatabase[projKey];
    if (!proj || !modalProjectBody) return;

    modalProjectBody.innerHTML = `
      <div class="modal-header">
        <span class="modal-radar-pill">${proj.code}</span>
        <h3 class="modal-title">${proj.title}</h3>
        <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--glow-cyan); margin-top: 0.25rem;">
          DISCIPLINE: ${proj.category} • RECORDED DEPTH: ${proj.depth}
        </div>
      </div>

      <div class="modal-body" style="margin-top: 1.5rem;">
        <p style="font-size: 1.05rem; line-height: 1.7; color: var(--text-mist); margin-bottom: 1.5rem;">
          ${proj.summary}
        </p>

        <h4 style="font-family: var(--font-heading); font-size: 1.05rem; color: #fff; margin-bottom: 0.75rem;">
          Key Mission Accomplishments:
        </h4>
        <ul style="list-style: none; margin-bottom: 1.75rem; display: flex; flex-direction: column; gap: 0.6rem;">
          ${proj.achievements.map(ach => `
            <li style="display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.95rem; color: var(--text-muted);">
              <span style="color: var(--glow-cyan); margin-top: 0.2rem;">▸</span>
              <span>${ach}</span>
            </li>
          `).join('')}
        </ul>

        <div style="margin-bottom: 2rem;">
          <span class="tags-label">MISSION TECH STACK:</span>
          <div class="modal-tags">
            ${proj.techStack.map(t => `<span class="badge-tag">${t}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="#contact" class="btn btn-primary" onclick="document.getElementById('project-modal').classList.remove('open')">
            <span>Inquire About Source Architecture</span>
          </a>
          <button class="btn btn-secondary" onclick="document.getElementById('project-modal').classList.remove('open')">
            <span>Close Dossier</span>
          </button>
        </div>
      </div>
    `;

    if (projectModal) {
      projectModal.classList.add('open');
      projectModal.setAttribute('aria-hidden', 'false');
    }
  }

  // Close Project Modal
  if (projectModal) {
    const closeBtn = projectModal.querySelector('.modal-close');
    const backdrop = projectModal.querySelector('.modal-backdrop');

    const closeProjModal = () => {
      projectModal.classList.remove('open');
      projectModal.setAttribute('aria-hidden', 'true');
    };

    if (closeBtn) closeBtn.addEventListener('click', closeProjModal);
    if (backdrop) backdrop.addEventListener('click', closeProjModal);
  }

  // =========================================================================
  // 9. SONAR CONTACT TRANSMISSION FORM
  // =========================================================================
  const sonarForm = document.getElementById('sonar-contact-form');
  const transmitBtn = document.getElementById('transmit-btn');
  const transmitBtnText = document.getElementById('transmit-btn-text');
  const formToast = document.getElementById('form-toast');

  if (sonarForm) {
    sonarForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !subject || !message) {
        alert("Please complete all transmission parameters before broadcasting.");
        return;
      }

      // Transmission simulated loading state
      if (transmitBtn && transmitBtnText) {
        transmitBtn.disabled = true;
        transmitBtnText.textContent = "Transmitting Hydro-Acoustic Wave...";
      }

      if (window.oceanAudio) {
        window.oceanAudio.playSonarPing(1100, 0.8);
      }

      setTimeout(() => {
        if (transmitBtn && transmitBtnText) {
          transmitBtn.disabled = false;
          transmitBtnText.textContent = "Transmit Sonar Dispatch";
        }

        if (formToast) {
          formToast.classList.add('active');
          if (window.oceanAudio) window.oceanAudio.playSonarPing(1500, 1.2);
          
          setTimeout(() => {
            formToast.classList.remove('active');
          }, 6000);
        }

        sonarForm.reset();
      }, 1400);
    });
  }

  // Dynamic Year in Footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
