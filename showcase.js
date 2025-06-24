document.addEventListener('DOMContentLoaded', function() {
    // Animate showcase section into view
    const showcase = document.querySelector('.product-showcase');
    setTimeout(() => {
        showcase.classList.add('animate-in');
    }, 300);

    // Sidebar navigation and hover animations
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            // Here you would typically load different products based on category
            console.log(`Loading ${this.textContent} products`);
        });
    });

    // Initialize and start countdown timer
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7); // Deal ends in 7 days
    
    // Get countdown elements
    const countdownNumbers = document.querySelectorAll('.countdown-number');
    
    function updateCountdown() {
        const now = new Date();
        const distance = targetDate - now;
        
        if (distance < 0) {
            clearInterval(interval);
            document.querySelector('.countdown').innerHTML = '<div class="deal-ended">Deal Ended!</div>';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        if (countdownNumbers.length === 4) {
            countdownNumbers[0].textContent = days.toString().padStart(2, '0');
            countdownNumbers[1].textContent = hours.toString().padStart(2, '0');
            countdownNumbers[2].textContent = minutes.toString().padStart(2, '0');
            countdownNumbers[3].textContent = seconds.toString().padStart(2, '0');
        }
    }
    
    // Start countdown
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call

    // Listen for countdown end
    document.addEventListener('countdownEnded', (e) => {
        if (e.detail.containerId === 'showcaseCountdown') {
            const showcase = document.querySelector('.product-showcase');
            showcase.querySelector('.countdown-container').innerHTML = `
                <div class="deal-ended">
                    <h3>Deal Ended!</h3>
                    <p>Check back soon for new offers</p>
                </div>
            `;
        }
    });

    // Shop now button
    const shopNowBtn = document.querySelector('.shop-now-btn');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', function() {
            // Redirect to shop page or show product
            window.location.href = 'shop.html';
        });
    }
});
