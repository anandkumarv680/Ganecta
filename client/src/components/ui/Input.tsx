import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-11 px-3.5 rounded-xl border bg-white text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-200 ${
            error
              ? 'border-error-400 focus:border-error-500 focus:ring-2 focus:ring-error-500/20'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-200 resize-y min-h-[80px] ${
            error
              ? 'border-error-400 focus:border-error-500 focus:ring-2 focus:ring-error-500/20'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error-600">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
