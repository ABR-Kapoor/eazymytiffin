import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex items-center overflow-hidden w-full"
      style={{ height: "calc(100vh - 72px)", minHeight: "650px" }}
    >
      {/* Hero Banner Background - Full Width with Internal Padding in Image */}
      <div className="absolute inset-0 z-0 overflow-hidden w-full h-full pointer-events-none">
        <img
          src="/eazymytiffin-hero-premium-tiffin.png"
          alt="Premium Tiffin Banner"
          className="w-full h-full object-cover object-center"
        />
        {/* Cinematic side-gradient for maximum text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
      </div>

      <div
        className="mx-auto px-6 py-12 relative z-10 w-full h-full flex flex-col justify-center"
        style={{ maxWidth: "var(--max-width)" }}
      >
        <div className="max-w-[800px] flex flex-col gap-6 md:gap-9 animate-fade-up mt-16 md:mt-0">
          {/* H1 */}
          <div className="flex flex-col gap-2">
            <h1
              className="tracking-[-1px] text-white"
              style={{ fontSize: "clamp(42px, 7.5vw, 76px)", fontWeight: 800, lineHeight: 1.1 }}
            >
              Fresh Tiffins,
              <br />
              <span style={{ color: "#E8392A" }}>Delivered Daily.</span>
            </h1>
          </div>

          {/* Sub-headline */}
          <p
            className="text-[15px] md:text-[18px] font-medium leading-[1.7] max-w-[540px]"
            style={{ color: "rgba(255, 255, 255, 0.75)" }}
          >
            Ghar ka khana taste with daily changing menus, hygienic kitchen and
            on-time delivery — 26 days a month.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap gap-4 mt-6">
            <a
              href="tel:9770144899"
              className="btn-glare flex items-center gap-2 px-8 py-3 rounded-full text-[14px] font-bold uppercase tracking-[1px] text-white transition-all duration-300 hover:scale-[1.03]"
              style={{ background: "var(--emt-red)" }}
            >
              Order Now <ArrowUpRight size={18} strokeWidth={2.5} />
            </a>
            <a
              href="#meal-plans"
              className="btn-glare btn-glare-dark flex items-center gap-2 px-8 py-3 rounded-full text-[14px] font-bold uppercase tracking-[1px] bg-white text-black transition-all duration-300 hover:scale-[1.03]"
            >
              View Plans <ArrowUpRight size={18} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
