import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../atoms';
import { FormField } from '../molecules';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading = false, error }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <FormField
        name="email"
        label="Email"
        type="email"
        register={register}
        error={errors.email}
        placeholder="your@email.com"
        autoComplete="email"
      />
      
      <FormField
        name="password"
        label="Password"
        type="password"
        register={register}
        error={errors.password}
        placeholder="••••••••"
        autoComplete="current-password"
      />
      
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
      >
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;

