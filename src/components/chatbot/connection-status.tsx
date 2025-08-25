import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  onRetry: () => Promise<boolean>;
  isRetrying?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
  onRetry,
  isRetrying = false
}) => {
  if (isConnected && !error) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700">
          Connected to WrenAI service
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50">
      <XCircle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-700 flex items-center justify-between">
        <span>
          {error || 'Not connected to WrenAI service'}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isRetrying}
          className="ml-2"
        >
          {isRetrying ? (
            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <RefreshCw className="w-3 h-3 mr-1" />
          )}
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};