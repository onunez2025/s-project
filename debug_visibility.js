import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bedfqfvakcnfemjrztgu.supabase.co';
const supabaseKey = 'sb_publishable_LhZaMW6mITqlC_Z5rPzbZA_ftL8CKQI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjects() {
  const userId = 5; // onunez
  
  // 1. Get user details to confirm roles/areas
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
    
  console.log('User:', JSON.stringify(user, null, 2));

  // 2. Load projects with joins (same as data.service.ts)
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      areaConfig:project_area_config(*),
      teamMembers:project_team_members(*)
    `)
    .order('id', { ascending: false });

  if (error) {
    console.error('Error loading projects:', error);
    return;
  }

  console.log('Total projects loaded from DB:', projects.length);

  // 3. Apply filter logic from data.service.ts
  const subordinateIds = []; // Simplified for now
  
  const filtered = projects.filter(p => {
    // Map teamIds like in data.service.ts
    const teamIds = p.teamMembers?.map(m => m.user_id) || [];
    
    const isLeader = p.areaConfig?.some(c => c.leader_id === userId);
    const isTeam = teamIds.includes(userId);
    const involvesMyArea = p.areaConfig?.some(c => user.area_ids?.includes(c.area_id));
    const isAreaManager = user.sub_role === 'GERENTE' && involvesMyArea;
    
    return isLeader || isTeam || isAreaManager;
  });

  console.log('Filtered projects for onunez:', filtered.length);
  
  filtered.forEach((p, i) => {
    const isLeader = p.areaConfig?.some(c => c.leader_id === userId);
    const isTeam = p.team_members?.some(m => m.user_id === userId);
    const roles = [];
    if (isLeader) roles.push('LEADER');
    if (isTeam) roles.push('TEAM');
    console.log(`${i+1}. [ID: ${p.id}] ${p.name} - Roles: ${roles.join(', ')}`);
  });
}

checkProjects();
