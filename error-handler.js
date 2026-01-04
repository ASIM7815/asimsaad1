// Error Handler Module
class ErrorHandler {
    static showError(message, type = 'error') {
        const errorDiv = document.createElement('div');
        errorDiv.className = `error-toast ${type}`;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    static handleWebSocketError(error) {
        console.error('WebSocket error:', error);
        this.showError('Connection error. Please check your internet.', 'error');
    }

    static handleWebSocketClose() {
        console.log('Disconnected from server');
        this.showError('Disconnected from server. Reconnecting...', 'warning');
        setTimeout(() => connectWebSocket(), 3000);
    }

    static handleMediaError(error) {
        console.error('Media error:', error);
        let message = 'Camera/Microphone access denied.';
        
        if (error.name === 'NotAllowedError') {
            message = 'Please allow camera and microphone access.';
        } else if (error.name === 'NotFoundError') {
            message = 'No camera or microphone found.';
        } else if (error.name === 'NotReadableError') {
            message = 'Camera/Microphone is already in use.';
        }
        
        this.showError(message, 'error');
    }

    static handleConnectionError() {
        this.showError('Failed to establish peer connection.', 'error');
    }
}
