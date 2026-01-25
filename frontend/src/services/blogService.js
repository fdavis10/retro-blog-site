import api from './api';

export const blogService = {

  getPosts: async (page = 1) => {
    const response = await api.get(`/blog/posts/?page=${page}`);
    return response.data;
  },


  getPost: async (id) => {
    const response = await api.get(`/blog/posts/${id}/`);
    return response.data;
  },


  createPost: async (data) => {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('is_published', data.is_published || true);
    

    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('uploaded_images', image);
      });
    }
    

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('uploaded_attachments', file);
      });
    }
    
    const response = await api.post('/blog/posts/create/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },


  updatePost: async (id, data) => {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.content) formData.append('content', data.content);
    if (data.is_published !== undefined) formData.append('is_published', data.is_published);

    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('uploaded_images', image);
      });
    }
    

    if (data.attachments && data.attachments.length > 0) {
      data.attachments.forEach((file) => {
        formData.append('uploaded_attachments', file);
      });
    }
    
    const response = await api.put(`/blog/posts/${id}/update/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },


  deletePost: async (id) => {
    const response = await api.delete(`/blog/posts/${id}/delete/`);
    return response.data;
  },


  getComments: async (postId) => {
    const response = await api.get(`/blog/posts/${postId}/comments/`);
    return response.data;
  },


  addComment: async (postId, content) => {
    const response = await api.post(`/blog/posts/${postId}/comments/`, {
      content,
    });
    return response.data;
  },


  updateComment: async (commentId, content) => {
    const response = await api.put(`/blog/comments/${commentId}/`, {
      content,
    });
    return response.data;
  },


  deleteComment: async (commentId) => {
    const response = await api.delete(`/blog/comments/${commentId}/`);
    return response.data;
  },


  toggleLike: async (postId) => {
    const response = await api.post(`/blog/posts/${postId}/like/`);
    return response.data;
  },
};