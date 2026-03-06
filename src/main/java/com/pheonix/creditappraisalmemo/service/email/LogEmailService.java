package com.pheonix.creditappraisalmemo.service.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LogEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(LogEmailService.class);

    @Override
    public void sendPlainText(String to, String subject, String body) {
        log.info("""

                ╔══════════════════════════════════════════╗
                ║           [EMAIL — PLAIN TEXT]           ║
                ╠══════════════════════════════════════════╣
                ║  To      : {}
                ║  Subject : {}
                ╠══════════════════════════════════════════╣
                {}
                ╚══════════════════════════════════════════╝
                """, to, subject, body);
    }

    @Override
    public void sendHtml(String to, String subject, String html) {
        log.info("""

                ╔══════════════════════════════════════════╗
                ║           [EMAIL — HTML]                 ║
                ╠══════════════════════════════════════════╣
                ║  To      : {}
                ║  Subject : {}
                ╠══════════════════════════════════════════╣
                {}
                ╚══════════════════════════════════════════╝
                """, to, subject, html);
    }
}
