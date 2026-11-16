"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";

/** A div whose `data-inview` turns "true" the first time it scrolls into view (CSS starts animations off it). */
export function InView(props: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} data-inview={inView} {...props} />;
}
