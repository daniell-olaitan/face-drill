import Reveal from "@/components/motion/Reveal";
import WaitlistForm from "@/components/landing/WaitlistForm";

const WaitlistSection = () => {
  return (
    <section id="waitlist" className="relative scroll-mt-20 overflow-hidden border-t border-border">
      {/* Oversized faint backdrop word for depth */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[28vw] font-bold leading-none tracking-tighter text-foreground/[0.03]"
      >
        READY.
      </span>

      <div className="container relative z-10 py-24 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Early access · Free to start
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-display mt-6 text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Don&apos;t walk in <span className="text-brand">cold.</span>
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-6 max-w-lg text-balance leading-relaxed text-muted-foreground">
              Join the waitlist for your spot in line today, early access when we open, and free
              practice as a founding user. Friends who join through your link move you up the queue.
            </p>
          </Reveal>
        </div>

        <Reveal delay={250} className="mx-auto mt-10 max-w-md">
          <WaitlistForm variant="panel" />
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span>Free to start</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>No card required</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>Verdict in minutes</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
            <span>US &amp; UK visas</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default WaitlistSection;
