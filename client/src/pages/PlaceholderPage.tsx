import { type ReactNode } from 'react';
import { Construction } from 'lucide-react';
import { Card } from '@/components/ui';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export default function PlaceholderPage({
  title,
  description = 'This page is under construction and will be implemented in a future phase.',
  icon,
}: PlaceholderPageProps) {
  return (
    <div className="py-12">
      <Card className="p-12 max-w-lg mx-auto text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 mx-auto mb-5">
          {icon || <Construction className="h-8 w-8" />}
        </div>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">{title}</h1>
        <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
      </Card>
    </div>
  );
}
