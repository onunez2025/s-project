
const URL = 'https://bedfqfvakcnfemjrztgu.supabase.co/rest/v1';
const KEY = 'sb_publishable_LhZaMW6mITqlC_Z5rPzbZA_ftL8CKQI';

const projects = [
  {
    name: "Liquidaciones",
    description: "Automatización y control de pagos para fuerza técnica y CAS.",
    activities: [
      "Implementación de Workflow de aprobación de tickets para supervisores.",
      "Corrección de visibilidad de códigos de transferencia en el dashboard.",
      "Módulo de importación de tickets con validación de incidencias.",
      "Resolución de discrepancias masivas en transacciones SAP.",
      "Dashboard de casos especiales y limpieza de duplicados."
    ]
  },
  {
    name: "NC-CxG-Cancelaciones",
    description: "Gestión de notas de crédito, cambios por garantía y cancelaciones.",
    activities: [
      "Preservación de historial de comentarios en tickets (evitando sobrescritura).",
      "Implementación de interfaz SIATC UI para gestión operativa.",
      "Depuración de flujos de autenticación y control de roles.",
      "Auditoría y mapeo de procesos críticos SAP."
    ]
  },
  {
    name: "Devoluciones",
    description: "Trazabilidad de devoluciones hasta disposición final.",
    activities: [
      "Desarrollo de backend en server.ts para flujo de devoluciones.",
      "Lógica de trazabilidad para productos CxG y NC.",
      "Interfaz de registro para ingresos a almacén de calidad."
    ]
  },
  {
    name: "Tablero-Control",
    description: "Monitoreo de KPIs operativos y estratégicos.",
    activities: [
      "Herramienta de importación y comparación detallada de datos.",
      "Lógica de comparación v2 para validación de importaciones.",
      "Diseño de dashboard de indicadores operativos."
    ]
  },
  {
    name: "Valorizaciones",
    description: "Cálculo de valorizaciones de servicios y repuestos.",
    activities: [
      "Implementación de tarifarios nacionales dinámicos.",
      "Configuración de despliegue en Easypanel (Producción).",
      "Generación de reportes de valorización para finanzas."
    ]
  },
  {
    name: "Retail",
    description: "Gestión de operaciones en canales de venta retail.",
    activities: [
      "Configuración de infraestructura Docker y despliegue.",
      "API de sincronización de ventas y consulta de stocks en tiempo real."
    ]
  }
];

async function run() {
  for (const p of projects) {
    console.log(`Inserting project: ${p.name}`);
    try {
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
          start_date: '2026-01-01',
          end_date: '2026-12-31',
          status: 'EN_PROCESO',
          progress: 0,
          budget: 0,
          currency: 'PEN'
        })
      });

      const data = await res.json();
      if (data && data.length > 0) {
        const projectId = data[0].id;
        console.log(`Project created with ID: ${projectId}`);
        
        // Area Config (Area 5: Servicio Técnico, Leader 5: onunez)
        await fetch(`${URL}/project_area_config`, {
          method: 'POST',
          headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: projectId, area_id: 5, leader_id: 5 })
        });

        // Team Members (User 5: onunez)
        await fetch(`${URL}/project_team_members`, {
          method: 'POST',
          headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify([{ project_id: projectId, user_id: 5 }])
        });

        // Activities
        console.log(`Adding ${p.activities.length} activities...`);
        for (const actDesc of p.activities) {
          await fetch(`${URL}/activities`, {
            method: 'POST',
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: projectId,
              description: actDesc,
              responsible_id: 5,
              start_date: '2026-01-01',
              estimated_end_date: '2026-06-30',
              status: 'REALIZADA',
              actual_start_date: '2026-01-01',
              actual_end_date: '2026-04-27'
            })
          });
        }
        
        // Update progress
        await fetch(`${URL}/projects?id=eq.${projectId}`, {
          method: 'PATCH',
          headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ progress: 100 })
        });

      } else {
        console.error(`Failed to insert project: ${p.name}`, data);
      }
    } catch (err) {
      console.error(`Error in ${p.name}:`, err);
    }
  }
  console.log('Done!');
}

run();
