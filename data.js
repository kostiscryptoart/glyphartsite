/*
 * All collection data for the site lives here.
 * To add a collection: add an entry to COLLECTIONS, create a folder with the
 * same name as its `slug` holding a copy of any collection index.html, and put
 * its images in assets/<slug>/. See README.md.
 *
 * Fields
 *   slug        folder name and URL path
 *   name        display name
 *   tagline     one line for cards and the page header
 *   description array of paragraphs
 *   status      "live" | "upcoming" | "dev" | "secondary" | "released"
 *               "live" switches to "secondary" automatically after mint.closes
 *   cover       image used on the home page card (relative to the site root)
 *   gallery     list of images (relative to the site root); [] for no gallery
 *   onchain     optional: gallery of every minted token, read from the chain and Highlight's
 *               metadata on page load: { chain, contract, highlight (collection id), unit }
 *               add gif: { scale, file } for a "Download as GIF" button (needs window.__glyph in the code)
 *   live        optional: run the collection's code in the gallery instead of images (see Dendron)
 *   mint        details shown in the mint panel; missing values show as "TBA"
 *   links       { highlight, opensea, oncyber, viewer } (null to hide)
 */
window.GLYPHART = {
  artist: {
    name: 'GlyphArt',
    bio: [
      'GlyphArt is a generative artist working in ASCII and bitmap glyphs.',
      'Every piece is drawn from a hand-built grid of characters: no fonts, no smoothing, one cell at a time. The work moves between PFP collections, interactive generative code and long-form series minted live on chain.',
    ],
    x: 'https://x.com/GlyphPunksNFT',
    xHandle: '@GlyphPunksNFT',
  },

  COLLECTIONS: [
    {
      slug: 'pending',
      name: 'PENDING',
      tagline: 'A board of transactions that never confirm.',
      description: [
        'PENDING is a board of transactions that never confirm.',
        'Every capsule on the board is an ASCII loader. Bars fill and drain, stall at 99%, retry from zero, bounce back and forth. Counters tick, spinners spin. Confirmations climb to 5 of 6 and fall back with the block, every time.',
        'Below the board, your own mint is called, hashed and retried. The footer shows the real block, your wallet and your token number, next to a KECCAK256 readout that never settles.',
        'Each board is generated at mint from its hash, drawn entirely in 8x8 glyphs, and loops forever, because it never finishes.',
        'Free to mint on Ethereum for 6 days, one for each confirmation. On the sixth, it finally confirms and the mint closes.',
      ],
      status: 'live',
      cover: 'assets/pending/01.gif',
      gallery: [], // the gallery shows every minted board (see onchain)
      mint: {
        platform: 'Highlight',
        chain: 'Ethereum',
        price: 'Free',
        edition: 'Open generative edition, max 3 per wallet',
        opens: '2026-10-23T14:00:00Z',
        closes: '2026-10-29T17:00:00Z',
        contract: '0xD74d858583857BB95e4b89A96F17B90E0BC3A090',
      },
      // gallery of every minted board, read from the chain on page load
      onchain: { chain: 'ethereum', contract: '0xd74d858583857bb95e4b89a96f17b90e0bc3a090', highlight: '01a15b2b-af4a-772b-a266-56b32540e6aa', unit: 'board',
        // "Download as GIF" on each board: one full loop, 96 frames, 384 px canvas at 2x = 768 px
        gif: { scale: 2, file: 'pending' } },
      links: {
        highlight: 'https://highlight.xyz/mint/01a15b2b-af4a-772b-a266-56b32540e6aa',
        opensea: 'https://opensea.io/collection/pending-616640804',
      },
    },
    {
      slug: 'dendron',
      name: 'Dendron',
      tagline: 'Interactive fractal trees that quiver at your touch.',
      description: [
        'Dendron is a generative art project that explores the beauty of natural forms through interactive fractal trees.',
        'The trees have varied branch growth patterns that are implemented with an L-System.',
        'Try touching or hovering your mouse over them. The trees respond by quivering their branches and leaves.',
      ],
      status: 'live',
      cover: 'assets/dendron/01.jpg',
      gallery: [],
      // the gallery runs each minted token's own code with that token's hash
      live: {
        code: 'dendron/live/index.html',
        feature: 17,
        hint: 'Every tree below is live code. Hover over it, or touch and drag on a phone, and the branches and leaves quiver.',
        tokens: [
        { id: 1, h: '0xf5dd70f7f874606d6335976fecf08d1d081739ee2403e326775aedd07af7be38', traits: 'Black on White · Ellipse' },
        { id: 2, h: '0xf5dd70f7f874606d6335976fecf08d1d081739ee2403e326775aedd07af7be38', traits: 'Sunset · Triangle' },
        { id: 3, h: '0xf5dd70f7f874606d6335976fecf08d1d081739ee2403e326775aedd07af7be38', traits: 'Amber Midnight · Triangle' },
        { id: 4, h: '0xf5dd70f7f874606d6335976fecf08d1d081739ee2403e326775aedd07af7be38', traits: 'Azure Cyan · Ellipse' },
        { id: 5, h: '0xf5dd70f7f874606d6335976fecf08d1d081739ee2403e326775aedd07af7be38', traits: 'Cyan Noir · Orthogonal' },
        { id: 6, h: '0x995f57086a78fc154d8a05697a8a5127feb901402edf9201ae439dbaa5a12b9a', traits: 'Amber Midnight · Orthogonal' },
        { id: 7, h: '0xe908feecfc7d7f4ca7958e18b4a54a435de9b1c210e1ed33e95a0f93088f8257', traits: 'Black on White · Ellipse' },
        { id: 8, h: '0xe908feecfc7d7f4ca7958e18b4a54a435de9b1c210e1ed33e95a0f93088f8257', traits: 'Sapphire Blaze · Orthogonal' },
        { id: 9, h: '0xc6bd1e90e1b8d0e5700620a3ea316924bfc74747daf18d0f3b11ff212a413941', traits: 'Turquoise Salmon · Triangle' },
        { id: 10, h: '0xc6bd1e90e1b8d0e5700620a3ea316924bfc74747daf18d0f3b11ff212a413941', traits: 'Black on White · Triangle' },
        { id: 11, h: '0xc6bd1e90e1b8d0e5700620a3ea316924bfc74747daf18d0f3b11ff212a413941', traits: 'Twilight Brass · Orthogonal' },
        { id: 12, h: '0x480b7a596e462bafcc2b7fb1d959da50e144bb0b28ab2a573af676cfa0d63d11', traits: 'Sunset · Triangle' },
        { id: 13, h: '0x4184ed3fdcf225a28657632fe4cf6a17a92a21bdeecd7a140ac19322db5fae76', traits: 'Azure Cyan · Ellipse' },
        { id: 14, h: '0x4184ed3fdcf225a28657632fe4cf6a17a92a21bdeecd7a140ac19322db5fae76', traits: 'Rustic Navy · Ellipse' },
        { id: 15, h: '0x3b151389ba03030550ce38b190fc45d674937a7f252ce0fd306924966e59475c', traits: 'Cyan Noir · Orthogonal' },
        { id: 16, h: '0x6d4e874494630299ccd6f6507251b82581573354aedd1ca0fb742060ac641518', traits: 'Rustic Navy · Ellipse' },
        { id: 17, h: '0x6c675774464d0cca8fe4e904bfc07650bb3f57195a45f97f4f7cd0639a975550', traits: 'Inverse Kaleidoscope · Triangle' },
        { id: 18, h: '0x616552576d65e472d7ab17d97b45061731e062aa37f145ff1e06f624597946da', traits: 'Rustic Navy · Orthogonal' },
        { id: 19, h: '0x0bbd992653bd510273c7c8b72929372767cb76af8e19b2311b61f7663a83240e', traits: 'Desert · Orthogonal' },
        ],
      },
      mint: {
        platform: 'Highlight',
        chain: 'Base',
        price: '0.005 ETH',
        edition: 'Generative series of 1024',
        contract: null,
      },
      links: {
        highlight: 'https://highlight.xyz/mint/019f5ddf-25c5-73e9-b0b6-fb9655e035b3',
        opensea: null,
      },
    },
    {
      slug: 'phlow',
      name: 'Phlow',
      tagline: 'Glyph groups that live and die by survival rules.',
      description: [
        'Phlow is a generative art project that explores the fluidity of visual dynamics through a grid of evolving ASCII glyph groups.',
        'The grid serves as a canvas where the glyph groups interact based on survival rules, creating ever-changing compositions.',
      ],
      status: 'live',
      cover: 'assets/phlow/05.gif',
      gallery: [], // the gallery shows every minted piece (see onchain)
      mint: {
        platform: 'Highlight',
        chain: 'Ethereum',
        price: '0.01 ETH',
        edition: 'Generative series of 256',
      },
      onchain: { chain: 'ethereum', contract: '0xebcd4cdefeec890e436168de137fb5852642f329', highlight: '019f5ddf-5140-71c2-ba8f-580468dd93f8', unit: 'piece' },
      links: {
        highlight: 'https://highlight.xyz/mint/019f5ddf-5140-71c2-ba8f-580468dd93f8',
        opensea: 'https://opensea.io/collection/phlow-1',
      },
    },
    {
      slug: 'dragons',
      name: 'GlyphArt Dragons',
      tagline: 'Four elemental lineages, coiled in glyphs.',
      description: [
        'GlyphArt Dragons is a set of four animated dragons, one for each elemental lineage: red, blue, green and purple.',
        'Each dragon was drawn pixel by pixel, then rebuilt as a living field of glyphs that shimmer and cycle around its body.',
      ],
      status: 'secondary',
      cover: 'assets/dragons/red.gif',
      gallery: ['red', 'blue', 'green', 'purple'].map(n => `assets/dragons/${n}.gif`),
      mint: {
        platform: 'OpenSea',
        chain: 'Ethereum',
        price: null,
        edition: '4 dragons',
      },
      links: {
        opensea: 'https://opensea.io/collection/glyphart-dragons',
      },
    },
    {
      slug: 'postcards',
      name: 'Postcards from the Old Mainframe',
      tagline: 'Old Japanese postcards, rendered by a retro-futuristic machine.',
      description: [
        'Postcards from the Old Mainframe reimagines old Japanese postcards in the digital realm, combining retro-futuristic rendering with traditional designs.',
        'Temples, cherry trees, mountains and rivers are redrawn as animated glyph fields, as if printed by a terminal that remembers paper.',
      ],
      status: 'secondary',
      cover: 'assets/postcards/03.gif',
      gallery: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].map(n => `assets/postcards/${n}.gif`),
      mint: {
        platform: null,
        chain: 'Base',
        price: null,
        edition: '26 postcards',
      },
      links: {
        opensea: 'https://opensea.io/collection/postcards-from-the-old-mainframe',
      },
    },
    {
      slug: 'glyphpunks',
      name: 'GlyphPunks',
      tagline: '500 ASCII punks, rebuilt over several engine versions.',
      description: [
        'GlyphPunks is a 500-piece collection of punks built from ASCII glyphs, and where GlyphArt began.',
        'The collection grew in waves. The first punks were static glyph portraits; later drops added animation, CRT effects, spectrum palettes and fully generative backgrounds, as the glyph engine behind them was rebuilt again and again.',
        'With 500 pieces there is no full gallery here. Browse the whole collection on OpenSea, or walk through it in the 3D gallery on oncyber.',
      ],
      status: 'secondary',
      cover: 'assets/glyphpunks/ogmix.gif',
      // a few samples only: the full set lives on OpenSea and oncyber
      gallery: [
        'assets/glyphpunks/ogmix.gif', 'assets/glyphpunks/punk-1.png', 'assets/glyphpunks/punk-42.png',
        'assets/glyphpunks/punk-100.png', 'assets/glyphpunks/punk-251.gif', 'assets/glyphpunks/punk-351.gif',
        'assets/glyphpunks/punk-452.gif', 'assets/glyphpunks/1year.gif'
      ],
      mint: {
        platform: 'OpenSea',
        chain: 'Ethereum',
        price: null,
        edition: '500 punks',
      },
      links: {
        opensea: 'https://opensea.io/collection/glyph-punks',
        oncyber: 'https://oncyber.io/glyphpunks',
      },
    },
  ],
};
