import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { extractErrorMessage, isAuthError } from "@/api/errors";

interface FormErrors {
  identifier?: string;
  password?: string;
}

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as LocationState)?.from?.pathname || "/";

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    if (errors.identifier) {
      setErrors((prev) => ({ ...prev, identifier: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors: FormErrors = {};
    if (!identifier.trim()) {
      validationErrors.identifier = "Email or username is required";
    }
    if (!password) {
      validationErrors.password = "Password is required";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      if (isAuthError(err)) {
        setApiError("Invalid email/username or password. Please try again.");
      } else {
        setApiError(extractErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      altLinkText="Don't have an account?"
      altLinkTo="/register"
      altLinkLabel="Create one"
    >
      {apiError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error-50 border border-error-200 mb-5 animate-slide-up">
          <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
          <p className="text-sm text-error-700">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email or username"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="anand@123 or anand@example.com"
          value={identifier}
          onChange={(e) => handleIdentifierChange(e.target.value)}
          error={errors.identifier}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          error={errors.password}
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
