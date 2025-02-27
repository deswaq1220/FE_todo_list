import React, { ReactNode, forwardRef, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type TInputProps = Omit<React.ComponentPropsWithoutRef<'input'>, 'type'> & {
  type: 'text' | 'password' | 'email' | 'number' | 'date';
  label?: string;
  children?: ReactNode;
};

const AuthInput = forwardRef<HTMLInputElement, TInputProps>(
  ({ label, children, className, onBlur, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleContainerClick = () => {
      inputRef.current?.focus();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (!containerRef.current?.contains(e.relatedTarget as Node)) {
        setIsFocused(false);
        onBlur?.(e);
      }
    };

    return (
      <div
        ref={containerRef}
        className={twMerge(
          'flex w-full items-center justify-between rounded-[10px] border-0 px-5 py-[18px] ring-1 outline-none ring-inset',
          isFocused
            ? 'ring-todayPink ring-2'
            : 'ring-gray-300 placeholder:text-gray-300'
        )}
        onClick={handleContainerClick}
        tabIndex={0}
      >
        {label && (
          <label
            className={twMerge('text-todayPink flex-grow text-sm font-medium')}
            htmlFor={rest.id}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={twMerge(
            'placeholder:font-pre w-9/12 rounded-[10px] border-0 ring-0 ring-gray-300 outline-none ring-inset placeholder:text-gray-300 focus:ring-0 focus:ring-inset',
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          {...rest}
        />
        {children}
      </div>
    );
  }
);

export default AuthInput;
