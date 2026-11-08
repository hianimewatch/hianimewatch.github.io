// 9Anime Global Configuration (Custom High-Speed R2 CDN) - Build 2026.10.08
window.R2_DATA_URL = '/data'; // same-origin proxy: edge-cached by the worker, so visitors do not each cause an R2 read
window.R2_POSTERS_URL = 'https://cdn.bingnews.in/static/images/posters';
window.R2_BACKDROPS_URL = 'https://cdn.bingnews.in/static/images/backdrops';

// Universal slug cleaner & canonical normalizer
window.cleanSlug = function (s) {
    if (!s) return '';
    var str = String(s);
    try {
        while (str.indexOf('%') !== -1) {
            var decoded = decodeURIComponent(str);
            if (decoded === str) break;
            str = decoded;
        }
    } catch (e) {}

    // Replace special unicode characters
    str = str.replace(/[√√]/g, 'v')
             .replace(/[½]/g, '1-2')
             .replace(/[♪♫]/g, '')
             .replace(/[∞]/g, '')
             .replace(/[:!?.,'"`#()\[\]]/g, '')
             .replace(/\s+/g, '-')
             .replace(/--+/g, '-')
             .toLowerCase()
             .trim();

    // Map known legacy or broken aliases to canonical slugs
    var ALIAS_MAP = {
        'tokyo-ghoul-e2889aa': 'tokyo-ghoul-va',
        'tokyo-ghoul-e2889aa-dub': 'tokyo-ghoul-va-dub',
        'tokyo-ghoul-root-a': 'tokyo-ghoul-va',
        'tokyo-ghoul-root-a-dub': 'tokyo-ghoul-va-dub',
        'tokyo-ghoul-a': 'tokyo-ghoul-va',
        'tokyo-ghoul-a-dub': 'tokyo-ghoul-va-dub',
        'ranma-c2bd': 'ranma-1-2',
        'ranma-c2bd-dub': 'ranma-1-2-dub',
        'ranma-c2bd-2024-2nd-season': 'ranma-1-2-2024-2nd-season',
        'ranma-c2bd-2024-2nd-season-dub': 'ranma-1-2-2024-2nd-season-dub',
        'rick-and-morty-the-dub': 'rick-and-morty-the-anime-dub',
        'you-and-idol-precuree299aa': 'you-and-idol-precure',
        'bang-dream-yumemita': 'bang-dream-yume-mita'
    };

    if (ALIAS_MAP[str]) {
        return ALIAS_MAP[str];
    }
    return str;
};

// Immediate high-res asset resolver (runs synchronously before any rendering)
window.POSTERS_R2_FIRST = true; // set false to go back to using the stored URL (AniList etc.) first
// Card grids show a poster at about 160x230 px: use the 360 px WebP copy (about 20 KB) made by poster_thumbs.py
// instead of the full cover (150-470 KB). If a thumbnail does not exist yet, onPosterError() falls back to the full poster.
window.POSTER_THUMBS = true;
window.resolvePosterThumb = function (url, slug) {
    if (slug && window.POSTER_THUMBS) return 'https://cdn.bingnews.in/static/images/posters-sm/' + encodeURIComponent(slug) + '.webp';
    return window.resolvePoster(url, slug);
};
window.resolvePoster = function (url, slug) {
    // Every poster lives in R2 under /static/images/posters/<slug>.jpg with a one-year cache header,
    // so the browser and Cloudflare serve it without touching R2 again. If it fails to load,
    // onPosterError() falls back to the AniList copy (data/poster_fallback.json), then other copies.
    if (slug && window.POSTERS_R2_FIRST) {
        return 'https://cdn.bingnews.in/static/images/posters/' + slug + '.jpg';
    }
    if (url && typeof url === 'string') {
        var trimmed = url.trim();
        if (trimmed.length > 0 && trimmed.indexOf('placeholder') === -1) {
            // 0. Permanent R2 CDN images - TOP PRIORITY
            if (trimmed.indexOf('cdn.bingnews.in/') !== -1) {
                if (slug) { try { sessionStorage.setItem('poster_' + slug, trimmed); } catch(e) {} }
                return trimmed;
            }

            // 1. AniList pristine high-res posters - ALWAYS top priority
            if (trimmed.indexOf('anilist.co') !== -1 || trimmed.indexOf('s4.anilist.co') !== -1) {
                if (slug) { try { sessionStorage.setItem('poster_' + slug, trimmed); } catch(e) {} }
                return trimmed;
            }

            // 2. Route upstream 9anime / wp-content directly to our fast R2 CDN posters
            if (trimmed.indexOf('wp-content') !== -1 || trimmed.indexOf('9anime.org.lv') !== -1) {
                if (slug) {
                    var r2Poster = 'https://cdn.bingnews.in/static/images/posters/' + slug + '.jpg';
                    try { sessionStorage.setItem('poster_' + slug, r2Poster); } catch(e) {}
                    return r2Poster;
                }
            }

            if (trimmed.indexOf('aniwave') !== -1 || trimmed.indexOf('aniwaves.ru') !== -1) {
                if (slug) { try { sessionStorage.setItem('poster_' + slug, trimmed); } catch(e) {} }
                return trimmed;
            }

            // 3. Any other valid direct HTTP/HTTPS URL
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                return trimmed;
            }
        }
    }

    if (slug) {
        return 'https://cdn.bingnews.in/static/images/posters/' + slug + '.jpg';
    }

    return '/static/images/placeholder.svg';
};

window.resolveBackdrop = function (url, slug) {
    if (url && typeof url === 'string') {
        var trimmed = url.trim();
        if (trimmed.indexOf('163142-r9qP3h4Qo38u.jpg') !== -1) {
            return 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/163142-bb4qbJTxMZ9m.jpg';
        }
        if (trimmed.length > 0 && 
            trimmed.indexOf('bingnews.in/static/images') === -1 && 
            trimmed.indexOf('/static/images/backdrops') === -1 && 
            trimmed.indexOf('placeholder') === -1) {

            if (trimmed.indexOf('cdn.bingnews.in/images/') !== -1) {
                return trimmed;
            }
            if (trimmed.indexOf('anilist.co') !== -1 || trimmed.indexOf('s4.anilist.co') !== -1 || 
                trimmed.indexOf('aniwaves') !== -1 || trimmed.indexOf('wp-content') !== -1) {
                return trimmed;
            }
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                return trimmed;
            }
        }
    }

    // Fallback: use poster if available
    if (slug) {
        var p = window.resolvePoster(null, slug);
        if (p && p.indexOf('placeholder') === -1) {
            return p;
        }
    }

    return '';
};

// Asynchronous poster lookup from search_index.json (resolves cold visits / direct links)
window.lookupPosterFromIndex = function (slug) {
    if (!slug) return Promise.resolve(null);
    try {
        var cached = sessionStorage.getItem('poster_' + slug);
        if (cached && cached.indexOf('bingnews.in/static/images/posters') === -1 && cached.indexOf('placeholder') === -1) {
            return Promise.resolve(cached);
        }
    } catch(e) {}

    if (!window.__searchIndexMapPromise) {
        window.__searchIndexMapPromise = fetch('/data/search_index.json')
            .then(function(res) { return res.ok ? res.json() : []; })
            .then(function(data) {
                var map = {};
                for (var i = 0; i < data.length; i++) {
                    if (data[i].s && data[i].p && 
                        data[i].p.indexOf('bingnews.in/static/images/posters') === -1 && 
                        data[i].p.indexOf('placeholder') === -1) {
                        map[data[i].s] = data[i].p;
                    }
                }
                window.__searchIndexMap = map;
                return map;
            })
            .catch(function() { return {}; });
    }

    return window.__searchIndexMapPromise.then(function(map) {
        var clean = window.cleanSlug ? window.cleanSlug(slug) : slug;
        var poster = map[slug] || map[clean];
        if (poster && poster.indexOf('placeholder') === -1 && poster.indexOf('bingnews.in/static/images/posters') === -1) {
            try { sessionStorage.setItem('poster_' + slug, poster); } catch(e) {}
            return poster;
        }
        return null;
    });
};

// ---------------------------------------------------------------------------
// Poster recovery chain (used by every <img onerror="onPosterError(this, slug)"> on the site)
//
// A poster can live in several places: the URL stored with the anime, the R2 copy under
// /static/images/posters/<slug>.jpg, the older /images/posters/<slug>.jpg path, a .webp copy,
// or the original upstream image. If one of them fails to load, or loads as a tiny thumbnail,
// we move on to the next candidate instead of giving up after a single retry.
// ---------------------------------------------------------------------------
(function () {
    var R2 = 'https://cdn.bingnews.in';
    var PLACEHOLDER = '/static/images/placeholder.svg';
    var TINY = 100; // px: anything narrower than this is a thumbnail, not a poster
    var MAX_STEPS = 6;

    function key(u) {
        return String(u || '').replace(/^http:/, 'https:').split('?')[0].split('#')[0];
    }
    function triedList(img) {
        try { return JSON.parse(img.dataset.pTried || '[]'); } catch (e) { return []; }
    }
    function r2Variants(slug) {
        var s = encodeURIComponent(slug);
        return [
            R2 + '/static/images/posters/' + s + '.jpg',
            R2 + '/images/posters/' + s + '.jpg',
            R2 + '/static/images/posters/' + s + '.webp',
            R2 + '/images/posters/' + s + '.webp'
        ];
    }

    // slug -> AniList cover, published by the poster sync job. Fetched once, only when a poster fails.
    function fallbackMap() {
        if (!window.__posterFallbackMap) {
            window.__posterFallbackMap = fetch('/data/poster_fallback.json')
                .then(function (r) { return r.ok ? r.json() : {}; })
                .catch(function () { return {}; });
        }
        return window.__posterFallbackMap;
    }

    // Ordered candidate list for one slug (best first), without anything already tried
    function candidates(slug, img) {
        var base = (window.cleanSlug ? window.cleanSlug(slug) : slug) || slug;
        var tried = triedList(img);
        var seen = {};
        function fresh(list) {
            return list.filter(function (u) {
                var k = key(u);
                if (!u || seen[k] || tried.indexOf(k) !== -1) return false;
                seen[k] = true;
                return true;
            });
        }
        return fallbackMap().then(function (fb) {
            fb = fb || {};
            var list = [];
            var anilist = fb[slug] || fb[base];
            if (anilist) list.push(anilist);          // 1. AniList cover for this title
            list = list.concat(r2Variants(slug));     // 2. the R2 copies
            if (base !== slug) list = list.concat(r2Variants(base));
            list = fresh(list);
            if (list.length) return list;
            // 3. last resort: the URL stored in the search index (a ~500 KB file, so only fetched when nothing else is left)
            var lookup = window.lookupPosterFromIndex ? window.lookupPosterFromIndex(slug) : Promise.resolve(null);
            return lookup.catch(function () { return null; }).then(function (indexUrl) { return fresh(indexUrl ? [indexUrl] : []); });
        });
    }

    // Try the next candidate. `onExhausted` runs when nothing is left.
    function advance(img, slug, onExhausted) {
        var tried = triedList(img);
        var current = key(img.currentSrc || img.src);
        if (tried.indexOf(current) === -1) tried.push(current);
        img.dataset.pTried = JSON.stringify(tried);
        if (tried.length > MAX_STEPS) { onExhausted(); return; }
        candidates(slug, img).then(function (list) {
            if (!list.length) { onExhausted(); return; }
            var next = list[0];
            img.src = next;
            var heroBg = document.getElementById('animeHeroBg');
            if (heroBg && (img.id === 'animeHeroImg' || img.id === 'overviewPoster')) {
                heroBg.style.backgroundImage = "url('" + next + "')";
            }
        });
    }

    function slugOf(img) {
        if (img.dataset.pSlug) return img.dataset.pSlug;
        var m = (img.currentSrc || img.src || '').match(/\/posters(?:-sm)?\/([^\/?#]+?)\.(?:jpg|jpeg|png|webp)(?:[?#].*)?$/i);
        return m ? decodeURIComponent(m[1]) : '';
    }

    // Universal error handler for any <img> across the entire site
    window.onPosterError = function (img, slug) {
        if (!img) return;
        if ((img.currentSrc || img.src || '').indexOf('placeholder') !== -1) return;
        slug = slug || slugOf(img);
        if (slug) img.dataset.pSlug = slug;
        if (!slug) { img.src = PLACEHOLDER; return; }
        // the small WebP is missing (new title, thumbnail job not run yet): use the full poster, no lookups needed
        if ((img.currentSrc || img.src || '').indexOf('/posters-sm/') !== -1) {
            img.src = R2 + '/static/images/posters/' + encodeURIComponent(slug) + '.jpg';
            return;
        }
        advance(img, slug, function () {
            if (img.dataset.pThumb) { img.dataset.pDone = '1'; img.src = img.dataset.pThumb; } // a small real poster beats the empty placeholder
            else img.src = PLACEHOLDER;
        });
    };

    // A poster that "loads" as a tiny thumbnail is as bad as a missing one: look for a better copy.
    // If nothing better exists we keep the thumbnail rather than showing the empty placeholder.
    document.addEventListener('load', function (e) {
        var img = e.target;
        if (!img || img.tagName !== 'IMG') return;
        var src = img.currentSrc || img.src || '';
        if (src.indexOf('placeholder') !== -1 || src.indexOf('/posters/') === -1) return;
        if (img.dataset.pDone) return;
        if (!img.naturalWidth || img.naturalWidth >= TINY) return;
        var slug = slugOf(img);
        if (!slug) return;
        img.dataset.pSlug = slug;
        if (!img.dataset.pThumb) img.dataset.pThumb = src;
        advance(img, slug, function () { img.dataset.pDone = '1'; /* nothing better: keep the thumbnail */ });
    }, true);
})();
