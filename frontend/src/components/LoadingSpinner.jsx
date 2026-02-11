import { Loader } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <Loader size={64} className="animate-spin text-blue-600" />
    </div>
  );
};

export default LoadingSpinner;