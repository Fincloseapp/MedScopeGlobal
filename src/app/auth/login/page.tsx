import { AuthForm } from "@/components/portal/auth-form";

export default function LoginPage() {
  return (
    <main className="section auth-page">
      <AuthForm mode="login" />
    </main>
  );
}
