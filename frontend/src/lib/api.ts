import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      Cookies.remove("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: async (username: string, password: string) => {
    const response = await api.post("/register", { username, password });
    return response.data;
  },
  login: async (username: string, password: string) => {
    const response = await api.post("/login", { username, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get("/me");
    return response.data;
  },
};

export const music = {
  upload: async (formData: FormData) => {
    const response = await api.post("/music/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/music");
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/music/${id}`);
    return response.data;
  },
  stream: (id: number) => `${API_URL}/music/${id}/stream`,
  searchArtists: async (query: string) => {
    const response = await api.get("/artists/search", {
      params: { query },
    });
    return response.data;
  },
  createArtist: async (name: string) => {
    const response = await api.post("/artists", { name });
    return response.data;
  },
};

export const playlists = {
  create: async (name: string) => {
    const response = await api.post("/playlists", { name });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/playlists");
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/playlists/${id}`);
  },
  addSong: async (playlistId: number, songId: number) => {
    const response = await api.post(`/playlists/${playlistId}/songs`, {
      songId,
    });
    return response.data;
  },
  removeSong: async (playlistId: number, songId: number) => {
    await api.delete(`/playlists/${playlistId}/songs/${songId}`);
  },
};

export default api;
