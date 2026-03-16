// src/services/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: auto-refresh token ─────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
        localStorage.setItem('accessToken', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data)  => api.post('/auth/login/', data),
  register:       (data)  => api.post('/auth/register/', data),
  getProfile:     ()      => api.get('/auth/profile/'),
  updateProfile:  (data)  => api.patch('/auth/profile/', data),
  changePassword: (data)  => api.post('/auth/change-password/', data),
  getWeightLogs:  ()      => api.get('/auth/weight-log/'),
  logWeight:      (data)  => api.post('/auth/weight-log/', data),
  weightProgress: ()      => api.get('/auth/weight-log/progress/'),
};

// ─── Workouts ──────────────────────────────────────────────────────────────────
export const workoutsAPI = {
  getExercises:       (params) => api.get('/workouts/exercises/', { params }),
  getExerciseById:    (id)     => api.get(`/workouts/exercises/${id}/`),
  getCategories:      ()       => api.get('/workouts/categories/'),
  getPlans:           ()       => api.get('/workouts/plans/'),
  createPlan:         (data)   => api.post('/workouts/plans/', data),
  updatePlan:         (id, d)  => api.patch(`/workouts/plans/${id}/`, d),
  deletePlan:         (id)     => api.delete(`/workouts/plans/${id}/`),
  getSessions:        (params) => api.get('/workouts/sessions/', { params }),
  getTodaySessions:   ()       => api.get('/workouts/sessions/today/'),
  getUpcomingSessions:()       => api.get('/workouts/sessions/upcoming/'),
  getSessionHistory:  ()       => api.get('/workouts/sessions/history/'),
  createSession:      (data)   => api.post('/workouts/sessions/', data),
  startSession:       (id)     => api.post(`/workouts/sessions/${id}/start/`),
  completeSession:    (id, d)  => api.post(`/workouts/sessions/${id}/complete/`, d),
  logSet:             (data)   => api.post('/workouts/sets/', data),
};

// ─── Nutrition ─────────────────────────────────────────────────────────────────
export const nutritionAPI = {
  searchFoods:        (q)     => api.get('/nutrition/foods/', { params: { search: q } }),
  createFood:         (data)  => api.post('/nutrition/foods/', data),
  getMyGoal:          ()      => api.get('/nutrition/goals/my_goal/'),
  updateGoal:         (data)  => api.patch('/nutrition/goals/my_goal/', data),
  getTodayMeals:      ()      => api.get('/nutrition/meals/today/'),
  getDailySummary:    (date)  => api.get('/nutrition/meals/daily-summary/', { params: { date } }),
  createMeal:         (data)  => api.post('/nutrition/meals/', data),
  addMealItem:        (data)  => api.post('/nutrition/meal-items/', data),
  removeMealItem:     (id)    => api.delete(`/nutrition/meal-items/${id}/`),
  logWater:           (data)  => api.post('/nutrition/water/', data),
  getTodayWater:      ()      => api.get('/nutrition/water/today-total/'),
};

// ─── AI Coach ──────────────────────────────────────────────────────────────────
export const aiCoachAPI = {
  getConversations:   ()      => api.get('/ai-coach/conversations/'),
  startChat:          (data)  => api.post('/ai-coach/chat/', data),
  sendMessage:        (id, d) => api.post(`/ai-coach/conversations/${id}/chat/`, d),
  getMessages:        (id)    => api.get(`/ai-coach/conversations/${id}/messages/`),
  generatePlan:       (data)  => api.post('/ai-coach/generate-plan/', data),
};

// ─── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getOverview:        ()      => api.get('/analytics/overview/'),
  getTodayStats:      ()      => api.get('/analytics/daily-stats/today/'),
  getWeeklyStats:     ()      => api.get('/analytics/daily-stats/weekly/'),
  getMonthlyStats:    ()      => api.get('/analytics/daily-stats/monthly/'),
  updateDailyStats:   (data)  => api.post('/analytics/daily-stats/', data),
  getAchievements:    ()      => api.get('/analytics/my-achievements/'),
};

export default api;
