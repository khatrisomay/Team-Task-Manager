import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
