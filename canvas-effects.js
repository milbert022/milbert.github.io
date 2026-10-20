/**
 * MILBERT UNDERWATER CANVAS SYSTEM
 * Renders:
 * 1. Swaying Caustic Light Rays (God Rays from ocean surface)
 * 2. Drifting Bioluminescent Plankton with cursor interaction
 * 3. Interactive Floating Bubbles (clickable & poppable with audio chirp)
 * 4. Micro-bubble burst particle physics
 */

class UnderwaterCanvasSystem {
  constructor() {
    this.canvas = document.getElementById('abyss-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.mouse = {
      x: -1000,
      y: -1000,
      radius: 120
    };

    this.particles = [];
    this.bubbles = [];
    this.bursts = [];
    this.causticTime = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Track mouse position
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    // Interactive Bubble Pop & Spawn on Click
    window.addEventListener('click', (e) => {
      this.handleClick(e.clientX, e.clientY);
    });

    // Touch support for mobile devices
    window.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.handleClick(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    // Spawn initial entities
    this.createParticles(65);
    this.createBubbles(22);

    // Start 60 FPS loop
    requestAnimationFrame((t) => this.render(t));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  // 1. Bioluminescent Plankton
  createParticles(count) {
    this.particles = [];
    const colors = [
      { r: 0, g: 242, b: 254 },  // Cyan
      { r: 5, g: 213, b: 176 },  // Emerald
      { r: 79, g: 172, b: 254 }, // Teal
      { r: 139, g: 92, b: 246 }  // Deep Violet
    ];

    for (let i = 0; i < count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.2 + 0.8,
        color: color,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.1, // slow upward drift
        alpha: Math.random() * 0.7 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  // 2. Underwater Bubbles
  createBubbles(count) {
    this.bubbles = [];
    for (let i = 0; i < count; i++) {
      this.bubbles.push(this.newBubble(true));
    }
  }

  newBubble(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + Math.random() * 80,
      radius: Math.random() * 9 + 4,
      vy: Math.random() * 1.2 + 0.7, // rising velocity
      wobbleSpeed: Math.random() * 0.04 + 0.02,
      wobbleAmp: Math.random() * 2.5 + 1.2,
      wobbleOffset: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.4 + 0.35,
      popped: false
    };
  }

  // Click handler to pop bubbles or create bubble splash
  handleClick(clickX, clickY) {
    let poppedAny = false;

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      const dist = Math.hypot(b.x - clickX, b.y - clickY);

      if (dist < b.radius + 20) {
        // Pop this bubble!
        this.spawnBurst(b.x, b.y, b.radius);
        this.bubbles.splice(i, 1);
        this.bubbles.push(this.newBubble(false));
        poppedAny = true;
        if (window.oceanAudio) {
          window.oceanAudio.playBubblePop(600);
        }
        break;
      }
    }

    // If user clicked elsewhere, spawn 3 tiny bubbles floating up from click point
    if (!poppedAny) {
      for (let j = 0; j < 3; j++) {
        this.bubbles.push({
          x: clickX + (Math.random() * 20 - 10),
          y: clickY + (Math.random() * 10),
          radius: Math.random() * 5 + 3,
          vy: Math.random() * 1.5 + 1.0,
          wobbleSpeed: 0.05,
          wobbleAmp: 2,
          wobbleOffset: Math.random() * Math.PI * 2,
          alpha: 0.6,
          popped: false
        });
      }
      if (window.oceanAudio) {
        window.oceanAudio.playBubblePop(450);
      }
    }
  }

  // Micro-bubble burst physics on popping
  spawnBurst(x, y, radius) {
    const burstCount = Math.floor(radius * 1.5);
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1;
      this.bursts.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 2 + 1,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  // Draw Light Rays (Caustics)
  drawLightRays() {
    this.causticTime += 0.008;
    const rayCount = 5;
    const ctx = this.ctx;

    for (let i = 0; i < rayCount; i++) {
      const offset = i * (this.width / (rayCount - 1));
      const sway = Math.sin(this.causticTime + i * 1.3) * 60;
      const topX = offset + sway;
      const bottomX = topX + Math.sin(this.causticTime * 0.8 + i) * 160;

      const grad = ctx.createLinearGradient(topX, 0, bottomX, this.height * 0.7);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.07)');
      grad.addColorStop(0.3, 'rgba(0, 229, 255, 0.03)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(topX - 35, 0);
      ctx.lineTo(topX + 35, 0);
      ctx.lineTo(bottomX + 110, this.height * 0.7);
      ctx.lineTo(bottomX - 110, this.height * 0.7);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
  }

  // Render Loop
  render(time) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Underwater God Rays
    this.drawLightRays();

    // 2. Update & Draw Bioluminescent Plankton
    for (let p of this.particles) {
      // Periodic pulse
      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(time * 0.002 * p.pulseSpeed * 100 + p.pulseOffset));

      // Cursor repel/attract physics
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < this.mouse.radius && dist > 0) {
        const force = (this.mouse.radius - dist) / this.mouse.radius;
        p.x -= (dx / dist) * force * 2.5;
        p.y -= (dy / dist) * force * 2.5;
      }

      // Movement
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around bounds
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      // Render glowing dot
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentAlpha})`;
      ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.8)`;
      ctx.shadowBlur = p.radius * 4;
      ctx.fill();
      ctx.restore();
    }

    // 3. Update & Draw Bubbles
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];
      b.y -= b.vy;
      const wobble = Math.sin(time * 0.003 * b.wobbleSpeed * 60 + b.wobbleOffset) * b.wobbleAmp;
      const drawX = b.x + wobble;

      // If reached top, reset to bottom
      if (b.y < -30) {
        this.bubbles[i] = this.newBubble(false);
        continue;
      }

      ctx.save();
      // Outer bubble rim
      ctx.beginPath();
      ctx.arc(drawX, b.y, b.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 242, 254, ${b.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.fillStyle = `rgba(0, 242, 254, ${b.alpha * 0.15})`;
      ctx.fill();
      ctx.stroke();

      // Specular highlight on upper-left inside bubble
      ctx.beginPath();
      ctx.arc(drawX - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 0.85})`;
      ctx.fill();

      ctx.restore();
    }

    // 4. Update & Draw Burst Micro-particles
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const burst = this.bursts[i];
      burst.x += burst.vx;
      burst.y += burst.vy;
      burst.vx *= 0.95;
      burst.vy *= 0.95;
      burst.life -= burst.decay;

      if (burst.life <= 0) {
        this.bursts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.radius * burst.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 242, 254, ${burst.life * 0.8})`;
      ctx.fill();
      ctx.restore();
    }

    requestAnimationFrame((t) => this.render(t));
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new UnderwaterCanvasSystem();
});
