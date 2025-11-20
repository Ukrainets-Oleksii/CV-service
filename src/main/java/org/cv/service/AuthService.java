package org.cv.service;

import org.cv.model.dto.AuthResponse;
import org.cv.model.dto.LoginRequest;
import org.cv.model.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}