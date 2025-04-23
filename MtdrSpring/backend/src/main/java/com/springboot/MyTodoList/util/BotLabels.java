package com.springboot.MyTodoList.util;

public enum BotLabels {
	
	SHOW_MAIN_SCREEN("Show Main Screen"), 
	SHOW_MANAGER_MAIN_SCREEN("Show Manager Main Screen"), 
	SHOW_DEVELOPER_MAIN_SCREEN("Show Developer Main Screen"), 
	HIDE_MAIN_SCREEN("Hide Main Screen"),
	LIST_ALL_ITEMS("List All Items"), 
	ADD_NEW_ITEM("Add New Item"),
	DONE("DONE"),
	UNDO("UNDO"),
	DELETE("DELETE"),
	MY_TODO_LIST("MY TODO LIST"),
	MANAGE_PROJECTS("Manage Projects"),
	MANAGE_TEAMS("Manage Teams"),
	MANAGE_TASKS("Manage Tasks"),
	SHOW_NOT_ACCEPTED_TASKS("Show Not Accepted Tasks"),
	CREATE_PROJECT("Create Project"),
	DELETE_PROJECT("Delete Project"),
	EDIT_PROJECT("Edit Project"),
	VIEW_REPORTS("View Reports"),
	UPDATE_TASK_STATUS("Update Task Status"),
	CREATE_TASK_DEVELOPER("Propose Task"),
	VIEW_REMINDERS("View Reminders"),
	DEVELOPER("Developer"),
	MANAGER("Manager"),
	DASH("-");

	private String label;

	BotLabels(String enumLabel) {
		this.label = enumLabel;
	}

	public String getLabel() {
		return label;
	}

}
