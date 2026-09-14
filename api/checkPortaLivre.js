import { supabaseAdmin, withHandler } from './_supabase.js';

export default withHandler(async (req, { empresa }) => {
  const { id_cto } = req.body || {};
  if (!id_cto) {
    const err = new Error('id_cto is required');
    err.status = 400;
    throw err;
  }

  const { data: cto, error: ctoError } = await supabaseAdmin
    .from('ctos')
    .select('*')
    .eq('id', id_cto)
    .eq('empresa_id', empresa.id)
    .maybeSingle();
  if (ctoError) throw ctoError;
  if (!cto) {
    const err = new Error('CTO not found');
    err.status = 404;
    throw err;
  }

  const totalPortas = parseInt(cto.splitter.split('x')[1], 10);

  const { data: clientes, error: clientesError } = await supabaseAdmin
    .from('clientes_fibra')
    .select('porta_conectada')
    .eq('id_cto', id_cto);
  if (clientesError) throw clientesError;

  const portasOcupadas = clientes.length;
  const portasLivres = totalPortas - portasOcupadas;
  const portasUsadas = clientes.map((c) => c.porta_conectada).sort((a, b) => a - b);
  const todasPortas = Array.from({ length: totalPortas }, (_, i) => i + 1);
  const portasDisponiveis = todasPortas.filter((p) => !portasUsadas.includes(p));

  return {
    success: true,
    data: {
      cto_codigo: cto.codigo,
      splitter: cto.splitter,
      total_portas: totalPortas,
      portas_ocupadas: portasOcupadas,
      portas_livres: portasLivres,
      portas_disponiveis: portasDisponiveis,
      portas_usadas: portasUsadas,
      percentual_ocupacao: Math.round((portasOcupadas / totalPortas) * 100),
    },
  };
});
