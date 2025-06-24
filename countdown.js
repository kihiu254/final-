class CountdownTimer {
    constructor(targetDate, containerId) {
        this.targetDate = new Date(targetDate).getTime();
        this.container = document.getElementById(containerId);
        this.interval = null;
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Create countdown elements
        const elements = ['days', 'hours', 'minutes', 'seconds'].map(unit => {
            const div = document.createElement('div');
            div.className = 'countdown-item';
            div.innerHTML = `
                <span class="countdown-value" data-unit="${unit}">00</span>
                <span class="countdown-label">${unit}</span>
            `;
            return div;
        });

        this.container.append(...elements);
        this.startCountdown();
    }

    startCountdown() {
        this.updateDisplay();
        this.interval = setInterval(() => this.updateDisplay(), 1000);
    }

    updateDisplay() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;

        if (distance < 0) {
            clearInterval(this.interval);
            this.handleCountdownEnd();
            return;
        }

        const timeUnits = {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };

        Object.entries(timeUnits).forEach(([unit, value]) => {
            const element = this.container.querySelector(`[data-unit="${unit}"]`);
            if (element) {
                element.textContent = value.toString().padStart(2, '0');
                this.animateValue(element);
            }
        });
    }

    animateValue(element) {
        element.classList.add('countdown-animate');
        setTimeout(() => element.classList.remove('countdown-animate'), 500);
    }

    handleCountdownEnd() {
        this.container.innerHTML = '<div class="countdown-ended">Offer has ended!</div>';
        
        // Dispatch custom event
        const event = new CustomEvent('countdownEnded', {
            detail: { containerId: this.container.id }
        });
        document.dispatchEvent(event);

        // Optional: Show next available offer
        this.showNextOffer();
    }

    showNextOffer() {
        const offers = [
            { 
                title: 'New Season Sale',
                discount: '20% OFF',
                code: 'SEASON20',
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            },
            {
                title: 'Weekend Special',
                discount: '15% OFF',
                code: 'WEEKEND15',
                validUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
            }
        ];

        const nextOffer = offers[Math.floor(Math.random() * offers.length)];
        
        const offerElement = document.createElement('div');
        offerElement.className = 'next-offer';
        offerElement.innerHTML = `
            <h3>${nextOffer.title}</h3>
            <p class="discount">${nextOffer.discount}</p>
            <p class="code">Use code: ${nextOffer.code}</p>
            <p class="validity">Valid until: ${nextOffer.validUntil.toLocaleDateString()}</p>
        `;

        this.container.appendChild(offerElement);
    }

    static createMultipleCountdowns(countdowns) {
        return countdowns.map(({ date, containerId }) => 
            new CountdownTimer(date, containerId)
        );
    }
}

// Initialize countdowns when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Example usage for multiple countdowns
    const countdowns = [
        {
            date: '2025-12-31T23:59:59',
            containerId: 'mainCountdown'
        },
        {
            date: '2025-04-30T23:59:59',
            containerId: 'saleCountdown'
        }
    ];

    CountdownTimer.createMultipleCountdowns(countdowns);

    // Listen for countdown end events
    document.addEventListener('countdownEnded', (e) => {
        console.log(`Countdown ended for ${e.detail.containerId}`);
        // Implement any additional logic for when a countdown ends
    });
});

// Export for use in other modules
export default CountdownTimer;
