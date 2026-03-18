export default function ProtectedLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-card-tint)] border-t-[var(--color-dusty-rose)]" />
      </div>
    </div>
  );
}
