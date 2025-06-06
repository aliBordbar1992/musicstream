import axios from "axios";
import Cookies from "js-cookie";
import { Music } from "@/types/domain";
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
      console.log("401");
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
  updateProfile: async (name: string, profilePicture: string | null) => {
    const response = await api.put("/me/profile", {
      name,
      profile_picture: profilePicture,
    });
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
  getUserMusic: async () => {
    const response = await api.get("/me/music");
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/music/${id}`);
    return response.data;
  },
  stream: (id: number) => `${API_URL}/music/${id}/stream`,
  streamChunk: async (url: string, range: { start: number; end: number }) => {
    const response = await fetch(url, {
      headers: {
        Range: `bytes=${range.start}-${range.end}`,
      },
    });

    if (!response.ok && response.status !== 206) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      data: await response.arrayBuffer(),
      contentRange: response.headers.get("Content-Range"),
    };
  },
  delete: async (id: number) => {
    await api.delete(`/music/${id}`);
  },
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
  getRecentlyPlayed: async () => {
    const response = await api.get("/recently-played");
    return response.data;
  },
  search: async (query: string): Promise<Music[]> => {
    const response = await api.get("/music/search", {
      params: { q: query },
    });
    return response.data;
  },
  downloadFromUrl: async (data: {
    url: string;
    title: string;
    artist: string;
    album?: string;
  }) => {
    const response = await api.post("/music/download", data);
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
      music_id: songId,
    });
    return response.data;
  },
  removeSong: async (playlistId: number, songId: number) => {
    await api.delete(`/playlists/${playlistId}/songs/${songId}`);
  },
  getSongs: async (playlistId: number) => {
    const response = await api.get(`/playlists/${playlistId}/songs`);
    return response.data;
  },
};

export const queue = {
  create: async () => {
    const response = await api.post("/queue");
    return response.data;
  },
  get: async () => {
    const response = await api.get("/queue");
    return response.data;
  },
  addItem: async (musicId: number) => {
    const response = await api.post("/queue/items", { music_id: musicId });
    return response.data;
  },
  addToNext: async (musicId: number) => {
    const response = await api.post("/queue/next", { music_id: musicId });
    return response.data;
  },
  removeItem: async (itemId: number) => {
    await api.delete(`/queue/items/${itemId}`);
  },
  updateItemPosition: async (itemId: number, position: number) => {
    const response = await api.put(`/queue/items/${itemId}/position`, {
      position,
    });
    return response.data;
  },
};

export default api;
