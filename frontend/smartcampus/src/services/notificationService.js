import axiosInstance from '../utils/axiosInstance';

const notificationService = {
  async getNotifications() {
    const response = await axiosInstance.get('/api/notifications');
    return response.data;
  },

  async getUnreadNotifications() {
    const response = await axiosInstance.get('/api/notifications/unread');
    return response.data;
  },

  async getUnreadCount() {
    const response = await axiosInstance.get('/api/notifications/unread/count');
    return response.data.count;
  },

  async markAsRead(id) {
    const response = await axiosInstance.patch(`/api/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    await axiosInstance.patch('/api/notifications/read-all');
  },

  async deleteNotification(id) {
    await axiosInstance.delete(`/api/notifications/${id}`);
  },

  async clearAll() {
    await axiosInstance.delete('/api/notifications/clear');
  },
};

export default notificationService;
