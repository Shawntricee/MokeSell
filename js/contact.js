//constants
const API_ENDPOINT = ''; //API endpoint here

//contact form handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.initializeForm();
    }

    initializeForm() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupInputValidation();
    }

    setupInputValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        if (!value) {
            this.showInputError(input, 'This field is required');
            return false;
        }

        if (input.type === 'email' && !this.isValidEmail(value)) {
            this.showInputError(input, 'Please enter a valid email address');
            return false;
        }

        this.clearError(input);
        return true;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showInputError(input, message) {
        this.clearError(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        input.classList.add('error');
    }

    clearError(input) {
        const errorDiv = input.parentNode.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
        input.classList.remove('error');
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const inputs = this.form.querySelectorAll('input, textarea');
        const isValid = Array.from(inputs).every(input => this.validateInput(input));
        
        if (!isValid) return;

        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        try {
            this.showLoading();
            const response = await this.submitForm(data);
            
            if (response.success) {
                this.showSuccess();
                this.form.reset();
            } else {
                this.showError(response.message || 'Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('Unable to send message. Please try again later.');
        } finally {
            this.hideLoading();
        }
    }

    async submitForm(data) {
        const response = await fetch(`${API_ENDPOINT}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    showLoading() {
        const submitBtn = this.form.querySelector('.send-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'SENDING...';
    }

    hideLoading() {
        const submitBtn = this.form.querySelector('.send-btn');
        submitBtn.disabled = false;
        submitBtn.textContent = 'SEND';
    }

    showSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you! Your message has been sent successfully.';
        this.form.insertBefore(successMessage, this.form.firstChild);
        
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }

    showError(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message form-error';
        errorMessage.textContent = message;
        this.form.insertBefore(errorMessage, this.form.firstChild);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }
}

//live chat implementation
class LiveChat {
    constructor() {
        this.chatButton = document.querySelector('.live-chat-btn');
        this.chatWindow = null;
        this.initialize();
    }

    initialize() {
        this.chatButton.addEventListener('click', () => this.toggleChat());
    }

    createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.className = 'chat-window';
        chatWindow.innerHTML = `
            <div class="chat-header">
                <h3>Live Chat Support</h3>
                <button class="close-chat">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea placeholder="Type your message..."></textarea>
                <button class="send-message">Send</button>
            </div>
        `;
        
        document.body.appendChild(chatWindow);
        this.setupChatEvents(chatWindow);
        return chatWindow;
    }

    setupChatEvents(chatWindow) {
        const closeBtn = chatWindow.querySelector('.close-chat');
        const sendBtn = chatWindow.querySelector('.send-message');
        const textarea = chatWindow.querySelector('textarea');

        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage(textarea.value));
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(textarea.value);
            }
        });
    }

    toggleChat() {
        if (this.chatWindow) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        if (!this.chatWindow) {
            this.chatWindow = this.createChatWindow();
            setTimeout(() => {
                this.chatWindow.classList.add('active');
            }, 10);
        }
    }

    closeChat() {
        if (this.chatWindow) {
            this.chatWindow.classList.remove('active');
            setTimeout(() => {
                this.chatWindow.remove();
                this.chatWindow = null;
            }, 300);
        }
    }

    sendMessage(message) {
        if (!message.trim()) return;

        const messagesContainer = this.chatWindow.querySelector('.chat-messages');
        const textarea = this.chatWindow.querySelector('textarea');
        
        //add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.textContent = message;
        messagesContainer.appendChild(userMessage);
        
        //clear input
        textarea.value = '';
        
        //scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        //simulate response (replace with actual API call)
        setTimeout(() => {
            const botMessage = document.createElement('div');
            botMessage.className = 'message bot-message';
            botMessage.textContent = 'Thanks for your message! Our team will assist you shortly.';
            messagesContainer.appendChild(botMessage);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }
}

//initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = new ContactForm();
    const liveChat = new LiveChat();
});