import { supabaseAdmin, withHandler } from './_supabase.js';

// Observação: para operações simples de CRUD, prefira usar src/api/entities.js
// (via Supabase direto + RLS) no frontend. Esta function existe para o caso de
// uso original de busca por raio geográfico, que combina bem com uma function.
export default withHandler(async (req, { empresa }) => {
  const body = req.body || {};

  if (body.action === 'create') {
    const { data, error } = await supabaseAdmin
      .from('ctos')
      .insert({
        empresa_id: empresa.id,
        codigo: body.codigo,
        latitude: body.latitude,
        longitude: body.longitude,
        splitter: body.splitter,
        potencia: body.potencia,
        id_olt: body.id_olt,
        data_ultima_atualizacao: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  }

  if (body.action === 'list') {
    let query = supabaseAdmin.from('ctos').select('*').eq('empresa_id', empresa.id);
    const { data: ctosRaw, error } = await query;
    if (error) throw error;

    let ctos = ctosRaw;
    if (body.latitude && body.longitude && body.radius) {
      const centerLat = body.latitude;
      const centerLng = body.longitude;
      const radiusKm = body.radius;
      ctos = ctos.filter((cto) => {
        const dLat = ((cto.latitude - centerLat) * Math.PI) / 180;
        const dLng = ((cto.longitude - centerLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((centerLat * Math.PI) / 180) *
            Math.cos((cto.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371 * c <= radiusKm;
      });
    }
    return { success: true, data: ctos };
  }

  if (body.action === 'update') {
    const { data, error } = await supabaseAdmin
      .from('ctos')
      .update({ ...body.data, data_ultima_atualizacao: new Date().toISOString() })
      .eq('id', body.id)
      .eq('empresa_id', empresa.id)
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  }

  if (body.action === 'delete') {
    const { error } = await supabaseAdmin
      .from('ctos')
      .delete()
      .eq('id', body.id)
      .eq('empresa_id', empresa.id);
    if (error) throw error;
    return { success: true };
  }

  const err = new Error('Invalid action');
  err.status = 400;
  throw err;
});
