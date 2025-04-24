package com.springboot.MyTodoList.repository.TareaRespositories;

import java.time.OffsetDateTime;

import javax.persistence.EntityManager;
import javax.persistence.ParameterMode;
import javax.persistence.PersistenceContext;
import javax.persistence.StoredProcedureQuery;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.springboot.MyTodoList.model.Tarea;

public class TareaRepositoryCustomImpl implements TareaRepositoryCustom {
    private static final Logger logger = LoggerFactory.getLogger(TareaRepositoryCustomImpl.class);

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Tarea updateTareaProcedure(Tarea tarea) {
        try {
            StoredProcedureQuery query = entityManager.createStoredProcedureQuery("TODOUSER.UPDATE_TAREA");

            query.registerStoredProcedureParameter("p_id_tarea", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_id_proyecto", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_aceptada", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_nombre", String.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_descripcion", String.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_prioridad", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_id_usuario", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_id_columna", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_id_sprint", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_storypoints", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_tiemporeal", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_deleted", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_tiempoestimado", Integer.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_fechainicio", OffsetDateTime.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_fechavencimiento", OffsetDateTime.class, ParameterMode.IN);
            query.registerStoredProcedureParameter("p_fechacompletado", OffsetDateTime.class, ParameterMode.IN);

            ((org.hibernate.procedure.ParameterRegistration) query.getParameter("p_tiemporeal")).enablePassingNulls(true);
            ((org.hibernate.procedure.ParameterRegistration) query.getParameter("p_descripcion")).enablePassingNulls(true);
            ((org.hibernate.procedure.ParameterRegistration) query.getParameter("p_id_usuario")).enablePassingNulls(true);
            ((org.hibernate.procedure.ParameterRegistration) query.getParameter("p_id_sprint")).enablePassingNulls(true);
            ((org.hibernate.procedure.ParameterRegistration) query.getParameter("p_tiempoestimado")).enablePassingNulls(true);
            ((org.hibernate.procedure.ParameterRegistration) query.getParameter("p_fechainicio")).enablePassingNulls(true);
            ((org.hibernate.procedure.ParameterRegistration) query.getParameter("p_fechavencimiento")).enablePassingNulls(true);
            ((org.hibernate.procedure.ParameterRegistration) query.getParameter("p_fechacompletado")).enablePassingNulls(true);

            query.setParameter("p_id_tarea", tarea.getIdTarea());
            query.setParameter("p_id_proyecto", tarea.getIdProyecto());
            query.setParameter("p_aceptada", tarea.getAceptada());
            query.setParameter("p_nombre", tarea.getNombre());
            query.setParameter("p_descripcion", tarea.getDescripcion());
            query.setParameter("p_prioridad", tarea.getPrioridad());
            query.setParameter("p_id_usuario", tarea.getIdEncargado());
            query.setParameter("p_id_columna", tarea.getIdColumna());
            query.setParameter("p_id_sprint", tarea.getIdSprint());
            query.setParameter("p_storypoints", tarea.getStoryPoints());
            query.setParameter("p_tiemporeal", tarea.getTiempoReal() != null ? tarea.getTiempoReal() : null);
            query.setParameter("p_deleted", tarea.getDeleted());
            query.setParameter("p_tiempoestimado", tarea.getTiempoEstimado());
            query.setParameter("p_fechainicio", tarea.getfechaInicio());
            query.setParameter("p_fechavencimiento", tarea.getFechaVencimiento());
            query.setParameter("p_fechacompletado", tarea.getFechaCompletado());

            query.execute();

        } catch (Exception e) {
            logger.error("Error executing UPDATE_TAREA procedure: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update Tarea via procedure", e);
        }

        return tarea;
    }
}
