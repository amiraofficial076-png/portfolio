// Testimonials Slider and Management
class TestimonialsManager {
    constructor() {
        this.swiper = null;
        this.testimonials = [];
        this.currentPage = 1;
        this.itemsPerPage = 4;
        this.init();
    }

    init() {
        this.initializeSwiper();
        this.loadTestimonials();
        this.setupEventListeners();
        this.setupTestimonialForm();
    }

    initializeSwiper() {
        if (document.querySelector('.testimonials-slider')) {
            this.swiper = new Swiper('.testimonials-slider', {
                slidesPerView: 1,
                spaceBetween: 30,
                loop: true,
                autoplay: {
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true
                },
                speed: 800,
                effect: 'slide',
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
                },
                on: {
                    init: () => {
                        this.animateTestimonials();
                    },
                    slideChange: () => {
                        this.updateActiveTestimonial();
                    }
                }
            });
        }
    }

    async loadTestimonials() {
        try {
            // Load from API or local storage
            const savedTestimonials = localStorage.getItem('portfolio_testimonials');
            
            if (savedTestimonials) {
                this.testimonials = JSON.parse(savedTestimonials);
            } else {
                // Load default testimonials
                this.testimonials = await this.fetchDefaultTestimonials();
                this.saveTestimonials();
            }
            
            this.renderTestimonials();
        } catch (error) {
            console.error('Error loading testimonials:', error);
            this.showDefaultTestimonials();
        }
    }

    async fetchDefaultTestimonials() {
        // In a real application, fetch from API
        return [
            {
                id: 1,
                name: "Sarah Johnson",
                role: "Marketing Director, TechCorp",
                avatar: "client1.jpg",
                rating: 5,
                content: "Amir delivered an outstanding website for our company. His attention to detail and understanding of modern web technologies exceeded our expectations.",
                projectType: "Corporate Website",
                date: "Dec 2023",
                featured: true
            },
            {
                id: 2,
                name: "Michael Chen",
                role: "CEO, StartupXYZ",
                avatar: "client2.jpg",
                rating: 4.5,
                content: "Working with Amir was a game-changer for our startup. He transformed our vision into a beautiful, functional website.",
                projectType: "Startup Platform",
                date: "Nov 2023",
                featured: false
            },
            {
                id: 3,
                name: "Emily Rodriguez",
                role: "E-commerce Manager",
                avatar: "client3.jpg",
                rating: 5,
                content: "The e-commerce website Amir built for us increased our conversion rate by 40%. His expertise in responsive design is impressive.",
                projectType: "E-commerce Store",
                date: "Oct 2023",
                featured: false
            },
            {
                id: 4,
                name: "David Wilson",
                role: "Creative Director",
                avatar: "client4.jpg",
                rating: 5,
                content: "Amir's combination of technical skills and creative thinking is impressive. A true professional.",
                projectType: "Portfolio Website",
                date: "Sep 2023",
                featured: false
            }
        ];
    }

    showDefaultTestimonials() {
        this.testimonials = [
            {
                id: 0,
                name: "Client",
                role: "Satisfied Customer",
                avatar: "default.jpg",
                rating: 5,
                content: "Excellent work! Professional and reliable web developer.",
                projectType: "Web Development",
                date: "2023",
                featured: true
            }
        ];
        this.renderTestimonials();
    }

    renderTestimonials() {
        const container = document.querySelector('.swiper-wrapper');
        if (!container) return;

        container.innerHTML = '';
        
        this.testimonials.forEach((testimonial, index) => {
            const slide = document.createElement('div');
            slide.className = `swiper-slide ${testimonial.featured ? 'featured-slide' : ''}`;
            slide.innerHTML = this.createTestimonialHTML(testimonial, index);
            container.appendChild(slide);
        });

        // Reinitialize Swiper if needed
        if (this.swiper) {
            this.swiper.update();
        }
    }

    createTestimonialHTML(testimonial, index) {
        const stars = this.generateStars(testimonial.rating);
        
        return `
            <div class="testimonial-card ${testimonial.featured ? 'featured' : ''}" 
                 data-aos="fade-up" data-aos-delay="${index * 100}">
                ${testimonial.featured ? '<div class="featured-badge">Featured Review</div>' : ''}
                
                <div class="testimonial-header">
                    <div class="client-avatar">
                        <img src="assets/images/clients/${testimonial.avatar}" 
                             alt="${testimonial.name}"
                             data-src="assets/images/clients/${testimonial.avatar}"
                             loading="lazy">
                    </div>
                    <div class="client-info">
                        <h4>${testimonial.name}</h4>
                        <span class="client-role">${testimonial.role}</span>
                        <div class="rating">
                            ${stars}
                        </div>
                    </div>
                </div>
                
                <div class="testimonial-body">
                    <p>"${testimonial.content}"</p>
                </div>
                
                <div class="testimonial-footer">
                    <span class="project-type">${testimonial.projectType}</span>
                    <span class="project-date">Completed: ${testimonial.date}</span>
                </div>
            </div>
        `;
    }

    generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="bi bi-star-fill"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="bi bi-star-half"></i>';
            } else {
                stars += '<i class="bi bi-star"></i>';
            }
        }
        
        return stars;
    }

    animateTestimonials() {
        const testimonials = document.querySelectorAll('.testimonial-card');
        
        testimonials.forEach((testimonial, index) => {
            testimonial.style.animationDelay = `${index * 0.2}s`;
            
            // Add hover effect
            testimonial.addEventListener('mouseenter', () => {
                testimonial.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            testimonial.addEventListener('mouseleave', () => {
                testimonial.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    updateActiveTestimonial() {
        const activeSlide = this.swiper?.slides[this.swiper?.activeIndex];
        if (!activeSlide) return;

        // Remove active class from all
        document.querySelectorAll('.testimonial-card').forEach(card => {
            card.classList.remove('active');
        });

        // Add active class to current
        const testimonialCard = activeSlide.querySelector('.testimonial-card');
        if (testimonialCard) {
            testimonialCard.classList.add('active');
        }
    }

    setupEventListeners() {
        // Rating hover effect
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('bi-star')) {
                const ratingContainer = e.target.closest('.rating');
                if (ratingContainer) {
                    const stars = ratingContainer.querySelectorAll('i');
                    const hoverIndex = Array.from(stars).indexOf(e.target);
                    
                    stars.forEach((star, index) => {
                        if (index <= hoverIndex) {
                            star.classList.add('hover');
                        }
                    });
                }
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('bi-star')) {
                const ratingContainer = e.target.closest('.rating');
                if (ratingContainer) {
                    const stars = ratingContainer.querySelectorAll('i');
                    stars.forEach(star => star.classList.remove('hover'));
                }
            }
        });

        // Share testimonial
        document.addEventListener('click', (e) => {
            if (e.target.closest('.share-testimonial')) {
                this.shareTestimonial(e.target.closest('.testimonial-card'));
            }
        });

        // Load more testimonials
        const loadMoreBtn = document.querySelector('.load-more-testimonials');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreTestimonials();
            });
        }
    }

    setupTestimonialForm() {
        const form = document.getElementById('testimonialForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const testimonialData = {
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role'),
                rating: parseInt(formData.get('rating')),
                content: formData.get('content'),
                projectType: formData.get('projectType'),
                date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                status: 'pending' // Admin approval needed
            };

            const result = await this.submitTestimonial(testimonialData);
            
            if (result.success) {
                this.showNotification('Thank you for your testimonial! It will be reviewed and published soon.', 'success');
                form.reset();
                this.resetRating();
            } else {
                this.showNotification('There was an error submitting your testimonial. Please try again.', 'error');
            }
        });

        // Rating stars interaction
        const ratingStars = form.querySelectorAll('.rating-input i');
        ratingStars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = index + 1;
                form.querySelector('input[name="rating"]').value = rating;
                this.updateRatingStars(ratingStars, rating);
            });
        });
    }

    updateRatingStars(stars, rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('bi-star-fill');
                star.classList.remove('bi-star');
            } else {
                star.classList.add('bi-star');
                star.classList.remove('bi-star-fill');
            }
        });
    }

    resetRating() {
        const form = document.getElementById('testimonialForm');
        const ratingStars = form?.querySelectorAll('.rating-input i');
        const ratingInput = form?.querySelector('input[name="rating"]');
        
        if (ratingStars && ratingInput) {
            ratingInput.value = '0';
            ratingStars.forEach(star => {
                star.classList.add('bi-star');
                star.classList.remove('bi-star-fill');
            });
        }
    }

    async submitTestimonial(testimonialData) {
        try {
            // In a real application, send to your backend
            // const response = await fetch('/api/testimonials', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(testimonialData)
            // });
            
            // For demo, simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Save to local storage for demo
            const testimonials = JSON.parse(localStorage.getItem('portfolio_testimonials') || '[]');
            testimonialData.id = Date.now();
            testimonials.push(testimonialData);
            localStorage.setItem('portfolio_testimonials', JSON.stringify(testimonials));
            
            return { success: true, message: 'Testimonial submitted successfully' };
        } catch (error) {
            console.error('Error submitting testimonial:', error);
            return { success: false, message: error.message };
        }
    }

    shareTestimonial(testimonialCard) {
        if (!testimonialCard) return;

        const name = testimonialCard.querySelector('h4').textContent;
        const content = testimonialCard.querySelector('p').textContent;
        const rating = testimonialCard.querySelectorAll('.bi-star-fill').length;
        
        const shareText = `Check out this testimonial for Amir Ali: "${content}" - ${name} (${rating}/5 stars)`;
        const shareUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'Testimonial for Amir Ali',
                text: shareText,
                url: shareUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
                .then(() => {
                    this.showNotification('Testimonial copied to clipboard!', 'success');
                })
                .catch(() => {
                    this.showNotification('Could not share testimonial', 'error');
                });
        }
    }

    async loadMoreTestimonials() {
        this.currentPage++;
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        
        // Simulate loading more testimonials
        const newTestimonials = await this.fetchMoreTestimonials(start, end);
        this.testimonials = [...this.testimonials, ...newTestimonials];
        this.renderTestimonials();
        
        // Update button state
        const loadMoreBtn = document.querySelector('.load-more-testimonials');
        if (loadMoreBtn && this.testimonials.length >= 10) {
            loadMoreBtn.style.display = 'none';
        }
    }

    async fetchMoreTestimonials(start, end) {
        // Simulate API call
        return new Promise(resolve => {
            setTimeout(() => {
                const mockTestimonials = [
                    {
                        id: start + 1,
                        name: `Client ${start + 1}`,
                        role: "Business Owner",
                        avatar: "default.jpg",
                        rating: 5,
                        content: "Great work! Very professional and delivered on time.",
                        projectType: "Business Website",
                        date: "2023",
                        featured: false
                    },
                    {
                        id: start + 2,
                        name: `Client ${start + 2}`,
                        role: "Product Manager",
                        avatar: "default.jpg",
                        rating: 4,
                        content: "Good communication and quality work.",
                        projectType: "Web Application",
                        date: "2023",
                        featured: false
                    }
                ];
                resolve(mockTestimonials.slice(0, end - start));
            }, 500);
        });
    }

    saveTestimonials() {
        localStorage.setItem('portfolio_testimonials', JSON.stringify(this.testimonials));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification"><i class="bi bi-x"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Close button
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Analytics for testimonials
    trackTestimonialInteraction(action, testimonialId) {
        if (window.analytics) {
            window.analytics.sendEvent('testimonial_interaction', {
                category: 'Testimonials',
                action: action,
                label: `Testimonial ${testimonialId}`,
                value: 1
            });
        }
    }

    // Export testimonials as JSON
    exportTestimonials() {
        const dataStr = JSON.stringify(this.testimonials, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `testimonials-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// Initialize Testimonials Manager
document.addEventListener('DOMContentLoaded', () => {
    window.testimonialsManager = new TestimonialsManager();
    
    // Load Swiper if not already loaded
    if (typeof Swiper === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js';
        script.onload = () => {
            window.testimonialsManager.initializeSwiper();
        };
        document.head.appendChild(script);
    }
});

// Testimonial Form HTML (Add to your contact section or separate page)
const testimonialFormHTML = `
<div class="testimonial-form-section">
    <div class="container">
        <div class="section-header">
            <h2>Share Your Experience</h2>
            <p>Help others by sharing your experience working with me</p>
        </div>
        
        <form id="testimonialForm" class="testimonial-form">
            <div class="form-grid">
                <div class="form-group">
                    <label for="name">Your Name *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email Address *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="role">Your Role / Company</label>
                    <input type="text" id="role" name="role" placeholder="e.g., CEO, Marketing Director">
                </div>
                
                <div class="form-group">
                    <label for="projectType">Project Type</label>
                    <select id="projectType" name="projectType">
                        <option value="Website Development">Website Development</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Web Application">Web Application</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                <div class="form-group full-width">
                    <label>Rating *</label>
                    <div class="rating-input">
                        <input type="hidden" name="rating" value="0" required>
                        <i class="bi bi-star" data-value="1"></i>
                        <i class="bi bi-star" data-value="2"></i>
                        <i class="bi bi-star" data-value="3"></i>
                        <i class="bi bi-star" data-value="4"></i>
                        <i class="bi bi-star" data-value="5"></i>
                    </div>
                </div>
                
                <div class="form-group full-width">
                    <label for="content">Your Testimonial *</label>
                    <textarea id="content" name="content" rows="6" 
                              placeholder="Share your experience working with me..." 
                              required></textarea>
                </div>
            </div>
            
            <div class="form-submit">
                <button type="submit" class="btn btn-primary">
                    <i class="bi bi-send"></i> Submit Testimonial
                </button>
                <p class="form-note">Your testimonial will be reviewed before publishing</p>
            </div>
        </form>
    </div>
</div>
`;
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