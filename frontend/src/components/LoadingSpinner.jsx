const LoadingSpinner = ({ fullScreen = false }) => {
  return (
    <div className={fullScreen ? "flex min-h-screen items-center justify-center" : "flex justify-center py-10"}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
    </div>
  );
};

export default LoadingSpinner;
