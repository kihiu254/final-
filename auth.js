class AuthManager {
    constructor() {
        this.config = {
            tokenKey: 'auth_token',
            refreshTokenKey: 'refresh_token',
            sessionDuration: 3600, // 1 hour
            apiBaseUrl: '/api/auth'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(new FormData(loginForm));
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleSignup(new FormData(signupForm));
            });

            // Real-time password validation
            const passwordInput = signupForm.querySelector('input[type="password"]');
            if (passwordInput) {
                passwordInput.addEventListener('input', (e) => {
                    this.validatePassword(e.target.value);
                });
            }
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        // Update UI with validation status
        Object.entries(requirements).forEach(([requirement, valid]) => {
            const element = document.querySelector(`.password-requirement.${requirement}`);
            if (element) {
                element.classList.toggle('valid', valid);
            }
        });

        return Object.values(requirements).every(Boolean);
    }

    async handleLogin(formData) {
        try {
            window.loadingManager.showLoading('loginForm');

            const credentials = {
                email: formData.get('email'),
                password: formData.get('password'),
                remember: formData.get('remember') === 'on'
            };

            const response = await fetch(`${this.config.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            this.handleAuthSuccess(data);
            window.loadingManager.showNotification('Login successful!', 'success');

            // Redirect after successful login
            setTimeout(() => {
                window.location.href = formData.get('redirect') || '/';
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            window.loadingManager.showNotification(error.message, 'error');
        } finally {
            window.loadingManager.hideLoading('loginForm');
        }
    }

    async handleSignup(formData) {
        try {
            window.loadingManager.showLoading('signupForm');

            const password = formData.get('password');
            if (!this.validatePassword(password)) {
                throw new Error('Password does not meet requirements');
            }

            if (password !== formData.get('confirmPassword')) {
                throw new Error('Passwords do not match');
            }

            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: password
            };

            const response = await fetch(`${this.config.apiBaseUrl}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            this.handleAuthSuccess(data);
            window.loadingManager.showNotification('Account created successfully!', 'success');

            // Redirect after successful signup
            setTimeout(() => {
                window.location.href = '/verify-email';
            }, 1000);

        } catch (error) {
            console.error('Signup error:', error);
            window.loadingManager.showNotification(error.message, 'error');
        } finally {
            window.loadingManager.hideLoading('signupForm');
        }
    }

    handleAuthSuccess(data) {
        // Store tokens
        localStorage.setItem(this.config.tokenKey, data.token);
        if (data.refreshToken) {
            localStorage.setItem(this.config.refreshTokenKey, data.refreshToken);
        }

        // Update UI
        this.updateAuthUI(true);

        // Set up token refresh
        this.setupTokenRefresh();
    }

    async handleLogout() {
        try {
            window.loadingManager.showLoading('logoutBtn');

            // Call logout endpoint to invalidate token
            await fetch(`${this.config.apiBaseUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            // Clear local storage
            localStorage.removeItem(this.config.tokenKey);
            localStorage.removeItem(this.config.refreshTokenKey);

            // Update UI
            this.updateAuthUI(false);

            window.loadingManager.showNotification('Logged out successfully', 'success');

            // Redirect to home page
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);

        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            window.loadingManager.hideLoading('logoutBtn');
        }
    }

    updateAuthUI(isAuthenticated) {
        document.body.classList.toggle('authenticated', isAuthenticated);
        
        // Update navigation items
        const authNav = document.querySelector('.auth-nav');
        if (authNav) {
            authNav.innerHTML = isAuthenticated 
                ? this.getAuthenticatedNav() 
                : this.getUnauthenticatedNav();
        }
    }

    getAuthenticatedNav() {
        return `
            <li><a href="/profile">My Profile</a></li>
            <li><a href="/orders">My Orders</a></li>
            <li><button class="logout-btn">Logout</button></li>
        `;
    }

    getUnauthenticatedNav() {
        return `
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Sign Up</a></li>
        `;
    }

    setupTokenRefresh() {
        const token = this.getToken();
        if (!token) return;

        // Parse token to get expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = (payload.exp * 1000) - Date.now();

        // Set up refresh before token expires
        setTimeout(async () => {
            try {
                const response = await fetch(`${this.config.apiBaseUrl}/refresh`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        refreshToken: localStorage.getItem(this.config.refreshTokenKey)
                    })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem(this.config.tokenKey, data.token);
                    this.setupTokenRefresh(); // Set up next refresh
                } else {
                    // Token refresh failed, log out user
                    this.handleLogout();
                }
            } catch (error) {
                console.error('Token refresh error:', error);
                this.handleLogout();
            }
        }, expiresIn - 60000); // Refresh 1 minute before expiration
    }

    getToken() {
        return localStorage.getItem(this.config.tokenKey);
    }

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch (error) {
            return false;
        }
    }

    async checkAuthStatus() {
        if (!this.isAuthenticated()) {
            this.updateAuthUI(false);
            return;
        }

        try {
            const response = await fetch(`${this.config.apiBaseUrl}/verify`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Token invalid');
            }

            this.updateAuthUI(true);
        } catch (error) {
            console.error('Auth status check failed:', error);
            this.handleLogout();
        }
    }

    // Utility method for protected API calls
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            // Token expired or invalid
            this.handleLogout();
            throw new Error('Authentication expired');
        }

        return response;
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.auth = new AuthManager();
});

export default AuthManager;
