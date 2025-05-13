/* package com.example.bot;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import org.mockito.Mockito;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Contact;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.controller.BotController;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.EquipoService;
import com.springboot.MyTodoList.service.IntegrantesEquipoService;
import com.springboot.MyTodoList.service.ProyectoService;
import com.springboot.MyTodoList.service.SprintsService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;

@ExtendWith(MockitoExtension.class)
public class BotControllerTest {

    @Mock
    private TareaService tareaService;
    @Mock
    private UsuarioService usuarioService;
    @Mock
    private ProyectoService proyectoService;
    @Mock
    private SprintsService sprintsService;
    @Mock
    private IntegrantesEquipoService integrantesEquipoService;
    @Mock
    private EquipoService equipoService;

    @Spy  // Use @Spy here for BotController
    private BotController botController;

    private final String botToken = "7322602656:AAE-cfOyZyteIBLZMgPnvtCsqr7MArMCvVU";
    private final String botName = "dodi_java_bot";

    @BeforeEach
    public void setUp() {
        BotController realController = new BotController(botToken, botName,
            tareaService, usuarioService, proyectoService,
            sprintsService, integrantesEquipoService, equipoService);

        botController = Mockito.spy(realController);
    }


    @Test
    public void testOnUpdateReceived_withContact_shouldCallUpdateUsuario() throws TelegramApiException {
        // Arrange
        Usuario mockUsuario = new Usuario();
        mockUsuario.setManager(true);  // simulate manager user

        // Mocking update and message
        Update update = mock(Update.class);
        Message message = mock(Message.class);
        Contact contact = mock(Contact.class);

        when(update.hasMessage()).thenReturn(true);  // Mocking hasMessage()
        when(update.getMessage()).thenReturn(message);  // Mocking getMessage()
        
        when(message.hasContact()).thenReturn(true);  // Mocking hasContact()
        when(message.getContact()).thenReturn(contact);  // Mocking getContact()
        when(contact.getPhoneNumber()).thenReturn("1234567890");
        when(contact.getUserId()).thenReturn(999L);
        
        when(usuarioService.getItemByTelefono("1234567890"))
            .thenReturn(ResponseEntity.ok(mockUsuario));  // Mocking service call
        
        // Spy the execute method to prevent it from making a real API call
        doReturn(mock(Message.class)).when(botController).execute(any(SendMessage.class));  // ✅ Correct
        
        // Act
        botController.onUpdateReceived(update);
        
        // Assert
        verify(usuarioService).updateUsuario(eq(0), eq(mockUsuario));  // Verify updateUsuario was called
        verify(botController).execute(any(SendMessage.class));  // Verify execute was called
    }
}


 */