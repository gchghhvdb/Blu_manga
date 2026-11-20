// صفحهٔ اصلی: اسلایدر، کتابخانه، جستجو و فیلترها
const compactQuotesPanels = [
    { img: '441727.jpg', char: 'گاتس (برسرک)', quote: '«در دل این تاریکی، شمشیرم تنها حقیقت من است.»' },
    { img: '441736.jpg', char: 'توگاوا (مانگای REAL)', quote: '«از اعماق وجودم از این وضعیت متنفرم، اما تسلیم نمی‌شوم.»' },
    { img: '441728.jpg', char: 'توجی فوشیگورو (JJK)', quote: '«مردی بدون ذره‌ای انرژی نفرین‌شده، غرورتان را شکست.»' },
    { img: '441735.jpg', char: 'ماکی زنین (JJK)', quote: '«قلبم را برداشتی؛ پس من هم همه‌چیز را نابود می‌کنم.»' },
    { img: '441733.jpg', char: 'اسکانور (هفت گناه)', quote: '«چه کسی چنین تصمیمی گرفته؟ تنها من تصمیم می‌گیرم!»' },
    { img: '441731.jpg', char: 'توموداچی (پسران قرن ۲۰)', quote: '«پیشگویی آغاز شده است... بیایید دنیا را پس بگیریم.»' },
    { img: '441732.jpg', char: 'تاکیزاوا (توکیو غول)', quote: '«زود باش دیگر... دارم از گرسنگی هلاک می‌شوم!»' },
    { img: '441729.jpg', char: 'لیوای (حمله به تایتان)', quote: '«راهی را انتخاب کن که کمترین پشیمانی را برایت بگذارد.»' },
    { img: '441734.jpg', char: 'سایتاما (وان پانچ من)', quote: '«من فقط نفری هستم که برای سرگرمی قهرمان شده است.»' },
    { img: '441730.jpg', char: 'مشت جدی سایتاما (マジ)', quote: '«حرکت نهایی، سری جدی: مشت جدی!»' }
];

let currentGenreFilter = 'all';
let currentSearchQuery = '';
let isBookmarkFilterActive = false;
let currentHeroSlide = 0;
let featuredIds = [7, 6, 11, 0, 8]; // پیش‌فرض؛ با هر بار باز شدن سایت، به‌صورت تصادفی از کل مانگاها جایگزین می‌شود

function pickRandomFeatured() {
    const ids = shuffled(mangaDatabase.map(m => m.id)).slice(0, 5);
    if (ids.length) { featuredIds = ids; currentHeroSlide = 0; }
}

function renderHeroSlider() {
    const targetId = featuredIds[currentHeroSlide % featuredIds.length];
    const manga = mangaDatabase.find(m => m.id === targetId) || mangaDatabase[0];

    const bgBlur = document.getElementById('hero-bg-blur');
    if (bgBlur) bgBlur.style.backgroundImage = `url('${cv(manga.cover)}')`;

    const container = document.getElementById('hero-slider-content');
    container.innerHTML = `
        <div class="hero-in order-2 lg:order-none lg:col-span-8 space-y-5 text-right">
            <div class="chip inline-flex items-center gap-2 px-3 py-1 rounded-full text-blue-200 text-xs font-bold">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>پیشنهاد امروز · ${manga.status}</span>
            </div>
            <div>
                <h1 class="font-display text-5xl sm:text-7xl text-white leading-[1.15]">${manga.titleFa}</h1>
                <p class="text-blue-300/70 text-xs sm:text-sm mt-2" dir="ltr">${manga.titleEn} — <span class="font-jp">${manga.jpTitle}</span></p>
            </div>
            <p class="text-blue-100/80 text-sm sm:text-base leading-8 max-w-2xl line-clamp-3">${manga.synopsis}</p>
            <div class="flex flex-wrap items-center gap-2 text-xs text-blue-100">
                <span class="chip px-3 py-1.5 rounded-lg"><i class="fa-solid fa-star text-amber-400 ml-1"></i><strong>${manga.rating}</strong></span>
                <span class="chip px-3 py-1.5 rounded-lg">${manga.year}</span>
                <span class="chip px-3 py-1.5 rounded-lg">${manga.mainGenre}</span>
                <span class="chip px-3 py-1.5 rounded-lg hidden sm:inline">${manga.author}</span>
            </div>
            <div class="flex flex-wrap items-center gap-3 pt-2">
                <button onclick="openMangaDetail(${manga.id}, 'info')" class="btn-primary px-7 py-3.5 rounded-xl text-white font-bold text-sm flex items-center gap-2">
                    <i class="fa-solid fa-book-open"></i><span>مشاهده اثر</span>
                </button>
                <button onclick="openMangaDetail(${manga.id}, 'comments')" class="chip hover:bg-white/10 px-5 py-3.5 rounded-xl text-white text-sm transition flex items-center gap-2">
                    <i class="fa-regular fa-comments"></i><span>نظرات</span>
                </button>
            </div>
        </div>
        <div class="hero-in order-1 lg:order-none lg:col-span-4 flex justify-center" style="position:relative"><div class="hero-aura" aria-hidden="true"></div>
            <div id="hero-cover" onclick="openMangaDetail(${manga.id}, 'info')" class="tilt relative w-44 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/20 shadow-[0_40px_80px_-20px_rgba(37,99,235,.55)]">
                <img src="${cv(manga.cover)}" alt="${manga.titleFa}" class="w-full h-full object-cover object-top">
                <div class="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>
                <div class="foil"></div><div class="glare"></div>
            </div>
        </div>
    `;
    applyHeroColors(cv(manga.cover));
    const jp = document.getElementById('hero-jp-mark');
    if (jp) { jp.style.animation = 'none'; jp.textContent = manga.jpTitle || ''; void jp.offsetWidth; jp.style.animation = ''; }

    const dotsContainer = document.getElementById('hero-dots');
    dotsContainer.innerHTML = featuredIds.map((_, idx) => `
        <button onclick="setHeroSlide(${idx})" aria-label="اسلاید ${idx + 1}" class="relative h-1.5 rounded-full overflow-hidden bg-blue-400/25 transition-all ${idx === currentHeroSlide ? 'w-12' : 'w-3 hover:bg-blue-400/50'}">
            ${idx === currentHeroSlide ? '<span class="dot-fill absolute inset-0 bg-white rounded-full"></span>' : ''}
        </button>
    `).join('');
    restartHeroTimer();
}

let heroTimer = null;
function restartHeroTimer() {
    clearInterval(heroTimer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    heroTimer = setInterval(() => { if (!document.hidden) changeHeroSlide(1); }, 7000);
}

function bindHeroTilt() { return;
    const el = document.getElementById('hero-cover');
    if (!el || !window.matchMedia('(hover: hover)').matches) return;
    el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty('--ry', (x * 14) + 'deg');
        el.style.setProperty('--rx', (-y * 14) + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
}


function changeHeroSlide(dir) {
    currentHeroSlide = (currentHeroSlide + dir + featuredIds.length) % featuredIds.length;
    renderHeroSlider();
}

function setHeroSlide(idx) {
    currentHeroSlide = idx;
    renderHeroSlider();
}

// =========================================================================
// ۳. رندر کتابخانه مانگاها (Manga Library Grid)
// =========================================================================
const MANGA_PER_PAGE = 14;
let libPage = 1;

function renderPager(total) {
    const box = document.getElementById('manga-pager');
    if (!box) return;
    if (total <= 1) { box.innerHTML = ''; return; }
    const btn = (label, page, cls, aria) =>
        `<button type="button" onclick="goLibPage(${page})" aria-label="${aria}" class="pg-btn ${cls}">${label}</button>`;
    let html = '';
    html += btn('<i class="fa-solid fa-chevron-right"></i>', libPage - 1, libPage === 1 ? 'dis' : '', 'صفحه قبل');
    for (let p = 1; p <= total; p++) {
        html += btn(p.toLocaleString('fa-IR'), p, p === libPage ? 'on' : '', 'صفحه ' + p);
    }
    html += btn('<i class="fa-solid fa-chevron-left"></i>', libPage + 1, libPage === total ? 'dis' : '', 'صفحه بعد');
    box.innerHTML = html;
}

function goLibPage(p) {
    if (p < 1) return;
    libPage = p;
    renderMangaGrid();
    const g = document.getElementById('manga-grid');
    if (g) window.scrollTo({ top: g.getBoundingClientRect().top + window.scrollY - 150, behavior: 'smooth' });
}

function renderMangaGrid() {
    const grid = document.getElementById('manga-grid');
    const sortBy = document.getElementById('sort-select').value;

    let filtered = mangaDatabase.filter(m => {
        if (isBookmarkFilterActive && !bookmarkedIds.includes(m.id)) return false;
        if (currentGenreFilter !== 'all' && !m.genres.includes(currentGenreFilter) && m.mainGenre !== currentGenreFilter) {
            return false;
        }
        if (currentSearchQuery) {
            const q = currentSearchQuery.toLowerCase();
            return (
                m.titleFa.toLowerCase().includes(q) ||
                m.titleEn.toLowerCase().includes(q) ||
                m.author.toLowerCase().includes(q)
            );
        }
        return true;
    });

    if (sortBy === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'chapters') {
        filtered.sort((a, b) => b.chaptersCount - a.chaptersCount);
    } else if (sortBy === 'newest') {
        filtered.sort((a, b) => b.year - a.year);
    }

    document.getElementById('manga-count-number').textContent = filtered.length;

    if (filtered.length === 0) {
        renderPager(0);
        grid.innerHTML = `
            <div class="col-span-full bg-navy-900/80 border border-blue-400/15 rounded-2xl p-10 text-center space-y-3">
                <i class="fa-solid fa-book-open text-3xl text-blue-400/50"></i>
                <p class="text-white font-bold text-base">مانگایی با این مشخصات یافت نشد.</p>
                <button onclick="resetAllFilters()" class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">نمایش همه مانگاها</button>
            </div>
        `;
        return;
    }

    // صفحه‌بندی: ۱۴ مانگا در هر صفحه
    const totalPages = Math.max(1, Math.ceil(filtered.length / MANGA_PER_PAGE));
    if (libPage > totalPages) libPage = totalPages;
    if (libPage < 1) libPage = 1;
    renderPager(totalPages);
    filtered = filtered.slice((libPage - 1) * MANGA_PER_PAGE, libPage * MANGA_PER_PAGE);

    grid.innerHTML = filtered.map((manga, i) => {
        const isBookmarked = bookmarkedIds.includes(manga.id);
        const top = sortBy === 'popular' && currentGenreFilter === 'all' && !currentSearchQuery && !isBookmarkFilterActive && i < 3;
        return `
        <article class="m-card group scroll-reveal">
            <div class="cover" onclick="openMangaDetail(${manga.id}, 'info')">
                <img src="${cv(manga.cover)}" alt="${manga.titleFa}" loading="lazy" onerror="this.src='https://placehold.co/400x600/0b1633/ffffff?text=Manga'">
                <div class="shade"></div>
                <span class="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-md text-[11px] font-bold text-amber-300 flex items-center gap-1"><i class="fa-solid fa-star text-[10px]"></i>${manga.rating}</span>
                <button aria-label="ذخیره در لیست من" onclick="event.stopPropagation(); toggleBookmark(${manga.id})" class="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-black/55 backdrop-blur-md hover:bg-blue-600 flex items-center justify-center transition">
                    <i class="${isBookmarked ? 'fa-solid text-sky-300' : 'fa-regular text-white'} fa-bookmark text-xs"></i>
                </button>
                ${top ? `<span class="rank">${i + 1}</span>` : ''}
                <div class="cap">
                    <h3>${manga.titleFa}</h3>
                    <p class="en">${manga.titleEn}</p>
                    <button class="go" onclick="event.stopPropagation(); openMangaDetail(${manga.id}, 'info')">مشاهده</button>
                </div>
            </div>
        </article>
        `;
    }).join('');

    observeScrollReveal();
    applyCardTints();
}

function setGenreFilter(genre) {
    isBookmarkFilterActive = false;
    currentGenreFilter = genre; libPage = 1;
    document.querySelectorAll('.genre-btn').forEach(btn => {
        if (btn.dataset.genre === genre) {
            btn.className = 'genre-btn px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white border border-white/30 transition';
        } else {
            btn.className = 'genre-btn px-3.5 py-2 rounded-xl text-xs font-medium bg-navy-850 text-blue-200 hover:bg-navy-800 border border-blue-400/15 transition';
        }
    });
    renderMangaGrid();
}

function handleSearchInput(val) {
    currentSearchQuery = val.trim(); libPage = 1;
    showHomeView(false);
    renderMangaGrid();
}

function filterByBookmarks() {
    showHomeView(false);
    isBookmarkFilterActive = !isBookmarkFilterActive; libPage = 1;
    renderMangaGrid();
    showToast(isBookmarkFilterActive ? 'نمایش مانگاهای نشان‌شده شما' : 'نمایش تمام مانگاهای کتابخانه');
}

function resetAllFilters() {
    isBookmarkFilterActive = false;
    currentGenreFilter = 'all';
    currentSearchQuery = '';
    const searchEl = document.getElementById('global-search-input');
    if (searchEl) searchEl.value = '';
    setGenreFilter('all');
}

function renderCompactQuotesStrip() {
    const strip = document.getElementById('compact-quotes-strip');
    strip.innerHTML = compactQuotesPanels.map(item => `
        <div class="quote-card">
            <div class="w-11 h-11 rounded-xl chip flex items-center justify-center text-blue-300 shrink-0"><i class="fa-solid fa-quote-right"></i></div>
            <div class="space-y-1 text-right">
                <span class="text-[11px] font-bold text-blue-400 block">${item.char}</span>
                <p class="text-xs text-white leading-relaxed line-clamp-3">${item.quote}</p>
            </div>
        </div>
    `).join('');
}

function scrollQuotesStrip(offset) {
    const strip = document.getElementById('compact-quotes-strip');
    strip.scrollBy({ left: -offset, behavior: 'smooth' });
}

// =========================================================================
// ۷. افزودن مانگای جدید توسط خود کاربر (Add New Manga Studio)
// =========================================================================
function openAddMangaModal() {
    const modal = document.getElementById('add-manga-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeAddMangaModal() {
    const modal = document.getElementById('add-manga-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function saveNewMangaFromModal() {
    const titleFa = document.getElementById('new-manga-title-fa').value.trim();
    const titleEn = document.getElementById('new-manga-title-en').value.trim() || 'New Manga';
    const author = document.getElementById('new-manga-author').value.trim() || 'مانگاکا';
    const genre = document.getElementById('new-manga-genre').value;
    const chaptersCount = 0;
    const rating = parseFloat(document.getElementById('new-manga-rating').value) || 9.0;
    const synopsis = document.getElementById('new-manga-synopsis').value.trim() || 'این مانگا توسط مدیر سایت به کتابخانه اضافه شده است.';
    const urlInput = document.getElementById('new-manga-cover-url').value.trim();
    const fileInput = document.getElementById('new-manga-cover-file');

    if (!titleFa) {
        showToast('لطفاً نام فارسی مانگا را وارد کنید.');
        return;
    }

    const finalizeAdd = (coverSrc) => {
        const newId = mangaDatabase.length > 0 ? Math.max(...mangaDatabase.map(m => m.id)) + 1 : 15;
        const newMangaObj = {
            id: newId,
            cover: coverSrc || '447001.jpg',
            titleFa,
            titleEn,
            jpTitle: '新作漫画',
            author,
            magazine: 'Jump / Seinen Archive',
            year: 2025,
            status: 'در حال انتشار',
            rating,
            chaptersCount,
            mainGenre: genre,
            genres: [genre, 'اکشن و رزمی'],
            synopsis,
            quote: '«داستانی نو در دنیای مانگا آغاز شده است.»',
            samplePages: [coverSrc || '447001.jpg', ...defaultReadingPages.slice(0, 4)],
            comments: []
        };

        mangaDatabase.unshift(newMangaObj);
        saveDatabase();
        renderMangaGrid();
        closeAddMangaModal();
        showToast(`مانگای «${titleFa}» با موفقیت به کتابخانه اضافه شد!`);
    };

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            finalizeAdd(e.target.result);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        finalizeAdd(urlInput || '447001.jpg');
    }
}

function exportMangaDatabaseJSON() {
    const jsonStr = JSON.stringify(mangaDatabase, null, 2);
    const temp = document.createElement('textarea');
    temp.value = jsonStr;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand('copy');
    document.body.removeChild(temp);
    showToast('کد JSON کل مانگاها در حافظه کپی شد!');
}

// ===== v14: رنگ‌گیری از جلد، حرکت سه‌بعدی هیرو =====
const _colCache = new Map();
function imgColors(src) {
    if (_colCache.has(src)) return _colCache.get(src);
    const pr = new Promise(res => {
        const im = new Image(); im.crossOrigin = 'anonymous';
        im.onload = () => {
            try {
                const w = 24, h = 36, c = document.createElement('canvas'); c.width = w; c.height = h;
                const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, w, h);
                const d = x.getImageData(0, 0, w, h).data;
                const avg = from => { let r=0,g=0,b=0,t=0; for (let y=from; y<h; y++) for (let xx=0; xx<w; xx++) { const k=(y*w+xx)*4, R=d[k],G=d[k+1],B=d[k+2];
                    const wt=(Math.max(R,G,B)-Math.min(R,G,B))/255+.06; r+=R*wt; g+=G*wt; b+=B*wt; t+=wt; } return [r/t,g/t,b/t]; };
                let best=null, bs=-1;
                for (let k=0;k<d.length;k+=4){ const mx=Math.max(d[k],d[k+1],d[k+2]), mn=Math.min(d[k],d[k+1],d[k+2]); const sc=(mx-mn)*(mx/255); if(sc>bs){bs=sc;best=[d[k],d[k+1],d[k+2]];} }
                res({ bottom: avg(22), vivid: avg(0), accent: best || avg(0) });
            } catch (e) { res(null); }
        };
        im.onerror = () => res(null); im.src = src;
    });
    _colCache.set(src, pr); return pr;
}
function tone(rgb, l, sMax) {
    let [r,g,b] = rgb.map(v => v/255); const mx=Math.max(r,g,b), mn=Math.min(r,g,b); let h=0, s=0; const d=mx-mn;
    if (d) { s = d/(1-Math.abs(mx+mn-1)); h = mx===r ? ((g-b)/d)%6 : mx===g ? (b-r)/d+2 : (r-g)/d+4; h*=60; if (h<0) h+=360; }
    s = Math.min(s, sMax); const c=(1-Math.abs(2*l-1))*s, x=c*(1-Math.abs((h/60)%2-1)), m=l-c/2;
    const [R,G,B] = h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];
    return [Math.round((R+m)*255), Math.round((G+m)*255), Math.round((B+m)*255)];
}
function applyCardTints() {
    document.querySelectorAll('#manga-grid .cover').forEach(cov => {
        const img = cov.querySelector('img'); if (!img) return;
        imgColors(img.getAttribute('src')).then(c => {
            if (!c) return;
            cov.style.setProperty('--tint', tone(c.bottom, .19, .8).join(','));
            cov.style.setProperty('--tg', tone(c.accent, .55, .95).join(','));
            cov.classList.add('tinted');
        });
    });
}
function applyHeroColors(src) {
    imgColors(src).then(c => {
        const sec = document.getElementById('hero-sec'); if (!sec || !c) return;
        sec.style.setProperty('--h1', 'rgb(' + tone(c.vivid, .46, .9).join(',') + ')');
        sec.style.setProperty('--h2', 'rgb(' + tone(c.accent, .52, .95).join(',') + ')');
    });
}
const hm = { tx:0, ty:0, x:0, y:0, hover:false, gyro:false };
function heroLoop(ts) {
    requestAnimationFrame(heroLoop);
    const sec = document.getElementById('hero-sec'), el = document.getElementById('hero-cover');
    if (!sec || !el || document.hidden) return;
    const r = sec.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    if (!hm.hover && !hm.gyro) { hm.tx = Math.sin(ts/2600)*.85; hm.ty = Math.cos(ts/3300)*.65; }
    hm.x += (hm.tx-hm.x)*.08; hm.y += (hm.ty-hm.y)*.08;
    el.style.setProperty('--ry', (hm.x*15)+'deg'); el.style.setProperty('--rx', (-hm.y*15)+'deg');
    el.style.setProperty('--gx', (50+hm.x*48)+'%'); el.style.setProperty('--gy', (32+hm.y*48)+'%');
    sec.style.setProperty('--px', hm.x.toFixed(3)); sec.style.setProperty('--py', hm.y.toFixed(3));
}

function buildHeroGlyphs() {
    const rot = document.getElementById('gl-rot'), host = document.getElementById('hero-glyphs');
    if (!rot || !host) return;
    const words = ['漫画','少年','青春','冒険','運命','覚悟','友情','努力','勝利','夢','闇','光','伝説','物語','ゴゴゴ','ドン','バッ','ザッ','ズバッ','ドドド','あの日','約束','青','戦','魂','風','月','影','絆','剣','海賊','忍','呪術','巨人','怪物'];
    const pick = n => { let o = []; for (let i = 0; i < n; i++) o.push(words[(i * 7 + n * 3 + (i % 3) * 5) % words.length]); return o; };
    const cfg = [ // [x%, y%, زاویه، اندازه rem]
        [50, 10, 0, 3.2], [50, 30, 0, 4.6], [50, 55, 180, 3.4], [50, 80, 0, 5],
        [14, 50, 90, 3], [86, 50, -90, 3.6], [50, 45, 28, 4], [50, 62, -32, 3.2],
        [30, 50, 62, 3.4], [72, 50, -58, 3], [50, 92, 8, 2.8],
        // ردیف‌های ثابت (px) برای پر کردن بالای کتابخانه: عنوان، فیلترها و باکس جستجو
        [50, '90px', 0, 3.4], [50, '210px', 0, 4.4], [50, '330px', 0, 3.2], [50, '450px', 0, 4.8], [50, '570px', 0, 3.4],
        [50, '690px', 0, 4.2], [50, '810px', 0, 3.2], [50, '930px', 0, 4.6], [50, '1050px', 0, 3.4],
        [50, '260px', -14, 3.6], [50, '640px', 12, 3.8], [50, '900px', -10, 3.4]
    ];
    // ادامه‌ی ردیف‌ها تا پایین کتابخانه (بخش خارج از صفحه خودش بریده می‌شود)
    for (let y = 1200, k = 0; y <= 4200; y += 240, k++) cfg.push([50, y + 'px', k % 3 === 0 ? 0 : (k % 3 === 1 ? -8 : 8), 3.2 + (k % 4) * .5]);
    const rows = cfg.map(([x, y, ang, sz], i) => {
        const a = pick(26 + (i % 4)).map(w => `<span>${w}</span>`).join('');
        return `<div class="gl-wrap" style="--x:${x}%;--y:${typeof y === 'string' ? y : y + '%'};--a:${ang}deg"><div class="gl-row ${i % 2 ? 'r' : ''} ${i % 3 === 0 ? 'f' : ''}" style="font-size:${sz}rem;animation-duration:${55 + i * 9}s">${a}${a}</div></div>`;
    }).join('');
    rot.innerHTML = rows;
    const cols = ['ゴゴゴゴゴ','ドン','運命の扉','少年よ大志を抱け','青の物語','バッ','覚悟はいいか'];
    host.insertAdjacentHTML('beforeend', cols.map((t, i) =>
        `<div class="gl-col" style="left:${6 + i * 14}%;font-size:${1.1 + (i % 3) * .5}rem;animation-duration:${28 + i * 7}s;animation-direction:${i % 2 ? 'alternate' : 'alternate-reverse'};opacity:${.6 + (i % 3) * .2}">${t}</div>`).join(''));
}
function initHeroMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const sec = document.getElementById('hero-sec'); if (!sec) return;
    sec.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; const r = sec.getBoundingClientRect();
        hm.hover = true; hm.tx = ((e.clientX-r.left)/r.width-.5)*2; hm.ty = ((e.clientY-r.top)/r.height-.5)*2; });
    sec.addEventListener('pointerleave', () => { hm.hover = false; });
    window.addEventListener('deviceorientation', e => { if (e.gamma == null || e.beta == null) return; hm.gyro = true;
        hm.tx = Math.max(-1, Math.min(1, e.gamma/22)); hm.ty = Math.max(-1, Math.min(1, (e.beta-50)/22)); });
    requestAnimationFrame(heroLoop);
}

function buildLibBackdrop() {
    const box = document.getElementById('lib-backdrop-in');
    if (!box || !mangaDatabase.length) return;
    const w = window.innerWidth, cols = w < 640 ? 3 : w < 1024 ? 5 : 8, per = 6;
    const sh = shuffled(mangaDatabase);
    let html = '';
    for (let c = 0; c < cols; c++) {
        html += '<div class="lb-col">';
        for (let i = 0; i < per; i++) {
            const m = sh[(c * per + i) % sh.length];
            html += `<img src="${cv(m.cover)}" alt="" decoding="async">`;
        }
        html += '</div>';
    }
    box.innerHTML = html;
}

// برش لایه‌ی متن‌های متحرک: از بالای باکس جستجو به پایین
function clipHeroGlyphs() {
    const host = document.getElementById('hero-glyphs'), wrap = document.querySelector('.lib-wrap');
    const inp = document.querySelector('#manga-library-section input[type="search"]');
    if (!host || !wrap || !inp) return;
    const wr = wrap.getBoundingClientRect(), ir = inp.getBoundingClientRect();
    if (!wr.height) return;
    host.style.clipPath = 'none'; // حروف از بالای بخش کتابخانه (زیر هیرو) شروع می‌شوند
}

// ---------- ناوبری به صفحهٔ هر مانگا (صفحهٔ جدا) ----------
function openMangaDetail(mangaId, tab) {
    location.href = 'manga.html?id=' + encodeURIComponent(mangaId) + (tab && tab !== 'info' ? '&tab=' + tab : '');
}
function showHomeView(scrollTop = true) {
    if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
}


(function () {
    try {
        var ua = navigator.userAgent;
        var safari = /safari/i.test(ua) && !/chrome|crios|android|edg/i.test(ua);
        var v = document.createElement('video');
        if (safari || !v.canPlayType || !v.canPlayType('video/webm; codecs="vp9"')) return;
        if (navigator.connection && navigator.connection.saveData) return;
        var wrap = document.getElementById('glyph-video'), lib = document.querySelector('.lib-wrap');
        if (!wrap || !lib) return;
        v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'auto';
        v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
        v.addEventListener('playing', function () { document.documentElement.classList.add('gv'); }, { once: true });
        v.addEventListener('error', function () { document.documentElement.classList.remove('gv'); });
        v.src = 'glyphs.webm?v=1';
        wrap.appendChild(v);
        var p = v.play(); if (p && p.catch) p.catch(function () {});
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (es) {
                es.forEach(function (e) {
                    if (e.isIntersecting) { var q = v.play(); if (q && q.catch) q.catch(function () {}); } else v.pause();
                });
            }, { threshold: 0 }).observe(lib);
        }
    } catch (e) {}
})();


// ---------- راه‌اندازی ----------
(function initHome() {
    initDatabase();
    const qs = new URLSearchParams(location.search);
    if (qs.get('bm') === '1') isBookmarkFilterActive = true;
    if (qs.get('q')) {
        currentSearchQuery = qs.get('q').trim();
        const si = document.getElementById('global-search-input'); if (si) si.value = currentSearchQuery;
    }
    pickRandomFeatured();
    renderHeroSlider();
    renderMangaGrid();
    renderCompactQuotesStrip();
    buildLibBackdrop();
    buildHeroGlyphs();
    initHeroMotion();
    window.addEventListener('load', () => {
        clipHeroGlyphs();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(clipHeroGlyphs);
        const w = document.querySelector('.lib-wrap');
        if (w && window.ResizeObserver) new ResizeObserver(clipHeroGlyphs).observe(w);
    });
    window.addEventListener('resize', clipHeroGlyphs);
    if (qs.get('bm') === '1' || qs.get('q')) {
        const sec = document.getElementById('manga-library-section'); if (sec) sec.scrollIntoView();
    }
})();
