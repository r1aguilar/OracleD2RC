/* package com.example.bot;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import org.mockito.Mockito;

import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Contact;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.controller.BotController;
import com.springboot.MyTodoList.model.Equipo;
import com.springboot.MyTodoList.model.IntegrantesEquipo;
import com.springboot.MyTodoList.model.Sprints;
import com.springboot.MyTodoList.model.Tarea;
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
        
        Usuario mockUsuario = new Usuario();
        mockUsuario.setManager(true);  //es manager

        //mock update
        Update update = mock(Update.class);
        Message message = mock(Message.class);
        Contact contact = mock(Contact.class);

        when(update.hasMessage()).thenReturn(true);  // mock has mess
        when(update.getMessage()).thenReturn(message);  // mock get mess
        
        when(message.hasContact()).thenReturn(true);  // mock has contact
        when(message.getContact()).thenReturn(contact);  // mock get contact
        when(contact.getPhoneNumber()).thenReturn("1234567890");
        when(contact.getUserId()).thenReturn(999L);
        
        when(usuarioService.getItemByTelefono("1234567890"))
            .thenReturn(ResponseEntity.ok(mockUsuario)); 
        
        // Spy para no usar db real
        doReturn(mock(Message.class)).when(botController).execute(any(SendMessage.class)); 
        botController.onUpdateReceived(update);
        
        verify(usuarioService).updateUsuario(eq(0), eq(mockUsuario));  // verify updateUsuario call
        verify(botController).execute(any(SendMessage.class));  // verify execute call
    }

    @Test
public void testCreateTaskDeveloper() throws Exception {  //crea un task como developer

    long chatId = 123L;
    long userTelegramId = 456L;

    // bot con spy
    BotController realBot = new BotController(botToken, botName,
        tareaService, usuarioService, proyectoService,
        sprintsService, integrantesEquipoService, equipoService);
    BotController botSpy = Mockito.spy(realBot);

    //estado del chat para crear tarea
    botSpy.saveChatState(chatId, "WAITING_FOR_CREATING_TASK_DEVELOPER", 0);
    botSpy.userTelegramId = userTelegramId;

    // simular user dev
    Usuario user = new Usuario();
    user.setID(1);
    user.setManager(false);
    when(usuarioService.getItemByTelegramId(userTelegramId)).thenReturn(ResponseEntity.ok(user));

    IntegrantesEquipo integrante = new IntegrantesEquipo();
    integrante.setIdEquipo(2);
    when(integrantesEquipoService.getItemByIdUsuario(1)).thenReturn(ResponseEntity.ok(integrante));

    Equipo equipo = new Equipo();
    equipo.setIdProyecto(3);
    when(equipoService.getItemById(2)).thenReturn(ResponseEntity.ok(equipo));

    // crear task mock
    Tarea tareaMock = new Tarea();
    tareaMock.setNombre("Test Task");
    when(tareaService.addTarea(any(Tarea.class))).thenReturn(tareaMock);

    // mensaje del usuario mock
    Update update = mock(Update.class);
    Message message = mock(Message.class);
    org.telegram.telegrambots.meta.api.objects.User telegramUser = mock(org.telegram.telegrambots.meta.api.objects.User.class);

    when(update.hasMessage()).thenReturn(true);
    when(update.getMessage()).thenReturn(message);
    when(message.hasText()).thenReturn(true);
    when(message.getChatId()).thenReturn(chatId);
    when(message.getText()).thenReturn("Test Task\nDescripción\n2\n2025-05-20");
    when(telegramUser.getId()).thenReturn(userTelegramId);
    when(message.getFrom()).thenReturn(telegramUser);

    // evitar llamada a api
    doReturn(mock(Message.class)).when(botSpy).execute(any(SendMessage.class));


    botSpy.onUpdateReceived(update);
    verify(tareaService).addTarea(any(Tarea.class));
    verify(botSpy, atLeastOnce()).execute(any(SendMessage.class));

}

@Test
public void testDoneTasksInSprint() throws Exception { //trae todos los tasks terminados en x sprint

    long chatId = 789L;
    int idColumna = 3; // done tasks
    int idSprint = 10;
    int idEncargado = 55;

    Tarea tarea = new Tarea();
    tarea.setNombre("Terminar interfaz de usuario");
    tarea.setIdColumna(idColumna);
    tarea.setIdSprint(idSprint);
    tarea.setIdEncargado(idEncargado);
    tarea.setTiempoEstimado(4);
    tarea.setTiempoReal(5);
    List<Tarea> tareas = List.of(tarea);

    when(tareaService.findAllTasksFromSprintForUserWithColumn(idSprint, idEncargado, idColumna)).thenReturn(tareas);

    Sprints sprint = new Sprints();
    sprint.setID(idSprint);
    sprint.setNombre("Sprint 1");
    when(sprintsService.getItemById(idSprint)).thenReturn(ResponseEntity.ok(sprint));

    Usuario user = new Usuario();
    user.setID(idEncargado);
    user.setNombre("Rodrigo");
    lenient().when(usuarioService.getItemById(idEncargado)).thenReturn(ResponseEntity.ok(user));

    BotController botSpy = Mockito.spy(new BotController(botToken, botName,
        tareaService, usuarioService, proyectoService,
        sprintsService, integrantesEquipoService, equipoService));

    doReturn(mock(Message.class)).when(botSpy).execute(any(SendMessage.class));

    
    botSpy.viewListOfTasksKPIs(chatId, idColumna, idSprint, idEncargado);
    verify(tareaService).findAllTasksFromSprintForUserWithColumn(idSprint, idEncargado, idColumna);
    verify(botSpy, atLeastOnce()).execute(any(SendMessage.class));
}


@Test
public void testUserDoneTasksInSprint() throws Exception {  //regresa los tasks terminados de x usuario en x sprint

long chatId = 888L;
int idColumna = 3; // done tasks
int idSprint = 20;
int idUsuario = 99;

// tarea completada por el usuario mock
Tarea tarea = new Tarea();
tarea.setNombre("Actualizar módulo de seguridad");
tarea.setIdColumna(idColumna);
tarea.setIdSprint(idSprint);
tarea.setIdEncargado(idUsuario);
tarea.setTiempoEstimado(6);
tarea.setTiempoReal(7);

List<Tarea> tareas = List.of(tarea);

// mock del servicio
when(tareaService.findAllTasksFromSprintForUserWithColumn(idSprint, idUsuario, idColumna)).thenReturn(tareas);

Sprints sprint = new Sprints();
sprint.setID(idSprint);
sprint.setNombre("Sprint seguridad");
when(sprintsService.getItemById(idSprint)).thenReturn(ResponseEntity.ok(sprint));

Usuario user = new Usuario();
user.setID(idUsuario);
user.setNombre("Carlos");
lenient().when(usuarioService.getItemById(idUsuario)).thenReturn(ResponseEntity.ok(user));

// spy para no cambiar api
BotController botSpy = Mockito.spy(new BotController(botToken, botName,
    tareaService, usuarioService, proyectoService,
    sprintsService, integrantesEquipoService, equipoService));

doReturn(mock(Message.class)).when(botSpy).execute(any(SendMessage.class));


botSpy.viewListOfTasksKPIs(chatId, idColumna, idSprint, idUsuario);
verify(tareaService).findAllTasksFromSprintForUserWithColumn(idSprint, idUsuario, idColumna);
verify(botSpy, atLeastOnce()).execute(any(SendMessage.class));

}

@Test
public void testCreateTaskDeveloper_withInvalidFormat_shouldSendErrorMessage() throws Exception {
// Arrange
long chatId = 123L;
long userTelegramId = 456L;

BotController botSpy = Mockito.spy(new BotController(botToken, botName,
    tareaService, usuarioService, proyectoService,
    sprintsService, integrantesEquipoService, equipoService));

botSpy.saveChatState(chatId, "WAITING_FOR_CREATING_TASK_DEVELOPER", 0);
botSpy.userTelegramId = userTelegramId;

// Simular mensaje mal formado (faltan líneas)
Update update = mock(Update.class);
Message message = mock(Message.class);
org.telegram.telegrambots.meta.api.objects.User telegramUser = mock(org.telegram.telegrambots.meta.api.objects.User.class);

when(update.hasMessage()).thenReturn(true);
when(update.getMessage()).thenReturn(message);
when(message.hasText()).thenReturn(true);
when(message.getChatId()).thenReturn(chatId);
when(message.getText()).thenReturn("Solo una línea"); // ❌ Formato incorrecto
when(telegramUser.getId()).thenReturn(userTelegramId);
when(message.getFrom()).thenReturn(telegramUser);

doReturn(mock(Message.class)).when(botSpy).execute(any(SendMessage.class));

// Act
botSpy.onUpdateReceived(update);

// Assert
verify(tareaService, Mockito.never()).addTarea(any(Tarea.class)); // No debe intentar crear la tarea
verify(botSpy, atLeastOnce()).execute(any(SendMessage.class)); // Debe mandar mensaje de error

}

@Test
public void testCancelTaskFlow_shouldClearStateAndReturnToMenu() throws Exception {
// Arrange
long chatId = 123L;
long userTelegramId = 456L;

BotController botSpy = Mockito.spy(new BotController(botToken, botName,
    tareaService, usuarioService, proyectoService,
    sprintsService, integrantesEquipoService, equipoService));

botSpy.saveChatState(chatId, "WAITING_FOR_CREATING_TASK_DEVELOPER", 0);
botSpy.userTelegramId = userTelegramId;

Usuario user = new Usuario();
user.setID(1);
user.setManager(false);

// Simular mensaje de "cancelar"
Update update = mock(Update.class);
Message message = mock(Message.class);
org.telegram.telegrambots.meta.api.objects.User telegramUser = mock(org.telegram.telegrambots.meta.api.objects.User.class);

when(update.hasMessage()).thenReturn(true);
when(update.getMessage()).thenReturn(message);
when(message.hasText()).thenReturn(true);
when(message.getChatId()).thenReturn(chatId);
when(message.getText()).thenReturn("cancelar");
when(telegramUser.getId()).thenReturn(userTelegramId);
when(message.getFrom()).thenReturn(telegramUser);

doReturn(mock(Message.class)).when(botSpy).execute(any(SendMessage.class));

// Act
botSpy.onUpdateReceived(update);

// Assert
verify(botSpy, atLeastOnce()).execute(any(SendMessage.class)); // El bot responde con menú
// Opcional: puedes verificar que el estado fue eliminado si exposes removeChatState()

}

@Test
public void testShowUserDoingTasksInSprint_shouldReturnDoingTasks() throws Exception {
// Arrange
long chatId = 1001L;
int idSprint = 30;
int idUsuario = 77;
int idColumna = 2; // Doing

IntegrantesEquipo integrante = new IntegrantesEquipo();
integrante.setIdEquipo(42);
when(integrantesEquipoService.getItemByIdUsuario(idUsuario)).thenReturn(ResponseEntity.ok(integrante));

Equipo equipo = new Equipo();
equipo.setIdProyecto(99);
when(equipoService.getItemById(42)).thenReturn(ResponseEntity.ok(equipo));


// Simular tarea en curso
Tarea tarea = new Tarea();
tarea.setNombre("Integrar pasarela de pagos");
tarea.setIdColumna(idColumna);
tarea.setIdSprint(idSprint);
tarea.setIdEncargado(idUsuario);
tarea.setTiempoEstimado(8);
tarea.setTiempoReal(5);

List<Tarea> tareas = List.of(tarea);

// Mock del servicio que obtiene tareas Doing
when(tareaService.findAllTasksFromSprintForUserWithColumn(idSprint, idUsuario, idColumna)).thenReturn(tareas);

// Mock del usuario responsable
Usuario user = new Usuario();
user.setID(idUsuario);
user.setNombre("Fernanda");
lenient().when(usuarioService.getItemById(idUsuario)).thenReturn(ResponseEntity.ok(user));

// Mock del sprint
Sprints sprint = new Sprints();
sprint.setID(idSprint);
sprint.setNombre("Sprint #7");
when(sprintsService.getItemById(idSprint)).thenReturn(ResponseEntity.ok(sprint));

// Spy del bot
BotController botSpy = Mockito.spy(new BotController(botToken, botName,
    tareaService, usuarioService, proyectoService,
    sprintsService, integrantesEquipoService, equipoService));

// Evitar llamada real a Telegram API
doReturn(mock(Message.class)).when(botSpy).execute(any(SendMessage.class));

// Act
botSpy.showManagerDeveloperTasks(chatId, idColumna, idSprint, idUsuario);

// Assert
verify(tareaService).findAllTasksFromSprintForUserWithColumn(idSprint, idUsuario, idColumna);
verify(botSpy, atLeastOnce()).execute(any(SendMessage.class));


}

} */