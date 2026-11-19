/* Links marked data-pdf="<title>": on a desktop the PDF opens in a dialog with the browser's own viewer; phones and
   touch devices follow the link. Used by Further reading on project pages and by /publications. */
const wide = matchMedia('(min-width: 900px) and (hover: hover)');
document.querySelectorAll<HTMLAnchorElement>('a[data-pdf]').forEach(a => a.addEventListener('click', e => {
  if (!wide.matches) return;
  e.preventDefault();
  const d = document.createElement('dialog'); d.className = 'pdf';
  d.innerHTML = `<header><b></b><span><a href="${a.href}" target="_blank" rel="noopener">Open in a new tab</a> <button type="button">Close</button></span></header><iframe src="${a.href}" title=""></iframe>`;
  d.querySelector('b')!.textContent = a.dataset.pdf!; d.querySelector('iframe')!.title = a.dataset.pdf!;
  d.querySelector('button')!.addEventListener('click', () => d.close());
  d.addEventListener('close', () => d.remove());
  d.addEventListener('click', ev => { if (ev.target === d) d.close(); });
  document.body.appendChild(d); d.showModal();
}));
