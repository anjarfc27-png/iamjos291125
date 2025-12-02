
const { createSupabaseServerClient } = require('@/lib/supabase/server');

async function checkMenus() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('navigation_menus').select('*');
    console.log('Menus:', data);
    console.log('Error:', error);
}

checkMenus();

