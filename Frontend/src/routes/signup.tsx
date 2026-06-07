import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Auth5 } from "@/components/ui/auth-5";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Agent Arena" },
      { name: "description", content: "Create an Agent Arena workspace." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password || !firstName || !lastName) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed up successfully! Check your email to verify (if enabled).");
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
        title="Create an account"
        description="Sign up to start monitoring your competitors."
        submitLabel="Sign up"
        onSubmit={handleSignUp}
        onInstantAccess={handleInstantAccess}
        signUpHref="/signup"
        forgotPasswordHref="/dashboard"
        isLoading={isLoading}
        isSignUp={true}
      />
    </div>
  );
}
