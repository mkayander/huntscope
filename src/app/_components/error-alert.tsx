import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

type ErrorAlertProps = {
  title: string;
  message: string;
};

export function ErrorAlert({ title, message }: ErrorAlertProps) {
  return (
    <Alert
      variant="destructive"
      className="border-destructive/50 bg-destructive/15 text-left"
    >
      <AlertTitle className="text-red-50">{title}</AlertTitle>
      <AlertDescription className="text-red-100">{message}</AlertDescription>
    </Alert>
  );
}
