import { cn } from "@workspace/ui/lib/utils";
import Image from "next/image";
import React from "react";

interface FeatureDetailProps {
  primary: boolean;
  intro: string;
  title: string;
  body: string;
  bullets: string[];
  ltr: boolean;
  imgUrl: string;
  btnLabel: string;
  ctaLink: string;
}

function FeatureDetail({
  primary,
  intro,
  title,
  body,
  bullets,
  ltr,
  imgUrl,
  btnLabel,
  ctaLink,
}: FeatureDetailProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-center border-b border-b-line py-18",
        ltr ? "lg:grid-cols-2 lg:gap-x-12" : "lg:grid-cols-2 lg:flex-row-reverse lg:gap-x-12",
      )}
    >
      <div className="reveal">
        <span className="mb-4.5 inline-flex items-center gap-1.75 rounded-full border border-line bg-surface-subtle px-3.5 py-1.25 text-xs font-bold tracking-widest text-content-subtle uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-brand-navy" /> {intro}
        </span>
        <h2 className="mb-3.5 text-4xl leading-8 font-extrabold tracking-wider text-content">
          {title}
        </h2>
        <p className="mb-4.5 text-base text-content-subtle">{body}</p>
        <ul className="mb-7 flex flex-col gap-3">
          {bullets.map((i, idx) => (
            <li key={idx} className="flex gap-2.5 text-sm text-content-subtle">
              <div className="mt-1.25 size-2 shrink-0 rounded-full bg-brand-teal" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
        <a
          href={ctaLink}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold transition-all duration-150",
            primary
              ? "border-brand-navy bg-brand-navy text-content-inverse hover:bg-brand-navy-hover"
              : "border-line text-content",
          )}
        >
          {btnLabel}
        </a>
      </div>
      <div className="reveal relative inline-flex size-full">
        <Image
          src={imgUrl}
          alt={title}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          fill
          priority
          className="object-center"
        />
      </div>
    </div>
  );
}

export default FeatureDetail;
