// Main site functionality for LunaLuxe
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle for new header
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '☰';
    document.querySelector('.main-header').prepend(mobileMenuToggle);

    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    } else {
        console.error('Navigation links element not found.');
    }

    // Newsletter form handling
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            console.log(`Thank you for subscribing with ${email}!`);
            this.reset();
        });
    } else {
        console.error('Newsletter form not found.');
    }

    // Newsletter form submission
    document.querySelector('.newsletter-form button')?.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.querySelector('.newsletter-form input').value;
        if (email) {
            alert(`Thank you for subscribing with ${email}!`);
            document.querySelector('.newsletter-form input').value = '';
        } else {
            alert('Please enter your email address.');
        }
    });

    // Initialize product carousel
    const productCarousel = document.getElementById('productCarousel');
    if (productCarousel) {
        // Placeholder for carousel implementation
        // Would use a library like Swiper.js in production
        console.log('Carousel element found - would initialize here');
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Search functionality
    const searchIcon = document.querySelector('.search-icon');
    const searchOverlay = document.getElementById('searchOverlay');
    const closeSearch = document.querySelector('.close-search');
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');

    // Open search overlay
    searchIcon.addEventListener('click', function(e) {
        e.preventDefault();
        searchOverlay.classList.add('active');
        searchInput.focus();
    });

    // Close search overlay
    closeSearch.addEventListener('click', function() {
        searchOverlay.classList.remove('active');
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
            searchOverlay.classList.remove('active');
        }
    });

    // Handle search form submission
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            performSearch(searchTerm);
        }
    });

    // Live search as user types
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.trim();
            if (searchTerm.length >= 2) {
                performSearch(searchTerm);
            } else {
                searchResults.innerHTML = '';
            }
        }, 300);
    });

    function performSearch(term) {
        // Get all products from the page
        const products = Array.from(document.querySelectorAll('.product-card'));
        const results = products.filter(product => {
            const title = product.querySelector('h3').textContent.toLowerCase();
            return title.includes(term.toLowerCase());
        });

        // Display results
        displaySearchResults(results);
    }

    function displaySearchResults(results) {
        if (results.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No products found</p>';
            return;
        }

        const resultsHtml = results.map(product => {
            const title = product.querySelector('h3').textContent;
            const price = product.querySelector('.product-price').textContent;
            const image = product.querySelector('img').src;
            const productType = product.dataset.type;
            
            // Create a URL-friendly slug from the product title
            const slug = title.toLowerCase().replace(/\s+/g, '-');
            
            return `
                <a href="shop.html?product=${encodeURIComponent(slug)}" class="search-result">
                    <img src="${image}" alt="${title}">
                    <div class="result-info">
                        <h4>${title}</h4>
                        <p>${price}</p>
                        <span class="product-type">${productType}</span>
                    </div>
                </a>
            `;
        }).join('');

        searchResults.innerHTML = resultsHtml;

        // Add click event listeners to search results
        document.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', (e) => {
                e.preventDefault();
                const url = result.getAttribute('href');
                window.location.href = url;
                searchOverlay.classList.remove('active'); // Close the search overlay
            });
        });
    }

    // Product section tab switching
    const productLinks = document.querySelectorAll('.product-link');
    const productSections = document.querySelectorAll('.products-section');

    // Show best-sales by default
    document.getElementById('best-sales').style.display = 'block';

    productLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            productLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Hide all sections
            productSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected section
            const categoryToShow = link.getAttribute('data-category');
            document.getElementById(categoryToShow).style.display = 'block';
        });
    });

    // Cart count update on page load
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + (item.quantity || 1), 0);
            cartCount.style.display = cart.length > 0 ? 'block' : 'none';
        }
    }
    updateCartCount();

    // Color scheme toggle
    const colorSchemeToggle = document.querySelector('.color-scheme-toggle');
    if (colorSchemeToggle) {
        colorSchemeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            // Optionally save preference
            localStorage.setItem('color-scheme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
        // Load preference
        if (localStorage.getItem('color-scheme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }

    // Show/hide login/signup links based on authentication
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginLink = document.querySelector('.top-bar-links a[href="login.html"]');
    const signupLink = document.querySelector('.top-bar-links a[href="signup.html"]');
    if (isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
    } else {
        if (loginLink) loginLink.style.display = '';
        if (signupLink) signupLink.style.display = '';
    }

    // FAQ modal logic
    const faqLink = document.getElementById('faq-link');
    const faqModal = document.getElementById('faq-modal');
    const closeFaq = document.getElementById('close-faq');
    if (faqLink && faqModal && closeFaq) {
        faqLink.addEventListener('click', function(e) {
            e.preventDefault();
            faqModal.style.display = 'block';
            faqModal.focus();
        });
        closeFaq.addEventListener('click', function() {
            faqModal.style.display = 'none';
        });
        // Close modal on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && faqModal.style.display === 'block') {
                faqModal.style.display = 'none';
            }
        });
    }
});

$(document).ready(function(){
    $(".hero__slider").owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: false,
        nav: true,
        navText: ['<span class="fas fa-chevron-left">', '<span class="fas fa-chevron-right">'],
        smartSpeed: 1200,
        autoHeight: false,
        autoplay: true
    });
});
