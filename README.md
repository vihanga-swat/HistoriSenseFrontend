# 🏛️ HistoriSense

A modern, AI-enhanced platform for exploring, analyzing, and preserving historical testimonies.

- Dual experiences for Individuals and Museum Representatives
- Interactive maps, emotional analysis, and thematic insights
- Clean, responsive UI powered by React, TypeScript, and Vite

Badges:
- React 19
- TypeScript 5.7
- Vite 6
- Material UI 6

---

## 🌟 Overview

HistoriSense helps transform historical testimonies into actionable insights. Whether you’re an individual preserving a story or a museum curator organizing collections, HistoriSense provides intuitive tools to upload, analyze, visualize, and explore narratives.

### What you can do
- Upload testimonies and manage metadata
- Analyze emotions, topics, and people mentioned
- Visualize locations and movements on a map
- Explore patterns via charts and interactive components

---

## ✨ Features

- Authentication and Roles
  - Individual vs Museum representative flows
  - Protected routes and redirects

- Testimony Management
  - Upload files and capture metadata
  - Search, filter, and bulk operations
  - Auto-categorization (when backend supports it)

- Analytics & Insights
  - Sentiment and emotional analysis
  - Topic clustering and people recognition
  - Geographic extraction and mapping

- Visualization
  - Charts for emotion/topic distributions
  - Leaflet maps for places and routes
  - Timelines and relationship graphs (where applicable)

- UI/UX
  - Material UI + Tailwind CSS
  - Framer Motion animations
  - Dark-mode friendly and responsive

---

## 🛠️ Tech Stack

- Core: React 19, TypeScript 5.7, Vite 6
- UI: Material UI, Tailwind CSS, Framer Motion
- Charts: Chart.js, react-chartjs-2, Recharts
- Maps: Leaflet, React-Leaflet
- Routing & HTTP: React Router DOM, Axios
- Tooling: ESLint, TypeScript ESLint, Vite React Plugin

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (recommend LTS)
- npm or yarn
- A modern browser

### Setup

1) Clone
```bash
bash
git clone <YOUR_REPOSITORY_URL>
cd HistoriSenseFrontend
```

2) Install
```bash
bash
npm install
# or
yarn install
```

3) Configure Environment
```bash
bash
# If provided, copy the example env file
cp .env.example .env
# Then set your values:
# VITE_API_BASE_URL=https://api.example.com
# VITE_MAPS_API_KEY=<YOUR_MAPS_KEY_IF_NEEDED>
# VITE_ENABLE_MOCKS=false
```

4) Run Dev Server
```bash
bash
npm run dev
# or
yarn dev
```

Open http://localhost:5173

### Build & Preview
```bash
bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
HistoriSenseFrontend/
├─ public/
│  ├─ Icon.svg
│  └─ vite.svg
├─ src/
│  ├─ assets/
│  │  └─ images/
│  ├─ components/
│  │  └─ Validations.tsx
│  ├─ screens/
│  │  ├─ Home.tsx
│  │  ├─ MuseumHome.tsx
│  │  ├─ Login.tsx
│  │  └─ Signup.tsx
│  ├─ App.tsx
│  ├─ AppRoutes.tsx
│  ├─ main.tsx
│  └─ index.css
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

Notes:
- screens: top-level pages per route
- components: reusable UI and logic pieces
- AppRoutes.tsx: central routing configuration
- Validations.tsx: form validation helpers

---

## 🔧 Scripts

- dev: Start dev server with HMR
- build: Production build
- preview: Preview production build
- lint: Run ESLint

Examples:
```bash
bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 🔒 Security

- JWT token handling and route protection
- Input validation and sanitization
- Role-based access control (RBAC)
- Safe file upload patterns (validate types/size on client; enforce on server)

Tip: Always validate on the backend as the source of truth.

---

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 📱 Responsiveness

Optimized for:
- Desktop and Laptop
- Tablet
- Mobile

Design is component-driven and accessible-minded.

---

## 🧭 Routing

- Public routes: Login, Signup
- Protected routes: Home, MuseumHome, analytics pages
- Guards redirect unauthorized users to Login
- Role-based branching for individuals vs museums

---

## 🔌 API Integration

- Axios configured for base URL and interceptors (if implemented)
- Auth headers injected per request (token-based)
- Errors surfaced with user-friendly messages

Environment variables:
- VITE_API_BASE_URL: Base URL for backend services
- Any provider keys needed for maps or analytics

---

## 🧪 Testing (optional guidance)

- Suggested: React Testing Library + Vitest/Jest
- Scope:
  - Component logic and rendering states
  - Route guards and navigation flows
  - Utility functions (Validations, formatters)

Example script (if added later):
```bash
bash
npm run test
```

---

## 🧹 Code Style

- ESLint with TypeScript rules
- Recommended:
  - Prettier for formatting
  - Commitlint + conventional commits
  - Husky pre-commit hooks for linting

---

## 🐛 Known Limitations

- Very large datasets may affect map performance
- Heavy uploads benefit from chunking and retries
- Complex visualizations on small screens may need UX fallbacks

---

## 🔮 Roadmap

- Multi-language support (i18n)
- Deeper AI models for topic/person/place linking
- Export and reporting tools (PDF/CSV)
- Collaboration features for curators
- Accessibility refinements (WCAG 2.1 AA)

---

## 👤 Author

- Name: Vihanga Palihakkara
- Role: Associate Software Engineer
- Email: vihangawork@gmail.com

If you use this project in research or demos, a mention would make my day!

---

## 📄 License

This project is developed as a Final Year Project (FYP) for educational and research purposes. Please review or add a LICENSE file if broader usage is intended.

---

## 📞 Support

- Open an issue with details, logs, and repro steps
- Add screenshots for UI issues
- For general questions, contact: vihangawork@gmail.com

---
