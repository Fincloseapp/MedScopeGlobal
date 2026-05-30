import { AuthForm } from "@/components/portal/auth-form";

export default function RegisterPage() {
  return (
    <main className="section auth-page">
      <AuthForm mode="register" />
    </main>
  );
}
