package com.pheonix.creditappraisalmemo.configuration;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.pheonix.creditappraisalmemo.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class JWTConfig {

    // Inject a stable secret from environment variable. Falls back to a default
    // for local development only — ALWAYS set JWT_SECRET on Render!
    @Value("${jwt.secret:ZGVmYXVsdC1sb2NhbC1kZXZlbG9wbWVudC1zZWNyZXQta2V5LW11c3QtYmUtb3ZlcnJpZGRlbi1pbi1wcm9k}")
    private String jwtSecret;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults()); // Enable CORS
        http.authorizeHttpRequests(authorizeRequests -> authorizeRequests
                .requestMatchers("/", "/index.html", "/assets/**", "/*.js", "/*.css", "/*.ico",
                        "/api/health", "/h2-console/**", "/api/auth/**").permitAll()
                .anyRequest().authenticated());

        org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter jwtAuthenticationConverter = new org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter();
        org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("role");
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

        http.oauth2ResourceServer(oath2 -> oath2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)));
        http.csrf(AbstractHttpConfigurer::disable);
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable));
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Builds a stable HMAC-SHA256 SecretKey from the configured jwt.secret.
     * Uses a Random UUID if the secret is not provided (EPHEMERAL).
     */
    @Bean
    SecretKey jwtSecretKey() {
        String finalSecret = jwtSecret;
        
        // If the secret is the default-placeholder or null, generate a random UUID
        if (jwtSecret == null || jwtSecret.startsWith("ZGVmYXVsdC")) {
            finalSecret = java.util.UUID.randomUUID().toString();
            // Note: Standard output goes to Render logs for you to see
            System.out.println("!!! SECURITY ALERT !!!");
            System.out.println("Using ephemeral UUID-based JWT secret: " + finalSecret);
            System.out.println("Tokens will be invalidated on application restart.");
            return new javax.crypto.spec.SecretKeySpec(finalSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
        }
        
        try {
            byte[] keyBytes = Base64.getDecoder().decode(finalSecret);
            return new SecretKeySpec(keyBytes, "HmacSHA256");
        } catch (Exception e) {
            // Fallback for non-base64 strings (like raw UUIDs in env vars)
            return new SecretKeySpec(finalSecret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
        }
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        com.nimbusds.jose.jwk.OctetSequenceKey octetKey = new com.nimbusds.jose.jwk.OctetSequenceKey.Builder(jwtSecretKey)
                .algorithm(com.nimbusds.jose.JWSAlgorithm.HS256)
                .build();
        var jwkSource = new ImmutableJWKSet<>(new JWKSet(octetKey));
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey).build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(UserDetailsServiceImpl userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }
}
