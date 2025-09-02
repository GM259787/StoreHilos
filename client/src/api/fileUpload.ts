import api from './http';

export const fileUploadApi = {
  uploadImage: async (file: File): Promise<{ fileUrl: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/fileupload/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};
