"use client"

import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Timeline step data                                                */
/* ------------------------------------------------------------------ */
const TIMELINE_STEPS = [
  { number: "01", text: "Pager fires.", active: false },
  { number: "02", text: "Internal infrastructure appears healthy.", active: false },
  { number: "03", text: "Vendor status page says operational.", active: false },
  { number: "04", text: "RELIASTRA detects external degradation.", active: true },
  { number: "05", text: "Independent regions confirm the signal.", active: true },
  { number: "06", text: "Correlation established.", active: true },
  { number: "07", text: "Evidence package generated.", active: true },
] as const

/* ------------------------------------------------------------------ */
/*  War Room Section                                                  */
/* ------------------------------------------------------------------ */
export function WarRoomSection() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollReveal({
    threshold: 0.1,
    rootMargin: "0px 0px -60px 0px",
  })

  const { containerRef: timelineRef, visibleItems } = useStaggerReveal(
    TIMELINE_STEPS.length,
    { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
  )

  return (
    <section
      ref={sectionRef}
      className="bg-[#080B10] py-24 md:py-32"
      aria-labelledby="war-room-heading"
    >
      <div className="mx-auto max-w-5xl px-6">
        {/* Heading area */}
        <div
          className={cn(
            "mb-16 max-w-xl space-y-4 transition-all duration-700 ease-out md:mb-20",
            sectionVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-[#5A6577]">
            THE 2 AM WAR ROOM
          </p>
          <h2
            id="war-room-heading"
            className="text-2xl font-semibold text-[#F3F5F7] md:text-3xl"
          >
            You know the conversation.
          </h2>
          <p className="text-xl italic text-[#8D98A8] md:text-2xl">
            &ldquo;Is it us or them?&rdquo;
          </p>
        </div>

        {/* Vertical Evidence Timeline */}
        <div
          ref={timelineRef}
          className="relative max-w-xl"
          role="list"
          aria-label="Incident investigation timeline"
        >
          {/* Vertical line */}
          <div
            className="absolute bottom-0 left-[3px] top-0 w-px transition-opacity duration-500"
            style={{
              backgroundColor: "rgba(148, 163, 184, 0.12)",
              opacity: sectionVisible ? 1 : 0,
            }}
            aria-hidden="true"
          />

          {/* Steps */}
          <div className="flex flex-col gap-4 md:gap-6">
            {TIMELINE_STEPS.map((step, index) => {
              const isRevealed = visibleItems.has(index)
              return (
                <div
                  key={step.number}
                  role="listitem"
                  className="relative flex items-start gap-4 md:gap-6"
                >
                  {/* Node + line segment */}
                  <div className="relative flex flex-col items-center pt-1">
                    {/* Connecting line segment above node (fills on scroll) */}
                    <div
                      className="absolute bottom-0 left-1/2 h-1/2 w-px -translate-x-1/2"
                      style={{
                        backgroundColor: step.active
                          ? "#3B82F6"
                          : "rgba(148, 163, 184, 0.12)",
                        transform: "translateX(-50%) scaleY(0)",
                        transformOrigin: "top",
                        transition: isRevealed
                          ? `transform 0.5s ease-out ${index * 120}ms, opacity 0.4s ease-out ${index * 120}ms`
                          : "none",
                        opacity: isRevealed ? 1 : 0,
                        ...(isRevealed
                          ? { transform: "translateX(-50%) scaleY(1)" }
                          : {}),
                      }}
                      aria-hidden="true"
                    />

                    {/* Node circle */}
                    <div
                      className="relative z-10 h-2 w-2 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor: step.active ? "#3B82F6" : "#5A6577",
                        transition: isRevealed
                          ? `background-color 0.4s ease-out ${index * 120}ms, opacity 0.4s ease-out ${index * 120}ms`
                          : "none",
                        opacity: isRevealed ? 1 : 0,
                        boxShadow: step.active
                          ? "0 0 6px rgba(59, 130, 246, 0.4)"
                          : "none",
                      }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Step content */}
                  <div
                    className={cn(
                      "-mt-0.5 transition-all duration-500 ease-out",
                      isRevealed
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    )}
                    style={{
                      transitionDelay: isRevealed
                        ? `${index * 120}ms`
                        : "0ms",
                    }}
                  >
                    <span className="font-mono-numeric text-xs text-[#5A6577]">
                      STEP {step.number}
                    </span>
                    <p
                      className={cn(
                        "mt-0.5 text-sm",
                        step.active ? "text-[#F3F5F7]" : "text-[#8D98A8]"
                      )}
                    >
                      {step.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
