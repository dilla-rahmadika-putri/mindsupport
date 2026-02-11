/**
 * MindSupport API Service
 * Handles all API calls to the FastAPI backend
 */

// Use /api for production (proxied by nginx) or localhost:8001 for development
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8001'
    : 'https://mindsupport-production.up.railway.app';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('token');
    }

    // Build headers with auth token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic fetch wrapper with error handling
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;

        try {
            const response = await fetch(url, {
                ...options,
                headers: this.getHeaders(options.auth !== false),
            });

            // Handle 401 Unauthorized
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.hash = '#/login';
                throw new Error('Sesi telah berakhir. Silakan login kembali.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Terjadi kesalahan');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== AUTH ====================

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            auth: false,
        });
    }

    async login(email, password) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const response = await fetch(`${this.baseUrl}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login gagal');
        }

        // Store token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // ==================== USER ====================

    async getProfile() {
        return this.request('/users/me');
    }

    async updateProfile(data) {
        return this.request('/users/me', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async changePassword(oldPassword, newPassword) {
        return this.request('/users/me/change-password', {
            method: 'POST',
            body: JSON.stringify({
                old_password: oldPassword,
                new_password: newPassword,
            }),
        });
    }

    async regenerateAnonymousId() {
        return this.request('/users/me/regenerate-anonymous-id', {
            method: 'POST',
        });
    }

    // ==================== CHAT ====================

    async sendMessage(content, sessionId = null) {
        return this.request('/chat/message', {
            method: 'POST',
            body: JSON.stringify({
                content: content,
                session_id: sessionId,
            }),
        });
    }

    async getChatHistory() {
        return this.request('/chat/history');
    }

    async getChatSession(sessionId) {
        return this.request(`/chat/history/${sessionId}`);
    }

    async deleteSession(sessionId) {
        return this.request(`/chat/history/${sessionId}`, {
            method: 'DELETE',
        });
    }

    async deleteAllHistory() {
        return this.request('/chat/history', {
            method: 'DELETE',
        });
    }

    // ==================== FORUM ====================

    async getPosts(page = 1, pageSize = 20, mood = null) {
        let url = `/forum/posts?page=${page}&page_size=${pageSize}`;
        if (mood) {
            url += `&mood=${encodeURIComponent(mood)}`;
        }
        return this.request(url);
    }

    async getPost(postId) {
        return this.request(`/forum/posts/${postId}`);
    }

    async createPost(mood, content) {
        return this.request('/forum/posts', {
            method: 'POST',
            body: JSON.stringify({ mood, content }),
        });
    }

    async toggleLike(postId) {
        return this.request(`/forum/posts/${postId}/like`, {
            method: 'POST',
        });
    }

    async addComment(postId, content) {
        return this.request(`/forum/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content }),
        });
    }

    async reportPost(postId, reason, note = null) {
        return this.request(`/forum/posts/${postId}/report`, {
            method: 'POST',
            body: JSON.stringify({ reason, note }),
        });
    }

    async deletePost(postId) {
        return this.request(`/forum/posts/${postId}`, {
            method: 'DELETE',
        });
    }

    // ==================== ADMIN ====================

    async getAdminStats() {
        return this.request('/admin/stats');
    }

    async getAdminReports(status = 'pending', page = 1, pageSize = 20) {
        return this.request(`/admin/reports?status_filter=${status}&page=${page}&page_size=${pageSize}`);
    }

    async handleReport(reportId, action, deletePost = false) {
        return this.request(`/admin/reports/${reportId}?action=${action}&delete_post=${deletePost}`, {
            method: 'PUT',
        });
    }

    async getAdminUsers(page = 1, pageSize = 20, search = null) {
        let url = `/admin/users?page=${page}&page_size=${pageSize}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        return this.request(url);
    }

    async toggleUserStatus(userId) {
        return this.request(`/admin/users/${userId}/toggle-status`, {
            method: 'PUT',
        });
    }

    async toggleUserAdmin(userId) {
        return this.request(`/admin/users/${userId}/make-admin`, {
            method: 'PUT',
        });
    }

    async getAdminPosts(page = 1, pageSize = 20, includeDeleted = false) {
        return this.request(`/admin/posts?page=${page}&page_size=${pageSize}&include_deleted=${includeDeleted}`);
    }

    async adminDeletePost(postId) {
        return this.request(`/admin/posts/${postId}`, {
            method: 'DELETE',
        });
    }
}

// Create singleton instance
const api = new ApiService();
