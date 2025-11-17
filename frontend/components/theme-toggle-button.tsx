'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { VariantProps } from 'class-variance-authority';

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export function ThemeToggleButton({
  className,
  variant = 'ghost',
  size = 'icon',
}: {
  className?: string;
  size?: ButtonVariantProps['size'];
  variant?: ButtonVariantProps['variant'];
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return (
      <Button variant={variant} size={size} disabled className={className} />
    );
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={toggleTheme}
      className={cn('relative overflow-hidden', className)}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 size-5" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 size-5" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
