# 🎯 Buddy - Accountability Partner App

A comprehensive mobile application for goal tracking and finding accountability partners, built with React Native (Expo) frontend and Spring Boot backend.

## 📱 Features

### ✅ **Goal Management**
- Create, edit, and delete personal goals
- Track progress with visual progress bars
- Set categories, difficulty levels, and target dates
- Public/private goal visibility settings

### 👥 **Social Features**
- Find accountability buddies
- Send and receive buddy requests
- Chat with accountability partners
- Share progress updates

### 📊 **Progress Tracking**
- Visual progress tracking
- Check-in system with notes and mood
- Goal completion celebration
- Timeline and deadline management

## 🏗️ **Tech Stack**

### **Frontend (Mobile)**
- **React Native** with **Expo** SDK 51
- **Redux Toolkit** for state management
- **React Navigation** for navigation
- **Axios** for API calls
- **Expo Vector Icons** with emoji fallbacks

### **Backend (API)**
- **Spring Boot 3.2.1** with Java 17
- **PostgreSQL** database
- **JWT Authentication**
- **Spring Security**
- **Flyway** for database migrations
- **Docker** containerization

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Java 17** (for local development)
- **Android Studio** (for Android development)
- **Expo CLI** (`npm install -g @expo/cli`)

### **1. Clone the Repository**
```bash
git clone https://github.com/Ritiksw/YourBuddy.git
cd YourBuddy
```

### **2. Start Backend with Docker**
```bash
# Start PostgreSQL and Spring Boot backend
docker compose up -d

# Check if services are running
docker compose ps

# View backend logs
docker compose logs backend --follow
```

### **3. Verify Database Setup**
```bash
# Check if tables were created
docker compose exec postgres psql -U buddy_user -d buddy_db -c "\dt"

# Should show: users, goals, buddy_relationships, chat_messages, etc.
```

### **4. Setup Mobile App**
```bash
cd mobile-expo

# Install dependencies
npm install

# Install Expo dependencies
npx expo install

# Start Expo development server
npx expo start
```

### **5. Run on Device/Emulator**
- **Android**: Press `a` in Expo CLI or scan QR code with Expo Go app
- **iOS**: Press `i` in Expo CLI or scan QR code with Expo Go app

## 🔧 **Detailed Setup**

### **Backend Configuration**

#### **Environment Variables**
Create `.env` file in the root directory:
```env
# Database
SPRING_DATASOURCE_USERNAME=buddy_user
SPRING_DATASOURCE_PASSWORD=buddy_password

# JWT
JWT_SECRET=myVerySecretJWTKeyForBuddyApp2025

# Firebase (Optional)
FIREBASE_ENABLED=false
FIREBASE_SERVICE_ACCOUNT_KEY=firebase-service-account.json
```

#### **Database Setup Options**

**Option 1: Automatic (Recommended)**
```bash
# Tables are created automatically via Flyway migrations
docker compose up -d
```

**Option 2: Manual Setup**
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U buddy_user -d buddy_db

# Run the setup script
\i /setup-database.sql
```

#### **API Endpoints**
- **Base URL**: `http://localhost:8080/api`
- **Health Check**: `http://localhost:8080/api/actuator/health`
- **API Documentation**: `http://localhost:8080/api/swagger-ui.html`

### **Frontend Configuration**

#### **Network Setup**
The app automatically detects your PC's IP address for mobile device connectivity. If you encounter network issues:

1. **Find your PC's IP address**:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. **Update API configuration** in `mobile-expo/src/services/api.js`:
   ```javascript
   return `http://YOUR_PC_IP:8080/api`;
   ```

#### **Android Development Setup**
1. **Install Android Studio**
2. **Set environment variables**:
   ```
   ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
   PATH=%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
   ```
3. **Create/start emulator** or connect physical device
4. **Enable USB debugging** on physical device

## 🧪 **Testing**

### **Default Test Account**
- **Username**: `testuser`
- **Password**: `password123`
- **Email**: `test@buddy.com`

### **Sample Data**
The database includes sample goals for testing:
- Daily Morning Run (FITNESS)
- Learn Spanish (EDUCATION)
- Read 12 Books This Year (HOBBY)

### **API Testing**
```bash
# Test authentication
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Test goal creation (replace TOKEN)
curl -X POST http://localhost:8080/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Goal","category":"FITNESS","startDate":"2024-01-15","targetDate":"2024-02-15"}'
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **"Failed to create goal" Error**
1. **Check backend logs**: `docker compose logs backend --tail=20`
2. **Verify database tables**: `docker compose exec postgres psql -U buddy_user -d buddy_db -c "\dt"`
3. **Check network connectivity**: Ensure mobile device can reach your PC's IP
4. **Validate form data**: Ensure all required fields are filled

#### **Mobile App Can't Connect to Backend**
1. **Check backend status**: `docker compose ps`
2. **Verify IP address**: Update API base URL in `mobile-expo/src/services/api.js`
3. **Firewall settings**: Ensure port 8080 is accessible
4. **Use adb reverse** for emulator: `adb reverse tcp:8080 tcp:8080`

#### **Database Connection Issues**
```bash
# Reset database
docker compose down -v
docker compose up -d

# Check PostgreSQL logs
docker compose logs postgres
```

#### **Build/Dependency Issues**
```bash
# Clean and reinstall
cd mobile-expo
rm -rf node_modules package-lock.json
npm install
npx expo install
```

## 📂 **Project Structure**

```
YourBuddy/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/buddy/
│   │   ├── controller/         # REST controllers
│   │   ├── model/             # JPA entities
│   │   ├── repository/        # Data repositories
│   │   ├── service/           # Business logic
│   │   ├── security/          # JWT & security config
│   │   └── config/            # Application config
│   ├── src/main/resources/
│   │   ├── db/migration/      # Flyway migrations
│   │   └── application.yml    # App configuration
│   ├── Dockerfile             # Backend container
│   └── pom.xml               # Maven dependencies
├── mobile-expo/               # React Native Expo app
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── screens/           # App screens
│   │   ├── navigation/        # Navigation setup
│   │   ├── services/          # API services
│   │   └── store/            # Redux store & slices
│   ├── App.js                # Main app component
│   └── package.json          # Dependencies
├── docker-compose.yml         # Multi-container setup
├── setup-database.sql         # Manual DB setup
└── README.md                 # This file
```

## 🔑 **API Reference**

### **Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

### **Goals**
- `GET /goals` - Get user goals
- `POST /goals` - Create new goal
- `GET /goals/{id}` - Get goal details
- `PUT /goals/{id}` - Update goal
- `DELETE /goals/{id}` - Delete goal
- `POST /goals/{id}/progress` - Update progress

### **Buddies**
- `GET /buddies/my-buddies` - Get user's buddies
- `POST /buddies/request/{goalId}` - Send buddy request
- `POST /buddies/accept/{id}` - Accept buddy request
- `GET /buddies/recommendations` - Get buddy recommendations

### **Chat**
- `GET /chat/conversations` - Get chat conversations
- `POST /chat/send` - Send message
- `GET /chat/history/{receiverId}` - Get chat history

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

If you encounter any issues:

1. **Check the troubleshooting section** above
2. **Review the logs** (backend and mobile)
3. **Verify your setup** against this README
4. **Open an issue** on GitHub with:
   - Error messages
   - Steps to reproduce
   - Your environment details

## 🚀 **Next Steps**

- [ ] Add push notifications with Firebase
- [ ] Implement real-time chat
- [ ] Add goal sharing and social features
- [ ] Create web dashboard
- [ ] Add data analytics and insights
- [ ] Implement streak tracking
- [ ] Add goal templates and categories

---

**Built with ❤️ for accountability and personal growth** 