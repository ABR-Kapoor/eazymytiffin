import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FDF9F3] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-800 text-[#1A1A1A] mb-2">
            EazyMy<span className="text-[#E8392A]">Tiffin</span>
          </h1>
          <p className="text-gray-600">Join India's Premium Tiffin Community</p>
        </div>
        <SignUp
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: "#E8392A",
              colorText: "#1A1A1A",
              colorBackground: "#FDF9F3",
              colorInputBackground: "#FFFFFF",
              colorInputText: "#1A1A1A",
              spacingUnit: "8px",
              borderRadius: "8px",
            },
            elements: {
              formButtonPrimary: "bg-[#E8392A] hover:bg-red-700 text-white font-600",
              card: "bg-white border border-[#D4B896]/20 shadow-sm",
              headerTitle: "text-[#1A1A1A] font-800 text-2xl",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "border-[#D4B896]/20 hover:bg-[#F8FAFC]",
              dividerLine: "bg-[#D4B896]/20",
              footerActionLink: "text-[#E8392A] hover:text-red-700 font-600",
            },
          }}
          redirectUrl="/home"
        />
      </div>
    </div>
  );
}
