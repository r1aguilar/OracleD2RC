package com.springboot.MyTodoList.controller.Auth;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.springboot.MyTodoList.model.Token;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.repository.TokenRepository;
import com.springboot.MyTodoList.repository.UsuarioRepository;
import com.springboot.MyTodoList.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired 
    private JwtService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private TokenRepository tokenRepository;
    
    private void saveOrUpdateToken(Integer userId, String jwtToken) {
        Token token = tokenRepository.findById(userId)
            .orElseGet(() -> new Token(userId)); // Assuming a constructor like new Token(Long id)
        
        token.setToken(jwtToken);
        tokenRepository.save(token);
    }

    public AuthenticationResponse register(RegisterRequest request){
        Usuario usuario = new Usuario(
            0, // or whatever default/placeholder value you want for `id_usuario` if it's auto-generated
            request.getUsuario(),
            request.getNombre(),
            request.getCorreo(),
            request.getTelefono(),
            passwordEncoder.encode(request.getPassword()),
            OffsetDateTime.parse(request.getFechaCreacion()),
            request.getManager(),
            request.getDeleted(),
            null // or the actual value for idTelegram if you have one
        );

        
        usuarioRepository.save(usuario);
        var user = usuarioRepository.findByCorreo(request.getCorreo()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        // Save or update token
        saveOrUpdateToken(user.getID(), jwtToken);

        return new AuthenticationResponse(user.getID(), jwtToken);
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request){
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getCorreo(),
                request.getPassword()
            )
        );
        var user = usuarioRepository.findByCorreo(request.getCorreo()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        // Save or update token
        saveOrUpdateToken(user.getID(), jwtToken);

        return new AuthenticationResponse(user.getID(), jwtToken);
    }

    public AuthenticationResponse authenticateWithTelefono(AuthenticationRequestTelefono request){
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getTelefono(),
                request.getPassword()
            )
        );
        var user = usuarioRepository.findByTelefono(request.getTelefono()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        // Save or update token
        saveOrUpdateToken(user.getID(), jwtToken);

        return new AuthenticationResponse(user.getID(), jwtToken);
    }
}
