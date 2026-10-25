import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Card, Input, Textarea, Button, Avatar } from '@/components/ui';
import { updateProfile } from '@/api/userApi';
import { extractErrorMessage } from '@/api/errors';

interface FormValues {
  name: string;
  bio: string;
  skills: string[];
  profileUrl: string;
}

interface FormErrors {
  name?: string;
  bio?: string;
  profileUrl?: string;
}

const MAX_BIO_LENGTH = 200;
const MAX_NAME_LENGTH = 30;
const MAX_SKILLS = 20;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) {
    errors.name = 'Name is required';
  } else if (values.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  } else if (values.name.trim().length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer`;
  }
  if (values.bio.length > MAX_BIO_LENGTH) {
    errors.bio = `Bio must be ${MAX_BIO_LENGTH} characters or fewer`;
  }
  if (values.profileUrl && !/^https?:\/\/.+/.test(values.profileUrl)) {
    errors.profileUrl = 'Please enter a valid URL starting with http:// or https://';
  }
  return errors;
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const [values, setValues] = useState<FormValues>({
    name: user?.name ?? '',
    bio: user?.bio ?? '',
    skills: user?.skills ?? [],
    profileUrl: user?.profilePicture ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [skillInput, setSkillInput] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
    if (apiError) setApiError(null);
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (values.skills.includes(trimmed)) {
      setSkillInput('');
      return;
    }
    if (values.skills.length >= MAX_SKILLS) return;
    setValues((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setValues((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
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
      await updateProfile({
        name: values.name.trim(),
        bio: values.bio.trim() || undefined,
        skills: values.skills,
        profileUrl: values.profileUrl.trim() || undefined,
      });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="p-8 text-center animate-slide-up">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600 mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 mb-2">
            Profile Updated
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Your changes have been saved successfully.
          </p>
          <Button
            onClick={() => navigate(`/profile/${user?._id}`)}
            fullWidth
          >
            View Profile
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <button
        onClick={() => navigate(`/profile/${user?._id}`)}
        className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </button>

      <h1 className="text-xl font-bold text-neutral-900 mb-1">Edit Profile</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Update your profile information
      </p>

      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar
            src={values.profileUrl || undefined}
            name={values.name || 'User'}
            size="lg"
          />
          <div>
            <p className="text-sm font-medium text-neutral-900">Profile Picture</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              Paste an image URL below to update
            </p>
          </div>
        </div>

        {apiError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error-50 border border-error-200 mb-5 animate-slide-up">
            <AlertCircle className="h-5 w-5 text-error-500 shrink-0 mt-0.5" />
            <p className="text-sm text-error-700">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <Input
            label="Name"
            name="name"
            type="text"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Your name"
          />

          <Textarea
            label="Bio"
            name="bio"
            value={values.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            error={errors.bio}
            maxLength={MAX_BIO_LENGTH}
            placeholder="Tell others about yourself..."
            hint={`${values.bio.length}/${MAX_BIO_LENGTH}`}
            className="min-h-[80px]"
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Skills
            </label>
            {values.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {values.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-sm"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-primary-900 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="Add a skill..."
                className="flex-1 h-11 px-3.5 rounded-xl border border-neutral-300 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
                maxLength={30}
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleAddSkill}
                disabled={
                  !skillInput.trim() || values.skills.length >= MAX_SKILLS
                }
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            {values.skills.length >= MAX_SKILLS && (
              <p className="mt-1.5 text-sm text-warning-600">
                Maximum {MAX_SKILLS} skills reached
              </p>
            )}
          </div>

          <Input
            label="Profile Picture URL"
            name="profileUrl"
            type="url"
            value={values.profileUrl}
            onChange={(e) => handleChange('profileUrl', e.target.value)}
            error={errors.profileUrl}
            placeholder="https://example.com/avatar.jpg"
            hint="Paste a direct image URL"
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/profile/${user?._id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
