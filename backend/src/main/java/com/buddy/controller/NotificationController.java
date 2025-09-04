package com.buddy.controller;

import com.buddy.model.User;
import com.buddy.model.UserDevice;
import com.buddy.repository.UserRepository;
import com.buddy.repository.UserDeviceRepository;
import com.buddy.service.FirebaseMessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired(required = false)
    private FirebaseMessagingService firebaseMessagingService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserDeviceRepository userDeviceRepository;
    
    @PostMapping("/register-token")
    public ResponseEntity<?> registerFCMToken(@RequestBody Map<String, String> request, 
                                             Authentication authentication) {
        try {
            String fcmToken = request.get("token");
            String deviceType = request.get("deviceType");
            String deviceName = request.get("deviceName");
            String appVersion = request.get("appVersion");
            
            if (fcmToken == null || fcmToken.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "FCM token is required"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Check if device already exists
            UserDevice existingDevice = userDeviceRepository.findByFcmToken(fcmToken)
                    .orElse(null);
            
            if (existingDevice != null) {
                // Update existing device
                existingDevice.setUser(user);
                existingDevice.setDeviceType(deviceType);
                existingDevice.setDeviceName(deviceName);
                existingDevice.setAppVersion(appVersion);
                existingDevice.setActive(true);
                userDeviceRepository.save(existingDevice);
            } else {
                // Create new device
                UserDevice userDevice = new UserDevice(user, fcmToken, deviceType);
                userDevice.setDeviceName(deviceName);
                userDevice.setAppVersion(appVersion);
                userDeviceRepository.save(userDevice);
            }
            
            return ResponseEntity.ok(Map.of("message", "FCM token registered successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to register FCM token: " + e.getMessage()));
        }
    }
    
    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> request,
                                            Authentication authentication) {
        try {
            if (firebaseMessagingService == null) {
                return ResponseEntity.ok(Map.of(
                    "message", "Push notifications require Firebase setup",
                    "status", "firebase_not_configured"
                ));
            }
            
            String title = (String) request.get("title");
            String body = (String) request.get("body");
            String targetUsername = (String) request.get("targetUsername");
            
            if (title == null || body == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Title and body are required"));
            }
            
            if (targetUsername != null) {
                // Send to specific user
                User targetUser = userRepository.findByUsername(targetUsername)
                        .orElseThrow(() -> new RuntimeException("Target user not found"));
                
                var activeDevices = userDeviceRepository.findByUserAndIsActive(targetUser, true);
                
                for (UserDevice device : activeDevices) {
                    firebaseMessagingService.sendNotificationToToken(
                            device.getFcmToken(), title, body);
                }
                
                return ResponseEntity.ok(Map.of(
                        "message", "Notification sent to " + activeDevices.size() + " devices"));
            } else {
                // Send to all users (broadcast)
                firebaseMessagingService.sendNotificationToTopic("all_users", title, body);
                return ResponseEntity.ok(Map.of("message", "Broadcast notification sent"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to send notification: " + e.getMessage()));
        }
    }
    
    @PostMapping("/subscribe-topic")
    public ResponseEntity<?> subscribeToTopic(@RequestBody Map<String, String> request,
                                            Authentication authentication) {
        try {
            if (firebaseMessagingService == null) {
                return ResponseEntity.ok(Map.of(
                    "message", "Topic subscription requires Firebase setup",
                    "status", "firebase_not_configured"
                ));
            }
            
            String topic = request.get("topic");
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            var activeDevices = userDeviceRepository.findByUserAndIsActive(user, true);
            var tokens = activeDevices.stream()
                    .map(UserDevice::getFcmToken)
                    .toList();
            
            if (!tokens.isEmpty()) {
                firebaseMessagingService.subscribeToTopic(tokens, topic);
                return ResponseEntity.ok(Map.of(
                        "message", "Subscribed " + tokens.size() + " devices to topic: " + topic));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No active devices found for user"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to subscribe to topic: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/unregister-token")
    public ResponseEntity<?> unregisterFCMToken(@RequestBody Map<String, String> request,
                                              Authentication authentication) {
        try {
            String fcmToken = request.get("token");
            
            if (fcmToken == null || fcmToken.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "FCM token is required"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            userDeviceRepository.deleteByUserAndFcmToken(user, fcmToken);
            
            return ResponseEntity.ok(Map.of("message", "FCM token unregistered successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to unregister FCM token: " + e.getMessage()));
        }
    }
} 