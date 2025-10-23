import { ChangeEventHandler } from 'react';

interface TextareaFieldProps {
    label: string;
    name: string;
    required?: boolean;
    rows?: number;
    cols?: number;
    value: string;
    onChange: ChangeEventHandler<HTMLTextAreaElement>;
    className?: string;
}


const TextareaField: React.FC<TextareaFieldProps> = ({ label, name, required = false, rows = 4, value, onChange, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-700 rounded-lg shadow-sm focus:ring-var(--gemini-blue) focus:border-var(--gemini-blue) bg-gemini-dark text-white transition duration-200 ease-in-out resize-y"
      ></textarea>
    </div>
  );
};

export default TextareaField;