import api from './api';

class NotificationService {
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  }

  async getNotification(id) {
    try {
      const response = await api.get(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch notification');
    }
  }

  async markAsRead(id) {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }

  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  }

  async deleteNotification(id) {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete notification');
    }
  }

  async deleteReadNotifications() {
    try {
      const response = await api.delete('/notifications/read');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete read notifications');
    }
  }

  // Utility methods
  getNotificationIcon(type) {
    const typeIcons = {
      alert: '🚨',
      system: '⚙️',
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      error: '❌',
    };
    return typeIcons[type] || '📢';
  }

  getNotificationColor(type, severity) {
    if (severity) {
      const severityColors = {
        low: 'blue',
        medium: 'yellow',
        high: 'orange',
        critical: 'red',
      };
      return severityColors[severity] || 'gray';
    }

    const typeColors = {
      alert: 'red',
      system: 'blue',
      info: 'blue',
      warning: 'yellow',
      success: 'green',
      error: 'red',
    };
    return typeColors[type] || 'gray';
  }

  formatNotificationTime(timestamp) {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  }

  groupNotificationsByDate(notifications) {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      let groupKey;

      if (notificationDate.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (notificationDate.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = notificationDate.toLocaleDateString();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }

  filterNotifications(notifications, filters) {
    return notifications.filter(notification => {
      if (filters.status && notification.status !== filters.status) {
        return false;
      }
      if (filters.type && notification.type !== filters.type) {
        return false;
      }
      if (filters.severity && notification.severity !== filters.severity) {
        return false;
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          notification.title.toLowerCase().includes(searchLower) ||
          notification.message.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }

  sortNotifications(notifications, sortBy = 'createdAt', sortOrder = 'desc') {
    return [...notifications].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'readAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });
  }

  getUnreadCount(notifications) {
    return notifications.filter(n => n.status === 'unread').length;
  }

  getPriorityNotifications(notifications, limit = 5) {
    return notifications
      .filter(n => n.status === 'unread' && (n.severity === 'high' || n.severity === 'critical'))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  // Browser notification methods
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  showBrowserNotification(notification) {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.severity === 'critical',
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.severity !== 'critical') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }
}

export default new NotificationService();
