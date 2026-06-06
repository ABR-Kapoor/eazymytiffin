import dynamic from "next/dynamic";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";

const MealPlans = dynamic(() => import("./MealPlans"));
const MonthlySubscription = dynamic(() => import("./MonthlySubscription"));
const WeeklyMenu = dynamic(() => import("./WeeklyMenu"));
const WhyUs = dynamic(() => import("./WhyUs"));
const Testimonials = dynamic(() => import("./Testimonials"));
const CTABanner = dynamic(() => import("./CTABanner"));
const Footer = dynamic(() => import("./Footer"));

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Features />
        <MealPlans />
        <MonthlySubscription />
        <WeeklyMenu />
        <WhyUs />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
