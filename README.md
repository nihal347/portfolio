# Space Portfolio

A modern, interactive portfolio application developed with React, TypeScript, and Vite. The project implements a modular component architecture and a space-inspired user interface to present projects, technical expertise, and professional experience. The application emphasizes performance, maintainability, responsive design, and immersive frontend interactions.

## Overview

This portfolio is designed as a Single Page Application (SPA) with a focus on component reusability, scalable project organization, and smooth client-side rendering. It combines modern frontend development practices with a custom-designed interface inspired by spacecraft control systems and futuristic HUDs.

---

## Features

- Single Page Application (SPA)
- Modular React component architecture
- Type-safe development using TypeScript
- Responsive layout across desktop, tablet, and mobile devices
- Interactive space-themed user interface
- Dynamic content rendering from JSON configuration
- Animated canvas-based visual effects
- Custom terminal interface
- Command and status HUD
- Project showcase
- Technical skills overview
- Resume download
- Contact section
- Optimized production build using Vite

---

## Technology Stack

| Category | Technologies |
|-----------|--------------|
| Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | CSS3 |
| State Management | React Hooks |
| Package Manager | npm |
| Linting | ESLint |
| Version Control | Git, GitHub |

---

## Project Structure

```text
.
├── public/
│   ├── content.json
│   ├── favicon.svg
│   ├── icons.svg
│   └── resume.pdf
│
├── src/
│   ├── assets/
│   ├── canvas/
│   ├── components/
│   │   ├── Cockpit.tsx
│   │   ├── CommsPanel.tsx
│   │   ├── Cursor.tsx
│   │   ├── HUD.tsx
│   │   ├── ReturnButton.tsx
│   │   ├── SystemLog.tsx
│   │   ├── Terminal.tsx
│   │   ├── TerminalOverlay.tsx
│   │   ├── TerminalText.tsx
│   │   └── Toasts.tsx
│   │
│   ├── hooks/
│   ├── pages/
│   │   ├── Hub.tsx
│   │   ├── Learning.tsx
│   │   ├── Missions.tsx
│   │   ├── Profile.tsx
│   │   ├── Projects.tsx
│   │   ├── SimpleView.tsx
│   │   └── TechStack.tsx
│   │
│   ├── store/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Screenshots

### Home

<img width="1915" height="955" alt="image" src="https://github.com/user-attachments/assets/0a10f57a-0a0a-4792-b998-f5c205d356ef" />


### Projects

<img width="1913" height="953" alt="image" src="https://github.com/user-attachments/assets/6f842a6b-8b4c-4caa-a26d-0fcdf372f486" />


### Tech Stack

<img width="1919" height="951" alt="image" src="https://github.com/user-attachments/assets/c5a3ffcc-b71c-4da5-b93e-5a4b75f09186" />


### About Me

<img width="1916" height="950" alt="image" src="https://github.com/user-attachments/assets/11c707fb-9c71-4089-9b9a-1af4d3d50d14" />


### Terminal Interface

<img width="1913" height="946" alt="image" src="https://github.com/user-attachments/assets/b1aa1b40-7a9b-4ab3-b8a6-e08d0a2d83dd" />


---

## Installation

Clone the repository.

```bash
git clone https://github.com/your-username/portfolio.git
```

Navigate to the project directory.

```bash
cd portfolio
```

Install dependencies.

```bash
npm install
```

---

## Development

Start the Vite development server.

```bash
npm run dev
```

The application will be available at:

```
https://nihal347.github.io/portfolio/
```

---

## Production Build

Generate an optimized production build.

```bash
npm run build
```

Preview the production build locally.

```bash
npm run preview
```

---

## Design Architecture

The application follows a component-driven architecture where each UI subsystem is encapsulated into independent React components.

Major modules include:

- Cockpit Interface
- Terminal System
- Heads-Up Display (HUD)
- Communication Panel
- Cursor System
- Notification (Toast) Manager
- Canvas Rendering Layer
- Dynamic Page Routing
- JSON-based Content Management

The project separates presentation, content, and interaction logic to improve maintainability and scalability.

---

## Performance Considerations

- Vite-powered development and production builds
- Component-based rendering
- Static asset optimization
- Type-safe development with TypeScript
- Responsive layout
- Minimal runtime dependencies

---

## Future Improvements

- Command-driven terminal navigation
- Internationalization (i18n)
- Theme customization
- Accessibility improvements
- Project filtering and search
- Interactive project case studies
- Performance analytics
- Progressive Web App (PWA) support

---

## Live Demo

https://your-website.com

---

## Author

**Nihal**

Machine Learning Engineer | AI Developer | Computer Vision Enthusiast

GitHub: https://github.com/your-username

LinkedIn: https://linkedin.com/in/your-profile

---

## License

This project is licensed under the MIT License.
