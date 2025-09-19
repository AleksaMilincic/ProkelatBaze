import axios from 'axios';
import io from 'socket.io-client';

const COLLABORATION_SERVICE_URL = process.env.REACT_APP_COLLABORATION_SERVICE_URL || 'http://localhost:3004';

const collaborationApi = axios.create({
  baseURL: COLLABORATION_SERVICE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
collaborationApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class SocketManager {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
  }

  connect() {
    const token = localStorage.getItem('token');
    
    this.socket = io(COLLABORATION_SERVICE_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to collaboration service');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from collaboration service');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinForm(formId) {
    if (this.socket) {
      this.socket.emit('join_form', formId);
    }
  }

  leaveForm(formId) {
    if (this.socket) {
      this.socket.emit('leave_form', formId);
    }
  }

  onUserEditing(callback) {
    if (this.socket) {
      this.socket.on('user_editing', callback);
    }
  }

  onUserTypingComment(callback) {
    if (this.socket) {
      this.socket.on('user_typing_comment', callback);
    }
  }

  emitFormEditing(formId, field) {
    if (this.socket) {
      this.socket.emit('form_editing', { formId, field });
    }
  }

  emitTypingComment(formId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing_comment', { formId, isTyping });
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketManager = new SocketManager();

export const collaborationService = {
  async getComments(formId) {
    const response = await collaborationApi.get(`/api/comments/${formId}`);
    return response.data;
  },

  async addComment(formId, data) {
    const response = await collaborationApi.post(`/api/comments/${formId}`, data);
    return response.data;
  },

  async updateComment(formId, commentId, data) {
    const response = await collaborationApi.put(`/api/comments/${formId}/${commentId}`, data);
    return response.data;
  },

  async deleteComment(formId, commentId) {
    const response = await collaborationApi.delete(`/api/comments/${formId}/${commentId}`);
    return response.data;
  },

  async getActivities(formId) {
    const response = await collaborationApi.get(`/api/activities/${formId}`);
    return response.data;
  },

  // Socket management
  connectSocket() {
    return socketManager.connect();
  },

  disconnectSocket() {
    socketManager.disconnect();
  },

  joinForm(formId) {
    socketManager.joinForm(formId);
  },

  leaveForm(formId) {
    socketManager.leaveForm(formId);
  }
};