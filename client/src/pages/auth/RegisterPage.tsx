import { useState, type FormEvent } from "react";
import { useNavigate} from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button, Input } from "@/components/ui";
import { register, type RegisterBody } from "@/api/authApi";
import { extractErrorMessage } from "@/api/errors";

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

function validate(values: {
  name: string;
  username: string;
  email: string;
  password: string;
}): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Name is required";
  } else if (values.name.trim().length < 3) {
    errors.name = "Name must be at least 3 characters";
  } else if (values.name.trim().length > 30) {
    errors.name = "Name must be 30 characters or fewer";
  }

  if (!values.username.trim()) {
    errors.username = "Username is required";
  } else if (!/^[a-zA-Z0-9_]+$/.test(values.username)) {
    errors.username =
      "Username can only contain letters, numbers, and underscores";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  return errors;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const body: RegisterBody = {
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      };
      await register(body);
      setSuccess(true);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Account Created"
        subtitle=""
        altLinkText=""
        altLinkTo="/login"
        altLinkLabel=""
      >
        <div className="text-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600 mx-auto mb-5 animate-slide-up">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Welcome to Ganecta!
          </h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Your account has been created successfully. Sign in to start
            connecting with other developers.
          </p>
          <Button fullWidth size="lg" onClick={() => navigate("/login")}>
            Continue to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the Ganecta developer community"
      altLinkText="Already have an account?"
      altLinkTo="/login"
      altLinkLabel="Sign in"
    >
      {apiError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error-50 border border-error-200 mb-5 animate-slide-up">
          <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
          <p className="text-sm text-error-700">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Anand Kumar"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          maxLength={30}
        />

        <Input
          label="Username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="anand@123"
          value={values.username}
          onChange={(e) => handleChange("username", e.target.value)}
          error={errors.username}
          hint="Letters, numbers, and underscores only"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="anand@example.com"
          value={values.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={values.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
