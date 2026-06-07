"use client";

import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/AuthLayout";

const clerkAppearance = {
  cssLayerName: "clerk" as const,
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#E8392A",
    colorText: "#1A1A1A",
    colorTextSecondary: "#666666",
    colorBackground: "rgba(255,255,255,0.4)",
    colorInputBackground: "rgba(255,255,255,0.4)",
    colorInputText: "#1A1A1A",
    colorInputBorder: "#E5E5E5",
    borderRadius: "8px",
    spacingUnit: "8px",
  },
  elements: {
    rootBox: "w-full flex justify-center lg:justify-start mx-auto !max-w-full bg-transparent",
    cardBox: "!shadow-none !border-none !border-0 p-0 bg-transparent w-full !max-w-full",
    card: "!shadow-none !border-none !border-0 p-0 bg-transparent w-full !max-w-full",
    main: "gap-4 w-full !p-0 !m-0 bg-transparent",
    header: "!hidden",
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
    formButtonPrimary:
      "text-[15px] font-semibold px-4 py-2 rounded-lg shadow-none bg-[#E8392A] hover:bg-red-700 transition-all duration-200 h-11 flex items-center justify-center w-full",
    socialButtons: "w-full flex !px-0 !mx-0",
    socialButtonsBlockButton:
      "flex items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] bg-white/70 backdrop-blur-sm text-[#1A1A1A] text-[14px] font-medium transition-all duration-200 hover:bg-white/90 h-11 shadow-sm w-full !mx-0",
    alternativeMethodsBlockButton:
      "flex items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] bg-white/70 backdrop-blur-sm text-[#1A1A1A] text-[14px] font-medium transition-all duration-200 hover:bg-white/90 h-11 shadow-sm w-full !mx-0",
    socialButtonsProviderIcon: "w-6 h-6",
    dividerRow: "my-4 !px-0 !mx-0 w-full",
    dividerLine: "bg-[#E5E5E5]",
    dividerText:
      "text-[13px] font-normal text-[#666666] bg-transparent px-3 normal-case tracking-normal",
    formFieldLabel:
      "text-[14px] font-medium text-[#1A1A1A] mb-1 normal-case tracking-normal",
    formFieldInput:
      "rounded-lg border border-[#E5E5E5] bg-white/70 backdrop-blur-sm text-[14px] font-medium px-4 h-11 transition-all duration-200 focus:bg-white/90 focus:border-[#E8392A] focus:shadow-[0_0_0_3px_rgba(232,57,42,0.1)]",
    footerActionText: "text-[14px] font-medium text-[#666666]",
    footerActionLink: "text-[14px] font-semibold text-[#E8392A] hover:text-red-700 hover:underline",
    identityPreviewText: "text-[14px]",
    identityPreviewEditButton: "hover:underline text-[#E8392A]",
    formResendCodeLink: "text-[14px] font-semibold text-[#E8392A] hover:underline",
    alert: "rounded-lg p-3 bg-red-50 border border-red-100",
    alertText: "text-[14px] font-medium text-red-800",
    footer: "!bg-none !bg-transparent !border-none !shadow-none p-0",
    formFieldRow: "mb-4",
    otpCodeFieldInputs: "gap-2 sm:gap-4 flex justify-center",
    otpCodeFieldInput: "!w-12 !h-12 sm:!w-14 sm:!h-14 text-xl sm:text-2xl font-bold bg-white/70 backdrop-blur-sm !border-[#E5E5E5] focus:bg-white/90 focus:!border-[#E8392A] focus:!shadow-[0_0_0_3px_rgba(232,57,42,0.1)] rounded-lg transition-all duration-200",
  },
};

export default function SignUpPage() {
  return (
    <AuthLayout
      heading="Welcome to"
      subtitle="Sign in or create your account"
    >
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  );
}
