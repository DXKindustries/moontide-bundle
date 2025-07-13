import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="py-8 text-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin inline-block" />
    </div>
  );
}
