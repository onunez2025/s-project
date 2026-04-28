const supabaseUrl = 'https://bedfqfvakcnfemjrztgu.supabase.co';
const supabaseKey = 'sb_publishable_LhZaMW6mITqlC_Z5rPzbZA_ftL8CKQI';

async function fixProjects() {
  const diegoId = 5;
  const oscarId = 11;
  const projectIds = [42, 43, 44, 45, 46, 47, 49];

  for (const pid of projectIds) {
    console.log(`Fixing project ${pid}...`);

    // 1. Ensure Diego is Leader (already should be, but let's be sure)
    await fetch(`${supabaseUrl}/rest/v1/project_area_config?project_id=eq.${pid}`, {
      method: 'PATCH',
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ leader_id: diegoId })
    });

    // 2. Ensure Oscar is in Team Members
    // First, check if he's already there
    const teamRes = await fetch(`${supabaseUrl}/rest/v1/project_team_members?project_id=eq.${pid}&user_id=eq.${oscarId}`, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
    });
    const teamData = await teamRes.json();
    if (teamData.length === 0) {
      await fetch(`${supabaseUrl}/rest/v1/project_team_members`, {
        method: 'POST',
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: pid, user_id: oscarId })
      });
    }

    // 3. Update Activities: set Oscar as responsible and status as REALIZADA
    await fetch(`${supabaseUrl}/rest/v1/activities?project_id=eq.${pid}`, {
      method: 'PATCH',
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        responsible_id: oscarId,
        status: 'REALIZADA',
        actual_start_date: '2026-04-01',
        actual_end_date: '2026-04-27'
      })
    });
  }
  console.log('Fix complete!');
}

fixProjects();
