-- Insertar roles
INSERT INTO TODOUSER.rol (nombre)
VALUES ('Front-End Developer');

INSERT INTO TODOUSER.rol (nombre)
VALUES ('Back-End Developer');

INSERT INTO TODOUSER.rol (nombre)
VALUES ('Full-Stack Developer');

-- Insertar columnas
INSERT INTO TODOUSER.columnasTareas (descripcion)
VALUES ('Pending');

INSERT INTO TODOUSER.columnasTareas (descripcion)
VALUES ('Doing');

INSERT INTO TODOUSER.columnasTareas (descripcion)
VALUES ('Done');

-- Insertar usuarios
INSERT INTO TODOUSER.usuario (usuario, nombre, correo, telefono, pass)
VALUES ('dani123', 'Daniela Balderas', 'A00837085@tec.mx', '5281000001', '123');

INSERT INTO TODOUSER.usuario (usuario, nombre, correo, telefono, pass)
VALUES ('dora123', 'Dora García', 'A01541311@tec.mx', '5281000002', '123');

INSERT INTO TODOUSER.usuario (usuario, nombre, correo, telefono, pass)
VALUES ('carlos123', 'Carlos Saldaña', 'A01285600@tec.mx', '5281000003', '123');

INSERT INTO TODOUSER.usuario (usuario, nombre, correo, telefono, pass)
VALUES ('rodrigo123', 'Rodrigo Aguilar', 'A01285921@tec.mx', '5281000004', '123');

INSERT INTO TODOUSER.usuario (usuario, nombre, correo, telefono, pass, manager)
VALUES ('eladmin', 'El Admin', 'admin@oracle.com', '528100005', 'admin', 1);

-- Insertar proyecto
INSERT INTO TODOUSER.proyecto (id_manager, nombre, descripcion)
VALUES (5, 'React Task Manager with Oracle Java Bot', 'Herramienta para mejorar la organización de proyectos de software con metodología ágil, usando React y un bot de Telegram con Java');

-- Insertar equipo
INSERT INTO TODOUSER.equipo (id_proyecto, nombreEquipo, descripcionEquipo, numIntegrantesEquipo)
VALUES (1, 'D2CR', 'Grupo para el semestre FJ25', 4);

-- Insertar usuarios en equipo
INSERT INTO TODOUSER.integrantes_equipo (id_equipo, id_usuario, id_rol)
VALUES (1, 1, 3);

INSERT INTO TODOUSER.integrantes_equipo (id_equipo, id_usuario, id_rol)
VALUES (1, 2, 3);

INSERT INTO TODOUSER.integrantes_equipo (id_equipo, id_usuario, id_rol)
VALUES (1, 3, 3);

INSERT INTO TODOUSER.integrantes_equipo (id_equipo, id_usuario, id_rol)
VALUES (1, 4, 3);

-- Insertar sprints con completado 
INSERT INTO TODOUSER.sprints (id_proyecto, nombre, descripcion, fechaInicio, fechaFin, completado)
VALUES (1, 'Sprint 1', 'Sprint primera semana', TO_DATE('2025-02-10', 'YYYY-MM-DD'), TO_DATE('2025-02-16', 'YYYY-MM-DD'), 0);

INSERT INTO TODOUSER.sprints (id_proyecto, nombre, descripcion, fechaInicio, fechaFin, completado)
VALUES (1, 'Sprint 2', 'Sprint segunda semana', TO_DATE('2025-02-17', 'YYYY-MM-DD'), TO_DATE('2025-02-23', 'YYYY-MM-DD'), 0);

INSERT INTO TODOUSER.sprints (id_proyecto, nombre, descripcion, fechaInicio, fechaFin, completado)
VALUES (1, 'Sprint 3', 'Sprint tercera semana', TO_DATE('2025-02-24', 'YYYY-MM-DD'), TO_DATE('2025-03-02', 'YYYY-MM-DD'), 0);

INSERT INTO TODOUSER.sprints (id_proyecto, nombre, descripcion, fechaInicio, fechaFin, completado)
VALUES (1, 'Sprint 4', 'Sprint cuarta semana', TO_DATE('2025-03-03', 'YYYY-MM-DD'), TO_DATE('2025-03-09', 'YYYY-MM-DD'), 0);


-- Insertar tareas
-- Sprint 1
INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 1, 1, 'Creación Cuenta Cloud - Daniela', 'Crear Cuenta de OCI con correo institucional y aceptar los créditos gratuitos', TO_DATE('2025-02-12', 'YYYY-MM-DD'), 2, 1, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 1, 1, 'Instalación de Docker y comprensión de Docker - Daniela', 'Crear Cuenta de OCI con correo institucional y aceptar los créditos gratuitos', TO_DATE('2025-02-12', 'YYYY-MM-DD'), 2, 9, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 1, 1, 'Tarea Boda Playa - Daniela', 'Buscar información en internet acerca de precios reales para crear un presupuesto y ayuda en el formato del excel', TO_DATE('2025-02-13', 'YYYY-MM-DD'), 2, 2, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 1, 1, 'Creación Cuenta Cloud - Dora', 'Crear Cuenta de OCI con correo institucional y aceptar los créditos gratuitos', TO_DATE('2025-02-12', 'YYYY-MM-DD'), 2, 1, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 1, 1, 'Instalación de Docker y comprensión de Docker - Dora', 'Crear Cuenta de OCI con correo institucional y aceptar los créditos gratuitos', TO_DATE('2025-02-12', 'YYYY-MM-DD'), 2, 9, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 1, 1, 'Tarea Boda Playa - Dora', 'Registrar los presupuestos encontrado en internet en una tabla de excel', TO_DATE('2025-02-13', 'YYYY-MM-DD'), 2, 2, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 1, 1, 'Creación Cuenta Cloud - Rodrigo', 'Crear Cuenta de OCI con correo institucional y aceptar los créditos gratuitos', TO_DATE('2025-02-12', 'YYYY-MM-DD'), 2, 1, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 1, 1, 'Instalación de Docker y comprensión de Docker - Rodrigo', 'Crear Cuenta de OCI con correo institucional y aceptar los créditos gratuitos', TO_DATE('2025-02-12', 'YYYY-MM-DD'), 2, 9, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 1, 1, 'Bosquejo ER - Rodrigo', 'Realizar el bosquejo en clase en Lucidchart sobre el modelo de la base de datos', TO_DATE('2025-02-14', 'YYYY-MM-DD'), 2, 1, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 1, 1, 'Tarea Boda Playa - Rodrigo', 'Buscar información en internet acerca de precios reales para crear un presupuesto y ayuda en el formato del excel', TO_DATE('2025-02-13', 'YYYY-MM-DD'), 2, 2, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 1, 1, 'Creación Cuenta Cloud - Carlos', 'Crear Cuenta de OCI con correo institucional y aceptar los créditos gratuitos', TO_DATE('2025-02-12', 'YYYY-MM-DD'), 2, 1, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 1, 1, 'Instalación de Docker y comprensión de Docker - Carlos', 'Crear Cuenta de OCI con correo institucional y aceptar los créditos gratuitos', TO_DATE('2025-02-12', 'YYYY-MM-DD'), 2, 9, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 1, 1, 'Bosquejo ER - Carlos', 'Realizar el bosquejo en clase en Lucidchart sobre el modelo de la base de datos', TO_DATE('2025-02-14', 'YYYY-MM-DD'), 2, 1, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 1, 1, 'Tarea Boda Playa - Carlos', 'Buscar información en internet acerca de precios reales para crear un presupuesto y ayuda en el formato del excel', TO_DATE('2025-02-13', 'YYYY-MM-DD'), 2, 2, 2, 1);

-- Sprint 2
INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 2, 1, 'Instalación de Maven y JAVA - Daniela', 'Configurar el ambiente local para código JAVA', TO_DATE('2025-02-19', 'YYYY-MM-DD'), 2, 2,3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 2, 1, 'Certificación OCI - Daniela', 'Sacar la certificación de OCI', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 9, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 2, 1, 'Practica Linux - Daniela', 'Práctica de comandos de Linux durante la clase', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 1, 1, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 2, 1, 'OCI Environment Workshop - Daniela', 'Completar el workshop para desplegar la aplicación ToDoList dentro de OCI', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 4, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 2, 1, 'Creación de Mockup - Daniela', 'Desarrollo del primer diseño base del mockup de la página web', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 4, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 2, 1, 'Despliegue local de repositorio inicial con Docker - Daniela', 'Copiar el repositorio en la computadora y seguir las instrucciones para crear las imágenes después de los cambios y mandarlas a OCI para su posterior deploy', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 3, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 2, 1, 'Creación de EDT/WBS - Daniela', 'Desarrollo de la estructura de desglose del trabajo', TO_DATE('2025-02-24', 'YYYY-MM-DD'), 2, 4, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (1, 3, 2, 1, 'Modelando al usuario - Daniela', 'Identificar las tareas del Manager y Developer y crear su viaje del usuario ', TO_DATE('2025-02-24', 'YYYY-MM-DD'), 2, 4, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 2, 1, 'Instalación de Maven y JAVA - Dora', 'Configurar el ambiente local para código JAVA', TO_DATE('2025-02-19', 'YYYY-MM-DD'), 2, 2,3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 2, 1, 'Certificación OCI - Dora', 'Sacar la certificación de OCI', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 9, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 2, 1, 'Practica Linux - Dora', 'Práctica de comandos de Linux durante la clase', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 1, 1, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 2, 1, 'OCI Environment Workshop - Dora', 'Completar el workshop para desplegar la aplicación ToDoList dentro de OCI', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 4, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 2, 1, 'Despliegue local de repositorio inicial con Docker - Dora', 'Copiar el repositorio en la computadora y seguir las instrucciones para crear las imágenes después de los cambios y mandarlas a OCI para su posterior deploy', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 3, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 2, 1, 'Creación de Mockup - Dora', 'Desarrollo del primer diseño base del mockup de la página web', TO_DATE('2025-02-22', 'YYYY-MM-DD'), 2, 4, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (2, 3, 2, 1, 'Modelando al usuario - Dora', 'Creación de los viajes de usuario para el Chatbot y la página web', TO_DATE('2025-02-24', 'YYYY-MM-DD'), 2, 3, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Tarea Obtención de Información - Rodrigo', 'Desarrollo del proceso de obtención de información de las primeras 2 semanas del proyecto', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 1, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Instalación de Maven y JAVA - Rodrigo', 'Configurar el ambiente local para código JAVA', TO_DATE('2025-02-19', 'YYYY-MM-DD'), 2, 2,3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Certificación OCI - Rodrigo', 'Sacar la certificación de OCI', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 9, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Practica Linux - Rodrigo', 'Práctica de comandos de Linux durante la clase', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 1, 1, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'OCI Environment Workshop - Rodrigo', 'Completar el workshop para desplegar la aplicación ToDoList dentro de OCI', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 4, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Modelo ER dentro de ATP DB', 'Terminar el modelo ER y crear las tablas dentro de OCI para generar el DDL y DML', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 4, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Desarrollo de los menús del bot de Telegram y detalles en vistas de Web ', 'Creación de los diagramas de menús del bot de Telegram, las diferentes funcionalidades que tendrá el bot junto con la aplicación Web y mejora de detalles en las vistas de Tablero, Proyectos y notificaciones', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 5, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Despliegue local de repositorio inicial con Docker - Rodrigo', 'Copiar el repositorio en la computadora y seguir las instrucciones para crear las imágenes después de los cambios y mandarlas a OCI para su posterior deploy', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 3, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 2, 1, 'Tarea Obtención de Información - Carlos', 'Desarrollo del proceso de obtención de información de las primeras 2 semanas del proyecto', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 1, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 2, 1, 'Instalación de Maven y JAVA - Carlos', 'Configurar el ambiente local para código JAVA', TO_DATE('2025-02-19', 'YYYY-MM-DD'), 2, 2,3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 2, 1, 'Certificación OCI - Carlos', 'Sacar la certificación de OCI', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 9, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 2, 1, 'Practica Linux - Carlos', 'Práctica de comandos de Linux durante la clase', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 1, 1, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 2, 1, 'OCI Environment Workshop - Carlos', 'Completar el workshop para desplegar la aplicación ToDoList dentro de OCI', TO_DATE('2025-02-17', 'YYYY-MM-DD'), 2, 4, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 2, 1, 'Modelando al usuario - Carlos', 'Identificar las tareas del Manager y Developer y crear su viaje del usuario ', TO_DATE('2025-02-24', 'YYYY-MM-DD'), 2, 4, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 2, 1, 'Modelo ER dentro de ATP DB', 'Terminar el modelo ER y crear las tablas dentro de OCI para generar el DDL y DML', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 4, 2, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (3, 3, 2, 1, 'Despliegue local de repositorio inicial con Docker - Carlos', 'Copiar el repositorio en la computadora y seguir las instrucciones para crear las imágenes después de los cambios y mandarlas a OCI para su posterior deploy', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 3, 3, 1);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Prueba de Tarea no Aceptada', 'Descripcion de Tarea No Aceptada 1', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 3, 3, 0);

INSERT INTO TODOUSER.tarea (id_usuario, id_columna, id_sprint, id_proyecto, nombre, descripcion, fechaVencimiento, storyPoints, tiempoReal, prioridad, aceptada)
VALUES (4, 3, 2, 1, 'Prueba de Tarea no Aceptada 2', 'Descripcion de Tarea No Aceptada 2', TO_DATE('2025-02-20', 'YYYY-MM-DD'), 2, 3, 3, 0);