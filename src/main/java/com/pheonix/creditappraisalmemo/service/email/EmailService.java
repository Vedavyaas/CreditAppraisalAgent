package com.pheonix.creditappraisalmemo.service.email;

public interface EmailService {
    void sendPlainText(String to, String subject, String body);
    void sendHtml(String to, String subject, String html);
}
