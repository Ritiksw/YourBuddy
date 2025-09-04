package com.buddy.controller;

import com.buddy.model.ChatMessage;
import com.buddy.model.User;
import com.buddy.repository.UserRepository;
import com.buddy.service.FirestoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Collections;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {
    
    @Autowired(required = false)
    private FirestoreService firestoreService;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> request,
                                       Authentication authentication) {
        try {
            if (firestoreService == null) {
                return ResponseEntity.ok(Map.of(
                    "message", "Chat functionality requires Firebase setup",
                    "status", "firebase_not_configured"
                ));
            }
            
            String content = request.get("content");
            String receiverId = request.get("receiverId");
            String type = request.get("type") != null ? request.get("type") : "text";
            
            if (content == null || receiverId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Content and receiverId are required"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User sender = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Sender not found"));
            
            // Verify receiver exists
            User receiver = userRepository.findById(Long.parseLong(receiverId))
                    .orElseThrow(() -> new RuntimeException("Receiver not found"));
            
            ChatMessage message = new ChatMessage(
                    sender.getId().toString(),
                    sender.getFirstName() + " " + sender.getLastName(),
                    receiverId,
                    content,
                    type
            );
            
            String messageId = firestoreService.saveChatMessage(message);
            
            return ResponseEntity.ok(Map.of(
                    "messageId", messageId,
                    "message", "Message sent successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to send message: " + e.getMessage()));
        }
    }
    
    @GetMapping("/history/{receiverId}")
    public ResponseEntity<?> getChatHistory(@PathVariable String receiverId,
                                          Authentication authentication) {
        try {
            if (firestoreService == null) {
                return ResponseEntity.ok(Map.of(
                    "messages", Collections.emptyList(),
                    "status", "firebase_not_configured"
                ));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User sender = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<ChatMessage> messages = firestoreService.getChatHistory(
                    sender.getId().toString(), receiverId);
            
            return ResponseEntity.ok(messages);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get chat history: " + e.getMessage()));
        }
    }
    
    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadMessages(Authentication authentication) {
        try {
            if (firestoreService == null) {
                return ResponseEntity.ok(Map.of(
                    "unreadCount", 0,
                    "messages", Collections.emptyList(),
                    "status", "firebase_not_configured"
                ));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<ChatMessage> messages = firestoreService.getUnreadMessages(
                    user.getId().toString());
            
            return ResponseEntity.ok(Map.of(
                    "unreadCount", messages.size(),
                    "messages", messages
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to get unread messages: " + e.getMessage()));
        }
    }
    
    @PutMapping("/read/{messageId}")
    public ResponseEntity<?> markMessageAsRead(@PathVariable String messageId) {
        try {
            if (firestoreService == null) {
                return ResponseEntity.ok(Map.of(
                    "message", "Message read status requires Firebase setup",
                    "status", "firebase_not_configured"
                ));
            }
            
            firestoreService.markMessageAsRead(messageId);
            
            return ResponseEntity.ok(Map.of("message", "Message marked as read"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to mark message as read: " + e.getMessage()));
        }
    }
} 