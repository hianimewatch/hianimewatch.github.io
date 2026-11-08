HiAnime landing page - Cloudflare Pages direct upload
====================================================
1. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Upload assets.
2. Name the project, upload hianime-landing.zip (or drag this folder), click Deploy.
3. Add a custom domain under the project's Custom domains tab if you want one.

What is inside
  index.html              the landing page (pre-rendered, rebranded copy of the watch-anime-online landing page)
  static/                 stylesheet, ad loader script, logo, favicon
  config.js               site settings used by the page scripts
  robots.txt, _headers    crawl rules and caching

Notes
  - Canonical is relative ("/"), so the page points to itself on whatever domain you use.
  - All anime, watch, genre, A-Z and search links open https://hianime.9anime.cfd
  - Poster images load from https://cdn.bingnews.in
  - No sitemap.xml is included because it needs your final domain.
