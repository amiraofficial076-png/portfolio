// Analytics Manager
class AnalyticsManager {
    constructor() {
        this.analyticsProviders = {
            google: false,
            microsoft: false,
            custom: false
        };
        this.userConsent = null;
        this.init();
    }

    init() {
        this.checkConsent();
        this.setupEventListeners();
        this.trackPageView();
    }

    // GDPR/Consent Management
    checkConsent() {
        const consent = localStorage.getItem('analytics_consent');
        
        if (consent === null) {
            this.showConsentModal();
        } else {
            this.userConsent = JSON.parse(consent);
            this.initializeProviders();
        }
    }

    showConsentModal() {
        // Create consent modal
        const modal = document.createElement('div');
        modal.className = 'consent-modal';
        modal.innerHTML = `
            <div class="consent-content">
                <h3>Privacy & Cookies</h3>
                <p>We use cookies to improve your experience and analyze site traffic. 
                   Your privacy is important to us.</p>
                
                <div class="consent-options">
                    <label>
                        <input type="checkbox" name="necessary" checked disabled>
                        <span>Necessary Cookies (Required)</span>
                    </label>
                    <label>
                        <input type="checkbox" name="analytics" checked>
                        <span>Analytics Cookies</span>
                    </label>
                    <label>
                        <input type="checkbox" name="marketing">
                        <span>Marketing Cookies</span>
                    </label>
                </div>
                
                <div class="consent-buttons">
                    <button class="btn-reject">Reject All</button>
                    <button class="btn-accept">Accept All</button>
                    <button class="btn-custom">Customize & Save</button>
                </div>
                
                <a href="/privacy-policy" class="privacy-link">Privacy Policy</a>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        modal.querySelector('.btn-reject').addEventListener('click', () => {
            this.saveConsent({ necessary: true, analytics: false, marketing: false });
            modal.remove();
        });

        modal.querySelector('.btn-accept').addEventListener('click', () => {
            this.saveConsent({ necessary: true, analytics: true, marketing: true });
            modal.remove();
        });

        modal.querySelector('.btn-custom').addEventListener('click', () => {
            const analytics = modal.querySelector('input[name="analytics"]').checked;
            const marketing = modal.querySelector('input[name="marketing"]').checked;
            this.saveConsent({ necessary: true, analytics, marketing });
            modal.remove();
        });
    }

    saveConsent(consent) {
        this.userConsent = consent;
        localStorage.setItem('analytics_consent', JSON.stringify(consent));
        this.initializeProviders();
    }

    initializeProviders() {
        if (this.userConsent.analytics) {
            this.initializeGoogleAnalytics();
            this.initializeMicrosoftClarity();
        }
        
        if (this.userConsent.marketing) {
            this.initializeFacebookPixel();
        }

        this.initializeCustomAnalytics();
    }

    // Google Analytics 4
    initializeGoogleAnalytics() {
        const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your ID
        
        // Load gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        document.head.appendChild(script);
        
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            send_page_view: true
        });
        
        this.analyticsProviders.google = true;
    }

    // Microsoft Clarity
    initializeMicrosoftClarity() {
        const CLARITY_ID = 'YOUR_CLARITY_ID'; // Replace with your ID
    
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", CLARITY_ID);
        
        this.analyticsProviders.microsoft = true;
    }

    // Facebook Pixel
    initializeFacebookPixel() {
        const PIXEL_ID = 'YOUR_PIXEL_ID'; // Replace with your ID
    
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', PIXEL_ID);
        fbq('track', 'PageView');
    }

    // Custom Analytics
    initializeCustomAnalytics() {
        this.trackEvents();
        this.trackErrors();
        this.trackPerformance();
        this.trackUserBehavior();
    }

    // Event Tracking
    trackEvents() {
        // Track clicks
        document.addEventListener('click', (e) => {
            const element = e.target;
            const eventData = {
                category: 'User Interaction',
                action: 'Click',
                label: element.tagName + (element.id ? '#' + element.id : '') + 
                       (element.className ? '.' + element.className.split(' ')[0] : ''),
                value: 1
            };
            
            this.sendEvent('click', eventData);
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.id === 'contactForm') {
                this.sendEvent('form_submission', {
                    category: 'Forms',
                    action: 'Submit',
                    label: 'Contact Form',
                    value: 1
                });
            }
        });

        // Track downloads
        document.addEventListener('click', (e) => {
            if (e.target.href && e.target.href.includes('.pdf')) {
                this.sendEvent('download', {
                    category: 'Downloads',
                    action: 'Download',
                    label: e.target.href.split('/').pop(),
                    value: 1
                });
            }
        });
    }

    // Error Tracking
    trackErrors() {
        // JavaScript errors
        window.addEventListener('error', (e) => {
            this.sendEvent('error', {
                category: 'Errors',
                action: 'JavaScript Error',
                label: e.message,
                value: 1,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.sendEvent('error', {
                category: 'Errors',
                action: 'Unhandled Promise Rejection',
                label: e.reason.message || e.reason,
                value: 1
            });
        });

        // Resource loading errors
        window.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG' || 
                e.target.tagName === 'SCRIPT' || 
                e.target.tagName === 'LINK') {
                this.sendEvent('error', {
                    category: 'Errors',
                    action: 'Resource Error',
                    label: e.target.src || e.target.href,
                    value: 1
                });
            }
        }, true);
    }

    // Performance Tracking
    trackPerformance() {
        if ('performance' in window) {
            // Navigation timing
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                this.sendEvent('performance', {
                    category: 'Performance',
                    action: 'Navigation Timing',
                    dns: Math.round(navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart),
                    tcp: Math.round(navigationTiming.connectEnd - navigationTiming.connectStart),
                    ttfb: Math.round(navigationTiming.responseStart - navigationTiming.requestStart),
                    domLoaded: Math.round(navigationTiming.domContentLoadedEventEnd - navigationTiming.domContentLoadedEventStart),
                    pageLoaded: Math.round(navigationTiming.loadEventEnd - navigationTiming.loadEventStart)
                });
            }

            // Resource timing
            const resources = performance.getEntriesByType('resource');
            resources.forEach(resource => {
                if (resource.duration > 1000) { // Report slow resources
                    this.sendEvent('performance', {
                        category: 'Performance',
                        action: 'Slow Resource',
                        label: resource.name,
                        duration: Math.round(resource.duration),
                        size: resource.transferSize
                    });
                }
            });
        }
    }

    // User Behavior Tracking
    trackUserBehavior() {
        // Scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercentage = Math.round((window.scrollY + window.innerHeight) / 
                                                document.documentElement.scrollHeight * 100);
            
            if (scrollPercentage > maxScroll) {
                maxScroll = scrollPercentage;
                
                // Track at 25%, 50%, 75%, 100%
                if ([25, 50, 75, 100].includes(Math.floor(scrollPercentage / 25) * 25)) {
                    this.sendEvent('scroll', {
                        category: 'User Behavior',
                        action: 'Scroll Depth',
                        label: `${Math.floor(scrollPercentage / 25) * 25}%`,
                        value: scrollPercentage
                    });
                }
            }
        });

        // Time on page
        let pageEnterTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - pageEnterTime) / 1000);
            this.sendEvent('time', {
                category: 'User Behavior',
                action: 'Time on Page',
                label: document.title,
                value: timeSpent
            });
        });

        // Device & Browser info
        const userAgent = navigator.userAgent;
        const screenSize = `${window.screen.width}x${window.screen.height}`;
        const language = navigator.language;
        
        this.sendEvent('device', {
            category: 'User Info',
            action: 'Device Info',
            userAgent: userAgent,
            screenSize: screenSize,
            language: language,
            online: navigator.onLine
        });
    }

    // Page View Tracking
    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: new Date().toISOString()
        };

        this.sendEvent('pageview', pageData);

        // Track virtual pageviews for SPA
        if (window.history.pushState) {
            const originalPushState = history.pushState;
            history.pushState = function(state, title, url) {
                originalPushState.call(history, state, title, url);
                AnalyticsManager.trackVirtualPageView(url);
            };
            
            window.addEventListener('popstate', () => {
                AnalyticsManager.trackVirtualPageView(window.location.href);
            });
        }
    }

    static trackVirtualPageView(url) {
        const eventData = {
            category: 'Navigation',
            action: 'Virtual Pageview',
            label: url,
            value: 1
        };
        
        // Send to all analytics providers
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_path: url,
                page_title: document.title
            });
        }
        
        // Send to custom endpoint
        AnalyticsManager.sendToEndpoint('pageview', eventData);
    }

    // Send Event to Analytics
    sendEvent(eventName, eventData) {
        // Send to Google Analytics
        if (this.analyticsProviders.google && typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }

        // Send to custom analytics endpoint
        this.sendToCustomAnalytics(eventName, eventData);
    }

    sendToCustomAnalytics(eventName, eventData) {
        // Your custom analytics endpoint
        const endpoint = '/api/analytics';
        
        const data = {
            event: eventName,
            data: eventData,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            userId: this.getUserId()
        };

        // Use sendBeacon for reliable delivery before page unload
        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, JSON.stringify(data));
        } else {
            // Fallback to fetch
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                keepalive: true
            });
        }
    }

    // Utility Functions
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analytics_user_id', userId);
        }
        return userId;
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Social media clicks
        document.querySelectorAll('a[href*="linkedin"], a[href*="github"], a[href*="twitter"]')
            .forEach(link => {
                link.addEventListener('click', () => {
                    this.sendEvent('social_click', {
                        category: 'Social',
                        action: 'Click',
                        label: link.href,
                        platform: link.href.split('.')[1]
                    });
                });
            });

        // Email clicks
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.sendEvent('email_click', {
                    category: 'Contact',
                    action: 'Email Click',
                    label: link.href.replace('mailto:', '')
                });
            });
        });

        // Phone clicks
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', () => {
                this.sendEvent('phone_click', {
                    category: 'Contact',
                    action: 'Phone Click',
                    label: link.href.replace('tel:', '')
                });
            });
        });
    }

    // Analytics Dashboard Data
    static async getAnalyticsData(timeframe = '7d') {
        try {
            const response = await fetch(`/api/analytics/data?timeframe=${timeframe}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            return null;
        }
    }

    // Export analytics data
    exportData(format = 'json') {
        const data = {
            sessionId: this.getSessionId(),
            userId: this.getUserId(),
            pageViews: JSON.parse(localStorage.getItem('analytics_pageviews') || '[]'),
            events: JSON.parse(localStorage.getItem('analytics_events') || '[]')
        };

        if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return JSON.stringify(data, null, 2);
    }

    convertToCSV(data) {
        const headers = Object.keys(data).join(',');
        const values = Object.values(data).map(v => 
            typeof v === 'object' ? JSON.stringify(v) : v
        ).join(',');
        
        return `${headers}\n${values}`;
    }
}

// Initialize Analytics
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsManager();
});

// Analytics Dashboard Component
class AnalyticsDashboard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.render();
        this.setupAutoRefresh();
    }

    async loadData() {
        this.data = await AnalyticsManager.getAnalyticsData();
    }

    render() {
        if (!this.data) return;

        this.container.innerHTML = `
            <div class="analytics-dashboard">
                <h2>Analytics Dashboard</h2>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Total Visitors</h3>
                        <p class="stat-value">${this.data.totalVisitors}</p>
                        <span class="stat-change">+${this.data.visitorChange}%</span>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Page Views</h3>
                        <p class="stat-value">${this.data.pageViews}</p>
                        <span class="stat-change">+${this.data.pageViewChange}%</span>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Avg. Time</h3>
                        <p class="stat-value">${this.data.avgTimeOnSite}m</p>
                        <span class="stat-change">+${this.data.timeChange}%</span>
                    </div>
                    
                    <div class="stat-card">
                        <h3>Bounce Rate</h3>
                        <p class="stat-value">${this.data.bounceRate}%</p>
                        <span class="stat-change">-${this.data.bounceChange}%</span>
                    </div>
                </div>
                
                <div class="charts">
                    <div class="chart-container">
                        <h3>Visitors Over Time</h3>
                        <canvas id="visitorsChart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h3>Top Pages</h3>
                        <ul class="page-list">
                            ${this.data.topPages.map(page => `
                                <li>
                                    <span class="page-name">${page.name}</span>
                                    <span class="page-views">${page.views} views</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
                
                <div class="device-stats">
                    <h3>Device Breakdown</h3>
                    <div class="device-grid">
                        ${this.data.devices.map(device => `
                            <div class="device-item">
                                <span class="device-name">${device.name}</span>
                                <div class="device-bar">
                                    <div class="device-fill" style="width: ${device.percentage}%"></div>
                                </div>
                                <span class="device-percent">${device.percentage}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        this.renderCharts();
    }

    renderCharts() {
        if (!this.data) return;

        // Visitors chart
        const ctx = document.getElementById('visitorsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.data.visitorLabels,
                datasets: [{
                    label: 'Visitors',
                    data: this.data.visitorData,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    setupAutoRefresh() {
        // Refresh data every 5 minutes
        setInterval(async () => {
            await this.loadData();
            this.render();
        }, 5 * 60 * 1000);
    }
}