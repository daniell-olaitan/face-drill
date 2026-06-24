import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";

const FinalCTA = () => {
  return (
    <section className="border-t border-border">
      <div className="container py-20 md:py-28">
        <Reveal>
          {/* A cinematic dark closing beat, dark in either theme (like visa-drill's
              "window" sections). */}
          <div className="relative overflow-hidden rounded-[2rem] bg-[#0A0F1C] px-6 py-16 text-center md:px-16 md:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-2xl">
              <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">
                One shot at the glass
              </p>
              <h2 className="font-display text-balance text-3xl font-bold tracking-tight text-white md:text-5xl">
                Walk in like you&apos;ve done it before.
              </h2>
              <p className="mx-auto mt-5 max-w-md text-balance text-sm leading-relaxed text-white/55 md:text-base">
                Because by the time it counts, you will have - again and again, across from a face
                that doesn&apos;t blink at your nerves.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href="#waitlist"
                  className="inline-flex h-11 w-full items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-black transition-colors hover:bg-white/90 sm:w-auto"
                >
                  Join the waitlist
                </a>
                <Link
                  to="/practice"
                  className="group inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-md px-6 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  Try a session first
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCTA;
