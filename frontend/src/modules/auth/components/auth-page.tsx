import { Suspense, type ReactNode } from "react";

import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

function AuthLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section className="container-form py-section">
      <h1 className="text-center type-display">{title}</h1>
      <p className="mt-4 text-center type-body-lg text-ink-muted">{intro}</p>
      <div className="mt-10">{children}</div>
    </section>
  );
}

function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="h-21 bg-surface" />
      ))}
      <div className="h-12 bg-surface-strong" />
    </div>
  );
}

// The forms read `?next=` with useSearchParams, which needs a Suspense boundary.
export function SignInPage() {
  return (
    <AuthLayout title="Sign in" intro="Welcome back. Sign in to your Atelier account.">
      <Suspense fallback={<FormSkeleton fields={2} />}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}

export function SignUpPage() {
  return (
    <AuthLayout
      title="Create account"
      intro="Join Atelier to save your details and see your orders in one place."
    >
      <Suspense fallback={<FormSkeleton fields={3} />}>
        <SignUpForm />
      </Suspense>
    </AuthLayout>
  );
}
