import axios from 'axios';

const apiClient = axios.create({
  // 🔥 IMPORTANTE: Usamos la variable de entorno VITE_API_URL si existe (Producción)
  // Si no, se deja vacío para usar el proxy local (Desarrollo)
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    const err = error instanceof Error ? error : new Error(String(error));
    return Promise.reject(err);
  }
);

export default {
  register(email: string, password: string) {
    return apiClient.post('/auth/register', { email, password });
  },
  login(email: string, password: string) {
    return apiClient.post('/auth/login', { email, password });
  },
  getProfile() {
    return apiClient.get('/auth/profile');
  },

  // --- NUEVO: Función para traer todo el historial de la BD ---
  // Esto llamará a tu backend (GET /scraper/ferrovalle) para llenar la tabla al inicio
  getHistorial() {
    return apiClient.get('/scraper/ferrovalle');
  },
  // ----------------------------------------------------------

  consultarFerrovalle(textData: string, searchType: string) {
    return apiClient.post('/scraper/ferrovalle', { textData, searchType });
  },

  updateScraperStatus(id: number, estatus: string) {
    return apiClient.patch(`/scraper/${id}/clasificacion`, { estatus });
  },

  guardarTextoBuzones(data: { data: string }) {
    return apiClient.post('/arribos/cargar-texto', data);
  },

  getBuzonesPorContenedor(contenedor: string) {
    return apiClient.get(`/arribos/${contenedor}`);
  },

  getBuzones() {
    return apiClient.get('/arribos');
  },

  deleteBuzonesMultiples(ids: number[]) {
    return apiClient.post('/arribos/borrar-multiples', { ids });
  },
};
