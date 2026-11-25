import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-sand-200/60 flex items-center justify-center text-sand-600 mb-4">
        <Compass className="w-8 h-8 stroke-[1.5]" />
      </div>
      <span className="text-xs font-mono font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200 mb-2">
        Error 404
      </span>
      <h2 className="text-2xl font-bold text-sand-900 mb-1">
        Page Not Found
      </h2>
      <p className="text-sm text-sand-600 max-w-sm mb-6">
        The agricultural module or resource you requested does not exist or has moved.
      </p>
      <Button
        variant="primary"
        icon={ArrowLeft}
        onClick={() => navigate('/')}
      >
        Return to Overview
      </Button>
    </div>
  );
}
