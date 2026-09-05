type ErrorAlertProps = {
  title: string;
  message: string;
};

export function ErrorAlert({ title, message }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-400/50 bg-red-500/20 px-4 py-3 text-left"
    >
      <p className="font-semibold text-red-50">{title}</p>
      <p className="mt-1 text-sm text-red-100">{message}</p>
    </div>
  );
}
