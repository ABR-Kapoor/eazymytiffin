import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import MealPlans from "./MealPlans";
import MonthlySubscription from "./MonthlySubscription";
import WeeklyMenu from "./WeeklyMenu";
import WhyUs from "./WhyUs";
import Testimonials from "./Testimonials";
import CTABanner from "./CTABanner";
import Footer from "./Footer";

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
