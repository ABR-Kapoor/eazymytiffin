import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppProvider } from "./providers";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EazyMyTiffin — India's Premium Tiffin Brand | Fresh Meals Delivered Daily",
  description:
    "Order fresh, hygienic tiffin delivered daily. Veg, Non-Veg & Mix plans from ₹99. 26 days/month. Daily menu change. Call 9770144899.",
  keywords:
    "tiffin service, home food delivery, tiffin plan, veg tiffin, non-veg tiffin, monthly tiffin, tiffin subscription, EazyMyTiffin",
  openGraph: {
    title: "EazyMyTiffin — India's Premium Tiffin Brand",
    description: "Fresh home-style tiffin delivered daily. Plans from ₹99.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/home"
      afterSignUpUrl="/home"
      appearance={{
        theme: "simple",
        cssLayerName: "clerk",
        variables: {
          colorPrimary: "#E8392A",
          colorText: "#1A1A1A",
          colorBackground: "#FDF9F3",
          colorInputBackground: "#FFFFFF",
          colorInputText: "#1A1A1A",
          spacingUnit: "8px",
          borderRadius: "8px",
        },
      }}
    >
      <html lang="en" className={`${montserrat.variable} h-full`}>
        <body className="min-h-full flex flex-col font-[family-name:var(--font-montserrat)]">
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <AppProvider>
            {children}
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
