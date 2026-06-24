import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/motion/Reveal";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Pick your interview",
    body: "Visitor, student, work, or exchange. One tap, no forms, no document uploads. Not sure yet? Skip it and practice the universals.",
  },
  {
    number: "02",
    title: "Sit across from the officer",
    body: "A face that looks back at you, asking real consular questions and pushing back when your answers go soft. You respond out loud - or type - like you will at the window.",
  },
  {
    number: "03",
    title: "Get a straight debrief",
    body: "No grade, no gold stars. For every answer: what landed, what didn't, and what the officer was actually listening for.",
  },
];

const HowItWorks = () => {
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="container py-20 md:py-28">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                How it works
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h2 className="font-display mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                From anxious to rehearsed in one sitting.
              </h2>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-5 leading-relaxed text-muted-foreground">
                The whole point is repetition under realistic pressure. Each session takes about five
                minutes, which means you can do three tonight.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <Button asChild size="lg" className="mt-8">
                <Link to="/practice">
                  Start a practice session
                  <ArrowRight />
                </Link>
              </Button>
            </Reveal>
          </div>

          <ol>
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 120} as="li">
                <div
                  className={`grid grid-cols-[3.5rem_1fr] gap-5 py-7 ${
                    index > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span
                    className="font-display text-3xl font-bold leading-none text-brand md:text-4xl"
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
