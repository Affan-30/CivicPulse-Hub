package com.example.civicpulse.config;

import com.example.civicpulse.filter.JwtAuthFilter;
import com.example.civicpulse.service.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomUserDetails customUserDetails;

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(CustomUserDetails customUserDetails2) {
        this.customUserDetails = customUserDetails2;
    }

    @Bean
    public SecurityFilterChain securityfilterChain(HttpSecurity http) throws Exception {
        http
                // CHANGED: enable CORS handling inside Spring Security
                .cors(Customizer.withDefaults())
                // CHANGED: disable CSRF for stateless JSON APIs (you can refine later)
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                                .requestMatchers("/api/admin/complaints/line-chart").permitAll()

                        .requestMatchers("/api/complaints/*/reopen").hasRole("USER")

                        .requestMatchers("/api/complaints/*/approve").hasRole("ADMIN")
//                                hasRole("ADMIN")
                        .requestMatchers("/api/complaints/*/reject").hasAuthority("ROLE_ADMIN")


                        // ✅ OFFICER-only (PEHLE)
                        .requestMatchers("/api/complaints/my-assigned").hasRole("OFFICER")
                        .requestMatchers("/api/complaints/*/resolve").hasRole("OFFICER")

                        .requestMatchers("/api/complaints/*/feedback").hasRole("USER")

                        // ✅ Any logged-in user
                        .requestMatchers("/api/complaints/**").authenticated()

                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )

                .formLogin(form -> form.disable()) // CHANGED: disable form login
                // keep your custom UserDetailsService
                .userDetailsService(customUserDetails);

        // KEY: add JWT filter
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // NEW: CORS configuration for React dev server
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // CHANGED: allow your React origin (Vite default: 5173)
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        // keep false unless you plan to send cookies/session IDs
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // apply to all endpoints (including /api/auth/**)
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // unchanged: BCrypt encoder
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration auth) throws Exception {
        return auth.getAuthenticationManager();
    }
}
