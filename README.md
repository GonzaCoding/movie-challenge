# Movie Browser

A modern movie discovery application built with React, TypeScript, and server-side rendering (SSR).

## Features

- 🎬 **Movie Discovery**: Browse popular, top-rated, and upcoming movies
- 🔍 **Movie Details**: View detailed information about each movie
- ❤️ **Wishlist**: Save movies to your personal wishlist
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Server-Side Rendering**: Fast initial page loads with SSR
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: SCSS with BEM methodology
- **State Management**: Redux Toolkit
- **Data Fetching**: TanStack Query
- **Routing**: React Router v6
- **Testing**: Jest, React Testing Library
- **Server**: Express.js with SSR support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- TMDB API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd movie-challenge
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Add your TMDB API key to `.env`:

```bash
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Server-Side Rendering

The app supports SSR for better SEO and performance:

```bash
npm run preview:ssr
```

**SSR Behavior:**

- **Popular Movies**: Server-side rendered for fast initial load
- **Top Rated & Upcoming**: Client-side rendered with lazy loading
- **Movie Details**: Server-side rendered with SEO meta tags

### Testing

Run unit tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

### Code Quality

Lint the code:

```bash
npm run lint
```

Format the code:

```bash
npm run format
```

## Project Structure

```
src/
├── app/                    # App routes and pages
├── components/             # Reusable UI components
├── queries/               # API query functions
├── redux/                 # State management
├── styles/                # Global styles and variables
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions

server/
└── index.ts                 # Development and production SSR server

__tests__/
├── components/            # Component unit tests
├── integration/           # Integration tests
└── unit/                  # Utility function tests
```

## API Integration

This app uses The Movie Database (TMDB) API. You'll need to:

1. Sign up at [TMDB](https://www.themoviedb.org/settings/api)
2. Get your API key
3. Add it to your `.env` file

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
