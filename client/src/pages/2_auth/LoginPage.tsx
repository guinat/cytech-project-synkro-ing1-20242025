import MaxWidthWrapper from "@/components/common/MaxWidthWrapper"
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { removeToken } from "@/services/auth.service";
import AuthLoginForm from "@/components/2_auth/forms/AuthLoginForm";

const LoginPage = () => {
  const location = useLocation();
  useEffect(() => {
    removeToken();
    // Stocke le paramètre 'next' dans sessionStorage si présent
    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next');
    if (next) {
      sessionStorage.setItem('next_path', next);
    }
  }, [location.search]);
  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="h1-title">
            Welcome back
          </h1>
          <p className="mt-2 paragraph-small">
            Enter your credentials to sign in to your account
          </p>
        </div>
          <AuthLoginForm />
      </div>
    </MaxWidthWrapper>
  )
}

export default LoginPage