"use client";

import { ErrorView } from "@/components/shared/error-view";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView digest={error.digest} onRetry={reset} />;
}
