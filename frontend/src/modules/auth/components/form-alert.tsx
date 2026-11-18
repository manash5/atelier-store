export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-sale px-4 py-3 type-body text-sale">
      {message}
    </p>
  );
}
