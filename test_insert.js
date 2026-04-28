const supabaseUrl = 'https://bedfqfvakcnfemjrztgu.supabase.co';
const supabaseKey = 'sb_publishable_LhZaMW6mITqlC_Z5rPzbZA_ftL8CKQI';

async function run() {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/projects`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: 'Prueba Importa',
        description: 'Plataforma de prueba para importación de datos y validación de flujos.',
        status: 'EN_PROCESO',
        progress: 100,
        start_date: '2026-04-01',
        end_date: '2026-12-31',
        budget: 0,
        currency: 'PEN'
      })
    });
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data && data[0] && data[0].id) {
      const pid = data[0].id;
      // Area
      await fetch(`${supabaseUrl}/rest/v1/project_area_config`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: pid, area_id: 5, leader_id: 5 })
      });
      // Team
      await fetch(`${supabaseUrl}/rest/v1/project_team_members`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: pid, user_id: 5 })
      });
      
      // Activities
      const activities = [
        'Análisis de requerimientos',
        'Diseño de arquitectura',
        'Desarrollo de base de datos',
        'Implementación de API',
        'Desarrollo de Interfaz de Usuario',
        'Pruebas y QA',
        'Despliegue y Configuración'
      ].map((name, index) => ({
        project_id: pid,
        name: name,
        description: `Actividad completada para Prueba Importa`,
        status: 'COMPLETADO',
        progress: 100,
        order_index: index,
        start_date: '2026-04-01',
        end_date: '2026-12-31'
      }));

      await fetch(`${supabaseUrl}/rest/v1/activities`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(activities)
      });

      console.log('SUCCESS: Project ID', pid);
    } else {
      console.error('Failed to create project:', data);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
