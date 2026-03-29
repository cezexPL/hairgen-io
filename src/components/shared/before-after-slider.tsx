"use client";

import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  className?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  className,
}: BeforeAfterSliderProps) {
  return (
    <div className={className}>
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={beforeSrc}
            alt={beforeAlt}
            style={{ objectFit: "cover" }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterSrc}
            alt={afterAlt}
            style={{ objectFit: "cover" }}
          />
        }
        style={{ width: "100%", height: "100%", borderRadius: "0.75rem" }}
      />
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>Before</span>
        <span>After</span>
      </div>
    </div>
  );
}
