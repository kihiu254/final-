class BlogManager {
    constructor() {
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.activeFilters = {
            category: 'all',
            search: ''
        };

        // Sample blog data - In a real app, this would come from a backend
        this.blogPosts = [
            {
                id: 1,
                title: "Latest Fashion Trends 2025",
                excerpt: "Discover the hottest fashion trends that will dominate the fashion scene in 2025.",
                image: "images/IMG-20250404-WA0042.jpg",
                category: "fashion",
                date: "2025-04-01",
                likes: 45,
                commentsCount: 12
            },
            {
                id: 2,
                title: "Sustainable Fashion Guide",
                excerpt: "Learn how to make sustainable fashion choices and contribute to a better environment.",
                image: "images/IMG-20250404-WA0043.jpg",
                category: "lifestyle",
                date: "2025-03-28",
                likes: 38,
                commentsCount: 8
            },
            {
                id: 3,
                title: "Summer Collection Preview",
                excerpt: "Get a sneak peek at our upcoming summer collection featuring vibrant designs.",
                image: "images/IMG-20250404-WA0044.jpg",
                category: "fashion",
                date: "2025-03-25",
                likes: 52,
                commentsCount: 15
            },
            {
                id: 4,
                title: "Style Tips for Every Body Type",
                excerpt: "Expert advice on choosing the perfect outfits that complement your body type.",
                image: "images/IMG-20250404-WA0045.jpg",
                category: "trends",
                date: "2025-03-22",
                likes: 41,
                commentsCount: 9
            },
            {
                id: 5,
                title: "Wedding Fashion Guide",
                excerpt: "Complete guide to wedding fashion for brides, grooms, and wedding parties.",
                image: "images/IMG-20250404-WA0046.jpg",
                category: "fashion",
                date: "2025-03-20",
                likes: 63,
                commentsCount: 21
            },
            {
                id: 6,
                title: "Accessorizing 101",
                excerpt: "Master the art of accessorizing with our comprehensive guide.",
                image: "images/IMG-20250404-WA0047.jpg",
                category: "trends",
                date: "2025-03-18",
                likes: 35,
                commentsCount: 7
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPosts();
    }

    setupEventListeners() {
        // Category filters
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilters.category = btn.dataset.category;
                this.currentPage = 1;
                this.loadPosts();
            });
        });

        // Search functionality
        const searchInput = document.getElementById('blogSearch');
        if (searchInput) {
            let debounceTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(() => {
                    this.activeFilters.search = e.target.value.toLowerCase();
                    this.currentPage = 1;
                    this.loadPosts();
                }, 300);
            });
        }
    }

    loadPosts() {
        // Filter posts based on active filters
        let filteredPosts = this.blogPosts;

        if (this.activeFilters.category !== 'all') {
            filteredPosts = filteredPosts.filter(post => 
                post.category === this.activeFilters.category
            );
        }

        if (this.activeFilters.search) {
            filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(this.activeFilters.search) ||
                post.excerpt.toLowerCase().includes(this.activeFilters.search)
            );
        }

        // Calculate pagination
        const totalPosts = filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / this.postsPerPage);
        const start = (this.currentPage - 1) * this.postsPerPage;
        const end = start + this.postsPerPage;
        const currentPosts = filteredPosts.slice(start, end);

        this.renderPosts(currentPosts);
        this.updatePagination(totalPages);
    }

    renderPosts(posts) {
        const container = document.getElementById('blogPosts');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = '<div class="no-posts">No posts found</div>';
            return;
        }

        const postsHTML = posts.map(post => `
            <article class="blog-post">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span class="post-date">${new Date(post.date).toLocaleDateString()}</span>
                        <span class="post-category">${post.category.charAt(0).toUpperCase() + post.category.slice(1)}</span>
                    </div>
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-footer">
                        <a href="#" class="read-more" onclick="alert('Coming Soon!'); return false;">Read More</a>
                        <div class="post-stats">
                            <span><i class="far fa-heart"></i> ${post.likes}</span>
                            <span><i class="far fa-comment"></i> ${post.commentsCount}</span>
                        </div>
                    </div>
                </div>
            </article>
        `).join('');

        container.innerHTML = postsHTML;
    }

    updatePagination(totalPages) {
        const pagination = document.getElementById('blogPagination');
        if (!pagination) return;

        const paginationHTML = `
            <button class="prev-page" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="page-info">Page ${this.currentPage} of ${totalPages}</span>
            <button class="next-page" ${this.currentPage === totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;

        pagination.innerHTML = paginationHTML;

        // Add pagination event listeners
        const prevBtn = pagination.querySelector('.prev-page');
        const nextBtn = pagination.querySelector('.next-page');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadPosts();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.loadPosts();
                }
            });
        }
    }
}

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});
