import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled = false,
  isLoading = false,
  ...props
}) => {
  const variantClass = styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  const sizeClass = styles[`btn${size.charAt(0).toUpperCase() + size.slice(1)}`];
  const widthClass = fullWidth ? styles.btnFullWidth : '';
  const loadingClass = isLoading ? styles.btnLoading : '';
  const disabledClass = disabled ? styles.btnDisabled : '';

  return (
    <button
      className={`${styles.btn} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className={styles.btnSpinner} />}
      {leftIcon && !isLoading && <span className={styles.btnIconLeft}>{leftIcon}</span>}
      <span className={styles.btnContent}>{children}</span>
      {rightIcon && !isLoading && <span className={styles.btnIconRight}>{rightIcon}</span>}
    </button>
  );
};

export default Button;
