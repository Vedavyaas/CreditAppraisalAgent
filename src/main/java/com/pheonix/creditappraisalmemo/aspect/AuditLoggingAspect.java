package com.pheonix.creditappraisalmemo.aspect;

import com.pheonix.creditappraisalmemo.repository.AuditLogEntity;
import com.pheonix.creditappraisalmemo.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Aspect
@Component
public class AuditLoggingAspect {

    @Autowired
    private AuditLogRepository auditLogRepository;

    // Intercept method execution inside controllers, services, and ingestors
    @Pointcut("execution(* com.pheonix.creditappraisalmemo.controller.*.*(..)) || " +
              "execution(* com.pheonix.creditappraisalmemo.service.*.*(..)) || " +
              "execution(* com.pheonix.creditappraisalmemo.ingestor.*.*(..))")
    public void auditedMethods() {}

    @Around("auditedMethods()")
    public Object logAuditActivity(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        String status = "SUCCESS";
        Object result = null;

        try {
            // Proceed with the actual mapped endpoint logic
            result = joinPoint.proceed();
        } catch (Throwable t) {
            status = "ERROR: " + t.getClass().getSimpleName();
            throw t;
        } finally {
            long executionTime = System.currentTimeMillis() - startTime;
            saveAuditLog(joinPoint, executionTime, status);
        }

        return result;
    }

    private void saveAuditLog(ProceedingJoinPoint joinPoint, long executionTime, String status) {
        try {
            String username = "ANONYMOUS";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                username = auth.getName(); 
            }

            String endpoint = "UNKNOWN";
            HttpServletRequest request = getRequest();
            if (request != null) {
                endpoint = request.getMethod() + " " + request.getRequestURI();
            }

            String action = joinPoint.getSignature().getDeclaringType().getSimpleName() + "." + joinPoint.getSignature().getName();
            
            // Try to get custom message from @AuditAction annotation
            String message = "";
            try {
                var methodSignature = (org.aspectj.lang.reflect.MethodSignature) joinPoint.getSignature();
                var method = methodSignature.getMethod();
                AuditAction auditAction = method.getAnnotation(AuditAction.class);
                if (auditAction != null) {
                    message = auditAction.value();
                } else {
                    // Default message if no annotation
                    message = "Executed " + action;
                }
            } catch (Exception e) {
                message = "Executed " + action;
            }

            // Do not log the audit fetch itself to prevent recursive log flooding
            if (!action.contains("AuditController.getAuditLogs")) {
                AuditLogEntity log = new AuditLogEntity(username, action, endpoint, message, executionTime, status, LocalDateTime.now());
                auditLogRepository.save(log);
            }
            
        } catch (Exception e) {
            System.err.println("Failed to save audit log: " + e.getMessage());
        }
    }

    private HttpServletRequest getRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null; // Might happen in async or batch context without HTTP request
        }
    }
}
