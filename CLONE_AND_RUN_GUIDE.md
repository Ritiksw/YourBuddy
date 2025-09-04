# 💻 Clone & Run Buddy App on New Laptop - Step by Step

## 📋 **Prerequisites - Install These First**

### **Required Software:**
1. **Git** - Download: https://git-scm.com/download/windows
2. **Java 17+** - Download: https://adoptium.net/
3. **Maven** - Download: https://maven.apache.org/download.cgi
4. **Node.js 18+** - Download: https://nodejs.org/
5. **PostgreSQL** - Download: https://www.postgresql.org/download/
6. **Android Studio** - Download: https://developer.android.com/studio (for Android)
7. **Docker Desktop** (optional) - Download: https://www.docker.com/products/docker-desktop/

### **Verify Installations:**
```bash
git --version
java --version
mvn --version
node --version
npm --version
```

## 🛠️ **Maven Installation for Windows (If Not Installed)**

If `mvn --version` fails, follow these steps:

### **Option A: Manual Installation**
1. **Download Maven** from: https://maven.apache.org/download.cgi
2. **Extract** to `C:\Program Files\Apache\maven`
3. **Add to PATH:**
   - Open **System Properties** → **Environment Variables**
   - Add `C:\Program Files\Apache\maven\bin` to your **PATH**
   - Restart Git Bash/Command Prompt

### **Option B: Using Chocolatey (Recommended)**
```bash
# Install Chocolatey first (if not installed)
# Run this in PowerShell as Administrator:
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Then install Maven
choco install maven
```

### **Option C: Using Scoop**
```bash
# Install Scoop first (if not installed)
# Run this in PowerShell:
iwr -useb get.scoop.sh | iex

# Then install Maven
scoop install maven
```

**After installation, restart Git Bash and verify:**
```bash
mvn --version
```

## 🔄 **Step 1: Clone the Repository**

### **1.1 Open Terminal/Command Prompt**
```bash
# Navigate to where you want the project
cd C:\Projects
# or
cd ~/Desktop
```

### **1.2 Clone Your Repository**
```bash
git clone https://github.com/Ritiksw/YourBuddy.git
```

### **1.3 Navigate to Project**
```bash
cd YourBuddy
```

## 🗄️ **Step 2: Database Setup**

### **Option A: Docker (Easiest)**
```bash
# Start PostgreSQL with Docker
docker-compose up postgres -d

# Verify it's running
docker ps
```

### **Option B: Local PostgreSQL**
1. **Open PostgreSQL command line** (pgAdmin or psql)
2. **Run these commands:**
```sql
CREATE DATABASE buddy_db;
CREATE USER buddy_user WITH PASSWORD 'buddy_password';
GRANT ALL PRIVILEGES ON DATABASE buddy_db TO buddy_user;
\q
```

## 🔧 **Step 3: Backend Setup (Spring Boot)**

### **3.1 Navigate to Backend**
```bash
cd backend
```

### **3.2 Install Dependencies**
**Note:** This project doesn't include Maven wrapper files, so we'll use Maven directly.

```bash
# Make sure Maven is installed
mvn --version

# Install dependencies
mvn dependency:resolve
```

### **3.3 Run Spring Boot Application**
```bash
# Run the application
mvn spring-boot:run
```

**Alternative if Maven is not installed:**
```bash
# Install Maven using Chocolatey (Windows)
choco install maven

# Or download manually from: https://maven.apache.org/download.cgi
```

### **3.5 Verify Backend is Running**
Open browser: **http://localhost:8080/api/actuator/health**
Should see: `{"status":"UP"}`

## 📱 **Step 4: Mobile App Setup (React Native)**

### **4.1 Open New Terminal/Command Prompt**
```bash
# Navigate to mobile folder
cd mobile
```

### **4.2 Install Node Dependencies**
```bash
npm install
```

### **4.3 Install React Native CLI Globally**
```bash
npm install -g @react-native-community/cli
```

### **4.4 iOS Setup (macOS Only)**
```bash
cd ios
pod install
cd ..
```

### **4.5 Android Setup**
1. **Open Android Studio**
2. **Open** `YourBuddy/mobile/android` folder
3. **Let Gradle sync** complete
4. **Create AVD** (Android Virtual Device) if needed

### **4.6 Run the Mobile App**

#### **For Android:**
```bash
# Start Metro bundler (in one terminal)
npm start

# Run Android app (in another terminal)
npm run android
```

#### **For iOS (macOS only):**
```bash
# Start Metro bundler (in one terminal)
npm start

# Run iOS app (in another terminal)
npm run ios
```

## 🔥 **Step 5: Firebase Setup (Optional but Recommended)**

### **5.1 Create Firebase Project**
1. Go to: https://console.firebase.google.com
2. Create new project: `buddy-app-[yourname]`
3. Enable Google Analytics

### **5.2 Add Apps to Firebase**
1. **Android App**: Package name `com.buddymobile`
2. **iOS App**: Bundle ID `com.buddymobile`

### **5.3 Download Config Files**
1. **Android**: Download `google-services.json` → Place in `mobile/android/app/`
2. **iOS**: Download `GoogleService-Info.plist` → Add to `mobile/ios/` via Xcode

### **5.4 Backend Firebase Setup**
1. **Firebase Console** → **Project Settings** → **Service Accounts**
2. **Generate new private key** → Download JSON
3. **Rename** to `firebase-service-account.json`
4. **Place** in `backend/src/main/resources/`

## 🧪 **Step 6: Test Everything Works**

### **6.1 Test Backend API**
```bash
# Test health endpoint
curl http://localhost:8080/api/actuator/health

# Test user registration
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### **6.2 Test Mobile App**
1. **Launch the React Native app**
2. **Register a new user**
3. **Login with credentials**
4. **Navigate through the app**
5. **Test real-time chat** (if Firebase is set up)

## 🚨 **Troubleshooting Common Issues**

### **Backend Issues:**
```bash
# Port 8080 in use
# Windows:
netstat -ano | findstr :8080
taskkill /PID [PID_NUMBER] /F

# Linux/macOS:
lsof -ti:8080 | xargs kill -9
```

### **Mobile App Issues:**
```bash
# Clear React Native cache
npx react-native start --reset-cache

# Android build issues
cd mobile/android
./gradlew clean
cd ..
npx react-native run-android

# iOS build issues (macOS)
cd mobile/ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

### **Database Issues:**
```bash
# Check if PostgreSQL is running
# Windows:
sc query postgresql-x64-15

# Linux/macOS:
brew services list | grep postgres
```

## ⚡ **Quick Start Commands Summary**

```bash
# 1. Clone repository
git clone https://github.com/Ritiksw/YourBuddy.git
cd YourBuddy

# 2. Start database
docker-compose up postgres -d

# 3. Start backend (new terminal)
cd backend
mvn spring-boot:run

# 4. Start mobile app (new terminal)
cd mobile
npm install
npm start

# 5. Run on device (new terminal)
cd mobile
npm run android  # or npm run ios
```

## 🎯 **Expected Results**

After following these steps, you should have:
- ✅ **Backend running** on http://localhost:8080
- ✅ **Database connected** and tables created automatically
- ✅ **Mobile app** running on Android/iOS emulator
- ✅ **Registration/Login** working
- ✅ **Real-time chat** functional (if Firebase configured)

## 🆘 **Need Help?**

If you run into issues:
1. Check the `SETUP.md` file in the repository
2. Verify all prerequisites are installed
3. Make sure ports 8080 and 5432 are not in use
4. Check that your firewall allows the applications

## 🎉 **You're Ready!**

Your Buddy accountability app should now be running on the new laptop! The app includes:
- Complete authentication system
- Goal management
- Buddy matching system
- Real-time chat
- Push notifications (with Firebase)

**Happy coding!** 🚀 