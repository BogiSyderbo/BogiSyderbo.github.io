document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');
    const emptyState = document.querySelector('.empty-state');

    // Focus input on load
    chatInput.focus();

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Remove empty state if it exists
            if (emptyState) {
                emptyState.style.display = 'none';
            }

            // Add user message
            addMessage(message, 'user');
            chatInput.value = '';

            // Simulate bot typing and response
            showTypingIndicator();

            // Mock response delay (1.5s - 2.5s)
            const delay = Math.random() * 1000 + 1500;

            setTimeout(() => {
                removeTypingIndicator();
                const botResponse = getMockResponse(message);
                addMessage(botResponse, 'bot');
            }, delay);
        }
    }

    function addMessage(text, sender) {
        const bubble = document.createElement('div');
        bubble.classList.add('message-bubble', sender);
        bubble.textContent = text;
        chatHistory.appendChild(bubble);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatHistory.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function getMockResponse(input) {
        const responses = [
            "Tað er áhugavert! Fortel mær meira.",
            "Eg skilji. Hvussu kanst tú hugsa tær at brúka hetta?",
            "Hetta er eitt gott dømi um føroyskt mál.",
            "Orsaka, eg eri enn í beta, men eg læri hvønn dag!",
            "Kanst tú siga tað einaferð afturat?",
            "Føroyar eru eitt vakurt land, heldur tú ikki?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);
});
