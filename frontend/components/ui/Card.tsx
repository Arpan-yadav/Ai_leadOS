/**
 * @file components/ui/Card.tsx
 * Sprint 1 — Frontend Team Deliverable
 */

import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div
      className={clsx(
        'glass-card',
        paddings[padding],
        hover && 'hover:shadow-md transition-shadow cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps { title: string; subtitle?: string; action?: ReactNode }
export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
