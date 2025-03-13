package com.springboot.MyTodoList.util;

public enum BotMessages {
	
	HELLO_MANAGER(
	"Hello Manager! I'm Tasko!\nPlease select on of the option below to continue."),
	HELLO_DEVELOPER(
	"Hello Developer! I'm Tasko!\nPlease select on of the option below to continue."),
	BOT_REGISTERED_STARTED("Bot registered and started succesfully!"),
	MANAGE_PROJECTS("You have selected the option to manage all your projects, please select an option below: "),
	ITEM_DONE("Item done! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_UNDONE("Item undone! Select /todolist to return to the list of todo items, or /start to go to the main screen."), 
	ITEM_DELETED("Item deleted! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	TYPE_NEW_TODO_ITEM("Type a new todo item below and press the send button (blue arrow) on the rigth-hand side."),
	NEW_ITEM_ADDED("New item added! Select /todolist to return to the list of todo items, or /start to go to the main screen."),
	SELECT_USER_INTERFACE("Hi! Please select the corresponding menu: "),
	BYE("Bye! Select /start to resume!");

	private String message;

	BotMessages(String enumMessage) {
		this.message = enumMessage;
	}

	public String getMessage() {
		return message;
	}

}
