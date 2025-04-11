import { toast as sonnerToast } from "sonner";

const useToast = () => {
  return {
    toast: sonnerToast
  };
};

export { useToast }; 