package com.medvault.medvault.controller;

import com.medvault.medvault.dto.NotificationResponse;
import com.medvault.medvault.entity.User;
import com.medvault.medvault.service.NotificationService;
import com.medvault.medvault.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications(Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            List<NotificationResponse> notifications = notificationService.getUnreadNotifications(user);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllNotifications(Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            List<NotificationResponse> notifications = notificationService.getAllNotifications(user);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Principal principal) {
        try {
            User user = userService.findByEmail(principal.getName())
                    .orElseThrow(() -> new Exception("User not found"));

            notificationService.markAsRead(id, user);
            return ResponseEntity.ok("Notification marked as read");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
