import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/apiClient";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  // O link padrão de "Reset your password" do Supabase carrega esta página com
  // #access_token=...&type=recovery na URL. O supabase-js (detectSessionInUrl:
  // true) captura isso sozinho ao montar o client — aqui só esperamos esse
  // resultado aparecer (evento PASSWORD_RECOVERY ou uma sessão já ativa).
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      setValidLink(ok);
      setReady(true);
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") finish(true);
    });

    // Se o evento já tiver disparado antes deste componente montar, o hash
    // da URL já foi consumido — nesse caso uma sessão ativa é suficiente.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish(true);
    });

    // Sem evento nem sessão após um tempo curto: link inválido/expirado.
    const timeout = setTimeout(() => finish(false), 4000);

    return () => {
      listener?.subscription?.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword({ newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Não foi possível redefinir a senha");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <AuthLayout icon={Loader2} title="Verificando link..." subtitle="Só um instante">
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    );
  }

  if (!validLink) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Link inválido ou expirado"
        subtitle="Esse link de redefinição de senha não é mais válido"
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Solicitar um novo link
          </Link>
        }
      >
        <p className="text-sm text-foreground text-center">
          Peça um novo e-mail de redefinição de senha — os links expiram após um tempo ou já foram usados.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout icon={Lock} title="Nova senha" subtitle="Digite sua nova senha abaixo">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Redefinindo...
            </>
          ) : (
            "Redefinir senha"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
