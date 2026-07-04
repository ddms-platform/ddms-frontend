import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CyanAnimatedButtonProps extends React.ComponentProps<'button'> {
  children: React.ReactNode;
  to?: string;
}

export function CyanAnimatedButton({
  children,
  className,
  to,
  ...props
}: CyanAnimatedButtonProps) {
  const content = (
    <>
      {/* Staggered sequential slide-in horizontal background layers on hover */}
      <div className="absolute inset-0 bg-[#00d4e0] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-250 ease-out z-0 pointer-events-none delay-500 group-hover/btn:delay-0" />
      <div className="absolute inset-0 bg-[#004d94] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-250 ease-out z-0 pointer-events-none delay-[250ms] group-hover/btn:delay-[250ms]" />
      <div className="absolute inset-0 bg-[#002244] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-250 ease-out z-0 pointer-events-none group-hover/btn:delay-500" />

      <span className="relative z-10 transition-colors duration-150 group-hover/btn:delay-[750ms]">
        {children}
      </span>
    </>
  );

  const classes = cn(
    'w-full bg-ddms-secondary text-primary-foreground hover:text-white text-center py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-md shadow-ddms-secondary/15 text-base relative overflow-hidden group/btn border-none block flex items-center justify-center',
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
