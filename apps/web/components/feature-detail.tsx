import { cn } from '@workspace/ui/lib/utils';
import Image from 'next/image';
import React from 'react'


interface FeatureDetailProps {
  primary: boolean;
  intro: string;
  title: string;
  body: string;
  bullets: string[];
  ltr: boolean;
  imgUrl: string;
  btnLabel: string;
  ctaLink: string
}

function FeatureDetail({ primary, intro, title, body, bullets, ltr, imgUrl, btnLabel, ctaLink }: FeatureDetailProps) {
  return (
    <div className={cn("grid grid-cols-1 items-center py-18 border-b border-b-line", ltr ? "lg:grid-cols-2 lg:gap-x-12" : "lg:grid-cols-2 lg:gap-x-12 lg:flex-row-reverse")}>
      <div className="reveal">
        <span className="inline-flex items-center gap-1.75 bg-surface-subtle border border-line rounded-full py-1.25 px-3.5 text-xs font-bold text-content-subtle tracking-widest uppercase mb-4.5"><span className="size-1.5 rounded-full bg-brand-navy animate-pulse" /> {intro}</span>
        <h2 className="text-4xl font-extrabold tracking-wider leading-8 text-content mb-3.5">{title}</h2>
        <p className="text-base text-content-subtle mb-4.5">{body}</p>
        <ul className="flex flex-col gap-3 mb-7">
          {bullets.map((i, idx) => (
            <li key={idx} className="flex gap-2.5 text-sm text-content-subtle"><div className="size-2 rounded-full shrink-0 bg-brand-teal mt-1.25" /><span>{i}</span></li>
          ))}
        </ul >
        <a href={ctaLink} className={cn("inline-flex items-center gap-2 text-sm font-bold border rounded-full py-3 px-6 transition-all duration-150", primary ? "bg-brand-navy border-brand-navy text-content-inverse hover:bg-brand-navy-hover" : "border-line text-content")}>{btnLabel}</a>
      </div >
      <div className="inline-flex size-full reveal relative">
        <Image src={imgUrl} alt={title} sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw' fill priority className="object-center" />
      </div>
    </div>
  )
}

export default FeatureDetail