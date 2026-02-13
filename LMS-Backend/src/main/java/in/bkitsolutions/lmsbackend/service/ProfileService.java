package in.bkitsolutions.lmsbackend.service;

import in.bkitsolutions.lmsbackend.dto.ProfileDtos;
import in.bkitsolutions.lmsbackend.model.User;
import in.bkitsolutions.lmsbackend.model.UserType;
import in.bkitsolutions.lmsbackend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@Transactional
public class ProfileService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public ProfileDtos.UserProfileResponse getUserProfile(String email) {
        User user = requireUser(email);
        return convertToProfileResponse(user);
    }

    public ProfileDtos.UserProfileResponse getUserProfileById(String requesterEmail, Long userId) {
        User requester = requireUser(requesterEmail);
        
        // Allow users to view their own profile or admins to view any profile
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Only allow viewing if:
        // 1. Viewing own profile
        // 2. Requester is ADMIN/SUPERADMIN viewing their created users
        // 3. Requester is SUPERADMIN/ROOTADMIN (can view any profile)
        if (!requester.getId().equals(userId)) {
            if (requester.getType() == UserType.USER) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot view other users' profiles");
            }
            if (requester.getType() == UserType.ADMIN) {
                // ADMIN can only view profiles of users they created
                if (targetUser.getCreatedBy() == null || !targetUser.getCreatedBy().getId().equals(requester.getId())) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot view this user's profile");
                }
            }
            // SUPERADMIN and ROOTADMIN can view any profile
        }
        
        return convertToProfileResponse(targetUser);
    }

    public ProfileDtos.UserProfileResponse updateProfile(String email, ProfileDtos.UpdateProfileRequest req) {
        User user = requireUser(email);
        
        // Update fields
        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }
        if (req.getPhoneNumber() != null) {
            user.setPhoneNumber(req.getPhoneNumber());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio());
        }
        if (req.getDateOfBirth() != null) {
            user.setDateOfBirth(req.getDateOfBirth());
        }
        if (req.getAddress() != null) {
            user.setAddress(req.getAddress());
        }
        if (req.getCity() != null) {
            user.setCity(req.getCity());
        }
        if (req.getCountry() != null) {
            user.setCountry(req.getCountry());
        }
        
        user = userRepository.save(user);
        return convertToProfileResponse(user);
    }

    public void changePassword(String email, ProfileDtos.ChangePasswordRequest req) {
        User user = requireUser(email);
        
        // Verify current password
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }
        
        // Update to new password
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public ProfileDtos.UserProfileResponse uploadProfilePicture(String email, ProfileDtos.UploadProfilePictureRequest req) {
        User user = requireUser(email);
        user.setProfilePictureUrl(req.getProfilePictureUrl());
        user = userRepository.save(user);
        return convertToProfileResponse(user);
    }

    private ProfileDtos.UserProfileResponse convertToProfileResponse(User user) {
        return new ProfileDtos.UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getType().name(),
                user.getPhoneNumber(),
                user.getProfilePictureUrl(),
                user.getBio(),
                user.getDateOfBirth(),
                user.getAddress(),
                user.getCity(),
                user.getCountry(),
                user.getCreatedAt(),
                user.getLastLogin()
        );
    }
}
