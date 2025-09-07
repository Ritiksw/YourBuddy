package com.buddy.controller;

import com.buddy.dto.AuthRequest;
import com.buddy.dto.AuthResponse;
import com.buddy.dto.RegisterRequest;
import com.buddy.model.User;
import com.buddy.repository.UserRepository;
import com.buddy.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        try {
            // Input validation
            if (loginRequest.getUsername() == null || loginRequest.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username is required"));
            }
            
            if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Password is required"));
            }
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername().trim(),
                            loginRequest.getPassword()
                    )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String jwt = jwtUtils.generateToken(userDetails);
            
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(new AuthResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name(),
                    user.getFirstName(),
                    user.getLastName()
            ));
            
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid username or password"));
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Authentication failed"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Login service temporarily unavailable"));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        try {
            // Enhanced input validation
            if (signUpRequest.getUsername() == null || signUpRequest.getUsername().trim().length() < 3) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username must be at least 3 characters long"));
            }
            
            if (signUpRequest.getEmail() == null || !signUpRequest.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Please provide a valid email address"));
            }
            
            if (signUpRequest.getPassword() == null || signUpRequest.getPassword().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Password must be at least 6 characters long"));
            }
            
            if (signUpRequest.getFirstName() == null || signUpRequest.getFirstName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "First name is required"));
            }
            
            if (signUpRequest.getLastName() == null || signUpRequest.getLastName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Last name is required"));
            }
            
            // Check if username already exists
            if (userRepository.existsByUsername(signUpRequest.getUsername().trim())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Username is already taken!"));
            }
            
            // Check if email already exists
            if (userRepository.existsByEmail(signUpRequest.getEmail().toLowerCase())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is already in use!"));
            }
            
            // Create new user with sanitized data
            User user = new User(
                    signUpRequest.getUsername().trim(),
                    signUpRequest.getEmail().toLowerCase().trim(),
                    passwordEncoder.encode(signUpRequest.getPassword())
            );
            
            user.setFirstName(signUpRequest.getFirstName().trim());
            user.setLastName(signUpRequest.getLastName().trim());
            
            User savedUser = userRepository.save(user);
            
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully!",
                    "userId", savedUser.getId()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Registration service temporarily unavailable"));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Not authenticated"));
            }
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "role", user.getRole().name()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Unable to get user information"));
        }
    }
} 