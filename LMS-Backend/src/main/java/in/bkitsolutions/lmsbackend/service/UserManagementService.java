package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.UserDtos;
import in.bkitsolutions.lmsbackend.model.College;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.CollegeRepository;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CollegeRepository collegeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    public UserDtos.UserResponse createSuperAdmin(String requesterEmail, UserDtos.CreateSuperAdminRequest request) {
        User requester = authService.getByEmail(requesterEmail);
        
        // Only ROOT ADMIN can create super admins
        if (requester.getType() != UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Root Admin can create Super Admins");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        User superAdmin = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .type(UserType.SUPERADMIN)
                .college(null) // Super admins are not tied to colleges
                .isActive(true)
                .phoneNumber(request.getPhoneNumber())
                .bio(request.getBio())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .createdAt(LocalDateTime.now())
                .createdBy(requester)
                .build();

        User saved = userRepository.save(superAdmin);
        return mapToUserResponse(saved);
    }

    public UserDtos.UserResponse createAdmin(String requesterEmail, UserDtos.CreateUserRequest request) {
        User requester = authService.getByEmail(requesterEmail);
        
        // Only SUPER ADMIN can create college admins
        if (requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Super Admin can create College Admins");
        }

        if (request.getCollegeId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "College ID is required for admin creation");
        }

        College college = collegeRepository.findById(request.getCollegeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found"));

        // Check if college already has an admin
        List<User> existingAdmins = userRepository.findByCollegeIdAndType(college.getId(), UserType.ADMIN);
        if (!existingAdmins.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "College already has an admin. Each college can have only one admin.");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        User admin = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .type(UserType.ADMIN)
                .college(college)
                .isActive(true)
                .phoneNumber(request.getPhoneNumber())
                .bio(request.getBio())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .createdAt(LocalDateTime.now())
                .createdBy(requester)
                .build();

        User saved = userRepository.save(admin);
        return mapToUserResponse(saved);
    }

    public UserDtos.UserResponse createFaculty(String requesterEmail, UserDtos.CreateUserRequest request) {
        User requester = authService.getByEmail(requesterEmail);
        
        // Only ADMIN can create faculty
        if (requester.getType() != UserType.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only College Admin can create Faculty");
        }

        // Admin must have a college assignment and must be active
        if (requester.getCollege() == null || !requester.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Admin without college assignment or disabled cannot create faculty");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        // Faculty is automatically assigned to the same college as the admin
        User faculty = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .type(UserType.FACULTY)
                .college(requester.getCollege()) // Auto-assign to admin's college
                .isActive(true)
                .phoneNumber(request.getPhoneNumber())
                .bio(request.getBio())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .createdAt(LocalDateTime.now())
                .createdBy(requester)
                .build();

        User saved = userRepository.save(faculty);
        return mapToUserResponse(saved);
    }

    public UserDtos.UserResponse createStudent(String requesterEmail, UserDtos.CreateUserRequest request) {
        User requester = authService.getByEmail(requesterEmail);
        
        // Only ADMIN and FACULTY can create students
        if (requester.getType() != UserType.ADMIN && requester.getType() != UserType.FACULTY) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Admin or Faculty can create Students");
        }

        // Requester must have a college assignment and must be active
        if (requester.getCollege() == null || !requester.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "User without college assignment or disabled cannot create students");
        }

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }

        // Student is automatically assigned to the same college as the creator
        User student = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .type(UserType.USER)
                .college(requester.getCollege()) // Auto-assign to creator's college
                .isActive(true)
                .phoneNumber(request.getPhoneNumber())
                .bio(request.getBio())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .createdAt(LocalDateTime.now())
                .createdBy(requester)
                .build();

        User saved = userRepository.save(student);
        return mapToUserResponse(saved);
    }

    public UserDtos.UserResponse updateUser(String requesterEmail, Long userId, UserDtos.UpdateUserRequest request) {
        User requester = authService.getByEmail(requesterEmail);
        User userToUpdate = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Permission checks based on roles
        validateUpdatePermission(requester, userToUpdate);

        // Update allowed fields
        if (request.getName() != null) {
            userToUpdate.setName(request.getName());
        }
        if (request.getPhoneNumber() != null) {
            userToUpdate.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getBio() != null) {
            userToUpdate.setBio(request.getBio());
        }
        if (request.getDateOfBirth() != null) {
            userToUpdate.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getAddress() != null) {
            userToUpdate.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            userToUpdate.setCity(request.getCity());
        }
        if (request.getCountry() != null) {
            userToUpdate.setCountry(request.getCountry());
        }

        // Only admins and above can update isActive status
        if (request.getIsActive() != null && canManageUserStatus(requester, userToUpdate)) {
            userToUpdate.setIsActive(request.getIsActive());
        }

        // Only super admins can change college assignments
        if (request.getCollegeId() != null && requester.getType() == UserType.SUPERADMIN) {
            College newCollege = collegeRepository.findById(request.getCollegeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "College not found"));
            userToUpdate.setCollege(newCollege);
        }

        User updated = userRepository.save(userToUpdate);
        return mapToUserResponse(updated);
    }

    public UserDtos.UserResponse toggleUserStatus(String requesterEmail, Long userId) {
        User requester = authService.getByEmail(requesterEmail);
        User userToToggle = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!canManageUserStatus(requester, userToToggle)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot manage this user's status");
        }

        userToToggle.setIsActive(!userToToggle.getIsActive());
        User updated = userRepository.save(userToToggle);
        return mapToUserResponse(updated);
    }

    public void deleteUser(String requesterEmail, Long userId) {
        User requester = authService.getByEmail(requesterEmail);
        User userToDelete = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Only ROOT ADMIN and SUPER ADMIN can delete users
        if (requester.getType() != UserType.ROOTADMIN && requester.getType() != UserType.SUPERADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Root Admin or Super Admin can delete users");
        }

        // Cannot delete root admin
        if (userToDelete.getType() == UserType.ROOTADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot delete Root Admin");
        }

        // Super admin cannot delete root admin or other super admins
        if (requester.getType() == UserType.SUPERADMIN && 
            (userToDelete.getType() == UserType.ROOTADMIN || userToDelete.getType() == UserType.SUPERADMIN)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super Admin cannot delete Root Admin or other Super Admins");
        }

        userRepository.delete(userToDelete);
    }

    public void changePassword(String userEmail, UserDtos.ChangePasswordRequest request) {
        User user = authService.getByEmail(userEmail);
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserDtos.UserResponse> getManageableUsers(String requesterEmail) {
        User requester = authService.getByEmail(requesterEmail);
        
        List<User> users;
        switch (requester.getType()) {
            case ROOTADMIN:
                users = userRepository.findAll();
                break;
            case SUPERADMIN:
                users = userRepository.findAll().stream()
                        .filter(user -> user.getType() != UserType.ROOTADMIN)
                        .collect(Collectors.toList());
                break;
            case ADMIN:
                if (requester.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin without college assignment cannot manage users");
                }
                users = userRepository.findByCollegeId(requester.getCollege().getId()).stream()
                        .filter(user -> user.getType() == UserType.FACULTY || user.getType() == UserType.USER)
                        .collect(Collectors.toList());
                break;
            case FACULTY:
                if (requester.getCollege() == null) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Faculty without college assignment cannot manage users");
                }
                users = userRepository.findByCollegeIdAndType(requester.getCollege().getId(), UserType.USER);
                break;
            default:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students cannot manage users");
        }

        return users.stream().map(this::mapToUserResponse).collect(Collectors.toList());
    }

    public List<UserDtos.UserResponse> getCollegeUsers(String requesterEmail, Long collegeId) {
        User requester = authService.getByEmail(requesterEmail);

        // Permission check
        if (requester.getType() == UserType.USER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Students cannot access college user lists");
        }

        if ((requester.getType() == UserType.ADMIN || requester.getType() == UserType.FACULTY) 
                && (requester.getCollege() == null || !requester.getCollege().getId().equals(collegeId))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Can only access users from your own college");
        }

        List<User> users = userRepository.findByCollegeId(collegeId);
        return users.stream().map(this::mapToUserResponse).collect(Collectors.toList());
    }

    private void validateUpdatePermission(User requester, User userToUpdate) {
        // Users can update their own profile
        if (requester.getId().equals(userToUpdate.getId())) {
            return;
        }

        switch (requester.getType()) {
            case ROOTADMIN:
                // Can update anyone
                break;
            case SUPERADMIN:
                // Cannot update root admin
                if (userToUpdate.getType() == UserType.ROOTADMIN) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot update Root Admin");
                }
                break;
            case ADMIN:
                // Can only update users from same college (faculty and students)
                if (requester.getCollege() == null || !requester.getIsActive()) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin without college assignment or disabled cannot update users");
                }
                if (userToUpdate.getCollege() == null || 
                    !userToUpdate.getCollege().getId().equals(requester.getCollege().getId()) ||
                    (userToUpdate.getType() != UserType.FACULTY && userToUpdate.getType() != UserType.USER)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Can only update faculty and students from your college");
                }
                break;
            case FACULTY:
                // Faculty cannot update other users except themselves
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Faculty cannot update other users");
            default:
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
        }
    }

    private boolean canManageUserStatus(User requester, User userToManage) {
        switch (requester.getType()) {
            case ROOTADMIN:
                return userToManage.getType() != UserType.ROOTADMIN; // Cannot disable root admin
            case SUPERADMIN:
                return userToManage.getType() != UserType.ROOTADMIN && userToManage.getType() != UserType.SUPERADMIN;
            case ADMIN:
                return requester.getCollege() != null && 
                       userToManage.getCollege() != null &&
                       requester.getCollege().getId().equals(userToManage.getCollege().getId()) &&
                       (userToManage.getType() == UserType.FACULTY || userToManage.getType() == UserType.USER);
            default:
                return false;
        }
    }

    private UserDtos.UserResponse mapToUserResponse(User user) {
        return UserDtos.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .type(user.getType())
                .phoneNumber(user.getPhoneNumber())
                .profilePictureUrl(user.getProfilePictureUrl())
                .bio(user.getBio())
                .dateOfBirth(user.getDateOfBirth())
                .address(user.getAddress())
                .city(user.getCity())
                .country(user.getCountry())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .lastLogin(user.getLastLogin())
                .collegeId(user.getCollege() != null ? user.getCollege().getId() : null)
                .collegeName(user.getCollege() != null ? user.getCollege().getName() : null)
                .collegeCode(user.getCollege() != null ? user.getCollege().getCode() : null)
                .createdById(user.getCreatedBy() != null ? user.getCreatedBy().getId() : null)
                .createdByName(user.getCreatedBy() != null ? user.getCreatedBy().getName() : null)
                .createdByEmail(user.getCreatedBy() != null ? user.getCreatedBy().getEmail() : null)
                .build();
    }
}