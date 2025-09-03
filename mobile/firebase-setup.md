# 🔔 Optional: Firebase Push Notifications Setup

## When to Add Firebase

Add Firebase to your React Native + Spring Boot app if you need:
- Push notifications
- Analytics tracking
- Crash reporting
- Remote configuration

## Installation Steps

### 1. Install Firebase packages
```bash
cd mobile
npm install @react-native-firebase/app @react-native-firebase/messaging
```

### 2. Android Configuration
1. Create Firebase project at https://console.firebase.google.com
2. Add Android app to your Firebase project
3. Download `google-services.json`
4. Place it in `mobile/android/app/`
5. Update `mobile/android/build.gradle`:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

6. Update `mobile/android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### 3. iOS Configuration (macOS only)
1. Add iOS app to Firebase project
2. Download `GoogleService-Info.plist`
3. Add to `mobile/ios/` folder via Xcode

### 4. Update React Native Code

#### App.js
```javascript
import messaging from '@react-native-firebase/messaging';

// Request permission for notifications
useEffect(() => {
  requestUserPermission();
}, []);

const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFCMToken();
  }
};

const getFCMToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    // Send this token to your Spring Boot backend
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
};
```

### 5. Spring Boot Integration

#### Add to your Spring Boot backend:
```java
@RestController
@RequestMapping("/notifications")
public class NotificationController {
    
    @PostMapping("/register-token")
    public ResponseEntity<?> registerToken(@RequestBody Map<String, String> request) {
        String fcmToken = request.get("token");
        // Save FCM token to user profile in database
        return ResponseEntity.ok("Token registered successfully");
    }
    
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationRequest request) {
        // Use Firebase Admin SDK to send notifications
        return ResponseEntity.ok("Notification sent");
    }
}
```

## Alternative: Push Notifications without Firebase

You can also implement push notifications using:
- **OneSignal** - Third-party push notification service
- **AWS SNS** - Amazon's notification service
- **Custom WebSocket** - Real-time notifications via your Spring Boot backend

## Recommendation

**Start without Firebase** and add it later only if you need:
1. Easy push notifications
2. Built-in analytics
3. Crash reporting

Your current Spring Boot + React Native setup is complete and production-ready without Firebase! 