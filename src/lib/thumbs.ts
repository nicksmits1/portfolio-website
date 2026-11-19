import { image } from './assets';

/* Each project's thumbnail is a crop of its own real material (content/assets/<id>/thumb.webp, 336 by 192), for the
   home rows and previous / next. A new project gets one; its folder's README records what it was cropped from. */
export const thumb = (id: string) => {
  let img;
  try { img = image(id, 'thumb.webp'); } catch { throw new Error(`No thumbnail for ${id}: add content/assets/${id}/thumb.webp`); }
  return `<img class="th" src="${img.src}" width="${img.width}" height="${img.height}" alt="" loading="lazy" decoding="async">`;
};
