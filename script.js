// ==================== Navigation ====================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

// Toggle hamburger menu
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        updateActiveLink();
    });
});

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
});

// Update active nav link on scroll
window.addEventListener('scroll', updateActiveLink);

function updateActiveLink() {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}

// ==================== Smooth Scroll ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== Form Handling (Formspree AJAX) ====================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formStatus.textContent = '';
        formStatus.classList.remove('error');

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' }
            });

            if (response.ok) {
                formStatus.textContent = '✓ Message sent! I\'ll get back to you soon.';
                contactForm.reset();
            } else {
                formStatus.textContent = '✗ Something went wrong. Please try again.';
                formStatus.classList.add('error');
            }
        } catch (err) {
            formStatus.textContent = '✗ Network error. Please try again.';
            formStatus.classList.add('error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        }
    });
}

// ==================== Scroll Reveal Animations ====================
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay based on position
                const delay = entry.target.dataset.revealDelay || 0;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, delay);
            }
        });
    },
    {
        threshold: 0.08,
        rootMargin: '0px 0px -60px 0px'
    }
);

// Apply reveal animation to elements
function setupRevealAnimations() {
    const revealSelectors = [
        '.project-card',
        '.achievement-card',
        '.cert-item',
        '.skill-item',
        '.skill-category',
        '.contact-item',
        '.detail-item',
        '.about-text',
        '.about-image',
        '.section-title'
    ];

    revealSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)`;
            el.dataset.revealDelay = index * 80;
            revealObserver.observe(el);
        });
    });
}

setupRevealAnimations();

// ==================== Floating Particles ====================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles-canvas';
    document.body.prepend(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouseX = -1000, mouseY = -1000;
    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 140;
    const MOUSE_RADIUS = 180;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', debounce(resize, 200));

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.radius = Math.random() * 1.5 + 0.5;
            this.baseAlpha = Math.random() * 0.4 + 0.1;
            this.alpha = this.baseAlpha;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Mouse interaction - particles gently push away
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS) {
                const force = (1 - dist / MOUSE_RADIUS) * 0.02;
                this.vx += dx / dist * force;
                this.vy += dy / dist * force;
                this.alpha = Math.min(this.baseAlpha + 0.3, 0.7);
            } else {
                this.alpha += (this.baseAlpha - this.alpha) * 0.05;
            }

            // Dampen velocity
            this.vx *= 0.999;
            this.vy *= 0.999;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`;
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    document.addEventListener('pointermove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('pointerleave', () => {
        mouseX = -1000;
        mouseY = -1000;
    });
}

// ==================== Cursor Orb ====================
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const cursorOrb = document.createElement('div');
    cursorOrb.className = 'cursor-orb';
    document.body.appendChild(cursorOrb);

    let cursorX = window.innerWidth / 2;
    let cursorY = window.innerHeight / 2;
    let orbX = cursorX;
    let orbY = cursorY;

    document.addEventListener('pointermove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    const animateCursor = () => {
        orbX += (cursorX - orbX) * 0.12;
        orbY += (cursorY - orbY) * 0.12;
        cursorOrb.style.transform = `translate3d(${orbX}px, ${orbY}px, 0) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    };

    animateCursor();
}

// ==================== Magnetic Hover Effect on Cards ====================
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const magneticCards = document.querySelectorAll('.project-card, .achievement-card, .cert-item');

    magneticCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform = `translateY(-10px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ==================== Typewriter Effect ====================
function typewriterEffect() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const roles = [
        'Full-stack Web Developer',
        'React.js Enthusiast',
        'Problem Solver',
        'MERN Stack Developer'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let currentText = '';

    function type() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            currentText = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            currentText = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        subtitle.textContent = currentText;

        let speed = isDeleting ? 40 : 70;

        if (!isDeleting && charIndex === currentRole.length) {
            speed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            speed = 400;
        }

        setTimeout(type, speed);
    }

    // Start after initial animation
    setTimeout(type, 2000);
}

typewriterEffect();

// ==================== Keyboard Navigation ====================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// ==================== Utility Functions ====================
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// ==================== Scroll to Top Button ====================
const scrollToTopButton = document.createElement('button');
scrollToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
scrollToTopButton.classList.add('scroll-to-top');
scrollToTopButton.setAttribute('aria-label', 'Scroll to top');
scrollToTopButton.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    display: none;
    z-index: 999;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0;
    transform: translateY(20px);
`;

document.body.appendChild(scrollToTopButton);

window.addEventListener('scroll', throttle(() => {
    if (window.pageYOffset > 400) {
        scrollToTopButton.style.display = 'flex';
        scrollToTopButton.style.alignItems = 'center';
        scrollToTopButton.style.justifyContent = 'center';
        requestAnimationFrame(() => {
            scrollToTopButton.style.opacity = '1';
            scrollToTopButton.style.transform = 'translateY(0)';
        });
    } else {
        scrollToTopButton.style.opacity = '0';
        scrollToTopButton.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (window.pageYOffset <= 400) {
                scrollToTopButton.style.display = 'none';
            }
        }, 300);
    }
}, 100));

scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

scrollToTopButton.addEventListener('mouseenter', () => {
    scrollToTopButton.style.transform = 'translateY(-5px) scale(1.1)';
});

scrollToTopButton.addEventListener('mouseleave', () => {
    scrollToTopButton.style.transform = 'translateY(0) scale(1)';
});

// ==================== Skill Bar Animation on Scroll ====================
const skillBars = document.querySelectorAll('.skill-progress');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.style.width;
            bar.style.width = '0%';
            requestAnimationFrame(() => {
                bar.style.transition = 'width 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
                bar.style.width = width;
            });
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.3 });

skillBars.forEach(bar => skillObserver.observe(bar));

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    updateActiveLink();
});
