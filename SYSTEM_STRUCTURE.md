# CSF-IHUB Dashboard System Structure

This document provides a comprehensive overview of the technical architecture, data model, and system organization of the CSF-IHUB Dashboard project.

## Project Overview
The CSF-IHUB Dashboard is a specialized analytics and management platform for the **Innovation Hub for Gender and Development (GAD)**. It facilitates guest registration, captures customer satisfaction feedback via dynamic surveys, and provides administrators with real-time KPI visualizations and reporting.

## Technology Stack
- **Frontend Framework**: [React](https://reactjs.org/) (v18.3.1) - Component-based architecture.
- **Build System**: [Vite](https://vitejs.dev/) - Lightning-fast development and optimized production builds.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS for modern, responsive UI.
- **Backend / Database**: [Supabase](https://supabase.com/) - PostgreSQL database, Authentication, and Real-time subscriptions.
- **Data Visualization**: [Recharts](https://recharts.org/) - Composible charting library for React.
- **Interactive UI**: [@dnd-kit](https://dnd-kit.com/) - Robust drag-and-drop for dashboard customization.
- **Iconography**: [Lucide React](https://lucide.dev/) - Clean, consistent stroke icons.

## Directory Structure

### `src/` (Main Source Code)
- **`assets/`**: Static images (logos, seals) and global CSS variables.
- **`components/`**: Modular UI building blocks.
    - **`common/`**: Low-level atoms like `ModernSelect`, `ModernDatePicker`, and `Card`.
    - **Charts**: Specialized wrappers for Recharts (e.g., `ChartSexDistribution`, `ChartTopOffices`).
    - **UI Layout**: Core navigation and structural elements (`Sidebar`, `Header`, `Layout`).
- **`config/`**: Environment-specific configurations (primarily `supabase.js` client init).
- **`hooks/`**: Custom React hooks:
    - `useFeedbackForm.js`: Manages the complex multi-step survey state and submission logic.
- **`lib/`**: Business logic and utility layer.
    - `data.js`: The "Engine" of the project—handles data aggregation, KPI math, and trend calculations.
    - `systemLogs.js`: Client-side audit trail tracking.
    - `supabase.js`: Re-export for centralized database access.
- **`pages/`**: Routing endpoints.
    - `Dashboard.jsx`: The primary cockpit with draggable widget tiles.
    - `FeedbackForm.jsx`: The public portal for guest registration and surveys.
    - `FormManagement.jsx`: Admin tool for dynamic survey tailoring (questions/parts).
    - `Users.jsx`: IAM (Identity and Access Management) for dashboard admins.

### Infrastructure & Config
- `database/`: Contains SQL initialization scripts and migrations.
- `docker/`: Dockerfiles and container configurations (PostgreSQL, PostgREST for local dev).
- `nginx.conf`: Production-grade web server configuration.
- `docker-compose.yml`: Orchestration for the full stack.

---

## Data Architecture

The system relies on a relational model in Supabase:

1. **`registrations`**: Stores initial guest data (name, contact, children, date of use). Generates a unique 5-digit code.
2. **`evaluations`**: Linked to a registration via the 5-digit code. Stores survey answers as a JSONB object.
3. **`form_parts` & `questions`**: Defines the structure of the evaluation form dynamically. Admin edits here are reflected immediately in the `FeedbackForm`.
4. **`users`**: Managed admin accounts with specific `user_level` permissions.

---

## Core System Workflows

### 1. The Feedback Lifecycle
1. **Registration**: A guest fills out basic info in `FeedbackForm`. A record is created in `registrations`.
2. **Code Generation**: The system provides a unique code (e.g., "12345") to the guest.
3. **Evaluation**: Later, the guest enters their code. The system fetches the dynamic question set from `questions`.
4. **Submission**: Answers are saved as a JSONB blob in `evaluations`, linked to the registration.

### 2. Analytics Pipeline
1. **Fetch**: `Dashboard.jsx` calls `fetchFeedback` from `lib/data.js`.
2. **Transform**: `computeKPIs` processes raw rows into display values (Total, Average, Trends).
3. **Visualize**: Components like `ChartSatisfactionDonut` receive processed arrays and render SVG charts via Recharts.

### 3. Audit Trail (System Logs)
Any critical administrative action (editing a user, deleting a question) is captured via `addLog()` in `lib/systemLogs.js`. These logs are persisted locally and viewable in the `System Logs` page to maintain accountability.

---

## Security & Access
- **Authentication**: JWT-based session management via Supabase.
- **Persistence**: Sessions are stored in `localStorage` under the `csf-auth` key.
- **Data Privacy**: The system adheres to a strict "need-to-know" basis for respondent PII (Personally Identifiable Information).
