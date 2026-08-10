import axios from "axios";

import { getSession } from "../../features/auth/services/authStorage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const session = await getSession();

    if (session?.token) {
      config.headers.Authorization =
        `Bearer ${session.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;