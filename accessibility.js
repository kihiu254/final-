class AccessibilityManager {
    constructor() {
        this.focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusTrap();
        this.enhanceAria();
        this.setupSkipLinks();
        this.setupColorSchemeToggle();
        this.setupFontSizeControls();
    }

    setupKeyboardNavigation() {
        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        // Remove keyboard navigation visual indicators when using mouse
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Enhanced dropdown navigation
        document.querySelectorAll('.dropdown-trigger').forEach(trigger => {
            trigger.addEventListener('keydown', (e) => {
                const dropdown = trigger.nextElementSibling;
                if (!dropdown) return;

                switch (e.key) {
                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        this.toggleDropdown(dropdown);
                        break;
                    case 'Escape':
                        this.closeDropdown(dropdown);
                        break;
                }
            });
        });
    }

    setupFocusTrap() {
        // Trap focus in modals
        document.querySelectorAll('.modal').forEach(modal => {
            const focusableElements = modal.querySelectorAll(this.focusableSelector);
            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey && document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            });
        });
    }

    enhanceAria() {
        // Add ARIA labels and roles
        document.querySelectorAll('button:not([aria-label])').forEach(button => {
            if (!button.textContent.trim()) {
                const icon = button.querySelector('i, svg');
                if (icon) {
                    const iconClass = icon.className;
                    let label = '';
                    
                    if (iconClass.includes('search')) label = 'Search';
                    else if (iconClass.includes('cart')) label = 'Shopping Cart';
                    else if (iconClass.includes('menu')) label = 'Menu';
                    else if (iconClass.includes('close')) label = 'Close';
                    
                    if (label) button.setAttribute('aria-label', label);
                }
            }
        });

        // Add ARIA landmarks
        const landmarks = {
            header: 'banner',
            nav: 'navigation',
            main: 'main',
            footer: 'contentinfo',
            aside: 'complementary',
            '[role="search"]': 'search'
        };

        Object.entries(landmarks).forEach(([selector, role]) => {
            document.querySelectorAll(selector).forEach(element => {
                if (!element.getAttribute('role')) {
                    element.setAttribute('role', role);
                }
            });
        });

        // Enhance form accessibility
        document.querySelectorAll('form').forEach(form => {
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                const label = form.querySelector(`label[for="${input.id}"]`);
                if (!label && !input.getAttribute('aria-label')) {
                    input.setAttribute('aria-label', input.placeholder || input.name);
                }
            });
        });
    }

    setupSkipLinks() {
        // Add skip links for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add ID to main content if not present
        const main = document.querySelector('main');
        if (main && !main.id) main.id = 'main';
    }

    setupColorSchemeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'color-scheme-toggle';
        toggle.setAttribute('aria-label', 'Toggle color scheme');
        
        const updateColorScheme = (scheme) => {
            document.documentElement.setAttribute('data-color-scheme', scheme);
            localStorage.setItem('color-scheme', scheme);
            toggle.setAttribute('aria-pressed', scheme === 'dark');
        };

        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-color-scheme');
            updateColorScheme(current === 'dark' ? 'light' : 'dark');
        });

        // Initialize color scheme
        const savedScheme = localStorage.getItem('color-scheme') || 
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        updateColorScheme(savedScheme);

        document.querySelector('.header-controls')?.appendChild(toggle);
    }

    setupFontSizeControls() {
        const controls = document.createElement('div');
        controls.className = 'font-size-controls';
        controls.setAttribute('role', 'group');
        controls.setAttribute('aria-label', 'Font size controls');

        const sizes = [
            { label: 'Decrease font size', icon: 'minus', factor: 0.9 },
            { label: 'Reset font size', icon: 'reset', factor: 1 },
            { label: 'Increase font size', icon: 'plus', factor: 1.1 }
        ];

        sizes.forEach(({ label, icon, factor }) => {
            const button = document.createElement('button');
            button.className = `font-size-${icon}`;
            button.setAttribute('aria-label', label);
            button.innerHTML = `<i class="fas fa-${icon}"></i>`;

            button.addEventListener('click', () => {
                if (icon === 'reset') {
                    document.documentElement.style.fontSize = '';
                    localStorage.removeItem('font-size');
                } else {
                    const currentSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
                    const newSize = currentSize * factor;
                    document.documentElement.style.fontSize = `${newSize}px`;
                    localStorage.setItem('font-size', `${newSize}px`);
                }
            });

            controls.appendChild(button);
        });

        document.querySelector('.header-controls')?.appendChild(controls);

        // Apply saved font size
        const savedSize = localStorage.getItem('font-size');
        if (savedSize) {
            document.documentElement.style.fontSize = savedSize;
        }
    }

    toggleDropdown(dropdown) {
        const isExpanded = dropdown.getAttribute('aria-expanded') === 'true';
        dropdown.setAttribute('aria-expanded', !isExpanded);
        dropdown.style.display = isExpanded ? 'none' : 'block';

        if (!isExpanded) {
            const firstFocusable = dropdown.querySelector(this.focusableSelector);
            if (firstFocusable) firstFocusable.focus();
        }
    }

    closeDropdown(dropdown) {
        dropdown.setAttribute('aria-expanded', 'false');
        dropdown.style.display = 'none';
        dropdown.previousElementSibling?.focus();
    }

    // Utility method to announce messages to screen readers
    static announce(message, priority = 'polite') {
        let announcer = document.getElementById('a11y-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'a11y-announcer';
            announcer.setAttribute('aria-live', priority);
            announcer.setAttribute('aria-atomic', 'true');
            announcer.className = 'sr-only';
            document.body.appendChild(announcer);
        }

        announcer.textContent = message;
    }

    // Method to make dynamic content accessible
    static makeAccessible(element) {
        // Add appropriate ARIA attributes
        if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
            element.setAttribute('alt', '');
            console.warn('Image missing alt text:', element);
        }

        // Make interactive elements focusable
        if (element.tagName === 'DIV' && element.onclick) {
            if (!element.getAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'button');
            }
        }

        // Add labels to form controls
        if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
            if (!element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                const label = element.previousElementSibling;
                if (label?.tagName === 'LABEL') {
                    const id = `${element.name}-${Math.random().toString(36).substr(2, 9)}`;
                    element.id = id;
                    label.setAttribute('for', id);
                }
            }
        }
    }
}

// Initialize accessibility manager
document.addEventListener('DOMContentLoaded', () => {
    window.accessibility = new AccessibilityManager();
});