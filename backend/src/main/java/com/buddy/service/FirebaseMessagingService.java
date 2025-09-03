package com.buddy.service;

import com.google.firebase.messaging.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FirebaseMessagingService {
    
    private static final Logger logger = LoggerFactory.getLogger(FirebaseMessagingService.class);
    
    public void sendNotificationToToken(String token, String title, String body) {
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();
            
            String response = FirebaseMessaging.getInstance().send(message);
            logger.info("Successfully sent message: {}", response);
            
        } catch (FirebaseMessagingException e) {
            logger.error("Error sending Firebase message: {}", e.getMessage());
            throw new RuntimeException("Failed to send notification", e);
        }
    }
    
    public void sendNotificationToTopic(String topic, String title, String body) {
        try {
            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();
            
            String response = FirebaseMessaging.getInstance().send(message);
            logger.info("Successfully sent message to topic {}: {}", topic, response);
            
        } catch (FirebaseMessagingException e) {
            logger.error("Error sending Firebase message to topic: {}", e.getMessage());
            throw new RuntimeException("Failed to send notification to topic", e);
        }
    }
    
    public void sendDataNotification(String token, Map<String, String> data) {
        try {
            Message message = Message.builder()
                    .setToken(token)
                    .putAllData(data)
                    .build();
            
            String response = FirebaseMessaging.getInstance().send(message);
            logger.info("Successfully sent data message: {}", response);
            
        } catch (FirebaseMessagingException e) {
            logger.error("Error sending Firebase data message: {}", e.getMessage());
            throw new RuntimeException("Failed to send data notification", e);
        }
    }
    
    public void subscribeToTopic(List<String> tokens, String topic) {
        try {
            TopicManagementResponse response = FirebaseMessaging.getInstance()
                    .subscribeToTopic(tokens, topic);
            
            logger.info("Successfully subscribed {} tokens to topic {}", 
                    response.getSuccessCount(), topic);
            
            if (response.getFailureCount() > 0) {
                logger.warn("Failed to subscribe {} tokens to topic {}", 
                        response.getFailureCount(), topic);
            }
            
        } catch (FirebaseMessagingException e) {
            logger.error("Error subscribing to topic: {}", e.getMessage());
            throw new RuntimeException("Failed to subscribe to topic", e);
        }
    }
    
    public void unsubscribeFromTopic(List<String> tokens, String topic) {
        try {
            TopicManagementResponse response = FirebaseMessaging.getInstance()
                    .unsubscribeFromTopic(tokens, topic);
            
            logger.info("Successfully unsubscribed {} tokens from topic {}", 
                    response.getSuccessCount(), topic);
            
        } catch (FirebaseMessagingException e) {
            logger.error("Error unsubscribing from topic: {}", e.getMessage());
            throw new RuntimeException("Failed to unsubscribe from topic", e);
        }
    }
} 