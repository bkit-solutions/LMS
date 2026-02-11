package in.bkitsolutions.lmsbackend.config;

import in.bkitsolutions.lmsbackend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/certificates/verify/**", 
                                "/api/colleges/active",  // Public college list
                                "/uploads/**",  // Public access to uploaded files (logos, banners)
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**"
                        )
                        .permitAll()
                        // Admin data initialization endpoints - temporary for development
                        .requestMatchers("/api/admin/data/**")
                        .permitAll()
                        // User management endpoints with role-based access
                        .requestMatchers("/api/user-management/super-admin").hasAuthority("ROOTADMIN")
                        .requestMatchers("/api/user-management/admin").hasAuthority("SUPERADMIN")
                        .requestMatchers("/api/user-management/faculty").hasAuthority("ADMIN")
                        .requestMatchers("/api/user-management/student").hasAnyAuthority("ADMIN", "FACULTY")
                        // Role-based API access
                        .requestMatchers("/api/users/super-admins").hasAuthority("ROOTADMIN")
                        .requestMatchers("/api/users/admins").hasAnyAuthority("ROOTADMIN", "SUPERADMIN")
                        .requestMatchers("/api/colleges").hasAnyAuthority("ROOTADMIN", "SUPERADMIN", "ADMIN")
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers("/api/user-management/**").authenticated()
                        .requestMatchers("/api/colleges/**").authenticated()
                        .requestMatchers("/api/courses/**").authenticated()
                        .requestMatchers("/api/tests/**").authenticated()
                        .requestMatchers("/api/profile/**").authenticated()
                        // All other API requests require authentication
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost", "http://localhost:80"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
