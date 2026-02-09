package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.AuthDtos;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import in.bkitsolutions.lmsbackend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public User initRootAdmin(AuthDtos.InitRootAdminRequest req) {
        if (userRepository.existsByType(UserType.ROOTADMIN)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rootadmin already exists");
        }
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }
        User rootAdmin = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .type(UserType.ROOTADMIN)
                .build();
        return userRepository.save(rootAdmin);
    }

    public String login(AuthDtos.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return jwtUtil.generateToken(user);
    }

    public User createAdmin(String requesterEmail, AuthDtos.CreateAdminRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only superadmin can create admins");
        }
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }
        User admin = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .type(UserType.ADMIN)
                // Track who created this admin (should be SUPERADMIN)
                .createdBy(requester)
                .build();
        return userRepository.save(admin);
    }

    public User createUser(String requesterEmail, AuthDtos.CreateUserRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create users");
        }
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .type(UserType.USER)
                // Track who created this user (ADMIN or SUPERADMIN)
                .createdBy(requester)
                .build();
        return userRepository.save(user);
    }

    public User createSuperAdmin(String requesterEmail, AuthDtos.CreateSuperAdminRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only rootadmin can create superadmins");
        }
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }
        User superAdmin = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .type(UserType.SUPERADMIN)
                .createdBy(requester)
                .build();
        return userRepository.save(superAdmin);
    }

    public User getByEmail(String email) {
        return requireUser(email);
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
