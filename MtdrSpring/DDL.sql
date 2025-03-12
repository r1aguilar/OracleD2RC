CREATE TABLE TODOUSER.rol (
    id_rol NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(100) NOT NULL
);

CREATE TABLE TODOUSER.usuario (
    id_usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_telegram NUMBER(13,0),
    usuario VARCHAR2(100) NOT NULL,
    nombre VARCHAR2(200) NOT NULL,
    correo VARCHAR2(150) UNIQUE NOT NULL,
    telefono VARCHAR2(20) UNIQUE NOT NULL,
    pass VARCHAR2(255) NOT NULL,
    fechaCreacion DATE DEFAULT SYSDATE,
    manager NUMBER(1) DEFAULT 0 CHECK (manager IN (0,1)), 
    deleted NUMBER(1) DEFAULT 0 CHECK (deleted IN (0,1))
);

CREATE TABLE TODOUSER.proyecto (
    id_proyecto NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_manager NUMBER NOT NULL,
    nombre VARCHAR2(150) NOT NULL,
    descripcion VARCHAR2(255),
    deleted NUMBER(1) DEFAULT 0 CHECK (deleted IN (0,1)),
    FOREIGN KEY (id_manager) REFERENCES TODOUSER.usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE TODOUSER.equipo (
    id_equipo NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_proyecto NUMBER NOT NULL,
    nombreEquipo VARCHAR2(150) NOT NULL,
    descripcionEquipo VARCHAR2(255),
    numIntegrantesEquipo NUMBER DEFAULT 0 NOT NULL,
    deleted NUMBER(1) DEFAULT 0 CHECK (deleted IN (0,1)),
    FOREIGN KEY (id_proyecto) REFERENCES TODOUSER.proyecto(id_proyecto) ON DELETE CASCADE
);

CREATE TABLE TODOUSER.integrantes_equipo (
    id_equipo NUMBER NOT NULL,
    id_usuario NUMBER NOT NULL,
    id_rol NUMBER NOT NULL,
    PRIMARY KEY (id_equipo, id_usuario),
    FOREIGN KEY (id_equipo) REFERENCES TODOUSER.equipo(id_equipo) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES TODOUSER.usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES TODOUSER.rol(id_rol) ON DELETE CASCADE
);

CREATE TABLE TODOUSER.sprints (
    id_sprint NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_proyecto NUMBER NOT NULL,
    nombre VARCHAR2(150) NOT NULL,
    descripcion VARCHAR2(255),
    fechaInicio DATE NOT NULL,
    fechaFin DATE NOT NULL,
    completado NUMBER(1) DEFAULT 0 CHECK (completado IN (0,1)),
    deleted NUMBER(1) DEFAULT 0 CHECK (deleted IN (0,1)),
    FOREIGN KEY (id_proyecto) REFERENCES TODOUSER.proyecto(id_proyecto) ON DELETE CASCADE
);

CREATE TABLE TODOUSER.columnasTareas (
    id_columna NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    descripcion VARCHAR2(100) NOT NULL
);

CREATE TABLE TODOUSER.tarea (
    id_tarea NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_proyecto NUMBER NOT NULL,
    aceptada NUMBER(1) DEFAULT 1 CHECK (aceptada IN (0,1)) NOT NULL,
    nombre VARCHAR2(150) NOT NULL,
    descripcion VARCHAR2(255),
    prioridad NUMBER(1) CHECK (prioridad BETWEEN 1 AND 5),
    id_usuario NUMBER,
    id_columna NUMBER,
    id_sprint NUMBER,
    fechaInicio DATE DEFAULT SYSDATE,
    fechaVencimiento DATE,
    fechaCompletado VARCHAR2(150),
    storyPoints NUMBER,
    tiempoReal NUMBER,
    deleted NUMBER(1) DEFAULT 0 CHECK (deleted IN (0,1)),
    FOREIGN KEY (id_usuario) REFERENCES TODOUSER.usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_columna) REFERENCES TODOUSER.columnasTareas(id_columna) ON DELETE CASCADE,
    FOREIGN KEY (id_sprint) REFERENCES TODOUSER.sprints(id_sprint) ON DELETE CASCADE,
    FOREIGN KEY (id_proyecto) REFERENCES TODOUSER.proyecto(id_proyecto) ON DELETE CASCADE
);

CREATE TABLE TODOUSER.notificacion (
    id_notificacion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario NUMBER NOT NULL,
    fecha DATE DEFAULT SYSDATE,
    contenido VARCHAR2(250) NOT NULL,
    leido NUMBER(1) DEFAULT 0 CHECK (leido IN (0,1)) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES TODOUSER.usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE TODOUSER.tickets (
    id_ticket NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_tarea NUMBER NOT NULL,
    id_developer NUMBER NOT NULL,
    FOREIGN KEY (id_tarea) REFERENCES TODOUSER.tarea(id_tarea) ON DELETE CASCADE,
    FOREIGN KEY (id_developer) REFERENCES TODOUSER.usuario(id_usuario) ON DELETE CASCADE
);