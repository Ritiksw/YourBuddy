package com.buddy.config;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirestoreConfig {
    
    @Bean
    @ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = false)
    public Firestore firestore() {
        // Check if Firebase is initialized before creating Firestore client
        if (FirebaseApp.getApps().isEmpty()) {
            throw new IllegalStateException("Firebase must be initialized before creating Firestore client");
        }
        return FirestoreClient.getFirestore();
    }
} 