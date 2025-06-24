/**
 * Customer Service Shared JavaScript
 * Handles common functionality for:
 * - Shipping Information
 * - Returns & Exchanges
 * - Size Guide
 * - Privacy Policy
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize accordion functionality for sections
    const sections = document.querySelectorAll('.expandable-section');
    
    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        const content = section.querySelector('.section-content');
        
        if (header && content) {
            header.addEventListener('click', () => {
                content.classList.toggle('expanded');
                header.classList.toggle('active');
            });
        }
    });

    // Initialize print buttons
    const printButtons = document.querySelectorAll('.print-section');
    
    printButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.closest('.printable-section');
            if (section) {
                const printContent = section.innerHTML;
                const originalContent = document.body.innerHTML;
                
                document.body.innerHTML = `
                    <style>
                        @media print {
                            body { padding: 20px; }
                            .no-print { display: none !important; }
                            a { text-decoration: none !important; }
                        }
                    </style>
                    ${printContent}
                    <button class="no-print" onclick="window.location.reload()" 
                            style="position:fixed;top:20px;right:20px;padding:10px;background:#f44336;color:white;border:none;border-radius:4px;cursor:pointer;">
                        Close Print View
                    </button>
                `;
                
                window.print();
                document.body.innerHTML = originalContent;
            }
        });
    });

    // Initialize back to top button
    const backToTop = document.querySelector('.back-to-top');
    
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTop.style.display = 'block';
            } else {
                backToTop.style.display = 'none';
            }
        });
        
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({top: 0, behavior: 'smooth'});
        });
    }

    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(el => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = el.getAttribute('data-tooltip');
        document.body.appendChild(tooltip);
        
        el.addEventListener('mouseenter', (e) => {
            const rect = el.getBoundingClientRect();
            tooltip.style.left = `${rect.left + rect.width/2 - tooltip.offsetWidth/2}px`;
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
        });
        
        el.addEventListener('mouseleave', () => {
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
        });
    });
});

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
