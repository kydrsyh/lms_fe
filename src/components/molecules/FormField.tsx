import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Input } from '../atoms';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  register,
  error,
  helperText,
  ...props
}) => {
  return (
    <Input
      label={label}
      error={error?.message}
      helperText={helperText}
      {...register(name)}
      {...props}
    />
  );
};

export default FormField;

