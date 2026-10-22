import { useState, type FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import type { Challenge, CreateChallengeBody, Difficulty } from '@/types';
import { Card, Input, Textarea, Button } from '@/components/ui';
import { createChallenge, updateChallenge } from '@/api/challengeApi';
import { extractErrorMessage } from '@/api/errors';

interface ChallengeFormProps {
  challenge?: Challenge;
  onSubmitSuccess: (challenge: Challenge) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  difficulty?: string;
  duration?: string;
}

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_DURATION = 365;

function validate(values: CreateChallengeBody): FormErrors {
  const errors: FormErrors = {};
  if (!values.title.trim()) {
    errors.title = 'Title is required';
  } else if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (values.title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer`;
  }
  if (!values.description.trim()) {
    errors.description = 'Description is required';
  } else if (values.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`;
  }
  if (!values.difficulty) {
    errors.difficulty = 'Select a difficulty';
  }
  if (!values.duration || values.duration < 1) {
    errors.duration = 'Duration must be at least 1 day';
  } else if (values.duration > MAX_DURATION) {
    errors.duration = `Duration must be ${MAX_DURATION} days or fewer`;
  }
  return errors;
}

export default function ChallengeForm({
  challenge,
  onSubmitSuccess,
  onCancel,
}: ChallengeFormProps) {
  const isEdit = !!challenge;

  const [values, setValues] = useState<CreateChallengeBody>({
    title: challenge?.title ?? '',
    description: challenge?.description ?? '',
    difficulty: challenge?.difficulty ?? 'Easy',
    duration: challenge?.duration ?? 7,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = <K extends keyof CreateChallengeBody>(
    field: K,
    value: CreateChallengeBody[K],
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }));
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

    setSaving(true);
    try {
      if (isEdit && challenge) {
        const result = await updateChallenge(challenge._id, values);
        onSubmitSuccess(result.challenge);
      } else {
        const result = await createChallenge(values);
        onSubmitSuccess(result.challenge);
      }
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6">
      {apiError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error-50 border border-error-200 mb-5 animate-slide-up">
          <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
          <p className="text-sm text-error-700">{apiError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Title"
          name="title"
          type="text"
          value={values.title}
          onChange={(e) => handleChange('title', e.target.value)}
          error={errors.title}
          maxLength={MAX_TITLE_LENGTH}
          placeholder="e.g. 30 Days of JavaScript"
        />

        <Textarea
          label="Description"
          name="description"
          value={values.description}
          onChange={(e) => handleChange('description', e.target.value)}
          error={errors.description}
          maxLength={MAX_DESCRIPTION_LENGTH}
          placeholder="Describe what participants will do..."
          hint={`${values.description.length}/${MAX_DESCRIPTION_LENGTH}`}
          className="min-h-[100px]"
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Difficulty
          </label>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleChange('difficulty', d)}
                className={`flex-1 h-11 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  values.difficulty === d
                    ? d === 'Easy'
                      ? 'bg-success-50 border-success-400 text-success-700'
                      : d === 'Medium'
                        ? 'bg-warning-50 border-warning-400 text-warning-700'
                        : 'bg-error-50 border-error-400 text-error-700'
                    : 'border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {errors.difficulty && (
            <p className="mt-1.5 text-sm text-error-600">{errors.difficulty}</p>
          )}
        </div>

        <Input
          label="Duration (days)"
          name="duration"
          type="number"
          min={1}
          max={MAX_DURATION}
          value={values.duration}
          onChange={(e) => handleChange('duration', Number(e.target.value))}
          error={errors.duration}
          placeholder="7"
        />

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save Changes' : 'Create Challenge'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
