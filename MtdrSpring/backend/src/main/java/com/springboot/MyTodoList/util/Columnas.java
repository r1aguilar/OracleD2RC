package com.springboot.MyTodoList.util;

public enum Columnas {

	DONE("3"), 
	DOING("2"), 
	PENDING("1");

	private String idColumna;

	Columnas(String enumColumna) {
		this.idColumna = enumColumna;
	}

	public String getIdColumna() {
		return idColumna;
	}
}
