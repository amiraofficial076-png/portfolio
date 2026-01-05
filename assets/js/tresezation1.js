// Testimonials Slider Only
class TestimonialsSlider {
    constructor() {
        this.swiper = null;
        this.init();
    }

    init() {
        // Load Swiper CSS and JS dynamically
        this.loadSwiperAssets().then(() => {
            this.initializeSwiper();
        }).catch(error => {
            console.error('Failed to load Swiper:', error);
        });
    }

    loadSwiperAssets() {
        return new Promise((resolve, reject) => {
            // Check if Swiper is already loaded
            if (typeof Swiper !== 'undefined') {
                resolve();
                return;
            }

            // Load Swiper CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.css';
            link.onload = () => {
                // Load Swiper JS
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            };
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    initializeSwiper() {
        if (!document.querySelector('.testimonials-slider')) return;

        this.swiper = new Swiper('.testimonials-slider', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true
            },
            speed: 600,
            grabCursor: true,
            centeredSlides: true,
            breakpoints: {
                640: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30
                }
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
                dynamicBullets: true
            }
        });

        // Add hover effects
        this.addHoverEffects();
    }

    addHoverEffects() {
        document.querySelectorAll('.testimonial-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (this.swiper) {
                    this.swiper.autoplay.stop();
                }
            });

            card.addEventListener('mouseleave', () => {
                if (this.swiper) {
                    this.swiper.autoplay.start();
                }
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#testimonials')) {
        new TestimonialsSlider();
    }
});