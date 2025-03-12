package com.springboot.MyTodoList.controller;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.ReplyKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardButton;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.KeyboardRow;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import com.springboot.MyTodoList.model.Equipo;
import com.springboot.MyTodoList.model.IntegrantesEquipo;
import com.springboot.MyTodoList.model.Proyecto;
import com.springboot.MyTodoList.model.Sprints;
import com.springboot.MyTodoList.model.Tarea;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.EquipoService;
import com.springboot.MyTodoList.service.IntegrantesEquipoService;
import com.springboot.MyTodoList.service.ProyectoService;
import com.springboot.MyTodoList.service.SprintsService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.UsuarioService;
import com.springboot.MyTodoList.util.BotCommands;
import com.springboot.MyTodoList.util.BotHelper;
import com.springboot.MyTodoList.util.BotLabels;
import com.springboot.MyTodoList.util.BotMessages;

public class BotController extends TelegramLongPollingBot {

	private static final Logger logger = LoggerFactory.getLogger(BotController.class);
	private TareaService tareaService;
	private UsuarioService usuarioService;
	private ProyectoService proyectoService;
	private SprintsService sprintsService;
	private IntegrantesEquipoService integrantesEquipoService;
	private EquipoService equipoService;
	private String botName;
	private long userTelegramId; 

	// Mapa para manejar el estado del chat
	private Map<Long, String> chatStateMap = new HashMap<>();
	private Map<Long, Integer> chatTareaIdMap = new HashMap<>();

	// Mapa para guardar el menú anterior
	private Map<Long, String> chatPreviousMenuMap = new HashMap<>();

	public BotController(String botToken, String botName, TareaService tareaService, UsuarioService usuarioService, ProyectoService proyectoService, SprintsService sprintsService, IntegrantesEquipoService integrantesEquipoService, EquipoService equipoService) {
		super(botToken);
		logger.info("Bot Token: " + botToken);
		logger.info("Bot name: " + botName);
		this.tareaService = tareaService;
		this.usuarioService = usuarioService;
		this.proyectoService = proyectoService;
		this.sprintsService = sprintsService;
		this.integrantesEquipoService = integrantesEquipoService;
		this.equipoService = equipoService;
		this.botName = botName;
	}

	@Override
	public void onUpdateReceived(Update update) {
		if (update.hasMessage() && update.getMessage().hasContact()) {
			long chatId = update.getMessage().getChatId();
			userTelegramId = update.getMessage().getContact().getUserId();

			String telefono = update.getMessage().getContact().getPhoneNumber();

			try {
				ResponseEntity<Usuario> usuario = usuarioService.getItemByTelefono(telefono);
				
				if (usuario.getBody() != null) {
					Usuario usuarioConIdTelegram = usuario.getBody();
	
					if(update.getMessage().getContact().getUserId() != null){
						usuarioConIdTelegram.setIdTelegram(update.getMessage().getContact().getUserId());
						usuarioService.updateUsuario(usuarioConIdTelegram.getID(), usuarioConIdTelegram);
	
						if (usuarioConIdTelegram.getManager()==true) {
							showManagerMainMenu(chatId);
						} else {
							showDeveloperMainMenu(chatId);
						}
					}
	
				} else {
					BotHelper.sendMessageToTelegram(chatId, "No encontramos un usuario registrado con ese número. Contacta con soporte.", this);
				}
				
			} catch (Exception e) {
				logger.debug("Error en el repositorio del usuario");
			}

		} else if (update.hasMessage() && update.getMessage().hasText()) {
			userTelegramId = update.getMessage().getFrom().getId();
			handleMessage(update);
		} else if (update.hasCallbackQuery()) {
			handleCallbackQuery(update);
		}
	}

	private void handleMessage(Update update) {
		String messageTextFromTelegram = update.getMessage().getText();
		long chatId = update.getMessage().getChatId();
	
		// Verificar si estamos esperando un valor para un campo específico
		String chatState = chatStateMap.get(chatId);
		if (chatState != null) {
			if (chatState.startsWith("WAITING_FOR_UPDATE_TASK_")) {
				String field = chatState.replace("WAITING_FOR_UPDATE_TASK_", "");
				int tareaId = chatTareaIdMap.get(chatId);
	
				// Obtener la tarea actual
				Tarea tarea = tareaService.getItemById(tareaId).getBody();
				if (tarea != null) {
					try {
						// Actualizar el campo correspondiente
						switch (field) {
							case "Name":
								tarea.setNombre(messageTextFromTelegram);
								break;
							case "Description":
								tarea.setDescripcion(messageTextFromTelegram);
								break;
							case "Priority":
								tarea.setPrioridad(Integer.parseInt(messageTextFromTelegram));
								break;
							case "Sprint":
								tarea.setIdSprint(Integer.parseInt(messageTextFromTelegram));
								break;
							case "Due date":
								// Verificar si el usuario ingresó solo la fecha (YYYY-MM-DD)
								String fechaIngresada = messageTextFromTelegram.trim();
								if (fechaIngresada.matches("\\d{4}-\\d{2}-\\d{2}")) {
									fechaIngresada += "T23:59:59Z"; // Agregar la hora para que OffsetDateTime.parse no falle
								}
								tarea.setFechaVencimiento(OffsetDateTime.parse(fechaIngresada));
								break;
							case "Story Points":
								tarea.setStoryPoints(Integer.parseInt(messageTextFromTelegram));
								break;
							case "Estimated Time":
								tarea.setTiempoReal(messageTextFromTelegram);
								break;
							default:
								// Manejar campos no reconocidos
								BotHelper.sendMessageToTelegram(chatId, "Campo no reconocido: " + field, this);
								return;
						}	
						// Actualizar la tarea en la base de datos
						tareaService.updateTarea(tareaId, tarea);
			
						// Enviar un mensaje de confirmación al usuario
						BotHelper.sendMessageToTelegram(chatId, "El campo " + field + " ha sido actualizado correctamente.", this);
		
						// Mostrar nuevamente el menú de modificación de la tarea
						showTaskModificationMenu(chatId, tarea);

					} catch (Exception e) {
						// Enviar un mensaje de confirmación al usuario
						BotHelper.sendMessageToTelegram(chatId, "El campo " + field + " no ha podido actualizarse, intentalo nuevamente.", this);
						logger.error("Error actualizando los datos", e);
						// Mostrar nuevamente el menú de modificación de la tarea
						showTaskModificationMenu(chatId, tarea);
					}
				} else {
					BotHelper.sendMessageToTelegram(chatId, "No se encontró la tarea con ID: " + tareaId, this);
				}
			} else if (chatState.startsWith("WAITING_FOR_PROJECT_FIELD_")) {
				String field = chatState.replace("WAITING_FOR_PROJECT_FIELD_", "");
				int proyectoId = chatTareaIdMap.get(chatId);
	
				// Obtener el proyecto actual
				Proyecto proyecto = proyectoService.getItemById(proyectoId).getBody();
				if (proyecto != null) {
					// Actualizar el campo correspondiente
					switch (field) {
						case "NAME":
							proyecto.setNombre(messageTextFromTelegram);
							break;
						case "DESCRIPTION":
							proyecto.setDescripcion(messageTextFromTelegram);
							break;
						default:
							// Manejar campos no reconocidos
							BotHelper.sendMessageToTelegram(chatId, "Campo no reconocido: " + field, this);
							return;
					}
	
					// Actualizar el proyecto en la base de datos
					proyectoService.updateProyecto(proyectoId, proyecto);
	
					// Enviar un mensaje de confirmación al usuario
					BotHelper.sendMessageToTelegram(chatId, "El campo " + field + " ha sido actualizado correctamente.", this);
	
					// Mostrar nuevamente el menú de modificación del proyecto
					editProjectMenu(chatId, proyecto);
				} else {
					BotHelper.sendMessageToTelegram(chatId, "No se encontró el proyecto con ID: " + proyectoId, this);
				}
			} else if (chatState.startsWith("WAITING_FOR_TASK_STATUS_UPDATE")) {
				int tareaId = chatTareaIdMap.get(chatId);
				int id;
				Tarea tarea = tareaService.getItemById(tareaId).getBody();
				switch(messageTextFromTelegram){
					case "1":
						id = Integer.parseInt(messageTextFromTelegram);
						tarea.setIdColumna(id);
						tareaService.updateTarea(tareaId, tarea);
						BotHelper.sendMessageToTelegram(chatId, "Changed " + tarea.getNombre() + " status to Pending", this);
						clearChatState(chatId);
						showUpdateTaskStatusDeveloperMenu(chatId);
					break;
					case "2":
						id = Integer.parseInt(messageTextFromTelegram);
						tarea.setIdColumna(id);
						tareaService.updateTarea(tareaId, tarea);
						BotHelper.sendMessageToTelegram(chatId, "Changed " + tarea.getNombre() + " status to Doing", this);
						clearChatState(chatId);
						showUpdateTaskStatusDeveloperMenu(chatId);
					break;
					case "3":
						id = Integer.parseInt(messageTextFromTelegram);
						tarea.setIdColumna(id);
						tareaService.updateTarea(tareaId, tarea);
						BotHelper.sendMessageToTelegram(chatId, "Changed " + tarea.getNombre() + " status to Done", this);
						clearChatState(chatId);
						showUpdateTaskStatusDeveloperMenu(chatId);
					break;
					default:
						BotHelper.sendMessageToTelegram(chatId, "Text invalid, please try again", this);
					break;
				}
			}
		} else if (messageTextFromTelegram.equals(BotCommands.LOGIN_COMMAND.getCommand()) || messageTextFromTelegram.equals(BotCommands.START.getCommand())) {
			loginChatbot(chatId, update);
		} else if (messageTextFromTelegram.equals(BotLabels.SHOW_NOT_ACCEPTED_TASKS.getLabel())) {
			showManagerProjectsForNotAcceptedTasks(chatId);
		} else if (messageTextFromTelegram.equals(BotLabels.MANAGE_PROJECTS.getLabel())) {
			showManageProjects(chatId);
		} else if (messageTextFromTelegram.equals(BotLabels.EDIT_PROJECT.getLabel())) {
			editProject(chatId);
		} else if (messageTextFromTelegram.equals(BotLabels.SHOW_MANAGER_MAIN_SCREEN.getLabel())) {
			showManagerMainMenu(chatId);
		} else if (messageTextFromTelegram.equals(BotLabels.SHOW_DEVELOPER_MAIN_SCREEN.getLabel())) {
			showDeveloperMainMenu(chatId);
		} else if (messageTextFromTelegram.equals(BotLabels.MANAGER.getLabel())) {
			showManagerMainMenu(chatId);
		} else if (messageTextFromTelegram.equals(BotLabels.DEVELOPER.getLabel())) {
			showDeveloperMainMenu(chatId);
		} else if (messageTextFromTelegram.equals(BotLabels.UPDATE_TASK_STATUS.getLabel())) {
			showUpdateTaskStatusDeveloperMenu(chatId);
		} 
	}

	private void loginChatbot(long chatId, Update update){
		BotHelper.sendMessageToTelegram(chatId, "Searching for login information ... ", this);
		long telegramId = update.getMessage().getFrom().getId();
		Usuario usuario = usuarioService.getItemByTelegramId(telegramId).getBody();

		if (usuario != null) {
			// Usuario ya registrado
			if (usuario.getManager()==true) {
				showManagerMainMenu(chatId);
			} else {
				showDeveloperMainMenu(chatId);
			}
		} else {
			// Pedir información del usuario
			SendMessage message = new SendMessage();
			message.setChatId(chatId);
			message.setText("Please share you contact information to continue");

			ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
			keyboardMarkup.setResizeKeyboard(true);
			List<KeyboardRow> keyboard = new ArrayList<>();

			KeyboardRow row = new KeyboardRow();
			KeyboardButton shareContactButton = new KeyboardButton("Share your phone number");
			shareContactButton.setRequestContact(true);
			row.add(shareContactButton);
			keyboard.add(row);

			keyboardMarkup.setKeyboard(keyboard);
			message.setReplyMarkup(keyboardMarkup);

			try {
				execute(message);
			} catch (TelegramApiException e) {
				logger.error("Error enviando solicitud de número de teléfono", e);
			}
		}
	}

	private void showUpdateTaskStatusDeveloperMenu(long chatId){
		try {
			InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
			List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
			List<InlineKeyboardButton> titleRow = new ArrayList<>();
			InlineKeyboardButton sprintTitleButton = new InlineKeyboardButton();
			sprintTitleButton.setText("Filter by Sprint");
			sprintTitleButton.setCallbackData("NO_ACTION");
			titleRow.add(sprintTitleButton);
			rowsInline.add(titleRow);
			// Primero buscas el equipo al que el user pertenece con el IntegranteEquipo by idUsuario y 
			// despues buscas en el repo de equipo por getItemById y de ese sacas el id del proyecto para sacar despues los sprints 
			ResponseEntity<Usuario> usuario = usuarioService.getItemByTelegramId(userTelegramId);
			Usuario userInChat = usuario.getBody();
			if(userInChat!= null){
				ResponseEntity<IntegrantesEquipo> integranteResponse = integrantesEquipoService.getItemByIdUsuario(userInChat.getID());
				IntegrantesEquipo integrante = integranteResponse.getBody();
				if(integrante != null){
					ResponseEntity<Equipo> equipoResponse = equipoService.getItemById(integrante.getIdEquipo());
					Equipo equipo = equipoResponse.getBody();
					if(equipo != null){
						// Obtener la lista de sprints del proyecto
						List<Sprints> sprints = sprintsService.findAllSprintsFromProject(equipo.getIdProyecto());
						// Despues de obtener la lista de sprints se hace el menu donde el callback sera el id de cada sprint
						for (Sprints sprint : sprints) {
							List<InlineKeyboardButton> rowInline = new ArrayList<>();
							InlineKeyboardButton sprintButton = new InlineKeyboardButton();
							sprintButton.setText(sprint.getNombre());
							sprintButton.setCallbackData("SPRINT_FOR_UPDATE_TASK " + sprint.getID());
							rowInline.add(sprintButton);
							rowsInline.add(rowInline);
						}

						List<InlineKeyboardButton> allTasksRow = new ArrayList<>();
						InlineKeyboardButton allTasksButton = new InlineKeyboardButton();
						allTasksButton.setText("View All Tasks");
						allTasksButton.setCallbackData("VIEW_ALL_TASKS_FOR_UPDATE");
						allTasksRow.add(allTasksButton);
						rowsInline.add(allTasksRow);

						List<InlineKeyboardButton> lastRow = new ArrayList<>();
						InlineKeyboardButton lastButton = new InlineKeyboardButton();
						lastButton.setText("Back to developer main menu");
						lastButton.setCallbackData("BACK_TO_DEVELOPER_MAIN_MENU");
						lastRow.add(lastButton);
						rowsInline.add(lastRow);
					}
				}
			}

			inlineKeyboardMarkup.setKeyboard(rowsInline);
			SendMessage messageToTelegram = new SendMessage();
			messageToTelegram.setChatId(chatId);
			messageToTelegram.setText("Select an sprint to filter tasks or show all assigned tasks");
			messageToTelegram.setReplyMarkup(inlineKeyboardMarkup);
			execute(messageToTelegram);
		} catch (TelegramApiException e) {
			logger.error(e.getLocalizedMessage(), e);
		}
	}

	private void showTaskModificationMenu(long chatId, Tarea tarea) {
		try {
			InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
			List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
			String sprintName = "Not assigned";
			if(tarea.getIdSprint() != 0){
				ResponseEntity<Sprints> sprint = sprintsService.getItemById(tarea.getIdSprint());
				if(sprint.getBody() != null){
					sprintName = sprint.getBody().getNombre();
				}
			}
	
			String[][] fields = {
				{"Name", tarea.getNombre()},
				{"Description", tarea.getDescripcion() != null ? tarea.getDescripcion() : "No Description"},
				{"Priority", tarea.getPrioridad() != 0 ? String.valueOf(tarea.getPrioridad()) : "No Priority"},
				{"Sprint", sprintName},
				{"Due date", tarea.getFechaVencimiento() != null ? String.valueOf(tarea.getFechaVencimiento()).substring(0, 10) : "No Due Date"},
				{"Story Points", tarea.getStoryPoints() != 0 ? String.valueOf(tarea.getStoryPoints()) : "No Story Points"},
				{"Estimated Time", tarea.getTiempoReal() != null ? tarea.getTiempoReal() : "No Estimated Time"}
			};
	
			for (String[] field : fields) {
				List<InlineKeyboardButton> rowInline = new ArrayList<>();
				InlineKeyboardButton fieldButton = new InlineKeyboardButton();
				InlineKeyboardButton NameButton = new InlineKeyboardButton();
				fieldButton.setText(field[1]); // Muestra el valor del campo
				if (field[0].equals("Sprint")) {
					// Botón para seleccionar sprint
					fieldButton.setCallbackData("SELECT_SPRINT_NOT_ACCEPTED " + tarea.getIdTarea());
					NameButton.setText(field[0]);
					NameButton.setCallbackData("SELECT_SPRINT_NOT_ACCEPTED " + tarea.getIdTarea());
				} else {
					// Otros campos
					fieldButton.setCallbackData("UPDATE_TASK_" + field[0] + " " + tarea.getIdTarea() + "/ACCEPT_TASK");
					NameButton.setText(field[0]);
					NameButton.setCallbackData("UPDATE_TASK_" + field[0] + " " + tarea.getIdTarea() + "/ACCEPT_TASK");
				}
				rowInline.add(NameButton);
				rowInline.add(fieldButton);
				rowsInline.add(rowInline);
			}
	
			// Botón de aceptar tarea
			List<InlineKeyboardButton> acceptRow = new ArrayList<>();
			InlineKeyboardButton acceptButton = new InlineKeyboardButton();
			acceptButton.setText("Accept Task");
			acceptButton.setCallbackData("CONFIRM_ACCEPT_TASK " + tarea.getIdTarea());
			acceptRow.add(acceptButton);
	
			// Botón de regresar
			InlineKeyboardButton backButton = new InlineKeyboardButton();
			backButton.setText("Go back");
			backButton.setCallbackData("BACK_TO_NOT_ACCEPTED_TASKS " + tarea.getIdProyecto());
			acceptRow.add(backButton);
	
			rowsInline.add(acceptRow);
	
			inlineKeyboardMarkup.setKeyboard(rowsInline);
	
			SendMessage messageToTelegram = new SendMessage();
			messageToTelegram.setChatId(chatId);
			messageToTelegram.setText("Select the field to modify:");
			messageToTelegram.setReplyMarkup(inlineKeyboardMarkup);
			execute(messageToTelegram);
		} catch (TelegramApiException e) {
			logger.error("Error showing the task modification menu", e);
		}
	}

	private void handleSelectSprint(long chatId, int idTarea) {
		try {
			// Obtener la tarea actual
			ResponseEntity<Tarea> tareaResponse = tareaService.getItemById(idTarea);
			if (tareaResponse.getBody() != null) {
				Tarea tarea = tareaResponse.getBody();
				int idProyecto = tarea.getIdProyecto();
	
				// Obtener la lista de sprints del proyecto
				List<Sprints> sprints = sprintsService.findAllSprintsFromProject(idProyecto);
	
				// Crear el teclado en línea con los sprints
				InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
				List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
				List<InlineKeyboardButton> titleRow = new ArrayList<>();
				InlineKeyboardButton titleButton = new InlineKeyboardButton();
				titleButton.setText("Project Sprints");
				titleButton.setCallbackData("NO_ACTION ");
				rowsInline.add(titleRow);
	
				for (Sprints sprint : sprints) {
					List<InlineKeyboardButton> rowInline = new ArrayList<>();
					InlineKeyboardButton sprintButton = new InlineKeyboardButton();
					sprintButton.setText(sprint.getNombre());
					sprintButton.setCallbackData("SET_SPRINT " + idTarea + " " + sprint.getID());
					rowInline.add(sprintButton);
					rowsInline.add(rowInline);
				}
	
				// Botón de regresar
				List<InlineKeyboardButton> backRow = new ArrayList<>();
				InlineKeyboardButton backButton = new InlineKeyboardButton();
				backButton.setText("Go back");
				backButton.setCallbackData("BACK_TO_TASK_MODIFICATION " + idTarea);
				backRow.add(backButton);
				rowsInline.add(backRow);
	
				inlineKeyboardMarkup.setKeyboard(rowsInline);
	
				// Enviar el mensaje con los sprints
				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText("Select a sprint:");
				messageToTelegram.setReplyMarkup(inlineKeyboardMarkup);
				execute(messageToTelegram);
			} else {
				BotHelper.sendMessageToTelegram(chatId, "No task found with id: " + idTarea, this);
			}
		} catch (TelegramApiException e) {
			logger.error("Error showing sprint selection menu", e);
		}
	}

	private void editProjectMenu(long chatId, Proyecto proyecto) {
		try {
			InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
			List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
	
			String[][] fields = {
				{"Name", proyecto.getNombre()},
				{"Description", proyecto.getDescripcion()}
			};
	
			for (String[] field : fields) {
				List<InlineKeyboardButton> rowInline = new ArrayList<>();
				InlineKeyboardButton fieldButton = new InlineKeyboardButton();
				InlineKeyboardButton NameButton = new InlineKeyboardButton();
				fieldButton.setText(field[1]); // Muestra el valor del campo
				fieldButton.setCallbackData("UPDATE_PROJECT_" + field[0] + " " + proyecto.getID() + "/EDIT_PROJECT");
				NameButton.setText(field[0]);
				NameButton.setCallbackData("UPDATE_PROJECT_" + field[0] + " " + proyecto.getID() + "/EDIT_PROJECT");
				rowInline.add(NameButton);
				rowInline.add(fieldButton);
				rowsInline.add(rowInline);
			}
	
			// Botón de regresar al menú principal
			List<InlineKeyboardButton> backRow = new ArrayList<>();
			InlineKeyboardButton backButton = new InlineKeyboardButton();
			backButton.setText("Main Menu");
			backButton.setCallbackData("BACK_TO_MANAGER_MAIN_MENU");
			backRow.add(backButton);
	
			rowsInline.add(backRow);
	
			inlineKeyboardMarkup.setKeyboard(rowsInline);
	
			SendMessage messageToTelegram = new SendMessage();
			messageToTelegram.setChatId(chatId);
			messageToTelegram.setText("Select the field to modify:");
			messageToTelegram.setReplyMarkup(inlineKeyboardMarkup);
			execute(messageToTelegram);
		} catch (TelegramApiException e) {
			logger.error("Error showing project modification menu", e);
		}
	}

	private void handleCallbackQuery(Update update) {
		String callbackData = update.getCallbackQuery().getData();
		long chatId = update.getCallbackQuery().getMessage().getChatId();
	
		if (callbackData.startsWith("ACCEPT_TASK")) {
			String[] parts = callbackData.replace("ACCEPT_TASK ", "").split("/");
			String tareaNombre = parts[0];
			int tareaId = Integer.parseInt(parts[1]);
	
			try {
				Tarea tarea = tareaService.getItemById(tareaId).getBody();
				if (tarea != null) {
					// Guardar el menú anterior
					chatPreviousMenuMap.put(chatId, "SHOW_NOT_ACCEPTED_TASKS");
	
					BotHelper.sendMessageToTelegram(chatId, "Task selected: " + tareaNombre + ".\n\nPlease select all the fields you want to modify before accepting the task.\n\nWhen you are done editing the task, click on Accept", this);
	
					// Mostrar el menú de modificación de la tarea
					showTaskModificationMenu(chatId, tarea);
				} else {
					BotHelper.sendMessageToTelegram(chatId, "No task found with ID: " + tareaId, this);
				}
			} catch (Exception e) {
				logger.error("Error obtaining selected task", e);
			}
		} else if (callbackData.startsWith("UPDATE_TASK_")) {

			// Dividir el callbackData por el espacio
			String[] parts = callbackData.split(" ");
        
			// Si el array tiene tres partes (indica que el campo tiene dos palabras)
			String field = "";
			int tareaId = 0;
	
			if (parts.length == 3) {
				// Si son tres partes, entonces el campo está compuesto por dos palabras
				field = parts[0].replace("UPDATE_TASK_", "") + " " + parts[1]; // Concatenar las dos primeras partes
				tareaId = Integer.parseInt(parts[2].split("/")[0]); // El ID de tarea se encuentra en la última parte
			} else if (parts.length == 2) {
				// Si son dos partes, entonces el campo es de una sola palabra
				field = parts[0].replace("UPDATE_TASK_", ""); // El campo es la primera parte
				tareaId = Integer.parseInt(parts[1].split("/")[0]); // El ID de tarea es la segunda parte
			}

			// Guardar el estado del chat
			saveChatState(chatId, "WAITING_FOR_UPDATE_TASK_" + field, tareaId);

			// Definir mensaje según el campo
			String message;
			switch (field) {
				case "Priority":
					message = "Please write the number depending on the priority you want to select:\n"
							+ "1. Low\n"
							+ "2. Medium\n"
							+ "3. High";
					break;
				case "Due date":
					message = "Please write the due date for the task in the format YYYY-MM-DD";
					break;
				case "Estimated time":
					message = "Please write the estimated time for each task, consider that the unit is hours";
					break;
				default:
					message = "Please write the new value for " + field;
					break;
			}
			// Enviar mensaje al usuario
			BotHelper.sendMessageToTelegram(chatId, message, this);
		} else if (callbackData.startsWith("UPDATE_PROJECT_")) {
			String[] parts = callbackData.split(" ");
			String field = parts[0].replace("UPDATE_PROJECT_", "");
			int proyectoId = Integer.parseInt(parts[1].split("/")[0]);
	
			// Guardar el estado del chat
			saveChatState(chatId, "WAITING_FOR_PROJECT_FIELD_" + field, proyectoId);
	
			// Enviar un mensaje solicitando el nuevo valor para el campo
			BotHelper.sendMessageToTelegram(chatId, "Please write the new value for " + field, this);
		} else if (callbackData.startsWith("CONFIRM_ACCEPT_TASK")) {
			int tareaId = Integer.parseInt(callbackData.replace("CONFIRM_ACCEPT_TASK ", ""));
	
			// Obtener la tarea actual
			Tarea tarea = tareaService.getItemById(tareaId).getBody();
			if (tarea != null) {
				int idProyecto = tarea.getIdProyecto();
				// Actualizar el estado de la tarea a "Aceptada"
				tarea.setAceptada(1);
				tareaService.updateTarea(tareaId, tarea);
	
				// Enviar un mensaje de confirmación al usuario
				BotHelper.sendMessageToTelegram(chatId, "The task has been accepted succesfully", this);
	
				// Redirigir al menú anterior
				String previousMenu = chatPreviousMenuMap.get(chatId);
				if (previousMenu != null) {
					if (previousMenu.equals("SHOW_NOT_ACCEPTED_TASKS")) {
						showNotAcceptedTasks(chatId, idProyecto);
					} else if (previousMenu.equals("MAIN_MENU")) {
						showManagerMainMenu(chatId);
					}
				}

				clearChatState(chatId);
	
			} else {
				BotHelper.sendMessageToTelegram(chatId, "No task found with ID: " + tareaId, this);
			}
		} else if (callbackData.startsWith("EDIT_PROJECT")) {
			String[] parts = callbackData.replace("EDIT_PROJECT ", "").split("/");
			int proyectoId = Integer.parseInt(parts[0]);
	
			// Obtener el proyecto actual
			Proyecto proyecto = proyectoService.getItemById(proyectoId).getBody();
			if (proyecto != null) {
				// Mostrar el menú de modificación del proyecto
				editProjectMenu(chatId, proyecto);
			} else {
				BotHelper.sendMessageToTelegram(chatId, "No project found with ID: " + proyectoId, this);
			}
		} else if (callbackData.startsWith("BACK_TO_NOT_ACCEPTED_TASKS")) {
			String[] parts = callbackData.replace("BACK_TO_NOT_ACCEPTED_TASKS ", "").split("/");
			int proyectoId = Integer.parseInt(parts[0]);
			// Regresar al menú de tareas no aceptadas
			showNotAcceptedTasks(chatId, proyectoId);
		} else if (callbackData.equals("BACK_TO_MANAGER_MAIN_MENU")) {
			// Regresar al menú principal
			clearChatState(chatId);
			showManagerMainMenu(chatId);
		} else if (callbackData.startsWith("SEE_NOT_ACCEPTED")) {
			String[] parts = callbackData.replace("SEE_NOT_ACCEPTED ", "").split("/");
			int proyectoId = Integer.parseInt(parts[0]);

			Proyecto proyecto = proyectoService.getItemById(proyectoId).getBody();
			if (proyecto != null) {
				// Mostrar el menú de modificación del proyecto
				showNotAcceptedTasks(chatId, proyecto.getID());
			} else {
				BotHelper.sendMessageToTelegram(chatId, "No project found with ID: " + proyectoId, this);
			}
		} else if (callbackData.startsWith("SELECT_SPRINT_NOT_ACCEPTED")) {
			// Manejar la selección de sprint
			int idTarea = Integer.parseInt(callbackData.replace("SELECT_SPRINT_NOT_ACCEPTED ", ""));
			handleSelectSprint(chatId, idTarea);
		} else if (callbackData.startsWith("SET_SPRINT")) {
			// Manejar la selección de un sprint específico
			String[] parts = callbackData.split(" ");
			int idTarea = Integer.parseInt(parts[1]);
			int idSprint = Integer.parseInt(parts[2]);
	
			// Obtener la tarea actual
			ResponseEntity<Tarea> tareaResponse = tareaService.getItemById(idTarea);
			if (tareaResponse.getBody() != null) {
				Tarea tarea = tareaResponse.getBody();
				tarea.setIdSprint(idSprint); // Actualizar el sprint
				tareaService.updateTarea(idTarea, tarea); // Guardar los cambios
	
				// Regresar al menú de modificación de tareas
				showTaskModificationMenu(chatId, tarea);
			} else {
				BotHelper.sendMessageToTelegram(chatId, "No task found with ID: " + idTarea, this);
			}
		} else if (callbackData.startsWith("SPRINT_FOR_UPDATE_TASK")) {
			String[] parts = callbackData.split(" ");
			int sprintId = Integer.parseInt(parts[1]);
			listTasksForUserUpdateStatusBySprint(chatId, sprintId);

		} else if (callbackData.equals("VIEW_ALL_TASKS_FOR_UPDATE")) {
			
		} else if (callbackData.startsWith("UPDATE_STATUS")) {
			String[] parts = callbackData.split(" ");
			int idTarea = Integer.parseInt(parts[1]);
			// Guardar el estado del chat
			saveChatState(chatId, "WAITING_FOR_TASK_STATUS_UPDATE", idTarea);
			// Enviar un mensaje solicitando el nuevo valor para el campo
			BotHelper.sendMessageToTelegram(chatId, "Write the number for the newstate.\n1. Pending\n2. Doing\n3. Done", this);
		} else if (callbackData.equals("BACK_TO_DEVELOPER_MAIN_MENU")) {
			// Regresar al menú principal
			clearChatState(chatId);
			showDeveloperMainMenu(chatId);
		}
	}

	private void listAllTasksForUserUpdateStatus(long chatId){
		try {
			InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
			List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
			List<InlineKeyboardButton> titleRow = new ArrayList<>();
			InlineKeyboardButton TitleButton = new InlineKeyboardButton();
			TitleButton.setText("All tasks");
			TitleButton.setCallbackData("NO_ACTION");
			titleRow.add(TitleButton);
			rowsInline.add(titleRow);

			ResponseEntity<Usuario> usuario = usuarioService.getItemByTelegramId(userTelegramId);
			Usuario userInChat = usuario.getBody();
			if(userInChat!= null){
				List<Tarea> tareasDelSprint = tareaService.findAllTasksFromProjectForUser(userInChat.getID());
				for(Tarea tarea : tareasDelSprint){
				List<InlineKeyboardButton> rowInline = new ArrayList<>();
				InlineKeyboardButton taskButton = new InlineKeyboardButton();
				InlineKeyboardButton statusButton = new InlineKeyboardButton();
				taskButton.setText(tarea.getNombre());
				taskButton.setCallbackData("UPDATE_STATUS " + tarea.getIdTarea());
				statusButton.setText(idColumnaStringReturn(tarea.getIdColumna()));
				statusButton.setCallbackData("UPDATE_STATUS " + tarea.getIdTarea());
				rowInline.add(taskButton);
				rowInline.add(statusButton);
				rowsInline.add(rowInline);
				}
			}

			inlineKeyboardMarkup.setKeyboard(rowsInline);
			SendMessage messageToTelegram = new SendMessage();
			messageToTelegram.setChatId(chatId);
			messageToTelegram.setText("Select the task to update status");
			messageToTelegram.setReplyMarkup(inlineKeyboardMarkup);
			execute(messageToTelegram);			
		} catch (TelegramApiException e) {
			logger.error(e.getLocalizedMessage(), e);
		}
	}

	private void listTasksForUserUpdateStatusBySprint(long chatId, int idSprint){
		try {
			InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
			List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
			List<InlineKeyboardButton> titleRow = new ArrayList<>();
			InlineKeyboardButton sprintTitleButton = new InlineKeyboardButton();
			ResponseEntity<Sprints> sprintResponse = sprintsService.getItemById(idSprint);
			Sprints sprint = sprintResponse.getBody();
			sprintTitleButton.setText(sprint.getNombre() + " tasks");
			sprintTitleButton.setCallbackData("NO_ACTION");
			titleRow.add(sprintTitleButton);
			rowsInline.add(titleRow);

			ResponseEntity<Usuario> usuario = usuarioService.getItemByTelegramId(userTelegramId);
			Usuario userInChat = usuario.getBody();
			if(userInChat!= null){
				List<Tarea> tareasDelSprint = tareaService.findAllTasksInSprintForUser(idSprint, userInChat.getID());
				for(Tarea tarea : tareasDelSprint){
				List<InlineKeyboardButton> rowInline = new ArrayList<>();
				InlineKeyboardButton taskButton = new InlineKeyboardButton();
				InlineKeyboardButton statusButton = new InlineKeyboardButton();
				taskButton.setText(tarea.getNombre());
				taskButton.setCallbackData("UPDATE_STATUS " + tarea.getIdTarea());
				statusButton.setText(idColumnaStringReturn(tarea.getIdColumna()));
				statusButton.setCallbackData("UPDATE_STATUS " + tarea.getIdTarea());
				rowInline.add(taskButton);
				rowInline.add(statusButton);
				rowsInline.add(rowInline);
				}
			}

			inlineKeyboardMarkup.setKeyboard(rowsInline);
			SendMessage messageToTelegram = new SendMessage();
			messageToTelegram.setChatId(chatId);
			messageToTelegram.setText("Select the task to update status");
			messageToTelegram.setReplyMarkup(inlineKeyboardMarkup);
			execute(messageToTelegram);			
		} catch (TelegramApiException e) {
			logger.error(e.getLocalizedMessage(), e);
		}
	}
	
	private void showManagerMainMenu(long chatId) {
		SendMessage messageToTelegram = new SendMessage();
		messageToTelegram.setChatId(chatId);
		messageToTelegram.setText(BotMessages.HELLO_MANAGER.getMessage());

		ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
		List<KeyboardRow> keyboard = new ArrayList<>();

		// First row
		KeyboardRow row = new KeyboardRow();
		row.add(BotLabels.MANAGE_PROJECTS.getLabel());
		row.add(BotLabels.MANAGE_TEAMS.getLabel());
		keyboard.add(row);

		// Second row
		row = new KeyboardRow();
		row.add(BotLabels.MANAGE_TASKS.getLabel());
		row.add(BotLabels.SHOW_NOT_ACCEPTED_TASKS.getLabel());
		keyboard.add(row);

		keyboardMarkup.setKeyboard(keyboard);
		messageToTelegram.setReplyMarkup(keyboardMarkup);

		try {
			execute(messageToTelegram);
		} catch (TelegramApiException e) {
			logger.error(e.getLocalizedMessage(), e);
		}
	}

	private void showDeveloperMainMenu(long chatId) {
		SendMessage messageToTelegram = new SendMessage();
		messageToTelegram.setChatId(chatId);
		messageToTelegram.setText(BotMessages.HELLO_DEVELOPER.getMessage());

		ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
		List<KeyboardRow> keyboard = new ArrayList<>();

		// First row
		KeyboardRow row = new KeyboardRow();
		row.add(BotLabels.VIEW_TASKS.getLabel());
		row.add(BotLabels.VIEW_REMINDERS.getLabel());
		keyboard.add(row);

		// Second row
		row = new KeyboardRow();
		row.add(BotLabels.UPDATE_TASK_STATUS.getLabel());
		row.add(BotLabels.CREATE_TASK.getLabel());
		keyboard.add(row);

		keyboardMarkup.setKeyboard(keyboard);
		messageToTelegram.setReplyMarkup(keyboardMarkup);

		try {
			execute(messageToTelegram);
		} catch (TelegramApiException e) {
			logger.error(e.getLocalizedMessage(), e);
		}
	}

	private void showNotAcceptedTasks(long chatId, int id_proyecto) {
		try {
			List<Tarea> tareasNoAceptadas = tareaService.findAllNotAcceptedFromProject(id_proyecto);

			InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
			List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();

			// Agregar el primer renglón con el título
			List<InlineKeyboardButton> titleRow = new ArrayList<>();
			InlineKeyboardButton titleButton = new InlineKeyboardButton();
			titleButton.setText("Not Accepted Tasks");
			titleButton.setCallbackData("NO_ACTION");
			titleRow.add(titleButton);
			rowsInline.add(titleRow);

			for (Tarea tarea : tareasNoAceptadas) {
				List<InlineKeyboardButton> rowInline = new ArrayList<>();

				InlineKeyboardButton tareaButton = new InlineKeyboardButton();
				tareaButton.setText(tarea.getNombre());
				tareaButton.setCallbackData("ACCEPT_TASK " + tarea.getNombre() + "/" + tarea.getIdTarea());
				rowInline.add(tareaButton);

				Usuario usuario = usuarioService.getItemById(tarea.getIdEncargado()).getBody();
				InlineKeyboardButton usuarioButton = new InlineKeyboardButton();
				if (usuario != null) {
					usuarioButton.setText(usuario.getNombre());
				} else {
					usuarioButton.setText("No user in charge");
				}
				usuarioButton.setCallbackData("ACCEPT_TASK " + tarea.getNombre() + "/" + tarea.getIdTarea());
				rowInline.add(usuarioButton);

				InlineKeyboardButton proyectoButton = new InlineKeyboardButton();
				try {
					Proyecto proyecto = proyectoService.getItemById(tarea.getIdProyecto()).getBody();
					proyectoButton.setText(proyecto.getNombre());
				} catch (Exception e) {
					proyectoButton.setText(String.valueOf(tarea.getIdProyecto()));
					logger.error("Error obtaining project from task", e);
				}
				proyectoButton.setCallbackData("ACCEPT_TASK " + tarea.getNombre() + "/" + tarea.getIdTarea());
				rowInline.add(proyectoButton);

				rowsInline.add(rowInline);
			}

			InlineKeyboardButton mainManagerMenuButton = new InlineKeyboardButton();
			mainManagerMenuButton.setText("Back to manager main menu");
			mainManagerMenuButton.setCallbackData("BACK_TO_MANAGER_MAIN_MENU");
			List<InlineKeyboardButton> backRow = new ArrayList<>();
			backRow.add(mainManagerMenuButton);
			rowsInline.add(backRow);

			inlineKeyboardMarkup.setKeyboard(rowsInline);

			SendMessage messageToTelegram = new SendMessage();
			messageToTelegram.setChatId(chatId);
			messageToTelegram.setText("Listing all not accepted tasks:");
			messageToTelegram.setReplyMarkup(inlineKeyboardMarkup);
			execute(messageToTelegram);

			// Mensaje con instrucciones para aceptar una tarea
			BotHelper.sendMessageToTelegram(chatId, "Click on the name of the task you want to accept", this);

		} catch (TelegramApiException e) {
			logger.error(e.getLocalizedMessage(), e);
		} catch (Exception e) {
			logger.error("Error obtaining not accepted tasks", e);
		}
	}

	private void showManagerProjectsForNotAcceptedTasks(long chatId){

		ResponseEntity<Usuario> usuario = usuarioService.getItemByTelegramId(userTelegramId);

		try {
			if(usuario.getBody() != null){
				Usuario userManager = usuario.getBody();
				List<Proyecto> proyectosDelManager = proyectoService.findAllProjectsForManager(userManager.getID());
	
				InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
				List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
	
				// Agregar el primer renglón con el título
				List<InlineKeyboardButton> titleRow = new ArrayList<>();
				InlineKeyboardButton titleButton = new InlineKeyboardButton();
				titleButton.setText("Projects list");
				titleButton.setCallbackData("NO_ACTION");
				titleRow.add(titleButton);
				rowsInline.add(titleRow);
	
				for (Proyecto proy : proyectosDelManager) {
					List<InlineKeyboardButton> rowInline = new ArrayList<>();
					InlineKeyboardButton proyButton = new InlineKeyboardButton();
					proyButton.setText(proy.getNombre());
					proyButton.setCallbackData("SEE_NOT_ACCEPTED " + proy.getID());
					rowInline.add(proyButton);
					rowsInline.add(rowInline);
				}
	
				InlineKeyboardButton mainManagerMenuButton = new InlineKeyboardButton();
				mainManagerMenuButton.setText("Back to manager main menu");
				mainManagerMenuButton.setCallbackData("BACK_TO_MANAGER_MAIN_MENU");
				List<InlineKeyboardButton> backRow = new ArrayList<>();
				backRow.add(mainManagerMenuButton);
				rowsInline.add(backRow);
	
				inlineKeyboardMarkup.setKeyboard(rowsInline);
	
				SendMessage messageToTelegram = new SendMessage();
				messageToTelegram.setChatId(chatId);
				messageToTelegram.setText("Select project to see the respective not accepted tasks:");
				messageToTelegram.setReplyMarkup(inlineKeyboardMarkup);
				execute(messageToTelegram);
			}
		} catch (TelegramApiException e) {
			logger.error(e.getLocalizedMessage(), e);
		} catch (Exception e) {
			logger.error("Error obtaining not accepted tasks", e);
		}
	}

	private void showManageProjects(long chatId){
		SendMessage messageToTelegram = new SendMessage();
		messageToTelegram.setChatId(chatId);
		messageToTelegram.setText(BotMessages.MANAGE_PROJECTS.getMessage());

		ReplyKeyboardMarkup keyboardMarkup = new ReplyKeyboardMarkup();
		List<KeyboardRow> keyboard = new ArrayList<>();

		// First row
		KeyboardRow row = new KeyboardRow();
		row.add(BotLabels.CREATE_PROJECT.getLabel());
		row.add(BotLabels.DELETE_PROJECT.getLabel());
		keyboard.add(row);

		// Second row
		row = new KeyboardRow();
		row.add(BotLabels.EDIT_PROJECT.getLabel());
		keyboard.add(row);

		keyboardMarkup.setKeyboard(keyboard);
		messageToTelegram.setReplyMarkup(keyboardMarkup);

		try {
			execute(messageToTelegram);
		} catch (TelegramApiException e) {
			logger.error(e.getLocalizedMessage(), e);
		}
	}

	private void editProject(long chatId) {
		ResponseEntity<Usuario> usuario = usuarioService.getItemByTelegramId(userTelegramId);
		
		try {
			Usuario userManager = usuario.getBody();
			// Obtener la lista de proyectos
			List<Proyecto> proyectos = proyectoService.findAllProjectsForManager(userManager.getID());
	
			// Crear el teclado en línea
			InlineKeyboardMarkup inlineKeyboardMarkup = new InlineKeyboardMarkup();
			List<List<InlineKeyboardButton>> rowsInline = new ArrayList<>();
	
			// Agregar un botón por cada proyecto
			for (Proyecto proy : proyectos) {
				List<InlineKeyboardButton> rowInline = new ArrayList<>();
				InlineKeyboardButton proyectoButton = new InlineKeyboardButton();
				proyectoButton.setText(proy.getNombre()); // Texto del botón
				proyectoButton.setCallbackData("EDIT_PROJECT " + proy.getID()); // Callback data
				rowInline.add(proyectoButton);
				rowsInline.add(rowInline);
			}
	
			// Asignar las filas de botones al teclado
			inlineKeyboardMarkup.setKeyboard(rowsInline);
	
			// Crear el mensaje con el teclado en línea
			SendMessage messageToTelegram = new SendMessage();
			messageToTelegram.setChatId(chatId); // Asignar el chatId
			messageToTelegram.setText("Select the project you want to modify"); // Texto del mensaje
			messageToTelegram.setReplyMarkup(inlineKeyboardMarkup); // Asignar el teclado en línea
	
			// Enviar el mensaje
			execute(messageToTelegram);
		} catch (TelegramApiException e) {
			logger.error("Error obtaining the list of projects", e);
		}
	}

	private void saveChatState(long chatId, String state, int tareaId) {
		chatStateMap.put(chatId, state);
		chatTareaIdMap.put(chatId, tareaId);
	}

	private void clearChatState(long chatId) {
		chatStateMap.remove(chatId);
		chatTareaIdMap.remove(chatId);
		chatPreviousMenuMap.remove(chatId); // Limpiar también el menú anterior
	}

	private String idColumnaStringReturn(int idColumna){
		String nombre = " ";
		switch(idColumna){
			case 1:
				nombre = "Pending";
				break;
			case 2:
				nombre = "Doing";
				break;
			case 3:
				nombre = "Done";
				break;	
		}
		return nombre;
	}

	@Override
	public String getBotUsername() {
		return botName;
	}
}