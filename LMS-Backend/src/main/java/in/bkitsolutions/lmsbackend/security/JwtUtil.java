package in.bkitsolutions.lmsbackend.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import in.bkitsolutions.lmsbackend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {
    private final Algorithm algorithm;
    private final JWTVerifier verifier;
    private final long expirationMs;

    public JwtUtil(
            @Value("${app.jwt.secret:change-me-secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs
    ) {
        this.algorithm = Algorithm.HMAC256(secret);
        this.verifier = JWT.require(this.algorithm).withIssuer("lms").build();
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        long now = System.currentTimeMillis();
        var builder = JWT.create()
                .withIssuer("lms")
                .withSubject(user.getEmail())
                .withClaim("name", user.getName())
                .withClaim("type", user.getType().name());

        if (user.getCollege() != null) {
            builder.withClaim("collegeId", user.getCollege().getId());
            builder.withClaim("collegeName", user.getCollege().getName());
            builder.withClaim("collegeCode", user.getCollege().getCode());
        }

        return builder
                .withIssuedAt(new Date(now))
                .withExpiresAt(new Date(now + expirationMs))
                .sign(algorithm);
    }

    public String validateAndGetEmail(String token) {
        try {
            DecodedJWT jwt = verifier.verify(token);
            return jwt.getSubject();
        } catch (JWTVerificationException ex) {
            return null;
        }
    }
}
