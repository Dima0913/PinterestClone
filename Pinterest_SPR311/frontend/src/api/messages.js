import api from "./auth";

export const messagesService = {
  getChats: async () => {
    const response = await api.get("/messages/chats");
    return response.data;
  },

  getConversation: async (userId) => {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  },

  sendMessage: async (userId, content) => {
    const response = await api.post(`/messages/${userId}`, { content });
    return response.data;
  },

  blockUser: async (userId) => {
    const response = await api.post(`/messages/block/${userId}`);
    return response.data;
  },
  unblockUser: async (userId) => {
    const response = await api.post(`/messages/unblock/${userId}`);
    return response.data;
  },
};

export default messagesService;