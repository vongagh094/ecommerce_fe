interface LoadingSpinnerProps {
    message?: string;
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
                                                                  message = 'Loading...',
                                                                  className = ''
                                                              }) => {
    return (
        <div className={`flex justify-center items-center py-8 ${className}`}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">{message}</span>
        </div>
    );
};