package com.springboot.MyTodoList.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private AuthenticationProvider authenticationProvider;

    @Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf().disable()
        .authorizeHttpRequests()
            .requestMatchers(
                new AntPathRequestMatcher("/"),
                new AntPathRequestMatcher("/index.html"),
                new AntPathRequestMatcher("/manifest.json"),
                new AntPathRequestMatcher("/favicon.ico"),
                new AntPathRequestMatcher("/logo192.png"),
                new AntPathRequestMatcher("/logo512.png"),
                new AntPathRequestMatcher("/static/**"),
                new AntPathRequestMatcher("/pruebas/**"),
                new AntPathRequestMatcher("/pruebasUser/**"),
                new AntPathRequestMatcher("/pruebasProy/**"),
                new AntPathRequestMatcher("/auth/**"),
                new AntPathRequestMatcher("/analytics"),
                new AntPathRequestMatcher("/dashboard"),
                new AntPathRequestMatcher("/registro"),
                new AntPathRequestMatcher("/login"),

                new AntPathRequestMatcher("/**")

            ).permitAll()
            .anyRequest().authenticated()
        .and()
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
        .authenticationProvider(authenticationProvider)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
}

}