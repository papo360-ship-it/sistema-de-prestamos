import { Eye, EyeOff, Landmark } from "lucide-react";
import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { user, login, loading, error: authError } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("admin@prestamos.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";
  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email.includes("@") || password.length < 6) {
      setError("Ingresa un correo valido y una contrasena de al menos 6 caracteres.");
      return;
    }

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible iniciar sesion.");
    }
  };

  return (
    <div className="grid min-h-screen bg-navy-950 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(36,99,235,.55),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(17,163,106,.35),transparent_22%)]" />
        <div className="relative">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-navy-950">
            <Landmark />
          </div>
          <h1 className="mt-8 max-w-xl text-6xl font-black tracking-tight">Sistema de Prestamos</h1>
          <p className="mt-5 max-w-lg text-lg text-blue-100">
            Control profesional de clientes, microcreditos, cuotas, pagos diarios, mora y reportes financieros.
          </p>
        </div>
        <div className="relative grid grid-cols-3 gap-4">
          {["Cobros diarios", "Mora automatica", "Roles seguros"].map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/10 p-5 font-bold backdrop-blur">
              {item}
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center bg-slate-50 p-6">
        <form onSubmit={handleSubmit} className="card w-full max-w-md p-7">
          <div className="mb-7">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-navy-500">Bienvenido</p>
            <h2 className="mt-2 text-3xl font-black text-ink">Inicia sesion</h2>
            <p className="mt-2 text-sm text-slate-500">Admin: admin@prestamos.com / admin123</p>
            <p className="text-sm text-slate-500">Cobrador: cobrador@prestamos.com / cobrador123</p>
          </div>
          <div className="space-y-4">
            <Field label="Correo o usuario">
              <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@negocio.com" />
            </Field>
            <Field label="Contrasena">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Tu contrasena"
                />
                <button type="button" className="absolute right-3 top-3 text-slate-400" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </Field>
            {authError ? <div className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-700">{authError}</div> : null}
            {error ? <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-danger">{error}</div> : null}
            <Button className="w-full" disabled={loading}>
              {loading ? "Validando..." : "Entrar al sistema"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
