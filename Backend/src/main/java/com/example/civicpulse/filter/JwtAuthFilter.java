package com.example.civicpulse.filter;

import com.example.civicpulse.service.ComplaintService;
import com.example.civicpulse.service.CustomUserDetails; // your UserDetailsService
import com.example.civicpulse.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {


    private final JwtUtil jwtUtils;
    private final CustomUserDetails userDetailsService;

    @Autowired
    private ComplaintService complaintService;

    public JwtAuthFilter(JwtUtil jwtUtils, CustomUserDetails userDetailsService) {
        this.jwtUtils = jwtUtils;
        this.userDetailsService = userDetailsService;
    }

@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {

    try {
        String jwt = parseJwt(request);
        if (jwt != null && jwtUtils.validateToken(jwt)) {

            String username = jwtUtils.extractUsername(jwt);

            // ✅ STEP 1: Load UserDetails (Users OR Officers)
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // ✅ STEP 2: Extract roles FROM JWT (your new method)
            List<String> jwtRoles = jwtUtils.extractRoles(jwt);  // ["OFFICER"]

            // ✅ STEP 3: Create authorities WITH ROLE_ prefix
            List<GrantedAuthority> authorities = jwtRoles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role))  // ROLE_OFFICER
                    .collect(Collectors.toList());

            System.out.println(userDetails.getUsername());
//            System.out.println(officerDetails.getUsername());
            System.out.println("JWT Roles: " + jwtRoles);
            System.out.println("Authorities: " + authorities);

            UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,  // Principal
                                null,         // Credentials
                                authorities   // ✅ JWT roles → hasRole('OFFICER') works!
                        );


            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
    } catch (Exception e) {
        System.err.println("JWT Filter error: " + e.getMessage());
    }

    filterChain.doFilter(request, response);
}


    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip filter for login/register (public endpoints)
        return path.startsWith("/api/auth/register");
    }
}
