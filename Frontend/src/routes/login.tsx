import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Auth5 } from "@/components/ui/auth-5";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in â€” Agent Arena" },
      { name: "description", content: "Sign in to your Agent Arena workspace." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      toast.error("Please enter email and password");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully");
      navigate({ to: "/dashboard" });
    }
  };

  const handleInstantAccess = async () => {
    setIsLoading(true);
    const email = "demo@agentarena.com";
    const password = "password123";

    // Try to sign in first
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If fails (e.g. user does not exist), register/signup first and then sign in
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: "Demo",
            last_name: "User",
          }
        }
      });
      
      if (!signUpError) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        error = signInErr;
      } else {
        error = signUpError;
      }
    }

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome! Logged in with demo account.");
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <div className={isLoading ? "pointer-events-none" : ""}>
      <Auth5
        brandName="Agent Arena"
        onSubmit={handleSignIn}
        onInstantAccess={handleInstantAccess}
        signUpHref="/signup"
        forgotPasswordHref="/dashboard"
        isLoading={isLoading}
      />
    </div>
  );
}
