# 🤝 Buddy - Accountability Companion App

[![React Native](https://img.shields.io/badge/React%20Native-0.74+-blue.svg)](https://reactnative.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2+-green.svg)](https://spring.io/projects/spring-boot)
[![Firebase](https://img.shields.io/badge/Firebase-Integrated-orange.svg)](https://firebase.google.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Find your accountability buddy and achieve goals together!** 🎯✨

A modern cross-platform accountability app that connects people with similar goals for motivation and support. Built with React Native, Spring Boot, and Firebase.

## 🏗️ Architecture Overview

```
┌─────────────────────┐    HTTP/REST    ┌─────────────────────┐
│   React Native      │◄──────────────►│   Spring Boot       │
│   Mobile App        │                 │   Backend API       │
│   (iOS & Android)   │                 │   (Java)            │
└─────────────────────┘                 └─────────────────────┘
                                                    │
                                        ┌─────────────────────┐
                                        │   Database          │
                                        │   (PostgreSQL)      │
                                        └─────────────────────┘
```

## 🚀 Tech Stack

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Authentication**: JWT with Spring Security
- **API Documentation**: OpenAPI/Swagger
- **Build Tool**: Maven
- **Testing**: JUnit 5, MockMvc

### Frontend (React Native)
- **Framework**: React Native 0.74+
- **Language**: JavaScript/TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **UI Components**: React Native Elements
- **Testing**: Jest, React Native Testing Library

## 📁 Project Structure

```
Buddy/
├── backend/                 # Spring Boot API
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── src/test/
│   └── pom.xml
├── mobile/                  # React Native App
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── store/
│   │   └── utils/
│   ├── android/
│   ├── ios/
│   └── package.json
└── README.md
```

## 🛠️ Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

### Backend Setup
```bash
cd backend
./mvnw spring-boot:run
```

### Mobile App Setup
```bash
cd mobile
npm install
npx react-native run-android  # or run-ios
```

## 🔐 Authentication Flow

The app uses JWT-based authentication:
1. User logs in via React Native app
2. Spring Boot validates credentials and returns JWT token
3. Token is stored securely on mobile device
4. Subsequent API calls include JWT in Authorization header

## 📱 Features

- ✅ Cross-platform mobile app (iOS & Android)
- ✅ RESTful API backend
- ✅ JWT Authentication
- ✅ User management
- ✅ Real-time data synchronization
- ✅ Offline support (planned)
- ✅ Push notifications (planned)

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test
```

### Mobile Testing
```bash
cd mobile
npm test
```

## 🚀 Deployment

### Backend Deployment
- Docker containerization
- Cloud deployment (AWS/Azure/GCP)
- CI/CD pipeline with GitHub Actions

### Mobile Deployment
- Android: Google Play Store
- iOS: Apple App Store
- CodePush for over-the-air updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 