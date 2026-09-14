import { supabase } from '@/lib/supabaseClient';
import { clearEmpresaIdCache } from '@/api/entities';

// Reimplementa a superfície de api.auth usando Supabase Auth, para que
// Login.jsx, Register.jsx, ResetPassword.jsx, ForgotPassword.jsx, Sidebar.jsx
// e AuthContext.jsx continuem funcionando sem reescrever cada tela.

async function me() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw Object.assign(new Error('Not authenticated'), { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, empresas(nome, slug, mkauth_url)')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name || null,
    role: profile?.role || 'user',
    empresa_id: profile?.empresa_id || null,
    empresa: profile?.empresas || null,
    // presença de empresa_id == usuário "registrado" de fato no app (ver AuthContext)
    _registered: Boolean(profile?.empresa_id),
  };
}

async function loginViaEmailPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

function loginWithProvider(provider, redirectPath = '/') {
  supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}${redirectPath}` },
  });
}

async function register({ email, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

async function verifyOtp({ email, otpCode }) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'signup' });
  if (error) throw error;
  return { access_token: data?.session?.access_token };
}

function setToken() {
  // No-op: supabase-js já persiste a sessão sozinho após verifyOtp/signIn.
}

async function resendOtp(email) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

async function resetPasswordRequest(email) {
  // Usa o e-mail/link padrão do Supabase (sem precisar customizar o template):
  // o link do "Reset your password" já embute os tokens de sessão e o Supabase
  // JS client (detectSessionInUrl: true) os captura sozinho ao abrir /reset-password.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

async function resetPassword({ newPassword }) {
  // A sessão de recuperação já foi estabelecida pelo supabase-js ao carregar
  // a página (a partir do #access_token=...&type=recovery na URL do link do
  // e-mail) — aqui só falta trocar a senha nessa sessão.
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

async function logout(returnUrl) {
  await supabase.auth.signOut();
  clearEmpresaIdCache();
  if (returnUrl) window.location.href = '/login';
}

function redirectToLogin(returnUrl) {
  const path = returnUrl ? `/login?returnTo=${encodeURIComponent(returnUrl)}` : '/login';
  window.location.href = path;
}

export const auth = {
  me,
  loginViaEmailPassword,
  loginWithProvider,
  register,
  verifyOtp,
  setToken,
  resendOtp,
  resetPasswordRequest,
  resetPassword,
  logout,
  redirectToLogin,
};
