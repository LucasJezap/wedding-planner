import type { FieldError as RHFFieldError } from "react-hook-form";

export const FieldError = ({ error }: { error?: RHFFieldError }) => {
  if (!error?.message) {
    return null;
  }

  return (
    <p role="alert" className="text-sm text-red-600">
      {error.message}
    </p>
  );
};
