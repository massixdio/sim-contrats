import axios from "axios";

// VITE_API_URL est l'origine du backend (ex. https://api.mondomaine.com), sans /api :
// le préfixe est ajouté ici pour ne pas dépendre de chaque déploiement pour le fournir.
const apiOrigin = import.meta.env.VITE_API_URL.replace(/\/+$/, "");

export const api = axios.create({
  baseURL: `${apiOrigin}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
