/* Where each project's minimum sits on the skills landscape, as fractions of its width and height. A new project
   needs a place in every map. The hero's minima are research topics, placed in content/data/topics.yaml. */
export type Map = Record<string, [number, number]>;
export const MAPS: Record<'side' | 'tallgrid', Map> = {
  side: { thesis: [.22, .25], sindae: [.52, .18], recsys: [.82, .28], mmrag: [.5, .5], sepsis: [.2, .74], wayfinder: [.5, .82], fifa: [.8, .72], electricity: [.16, .5] },
  tallgrid: { thesis: [.27, .14], sindae: [.73, .14], recsys: [.27, .38], sepsis: [.73, .38], wayfinder: [.27, .62], fifa: [.73, .62], mmrag: [.27, .86], electricity: [.73, .86] },
};
export type ProjectRef = { id: string; short: string; href?: string };
