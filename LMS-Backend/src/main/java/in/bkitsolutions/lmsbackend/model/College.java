package in.bkitsolutions.lmsbackend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "colleges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class College {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "primary_color", length = 7)
    private String primaryColor;

    @Column(name = "secondary_color", length = 7)
    private String secondaryColor;

    @Column(length = 255)
    private String domain;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "onboarded_at")
    private LocalDateTime onboardedAt;

    @ManyToOne
    @JoinColumn(name = "onboarded_by", nullable = false)
    private User onboardedBy;

    @PrePersist
    protected void onCreate() {
        onboardedAt = LocalDateTime.now();
    }
}
