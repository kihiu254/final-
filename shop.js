document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const categoryItems = document.querySelectorAll('.category-item');
    const categoryOptions = document.querySelectorAll('.category-option');
    const productCards = document.querySelectorAll('.product-card');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cartCount = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const quickViewButtons = document.querySelectorAll('.quick-view');
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');
    const colorSchemeToggle = document.querySelector('.color-scheme-toggle');

    // Initialize category dropdowns
    categoryItems.forEach(item => {
        const header = item.querySelector('.category-header');
        const dropdown = item.querySelector('.category-dropdown');
        const icon = header.querySelector('.toggle-icon');

        header.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log('Category clicked:', header.textContent.trim()); // Debug log

            // Toggle clicked dropdown
            const isActive = dropdown.classList.toggle('active');
            icon.classList.toggle('rotate');
            console.log('Dropdown state:', isActive ? 'opened' : 'closed'); // Debug log

            // Close other dropdowns
            categoryItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherDropdown = otherItem.querySelector('.category-dropdown');
                    const otherIcon = otherItem.querySelector('.toggle-icon');
                    otherDropdown.classList.remove('active');
                    otherIcon.classList.remove('rotate');
                }
            });
        });
    });

    // Add click handlers to category options
    categoryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();

            // Remove active class from all options
            categoryOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');

            const selectedCategory = option.getAttribute('data-category');
            console.log('Selected category:', selectedCategory); // Debug log
            filterProducts(selectedCategory);
        });
    });

    // Filter products
    function filterProducts(category) {
        console.log('Filtering products for category:', category); // Debug log
        let hasVisibleProducts = false;
        let visibleCount = 0;

        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const title = card.querySelector('.product-title')?.textContent;
            console.log(`Checking product: ${title}, category: ${cardCategory}`); // Debug log

            if (!category || cardCategory === category) {
                card.style.display = 'block';
                card.classList.add('fade-in');
                hasVisibleProducts = true;
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.remove('fade-in');
            }
        });

        console.log(`Found ${visibleCount} matching products`); // Debug log
        showNoProductsMessage(!hasVisibleProducts);
    }

    // Handle no products message
    function showNoProductsMessage(show) {
        let message = document.querySelector('.no-products-message');
        if (!message) {
            message = document.createElement('div');
            message.className = 'no-products-message';
            message.style.cssText = 'text-align: center; padding: 2rem; font-size: 1.2rem; color: #666;';
            message.textContent = 'No products found in this category.';
            document.querySelector('.product-grid-container').appendChild(message);
        }

        message.style.display = show ? 'block' : 'none';
        if (show) {
            message.classList.add('fade-in');
            console.log('Showing no products message'); // Debug log
        } else {
            message.classList.remove('fade-in');
        }
    }

    // Cart functionality
    // Cart count update on page load (sync with localStorage)
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cartCount) {
            cartCount.textContent = cart.reduce((total, item) => total + (item.quantity || 1), 0);
            cartCount.style.display = cart.length > 0 ? 'block' : 'none';
        }
    }
    updateCartCount();
    // Improved Add to Cart functionality
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.product-card');
            const name = productCard.querySelector('.product-title').textContent;
            const price = parseFloat(productCard.querySelector('.product-price').textContent.replace(/[^\d.]/g, ''));
            const image = productCard.querySelector('img').src;
            // Get selected color and size if available
            let color = null, size = null;
            const colorOption = productCard.querySelector('.color-option.active');
            const sizeOption = productCard.querySelector('.size-option.active');
            if (colorOption) color = colorOption.getAttribute('data-color') || colorOption.style.background;
            if (sizeOption) size = sizeOption.textContent;
            // If color/size options exist but not selected, show feedback
            if (productCard.querySelector('.color-options') && !color) {
                button.classList.add('error');
                button.textContent = 'Select Color';
                setTimeout(() => {
                    button.classList.remove('error');
                    button.textContent = 'Add to Cart';
                }, 1200);
                return;
            }
            if (productCard.querySelector('.size-options') && !size) {
                button.classList.add('error');
                button.textContent = 'Select Size';
                setTimeout(() => {
                    button.classList.remove('error');
                    button.textContent = 'Add to Cart';
                }, 1200);
                return;
            }
            // Build unique key for product
            const productKey = `${name}|${color || ''}|${size || ''}`;
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            let existing = cart.find(item => `${item.name}|${item.color || ''}|${item.size || ''}` === productKey);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ name, price, image, color, size, quantity: 1 });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            button.classList.add('added');
            button.textContent = 'Added!';
            setTimeout(() => {
                button.classList.remove('added');
                button.textContent = 'Add to Cart';
            }, 1000);
        });
    });

    // Quick view functionality
    quickViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = button.closest('.product-card');
            showQuickViewModal(getProductDetails(productCard));
        });
    });

    // Wishlist functionality
    wishlistButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            button.classList.toggle('active');
            const isActive = button.classList.contains('active');
            button.querySelector('i').className = isActive ? 'fas fa-heart' : 'far fa-heart';
        });
    });

    // Color scheme toggle
    colorSchemeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

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
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && faqModal.style.display === 'block') {
                faqModal.style.display = 'none';
            }
        });
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

    // Make color and size options clickable/selectable
    const productCardsShop = document.querySelectorAll('.product-card');
    productCardsShop.forEach(card => {
        // Color selection
        const colorOptions = card.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
        // Size selection
        const sizeOptions = card.querySelectorAll('.size-option');
        sizeOptions.forEach(option => {
            option.addEventListener('click', function() {
                sizeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });

    // Helper functions
    function getProductDetails(productCard) {
        return {
            name: productCard.querySelector('.product-title').textContent,
            price: productCard.querySelector('.product-price').textContent,
            image: productCard.querySelector('img').src,
            description: productCard.dataset.description || 'No description available'
        };
    }

    function showQuickViewModal(productDetails) {
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <div class="product-preview">
                    <img src="${productDetails.image}" alt="${productDetails.name}">
                </div>
                <div class="product-info">
                    <h2>${productDetails.name}</h2>
                    <p class="price">${productDetails.price}</p>
                    <div class="product-description">${productDetails.description}</div>
                    <button class="add-to-cart-btn">Add to Cart</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    }

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .category-header,
        .category-option {
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        .category-header:hover,
        .category-option:hover {
            background-color: rgba(108, 99, 255, 0.1);
        }
        
        .category-dropdown {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out;
        }
        
        .category-dropdown.active {
            max-height: 300px;
        }

        .product-card {
            transition: opacity 0.3s ease-out;
        }

        .product-card.fade-in {
            animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .color-option.active {
            transform: scale(1.3);
            box-shadow: 0 0 0 2px #6C63FF;
        }

        .size-option.active {
            background: #6C63FF;
            color: white;
            border-color: #6C63FF;
        }
    `;
    document.head.appendChild(style);

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.category-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
        document.querySelectorAll('.toggle-icon').forEach(icon => {
            icon.classList.remove('rotate');
        });
    });

    // Add ARIA attributes to product action buttons
    addToCartButtons.forEach(btn => btn.setAttribute('aria-label', 'Add to cart'));
    quickViewButtons.forEach(btn => btn.setAttribute('aria-label', 'Quick view product'));
    wishlistButtons.forEach(btn => btn.setAttribute('aria-label', 'Add to wishlist'));

    // Initialize
    console.log('Initializing shop page...'); // Debug log
    filterProducts(null);
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});
