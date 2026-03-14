package com.medvault.medvault.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends a plain-text OTP email for password reset.
     *
     * @param toEmail recipient address
     * @param otp     the 6-digit OTP code
     */
    public void sendPasswordResetOtp(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("MediVault – Password Reset OTP");
        message.setText(
                "Hello,\n\n" +
                        "You requested a password reset for your MediVault account.\n\n" +
                        "Your One-Time Password (OTP) is:\n\n" +
                        "  " + otp + "\n\n" +
                        "This OTP is valid for 10 minutes. Do not share it with anyone.\n\n" +
                        "If you did not request a password reset, please ignore this email.\n\n" +
                        "– The MediVault Team");
        mailSender.send(message);
    }
}
