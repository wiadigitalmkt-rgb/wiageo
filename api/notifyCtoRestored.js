import { supabaseAdmin, withHandler } from './_supabase.js';
import { sendAlertEmails, getAlertRecipients } from './_email.js';

export default withHandler(async (req, { empresa }) => {
  const ctoId = req.body?.cto_id;
  if (!ctoId) {
    const err = new Error('cto_id is required');
    err.status = 400;
    throw err;
  }
  const onlineLogins = Array.isArray(req.body?.online_clients) ? req.body.online_clients : [];

  const { data: cto, error: ctoError } = await supabaseAdmin
    .from('ctos')
    .select('*')
    .eq('id', ctoId)
    .eq('empresa_id', empresa.id)
    .maybeSingle();
  if (ctoError) throw ctoError;
  if (!cto) {
    const err = new Error('CTO not found');
    err.status = 404;
    throw err;
  }

  const { data: clients, error: clientsError } = await supabaseAdmin
    .from('clientes_fibra')
    .select('nome, pppoe, endereco')
    .eq('id_cto', ctoId);
  if (clientsError) throw clientsError;

  const now = new Date();
  const dateTimeStr = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const onlineClients = clients.filter((c) => c.pppoe && onlineLogins.includes(c.pppoe));
  const allOnline = onlineClients.length === clients.length && clients.length > 0;

  const clientRows =
    clients.length > 0
      ? clients
          .map((c) => {
            const isOnline = c.pppoe && onlineLogins.includes(c.pppoe);
            const color = isOnline ? '#16a34a' : '#dc2626';
            const text = isOnline ? 'ONLINE' : 'OFFLINE';
            return `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;">${c.nome || '-'}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;">${c.pppoe || '-'}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;">${c.endereco || '-'}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;color:${color};font-weight:bold;">${text}</td></tr>`;
          })
          .join('')
      : '<tr><td colspan="4" style="padding:8px;text-align:center;">Nenhum cliente cadastrado.</td></tr>';

  const subject = `✅ SERVIÇO RESTAURADO: CTO ${cto.codigo} ONLINE`;

  const emailText = `✅ SERVIÇO RESTAURADO: Conectividade Normalizada em CTO

Status: ONLINE (NORMAL)
Data/Hora da Restauração: ${dateTimeStr}
ID da CTO: ${cto.codigo}
Localização/Endereço: ${cto.descricao || 'N/A'}

${allOnline ? 'Todos os clientes já estão online.' : `${onlineClients.length} de ${clients.length} clientes já estão online.`}

CLIENTES (Total: ${onlineClients.length} de ${clients.length})
${clients.map((c) => `${c.nome || '-'} | ${c.pppoe || '-'} | ${c.endereco || '-'} | ${c.pppoe && onlineLogins.includes(c.pppoe) ? 'ONLINE' : 'OFFLINE'}`).join('\n')}

Mensagem automática gerada pelo Sistema WIAGEO.`;

  const emailHtml = `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<div style="background:#16a34a;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;">
<h1 style="margin:0;font-size:18px;">✅ SERVIÇO RESTAURADO: CTO ONLINE</h1>
</div>
<div style="border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px;padding:20px;">
<table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
<tr><td style="padding:4px 0;font-weight:bold;">Status:</td><td style="padding:4px 0;color:#16a34a;font-weight:bold;">ONLINE (NORMAL) ✅</td></tr>
<tr><td style="padding:4px 0;font-weight:bold;">Restauração:</td><td style="padding:4px 0;">${dateTimeStr}</td></tr>
<tr><td style="padding:4px 0;font-weight:bold;">CTO:</td><td style="padding:4px 0;">${cto.codigo}</td></tr>
<tr><td style="padding:4px 0;font-weight:bold;">Endereço:</td><td style="padding:4px 0;">${cto.descricao || 'N/A'}</td></tr>
</table>
<h3 style="margin:16px 0 8px;color:#333;">Clientes (${clients.length})</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px;">
<thead><tr style="background:#f5f5f5;"><th style="padding:4px 8px;text-align:left;">Nome</th><th style="padding:4px 8px;text-align:left;">PPPoE</th><th style="padding:4px 8px;text-align:left;">Endereço</th><th style="padding:4px 8px;text-align:left;">Status</th></tr></thead>
<tbody>${clientRows}</tbody>
</table>
<p style="margin-top:20px;font-size:12px;color:#999;">Mensagem automática gerada pelo Sistema WIAGEO.</p>
</div></body></html>`;

  const recipients = await getAlertRecipients(supabaseAdmin, empresa.id);
  const { sent, failed } = await sendAlertEmails(recipients, { subject, text: emailText, html: emailHtml });

  return {
    success: true,
    cto_codigo: cto.codigo,
    clients_total: clients.length,
    clients_online: onlineClients.length,
    all_online: allOnline,
    recipients_count: recipients.length,
    sent,
    failed: failed.length,
    failed_details: failed,
  };
});
