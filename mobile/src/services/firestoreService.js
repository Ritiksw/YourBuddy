import firestore from '@react-native-firebase/firestore';
import { apiHelper } from './api';

class FirestoreService {
  
  // Chat Messages
  async sendMessage(receiverId, content, type = 'text') {
    try {
      // Send via Spring Boot API for validation and processing
      const response = await apiHelper.post('/chat/send', {
        receiverId,
        content,
        type
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  // Real-time chat listener
  subscribeToChatMessages(senderId, receiverId, callback) {
    const unsubscribe = firestore()
      .collection('chat_messages')
      .where('senderId', 'in', [senderId, receiverId])
      .where('receiverId', 'in', [senderId, receiverId])
      .orderBy('timestamp', 'asc')
      .onSnapshot(
        (snapshot) => {
          const messages = [];
          snapshot.forEach(doc => {
            messages.push({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate(),
            });
          });
          callback(messages);
        },
        (error) => {
          console.error('Chat listener error:', error);
        }
      );
    
    return unsubscribe;
  }
  
  // Real-time unread messages listener
  subscribeToUnreadMessages(userId, callback) {
    const unsubscribe = firestore()
      .collection('chat_messages')
      .where('receiverId', '==', userId)
      .where('isRead', '==', false)
      .onSnapshot(
        (snapshot) => {
          const unreadCount = snapshot.size;
          const messages = [];
          snapshot.forEach(doc => {
            messages.push({
              id: doc.id,
              ...doc.data(),
              timestamp: doc.data().timestamp?.toDate(),
            });
          });
          callback({ unreadCount, messages });
        },
        (error) => {
          console.error('Unread messages listener error:', error);
        }
      );
    
    return unsubscribe;
  }
  
  async markMessageAsRead(messageId) {
    try {
      await apiHelper.put(`/chat/read/${messageId}`);
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
  
  // User Activity Tracking (Analytics)
  async logUserActivity(userId, activity, metadata = {}) {
    try {
      const activityData = {
        userId,
        activity,
        metadata,
        timestamp: firestore.FieldValue.serverTimestamp(),
        platform: 'mobile',
      };
      
      await firestore()
        .collection('user_activities')
        .add(activityData);
        
      console.log('User activity logged:', activity);
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }
  
  // App Settings and Configuration
  async saveUserPreferences(userId, preferences) {
    try {
      await firestore()
        .collection('user_preferences')
        .doc(userId)
        .set(preferences, { merge: true });
        
      console.log('User preferences saved');
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw error;
    }
  }
  
  async getUserPreferences(userId) {
    try {
      const doc = await firestore()
        .collection('user_preferences')
        .doc(userId)
        .get();
        
      if (doc.exists) {
        return doc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }
  
  // Real-time user status
  async updateUserStatus(userId, status) {
    try {
      await firestore()
        .collection('user_status')
        .doc(userId)
        .set({
          status, // 'online', 'offline', 'away'
          lastSeen: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }
  
  subscribeToUserStatus(userId, callback) {
    const unsubscribe = firestore()
      .collection('user_status')
      .doc(userId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({
              status: doc.data().status,
              lastSeen: doc.data().lastSeen?.toDate(),
            });
          }
        },
        (error) => {
          console.error('User status listener error:', error);
        }
      );
    
    return unsubscribe;
  }
  
  // Batch operations
  async batchWrite(operations) {
    try {
      const batch = firestore().batch();
      
      operations.forEach(operation => {
        const { type, collection, docId, data } = operation;
        const docRef = firestore().collection(collection).doc(docId);
        
        switch (type) {
          case 'set':
            batch.set(docRef, data);
            break;
          case 'update':
            batch.update(docRef, data);
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });
      
      await batch.commit();
      console.log('Batch operation completed successfully');
    } catch (error) {
      console.error('Error in batch operation:', error);
      throw error;
    }
  }
}

export default new FirestoreService(); 