# LMS Frontend

A modern React TypeScript application for Learning Management System (LMS) administration, built with Vite, Redux Toolkit, and Tailwind CSS.

## Features

- **Authentication System**: Login, logout, and user management
- **Admin Panel**: Create and manage admin and user accounts
- **Super Admin Initialization**: Set up the first super administrator
- **Modern UI**: Clean, responsive design with custom red color scheme
- **TypeScript**: Full type safety throughout the application
- **Redux State Management**: Centralized state with async thunks

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **Tailwind CSS v4** - Styling with custom color palette
- **Axios** - HTTP client for API calls

## Color Scheme

The application uses a custom red-based color palette:

- **Primary**: `#dc2626` (Red)
- **Secondary**: `#991b1b` (Dark red)
- **Accent**: `#ef4444` (Bright red)
- **Background**: `#ffffff` (White)
- **Surface**: `#f3f4f6` (Light gray)
- **Text**: `#0f172a` (Dark slate)
- **Text Secondary**: `#4b5563` (Gray)
- **Border**: `#e5e7eb` (Light gray)

## API Integration

The frontend integrates with a Spring Boot backend providing the following endpoints:

- `POST /api/auth/init-superadmin` - Initialize first superadmin
- `POST /api/auth/login` - User authentication
- `POST /api/auth/create-admin` - Create admin accounts (authenticated)
- `POST /api/auth/create-user` - Create user accounts (authenticated)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your backend URL:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── app/
│   ├── hooks.ts          # Redux hooks
│   └── store.ts          # Redux store configuration
├── components/
│   ├── Dashboard.tsx     # Main dashboard with navigation
│   ├── LoginForm.tsx     # Login component
│   ├── InitSuperAdminForm.tsx  # Superadmin initialization
│   ├── CreateAdminForm.tsx     # Admin creation form
│   └── CreateUserForm.tsx      # User creation form
├── features/
│   └── auth/
│       └── authSlice.ts  # Authentication Redux slice
├── services/
│   └── authApi.ts        # API service layer
├── App.tsx               # Main app component
├── index.css             # Global styles with Tailwind
└── main.tsx             # App entry point
```

## Usage

1. **Initialize Super Admin**: Use the "Init Super Admin" form to create the first administrator account
2. **Login**: Use the login form to authenticate
3. **Create Accounts**: Once authenticated, use the navigation to create admin or user accounts
4. **Logout**: Use the logout button to end the session

## Environment Variables

- `VITE_API_BASE_URL`: Backend API base URL (default: `http://localhost:8080`)

## Development Notes

- The application uses Tailwind CSS v4 with custom color definitions in `index.css`
- API calls are handled through Redux async thunks with proper error handling
- Authentication tokens are stored in localStorage and automatically included in API requests
- The UI is fully responsive and follows modern design principles