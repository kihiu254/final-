document.addEventListener('DOMContentLoaded', function() {
    // Color selection
    const colorButtons = document.querySelectorAll('.color-btn');
    colorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parent = this.closest('.color-select');
            parent.querySelector('.color-btn.selected')?.classList.remove('selected');
            this.classList.add('selected');
        });
    });

    // Add to cart validation
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const selectedColor = productCard.querySelector('.color-btn.selected');
            const selectedSize = productCard.querySelector('.size-option.selected') || 
                               productCard.querySelector('.size-select')?.value;

            // Check if product requires color/size selection
            const hasColorOptions = productCard.querySelector('.color-options') !== null;
            const hasSizeOptions = productCard.querySelector('.size-options') !== null || 
                                 productCard.querySelector('.size-select') !== null;

            if ((hasColorOptions && !selectedColor) || (hasSizeOptions && !selectedSize)) {
                window.loadingManager.showNotification(
                    `Please select ${hasColorOptions && !selectedColor ? 'a color' : ''}${hasColorOptions && hasSizeOptions && !selectedColor && !selectedSize ? ' and ' : ''}${hasSizeOptions && !selectedSize ? 'a size' : ''}`,
                    'error'
                );
                return;
            }

            // Get product details
            const product = {
                id: productCard.dataset.id || Date.now(),
                name: productCard.querySelector('.product-name').textContent,
                price: parseFloat(productCard.querySelector('.product-price').textContent.replace(/[^0-9.]/g, '')),
                image: productCard.querySelector('.product-image').src,
                color: selectedColor?.dataset.color || 'N/A',
                size: selectedSize || 'One Size',
                quantity: 1
            };

            // Add to cart
            window.cart.addItem(product);
        });
    });

    // Add size selection functionality
    document.querySelectorAll('.size-option').forEach(option => {
        option.addEventListener('click', function() {
            const parent = this.closest('.size-options');
            parent.querySelector('.size-option.selected')?.classList.remove('selected');
            this.classList.add('selected');
        });
    });
});
