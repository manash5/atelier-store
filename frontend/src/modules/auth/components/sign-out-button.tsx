import { signOutAction } from "../actions";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={compact ? "btn btn-secondary btn-sm" : "btn btn-secondary w-full sm:w-auto"}
      >
        Sign out
      </button>
    </form>
  );
}
