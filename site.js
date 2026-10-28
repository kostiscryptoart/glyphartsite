/*
 * Renders every page from data.js.
 * <body data-root="../" data-collection="slug"> renders a collection page;
 * <body data-root=""> (no collection) renders the home page.
 */
(function () {
  const { artist } = window.GLYPHART;
  const COLLECTIONS = window.GLYPHART.COLLECTIONS.filter(c => !c.hidden);
  const body = document.body;
  const ROOT = body.dataset.root || '';
  const SLUG = body.dataset.collection;

  const STATUS = {
    live: { label: 'Minting now', cls: 'live' },
    upcoming: { label: 'Upcoming', cls: 'upcoming' },
    dev: { label: 'In development', cls: 'dev' },
    secondary: { label: 'Collect on secondary', cls: 'secondary' },
    closed: { label: 'Mint closed', cls: 'secondary' },
    released: { label: 'Released', cls: 'secondary' },
  };

  // a "live" mint with a close date flips to "closed" once that date passes
  function statusOf(c) {
    if (c.status === 'live' && c.mint && c.mint.closes && Date.now() > Date.parse(c.mint.closes)) return 'closed';
    if (c.status === 'live' && c.mint && c.mint.opens && Date.now() < Date.parse(c.mint.opens)) return 'upcoming';
    return c.status;
  }

  function el(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k in n && typeof v !== 'string') n[k] = v;
      else n.setAttribute(k, v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null) n.append(kid);
    return n;
  }
  const ext = (href, text, cls) => el('a', { href, target: '_blank', rel: 'noopener', class: cls, text });
  const url = (p) => ROOT + p;
  const fmtDate = (iso) => new Date(iso).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  }) + ' UTC';

  function img(src, alt, eager) {
    return el('img', { src: url(src), alt, loading: eager ? 'eager' : 'lazy', decoding: 'async' });
  }

  // cover image that steps through c.showcase, preloading the next one before swapping
  function cover(c, alt, eager) {
    const im = img(c.cover, alt, eager);
    const list = c.showcase;
    if (!list || list.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return im;
    let i = 0;
    setInterval(() => {
      if (document.hidden || !im.isConnected) return;
      const next = new Image();
      next.onload = () => { i = (i + 1) % list.length; im.src = next.src; };
      next.src = url(list[(i + 1) % list.length]);
    }, 4000);
    return im;
  }

  function badge(c) {
    const s = STATUS[statusOf(c)];
    return el('span', { class: `badge ${s.cls}`, text: s.label });
  }

  // ---------- shared chrome ----------
  function header() {
    const nav = el('nav', { 'aria-label': 'Collections' },
      COLLECTIONS.map(c => el('a', {
        href: url(`${c.slug}/index.html`), text: c.name.replace('GlyphArt ', '').replace('Postcards from the Old Mainframe', 'Postcards'),
        'aria-current': c.slug === SLUG ? 'page' : null,
      })));
    return el('header', { class: 'site' },
      el('a', { class: 'logo', href: url('index.html'), 'aria-label': 'GlyphArt home' },
        el('span', { class: 'cursor', 'aria-hidden': 'true', text: '▓' }), 'GLYPHART'),
      nav);
  }

  function footer() {
    return el('footer', { class: 'site' },
      el('span', { text: 'GlyphArt · ASCII and bitmap-glyph art' }),
      ext(artist.x, `X ${artist.xHandle}`));
  }

  // ---------- mint panel ----------
  function mintPanel(c) {
    const m = c.mint || {};
    const st = statusOf(c);
    const rows = [
      ['Status', badge(c)],
      ['Platform', m.platform],
      ['Chain', m.chain],
      ['Price', m.price],
      ['Edition', m.edition],
      m.opens ? ['Opens', fmtDate(m.opens)] : null,
      m.closes ? ['Closes', fmtDate(m.closes)] : null,
      m.contract ? ['Contract', el('code', { text: m.contract.slice(0, 6) + '…' + m.contract.slice(-4), title: m.contract })] : null,
    ].filter(Boolean)
      // released collections hide unknown values; upcoming ones show them as TBA
      .filter(([, v]) => v != null || st === 'upcoming' || st === 'dev' || st === 'live');

    const dl = el('dl', { class: 'meta' }, rows.map(([k, v]) => [
      el('dt', { text: k }),
      el('dd', {}, v == null ? el('span', { class: 'tba', text: 'TBA' }) : v),
    ]));

    const L = c.links || {};
    let cta;
    if (st === 'live' && L.highlight) {
      cta = el('div', { class: 'cta' },
        el('p', {}, el('strong', { text: `Mint ${c.name}` }), el('span', { text: [m.priceShort || m.price, m.chain].filter(Boolean).join(' · ') })),
        ext(L.highlight, 'MINT ON HIGHLIGHT →'));
    } else if (st === 'upcoming' || st === 'dev') {
      cta = el('div', { class: 'cta muted' },
        el('p', {}, el('strong', { text: st === 'dev' ? 'In development' : 'Coming soon' }),
          el('span', { text: 'Follow for the mint date' })),
        ext(artist.x, `FOLLOW ${artist.xHandle} →`));
    } else if (L.opensea) {
      cta = el('div', { class: 'cta' },
        el('p', {}, el('strong', { text: st === 'closed' ? 'The mint has closed' : `Collect ${c.name}` }),
          el('span', { text: 'Available on the secondary market' })),
        ext(L.opensea, 'COLLECT ON OPENSEA →'));
    }

    const links = el('div', { class: 'links' },
      L.highlight ? ext(L.highlight, 'Highlight', 'btn') : null,
      L.opensea ? ext(L.opensea, 'OpenSea', 'btn') : null,
      L.oncyber ? ext(L.oncyber, '3D gallery on oncyber', 'btn') : null,
      L.viewer ? ext(L.viewer, 'Viewer', 'btn') : null);

    return el('aside', { class: 'mint', 'aria-label': 'Mint details' },
      el('h2', { text: 'Mint details' }), dl, cta, links.children.length ? links : null);
  }

  // ---------- live gallery: the token's own code running in an iframe ----------
  const liveSrc = (c, t) => url(`${c.live.code}?h=${t.h}&tid=${t.id}`);
  const liveFrame = (c, t, eager) => el('iframe', {
    title: `${c.name} #${t.id}, live`, loading: eager ? 'eager' : 'lazy',
    'data-src': liveSrc(c, t), src: eager ? liveSrc(c, t) : null,
  });

  // only sketches near the viewport run; the rest are unloaded to spare the CPU
  const runner = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      const f = e.target;
      if (e.isIntersecting && !f.getAttribute('src')) f.src = f.dataset.src;
      if (!e.isIntersecting && f.getAttribute('src')) f.removeAttribute('src');
    }
  }, { rootMargin: '200px' }) : null;

  function liveGallery(c) {
    const items = c.live.tokens.map((t, i) => {
      const frame = liveFrame(c, t, !runner);
      if (runner) runner.observe(frame);
      return el('figure', { class: 'live' },
        el('div', { class: 'stage' }, frame),
        el('figcaption', {},
          el('span', { text: `#${t.id}` }),
          el('span', { class: 'traits', text: t.traits }),
          el('button', { type: 'button', class: 'btn', text: 'Expand', 'aria-label': `Expand ${c.name} #${t.id}`, onclick: () => openLive(c, i) })));
    });
    return el('section', { class: 'gallery-wrap' },
      el('h2', { class: 'label', text: `Live gallery · ${c.live.tokens.length} minted` }),
      el('p', { class: 'small hint', text: c.live.hint }),
      el('div', { class: 'gallery' }, items));
  }

  function openLive(c, i) {
    const n = c.live.tokens.length;
    openDialog((k) => {
      i = (k + n) % n;
      const t = c.live.tokens[i];
      return [el('div', { class: 'stage big' }, liveFrame(c, t, true)), `${c.name} #${t.id} · ${t.traits}`, i];
    }, i);
  }

  // ---------- on-chain gallery: every minted token, read live from the chain ----------
  const RPC = { ethereum: 'https://ethereum-rpc.publicnode.com', base: 'https://base-rpc.publicnode.com' };
  const arweave = (u) => u && u.startsWith('ar://') ? 'https://arweave.net/' + u.slice(5) : u;
  const metaCache = new Map();

  async function totalSupply(o) {
    try {
      const r = await fetch(RPC[o.chain], {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: o.contract, data: '0x18160ddd' }, 'latest'] }),
      });
      const n = parseInt((await r.json()).result, 16);
      if (n >= 0) return n;
    } catch {}
    // fallback: walk the metadata server until it runs out
    let n = 0; while ((await fetch(`https://metadata.highlight.xyz/${o.highlight}/${n + 1}`)).ok) n++;
    return n;
  }

  function tokenMeta(o, id) {
    const key = `${o.highlight}/${id}`;
    if (!metaCache.has(key)) metaCache.set(key, fetch(`https://metadata.highlight.xyz/${key}`).then(r => r.ok ? r.json() : null));
    return metaCache.get(key);
  }

  function chainGallery(c) {
    const o = c.onchain;
    const head = el('h2', { class: 'label', text: `All ${o.unit}s · reading the chain…` });
    const grid = el('div', { class: 'gallery' });
    const section = el('section', { class: 'gallery-wrap' }, head, grid);

    totalSupply(o).then((total) => {
      if (!total) { head.textContent = `No ${o.unit}s minted yet`; return; }
      head.textContent = `All ${total} ${o.unit}${total === 1 ? '' : 's'} minted · newest first`;
      const ids = Array.from({ length: total }, (_, i) => total - i);
      const fill = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          fill.unobserve(e.target);
          const { tile, id } = e.target._tok;
          tokenMeta(o, id).then((m) => {
            if (!m) return;
            tile.querySelector('.piece').replaceChildren(el('img', { src: m.image, alt: m.name, loading: 'lazy', decoding: 'async' }));
            tile.querySelector('.traits').textContent = (m.attributes || []).map(a => a.value).slice(0, 2).join(' · ');
          }).catch(() => {});
        }
      }, { rootMargin: '400px' });
      section._fill = fill; // keep the observer alive, or the browser may collect it
      grid.append(...ids.map((id, i) => {
        const tile = el('figure', { class: 'live' },
          el('button', { class: 'piece', type: 'button', 'aria-label': `Open ${c.name} #${id}`, onclick: () => openToken(c, ids, i) },
            el('span', { class: 'wait', text: `#${id}` })),
          el('figcaption', {}, el('span', { text: `#${id}` }), el('span', { class: 'traits' })));
        tile._tok = { tile, id };
        fill.observe(tile);
        return tile;
      }));
    }).catch(() => { head.textContent = `Could not read the chain. See the full collection on OpenSea.`; });
    return section;
  }

  // one token: its own code running from Arweave, with traits and links
  function openToken(c, ids, i) {
    const o = c.onchain;
    openDialog((k) => {
      k = (k + ids.length) % ids.length;
      const id = ids[k];
      const stage = el('div', { class: 'stage big' }, el('span', { class: 'wait', text: `Loading #${id}…` }));
      const info = el('div', { class: 'tokeninfo' });
      tokenMeta(o, id).then((m) => {
        if (!m) { stage.firstChild.textContent = 'Not revealed yet.'; return; }
        const live = arweave(m.animation_url);
        stage.replaceChildren(live ? el('iframe', { src: live, title: m.name }) : el('img', { src: m.image, alt: m.name }));
        const bar = el('i'), progress = el('div', { class: 'progress', hidden: true }, bar);
        const gifBtn = o.gif && live ? el('button', { type: 'button', class: 'btn primary', text: 'Download as GIF' }) : null;
        if (gifBtn) gifBtn.onclick = () => downloadGif(o, m, id, gifBtn, progress, bar);
        info.replaceChildren(
          el('span', { class: 'small', text: (m.attributes || []).map(a => `${a.trait_type}: ${a.value}`).join(' · ') }),
          el('span', { class: 'links' },
            gifBtn,
            live ? ext(live, 'Full screen', 'btn') : null,
            ext(`https://opensea.io/item/${o.chain}/${o.contract}/${id}`, 'OpenSea', 'btn'),
            ext(`https://highlight.xyz/mint/${o.highlight}/t/${id}`, 'Highlight', 'btn')),
          gifBtn ? progress : null);
      }).catch(() => { stage.firstChild.textContent = 'Could not load this piece.'; });
      return [el('div', {}, stage, info), `${c.name} #${id}`, k];
    }, i);
  }

  // ---------- GIF download (same method as the PENDING viewer) ----------
  // Runs the token's deployed code from Arweave in a hidden same-origin frame,
  // steps every frame of its loop through the sketch's window.__glyph hook,
  // then encodes a looping GIF in the browser with gifenc.
  const codeCache = new Map();
  function deployedCode(base) {
    if (!codeCache.has(base)) codeCache.set(base, (async () => {
      const html = await (await fetch(base + 'index.html')).text();
      const srcs = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((x) => x[1]);
      return Promise.all(srcs.map(async (s) => ({ s, code: await (await fetch(new URL(s, base))).text() })));
    })());
    return codeCache.get(base);
  }

  async function downloadGif(o, m, id, btn, progress, bar) {
    const label = btn.textContent;
    const say = (t) => { btn.textContent = t; };
    const tick = () => new Promise((r) => setTimeout(r));
    btn.disabled = true; progress.hidden = false; bar.style.width = '0';
    let frame, blobs = [];
    try {
      say('Loading code…');
      const { GIFEncoder, quantize, applyPalette } = await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js');
      const src = new URL(arweave(m.animation_url));
      const base = src.origin + src.pathname.slice(0, src.pathname.lastIndexOf('/') + 1);
      const scripts = await deployedCode(base);
      // hl-gen reads the mint parameters from location.search; a srcdoc frame has none, so hand them in
      blobs = scripts.map(({ s, code }) => {
        if (/hl-gen/.test(s)) code = code.replace('window.location.search', JSON.stringify(src.search));
        return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      });
      frame = el('iframe', { class: 'capture', title: 'GIF renderer' });
      frame.srcdoc = `<!doctype html><html><body style="margin:0">${blobs.map((b) => `<script src="${b}"><\/script>`).join('')}</body></html>`;
      document.body.append(frame);
      const t0 = Date.now();
      while (!frame.contentWindow.__glyph) {
        if (Date.now() - t0 > 20000) throw new Error('piece did not start');
        await new Promise((r) => setTimeout(r, 100));
      }
      const w = frame.contentWindow;
      w.noLoop();
      const G = w.__glyph, cnv = frame.contentDocument.querySelector('canvas');
      const ctx = cnv.getContext('2d');
      const W = cnv.width, H = cnv.height, S = o.gif.scale || 1;

      // pass 1: render every frame of the loop, keep the pixels
      const frames = [];
      for (let f = 0; f < G.frames; f++) {
        G.frame(f);
        frames.push(ctx.getImageData(0, 0, W, H).data.slice());
        if (f % 4 === 0) { say(`Rendering ${f + 1}/${G.frames}`); bar.style.width = `${(f / G.frames) * 70}%`; await tick(); }
      }
      // palette: a piece uses a handful of colours, so collect them exactly
      const seen = new Map();
      outer: for (const px of frames) for (let i = 0; i < px.length; i += 4) {
        const k = (px[i] << 16) | (px[i + 1] << 8) | px[i + 2];
        if (!seen.has(k)) { seen.set(k, seen.size); if (seen.size > 256) break outer; }
      }
      const exact = seen.size <= 256;
      const palette = exact ? [...seen.keys()].map((k) => [k >> 16, (k >> 8) & 255, k & 255]) : quantize(frames[0], 256);
      // one spare slot marks "unchanged since the last frame", which keeps the file small
      const CLEAR = palette.length < 256 ? palette.length : -1;
      if (CLEAR >= 0) palette.push([0, 0, 0]);

      // pass 2: index, scale up with nearest neighbour, encode
      const gif = GIFEncoder();
      const delay = Math.round(1000 / G.fps);
      const big = new Uint8Array(W * S * H * S);
      let prev = null;
      for (let f = 0; f < frames.length; f++) {
        const px = frames[f];
        let idx;
        if (exact) { idx = new Uint8Array(W * H); for (let i = 0, p = 0; i < idx.length; i++, p += 4) idx[i] = seen.get((px[p] << 16) | (px[p + 1] << 8) | px[p + 2]); }
        else idx = applyPalette(px, palette);
        const out = idx.slice();
        if (prev && CLEAR >= 0) for (let i = 0; i < out.length; i++) if (idx[i] === prev[i]) out[i] = CLEAR;
        prev = idx;
        for (let y = 0; y < H * S; y++) {
          const from = ((y / S) | 0) * W, to = y * W * S;
          for (let x = 0; x < W * S; x++) big[to + x] = out[from + ((x / S) | 0)];
        }
        const opts = { palette: f === 0 ? palette : undefined, delay, repeat: 0, dispose: 1 };
        if (f > 0 && CLEAR >= 0) Object.assign(opts, { transparent: true, transparentIndex: CLEAR });
        gif.writeFrame(big, W * S, H * S, opts);
        if (f % 4 === 0) { say(`Encoding ${f + 1}/${frames.length}`); bar.style.width = `${70 + (f / frames.length) * 30}%`; await tick(); }
      }
      gif.finish();
      const blob = new Blob([gif.bytes()], { type: 'image/gif' });
      const a = el('a', { href: URL.createObjectURL(blob), download: `${o.gif.file}-${id}.gif` });
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      bar.style.width = '100%';
      say(`Saved (${Math.round(blob.size / 1024)} KB)`);
    } catch (e) {
      console.error(e);
      say('GIF failed, try again');
    } finally {
      frame?.remove();
      blobs.forEach((b) => URL.revokeObjectURL(b));
      setTimeout(() => { btn.disabled = false; btn.textContent = label; progress.hidden = true; }, 2500);
    }
  }

  // ---------- gallery with lightbox ----------
  function gallery(c) {
    if (c.live) return liveGallery(c);
    if (c.onchain) return chainGallery(c);
    if (!c.gallery || !c.gallery.length) return null;
    const items = c.gallery.map((src, i) => el('button', {
      class: 'piece', type: 'button', 'aria-label': `Open ${c.name} sample ${i + 1}`,
      onclick: () => openBox(c, i),
    }, img(src, `${c.name} sample ${i + 1}`, i < 2)));
    const heading = c.slug === 'glyphpunks' ? 'A few samples' : statusOf(c) === 'dev' || statusOf(c) === 'upcoming' ? 'Previews' : 'Gallery';
    return el('section', { class: 'gallery-wrap' },
      el('h2', { class: 'label', text: heading }),
      el('div', { class: 'gallery' }, items));
  }

  function openBox(c, i) {
    const n = c.gallery.length;
    openDialog((k) => {
      i = (k + n) % n;
      return [el('img', { src: url(c.gallery[i]), alt: `${c.name} sample ${i + 1}` }), `${c.name} ${i + 1}/${n}`, i];
    }, i);
  }

  // render(k) returns [content, caption, index actually shown]
  let box;
  function openDialog(render, i) {
    if (!box) {
      box = el('dialog', { class: 'box' });
      box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.close')) box.close(); });
      box.addEventListener('close', () => box.replaceChildren()); // stops a live sketch
      box.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') box._step(1);
        if (e.key === 'ArrowLeft') box._step(-1);
      });
      document.body.append(box);
    }
    const show = (k) => {
      const [content, caption, shown] = render(k);
      i = shown;
      box.replaceChildren(
        content,
        el('div', { class: 'boxbar' },
          el('button', { type: 'button', class: 'btn', text: '←', 'aria-label': 'Previous', onclick: () => show(i - 1) }),
          el('span', { text: caption }),
          el('button', { type: 'button', class: 'btn', text: '→', 'aria-label': 'Next', onclick: () => show(i + 1) }),
          el('button', { type: 'button', class: 'btn close', text: 'Close' })));
    };
    box._step = (d) => show(i + d);
    show(i);
    box.showModal();
  }

  // ---------- pages ----------
  function card(c) {
    return el('a', { class: 'card', href: url(`${c.slug}/index.html`) },
      el('div', { class: 'thumb' }, cover(c, c.name)),
      el('div', { class: 'cardtext' },
        el('div', { class: 'cardhead' }, el('h3', { text: c.name })),
        el('p', { text: c.tagline }),
        badge(c)));
  }

  function home() {
    const now = COLLECTIONS.filter(c => statusOf(c) === 'live');
    const soon = COLLECTIONS.filter(c => ['upcoming', 'dev'].includes(statusOf(c)));
    const released = COLLECTIONS.filter(c => !now.includes(c) && !soon.includes(c));

    const nowItem = (c) => el('li', { class: 'now-item' },
      el('a', { class: 'now-thumb', href: url(`${c.slug}/index.html`) }, img(c.cover, c.name, true)),
      el('div', {},
        el('h3', {}, el('a', { href: url(`${c.slug}/index.html`), text: c.name })),
        el('p', { text: c.tagline }),
        el('p', { class: 'small', text: [c.mint.priceShort || c.mint.price, c.mint.chain, c.mint.edition].filter(Boolean).join(' · ') }),
        c.mint.closes ? el('p', { class: 'small', text: `Closes ${fmtDate(c.mint.closes)}` }) : null,
        c.links.highlight ? ext(c.links.highlight, 'MINT →', 'btn primary') : null));

    const soonItem = (c) => el('li', {},
      el('a', { href: url(`${c.slug}/index.html`) },
        el('img', { src: url(c.cover), alt: '', loading: 'lazy' }),
        el('span', { class: 'soon-name', text: c.name }),
        badge(c)));

    return [
      el('section', { class: 'hero' },
        el('pre', { class: 'ascii', 'aria-hidden': 'true' }, [...ASCII].map(ch => ch === '░' ? el('span', { text: ch }) : ch)),
        el('h1', { class: 'sr-only', text: 'GlyphArt' }),
        el('div', { class: 'bio' }, artist.bio.map(p => el('p', { text: p })),
          el('p', {}, 'Follow on X: ', ext(artist.x, artist.xHandle)))),
      el('section', { class: 'nowbox', 'aria-labelledby': 'now-h' },
        el('h2', { class: 'label', id: 'now-h' }, el('span', { class: 'dot', 'aria-hidden': 'true' }), 'Now minting'),
        now.length ? el('ul', { class: 'now' }, now.map(nowItem)) : el('p', { class: 'small', text: 'Nothing is minting right now. Follow on X for the next drop.' }),
        soon.length ? [
          el('h2', { class: 'label', text: 'Upcoming' }),
          el('ul', { class: 'soon' }, soon.map(soonItem)),
        ] : null),
      el('section', { 'aria-labelledby': 'col-h' },
        el('h2', { class: 'label', id: 'col-h', text: 'Collections' }),
        el('div', { class: 'cards' }, [...now, ...released, ...soon].map(card))),
    ];
  }

  function collection(c) {
    document.title = `${c.name} · GlyphArt`;
    return [
      el('p', { class: 'crumbs' }, el('a', { href: url('index.html'), text: 'GlyphArt' }), ' / ', c.name),
      el('section', { class: 'intro' },
        c.live
          ? el('div', { class: 'feature stage' }, liveFrame(c, c.live.tokens.find(t => t.id === c.live.feature) || c.live.tokens[0], true))
          : el('div', { class: 'feature' }, cover(c, `${c.name} by GlyphArt`, true)),
        el('div', { class: 'about' },
          el('h1', { text: c.name }),
          el('p', { class: 'tagline', text: c.tagline }),
          c.description.map(p => el('p', { text: p })),
          mintPanel(c))),
      gallery(c),
    ];
  }

  // the wordmark, set in a 5x5 bitmap glyph font
  const ASCII = [
    '░███░ █░░░░ █░░░█ ████░ █░░░█ ░███░ ████░ █████',
    '█░░░░ █░░░░ ░█░█░ █░░░█ █░░░█ █░░░█ █░░░█ ░░█░░',
    '█░░██ █░░░░ ░░█░░ ████░ █████ █████ ████░ ░░█░░',
    '█░░░█ █░░░░ ░░█░░ █░░░░ █░░░█ █░░░█ █░░█░ ░░█░░',
    '░███░ █████ ░░█░░ █░░░░ █░░░█ █░░░█ █░░░█ ░░█░░',
  ].join('\n');

  const main = el('main', { id: 'main' });
  const page = SLUG ? COLLECTIONS.find(c => c.slug === SLUG) : null;
  main.append(...[SLUG ? (page ? collection(page) : el('p', { text: 'Collection not found.' })) : home()].flat(3).filter(Boolean));
  body.prepend(header(), main, footer());
})();
