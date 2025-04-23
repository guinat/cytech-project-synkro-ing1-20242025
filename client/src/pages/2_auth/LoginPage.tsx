import MaxWidthWrapper from "@/components/common/MaxWidthWrapper"
import AuthLoginForm from "@/components/2_auth/forms/AuthLoginForm";

const LoginPage = () => {
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