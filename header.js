class HeaderManager {
    constructor() {
        this.mobileBreakpoint = 768;
        this.isMenuOpen = false;
        this.searchDebounceTimeout = null;
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSearchBar();
        this.setupCartPreview();
        this.setupScrollBehavior();
        this.setupMegaMenu();
    }

    setupMobileMenu() {
        const menuButton = document.querySelector('.menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', () => {
                this.toggleMobileMenu(menuButton, mobileMenu);
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen) {
                    this.closeMobileMenu(menuButton, mobileMenu);
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (this.isMenuOpen && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
                    this.closeMobileMenu(menuButton, mobileMenu);
                }
            });
        }
    }

    toggleMobileMenu(button, menu) {
        this.isMenuOpen = !this.isMenuOpen;
        button.setAttribute('aria-expanded', this.isMenuOpen);
        menu.classList.toggle('open');
        document.body.classList.toggle('menu-open');

        if (this.isMenuOpen) {
            // Trap focus within menu
            this.trapFocus(menu);
            // Announce menu state to screen readers
            window.accessibility.announce('Mobile menu opened');
        } else {
            window.accessibility.announce('Mobile menu closed');
        }
    }

    closeMobileMenu(button, menu) {
        this.isMenuOpen = false;
        button.setAttribute('aria-expanded', false);
        menu.classList.remove('open');
        document.body.classList.remove('menu-open');
        window.accessibility.announce('Mobile menu closed');
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );

        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            const isTabPressed = e.key === 'Tab';

            if (!isTabPressed) return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });

        firstFocusable.focus();
    }

    setupSearchBar() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = document.querySelector('.search-input');
        const searchResults = document.querySelector('.search-results');

        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch(searchInput.value);
            });

            // Live search with debouncing
            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchDebounceTimeout);
                this.searchDebounceTimeout = setTimeout(() => {
                    this.performLiveSearch(e.target.value, searchResults);
                }, 300);
            });

            // Close search results on outside click
            document.addEventListener('click', (e) => {
                if (searchResults && !searchForm.contains(e.target)) {
                    searchResults.classList.remove('show');
                }
            });
        }
    }

    async performLiveSearch(query, resultsContainer) {
        if (!query.trim() || !resultsContainer) {
            resultsContainer.classList.remove('show');
            return;
        }

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');

            const results = await response.json();
            this.displaySearchResults(results, resultsContainer);
            
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results, container) {
        if (!results.length) {
            container.innerHTML = '<p class="no-results">No results found</p>';
        } else {
            container.innerHTML = results.map(result => `
                <a href="${result.url}" class="search-result">
                    <img src="${result.image}" alt="${result.name}" loading="lazy">
                    <div class="result-info">
                        <h4>${result.name}</h4>
                        <p>${result.price}</p>
                    </div>
                </a>
            `).join('');
        }

        container.classList.add('show');
    }

    setupCartPreview() {
        const cartButton = document.querySelector('.cart-toggle');
        const cartPreview = document.querySelector('.cart-preview');

        if (cartButton && cartPreview) {
            let hideTimeout;

            cartButton.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
                this.showCartPreview(cartPreview);
            });

            cartPreview.addEventListener('mouseenter', () => {
                clearTimeout(hideTimeout);
            });

            [cartButton, cartPreview].forEach(element => {
                element.addEventListener('mouseleave', () => {
                    hideTimeout = setTimeout(() => {
                        this.hideCartPreview(cartPreview);
                    }, 300);
                });
            });

            // Keyboard accessibility
            cartButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cartPreview.classList.contains('show') 
                        ? this.hideCartPreview(cartPreview)
                        : this.showCartPreview(cartPreview);
                }
            });
        }
    }

    async showCartPreview(preview) {
        try {
            const response = await fetch('/api/cart/preview');
            if (!response.ok) throw new Error('Failed to load cart preview');

            const { items, total } = await response.json();
            
            preview.innerHTML = items.length ? `
                <div class="cart-items">
                    ${items.map(item => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p>${item.quantity} × ${item.price}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-footer">
                    <p class="cart-total">Total: ${total}</p>
                    <a href="/checkout" class="checkout-btn">Checkout</a>
                </div>
            ` : '<p class="empty-cart">Your cart is empty</p>';

            preview.classList.add('show');

        } catch (error) {
            console.error('Cart preview error:', error);
        }
    }

    hideCartPreview(preview) {
        preview.classList.remove('show');
    }

    setupScrollBehavior() {
        let lastScroll = 0;
        const header = document.querySelector('.site-header');
        
        if (!header) return;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Show/hide header on scroll
            if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
                header.classList.add('header-hidden');
            } else {
                header.classList.remove('header-hidden');
            }

            // Add shadow on scroll
            header.classList.toggle('header-shadow', currentScroll > 0);

            lastScroll = currentScroll;
        }, { passive: true });
    }

    setupMegaMenu() {
        const megaMenuTriggers = document.querySelectorAll('.has-mega-menu');
        
        megaMenuTriggers.forEach(trigger => {
            const megaMenu = trigger.querySelector('.mega-menu');
            if (!megaMenu) return;

            // Show on hover for desktop
            trigger.addEventListener('mouseenter', () => {
                if (window.innerWidth >= this.mobileBreakpoint) {
                    this.showMegaMenu(trigger, megaMenu);
                }
            });

            trigger.addEventListener('mouseleave', () => {
                if (window.innerWidth >= this.mobileBreakpoint) {
                    this.hideMegaMenu(trigger, megaMenu);
                }
            });

            // Toggle on click for mobile
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth < this.mobileBreakpoint) {
                    e.preventDefault();
                    this.toggleMegaMenu(trigger, megaMenu);
                }
            });

            // Keyboard accessibility
            trigger.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMegaMenu(trigger, megaMenu);
                } else if (e.key === 'Escape') {
                    this.hideMegaMenu(trigger, megaMenu);
                }
            });
        });
    }

    showMegaMenu(trigger, menu) {
        trigger.setAttribute('aria-expanded', 'true');
        menu.classList.add('show');
        window.accessibility.announce('Submenu opened');
    }

    hideMegaMenu(trigger, menu) {
        trigger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('show');
        window.accessibility.announce('Submenu closed');
    }

    toggleMegaMenu(trigger, menu) {
        const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            this.hideMegaMenu(trigger, menu);
        } else {
            this.showMegaMenu(trigger, menu);
        }
    }
}

// Initialize header manager
document.addEventListener('DOMContentLoaded', () => {
    window.header = new HeaderManager();
});
