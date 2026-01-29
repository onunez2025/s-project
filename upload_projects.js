
const URL = 'https://bedfqfvakcnfemjrztgu.supabase.co/rest/v1';
const KEY = 'sb_publishable_LhZaMW6mITqlC_Z5rPzbZA_ftL8CKQI';

const projects = [
    { name: "Culminación del proyecto FSM 2.0: asignación de reparaciones a CAS Lima", description: "Asignación de reparaciones a CAS Lima.", start_date: "2026-01-19", end_date: "2026-06-30", area_id: 5, leader_id: 5, team: [6] },
    { name: "Implementación del proyecto FSM 3.0: Generación de OS segmentadas", description: "Generación de OS segmentadas por marca (Rinnai, Sole, S.Collection) y optimización del sistema Crowd.", start_date: "2026-07-01", end_date: "2026-12-31", area_id: 5, leader_id: 5, team: [6] },
    { name: "Restructuración del esquema de bonificaciones del Taller", description: "Integración de KPIs de Experiencia al Cliente (CX) y Eficiencia Operativa para maximizar la facturación de técnicos y ayudantes.", start_date: "2026-02-01", end_date: "2026-03-31", area_id: 7, leader_id: 10, team: [5] },
    { name: "Optimización de la infraestructura del Taller de Servicio Técnico", description: "Renovación de herramientas y equipos para elevar la productividad y garantizar el cumplimiento de los estándares de producción.", start_date: "2026-02-01", end_date: "2026-10-31", area_id: 7, leader_id: 10, team: [8, 5] },
    { name: "Modernización del sistema de gestión del Taller (SIGWEB)", description: "Implementación de una nueva plataforma para la trazabilidad integral de servicios —desde la cotización y aprobación digital del cliente hasta la facturación final—.", start_date: "2026-02-01", end_date: "2026-10-31", area_id: 7, leader_id: 1, team: [9, 5] },
    { name: "Actualización del tarifario de reinstalaciones para todas las categorías", description: "Actualización del tarifario de reinstalaciones para todas las categorías de productos, aplicable para todos los CAS a nivel nacional.", start_date: "2026-01-19", end_date: "2026-02-28", area_id: 5, leader_id: 9, team: [5] },
    { name: "Actualización del tarifario de servicios para la red CAS a nivel nacional", description: "Inclusión y estandarización de precios para los servicios de Reparación con Materiales y Mantenimiento con Materiales.", start_date: "2026-01-19", end_date: "2026-02-28", area_id: 5, leader_id: 9, team: [5, 7] },
    { name: "Alineación estratégica de KPIs para bonificación CAS", description: "Ajuste de adendas y sistemas para un esquema dinámico basado en los objetivos 2026 (NPS, detractores, reprogramaciones y reincidencias).", start_date: "2026-01-19", end_date: "2026-02-28", area_id: 5, leader_id: 8, team: [5] },
    { name: "Despliegue del Sistema de Autorespuesta de Diagnósticos", description: "Solución basada en IA y WhatsApp para el soporte técnico a nivel nacional.", start_date: "2026-01-12", end_date: "2026-03-31", area_id: 5, leader_id: 1, team: [5] },
    { name: "Sistema de Trazabilidad y Rotulado", description: "Identificación y gestión del flujo de devoluciones (CxG y NC) hasta su disposición final en Calidad y Recuperados.", start_date: "2026-01-12", end_date: "2026-03-31", area_id: 5, leader_id: 1, team: [5] },
    { name: "Implementación del módulo de Liquidación de Servicios en AppSheet", description: "Automatización y control unificado de liquidación de pagos para la fuerza técnica propia y CAS a nivel nacional.", start_date: "2026-01-19", end_date: "2026-03-31", area_id: 5, leader_id: 8, team: [1, 5] },
    { name: "Diseño e Implementación del flujo de cierre operativo", description: "Incorporación del subproceso Liquidación de Productos, Servicios y/o Repuestos dentro del macroproceso de Atención de Servicios.", start_date: "2026-01-19", end_date: "2026-03-31", area_id: 5, leader_id: 9, team: [5] },
    { name: "Despliegue nacional SANGOMA", description: "Gestión integral de la interacción técnico-cliente, incluyendo programación de horarios, comunicaciones y auditoría de servicio.", start_date: "2026-01-19", end_date: "2026-02-28", area_id: 5, leader_id: 8, team: [5] },
    { name: "Implementación del esquema de incentivos y bitácora", description: "Implementación del esquema de incentivos y bitácora e histórico laboral.", start_date: "2026-03-01", end_date: "2026-03-31", area_id: 5, leader_id: 1, team: [5] },
    { name: "Migración Tecnológica: AppSheet a .Net y Angular", description: "Traspaso del ecosistema AppSheet a tecnologías .Net y Angular para optimizar la usabilidad, estabilidad y tiempos de respuesta.", start_date: "2026-02-01", end_date: "2026-11-30", area_id: 5, leader_id: 1, team: [5] }
];

async function run() {
    for (const p of projects) {
        console.log(`Inserting project: ${p.name}`);

        // 1. Insert Project
        const res = await fetch(`${URL}/projects`, {
            method: 'POST',
            headers: {
                'apikey': KEY,
                'Authorization': `Bearer ${KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                name: p.name,
                description: p.description,
                start_date: p.start_date,
                end_date: p.end_date,
                status: 'PLANIFICACION',
                progress: 0,
                budget: 0,
                currency: 'PEN'
            })
        });

        const data = await res.json();
        if (data && data.length > 0) {
            const projectId = data[0].id;

            // 2. Insert Area Config
            await fetch(`${URL}/project_area_config`, {
                method: 'POST',
                headers: {
                    'apikey': KEY,
                    'Authorization': `Bearer ${KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    project_id: projectId,
                    area_id: p.area_id,
                    leader_id: p.leader_id
                })
            });

            // 3. Insert Team
            if (p.team.length > 0) {
                const teamPayload = p.team.map(uid => ({
                    project_id: projectId,
                    user_id: uid
                }));
                await fetch(`${URL}/project_team_members`, {
                    method: 'POST',
                    headers: {
                        'apikey': KEY,
                        'Authorization': `Bearer ${KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(teamPayload)
                });
            }
        } else {
            console.error(`Failed to insert project: ${p.name}`, data);
        }
    }
    console.log('Done!');
}

run();
