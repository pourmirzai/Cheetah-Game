# نجات یوز ایران - بازی حفاظت از یوزپلنگ آسیایی

## Overview

This is a Persian web-based game called "نجات یوز ایران" (Save Iran's Cheetah) designed for Persian Cheetah National Day. The game is an interactive vertical scroller similar to River Raid where players control a mother cheetah trying to guide her 4 cubs to independence over 120 seconds (representing 18 months). Players must avoid obstacles like dogs, traps, poachers, and roads while collecting resources like water and prey to keep the family alive. The game features seasonal changes, different difficulty paths, speed burst mechanics, and aims to raise awareness about Asian cheetah conservation in Iran.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development
- **Routing**: Wouter for lightweight client-side routing
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with Persian font (Vazirmatn) and RTL support
- **Game Engine**: Phaser 3 for 2D game rendering and physics
- **State Management**: React Query (TanStack Query) for server state and local React state for game state
- **Language**: Persian (Farsi) with RTL layout support

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints for game sessions, events, and leaderboard
- **Development**: Hot module replacement with Vite integration

### Game Architecture
- **Game Loop**: Phaser 3 scene-based architecture with preload, create, and update lifecycle
- **Input System**: Touch and keyboard controls with lane-based movement
- **Asset Management**: Programmatic sprite generation with colored rectangles for cheetahs, obstacles, and resources
- **Physics**: Arcade physics for collision detection between cheetahs, obstacles, and resources
- **Game State**: Centralized state management tracking cubs, health, energy, score, and seasonal changes

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Design**: 
  - Game sessions table for storing complete game runs
  - Game events table for detailed analytics and player behavior
  - Leaderboard table for top scores and achievements
  - Game stats table for daily aggregated metrics
- **Connection Pooling**: Neon serverless pool for efficient database connections

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Tracking**: Anonymous sessions with generated session IDs
- **Future Consideration**: Could add optional user accounts for personalized leaderboards

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production
- **Drizzle Kit**: Database migrations and schema management

### Game Engine and Libraries
- **Phaser 3**: 2D game framework for rendering and physics (CDN loaded)
- **React Ecosystem**: React 18, React DOM, React Query for frontend
- **Wouter**: Lightweight routing library

### UI and Styling
- **Radix UI**: Accessible component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Class Variance Authority**: Component variant management
- **Google Fonts**: Vazirmatn Persian font family

### Development Tools
- **Vite**: Build tool and dev server with HMR
- **TypeScript**: Type safety and developer experience
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Analytics and Tracking
- **Custom Analytics**: Built-in event tracking system
- **Nanoid**: Unique ID generation for sessions
- **Date-fns**: Date manipulation utilities

### Deployment and Hosting
- **Replit Integration**: Custom Replit plugins for development environment
- **Express Server**: Production-ready server setup
- **Static Asset Serving**: Vite-generated static files served by Express

The application follows a modern full-stack architecture with clear separation between the React frontend, Express API backend, and PostgreSQL database, while integrating Phaser 3 for the game engine to create an engaging conservation awareness experience.