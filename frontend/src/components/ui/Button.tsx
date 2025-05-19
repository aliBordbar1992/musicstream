import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loading } from "./Loading";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  overrideStyles?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      overrideStyles: overrideBaseStyles = false,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

    const variants = {
      primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:opacity-50",
      secondary:
        "bg-white dark:bg-neutral-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:ring-indigo-500",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:opacity-50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={
          overrideBaseStyles
            ? `${variants[variant]} ${sizes[size]} ${className}`
            : `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
        }
        {...props}
      >
        {isLoading ? (
          <div className="mr-2">
            <Loading size="sm" />
          </div>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
