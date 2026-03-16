# ⚡ AI Fitness Tracker Pro

A full-stack AI-powered fitness tracking application built with **Django REST Framework** (backend) and **React** (frontend).

---

## 🗂️ Project Structure

```
ai_fitness_tracker/
├── backend/                        # Django REST API
│   ├── fitness_tracker/            # Django project config
│   │   ├── settings.py             # All settings (JWT, CORS, DRF)
│   │   ├── urls.py                 # Root URL configuration
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/                  # Auth, user profiles, weight logs
│   │   │   ├── models.py           # Custom User + WeightLog
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── workouts/               # Exercises, plans, sessions, sets
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── nutrition/              # Food database, meal logs, water
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   ├── ai_coach/               # Anthropic Claude integration
│   │   │   ├── models.py           # Conversations, messages, plan requests
│   │   │   ├── services.py         # Claude API service layer
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   ├── urls.py
│   │   │   └── admin.py
│   │   └── analytics/              # Stats, achievements, daily summaries
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls.py
│   │       ├── admin.py
│   │       └── management/commands/seed_data.py
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                       # React 18 SPA
    ├── public/index.html
    ├── package.json
    └── src/
        ├── App.js                  # Routes + auth guards
        ├── index.js
        ├── assets/styles/
        │   └── global.css          # CSS variables + utility classes
        ├── context/
        │   └── AuthContext.js      # JWT auth context + hooks
        ├── services/
        │   └── api.js              # Axios instance + all API calls
        ├── components/
        │   ├── Sidebar.js          # Collapsible navigation
        │   ├── StatCard.js         # KPI card with glow effect
        │   └── Loader.js           # SVG spinner
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js        # Overview + charts
            ├── Workouts.js         # Sessions + exercise library
            ├── Nutrition.js        # Meal logging + macros + water
            ├── AICoach.js          # Chat + AI plan generator
            ├── Analytics.js        # Recharts data visualisation
            └── Profile.js          # Profile editor + password change
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed sample data (exercises, foods, achievements)
python manage.py seed_data

# Create superuser (for admin panel)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The React app will open at `http://localhost:3000/`

---

## 🔑 Environment Variables

Create a `.env` file in `backend/`:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
ANTHROPIC_API_KEY=your-anthropic-api-key   # For real AI responses
```

---

## 🌐 REST API Endpoints

### Auth (`/api/auth/`)
| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | `/login/`             | Obtain JWT tokens        |
| POST   | `/register/`          | Create new account       |
| GET    | `/profile/`           | Get current user profile |
| PATCH  | `/profile/`           | Update profile           |
| POST   | `/change-password/`   | Change password          |
| GET    | `/weight-log/`        | List weight entries      |
| POST   | `/weight-log/`        | Log new weight           |
| GET    | `/weight-log/progress/` | Weight chart data      |

### Workouts (`/api/workouts/`)
| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| GET    | `/exercises/`                   | Browse exercise library     |
| GET    | `/categories/`                  | Exercise categories         |
| GET/POST | `/plans/`                     | Workout plans               |
| GET/POST | `/sessions/`                  | Workout sessions            |
| POST   | `/sessions/{id}/start/`         | Start a session             |
| POST   | `/sessions/{id}/complete/`      | Complete a session          |
| GET    | `/sessions/today/`              | Today's sessions            |
| GET    | `/sessions/history/`            | Completed sessions          |
| POST   | `/sets/`                        | Log an exercise set         |

### Nutrition (`/api/nutrition/`)
| Method | Endpoint                      | Description                |
|--------|-------------------------------|----------------------------|
| GET    | `/foods/?search=chicken`      | Search food database       |
| GET/PUT | `/goals/my_goal/`            | Nutrition goals            |
| GET    | `/meals/today/`               | Today's meals              |
| GET    | `/meals/daily-summary/`       | Daily macro summary        |
| POST   | `/meals/`                     | Create meal log entry      |
| POST   | `/meal-items/`                | Add food to meal           |
| POST   | `/water/`                     | Log water intake           |
| GET    | `/water/today-total/`         | Today's water total        |

### AI Coach (`/api/ai-coach/`)
| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/chat/`                          | Start new conversation   |
| POST   | `/conversations/{id}/chat/`       | Send message             |
| GET    | `/conversations/{id}/messages/`   | Get conversation history |
| POST   | `/generate-plan/`                 | Generate AI workout plan |

### Analytics (`/api/analytics/`)
| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/overview/`                  | Dashboard KPIs           |
| GET    | `/daily-stats/today/`         | Today's stats            |
| GET    | `/daily-stats/weekly/`        | Last 7 days              |
| GET    | `/daily-stats/monthly/`       | Last 30 days             |
| GET    | `/my-achievements/`           | Earned achievements      |

---

## 🛠️ Tech Stack

### Backend
- **Python 3.11+** + **Django 4.2**
- **Django REST Framework** — RESTful APIs
- **SimpleJWT** — JWT authentication
- **django-cors-headers** — CORS management
- **django-filter** — Query filtering
- **Anthropic SDK** — Claude AI integration

### Frontend
- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Axios** — HTTP client with interceptors
- **Recharts** — Data visualisation
- **React Hot Toast** — Notifications

### Database
- **SQLite** (development) — swap for PostgreSQL in production

---

## 🔐 Authentication Flow

1. User registers → `POST /api/auth/register/`
2. User logs in → `POST /api/auth/login/` → receives `access` + `refresh` tokens
3. All protected requests include `Authorization: Bearer <access_token>`
4. Axios interceptor auto-refreshes expired tokens via `POST /api/auth/token/refresh/`
5. On refresh failure → user is logged out and redirected to `/login`

---

## 🤖 AI Coach

The AI Coach uses **Anthropic Claude** to provide:
- Personalised chat coaching with full user fitness context
- AI-generated workout plan creation
- Conversation history for multi-turn context

Set `ANTHROPIC_API_KEY` to enable real AI responses. Without it, the app falls back to helpful structured mock responses so development continues uninterrupted.

---

## 📦 Production Checklist

- [ ] Set `DEBUG=False` in settings
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set a strong `SECRET_KEY`
- [ ] Run `python manage.py collectstatic`
- [ ] Serve with **Gunicorn** behind **Nginx**
- [ ] Build frontend with `npm run build` and serve static files
- [ ] Set real `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
- [ ] Store secrets in environment variables (never commit `.env`)
