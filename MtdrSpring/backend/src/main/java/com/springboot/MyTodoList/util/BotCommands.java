package com.springboot.MyTodoList.util;

public enum BotCommands {

	LOGIN_COMMAND("/login"), 
	HIDE_COMMAND("/hide"), 
	TODO_LIST("/todolist"),
	START("/start"),
	ADD_ITEM("/additem");

	private String command;

	BotCommands(String enumCommand) {
		this.command = enumCommand;
	}

	public String getCommand() {
		return command;
	}
}
