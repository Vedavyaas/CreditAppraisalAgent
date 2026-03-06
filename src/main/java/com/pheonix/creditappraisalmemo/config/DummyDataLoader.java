package com.pheonix.creditappraisalmemo.config;

import com.pheonix.creditappraisalmemo.assets.Role;
import com.pheonix.creditappraisalmemo.domain.CreditApplication;
import com.pheonix.creditappraisalmemo.domain.CreditApplicationRepository;
import com.pheonix.creditappraisalmemo.repository.UserDetailsEntity;
import com.pheonix.creditappraisalmemo.repository.UserDetailsRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DummyDataLoader {

    @Bean
    public CommandLineRunner loadData(UserDetailsRepository userRepository,
                                      CreditApplicationRepository applicationRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if data already exists
            if (userRepository.count() == 0) {
                
                // 1. Create Admin User
                UserDetailsEntity admin = new UserDetailsEntity();
                admin.setName("System Admin");
                admin.setEmail("admin@test.com");
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);

                // 2. Create Credit Officer
                UserDetailsEntity officer = new UserDetailsEntity();
                officer.setName("Credit Officer Jane");
                officer.setEmail("user@test.com");
                officer.setPassword(passwordEncoder.encode("password"));
                officer.setRole(Role.CREDIT_OFFICER);
                userRepository.save(officer);
                
                System.out.println("✅ Sample Users Created:");
                System.out.println("  Admin: admin@test.com / password");
                System.out.println("  User:  user@test.com / password");
            }

            if (applicationRepository.count() == 0) {
                // Create a sample Credit Application so the UI has an ID of 1 to process
                CreditApplication app1 = new CreditApplication();
                app1.setCompanyName("Tech Solutions P. Ltd.");
                app1.setStatus(CreditApplication.ApplicationStatus.IN_REVIEW);
                app1.setCompanyAge(5.0);
                app1.setRequiredLoanAmount(15000000.0);
                app1.setCreatedBy("admin@test.com"); // Mandatory field
                applicationRepository.save(app1);

                System.out.println("✅ Sample Credit Application Created (ID: " + app1.getId() + ")");
            }
        };
    }
}
