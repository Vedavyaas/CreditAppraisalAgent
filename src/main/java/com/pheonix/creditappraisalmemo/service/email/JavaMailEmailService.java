package com.pheonix.creditappraisalmemo.service.email;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * SMTP-backed implementation of {@link EmailService} using Spring's {@link JavaMailSender}.
 *
 * Credentials are read from application.properties:
 *   spring.mail.username  → your Gmail address (also used as the From address)
 *   spring.mail.password  → your Gmail App Password (Settings → Security → App passwords)
 *
 * Both methods run @Async so email delivery never blocks the HTTP response thread.
 *
 * To swap providers (SendGrid, SES, Mailgun …) just create a new class that
 * implements EmailService, annotate it @Primary, and remove @Primary from this one.
 */
@Service
@org.springframework.context.annotation.Primary
public class JavaMailEmailService implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public JavaMailEmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @Override
    public void sendPlainText(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email to " + to, e);
        }
    }

    @Async
    @Override
    public void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);   // true = HTML mode
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send HTML email to " + to, e);
        }
    }
}
