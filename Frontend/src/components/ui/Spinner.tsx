
export const Spinner = ({ className = '' }: { className?: string }) => {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-primary ${className}`}
    ></div>
  );
};
