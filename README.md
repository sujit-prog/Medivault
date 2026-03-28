# MediVault 🏥

A full-stack healthcare management platform that connects patients and doctors through a secure, modern web portal. MediVault streamlines appointment scheduling, medical record management, prescriptions, and data consent — all in one place.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running with Docker](#running-with-docker)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Overview](#api-overview)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### For Patients
- 📅 **Appointment Booking** — Browse available doctor slots and book appointments in real time
- 📁 **Health Records** — Upload, view, edit, and delete personal medical records (PDFs, images, reports)
- 💊 **Prescriptions** — View prescriptions issued by doctors, including prescription images
- 🛡️ **Data Consent Management** — Approve, deny, or revoke doctor access to your health records
- 👤 **Profile Management** — Maintain a detailed personal health profile including blood group, DOB, and address
- 🔔 **Notifications** — Get notified of appointment status changes and consent requests
- ⭐ **Feedback & Ratings** — Leave star ratings and feedback after completed appointments

### For Doctors
- 🗓️ **Availability Management** — Set and manage available time slots for patient bookings
- 📋 **Appointment Management** — Approve, reject, or cancel incoming appointment requests
- 📝 **Issue Prescriptions** — Send typed prescriptions or prescription images directly to patients
- 🔍 **Patient Record Access** — View patient health records (only with patient consent)
- 🤝 **Consent Requests** — Request access to a patient's medical records

### General
- 🔐 **JWT Authentication** — Secure login with token-based auth persisted in localStorage
- 🔑 **Forgot Password / OTP Reset** — 3-step password recovery via email OTP
- 📱 **Responsive Design** — Mobile-friendly UI with a collapsible sidebar
- ⚡ **Code Splitting** — Lazy-loaded routes for fast initial page load

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| React Router DOM 7 | Client-side routing |
| Tailwind CSS 4 | Utility-first styling |
| Axios | HTTP client with JWT interceptors |
| Lucide React | Icon library |
| Vite 7 | Build tool and dev server |

### Backend
| Technology | Purpose |
|---|---|
| Java 17 | Runtime |
| Spring Boot | Application framework |
| Spring Security + JWT | Authentication & authorization |
| Spring Data JPA | Database ORM |
| Maven | Build and dependency management |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerization |
| Railway | Backend deployment |
| Vercel | Frontend deployment |

---

## Project Structure

```
medvault/
├── medvault-backend/         # Spring Boot API
│   ├── src/
│   │   └── main/
│   │       ├── java/         # Controllers, Services, Repositories, Models
│   │       └── resources/    # application.properties, static assets
│   ├── mvnw                  # Maven wrapper
│   └── pom.xml
│
├── medvault-frontend/        # React + Vite SPA
│   ├── public/               # Static assets (favicon, etc.)
│   ├── src/
│   │   ├── pages/            # Route-level components
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Appointments.jsx
│   │   │   ├── Availability.jsx
│   │   │   ├── MedicalRecords.jsx
│   │   │   ├── Prescriptions.jsx
│   │   │   ├── ConsentManagement.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── services/
│   │   │   └── api.js        # Axios instance with auth interceptor
│   │   ├── App.jsx           # Router and lazy loading setup
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles + Tailwind import
│   ├── vite.config.js
│   ├── package.json
│   └── vercel.json           # SPA fallback routing for Vercel
│
├── Dockerfile                # Docker build for backend
├── railway.json              # Railway deployment config
└── start.sh                  # Startup script for Railway
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **Java** 17
- **Maven** (or use the included `mvnw` wrapper)
- **Docker** (optional, for containerized setup)

---

### Backend Setup

```bash
# Navigate to the backend directory
cd medvault-backend

# Build the project (skipping tests for speed)
./mvnw clean package -DskipTests

# Run the application
java -jar target/*.jar
```

The API will start on **http://localhost:8080**.

Configure your database and other settings in `medvault-backend/src/main/resources/application.properties`.

---

### Frontend Setup

```bash
# Navigate to the frontend directory
cd medvault-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**.

To point the frontend at a different backend URL, create a `.env` file in `medvault-frontend/`:

```env
VITE_API_URL=http://localhost:8080/api
```

---

### Running with Docker

A `Dockerfile` is provided for the backend:

```bash
# Build the image from the project root
docker build -t medivault-backend .

# Run the container
docker run -p 8080:8080 medivault-backend
```

---

## Environment Variables

### Frontend (`medvault-frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | Base URL of the backend API |

### Backend (`application.properties`)

Configure your database connection, JWT secret, mail server (for OTP), and file storage settings in the Spring Boot `application.properties` file. Key properties typically include:

```properties
spring.datasource.url=jdbc:...
spring.datasource.username=...
spring.datasource.password=...
jwt.secret=...
spring.mail.host=...
spring.mail.username=...
spring.mail.password=...
```

---

## Deployment

### Frontend → Vercel

The `vercel.json` file is already configured to handle SPA routing (all paths fall back to `index.html`). Simply connect your repository to Vercel and set the `VITE_API_URL` environment variable in the Vercel dashboard.

### Backend → Railway

The `railway.json` and `start.sh` files configure the Railway deployment. Point Railway at the repository root and it will build and run the Spring Boot application automatically.

---

## API Overview

All endpoints are prefixed with `/api`. The API uses JWT Bearer token authentication — include the token in the `Authorization: Bearer <token>` header for protected routes.

| Resource | Endpoints |
|---|---|
| **Auth** | `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| **Appointments** | `GET /appointments/patient`, `GET /appointments/doctor`, `POST /appointments/book`, `PUT /appointments/approve/{id}`, `PUT /appointments/reject/{id}`, `PUT /appointments/feedback/{id}` |
| **Availability** | `GET /availability/doctor`, `GET /availability/doctor/{id}`, `POST /availability/add`, `DELETE /availability/{id}` |
| **Records** | `GET /records`, `GET /records/patient/{id}`, `POST /records/upload`, `PUT /records/{id}`, `DELETE /records/{id}`, `GET /records/{id}/file` |
| **Prescriptions** | `GET /prescriptions/my`, `GET /prescriptions/sent`, `POST /prescriptions`, `GET /prescriptions/{id}/image` |
| **Consents** | `GET /consents/patient`, `GET /consents/doctor`, `POST /consents/request/{patientId}`, `PUT /consents/{id}/status` |
| **Profile** | `GET /profile`, `PUT /profile` |
| **Notifications** | `GET /notifications/unread`, `PUT /notifications/{id}/read` |
| **Users** | `GET /users/doctors`, `GET /users/patients` |

---

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

Please make sure your code follows the existing style conventions and that the application builds successfully before submitting.

---

## License

This project is open source and available under the [MIT License](LICENSE).
