// Envia um e-mail para uma lista de destinatários via API da Resend.
// RESEND_API_KEY e ALERT_FROM_EMAIL ficam em variáveis de ambiente na Vercel.
export async function sendAlertEmails(recipients, { subject, text, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM_EMAIL || 'WIAGEO Monitor <alertas@seudominio.com.br>';

  const results = await Promise.all(
    recipients.map(async (recipient) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let response;
        try {
          response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ from, to: [recipient], subject, text, html }),
          });
        } finally {
          clearTimeout(timeout);
        }
        const rawText = await response.text();
        if (!response.ok) return { recipient, success: false, error: rawText.substring(0, 200) };
        let data = {};
        try {
          data = rawText ? JSON.parse(rawText) : {};
        } catch {
          /* resposta sem corpo JSON — ok */
        }
        return { recipient, success: true, id: data.id };
      } catch (e) {
        return { recipient, success: false, error: e.message };
      }
    })
  );

  return {
    sent: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success),
  };
}

// Destinatários dos alertas de uma empresa: admins cadastrados no tenant.
// Cai para ALERT_FALLBACK_EMAIL se nenhum admin tiver e-mail (não deveria acontecer).
export async function getAlertRecipients(supabaseAdmin, empresaId) {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('email')
    .eq('empresa_id', empresaId)
    .in('role', ['admin', 'super_admin']);
  const emails = (data || []).map((p) => p.email).filter(Boolean);
  return emails.length ? emails : [process.env.ALERT_FALLBACK_EMAIL].filter(Boolean);
}
