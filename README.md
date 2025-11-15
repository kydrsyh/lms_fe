# LMS Frontend

Frontend aplikasi LMS (Learning Management System) menggunakan React, Vite, TypeScript, dan Tailwind CSS dengan Atomic Design pattern.

## Prerequisites

- Node.js >= 18
- pnpm

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start development server:
```bash
pnpm dev
```

Frontend akan berjalan di `http://localhost:5173`

## Development

### Start Development Server
```bash
pnpm dev
```

### Build for Production
```bash
pnpm build
```

### Preview Production Build
```bash
pnpm preview
```

## Architecture

### Atomic Design Pattern

Struktur komponen mengikuti Atomic Design methodology:

- **Atoms** (`src/components/atoms/`): Komponen dasar seperti Button, Input, Card
- **Molecules** (`src/components/molecules/`): Kombinasi sederhana atoms seperti FormField
- **Organisms** (`src/components/organisms/`): Komponen kompleks seperti LoginForm
- **Templates** (`src/components/templates/`): Layout pages seperti AuthLayout, DashboardLayout
- **Pages** (`src/pages/`): Full pages yang menggunakan templates

### State Management

- **Redux Toolkit**: Global state management untuk authentication
- **React Query**: Data fetching dan caching untuk API calls
- **React Hook Form**: Form state dan validation

### Routing

Role-based routing dengan protected routes:
- `/login` - Login page (public)
- `/admin/dashboard` - Admin dashboard (admin only)
- `/teacher/dashboard` - Teacher dashboard (teacher only)
- `/student/dashboard` - Student dashboard (student only)
- `/unauthorized` - Access denied page

## Theme Customization

### Mengubah Brand Colors

Edit file `src/theme/colors.ts` untuk mengubah warna brand:

```typescript
export const brandColors = {
  primary: {
    500: '#3b82f6',  // Ubah warna primary di sini
    // ... other shades
  },
  secondary: {
    500: '#22c55e',  // Ubah warna secondary di sini
    // ... other shades
  },
};
```

Warna akan otomatis diterapkan ke seluruh aplikasi melalui CSS variables di `src/index.css`.

### Tailwind Classes

Gunakan Tailwind classes dengan theme colors:
- `bg-primary-500`, `text-primary-600`, `border-primary-400`
- `bg-secondary-500`, `text-secondary-600`, `border-secondary-400`

### Utility Classes

Utility classes yang tersedia:
- `btn-primary` - Primary button style
- `btn-secondary` - Secondary button style

## API Integration

### Vite Proxy

Frontend menggunakan Vite proxy untuk forward API requests ke backend (`vite.config.ts`):
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- API calls ke `/api/*` akan di-forward ke backend

### Authentication Flow

1. User login di `/login`
2. Frontend menerima access token (15 menit) dan refresh token (7 hari)
3. Access token disimpan di Redux state dan localStorage
4. Refresh token disimpan di localStorage
5. API client automatically attach access token ke setiap request
6. Jika access token expired (401), API client automatically refresh token
7. Jika refresh token expired, user di-redirect ke login

### API Client

`src/api/client.ts` menggunakan Axios dengan interceptors untuk:
- Attach access token ke requests
- Auto refresh token jika 401
- Logout dan redirect ke login jika refresh gagal

## Test Credentials

Gunakan credentials berikut untuk testing (setelah backend seeder dijalankan):

- **Admin**: admin@lms.com / password123
- **Teacher**: teacher@lms.com / password123
- **Student**: student@lms.com / password123

## Technology Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Date Utilities**: date-fns

