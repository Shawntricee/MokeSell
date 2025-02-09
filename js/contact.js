/*contactmanager class to handle all contact page functionality*/
class ContactManager {
    constructor() {
        this.initComponents();
        this.setupEventListeners();
        this.chatData = null;
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
        this.isSubmitting = false;
        this.loadChatData();
    }

    /*initialize Lottie animations*/
    initLottieAnimations() {
        //loading animation for form submissions
        this.loadingAnimation = lottie.loadAnimation({
            container: document.getElementById('loadingAnimation'),
            renderer: 'svg',
            loop: true,
            autoplay: false,
        });
    }
    /*initialize google maps*/
    initMaps() {
        const mapOptions = {
            zoom: 16,
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
        try {
            //headquarters
            const hqMap = new google.maps.Map(
                document.getElementById('headquartersMap'),
                {
                    ...mapOptions,
                    center: { lat: 1.3455, lng: 103.8168 } //coordinates for bukit timah
                }
            );
            new google.maps.Marker({
                position: { lat: 1.3455, lng: 103.8168 },
                map: hqMap,
                title: 'MokeSell Headquarters - Bukit Timah'
            });
            //berlin office
            const berlinMap = new google.maps.Map(
                document.getElementById('berlinMap'),
                {
                    ...mapOptions,
                    center: { lat: 52.5200, lng: 13.4050 } //coordinates for berlin
                }
            );
            new google.maps.Marker({
                position: { lat: 52.5200, lng: 13.4050 },
                map: berlinMap,
                title: 'MokeSell Berlin Office'
            });
            //vienna office
            const viennaMap = new google.maps.Map(
                document.getElementById('viennaMap'),
                {
                    ...mapOptions,
                    center: { lat: 48.2082, lng: 16.3738 } //coordinates for vienna
                }
            );
            new google.maps.Marker({
                position: { lat: 48.2082, lng: 16.3738 },
                map: viennaMap,
                title: 'MokeSell Vienna Office'
            });
        } catch (error) {
            console.error('Error loading Google Maps:', error);
            this.handleMapLoadError();
        }
    }

    //handle map loading errors
    handleMapLoadError() {
        const mapContainers = document.querySelectorAll('.office-map');
        mapContainers.forEach(container => {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; background-color: #f8f8f8;">
                    <p>Unable to load map. Please check your internet connection.</p>
                </div>
            `;
        });
    }
    //load chat data from API
    async loadChatData() {
        try {
            // Replace with your API URL
            const apiUrl = 'https://mokesell-39a1.restdb.io/rest/chat';  // Example API URL
            
            const response = await fetch(apiUrl, {
                method: 'GET',  // Using GET method to fetch data
                headers: {
                    'Content-Type': 'application/json',
                    "x-apikey": "67a5a5b09c979727011b2a7b",
                    "Cache-Control": "no-cache"
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch chat data');
            }
    
            this.chatData = await response.json();
            console.log('Chat data loaded from API', this.chatData);
        } catch (error) {
            console.error('Error loading chat data:', error);
        }
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
        //form input validation for form fields, exclude the chat textarea
        const formInputs = document.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            if (input.id !== 'chatMessageInput') { // Exclude the chat textarea
                input.addEventListener('blur', () => this.validateInput(input));
                input.addEventListener('input', () => this.clearError(input));
            }
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
            
            // Simulating form processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.showSuccess("Message sent successfully! We'll get back to you soon.");
            form.reset();
        } catch (error) {
            console.error("Form submission error:", error);
            this.showError("Failed to send message. Please try again later.");
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
        if (this.chatWindow && this.chatWindow.classList.contains('active')) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    /*open live chat window*/
    openChat() {
        if (!this.chatWindow) {
            this.chatWindow = document.getElementById('chatWindow');
            this.setupChatEventListeners();  // Ensure chat event listeners are set up once
        }
        this.chatWindow.style.display = 'flex';  // show the chat window
        setTimeout(() => this.chatWindow.classList.add('active'), 10);  // Add the active class
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
        //simulate bot response with smart logic
        setTimeout(() => {
            this.hideTypingIndicator();
            const botMessage = document.createElement('div');
            botMessage.className = 'message bot-message';
            
            //use auto-response messages from API
            console.log('Checking chatData before assignment:', this.chatData);
            const autoResponses = (this.chatData.length > 0 && this.chatData[0].messages) ? this.chatData[0].messages : [];
            console.log('Auto-responses:', autoResponses);

            const smartResponse = this.getSmartResponse(message, autoResponses);
            botMessage.textContent = smartResponse;
            messagesContainer.appendChild(botMessage);
            //save bot message to chat state
            this.chatState.messages.push({
                type: 'bot',
                content: botMessage.textContent,
                timestamp: new Date()
            });
            //scroll to latest message
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 1000);
    }

    /*close live chat window*/
    closeChat() {
        if (this.chatWindow) {
            this.chatWindow.classList.remove('active');  // remove the active class
            const messagesContainer = this.chatWindow.querySelector('.chat-messages');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';  // clear all messages
            }
            setTimeout(() => {
                this.chatWindow.style.display = 'none';  //hide the chat window after a slight delay
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

    /*get context aware response with JSON integration*/
    getSmartResponse(message, autoResponses) {
        const lowerMessage = message.toLowerCase();
        
        //check for specific keywords using JSON auto-responses
        const keywordResponses = [
            { keywords: ['order', 'shipping'], response: autoResponses[1]?.content },
            { keywords: ['voucher', 'discount'], response: autoResponses[2]?.content },
            { keywords: ['help', 'hi', 'hello'], response: autoResponses[0]?.content }
        ];

        //find the first matching response
        for (let item of keywordResponses) {
            if (item.keywords.some(keyword => lowerMessage.includes(keyword))) {
                return item.response || "Thank you for your message! Our support team will assist you shortly.";
            }
        }
        //fallback default response
        return "Thank you for your message! Our support team will assist you shortly.";
    }
}

//initialize contact manager when dom is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactManager();
});