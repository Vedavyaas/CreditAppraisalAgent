package com.pheonix.creditappraisalmemo.service;

import com.pheonix.creditappraisalmemo.service.email.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private record OtpEntry(String code, Instant expiresAt) {}

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.otp.expiry-minutes:5}")
    private long expiryMinutes;

    public OtpService(EmailService emailService) {
        this.emailService = emailService;
    }

    public void generateAndSend(String email) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        Instant expiry = Instant.now().plusSeconds(expiryMinutes * 60);
        store.put(email, new OtpEntry(code, expiry));

        String subject = "Your CreditAppraisalMemo OTP";
        String body = buildEmailBody(code, expiryMinutes);
        emailService.sendPlainText(email, subject, body);
    }

    public boolean validate(String email, String otp) {
        OtpEntry entry = store.get(email);
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiresAt())) {
            store.remove(email);
            return false;
        }
        if (!entry.code().equals(otp)) return false;

        store.remove(email);
        return true;
    }

    private String buildEmailBody(String code, long ttlMinutes) {
        return """
                Hi,

                Your one-time password (OTP) is:

                    %s

                It is valid for %d minute(s). Do not share it with anyone.

                If you did not request this, please ignore this email.

                — CreditAppraisalMemo
                """.formatted(code, ttlMinutes);
    }
}
