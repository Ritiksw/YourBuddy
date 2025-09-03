# 🔥 Firebase Integration Setup Guide

## React Native + Spring Boot + Firebase

This guide will help you integrate Firebase into your existing React Native + Spring Boot app.

## 🎯 What Firebase Adds to Your App

Your app now includes:
- ✅ **Push Notifications** with Firebase Cloud Messaging (FCM)
- ✅ **Analytics** to track user behavior
- ✅ **Crash Reporting** with Firebase Crashlytics
- ✅ **Remote Config** for feature flags
- ✅ **Cloud Storage** for file uploads

## 🔧 Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `buddy-app`
4. Enable Google Analytics (recommended)
5. Choose or create Analytics account

### 2. Add Android App

1. In Firebase Console, click "Add app" → Android
2. **Android package name**: `com.buddymobile`
3. **App nickname**: `Buddy Android`
4. Download `google-services.json`
5. Place file in `mobile/android/app/google-services.json`

### 3. Add iOS App (macOS only)

1. In Firebase Console, click "Add app" → iOS
2. **iOS bundle ID**: `com.buddymobile`
3. **App nickname**: `Buddy iOS`
4. Download `GoogleService-Info.plist`
5. Add to `mobile/ios/` folder via Xcode

### 4. Backend Firebase Setup

1. In Firebase Console, go to **Project Settings** → **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `firebase-service-account.json`
5. Place in `backend/src/main/resources/firebase-service-account.json`

## 📱 Mobile App Configuration

### Install Dependencies
```bash
cd mobile
npm install
```

### Android Configuration

The `mobile/android/build.gradle` and `mobile/android/app/build.gradle` are already configured.

Make sure you have:
1. `google-services.json` in `mobile/android/app/`
2. Run the app:
```bash
npm run android
```

### iOS Configuration (macOS only)

1. Open `mobile/ios/BuddyMobile.xcworkspace` in Xcode
2. Drag `GoogleService-Info.plist` into the project
3. Ensure it's added to the target
4. Run the app:
```bash
npm run ios
```

## 🔔 Testing Push Notifications

### 1. Test from Firebase Console

1. Go to Firebase Console → **Messaging**
2. Click "Send your first message"
3. Enter title and message
4. Select your app
5. Send test message

### 2. Test from Backend API

```bash
# First, register for notifications by logging into the app
# Then send a notification via API

curl -X POST http://localhost:8080/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test from Spring Boot!",
    "targetUsername": "testuser"
  }'
```

## 📊 Firebase Features Available

### 1. Push Notifications
- ✅ **Individual notifications** to specific users
- ✅ **Topic-based notifications** to groups
- ✅ **Scheduled notifications** via Firebase Console
- ✅ **Rich notifications** with images and actions

### 2. Analytics
```javascript
import firebaseService from '../services/firebaseService';

// Track custom events
firebaseService.logEvent('button_clicked', {
  button_name: 'login',
  screen_name: 'LoginScreen'
});

// Track screen views
firebaseService.logEvent('screen_view', {
  screen_name: 'HomeScreen'
});
```

### 3. Crashlytics
```javascript
// Automatic crash reporting is enabled
// You can also log custom errors:
firebaseService.logError(new Error('Custom error'), {
  context: 'user_action',
  user_id: user.id
});
```

### 4. Remote Config
```javascript
import remoteConfig from '@react-native-firebase/remote-config';

// Set default values
await remoteConfig().setDefaults({
  welcome_message: 'Welcome to Buddy!',
  feature_enabled: false,
});

// Fetch and activate
await remoteConfig().fetchAndActivate();

// Get values
const welcomeMessage = remoteConfig().getValue('welcome_message').asString();
const featureEnabled = remoteConfig().getValue('feature_enabled').asBoolean();
```

## 🔐 Security Configuration

### Environment Variables
Create `.env` file in project root:
```
# Database
DB_USERNAME=buddy_user
DB_PASSWORD=buddy_password

# JWT
JWT_SECRET=myVerySecretJWTKeyForBuddyApp2025

# Firebase (optional, can use service account file instead)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## 🚀 Running the Complete Setup

### 1. Start Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 2. Start Mobile App
```bash
cd mobile
npm run android  # or npm run ios
```

### 3. Test the Integration
1. Register a new user
2. Login to the app
3. Check backend logs for FCM token registration
4. Send test notification from Firebase Console

## 📈 Monitoring and Analytics

### Firebase Console
- **Analytics**: Real-time user activity
- **Crashlytics**: Crash reports and performance monitoring
- **Cloud Messaging**: Notification delivery stats
- **Remote Config**: Feature flag usage

### Spring Boot Actuator
- **Health**: http://localhost:8080/api/actuator/health
- **Metrics**: http://localhost:8080/api/actuator/metrics
- **API Docs**: http://localhost:8080/api/swagger-ui.html

## 🎯 What You Now Have

### **Hybrid Architecture Benefits:**
- 🏗️ **Spring Boot**: Robust backend, database, business logic
- 🔥 **Firebase**: Push notifications, analytics, crash reporting
- 📱 **React Native**: Cross-platform mobile app
- 🔐 **JWT + Firebase**: Dual authentication capabilities
- 📊 **PostgreSQL + Firebase**: Structured data + real-time features

### **Best of Both Worlds:**
- Enterprise-grade backend (Spring Boot)
- Mobile-optimized services (Firebase)
- Cross-platform frontend (React Native)
- Comprehensive monitoring and analytics

## 🚨 Important Notes

1. **Firebase Service Account**: Keep `firebase-service-account.json` secure and never commit to version control
2. **API Keys**: Store Firebase config in environment variables for production
3. **Permissions**: Request notification permissions appropriately
4. **Testing**: Test on both Android and iOS devices
5. **Production**: Use different Firebase projects for development and production

Your app now has enterprise-level backend capabilities with modern mobile features! 🎉 