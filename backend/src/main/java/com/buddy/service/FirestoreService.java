package com.buddy.service;

import com.buddy.model.ChatMessage;
import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class FirestoreService {
    
    private static final Logger logger = LoggerFactory.getLogger(FirestoreService.class);
    
    @Autowired
    private Firestore firestore;
    
    // Generic CRUD operations for any collection
    
    public <T> String saveDocument(String collection, T document) throws ExecutionException, InterruptedException {
        try {
            ApiFuture<DocumentReference> future = firestore.collection(collection).add(document);
            DocumentReference docRef = future.get();
            logger.info("Document saved with ID: {}", docRef.getId());
            return docRef.getId();
        } catch (Exception e) {
            logger.error("Error saving document to {}: {}", collection, e.getMessage());
            throw e;
        }
    }
    
    public <T> T getDocument(String collection, String documentId, Class<T> clazz) 
            throws ExecutionException, InterruptedException {
        try {
            DocumentReference docRef = firestore.collection(collection).document(documentId);
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();
            
            if (document.exists()) {
                return document.toObject(clazz);
            } else {
                logger.warn("Document not found: {}/{}", collection, documentId);
                return null;
            }
        } catch (Exception e) {
            logger.error("Error getting document from {}: {}", collection, e.getMessage());
            throw e;
        }
    }
    
    public <T> List<T> getAllDocuments(String collection, Class<T> clazz) 
            throws ExecutionException, InterruptedException {
        try {
            ApiFuture<QuerySnapshot> future = firestore.collection(collection).get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            List<T> result = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                result.add(document.toObject(clazz));
            }
            
            return result;
        } catch (Exception e) {
            logger.error("Error getting all documents from {}: {}", collection, e.getMessage());
            throw e;
        }
    }
    
    public void updateDocument(String collection, String documentId, Map<String, Object> updates) 
            throws ExecutionException, InterruptedException {
        try {
            DocumentReference docRef = firestore.collection(collection).document(documentId);
            ApiFuture<WriteResult> future = docRef.update(updates);
            WriteResult result = future.get();
            logger.info("Document updated at: {}", result.getUpdateTime());
        } catch (Exception e) {
            logger.error("Error updating document in {}: {}", collection, e.getMessage());
            throw e;
        }
    }
    
    public void deleteDocument(String collection, String documentId) 
            throws ExecutionException, InterruptedException {
        try {
            DocumentReference docRef = firestore.collection(collection).document(documentId);
            ApiFuture<WriteResult> future = docRef.delete();
            WriteResult result = future.get();
            logger.info("Document deleted at: {}", result.getUpdateTime());
        } catch (Exception e) {
            logger.error("Error deleting document from {}: {}", collection, e.getMessage());
            throw e;
        }
    }
    
    // Specific methods for ChatMessage
    
    public String saveChatMessage(ChatMessage message) throws ExecutionException, InterruptedException {
        return saveDocument("chat_messages", message);
    }
    
    public List<ChatMessage> getChatHistory(String senderId, String receiverId) 
            throws ExecutionException, InterruptedException {
        try {
            Query query = firestore.collection("chat_messages")
                    .whereIn("senderId", List.of(senderId, receiverId))
                    .whereIn("receiverId", List.of(senderId, receiverId))
                    .orderBy("timestamp", Query.Direction.ASCENDING);
            
            ApiFuture<QuerySnapshot> future = query.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            List<ChatMessage> messages = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                ChatMessage message = document.toObject(ChatMessage.class);
                message.setId(document.getId());
                messages.add(message);
            }
            
            return messages;
        } catch (Exception e) {
            logger.error("Error getting chat history: {}", e.getMessage());
            throw e;
        }
    }
    
    public List<ChatMessage> getUnreadMessages(String receiverId) 
            throws ExecutionException, InterruptedException {
        try {
            Query query = firestore.collection("chat_messages")
                    .whereEqualTo("receiverId", receiverId)
                    .whereEqualTo("isRead", false)
                    .orderBy("timestamp", Query.Direction.DESCENDING);
            
            ApiFuture<QuerySnapshot> future = query.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();
            
            List<ChatMessage> messages = new ArrayList<>();
            for (QueryDocumentSnapshot document : documents) {
                ChatMessage message = document.toObject(ChatMessage.class);
                message.setId(document.getId());
                messages.add(message);
            }
            
            return messages;
        } catch (Exception e) {
            logger.error("Error getting unread messages: {}", e.getMessage());
            throw e;
        }
    }
    
    public void markMessageAsRead(String messageId) throws ExecutionException, InterruptedException {
        updateDocument("chat_messages", messageId, Map.of("isRead", true));
    }
    
    // Real-time listener setup (for WebSocket or Server-Sent Events)
    public void setupRealtimeListener(String collection, String field, String value, 
                                    EventListener<QuerySnapshot> listener) {
        firestore.collection(collection)
                .whereEqualTo(field, value)
                .addSnapshotListener(listener);
    }
} 