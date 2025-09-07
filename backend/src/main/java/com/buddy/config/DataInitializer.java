package com.buddy.config;

import com.buddy.model.User;
import com.buddy.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        createDefaultUser();
    }
    
    private void createDefaultUser() {
        try {
            // Check if default user already exists
            if (userRepository.findByUsername("testuser").isPresent()) {
                logger.info("Default user 'testuser' already exists");
                return;
            }
            
            // Create default test user
            User defaultUser = new User();
            defaultUser.setUsername("testuser");
            defaultUser.setEmail("test@buddy.com");
            defaultUser.setPassword(passwordEncoder.encode("password123"));
            defaultUser.setFirstName("Test");
            defaultUser.setLastName("User");
            defaultUser.setRole(User.Role.USER);
            defaultUser.setEnabled(true);
            
            userRepository.save(defaultUser);
            
            logger.info("✅ Default user created successfully!");
            logger.info("📱 Login credentials:");
            logger.info("   Username: testuser");
            logger.info("   Password: password123");
            logger.info("   Email: test@buddy.com");
            
        } catch (Exception e) {
            logger.error("❌ Failed to create default user: {}", e.getMessage());
        }
    }
} 