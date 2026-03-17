"use client";

import { createContext, useContext } from "react";

interface ScrollVelocityContextType {
  velocity: number;
  direction: number; // 1 = down, -1 = up
}

export const ScrollVelocityContext = createContext<ScrollVelocityContextType>({
  velocity: 0,
  direction: 1,
});

export function useScrollVelocity() {
  return useContext(ScrollVelocityContext);
}
