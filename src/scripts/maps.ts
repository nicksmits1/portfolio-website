/* Where each project's minimum sits, as fractions of the landscape's width and height. A new project needs a
   place in every map. The hero keeps its lower left clear for the name, headshot and links. */
export type Map = Record<string, [number, number]>;
export const MAPS: Record<'wide' | 'tall' | 'side' | 'tallgrid', Map> = {
  wide: { sepsis: [.12, .25], sindae: [.36, .19], thesis: [.61, .3], recsys: [.86, .2], mmrag: [.74, .47], fifa: [.58, .72], wayfinder: [.88, .7] },
  tall: { sepsis: [.26, .08], sindae: [.74, .13], thesis: [.27, .24], recsys: [.73, .29], mmrag: [.27, .4], fifa: [.73, .45], wayfinder: [.5, .56] },
  side: { thesis: [.22, .25], sindae: [.52, .18], recsys: [.82, .28], mmrag: [.5, .5], sepsis: [.2, .74], wayfinder: [.5, .82], fifa: [.8, .72] },
  tallgrid: { thesis: [.27, .14], sindae: [.73, .14], recsys: [.27, .38], sepsis: [.73, .38], wayfinder: [.27, .62], fifa: [.73, .62], mmrag: [.5, .86] },
};
export type ProjectRef = { id: string; short: string; href?: string };
