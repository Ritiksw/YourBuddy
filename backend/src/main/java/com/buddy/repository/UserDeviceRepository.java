package com.buddy.repository;

import com.buddy.model.User;
import com.buddy.model.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    
    Optional<UserDevice> findByFcmToken(String fcmToken);
    
    List<UserDevice> findByUserAndIsActive(User user, boolean isActive);
    
    List<UserDevice> findByUser(User user);
    
    void deleteByFcmToken(String fcmToken);
    
    void deleteByUserAndFcmToken(User user, String fcmToken);
} 