class ShowroomManager {
    constructor() {
        this.initializeAnimations();
        this.initializeImageGallery();
        this.initializeScrollAnimations();
        this.initializeLazyLoading();
        this.initializeInteractiveElements();
    }

    //advanced animations for various sections
    initializeAnimations() {
        //GSAP or Web Animations API for smooth, professional animations
        this.animateHeroSection();
        this.animateFeaturedWorkspaces();
        this.animateRealHomes();
        this.animateSeries();
    }

    animateHeroSection() {
        const heroImage = document.querySelector('.showroom-hero-image');
        const heroText = document.querySelector('.showroom-hero-section h1');
        const heroSubtext = document.querySelector('.showroom-hero-section p');

        //staggered entrance animation
        gsap.fromTo(heroImage, 
            { opacity: 0, y: 50 }, 
            { 
                opacity: 1, 
                y: 0, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: heroImage,
                    start: "top 80%"
                }
            }
        );

        gsap.fromTo([heroText, heroSubtext], 
            { opacity: 0, x: -50 }, 
            { 
                opacity: 1, 
                x: 0, 
                stagger: 0.3,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: heroText,
                    start: "top 80%"
                }
            }
        );
    }

    animateFeaturedWorkspaces() {
        const workspaceCards = document.querySelectorAll('.workspace-card');
        workspaceCards.forEach((card, index) => {
            gsap.fromTo(card, 
                { opacity: 0, scale: 0.8 }, 
                { 
                    opacity: 1, 
                    scale: 1, 
                    duration: 0.8,
                    delay: index * 0.2,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 80%"
                    }
                }
            );
        });
    }

    animateRealHomes() {
        const homesContainer = document.querySelector('.homes-container');
        gsap.fromTo(homesContainer, 
            { opacity: 0, y: 50 }, 
            { 
                opacity: 1, 
                y: 0, 
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: homesContainer,
                    start: "top 80%"
                }
            }
        );
    }

    animateSeries() {
        const seriesColumns = document.querySelectorAll('.series-column');
        seriesColumns.forEach((column, index) => {
            gsap.fromTo(column, 
                { opacity: 0, x: -50 }, 
                { 
                    opacity: 1, 
                    x: 0, 
                    duration: 0.8,
                    delay: index * 0.3,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: column,
                        start: "top 80%"
                    }
                }
            );
        });
    }

    //scroll-triggered animations
    initializeScrollAnimations() {
        //use ScrollTrigger for revealing elements
        ScrollTrigger.batch('.fade-in', {
            onEnter: batch => gsap.fromTo(batch, 
                { opacity: 0, y: 50 }, 
                { opacity: 1, y: 0, stagger: 0.15, duration: 0.8 }
            ),
            start: "top 90%"
        });
    }

    //enhanced image gallery with smooth transitions
    initializeImageGallery() {
        const galleryImages = document.querySelectorAll('.home-image img');
        const prevButton = document.querySelector('.homes-nav.prev');
        const nextButton = document.querySelector('.homes-nav.next');
        const container = document.querySelector('.homes-container');
        let currentIndex = 0;
        const navigateGallery = (direction) => {
            const imageWidth = galleryImages[0].offsetWidth + 20; //include gap
            currentIndex = direction === 'next' 
                ? Math.min(currentIndex + 1, galleryImages.length - 4)
                : Math.max(currentIndex - 1, 0);
            gsap.to(container, {
                x: -currentIndex * imageWidth,
                duration: 0.5,
                ease: "power2.inOut"
            });
        };
        prevButton.addEventListener('click', () => navigateGallery('prev'));
        nextButton.addEventListener('click', () => navigateGallery('next'));
    }

    //advanced lazy loading with intersection observer
    initializeLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    //fade-in effect
                    gsap.fromTo(img, 
                        { opacity: 0 }, 
                        { opacity: 1, duration: 0.5 }
                    );
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: "50px" });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    //interactive element enhancements
    initializeInteractiveElements() {
        //hover effects for shop buttons
        const shopButtons = document.querySelectorAll('.shop-button');
        shopButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, {
                    scale: 1.05,
                    duration: 0.2,
                    ease: "power1.inOut"
                });
            });
            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    scale: 1,
                    duration: 0.2,
                    ease: "power1.inOut"
                });
            });
        });
    }
}

//initialize on DOM load with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        //dynamically load GSAP and ScrollTrigger
        const gsapScript = document.createElement('script');
        gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/gsap.min.js';
        gsapScript.onload = () => {
            const scrollTriggerScript = document.createElement('script');
            scrollTriggerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.11.4/ScrollTrigger.min.js';
            scrollTriggerScript.onload = () => {
                gsap.registerPlugin(ScrollTrigger);
                new ShowroomManager();
            };
            document.head.appendChild(scrollTriggerScript);
        };
        document.head.appendChild(gsapScript);
    } catch (error) {
        console.error('Initialization failed:', error);
    }
});