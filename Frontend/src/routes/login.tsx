import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Auth5 } from "@/components/ui/auth-5";

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

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Redirect directly to dashboard on submit for demo flow
    navigate({ to: "/dashboard" });
  };

  return (
    <Auth5
      brandName="Agent Arena"
      onSubmit={handleSignIn}
      signUpHref="/dashboard"
      forgotPasswordHref="/dashboard"
    />
  );
}
