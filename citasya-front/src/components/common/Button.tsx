import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  iconRight?: React.ReactNode;
  iconLeft?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-white',
  secondary:
    'bg-sidebar hover:bg-sidebar/90 text-white',
  outline:
    'bg-transparent border border-primary text-primary hover:bg-primary/10',
  danger:
    'bg-red-600 hover:bg-red-700 text-white',
};

export default function Button({
  variant = 'primary',
  loading = false,
  iconRight,
  iconLeft,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={
        [
          'w-full font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center group disabled:opacity-70',
          variantClasses[variant],
          className
        ]
          .filter(Boolean)
          .join(' ')
      }
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {iconLeft && <span className="mr-2">{iconLeft}</span>}
          {children}
          {iconRight && <span className="ml-2">{iconRight}</span>}
        </>
      )}
    </button>
  );
}
