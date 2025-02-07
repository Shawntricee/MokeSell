//constants and configurations
const RESTDB_API_KEY = 'api-key';
const RESTDB_API_URL = '';

/*contactmanager class to handle all contact page functionality*/
class ContactManager {
    constructor() {
        this.initComponents();
        this.setupEventListeners();
    }
    /*initialize all page components*/
    initComponents() {
        this.initLottieAnimations();
        this.initMaps();
        this.chatWindow = null;
        this.chatState = {
            messages: [],
            isTyping: false
        };
        this.loadChatHistory(); //load previous chat if exists
        this.isSubmitting = false;
    }
    /*initialize Lottie animations*/
    initLottieAnimations() {
        //loading animation for form submissions
        this.loadingAnimation = lottie.loadAnimation({
            container: document.getElementById('loadingAnimation'),
            renderer: 'svg',
            loop: true,
            autoplay: false,
            path: '../animations/loading.json'
        });
    }

    /*initialize google maps*/
    initMaps() {
        const mapOptions = {
            zoom: 15,
            styles: [
                {
                    featureType: 'all',
                    elementType: 'geometry',
                    stylers: [{ color: '#F7F5EF' }]
                },
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#7A6145' }]
                }
            ]
        };
        //initialize headquarters map
        const hqMap = new google.maps.Map(
            document.getElementById('headquartersMap'),
            {
                ...mapOptions,
                center: { lat: 1.3521, lng: 103.8198 }
            }
        );
        new google.maps.Marker({
            position: { lat: 1.3521, lng: 103.8198 },
            map: hqMap,
            title: 'MokeSell Headquarters'
        });
        //initialize other office maps similarly
        const berlinMap = new google.maps.Map(
            document.getElementById('berlinMap'),
            {
                ...mapOptions,
                center: { lat: 52.5200, lng: 13.4050 }
            }
        );
        const viennaMap = new google.maps.Map(
            document.getElementById('viennaMap'),
            {
                ...mapOptions,
                center: { lat: 48.2082, lng: 16.3738 }
            }
        );
        //add markers for other offices
        new google.maps.Marker({
            position: { lat: 52.5200, lng: 13.4050 },
            map: berlinMap,
            title: 'MokeSell Berlin Office'
        });
        new google.maps.Marker({
            position: { lat: 48.2082, lng: 16.3738 },
            map: viennaMap,
            title: 'MokeSell Vienna Office'
        });
    }

    /*setup event listeners for the page*/
    setupEventListeners() {
        //contact form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        //live chat button
        const chatButton = document.querySelector('.live-chat-btn');
        if (chatButton) {
            chatButton.addEventListener('click', () => this.toggleChat());
        }
        //form input validation
        const formInputs = document.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.clearError(input));
        });
    }

    /*handle contact form submission*/
    async handleFormSubmit(event) {
        event.preventDefault();
        if (this.isSubmitting) return;
        const form = event.target;
        if (!this.validateForm(form)) return;
        try {
            this.isSubmitting = true;
            this.showLoading(true);
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            const response = await fetch(`${RESTDB_API_URL}/contact-messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-apikey': RESTDB_API_KEY
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to send message');
            this.showSuccess('Message sent successfully! We\'ll get back to you soon.');
            form.reset();
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('Failed to send message. Please try again later.');
        } finally {
            this.isSubmitting = false;
            this.showLoading(false);
        }
    }

    /*validate individual form input*/
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

    /*validate entire form*/
    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea');
        return Array.from(inputs).every(input => this.validateInput(input));
    }
    /*email validation helper*/
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    /*show error for specific input*/
    showInputError(input, message) {
        this.clearError(input);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentNode.appendChild(errorDiv);
        input.classList.add('form-error');
    }

    /*clear error from input*/
    clearError(input) {
        const errorDiv = input.parentNode.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
        input.classList.remove('form-error');
    }
    /*toggle live chat window*/
    toggleChat() {
        if (this.chatWindow) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    /*open live chat window*/
    openChat() {
        if (!this.chatWindow) {
            const chatWindow = document.getElementById('chatWindow');
            chatWindow.style.display = 'flex';
            setTimeout(() => chatWindow.classList.add('active'), 10);
            this.chatWindow = chatWindow;
            //setup chat event listeners
            this.setupChatEventListeners();
        }
    }

    /*setup chat event listeners*/
    setupChatEventListeners() {
        const closeBtn = this.chatWindow.querySelector('.close-chat');
        const sendBtn = this.chatWindow.querySelector('.send-message');
        const textarea = this.chatWindow.querySelector('textarea');

        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendChatMessage());
        textarea.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendChatMessage();
            }
        });
    }

    /*send chat message*/
    sendChatMessage() {
        const textarea = this.chatWindow.querySelector('textarea');
        const message = textarea.value.trim();
        if (!message) return;
        const messagesContainer = this.chatWindow.querySelector('.chat-messages');
        //add user message
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.textContent = message;
        messagesContainer.appendChild(messageElement);
        //save to chat state
        this.chatState.messages.push({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        //clear input
        textarea.value = '';
        //auto-scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        //show typing indicator
        this.showTypingIndicator();
        //simulate bot response with typing delay
        setTimeout(() => {
            this.hideTypingIndicator();
            const botMessage = document.createElement('div');
            botMessage.className = 'message bot-message';
            botMessage.textContent = this.getSmartResponse(message);
            messagesContainer.appendChild(botMessage);
            //save bot message to chat state
            this.chatState.messages.push({
                type: 'bot',
                content: botMessage.textContent,
                timestamp: new Date()
            });
            //save chat history
            this.saveChatHistory();
            //scroll to latest message
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }

    /*close live chat window*/
    closeChat() {
        if (this.chatWindow) {
            this.chatWindow.classList.remove('active');
            setTimeout(() => {
                this.chatWindow.style.display = 'none';
                this.chatWindow = null;
            }, 300);
        }
    }

    /*show/hide loading animation*/
    showLoading(show) {
        const loader = document.getElementById('loadingAnimation');
        if (show) {
            loader.style.display = 'flex';
            this.loadingAnimation.play();
        } else {
            loader.style.display = 'none';
            this.loadingAnimation.stop();
        }
    }

    /*show success message*/
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        const form = document.getElementById('contactForm');
        form.insertBefore(successDiv, form.firstChild);
        setTimeout(() => successDiv.remove(), 5000);
    }

    /*show error message*/
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        const form = document.getElementById('contactForm');
        form.insertBefore(errorDiv, form.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    }
    /*save chat history to localstorage*/
    saveChatHistory() {
        localStorage.setItem('mokesell_chat_history', JSON.stringify(this.chatState.messages));
    }
    /*load chat history from localstorage*/
    loadChatHistory() {
        const history = localStorage.getItem('mokesell_chat_history');
        if (history) {
            this.chatState.messages = JSON.parse(history);
        }
    }
    /*show typing indicator in chat*/
    showTypingIndicator() {
        const messagesContainer = this.chatWindow.querySelector('.chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.textContent = 'Agent is typing...';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    /*hide typing indicator in chat*/
    hideTypingIndicator() {
        const typingIndicator = this.chatWindow.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    /*get context aware response*/
    getSmartResponse(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('order')) {
            return "I can help you with your order. Could you please provide your order number?";
        } else if (lowerMessage.includes('delivery')) {
            return "For delivery inquiries, please provide your order number and I'll check the status for you.";
        } else if (lowerMessage.includes('return')) {
            return "I'll be happy to assist you with returns. Please note our return policy allows returns within 30 days of purchase.";
        }
        return "Thank you for your message! Our support team will assist you shortly.";
    }
}

//initialize contact manager when dom is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactManager();
});