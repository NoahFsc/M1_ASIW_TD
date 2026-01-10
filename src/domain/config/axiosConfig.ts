import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Gestion du rafraichissement de token (en cas de 401 Unauthorized)
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

// Cette fonction traite la file d'attente des requêtes
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

// Cette fonction rafraichit le token d'authentification et le stocke
const refreshToken = async (): Promise<string> => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/account/login`, {
        email: import.meta.env.VITE_AUTH_EMAIL,
        password: import.meta.env.VITE_AUTH_PASSWORD,
    });
    
    const newToken = response.data.token;
    localStorage.setItem('authToken', newToken);
    return newToken;
};

// Cette fonction ajoute le token d'authentification à chaque requête dans les headers
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken') || import.meta.env.VITE_API_TOKEN;
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Cette fonction intercepte les réponses pour gérer les erreurs 401 Unauthorized
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // Si un refresh est déjà en cours, on met la requête en file d'attente
            // pour éviter de lancer plusieurs refresh en parallèle (comme c'est asynchrone)
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            // Marque la requête comme "déjà tentée" pour éviter une boucle
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshToken();
                // Rejoue toutes les requêtes en attente avec le nouveau token
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // En cas d'échec du refresh, on rejette les requêtes en attente
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
