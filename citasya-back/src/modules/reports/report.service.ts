import { AppDataSource } from "../../data-source.js";

/**
 * Servicio para consultar las estadísticas y métricas del dashboard de reportes.
 */
export class ReportService {
    async getDashboardMetrics() {
        const query = `
            WITH 
            stats_citas AS (
                SELECT 
                    COALESCE(SUM(CASE WHEN date = CURRENT_DATE THEN 1 ELSE 0 END), 0) as citas_hoy,
                    COALESCE(SUM(CASE WHEN date = CURRENT_DATE - INTERVAL '1 day' THEN 1 ELSE 0 END), 0) as citas_ayer
                FROM appointment
            ),
            stats_ingresos AS (
                SELECT 
                    COALESCE(SUM(CASE WHEN a.date = CURRENT_DATE THEN s.price ELSE 0 END), 0) as ingresos_hoy,
                    COALESCE(SUM(CASE WHEN a.date = CURRENT_DATE - INTERVAL '1 day' THEN s.price ELSE 0 END), 0) as ingresos_ayer
                FROM appointment a
                LEFT JOIN services s ON a.service_id = s.id
                WHERE a.status = 'Concluida'
            ),
            stats_asistencia AS (
                SELECT
                    CASE 
                        WHEN SUM(CASE WHEN date_trunc('month', date) = date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END) = 0 THEN 0
                        ELSE (SUM(CASE WHEN date_trunc('month', date) = date_trunc('month', CURRENT_DATE) AND status = 'Concluida' THEN 1 ELSE 0 END)::float / 
                              SUM(CASE WHEN date_trunc('month', date) = date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END)) * 100 
                    END as asistencia_actual,
                    CASE 
                        WHEN SUM(CASE WHEN date_trunc('month', date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month') THEN 1 ELSE 0 END) = 0 THEN 0
                        ELSE (SUM(CASE WHEN date_trunc('month', date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND status = 'Concluida' THEN 1 ELSE 0 END)::float / 
                              SUM(CASE WHEN date_trunc('month', date) = date_trunc('month', CURRENT_DATE - INTERVAL '1 month') THEN 1 ELSE 0 END)) * 100 
                    END as asistencia_pasado
                FROM appointment
            ),
            stats_clientes_nuevos as (
                SELECT 
                    COALESCE(SUM(CASE WHEN primer_cita = CURRENT_DATE THEN 1 ELSE 0 END), 0) as clientes_hoy,
                    COALESCE(SUM(CASE WHEN primer_cita = CURRENT_DATE - INTERVAL '1 day' THEN 1 ELSE 0 END), 0) as clientes_ayer
                FROM (
                    SELECT client_id, MIN(date) as primer_cita 
                    FROM appointment 
                    GROUP BY client_id
                ) c
            )

            SELECT 
                (SELECT citas_hoy FROM stats_citas) as citas_hoy,
                (SELECT citas_ayer FROM stats_citas) as citas_ayer,
                (SELECT clientes_hoy FROM stats_clientes_nuevos) as clientes_nuevos_hoy,
                (SELECT clientes_ayer FROM stats_clientes_nuevos) as clientes_nuevos_ayer,
                (SELECT ingresos_hoy FROM stats_ingresos) as ingresos_hoy,
                (SELECT ingresos_ayer FROM stats_ingresos) as ingresos_ayer,
                (SELECT asistencia_actual FROM stats_asistencia) as asistencia_actual,
                (SELECT asistencia_pasado FROM stats_asistencia) as asistencia_pasado;
        `;

        const result = await AppDataSource.query(query);
        const data = result[0];

        const calcPct = (now: number, prev: number) => {
            if (prev === 0 && now > 0) return 100;
            if (prev === 0 && now === 0) return 0;
            return Math.round(((now - prev) / prev) * 100);
        };

        const ingHoy = Number(data.ingresos_hoy || 0);
        const ingAyer = Number(data.ingresos_ayer || 0);

        return {
            citasHoy: {
                value: Number(data.citas_hoy || 0),
                vsAyer: Number(data.citas_hoy || 0) - Number(data.citas_ayer || 0)
            },
            clientesNuevos: {
                value: Number(data.clientes_nuevos_hoy || 0),
                vsAyer: Number(data.clientes_nuevos_hoy || 0) - Number(data.clientes_nuevos_ayer || 0)
            },
            ingresosDia: {
                value: ingHoy,
                vsAyer: calcPct(ingHoy, ingAyer)
            },
            tasaAsistencia: {
                value: Math.round(Number(data.asistencia_actual || 0)),
                vsMesPasado: Math.round(Number(data.asistencia_actual || 0)) - Math.round(Number(data.asistencia_pasado || 0))
            }
        };
    }
}