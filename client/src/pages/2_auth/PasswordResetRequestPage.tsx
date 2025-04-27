import AuthPasswordResetRequestForm from "@/components/2_auth/forms/AuthPasswordResetRequestForm"
import MaxWidthWrapper from "@/components/common/MaxWidthWrapper"

const PasswordResetRequestPage = () => {
  return (
    <MaxWidthWrapper className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="h1-title">
            I hope you're well!
          </h1>
          <p className="mt-2 paragraph-small">
            Please enter your email address and we'll send you a password reset link.
          </p>
        </div>
        <AuthPasswordResetRequestForm />
      </div>
    </MaxWidthWrapper>
  )
}

export default PasswordResetRequestPage