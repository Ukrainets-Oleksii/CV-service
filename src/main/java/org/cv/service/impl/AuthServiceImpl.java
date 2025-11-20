package org.cv.service.impl;

import lombok.RequiredArgsConstructor;
import org.cv.model.User;
import org.cv.model.dto.AuthResponse;
import org.cv.model.dto.LoginRequest;
import org.cv.model.dto.RegisterRequest;
import org.cv.model.exception.CVApiException;
import org.cv.repository.UserRepository;
import org.cv.service.AuthService;
import org.cv.service.mapper.UserMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new CVApiException("Username already taken", HttpStatus.CONFLICT);
        }

        User user = userMapper.fromRegister(request);
        user.setPassword(request.getPassword());
        
        String token = UUID.randomUUID().toString();
        user.setToken(token);

        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        return response;
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new CVApiException("User not found", HttpStatus.NOT_FOUND));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new CVApiException("Invalid credentials", HttpStatus.FORBIDDEN);
        }

        String token = UUID.randomUUID().toString();
        user.setToken(token);
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        return response;
    }
}