class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.setupValidation();
        this.setupAutoComplete();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    setupValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('input', () => this.validateField(input));
            
            // Show validation on blur
            input.addEventListener('blur', () => {
                this.validateField(input);
                input.classList.add('touched');
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (field.type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                errorMessage = 'Please enter a valid email address';
                break;

            case 'tel':
                isValid = /^(?:\+\d{1,3}|0)[0-9]{9,10}$/.test(value.replace(/\s+/g, ''));
                errorMessage = 'Please enter a valid phone number';
                break;

            case 'textarea':
                isValid = value.length >= 10;
                errorMessage = 'Message must be at least 10 characters long';
                break;

            default:
                isValid = value.length > 0;
                errorMessage = 'This field is required';
        }

        this.updateFieldValidation(field, isValid, errorMessage);
        return isValid;
    }

    updateFieldValidation(field, isValid, errorMessage) {
        const container = field.parentElement;
        const existingError = container.querySelector('.error-message');

        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid);

        if (!isValid) {
            if (!existingError) {
                const errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                errorElement.textContent = errorMessage;
                container.appendChild(errorElement);
            }
        } else if (existingError) {
            existingError.remove();
        }
    }

    setupAutoComplete() {
        // Add autocomplete for subject field
        const subjectInput = this.form.querySelector('#subject');
        if (subjectInput) {
            const commonSubjects = [
                'Product Inquiry',
                'Order Status',
                'Return Request',
                'Technical Support',
                'Feedback',
                'Partnership',
                'Other'
            ];

            const datalist = document.createElement('datalist');
            datalist.id = 'subject-suggestions';
            
            commonSubjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                datalist.appendChild(option);
            });

            subjectInput.setAttribute('list', 'subject-suggestions');
            document.body.appendChild(datalist);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        try {
            // Validate all fields
            const inputs = this.form.querySelectorAll('input, textarea');
            let isValid = true;

            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                throw new Error('Please fill in all required fields correctly');
            }

            // Show loading state
            window.loadingManager.showLoading('contactForm', {
                text: 'Sending message...'
            });

            // Get form data
            const formData = new FormData(this.form);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            // Send message
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Show success message
            window.loadingManager.showNotification(
                'Message sent successfully! We\'ll get back to you soon.',
                'success'
            );

            // Reset form
            this.form.reset();
            this.form.querySelectorAll('.valid, .invalid').forEach(el => {
                el.classList.remove('valid', 'invalid', 'touched');
            });
            this.form.querySelectorAll('.error-message').forEach(el => el.remove());

            // Add to local storage for reference
            this.saveMessageToHistory(data);

        } catch (error) {
            window.loadingManager.showNotification(error.message, 'error');
        } finally {
            window.loadingManager.hideLoading('contactForm');
        }
    }

    saveMessageToHistory(data) {
        try {
            const history = JSON.parse(localStorage.getItem('contactHistory') || '[]');
            history.unshift({
                ...data,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('contactHistory', JSON.stringify(history.slice(0, 5)));
        } catch (error) {
            console.error('Error saving message history:', error);
        }
    }

    static formatPhoneNumber(number) {
        const cleaned = number.replace(/\D/g, '');
        const format = cleaned.length > 10 ? 
            '+$1 $2 $3 $4' : 
            '($1) $2-$3';
        const args = cleaned.length > 10 ?
            [cleaned.slice(0, 3), cleaned.slice(3, 6), cleaned.slice(6, 9), cleaned.slice(9)] :
            [cleaned.slice(0, 3), cleaned.slice(3, 6), cleaned.slice(6)];
        
        return format.replace(/\$(\d)/g, (_, n) => args[n - 1] || '');
    }
}

// Initialize contact form manager
document.addEventListener('DOMContentLoaded', () => {
    window.contactForm = new ContactFormManager();
});
