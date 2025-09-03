# 🚀 Buddy App Setup Guide

## React Native + Spring Boot Cross-Platform App

This guide will help you set up and run the Buddy app on your local development environment.

## 📋 Prerequisites

### Required Software
- **Java 17+** - [Download here](https://adoptium.net/)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - [Download here](https://www.postgresql.org/) (or use Docker)
- **Android Studio** - [Download here](https://developer.android.com/studio)
- **Xcode** (macOS only) - Available from Mac App Store

### React Native CLI
```bash
npm install -g @react-native-community/cli
```

### Verify Installation
```bash
# Check Java
java --version

# Check Node
node --version
npm --version

# Check React Native CLI
npx react-native --version
```

## 🐘 Database Setup

### Option 1: Using Docker (Recommended)
```bash
# Start PostgreSQL with Docker Compose
docker-compose up postgres -d
```

### Option 2: Local PostgreSQL Installation
1. Install PostgreSQL
2. Create database and user:
```sql
CREATE DATABASE buddy_db;
CREATE USER buddy_user WITH PASSWORD 'buddy_password';
GRANT ALL PRIVILEGES ON DATABASE buddy_db TO buddy_user;
```

## 🔧 Backend Setup (Spring Boot)

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies and run
```bash
# Make mvnw executable (Linux/macOS)
chmod +x mvnw

# Install dependencies
./mvnw dependency:resolve

# Run the application
./mvnw spring-boot:run
```

### 3. Verify backend is running
- Open browser: http://localhost:8080/api/actuator/health
- API Documentation: http://localhost:8080/api/swagger-ui.html

## 📱 Mobile App Setup (React Native)

### 1. Navigate to mobile directory
```bash
cd mobile
```

### 2. Install dependencies
```bash
npm install
```

### 3. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 4. Android Setup
1. Open Android Studio
2. Open `mobile/android` folder
3. Let Gradle sync complete
4. Create a virtual device (AVD) if needed

### 5. Run the app

#### For Android:
```bash
# Start Metro bundler
npm start

# In another terminal, run Android app
npm run android
```

#### For iOS (macOS only):
```bash
# Start Metro bundler
npm start

# In another terminal, run iOS app
npm run ios
```

## 🔄 Quick Start with Docker

### Run everything with Docker Compose:
```bash
# Start database and backend
docker-compose up -d

# The backend will be available at http://localhost:8080
```

### Then run React Native app:
```bash
cd mobile
npm install
npm run android  # or npm run ios
```

## 🧪 Testing the Setup

### 1. Test Backend API
```bash
# Test health endpoint
curl http://localhost:8080/api/actuator/health

# Test registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### 2. Test Mobile App
1. Launch the React Native app
2. Try registering a new user
3. Login with the credentials
4. Navigate through the app

## 🛠️ Development Workflow

### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```
- Backend runs on http://localhost:8080
- Auto-reloads on code changes (with spring-boot-devtools)
- Check logs in terminal

### Mobile Development
```bash
cd mobile
npm start
```
- Metro bundler runs on http://localhost:8081
- Hot reload enabled
- Shake device or press 'R' to reload
- Press 'D' to open developer menu

## 🔧 Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.yml`:
- Database connection settings
- JWT secret and expiration
- CORS settings
- Logging levels

### Mobile Configuration
Edit `mobile/src/services/api.js`:
- Change `BASE_URL` for production
- Modify timeout settings
- Update error handling

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Health Check
- `GET /api/actuator/health` - Application health status

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
1. **Port 8080 already in use**
   ```bash
   # Kill process on port 8080
   lsof -ti:8080 | xargs kill -9
   ```

2. **Database connection failed**
   - Check PostgreSQL is running
   - Verify database credentials in application.yml
   - Check if database `buddy_db` exists

#### Mobile App Issues
1. **Metro bundler issues**
   ```bash
   cd mobile
   npx react-native start --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd mobile/android
   ./gradlew clean
   cd ..
   npx react-native run-android
   ```

3. **iOS build issues**
   ```bash
   cd mobile/ios
   rm -rf Pods Podfile.lock
   pod install
   cd ..
   npx react-native run-ios
   ```

### Network Issues
If mobile app can't connect to backend:

#### Android Emulator
```bash
# Forward port from emulator to localhost
adb reverse tcp:8080 tcp:8080
```

#### iOS Simulator
- Use your computer's IP address instead of localhost
- Update `BASE_URL` in `mobile/src/services/api.js`

### Environment Variables
Create `.env` file in project root:
```
DB_USERNAME=buddy_user
DB_PASSWORD=buddy_password
JWT_SECRET=myVerySecretJWTKeyForBuddyApp2025
```

## 🚀 Next Steps

1. **Add more features** - Implement additional screens and functionality
2. **Improve UI/UX** - Enhance the design and user experience
3. **Add testing** - Write unit and integration tests
4. **Set up CI/CD** - Automate building and deployment
5. **Add monitoring** - Implement logging and monitoring

## 📚 Useful Commands

### Backend
```bash
# Run tests
./mvnw test

# Build without running
./mvnw clean compile

# Package for production
./mvnw clean package
```

### Mobile
```bash
# Install new dependency
npm install package-name

# Run on specific device
npx react-native run-android --deviceId=DEVICE_ID

# Generate APK for testing
cd android
./gradlew assembleRelease
```

## 🆘 Getting Help

- **Spring Boot Documentation**: https://docs.spring.io/spring-boot/
- **React Native Documentation**: https://reactnative.dev/docs/getting-started
- **React Navigation**: https://reactnavigation.org/
- **Redux Toolkit**: https://redux-toolkit.js.org/

Happy coding! 🎉 