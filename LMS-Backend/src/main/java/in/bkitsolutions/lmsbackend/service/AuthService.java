package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.AuthDtos;
import in.bkitsolutions.lmsbackend.model.College;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.CollegeRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import in.bkitsolutions.lmsbackend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, CollegeRepository collegeRepository,
                       PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
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
        System.out.println("Login attempt for: " + req.getEmail());
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> {
                    System.out.println("User not found: " + req.getEmail());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
                });
        
        System.out.println("User found: " + user.getId() + ", Hash: " + user.getPasswordHash());
        System.out.println("Input password: " + req.getPassword());
        boolean matches = passwordEncoder.matches(req.getPassword(), user.getPasswordHash());
        System.out.println("Password match result: " + matches);

        if (!matches) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        // College-specific login validation
        String collegeCode = req.getCollegeCode();
        UserType userType = user.getType();

        // If college code is provided, validate college-specific login
        if (collegeCode != null && !collegeCode.isEmpty()) {
            // Allow ROOTADMIN and SUPERADMIN to login via any college portal
            if (userType != UserType.ROOTADMIN && userType != UserType.SUPERADMIN) {
                // For ADMIN, FACULTY, and USER - must match their assigned college
                if (user.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "You are not assigned to any college");
                }
                if (!user.getCollege().getCode().equalsIgnoreCase(collegeCode)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                        "You are not authorized to access this college portal. Please use your college's login page.");
                }
            }
        } else {
            // If college code is NOT provided (main login page)
            // Only allow ROOTADMIN and SUPERADMIN
            if (userType != UserType.ROOTADMIN && userType != UserType.SUPERADMIN) {
                String message = "Please use your college-specific login page: /login/[college-code]";
                if (user.getCollege() != null) {
                    message = "Please use your college login page: /login/" + user.getCollege().getCode();
                }
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, message);
            }
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
        College college = null;
        if (req.getCollegeId() != null) {
            college = collegeRepository.findById(req.getCollegeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "College not found"));
        }
        User admin = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .type(UserType.ADMIN)
                .college(college)
                .createdBy(requester)
                .build();
        return userRepository.save(admin);
    }

    public User createFaculty(String requesterEmail, AuthDtos.CreateFacultyRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin or superadmin can create faculty");
        }
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }
        College college = null;
        if (req.getCollegeId() != null) {
            college = collegeRepository.findById(req.getCollegeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "College not found"));
        } else if (requester.getCollege() != null) {
            college = requester.getCollege();
        }
        User faculty = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .type(UserType.FACULTY)
                .college(college)
                .createdBy(requester)
                .build();
        return userRepository.save(faculty);
    }

    public User createUser(String requesterEmail, AuthDtos.CreateUserRequest req) {
        User requester = requireUser(requesterEmail);
        if (requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin can create users");
        }
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already in use");
        }
        College college = requester.getCollege();
        if (req.getCollegeId() != null) {
            college = collegeRepository.findById(req.getCollegeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "College not found"));
        }
        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .type(UserType.USER)
                .college(college)
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
