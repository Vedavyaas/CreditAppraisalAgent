package com.pheonix.creditappraisalmemo.dto;

import com.pheonix.creditappraisalmemo.assets.Role;

public record RegisterRequest(String name, String email, String password, Role role) {
}
