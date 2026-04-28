const supabaseUrl = 'https://bedfqfvakcnfemjrztgu.supabase.co';
const supabaseKey = 'sb_publishable_LhZaMW6mITqlC_Z5rPzbZA_ftL8CKQI';

async function registerPruebaImporta() {
  const userId = 5; // onunez
  const areaId = 5; // Servicio Técnico
  
  const platform = {
    name: 'Prueba Importa',
    description: 'Plataforma de prueba para importación de datos y validación de flujos.',
    status: 'EN_PROCESO',
    progress: 100,
    start_date: '2026-04-01',
    end_date: '2026-12-31',
    color: '#6366f1',
    priority: 'MEDIA'
  };

  console.log('Creating project: Prueba Importa');
  
  const projectResponse = await fetch(`${supabaseUrl}/rest/v1/projects?select=id`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(platform)
  });

  const projectData = await projectResponse.json();
  if (!projectData || projectData.length === 0) {
    console.error('Failed to create project:', projectData);
    return;
  }
  const projectId = projectData[0].id;
  console.log(`Project created with ID: ${projectId}`);

  // 2. Link to Area
  await fetch(`${supabaseUrl}/rest/v1/project_area_config`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_id: projectId,
      area_id: areaId,
      leader_id: userId
    })
  });

  // 3. Add to Team
  await fetch(`${supabaseUrl}/rest/v1/project_team_members`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_id: projectId,
      user_id: userId
    })
  });

  // 4. Create Activities
  const activities = [
    'Análisis de requerimientos',
    'Diseño de arquitectura',
    'Desarrollo de base de datos',
    'Implementación de API',
    'Desarrollo de Interfaz de Usuario',
    'Pruebas y QA',
    'Despliegue y Configuración'
  ].map((name, index) => ({
    project_id: projectId,
    name: name,
    description: `Actividad completada para el proyecto ${platform.name}`,
    status: 'COMPLETADO',
    progress: 100,
    order_index: index,
    start_date: platform.start_date,
    end_date: platform.end_date
  }));

  await fetch(`${supabaseUrl}/rest/v1/activities`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(activities)
  });

  console.log('All done for Prueba Importa!');
}

registerPruebaImporta();
