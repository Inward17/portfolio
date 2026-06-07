// System Check for Reduced Motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 768;

// --- Custom Cursor ---
if (!isMobile && !prefersReducedMotion) {
  const cursorDot = document.getElementById('cursor-dot');
  const cursorTrail = document.getElementById('cursor-trail');
  
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  function animateCursor() {
    // Smooth trailing
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top = trailY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Interactive hover states
  const interactables = document.querySelectorAll('a, button, input, textarea');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => cursorTrail.classList.add('active'));
    el.addEventListener('mouseleave', () => cursorTrail.classList.remove('active'));
  });
}

// --- Navbar & Scroll Progress ---
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  // Navbar blur
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Progress bar
  const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (winScroll / height) * 100;
  scrollProgress.style.width = scrolled + '%';
});

// --- Typewriter Effect ---
const phrases = ["Computer Engineering Student", "Full-Stack Developer", "AI Systems Engineer"];
let phraseIndex = 0;
let letterIndex = 0;
let isDeleting = false;
const typewriterElement = document.getElementById('typewriter');

function type() {
  if(prefersReducedMotion) {
    typewriterElement.textContent = "Full-Stack Developer";
    return;
  }
  const currentPhrase = phrases[phraseIndex];
  
  if (isDeleting) {
    typewriterElement.textContent = currentPhrase.substring(0, letterIndex - 1);
    letterIndex--;
  } else {
    typewriterElement.textContent = currentPhrase.substring(0, letterIndex + 1);
    letterIndex++;
  }

  let typeSpeed = isDeleting ? 50 : 100;

  if (!isDeleting && letterIndex === currentPhrase.length) {
    typeSpeed = 2000; // Pause at end
    isDeleting = true;
  } else if (isDeleting && letterIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    typeSpeed = 500; // Pause before next word
  }

  setTimeout(type, typeSpeed);
}
type();

// --- Intersection Observer for Scroll Animations ---
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      
      // Trigger skill bars
      const skillFills = entry.target.querySelectorAll('.skill-progress-fill');
      skillFills.forEach(fill => {
        if(!prefersReducedMotion) fill.style.width = fill.getAttribute('data-width');
      });

      // Trigger stats counter
      if (entry.target.id === 'stats' && !prefersReducedMotion) {
        const numbers = entry.target.querySelectorAll('.stat-number');
        numbers.forEach(num => {
          const target = parseInt(num.getAttribute('data-target'));
          let count = 0;
          const speed = target / 40; // Adjust speed
          
          function updateCount() {
            count += speed;
            if (count < target) {
              num.innerText = Math.ceil(count);
              requestAnimationFrame(updateCount);
            } else {
              num.innerText = target + (target > 20 ? '+' : '');
            }
          }
          updateCount();
        });
      }
      
      scrollObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.animate-on-scroll, #stats').forEach(el => {
  // Set staggered delays for cascade effect on projects
  if(el.classList.contains('cascade-1')) el.style.transitionDelay = '0s';
  if(el.classList.contains('cascade-2')) el.style.transitionDelay = '0.2s';
  if(el.classList.contains('cascade-3')) el.style.transitionDelay = '0.4s';
  scrollObserver.observe(el);
});

// --- 3D Card Hover Effect ---
if (!isMobile && !prefersReducedMotion) {
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// --- Local Time Update for CC Header ---
function updateLocalTime() {
  const timeDisplay = document.getElementById('cc-time-display');
  if(timeDisplay) {
    const now = new Date();
    // format like 2024-06-14 16:43:33 UTC
    const iso = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    timeDisplay.innerText = iso;
  }
}
setInterval(updateLocalTime, 1000);
updateLocalTime();

// // --- 2D Implementations ---
// We use simple SVG generation for the Radar Chart and HTML nodes + SVG paths for the Network Graph.

function draw2DRadarChart() {
  const container = document.getElementById('radar-2d-container');
  if(!container) return;
  
  // Stats: Architecture, Development, Database, Security, DevOps
  const stats = [0.8, 0.95, 0.85, 0.7, 0.8];
  const labels = ["Arch", "Dev", "DB", "Sec", "Ops"];
  const segments = 5;
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;

  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  
  // Draw outer pentagon grids
  for (let level = 1; level <= 4; level++) {
    const r = radius * (level / 4);
    let points = "";
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2 - (Math.PI / 2);
      const x = center + Math.cos(angle) * r;
      const y = center + Math.sin(angle) * r;
      points += `${x},${y} `;
    }
    svg += `<polygon points="${points.trim()}" fill="none" stroke="rgba(139, 92, 246, 0.3)" stroke-width="1" />`;
  }

  // Draw axes
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2 - (Math.PI / 2);
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(139, 92, 246, 0.3)" stroke-width="1" />`;
    
    // Labels
    const lx = center + Math.cos(angle) * (radius + 20);
    const ly = center + Math.sin(angle) * (radius + 20);
    svg += `<text x="${lx}" y="${ly}" fill="var(--cyan)" font-family="var(--font-code)" font-size="12" text-anchor="middle" dominant-baseline="middle">${labels[i]}</text>`;
  }

  // Draw stats polygon
  let statPoints = "";
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2 - (Math.PI / 2);
    const r = radius * stats[i];
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    statPoints += `${x},${y} `;
  }
  svg += `<polygon points="${statPoints.trim()}" fill="rgba(0, 245, 255, 0.3)" stroke="var(--cyan)" stroke-width="2" />`;
  
  // Inner glowing dots
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2 - (Math.PI / 2);
    const r = radius * stats[i];
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    svg += `<circle cx="${x}" cy="${y}" r="4" fill="var(--cyan)" />`;
  }

  svg += `</svg>`;
  container.innerHTML = svg;
}

function draw2DNetworkGraph() {
  const container = document.getElementById('network-2d-container');
  if(!container) return;

  // Clear existing
  container.innerHTML = '';

  const width = container.clientWidth;
  const height = container.clientHeight;

  const techs = [
    { id: 'react', label: 'React', icon: 'fa-brands fa-react', px: 0.15, py: 0.2 },
    { id: 'next', label: 'Next.js', icon: 'fa-brands fa-node-js', px: 0.3, py: 0.1 },
    { id: 'js', label: 'JavaScript', icon: 'fa-brands fa-js', px: 0.35, py: 0.4 },
    { id: 'python', label: 'Python', icon: 'fa-brands fa-python', px: 0.85, py: 0.3 },
    { id: 'fastapi', label: 'FastAPI', icon: 'fa-solid fa-bolt', px: 0.7, py: 0.15 },
    { id: 'node', label: 'Node.js', icon: 'fa-brands fa-node', px: 0.6, py: 0.5 },
    { id: 'db', label: 'PostgreSQL', icon: 'fa-solid fa-database', px: 0.8, py: 0.7 },
    { id: 'mongo', label: 'MongoDB', icon: 'fa-solid fa-leaf', px: 0.65, py: 0.85 },
    { id: 'gcp', label: 'GCP', icon: 'fa-brands fa-google', px: 0.3, py: 0.75 },
    { id: 'aws', label: 'AWS', icon: 'fa-brands fa-aws', px: 0.15, py: 0.6 },
    { id: 'docker', label: 'Docker', icon: 'fa-brands fa-docker', px: 0.45, py: 0.85 },
    { id: 'three', label: 'Three.js', icon: 'fa-solid fa-cube', px: 0.5, py: 0.2 }
  ];

  const connections = [
    ['react', 'next'], ['react', 'js'], ['next', 'js'], ['next', 'node'],
    ['js', 'node'], ['node', 'mongo'], ['python', 'fastapi'], ['fastapi', 'db'],
    ['fastapi', 'docker'], ['node', 'docker'], ['gcp', 'docker'], ['aws', 'docker'],
    ['js', 'three'], ['react', 'three']
  ];

  // Map to pixel coordinates
  const nodes = techs.map(t => {
    return {
      ...t,
      x: t.px * width,
      y: t.py * height
    };
  });

  // Create SVG layer for lines
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "network-svg-layer");
  container.appendChild(svg);

  // Draw lines
  const paths = [];
  connections.forEach(conn => {
    const n1 = nodes.find(n => n.id === conn[0]);
    const n2 = nodes.find(n => n.id === conn[1]);
    if (n1 && n2) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      
      // Simple Bezier curve
      const dx = Math.abs(n2.x - n1.x);
      const dy = Math.abs(n2.y - n1.y);
      const cx = (n1.x + n2.x) / 2 + (dy * 0.2); // slight bend
      const cy = (n1.y + n2.y) / 2 - (dx * 0.2);

      const d = `M ${n1.x} ${n1.y} Q ${cx} ${cy} ${n2.x} ${n2.y}`;
      path.setAttribute("d", d);
      path.setAttribute("class", "network-path");
      path.dataset.source = n1.id;
      path.dataset.target = n2.id;
      svg.appendChild(path);
      paths.push(path);
    }
  });

  // Draw HTML nodes
  nodes.forEach(n => {
    const div = document.createElement('div');
    div.className = 'network-node';
    div.style.left = `${n.x}px`;
    div.style.top = `${n.y}px`;
    div.innerHTML = `<i class="${n.icon}"></i> <span>${n.label}</span>`;
    
    // Hover effects
    div.addEventListener('mouseenter', () => {
      paths.forEach(p => {
        if (p.dataset.source === n.id || p.dataset.target === n.id) {
          p.classList.add('active');
        }
      });
    });
    div.addEventListener('mouseleave', () => {
      paths.forEach(p => p.classList.remove('active'));
    });

    container.appendChild(div);
  });
}

// Initialize
if(document.getElementById('radar-2d-container')) {
  draw2DRadarChart();
  draw2DNetworkGraph();

  // Redraw on resize
  window.addEventListener('resize', () => {
    draw2DRadarChart();
    draw2DNetworkGraph();
  });
}
