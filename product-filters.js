class ProductFilterManager {
    constructor() {
        this.activeFilters = {
            category: [],
            price: { min: null, max: null },
            size: [],
            color: [],
            rating: null,
            sort: 'featured'
        };
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupFilterListeners();
        this.setupSortingControls();
        this.setupPriceRangeFilter();
        this.setupMobileFilters();
        this.loadFromURL();
        this.applyFilters();
    }

    setupFilterListeners() {
        // Category filters
        document.querySelectorAll('.category-filter').forEach(filter => {
            filter.addEventListener('change', (e) => {
                const category = e.target.value;
                if (e.target.checked) {
                    this.activeFilters.category.push(category);
                } else {
                    this.activeFilters.category = this.activeFilters.category.filter(c => c !== category);
                }
                this.applyFilters();
            });
        });

        // Size filters
        document.querySelectorAll('.size-filter').forEach(filter => {
            filter.addEventListener('change', (e) => {
                const size = e.target.value;
                if (e.target.checked) {
                    this.activeFilters.size.push(size);
                } else {
                    this.activeFilters.size = this.activeFilters.size.filter(s => s !== size);
                }
                this.applyFilters();
            });
        });

        // Color filters
        document.querySelectorAll('.color-filter').forEach(filter => {
            filter.addEventListener('change', (e) => {
                const color = e.target.value;
                if (e.target.checked) {
                    this.activeFilters.color.push(color);
                } else {
                    this.activeFilters.color = this.activeFilters.color.filter(c => c !== color);
                }
                this.applyFilters();
            });
        });

        // Rating filter
        document.querySelectorAll('.rating-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.activeFilters.rating = this.activeFilters.rating === rating ? null : rating;
                this.updateRatingUI();
                this.applyFilters();
            });
        });

        // Clear all filters
        document.querySelector('.clear-filters')?.addEventListener('click', () => {
            this.clearAllFilters();
        });
    }

    setupSortingControls() {
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.activeFilters.sort = e.target.value;
                this.applyFilters();
            });
        }
    }

    setupPriceRangeFilter() {
        const priceRange = document.querySelector('.price-range');
        if (!priceRange) return;

        noUiSlider.create(priceRange, {
            start: [0, 1000],
            connect: true,
            range: {
                'min': 0,
                'max': 1000
            },
            format: {
                to: value => Math.round(value),
                from: value => parseInt(value)
            }
        });

        const minPriceInput = document.querySelector('.min-price');
        const maxPriceInput = document.querySelector('.max-price');

        priceRange.noUiSlider.on('update', (values, handle) => {
            const [min, max] = values;
            minPriceInput.value = min;
            maxPriceInput.value = max;
            this.activeFilters.price = { min, max };
        });

        priceRange.noUiSlider.on('change', () => {
            this.applyFilters();
        });

        // Sync manual input with slider
        [minPriceInput, maxPriceInput].forEach(input => {
            input.addEventListener('change', () => {
                const min = parseInt(minPriceInput.value);
                const max = parseInt(maxPriceInput.value);
                priceRange.noUiSlider.set([min, max]);
            });
        });
    }

    setupMobileFilters() {
        const filterToggle = document.querySelector('.filter-toggle');
        const filterPanel = document.querySelector('.filter-panel');
        
        if (filterToggle && filterPanel) {
            filterToggle.addEventListener('click', () => {
                filterPanel.classList.toggle('show');
                document.body.classList.toggle('filters-open');
                filterToggle.setAttribute('aria-expanded', 
                    filterPanel.classList.contains('show'));
            });

            // Close filters panel on outside click
            document.addEventListener('click', (e) => {
                if (filterPanel.classList.contains('show') && 
                    !filterPanel.contains(e.target) && 
                    !filterToggle.contains(e.target)) {
                    filterPanel.classList.remove('show');
                    document.body.classList.remove('filters-open');
                    filterToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Close on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && filterPanel.classList.contains('show')) {
                    filterPanel.classList.remove('show');
                    document.body.classList.remove('filters-open');
                    filterToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        // Load categories
        const categories = params.getAll('category');
        this.activeFilters.category = categories;

        // Load price range
        const minPrice = params.get('minPrice');
        const maxPrice = params.get('maxPrice');
        if (minPrice && maxPrice) {
            this.activeFilters.price = {
                min: parseInt(minPrice),
                max: parseInt(maxPrice)
            };
        }

        // Load sizes
        const sizes = params.getAll('size');
        this.activeFilters.size = sizes;

        // Load colors
        const colors = params.getAll('color');
        this.activeFilters.color = colors;

        // Load rating
        const rating = params.get('rating');
        this.activeFilters.rating = rating ? parseInt(rating) : null;

        // Load sort
        const sort = params.get('sort');
        if (sort) this.activeFilters.sort = sort;

        this.updateUI();
    }

    updateUI() {
        // Update checkboxes
        this.activeFilters.category.forEach(category => {
            document.querySelector(`input[value="${category}"]`)?.checked = true;
        });

        this.activeFilters.size.forEach(size => {
            document.querySelector(`input[value="${size}"]`)?.checked = true;
        });

        this.activeFilters.color.forEach(color => {
            document.querySelector(`input[value="${color}"]`)?.checked = true;
        });

        // Update price range
        const priceRange = document.querySelector('.price-range');
        if (priceRange?.noUiSlider && this.activeFilters.price.min !== null) {
            priceRange.noUiSlider.set([
                this.activeFilters.price.min,
                this.activeFilters.price.max
            ]);
        }

        // Update rating
        this.updateRatingUI();

        // Update sort select
        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.value = this.activeFilters.sort;
        }
    }

    updateRatingUI() {
        document.querySelectorAll('.rating-filter').forEach(filter => {
            const rating = parseInt(filter.dataset.rating);
            filter.classList.toggle('active', rating === this.activeFilters.rating);
        });
    }

    updateURL() {
        const params = new URLSearchParams();

        // Add categories
        this.activeFilters.category.forEach(category => {
            params.append('category', category);
        });

        // Add price range
        if (this.activeFilters.price.min !== null) {
            params.append('minPrice', this.activeFilters.price.min);
            params.append('maxPrice', this.activeFilters.price.max);
        }

        // Add sizes
        this.activeFilters.size.forEach(size => {
            params.append('size', size);
        });

        // Add colors
        this.activeFilters.color.forEach(color => {
            params.append('color', color);
        });

        // Add rating
        if (this.activeFilters.rating) {
            params.append('rating', this.activeFilters.rating);
        }

        // Add sort
        params.append('sort', this.activeFilters.sort);

        // Update URL without reloading
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, '', newURL);
    }

    async applyFilters() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.showLoading();
            this.updateURL();

            const response = await fetch('/api/products/filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.activeFilters)
            });

            if (!response.ok) throw new Error('Failed to filter products');

            const { products, total } = await response.json();
            this.updateProductGrid(products);
            this.updateFilterCounts(total);

            // Announce to screen readers
            window.accessibility.announce(
                `${products.length} products found matching your filters`
            );

        } catch (error) {
            console.error('Filter error:', error);
            window.loadingManager.showNotification(
                'Failed to apply filters. Please try again.',
                'error'
            );
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    updateProductGrid(products) {
        const grid = document.querySelector('.product-grid');
        if (!grid) return;

        if (!products.length) {
            grid.innerHTML = `
                <div class="no-results">
                    <h3>No products found</h3>
                    <p>Try adjusting your filters to find what you're looking for.</p>
                    <button class="clear-filters">Clear all filters</button>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    ${product.isNew ? '<span class="badge new">New</span>' : ''}
                    ${product.discount ? `
                        <span class="badge discount">-${product.discount}%</span>
                    ` : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="product-price">
                        ${product.discount ? `
                            <span class="original-price">$${product.originalPrice}</span>
                        ` : ''}
                        <span class="current-price">$${product.price}</span>
                    </div>
                    <div class="product-rating">
                        ${this.generateRatingStars(product.rating)}
                        <span class="rating-count">(${product.ratingCount})</span>
                    </div>
                    <button class="add-to-cart" aria-label="Add ${product.name} to cart">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');

        // Reinitialize product interactions
        window.productInteractions?.initializeProductCards();
    }

    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return `
            ${Array(fullStars).fill('<i class="fas fa-star"></i>').join('')}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${Array(emptyStars).fill('<i class="far fa-star"></i>').join('')}
        `;
    }

    updateFilterCounts(totals) {
        // Update category counts
        Object.entries(totals.categories).forEach(([category, count]) => {
            const countElement = document.querySelector(
                `.category-count[data-category="${category}"]`
            );
            if (countElement) {
                countElement.textContent = `(${count})`;
            }
        });

        // Update size counts
        Object.entries(totals.sizes).forEach(([size, count]) => {
            const countElement = document.querySelector(
                `.size-count[data-size="${size}"]`
            );
            if (countElement) {
                countElement.textContent = `(${count})`;
            }
        });

        // Update color counts
        Object.entries(totals.colors).forEach(([color, count]) => {
            const countElement = document.querySelector(
                `.color-count[data-color="${color}"]`
            );
            if (countElement) {
                countElement.textContent = `(${count})`;
            }
        });
    }

    showLoading() {
        const grid = document.querySelector('.product-grid');
        if (grid) {
            grid.classList.add('loading');
            window.loadingManager.showLoading('productGrid');
        }
    }

    hideLoading() {
        const grid = document.querySelector('.product-grid');
        if (grid) {
            grid.classList.remove('loading');
            window.loadingManager.hideLoading('productGrid');
        }
    }

    clearAllFilters() {
        this.activeFilters = {
            category: [],
            price: { min: null, max: null },
            size: [],
            color: [],
            rating: null,
            sort: 'featured'
        };

        // Reset UI
        document.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });

        const priceRange = document.querySelector('.price-range');
        if (priceRange?.noUiSlider) {
            priceRange.noUiSlider.reset();
        }

        const sortSelect = document.querySelector('.sort-select');
        if (sortSelect) {
            sortSelect.value = 'featured';
        }

        this.updateRatingUI();
        this.applyFilters();
    }
}

// Initialize product filter manager
document.addEventListener('DOMContentLoaded', () => {
    window.productFilters = new ProductFilterManager();
});
