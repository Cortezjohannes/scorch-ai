// ============================================
// STORIES CAROUSEL FUNCTIONALITY
// ============================================

class StoriesCarousel {
    constructor() {
        this.slides = document.querySelectorAll('.carousel-slide');
        this.slidesContainer = document.getElementById('carouselSlides');
        this.prevBtn = document.getElementById('carouselPrev');
        this.nextBtn = document.getElementById('carouselNext');
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 4000; // 4 seconds
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        if (!this.slides.length) return;
        
        this.setupEventListeners();
        this.startAutoPlay();
        this.updateSlidePositions();
        
        // Respect reduced motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.stopAutoPlay();
        }
    }
    
    setupEventListeners() {
        // Navigation buttons
        this.prevBtn?.addEventListener('click', () => this.previousSlide());
        this.nextBtn?.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });
        
        // Touch/swipe support
        this.setupTouchEvents();
        
        // Pause on hover
        const carouselContainer = document.querySelector('.carousel-container');
        carouselContainer?.addEventListener('mouseenter', () => this.stopAutoPlay());
        carouselContainer?.addEventListener('mouseleave', () => this.startAutoPlay());
        
        // Pause on focus (accessibility)
        carouselContainer?.addEventListener('focusin', () => this.stopAutoPlay());
        carouselContainer?.addEventListener('focusout', () => this.startAutoPlay());
    }
    
    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        this.slidesContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        this.slidesContainer.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
        });
        
        this.slidesContainer.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Only trigger swipe if horizontal movement is greater than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        });
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.updateSlides();
    }
    
    previousSlide() {
        if (this.isTransitioning) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.updateSlides();
    }
    
    updateSlides() {
        this.isTransitioning = true;
        
        // Remove all classes from slides
        this.slides.forEach(slide => {
            slide.classList.remove('active', 'prev', 'next');
        });
        
        // Add appropriate classes for 3-card layout
        this.slides[this.currentIndex].classList.add('active');
        
        const prevIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        const nextIndex = (this.currentIndex + 1) % this.totalSlides;
        
        this.slides[prevIndex].classList.add('prev');
        this.slides[nextIndex].classList.add('next');
        
        // Update slide positions for 3-card layout
        this.updateSlidePositions();
        
        // Reset transition flag
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
    }
    
    updateSlidePositions() {
        // For absolute positioned slides, we don't need to transform the container
        // The CSS handles the positioning with absolute positioning
    }
    
    startAutoPlay() {
        this.stopAutoPlay(); // Clear any existing interval
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayDelay);
    }
    
    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
    
    // Public method to go to specific slide
    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides && !this.isTransitioning) {
            this.currentIndex = index;
            this.updateSlides();
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize stories carousel
    new StoriesCarousel();
    
    // Add intersection observer for carousel animations
    const carouselSection = document.querySelector('.stories-carousel-section');
    if (carouselSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    
                    // Trigger staggered animation for text elements
                    const textElements = entry.target.querySelectorAll('.stories-text > *');
                    textElements.forEach((element, index) => {
                        setTimeout(() => {
                            element.classList.add('animate');
                        }, index * 200);
                    });
                }
            });
        }, { threshold: 0.2 });
        
        observer.observe(carouselSection);
    }
});

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
        closeMobileMenu();
    }
});

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    const isOpen = mobileMenu.classList.contains('open');
    
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = 'auto'; // Restore scrolling
}

// Initialize mobile menu button
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // Toggle on button click
    mobileMenuBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMobileMenu();
    });
    
    // Close when clicking outside menu content
    mobileMenu?.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking any link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Delay close slightly for FAQ modal to open if it's the FAQ button
            setTimeout(() => {
                if (!link.textContent.includes('FAQ')) {
                    closeMobileMenu();
                }
            }, 100);
        });
    });
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
