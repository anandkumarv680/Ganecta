import type { AxiosError } from 'axios';

interface BackendErrorBody {
  Error?: string;
  error?: string;
  Message?: string;
  message?: string;
  success?: boolean;
}

export function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<BackendErrorBody>;

  if (axiosError?.response?.data) {
    const body = axiosError.response.data;
    return (
      body.Error ??
      body.error ??
      body.Message ??
      body.message ??
      `Request failed with status ${axiosError.response.status}`
    );
  }

  if (axiosError?.request) {
    return 'Network error — could not reach the server. Please check your connection.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function isAuthError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return axiosError?.response?.status === 401;
}
