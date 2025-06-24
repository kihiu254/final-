document.addEventListener('DOMContentLoaded', () => {
    // Handle color option selection
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const parentCard = e.target.closest('.product-card');
            parentCard.querySelectorAll('.color-option').forEach(opt => {
                opt.style.border = '2px solid var(--surface)';
            });
            e.target.style.border = '2px solid var(--accent)';
        });
    });

    // Handle size option selection
    const sizeOptions = document.querySelectorAll('.size-option');
    sizeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const parentCard = e.target.closest('.product-card');
            parentCard.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            e.target.classList.add('selected');
        });
    });

    // Handle quick view button
    const quickViewButtons = document.querySelectorAll('.quick-view');
    quickViewButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const productImage = productCard.querySelector('.product-image img').src;
            
            // You can implement a modal or quick view panel here
            console.log('Quick view:', { productTitle, productPrice, productImage });
        });
    });

    // Handle wishlist button
    const wishlistButtons = document.querySelectorAll('.add-to-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const icon = e.target.closest('.add-to-wishlist').querySelector('i');
            icon.classList.toggle('fas');
            icon.classList.toggle('far');
            
            // You can implement wishlist functionality here
            const productCard = e.target.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            console.log('Toggle wishlist:', productTitle);
        });
    });

    // Handle add to cart button
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const productTitle = productCard.querySelector('.product-title').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const selectedColor = productCard.querySelector('.color-option[style*="var(--accent)"]');
            const selectedSize = productCard.querySelector('.size-option.selected');
            
            if (!selectedColor || !selectedSize) {
                alert('Please select both color and size before adding to cart');
                return;
            }
            
            // You can implement cart functionality here
            console.log('Add to cart:', {
                productTitle,
                productPrice,
                color: selectedColor.style.backgroundColor,
                size: selectedSize.textContent
            });
            
            // Show success message
            const originalText = e.target.textContent;
            e.target.textContent = 'Added to Cart!';
            e.target.disabled = true;
            
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.disabled = false;
            }, 2000);
        });
    });
});