// Smooth scrolling for internal links
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

// Enhanced scroll-based animations with staggered effects
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const staggeredAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Staggered animations for card grids
            if (entry.target.classList.contains('criteria-grid') || 
                entry.target.classList.contains('steps-grid') ||
                entry.target.classList.contains('comparison-grid')) {
                
                const cards = entry.target.querySelectorAll('.criteria-card, .step-card, .comparison-column');
                cards.forEach((card, index) => {
                    setTimeout(() => {
                        card.classList.add('animate');
                    }, index * 150);
                });
            }
        }
    });
}, observerOptions);

// Header scroll behavior
let lastScrollTop = 0;
const header = document.getElementById('main-header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});

// FAQ Modal Functions
function openFAQModal() {
    const modal = document.getElementById('faqModal');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeFAQModal() {
    const modal = document.getElementById('faqModal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeFAQModal();
    }
});

// Initialize all animations on load
document.addEventListener('DOMContentLoaded', () => {
    // Trigger hero animations
    setTimeout(() => {
        document.querySelector('.hero-logo').classList.add('animate');
        document.querySelector('.hero-headline').classList.add('animate');
        document.querySelector('.hero-subheadline').classList.add('animate');
        document.querySelector('.micro-copy').classList.add('animate');
    }, 500);
    
    // Observe section headlines
    const headlines = document.querySelectorAll('.section-headline');
    headlines.forEach(headline => {
        staggeredAnimationObserver.observe(headline);
    });
    
    // Observe parallax text elements
    const parallaxTexts = document.querySelectorAll('.parallax-text');
    parallaxTexts.forEach(text => {
        staggeredAnimationObserver.observe(text);
    });
    
    // Observe card containers for staggered animations
    const cardContainers = document.querySelectorAll('.criteria-grid, .steps-grid, .comparison-grid');
    cardContainers.forEach(container => {
        staggeredAnimationObserver.observe(container);
    });
    
    // Add magnetic cursor effect to CTA buttons
    const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
    ctaButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0px, 0px) scale(1)';
        });
    });
    
    // Add pulse effect to criteria numbers
    const criteriaNumbers = document.querySelectorAll('.criteria-number');
    criteriaNumbers.forEach((number, index) => {
        setTimeout(() => {
            number.style.animation = 'pulse 2s ease-in-out infinite';
        }, index * 200);
    });
});

// CTA Button interactions
document.querySelectorAll('.cta-primary, .cta-secondary').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Add click animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
        // Simulate form submission or redirect
        if (this.textContent.includes('Apply to the Producer Program')) {
            // Here you would integrate with your application form
            console.log('Redirecting to Producer Program application...');
            // window.location.href = '/apply';
            alert('Application form would open here. This is a demo version.');
        } else if (this.textContent.includes('Join the Development Slate')) {
            // Here you would integrate with your development slate signup
            console.log('Signing up for Development Slate...');
            // window.location.href = '/development-slate';
            alert('Development Slate signup would open here. This is a demo version.');
        }
    });
});

// Parallax effect for hero video
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    const videoBackground = document.querySelector('.video-background');
    
    if (videoBackground && scrolled < window.innerHeight) {
        videoBackground.style.transform = `translateY(${rate}px)`;
    }
});

// Enhanced glow effect on hover for CTA buttons
document.querySelectorAll('.glow-effect').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.boxShadow = `
            0 0 50px rgba(0, 255, 153, 0.8),
            0 0 100px rgba(0, 255, 153, 0.4),
            0 8px 25px rgba(0, 0, 0, 0.3)
        `;
    });
    
    button.addEventListener('mouseleave', function() {
        // Reset to original glow effect
        if (this.classList.contains('maximum-glow')) {
            this.style.boxShadow = `
                0 0 40px rgba(0, 255, 153, 0.6),
                0 0 80px rgba(0, 255, 153, 0.3),
                0 8px 25px rgba(0, 0, 0, 0.3)
            `;
        } else {
            this.style.boxShadow = `
                0 0 20px rgba(0, 255, 153, 0.3),
                0 4px 15px rgba(0, 0, 0, 0.2)
            `;
        }
    });
});

// Video autoplay fallback
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.video-background video');
    if (video) {
        // Ensure video plays on mobile devices where autoplay might be restricted
        const playVideo = () => {
            video.play().catch(error => {
                console.log('Video autoplay failed:', error);
                // Could add a fallback background image here
            });
        };
        
        // Try to play immediately
        playVideo();
        
        // Also try on first user interaction
        document.addEventListener('touchstart', playVideo, { once: true });
        document.addEventListener('click', playVideo, { once: true });
    }
});

// Add typing effect to hero headline
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Cursor trail effect
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    const trail = document.querySelector('body::before');
    if (trail) {
        trail.style.left = mouseX - 10 + 'px';
        trail.style.top = mouseY - 10 + 'px';
        trail.style.opacity = '1';
    }
});

// Enhanced section interactions
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        section.addEventListener('mouseenter', () => {
            // Add subtle glow effect to section on hover
            section.style.boxShadow = '0 0 100px rgba(0, 255, 153, 0.05)';
        });
        
        section.addEventListener('mouseleave', () => {
            section.style.boxShadow = 'none';
        });
    });
    
    // Add dynamic background animation based on scroll
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        const particles = document.querySelectorAll('.particle');
        
        // Parallax effect for particles
        particles.forEach((particle, index) => {
            const speed = (index + 1) * 0.1;
            particle.style.transform = `translateY(${scrollY * speed}px)`;
        });
        
        // Dynamic glow intensity based on scroll
        const geometricShapes = document.querySelectorAll('.geometric-shape');
        const glowIntensity = Math.min(scrollY / 1000, 0.3);
        geometricShapes.forEach(shape => {
            shape.style.borderColor = `rgba(0, 255, 153, ${0.1 + glowIntensity})`;
        });
    });
    
    // Add click ripple effect
    document.addEventListener('click', (e) => {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = e.clientX - 25 + 'px';
        ripple.style.top = e.clientY - 25 + 'px';
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(0, 255, 153, 0.3)';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '10000';
        ripple.style.animation = 'ripple 0.6s ease-out forwards';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Ripple animation keyframe (add via CSS)
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
