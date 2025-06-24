class LoadingManager {
    constructor() {
        this.activeLoaders = new Map();
        this.setupLoadingContainer();
        this.setupNotificationContainer();
    }

    setupLoadingContainer() {
        const container = document.createElement('div');
        container.id = 'loading-container';
        document.body.appendChild(container);
    }

    setupNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    showLoading(id, options = {}) {
        const {
            text = 'Loading...',
            target = null,
            type = 'spinner',
            fullscreen = false
        } = options;

        // Create loading indicator
        const indicator = document.createElement('div');
        indicator.className = 'loading-indicator';

        const content = document.createElement('div');
        content.className = 'loading-content';

        // Add loading animation based on type
        if (type === 'spinner') {
            content.innerHTML = `
                <svg class="spinner" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                </svg>
            `;
        } else if (type === 'dots') {
            content.innerHTML = `
                <div class="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                </div>
            `;
        }

        // Add loading text
        const textEl = document.createElement('span');
        textEl.className = 'loading-text';
        textEl.textContent = text;
        content.appendChild(textEl);

        indicator.appendChild(content);

        if (target) {
            // Show loading state on target element
            target.setAttribute('data-loading', 'true');
            target.appendChild(indicator);
        } else {
            // Show fullscreen loading
            const container = document.getElementById('loading-container');
            container.innerHTML = '';
            container.appendChild(indicator);
            container.classList.toggle('fullscreen', fullscreen);
            container.style.opacity = '1';
        }

        this.activeLoaders.set(id, { target, indicator });
    }

    hideLoading(id) {
        const loader = this.activeLoaders.get(id);
        if (!loader) return;

        const { target, indicator } = loader;

        if (target) {
            target.removeAttribute('data-loading');
            indicator.remove();
        } else {
            const container = document.getElementById('loading-container');
            container.style.opacity = '0';
            setTimeout(() => {
                container.innerHTML = '';
            }, 300);
        }

        this.activeLoaders.delete(id);
    }

    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Add icon based on type
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icons[type]}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" aria-label="Close notification">✕</button>
        `;

        container.appendChild(notification);

        // Add show class after a small delay to trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Setup close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.removeNotification(notification));

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification), duration);
        }
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }
}

// Initialize loading manager
window.loadingManager = new LoadingManager();

// Export for module usage
export default window.loadingManager;