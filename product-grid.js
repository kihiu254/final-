// Product Grid functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize product carousel if exists
    const productCarousel = document.querySelector('.products-carousel');
    if (productCarousel) {
        // Carousel implementation would go here
    }

    // Add to cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            
            // Add to cart logic
            console.log(`Added ${productName} (${productPrice}) to cart`);
            
            // Update cart count
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                const currentCount = parseInt(cartCount.textContent) || 0;
                cartCount.textContent = currentCount + 1;
            }
        });
    });

    // Product rating hover effect
    const productRatings = document.querySelectorAll('.product-rating');
    productRatings.forEach(rating => {
        rating.addEventListener('mouseover', function() {
            this.title = 'Rating: ' + this.textContent.trim();
        });
    });
});
