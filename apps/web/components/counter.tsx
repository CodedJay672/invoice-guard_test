"use client";


import React from 'react'
import CountUp, { type CountUpProps } from 'react-countup';

function Counter({ end, ...props }: CountUpProps) {
  return (
    <CountUp end={end} {...props} />
  )
}

export default Counter