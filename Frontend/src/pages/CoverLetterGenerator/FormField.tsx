import { ChangeEventHandler, ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value?: string | number;
  // Make the onChange prop more generic
  onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
  children?: ReactNode;
  className?: string;
  accept?: string;
}

const FormField: React.FC<FormFieldProps> = ({ label, name, type = 'text', required = false, placeholder = '', value, onChange, children, className = '', accept }) => {
  const commonClasses = "w-full p-3 border border-gray-700 rounded-lg shadow-sm focus:ring-var(--gemini-blue) focus:border-var(--gemini-blue) bg-gemini-dark text-white transition duration-200 ease-in-out";
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'select' ? (
        <select
          id={name}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          className={commonClasses}
        >
          {children}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          required={required}
          placeholder={placeholder}
          value={type === 'file' ? undefined : value}
          onChange={onChange}
          accept={accept}
          className={commonClasses}
        />
      )}
    </div>
  );
};

export default FormField;