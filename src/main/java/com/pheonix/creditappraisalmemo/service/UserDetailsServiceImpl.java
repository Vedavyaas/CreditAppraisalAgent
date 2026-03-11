package com.pheonix.creditappraisalmemo.service;


import com.pheonix.creditappraisalmemo.repository.UserDetailsEntity;
import com.pheonix.creditappraisalmemo.repository.UserDetailsRepository;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(UserDetailsServiceImpl.class);
    private final UserDetailsRepository userDetailsRepository;

    public UserDetailsServiceImpl(UserDetailsRepository userDetailsRepository) {
        this.userDetailsRepository = userDetailsRepository;
    }

    @Override
    @NullMarked
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("LOGIN DEBUG: Looking up user by email: {}", username);
        UserDetailsEntity user = userDetailsRepository.findByEmail(username)
                .orElseThrow(() -> {
                    log.error("LOGIN DEBUG: User NOT FOUND for email: {}", username);
                    return new UsernameNotFoundException("User not found with email: " + username);
                });

        log.info("LOGIN DEBUG: User found. Proceeding with credentials check for: {}", username);
        return User.withUsername(user.getEmail())
                .password(user.getPassword())
                .roles(user.getRole().toString())
                .build();
    }
}
