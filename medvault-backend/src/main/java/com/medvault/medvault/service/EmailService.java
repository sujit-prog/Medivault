package com.medvault.medvault.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class EmailService {

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${BREVO_API_KEY:}")
    private String brevoApiKey;

    /**
     * Sends an OTP email for password reset using Brevo's HTTP API.
     * This bypasses Render's strict SMTP firewall by sending over HTTPS (Port 443).
     *
     * @param toEmail recipient address
     * @param otp     the 6-digit OTP code
     */
    public void sendPasswordResetOtp(String toEmail, String otp) {
        if (brevoApiKey == null || brevoApiKey.isEmpty()) {
            System.err.println("BREVO_API_KEY is not set. Cannot send email.");
            return;
        }

        try {
            // Build the JSON payload manually to avoid extra library dependencies
            String jsonPayload = String.format(
                "{" +
                "  \"sender\": { \"name\": \"MediVault Security\", \"email\": \"%s\" }," +
                "  \"to\": [ { \"email\": \"%s\" } ]," +
                "  \"subject\": \"MediVault - Password Reset OTP\"," +
                "  \"htmlContent\": \"<html><body>" +
                "<h2>Password Reset Request</h2>" +
                "<p>Hello,</p>" +
                "<p>Your One-Time Password (OTP) is: <strong>%s</strong></p>" +
                "<p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>" +
                "<p>If you did not request a password reset, please ignore this email.</p>" +
                "<p>– The MediVault Team</p>" +
                "</body></html>\"" +
                "}", 
                fromEmail, toEmail, otp
            );

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                .header("accept", "application/json")
                .header("api-key", brevoApiKey)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 400) {
                System.err.println("Failed to send email. Brevo responded with: " + response.body());
            } else {
                System.out.println("OTP Email sent successfully to " + toEmail);
            }

        } catch (Exception e) {
            System.err.println("Error while sending email via Brevo API: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
