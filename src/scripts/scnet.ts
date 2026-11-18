/* The illustrative 9-node supply chain shared by the thesis episode and design-policy figures.
   Coordinates are in the episode's 640 × 370 frame; the policy figure rescales them. */
export type Kind = 'p' | 'w' | 'c';
export const N: Record<string, [number, number, Kind]> = {
  P1: [80, 130, 'p'], P2: [80, 250, 'p'],
  W1: [320, 70, 'w'], W2: [320, 190, 'w'], W3: [320, 310, 'w'],
  C1: [560, 50, 'c'], C2: [560, 140, 'c'], C3: [560, 230, 'c'], C4: [560, 320, 'c'],
};
export const BASE = [['P1', 'W1'], ['P1', 'W2'], ['P2', 'W2'], ['P2', 'W3'], ['W1', 'C1'], ['W1', 'C2'], ['W2', 'C2'], ['W2', 'C3'], ['W3', 'C4']];
/* the arcs the policy adds, in order, before it stops */
export const ADDED = [['W1', 'C3'], ['P1', 'W3']];
