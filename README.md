# PopScope

## Description
PopScope is a data visualization platform for exploring population and country development metrics. The application provides interactive visualizations and insights into global demographic trends using comprehensive data analysis.

## Frameworks and Technologies
- Frontend: 
  - Next.js 15
  - React 19
  - Tailwind CSS
  - Chart.js
  - Framer Motion
- Backend:
  - FastAPI
  - Python 3.12
  - Pandas
  - NumPy
- Containerization: Docker
- Development Tools:
  - TypeScript
  - Poetry (Python dependency management)
  - ESLint

## Prerequisites
- Docker (version 20.10 or later)
- Docker Compose
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/DogukanGun/PopScope.git
cd PopScope
```

2. Environment Setup
Ensure Docker and Docker Compose are installed on your system.

### Running the Application
To start the entire application:

```bash
docker-compose up --build
```

The application will be accessible at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`

### Stopping the Application
```bash
docker-compose down
```

## Development

### Frontend Development
```bash
cd platform
npm install
npm run dev
```

### Backend Development
```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload
```
