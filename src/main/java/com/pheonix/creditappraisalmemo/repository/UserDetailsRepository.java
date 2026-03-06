package com.pheonix.creditappraisalmemo.repository;

import org.jspecify.annotations.NonNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserDetailsRepository extends JpaRepository<UserDetailsEntity, Long> {
    Optional<UserDetailsEntity> findByEmail(String email);
}
