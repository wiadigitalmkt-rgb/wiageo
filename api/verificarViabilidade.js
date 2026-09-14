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

  const { data: clientes, error: clientesError } = await supabaseAdmin
    .from('clientes_fibra')
    .select('nome, porta_conectada, pppoe')
    .eq('id_cto', id_cto);
  if (clientesError) throw clientesError;

  const totalPortas = parseInt(cto.splitter.split('x')[1], 10);
  const portasOcupadas = clientes.length;

  let status;
  if (cto.status === 'manutencao') status = 'Em manutenção';
  else if (portasOcupadas >= totalPortas) status = 'Lotada';
  else status = 'Disponível';

  return {
    success: true,
    data: {
      cto_codigo: cto.codigo,
      potencia: cto.potencia,
      splitter: cto.splitter,
      status_operacional: cto.status || 'ativo',
      total_portas: totalPortas,
      portas_ocupadas: portasOcupadas,
      portas_livres: totalPortas - portasOcupadas,
      percentual_ocupacao: Math.round((portasOcupadas / totalPortas) * 100),
      status,
      clientes: clientes
        .sort((a, b) => a.porta_conectada - b.porta_conectada)
        .map((c) => ({ nome: c.nome, porta: c.porta_conectada, pppoe: c.pppoe })),
    },
  };
});
