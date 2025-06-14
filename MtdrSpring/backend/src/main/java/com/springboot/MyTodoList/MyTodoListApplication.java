package com.springboot.MyTodoList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

import com.springboot.MyTodoList.controller.BotController;
import com.springboot.MyTodoList.service.ChatStateService;
import com.springboot.MyTodoList.service.EquipoService;
import com.springboot.MyTodoList.service.IntegrantesEquipoService;
import com.springboot.MyTodoList.service.ProyectoService;
import com.springboot.MyTodoList.service.SprintsService;
import com.springboot.MyTodoList.service.TareaService;
import com.springboot.MyTodoList.service.ToDoItemService;
import com.springboot.MyTodoList.service.UsuarioService;
import com.springboot.MyTodoList.util.BotMessages;

@SpringBootApplication
public class MyTodoListApplication implements CommandLineRunner {

	private static final Logger logger = LoggerFactory.getLogger(MyTodoListApplication.class);

	@Autowired
	private ToDoItemService toDoItemService;
	@Autowired
	private UsuarioService usuarioService;
	@Autowired
	private TareaService tareaService;
	@Autowired
	private ProyectoService proyectoService;
	@Autowired
	private SprintsService sprintsService;
	@Autowired
	private IntegrantesEquipoService integrantesEquipoService;
	@Autowired
	private EquipoService equipoService;
	@Autowired
	private ChatStateService chatStateService;

	@Value("${telegram.bot.token}")
	private String telegramBotToken;

	@Value("${telegram.bot.name}")
	private String botName;

	public static void main(String[] args) {
		SpringApplication.run(MyTodoListApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		try {
			TelegramBotsApi telegramBotsApi = new TelegramBotsApi(DefaultBotSession.class);
			telegramBotsApi.registerBot(new BotController(telegramBotToken, botName, tareaService, usuarioService, proyectoService, sprintsService, integrantesEquipoService, equipoService));
			logger.info(BotMessages.BOT_REGISTERED_STARTED.getMessage());
		} catch (TelegramApiException e) {
			e.printStackTrace();
		}
	}
}
