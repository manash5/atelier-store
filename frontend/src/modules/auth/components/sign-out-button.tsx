import { signOutAction } from "../actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="btn btn-secondary w-full sm:w-auto">
        Sign out
      </button>
    </form>
  );
}
