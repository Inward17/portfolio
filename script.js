// System Check for Reduced Motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.innerWidth < 768;

// --- Custom Cursor ---
if (!isMobile && !prefersReducedMotion) {
  const cursorDot = document.getElementById('cursor-dot');
  const cursorTrail = document.getElementById('cursor-trail');
  
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  }, { capture: true });

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
              num.innerText = target;
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
    const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    
    const pad = (n) => n.toString().padStart(2, '0');
    const yyyy = istTime.getFullYear();
    const mm = pad(istTime.getMonth() + 1);
    const dd = pad(istTime.getDate());
    const hh = pad(istTime.getHours());
    const min = pad(istTime.getMinutes());
    const ss = pad(istTime.getSeconds());
    
    timeDisplay.innerText = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss} IST`;
  }
}
setInterval(updateLocalTime, 1000);
updateLocalTime();

// --- 2D Radar Chart ---

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

function initD3NetworkGraph() {
  const container = document.getElementById('network-2d-container');
  if(!container) return;

  // Clear existing
  container.innerHTML = '';

  const width = container.clientWidth;
  const height = container.clientHeight;

  const techs = [
    { id: 'react', label: 'React', icon: 'fa-brands fa-react' },
    { id: 'next', label: 'Next.js', icon: 'fa-brands fa-node-js' },
    { id: 'js', label: 'JavaScript', icon: 'fa-brands fa-js' },
    { id: 'python', label: 'Python', icon: 'fa-brands fa-python' },
    { id: 'fastapi', label: 'FastAPI', icon: 'fa-solid fa-bolt' },
    { id: 'node', label: 'Node.js', icon: 'fa-brands fa-node' },
    { id: 'db', label: 'PostgreSQL', icon: 'fa-solid fa-database' },
    { id: 'mongo', label: 'MongoDB', icon: 'fa-solid fa-leaf' },
    { id: 'gcp', label: 'GCP', icon: 'fa-brands fa-google' },
    { id: 'aws', label: 'AWS', icon: 'fa-brands fa-aws' },
    { id: 'docker', label: 'Docker', icon: 'fa-brands fa-docker' },
    { id: 'three', label: 'Three.js', icon: 'fa-solid fa-cube' }
  ];

  const connections = [
    { source: 'react', target: 'next' }, { source: 'react', target: 'js' }, { source: 'next', target: 'js' }, { source: 'next', target: 'node' },
    { source: 'js', target: 'node' }, { source: 'node', target: 'mongo' }, { source: 'python', target: 'fastapi' }, { source: 'fastapi', target: 'db' },
    { source: 'fastapi', target: 'docker' }, { source: 'node', target: 'docker' }, { source: 'gcp', target: 'docker' }, { source: 'aws', target: 'docker' },
    { source: 'js', target: 'three' }, { source: 'react', target: 'three' }
  ];

  // Create SVG layer for lines
  const svg = d3.select(container)
    .append("svg")
    .attr("class", "network-svg-layer")
    .attr("width", width)
    .attr("height", height);

  // Initialize force simulation
  const simulation = d3.forceSimulation(techs)
    .force("link", d3.forceLink(connections).id(d => d.id).distance(120))
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide().radius(50));

  // Draw lines
  const link = svg.append("g")
    .selectAll("path")
    .data(connections)
    .join("path")
    .attr("class", "network-path")
    .attr("data-source", d => d.source.id)
    .attr("data-target", d => d.target.id);

  // Draw HTML nodes
  const nodeDivs = d3.select(container)
    .selectAll(".network-node")
    .data(techs)
    .join("div")
    .attr("class", "network-node")
    .html(d => `<i class="${d.icon}"></i> <span>${d.label}</span>`)
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

  // Hover effects
  nodeDivs.on('mouseenter', (event, d) => {
    link.classed('active', l => l.source.id === d.id || l.target.id === d.id);
  });
  nodeDivs.on('mouseleave', () => {
    link.classed('active', false);
  });

  // Tick function to update positions
  simulation.on("tick", () => {
    link.attr("d", d => {
      // Simple Bezier curve
      const dx = Math.abs(d.target.x - d.source.x);
      const dy = Math.abs(d.target.y - d.source.y);
      const cx = (d.source.x + d.target.x) / 2 + (dy * 0.1); 
      const cy = (d.source.y + d.target.y) / 2 - (dx * 0.1);
      return `M ${d.source.x} ${d.source.y} Q ${cx} ${cy} ${d.target.x} ${d.target.y}`;
    });

    nodeDivs
      .style("left", d => `${d.x}px`)
      .style("top", d => `${d.y}px`);
  });

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

// Initialize
if(document.getElementById('radar-2d-container')) {
  draw2DRadarChart();
  initD3NetworkGraph();

  // Redraw on resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      draw2DRadarChart();
      initD3NetworkGraph();
    }, 200);
  });
}

// --- Contact Form Handler ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    if (!name || !email || !message) return;
    
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    
    window.location.href = `mailto:kotkarsarthak2004@gmail.com?subject=${subject}&body=${body}`;
    
    // Visual feedback
    const btn = contactForm.querySelector('button');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Email Client Opened!';
    btn.style.borderColor = 'var(--cyan)';
    btn.style.color = 'var(--cyan)';
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.borderColor = '';
      btn.style.color = '';
      contactForm.reset();
    }, 3000);
  });
}
