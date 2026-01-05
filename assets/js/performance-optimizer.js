// Performance Optimization Script
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.deferNonCriticalCSS();
        this.optimizeAnimations();
        this.monitorPerformance();
        this.prefetchResources();
    }

    // Lazy Load Images
    lazyLoadImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.removeAttribute('data-src');
                            
                            // Add loading animation
                            img.style.opacity = '0';
                            img.style.transition = 'opacity 0.3s ease';
                            
                            img.onload = () => {
                                img.style.opacity = '1';
                                img.classList.add('loaded');
                            };
                        }
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.1
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for older browsers
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.getAttribute('data-src');
            });
        }
    }

    // Defer Non-Critical CSS
    deferNonCriticalCSS() {
        // Critical CSS is already inlined
        // Defer loading of non-critical stylesheets
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
        
        stylesheets.forEach(sheet => {
            sheet.setAttribute('media', 'all');
            sheet.setAttribute('loading', 'lazy');
        });
    }

    // Optimize Animations
    optimizeAnimations() {
        // Use requestAnimationFrame for smooth animations
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScrollAnimations();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Reduce motion for users who prefer it
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition', 'none');
            document.querySelectorAll('*').forEach(el => {
                el.style.animation = 'none';
                el.style.transition = 'none';
            });
        }
    }

    handleScrollAnimations() {
        // Handle scroll-based animations efficiently
        const elements = document.querySelectorAll('[data-animate-on-scroll]');
        
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = (rect.top <= window.innerHeight * 0.8);
            
            if (isVisible) {
                el.classList.add('animate');
            }
        });
    }

    // Monitor Performance
    monitorPerformance() {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                console.log('LCP:', lastEntry.startTime);
                // Send to analytics
                this.sendToAnalytics('lcp', lastEntry.startTime);
            });
            
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

            // Monitor First Input Delay
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    this.sendToAnalytics('fid', entry.processingStart - entry.startTime);
                });
            });
            
            fidObserver.observe({ type: 'first-input', buffered: true });

            // Monitor Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((entryList) => {
                let clsValue = 0;
                const entries = entryList.getEntries();
                
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                console.log('CLS:', clsValue);
                this.sendToAnalytics('cls', clsValue);
            });
            
            clsObserver.observe({ type: 'layout-shift', buffered: true });
        }

        // Log Web Vitals
        if (window.webVitals) {
            webVitals.getCLS(console.log);
            webVitals.getFID(console.log);
            webVitals.getLCP(console.log);
        }
    }

    sendToAnalytics(metric, value) {
        // Send performance metrics to your analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', metric, {
                'event_category': 'Performance Metrics',
                'value': Math.round(value),
                'non_interaction': true
            });
        }
    }

    // Prefetch Resources
    prefetchResources() {
        // Prefetch next likely pages
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (href && !href.includes('#') && href !== '/') {
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = href;
                    document.head.appendChild(prefetchLink);
                }
            }, { once: true });
        });

        // Preconnect to external domains
        const externalDomains = [
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com',
            'https://cdn.jsdelivr.net',
            'https://unpkg.com'
        ];

        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            document.head.appendChild(link);
        });
    }

    // Optimize Images
    static optimizeImage(img) {
        const src = img.src;
        if (!src) return;

        // Check if image needs optimization
        const isLarge = img.naturalWidth > 1920;
        const format = src.split('.').pop().toLowerCase();
        
        if (isLarge && (format === 'png' || format === 'jpg' || format === 'jpeg')) {
            // Suggest using WebP format
            console.log(`Consider converting ${src} to WebP format`);
        }
    }

    // Memory Management
    cleanUp() {
        // Remove unused event listeners
        window.addEventListener('beforeunload', () => {
            // Clean up resources before page unload
            PerformanceOptimizer.removeAllEventListeners();
        });
    }

    static removeAllEventListeners() {
        // Implementation for removing event listeners
        // This is a simplified version
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
            const newEl = el.cloneNode(true);
            el.parentNode.replaceChild(newEl, el);
        });
    }
}

// Initialize Performance Optimizer
document.addEventListener('DOMContentLoaded', () => {
    window.perfOptimizer = new PerformanceOptimizer();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registered:', registration);
        }).catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// Resource Timing API
if (window.performance && performance.getEntriesByType) {
    const resources = performance.getEntriesByType('resource');
    resources.forEach(resource => {
        if (resource.initiatorType === 'img') {
            console.log(`Image loaded: ${resource.name} in ${resource.duration}ms`);
        }
    });
}

// Network Information API
if ('connection' in navigator) {
    const connection = navigator.connection;
    console.log('Network type:', connection.effectiveType);
    console.log('Download speed:', connection.downlink);
    console.log('Data saver:', connection.saveData);

    // Adjust loading strategy based on connection
    if (connection.saveData || connection.effectiveType === '2g') {
        // Load lower quality images
        document.querySelectorAll('img[data-src-low]').forEach(img => {
            img.setAttribute('data-src', img.getAttribute('data-src-low'));
        });
    }
}

// Battery Status API
if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
        if (battery.level < 0.2) {
            // Reduce animations and background activity
            document.documentElement.classList.add('battery-saver');
        }
    });
}