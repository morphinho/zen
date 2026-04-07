import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import zenlifeLogo from "@/assets/zenlife-logo.svg";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <img src={zenlifeLogo} alt="ZenLife" className="h-8 animate-pulse" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: https://zeenlife.life/dashboard,
        },
      });

      if (error) throw error;

      toast.success("Provjerite svoju e-poštu za link za prijavu!");
    } catch (error: any) {
      toast.error(error.message || "Greška pri prijavi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-8">
      <img src={zenlifeLogo} alt="ZenLife" className="h-8 mb-2 object-contain" />
      <p className="text-sm text-muted-foreground font-body mb-10">Tvoja dobrobit, jednostavno</p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail adresa"
          required
          className="h-12 rounded-2xl bg-secondary border-0 px-4 text-sm font-body placeholder:text-muted-foreground/60"
        />
        <Button type="submit" variant="cta" className="w-full h-12 rounded-2xl text-sm" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Provjeravam...</span>
          ) : (
            <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Prijava putem e-maila</span>
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground font-body mt-8 text-center max-w-xs leading-relaxed">
        Unesite svoju e-mail adresu za pristup.
      </p>

    </div>
  );
};

export default Login;
