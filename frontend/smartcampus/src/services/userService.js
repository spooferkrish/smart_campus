import axiosInstance from '../utils/axiosInstance';

const userService = {
  async getAllUsers() {
    const response = await axiosInstance.get('/api/users');
    return response.data;
  },

  async getUserById(id) {
    const response = await axiosInstance.get(`/api/users/${id}`);
    return response.data;
  },

  async updateUserRole(id, role) {
    const response = await axiosInstance.put(`/api/users/${id}/role`, { role });
    return response.data;
  },

  async deleteUser(id) {
    await axiosInstance.delete(`/api/users/${id}`);
  },

  async getUsersByRole(role) {
    const response = await axiosInstance.get(`/api/users/role/${role}`);
    return response.data;
  },
};

export default userService;
