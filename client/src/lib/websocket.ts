let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
const messageListeners: ((message: any) => void)[] = [];
let reconnectCount = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const setupWebSocket = (userId: number) => {
  if (socket) {
    closeWebSocket();
  }

  try {
    // Clear any previous connection attempts
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // Get the current URL protocol and host
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log(`Attempting WebSocket connection to ${wsUrl}`);
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established successfully');
      // Reset reconnect counter on successful connection
      reconnectCount = 0;
      
      // Authenticate the connection
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'auth',
          userId
        }));
        console.log('Sent authentication message to WebSocket server');
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data.type);
        
        // Handle welcome message
        if (data.type === 'welcome') {
          console.log('Server welcome message:', data.message);
        }
        
        // Notify all listeners
        messageListeners.forEach(listener => listener(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onclose = (event) => {
      console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      
      // Attempt to reconnect with exponential backoff
      if (reconnectTimer === null && reconnectCount < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * (2 ** reconnectCount), 30000);
        console.log(`Attempting to reconnect in ${delay/1000} seconds (attempt ${reconnectCount + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          reconnectCount++;
          if (userId) {
            setupWebSocket(userId);
          }
        }, delay);
      } else if (reconnectCount >= MAX_RECONNECT_ATTEMPTS) {
        console.error('Maximum WebSocket reconnection attempts reached.');
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      // Let the onclose handler handle reconnection
    };
  } catch (error) {
    console.error('Error setting up WebSocket:', error);
  }
};

export const closeWebSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const sendWebSocketMessage = (message: any) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
    return true;
  }
  return false;
};

export const addMessageListener = (listener: (message: any) => void) => {
  messageListeners.push(listener);
  
  // Return a function to remove the listener
  return () => {
    const index = messageListeners.indexOf(listener);
    if (index !== -1) {
      messageListeners.splice(index, 1);
    }
  };
};

export const isConnected = () => {
  return socket !== null && socket.readyState === WebSocket.OPEN;
};
