import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:        (data)  => api.post('/auth/login', data),
  register:     (data)  => api.post('/auth/register', data),
  me:           ()      => api.get('/auth/me'),
  saveFcmToken: (token) => api.post('/auth/fcm-token', { fcmToken: token }),
};

// ── Players ────────────────────────────────────────────────────────────────────
export const playersAPI = {
  getAll:   ()         => api.get('/players'),
  getById:  (id)       => api.get(`/players/${id}`),
  create:   (data)     => api.post('/players', data),
  update:   (id, data) => api.put(`/players/${id}`, data),
  delete:   (id)       => api.delete(`/players/${id}`),
};

// ── Tournaments ────────────────────────────────────────────────────────────────
export const tournamentsAPI = {
  getAll:           ()              => api.get('/tournaments'),
  getById:          (id)            => api.get(`/tournaments/${id}`),
  create:           (data)          => api.post('/tournaments', data),
  update:           (id, data)      => api.put(`/tournaments/${id}`, data),
  generateBracket:  (id, playerIds) => api.post(`/tournaments/${id}/generate-bracket`, { playerIds }),
  getBracket:       (id)            => api.get(`/tournaments/${id}/bracket`),
};

// ── Matches ────────────────────────────────────────────────────────────────────
export const matchesAPI = {
  getAll:      (params) => api.get('/matches', { params }),
  getById:     (id)     => api.get(`/matches/${id}`),
  update:      (id, d)  => api.put(`/matches/${id}`, d),
  getLiveScore:(id)     => api.get(`/matches/${id}/live-score`),
};

// ── Analytics ──────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getPlayerStats:     (playerId)     => api.get(`/analytics/player/${playerId}`),
  getTournamentStats: (tournamentId) => api.get(`/analytics/tournament/${tournamentId}`),
};

// ── Scorecards ─────────────────────────────────────────────────────────────────
export const scorecardsAPI = {
  generate: (matchId) => api.post(`/scorecards/${matchId}/generate`),
};

export default api;
