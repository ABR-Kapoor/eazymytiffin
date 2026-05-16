import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
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
    "Order fresh, hygienic tiffin delivered daily. Veg, Non-Veg & Mix plans from ₹99. 26 days/month. Daily menu change. Call 9770144899. Pune, India.",
  keywords:
    "tiffin service, home food delivery, tiffin plan, veg tiffin, non-veg tiffin, monthly tiffin, tiffin subscription, EazyMyTiffin, Pune tiffin",
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
    <html lang="en" className={`${montserrat.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-montserrat)]">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
