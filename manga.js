// صفحهٔ هر مانگا: اطلاعات، چپترها، نظرات و چپترخوان
        // چپترها: آدرس پایه فضای ذخیره‌سازی + لیست چپترهای هر مانگا
        // ساختار فایل‌ها روی آروان:  CHAPTER_BASE + slug + '/' + شماره‌چپتر + '/' + 001.webp ...
        // مثال: https://mahdiggff2.s3.ir-central1.arvanstorage.ir/chainsaw-man/1/001.webp
        // برای هر چپتر جدید: عکس‌ها را (با کلید «نمایش عمومی» روشن) آپلود کن و یک خط به chapters اضافه کن.
        //   chapters: { 1: 24 }  یعنی چپتر ۱ با ۲۴ صفحه (001 تا 024)
        //   یا لیست دقیق نام فایل‌ها: { 1: ['a.png', 'b.png'] }  (نسبت به CHAPTER_BASE)
        // کلید هر مانگا = id همان مانگا در initialMangaList
        // =========================================================================
        const CHAPTER_BASE = 'https://mahdiggff2.s3.ir-central1.arvanstorage.ir/';
        const MANGA_CHAPTERS = {
        };
        function chapterPages(mangaId, num) {
            const cfg = MANGA_CHAPTERS[mangaId];
            if (!cfg || !cfg.chapters[num]) return null;
            const v = cfg.chapters[num];
            if (Array.isArray(v)) return v.map(f => /^https?:/.test(f) ? f : CHAPTER_BASE + f);
            const ext = cfg.ext || 'webp';
            return Array.from({ length: v }, (_, i) =>
                `${CHAPTER_BASE}${cfg.slug}/${num}/${String(i + 1).padStart(3, '0')}.${ext}`);
        }

        // لیست چپترها از فایل chapters.json داخل صندوقچه خوانده می‌شود (پنل admin.html آن را به‌روز می‌کند)
        (function () {
            fetch(CHAPTER_BASE + 'chapters.json?t=' + Date.now()).then(r => r.ok ? r.json() : null).then(j => {
                if (!j) return;
                Object.keys(j).forEach(k => { MANGA_CHAPTERS[k] = j[k]; });
                try { renderChaptersList(); } catch (e) {}
            }).catch(() => {});
        })();
        // ---------- لیست چپترها در تب «چپتر» ----------
        function renderChaptersList() {
            const box = document.getElementById('chapters-list-container');
            if (!box) return;
            const cfg = MANGA_CHAPTERS[activeMangaId];
            if (!cfg || !Object.keys(cfg.chapters).length) {
                box.innerHTML = `
                    <div class="rounded-2xl bg-navy-900 p-10 text-center space-y-3">
                        <i class="fa-solid fa-layer-group text-3xl text-blue-400/60"></i>
                        <p class="text-white font-bold text-base">هنوز چپتری اضافه نشده</p>
                        <p class="text-xs text-blue-200/70">چپترهای این مانگا بعد از انتشار اینجا نمایش داده می‌شوند.</p>
                    </div>`;
                return;
            }
            const nums = Object.keys(cfg.chapters).map(Number).sort((a, b) => isChapterDescending ? b - a : a - b);
            box.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <span class="text-xs text-blue-200/80">${nums.length} چپتر</span>
                    <button onclick="isChapterDescending=!isChapterDescending;renderChaptersList()" class="px-3 py-1.5 rounded-lg bg-navy-850 border border-blue-400/20 text-xs text-blue-200 flex items-center gap-1.5">
                        <i class="fa-solid fa-arrow-down-wide-short"></i><span>${isChapterDescending ? 'جدیدترین' : 'قدیمی‌ترین'}</span>
                    </button>
                </div>
                <div class="space-y-2">
                    ${nums.map(n => `
                        <button onclick="openReader(${activeMangaId}, ${n})" class="w-full text-right bg-navy-900 hover:bg-navy-800 border border-blue-400/15 hover:border-blue-300/40 rounded-xl px-4 py-3.5 flex items-center justify-between transition">
                            <span class="text-sm font-bold text-white">چپتر ${n}${cfg.titles && cfg.titles[n] ? ' — ' + cfg.titles[n] : ''}</span>
                            <span class="text-xs text-blue-300/80 flex items-center gap-1.5"><i class="fa-solid fa-book-open"></i>مطالعه</span>
                        </button>`).join('')}
                </div>`;
        }

        // ---------- چپترخوان تمام‌صفحه (حالت صفحه‌ای راست‌به‌چپ + حالت اسکرول) ----------
let crMode = (function () { try { return localStorage.getItem('crMode') || 'page'; } catch (e) { return 'page'; } })();
let crPages = [], crIdx = 0, crBuilt = false;
const crBtn = 'padding:8px 12px;border-radius:10px;background:rgba(255,255,255,.1);color:#fff;font-size:12px;white-space:nowrap';
function ensureReaderOverlay() {
    let o = document.getElementById('reader-overlay');
    if (o) return o;
    o = document.createElement('div');
    o.id = 'reader-overlay';
    o.style.cssText = 'display:none;position:fixed;inset:0;z-index:200;background:#000;flex-direction:column;height:100dvh';
    o.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;background:rgba(0,0,0,.92);border-bottom:1px solid rgba(255,255,255,.1)">
            <button onclick="closeReader()" style="${crBtn}"><i class="fa-solid fa-xmark"></i> بستن</button>
            <div style="min-width:0;text-align:center">
                <div id="reader-title" style="color:#fff;font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></div>
                <div id="reader-counter" style="color:#9db4ff;font-size:11px;direction:ltr"></div>
            </div>
            <div style="display:flex;gap:6px">
                <button id="reader-mode-btn" onclick="crToggleMode()" style="${crBtn}"></button>
                <button onclick="readerStep(-1)" style="${crBtn}">قبلی</button>
                <button onclick="readerStep(1)" style="${crBtn};background:#2563eb">بعدی</button>
            </div>
        </div>
        <div style="height:3px;background:rgba(255,255,255,.1);direction:rtl"><div id="reader-bar" style="height:100%;width:0;background:#38bdf8;transition:width .15s"></div></div>
        <div id="reader-body" style="flex:1;position:relative;overflow:hidden">
            <div id="reader-page" style="position:absolute;inset:0;touch-action:pan-y">
                <img id="reader-img" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none">
                <div id="reader-end" style="display:none;position:absolute;inset:0;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#fff;text-align:center">
                    <div style="font-size:16px;font-weight:700">پایان چپتر</div>
                    <button onclick="readerStep(1)" style="padding:12px 24px;border-radius:12px;background:#2563eb;color:#fff;font-size:14px">چپتر بعدی</button>
                    <button onclick="readerStep(-1)" style="padding:12px 24px;border-radius:12px;background:rgba(255,255,255,.1);color:#fff;font-size:14px">چپتر قبلی</button>
                    <button onclick="crShowPage(0)" style="padding:8px 16px;color:#9db4ff;font-size:12px">خواندن دوباره از اول</button>
                </div>
            </div>
            <div id="reader-scroll" style="display:none;position:absolute;inset:0;overflow-y:auto">
                <div id="reader-pages" style="max-width:48rem;margin:0 auto"></div>
                <div style="max-width:48rem;margin:0 auto;padding:24px;display:flex;gap:8px;justify-content:center">
                    <button onclick="readerStep(-1)" style="padding:12px 20px;border-radius:12px;background:rgba(255,255,255,.1);color:#fff;font-size:14px">چپتر قبلی</button>
                    <button onclick="readerStep(1)" style="padding:12px 20px;border-radius:12px;background:#2563eb;color:#fff;font-size:14px">چپتر بعدی</button>
                </div>
            </div>
        </div>`;
    document.body.appendChild(o);

    // لمس: سمت چپ = صفحه‌ی بعد، سمت راست = صفحه‌ی قبل (مثل مانگای ژاپنی)
    const pg = o.querySelector('#reader-page');
    let sx = 0, sy = 0;
    pg.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    pg.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { crShowPage(crIdx + (dx > 0 ? 1 : -1)); pg._swiped = true; }
    }, { passive: true });
    pg.addEventListener('click', e => {
        if (pg._swiped) { pg._swiped = false; return; }
        if (e.target.closest('button')) return;
        const r = pg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
        if (x < 0.4) crShowPage(crIdx + 1); else if (x > 0.6) crShowPage(crIdx - 1);
    });
    o.querySelector('#reader-scroll').addEventListener('scroll', e => {
        const s = e.target, max = s.scrollHeight - s.clientHeight, p = max > 0 ? s.scrollTop / max : 0;
        document.getElementById('reader-bar').style.width = (p * 100) + '%';
        document.getElementById('reader-counter').textContent = Math.round(p * 100) + '%';
    }, { passive: true });
    return o;
}
function crShowPage(i) {
    const n = crPages.length;
    if (i < 0) { readerStep(-1); return; }
    if (i > n) return;
    crIdx = i;
    const img = document.getElementById('reader-img'), end = document.getElementById('reader-end');
    if (i === n) { img.style.display = 'none'; end.style.display = 'flex'; }
    else { end.style.display = 'none'; img.style.display = 'block'; img.src = crPages[i]; }
    for (let k = 1; k <= 2; k++) if (crPages[i + k]) { const pre = new Image(); pre.src = crPages[i + k]; }
    document.getElementById('reader-counter').textContent = i === n ? 'پایان' : (i + 1) + ' / ' + n;
    document.getElementById('reader-bar').style.width = (Math.min(i + 1, n) / n * 100) + '%';
}
function crApplyMode() {
    const isPage = crMode === 'page';
    document.getElementById('reader-page').style.display = isPage ? 'block' : 'none';
    document.getElementById('reader-scroll').style.display = isPage ? 'none' : 'block';
    document.getElementById('reader-mode-btn').innerHTML = isPage ? '<i class="fa-solid fa-arrows-up-down"></i> اسکرول' : '<i class="fa-solid fa-book-open"></i> صفحه‌ای';
    if (isPage) { crShowPage(Math.min(crIdx, crPages.length)); return; }
    const box = document.getElementById('reader-pages'), sc = document.getElementById('reader-scroll');
    if (!crBuilt) {
        box.innerHTML = crPages.map((p, i) =>
            `<img src="${p}" alt="صفحه ${i + 1}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" style="display:block;width:100%;height:auto;min-height:240px;background:#0a0f1f">`).join('');
        crBuilt = true;
    }
    const target = box.children[Math.min(crIdx, crPages.length - 1)];
    sc.scrollTop = target ? target.offsetTop : 0;
    sc.dispatchEvent(new Event('scroll'));
}
function crToggleMode() {
    if (crMode === 'scroll') {  // از اسکرول به صفحه‌ای: صفحه‌ی در حال دیدن را پیدا کن
        const sc = document.getElementById('reader-scroll'), imgs = [...document.getElementById('reader-pages').children];
        const k = imgs.findIndex(im => im.offsetTop + im.offsetHeight > sc.scrollTop + 10);
        crIdx = k < 0 ? 0 : k;
    }
    crMode = crMode === 'page' ? 'scroll' : 'page';
    try { localStorage.setItem('crMode', crMode); } catch (e) {}
    crApplyMode();
}
function openReader(mangaId, num) {
    const pages = chapterPages(mangaId, num);
    if (!pages) { showToast('این چپتر هنوز آماده نیست'); return; }
    const manga = mangaDatabase.find(m => m.id === mangaId);
    activeMangaId = mangaId; activeReaderChapterNum = num;
    const o = ensureReaderOverlay();
    crPages = pages; crIdx = 0; crBuilt = false;
    document.getElementById('reader-pages').innerHTML = '';
    document.getElementById('reader-title').textContent = `${manga ? manga.titleFa : ''} — چپتر ${num}`;
    o.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    crApplyMode();
}
function closeReader() {
    const o = document.getElementById('reader-overlay');
    if (o) o.style.display = 'none';
    document.body.style.overflow = '';
}
function readerStep(dir) {
    const cfg = MANGA_CHAPTERS[activeMangaId]; if (!cfg) return;
    const nums = Object.keys(cfg.chapters).map(Number).sort((a, b) => a - b);
    const i = nums.indexOf(activeReaderChapterNum) + dir;
    if (i < 0 || i >= nums.length) { showToast(dir > 0 ? 'این آخرین چپتر است' : 'این اولین چپتر است'); return; }
    openReader(activeMangaId, nums[i]);
}
document.addEventListener('keydown', e => {
    const o = document.getElementById('reader-overlay');
    if (!o || o.style.display === 'none') return;
    if (e.key === 'Escape') closeReader();
    else if (crMode === 'page' && e.key === 'ArrowLeft') crShowPage(crIdx + 1);
    else if (crMode === 'page' && e.key === 'ArrowRight') crShowPage(crIdx - 1);
});

function openMangaDetail(mangaId, initialTab = 'info') {
    activeMangaId = mangaId;
    const manga = mangaDatabase.find(m => m.id === mangaId);
    if (!manga) return;

    applyDetailPanels(mangaId);

    // پر کردن هدر صفحه مانگا
    document.getElementById('detail-bg-blur').style.backgroundImage = `url('${cv(manga.cover)}')`;
    document.getElementById('detail-cover-img').src = cv(manga.cover);
    document.getElementById('detail-status-badge').textContent = manga.status;
    document.getElementById('detail-year-badge').textContent = `انتشار: ${manga.year}`;
    document.getElementById('detail-rating-badge').innerHTML = `<i class="fa-solid fa-star ml-1"></i>${manga.rating} / 10`;
    document.getElementById('detail-title-fa').textContent = manga.titleFa;
    // تیم مترجم: برای هر مانگا که منبعش مشخص است (کلید = id مانگا)
    (function () {
        const TRANSLATORS = { 1: { name: 'AW Manga', logo: 'aw-manga.jpg' } };
        const t = TRANSLATORS[manga.id], box = document.getElementById('detail-credit');
        if (!box) return;
        if (t) {
            document.getElementById('detail-credit-name').textContent = t.name;
            const im = document.getElementById('detail-credit-img'); im.src = t.logo; im.alt = t.name;
            box.style.display = 'flex';
        } else box.style.display = 'none';
    })();
    document.getElementById('detail-title-en').textContent = `${manga.titleEn} • ${manga.jpTitle}`;
    document.getElementById('detail-author').innerHTML = `<i class="fa-solid fa-pen-nib text-blue-400 ml-1.5"></i>نویسنده و طراح: <strong>${manga.author}</strong>`;

    document.getElementById('detail-genres').innerHTML = manga.genres.map(g => `
        <span class="px-3 py-1 rounded-lg bg-navy-850 border border-blue-400/20 text-xs text-blue-200">${g}</span>
    `).join('');

    // پر کردن تب اطلاعات
    document.getElementById('detail-synopsis').textContent = manga.synopsis;
    document.getElementById('detail-quote').textContent = manga.quote || '«هر صفحه از این مانگا، روایتی از اراده و نبرد است.»';
    document.getElementById('info-jp-title').textContent = manga.jpTitle;
    document.getElementById('info-mangaka').textContent = manga.author;
    document.getElementById('info-magazine').textContent = manga.magazine;
                document.getElementById('info-demographic').textContent = manga.mainGenre;

    // شمارنده تب‌ها
                document.getElementById('tab-comments-count').textContent = manga.comments.length;

    updateDetailBookmarkButton();
    renderCommentsList();
    renderChaptersList();
    switchDetailTab(['info', 'chapters', 'comments'].includes(initialTab) ? initialTab : 'info');
}

function switchDetailTab(tabName) {
    const tabs = ['info', 'chapters', 'comments'];
    tabs.forEach(t => {
        const content = document.getElementById(`tab-content-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (t === tabName) {
            content.classList.remove('hidden');
            btn.className = 'px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 border-white text-white bg-navy-800/60 rounded-t-xl transition flex items-center gap-2';
        } else {
            content.classList.add('hidden');
            btn.className = 'px-6 py-3.5 text-xs sm:text-sm font-bold border-b-2 border-transparent text-blue-300/70 hover:text-white rounded-t-xl transition flex items-center gap-2';
        }
    });
}


function renderCommentsList() {
    const manga = mangaDatabase.find(m => m.id === activeMangaId);
    if (!manga) return;

    const container = document.getElementById('comments-list-container');
    document.getElementById('tab-comments-count').textContent = manga.comments.length;

    if (manga.comments.length === 0) {
        container.innerHTML = `
            <div class="bg-navy-900 border border-blue-400/15 rounded-2xl p-8 text-center text-blue-200/70 text-sm">
                هنوز نظری برای این مانگا ثبت نشده است. اولین نفری باشید که دیدگاه خود را می‌نویسید!
            </div>
        `;
        return;
    }

    container.innerHTML = manga.comments.map((c, idx) => `
        <div class="bg-navy-900 border border-blue-400/15 rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between border-b border-blue-400/10 pb-2.5">
                <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-400/40 text-white font-bold text-xs flex items-center justify-center">
                        ${c.user.charAt(0)}
                    </div>
                    <div>
                        <h5 class="text-white font-bold text-xs sm:text-sm">${c.user}</h5>
                        <span class="text-[10px] text-blue-300/60">${c.date}</span>
                    </div>
                </div>
                <div class="text-amber-400 text-xs">
                    ${'★'.repeat(c.rating)}${'☆'.repeat(5 - c.rating)}
                </div>
            </div>

            ${c.spoiler ? `
                <div class="bg-navy-950 border border-rose-500/30 rounded-xl p-3">
                    <button onclick="this.nextElementSibling.classList.toggle('hidden'); this.classList.add('hidden')" class="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <span>این دیدگاه حاوی اسپویل است (برای نمایش کلیک کنید)</span>
                    </button>
                    <p class="hidden text-blue-100 text-xs sm:text-sm leading-relaxed">${c.text}</p>
                </div>
            ` : `
                <p class="text-blue-100 text-xs sm:text-sm leading-relaxed">${c.text}</p>
            `}
        </div>
    `).join('');
}

function submitMangaComment() {
    const manga = mangaDatabase.find(m => m.id === activeMangaId);
    if (!manga) return;

    const nameEl = document.getElementById('comment-user-name');
    const ratingEl = document.getElementById('comment-user-rating');
    const textEl = document.getElementById('comment-user-text');
    const spoilerEl = document.getElementById('comment-spoiler-check');

    const userName = nameEl.value.trim() || 'کاربر بلو مانگا';
    const userText = textEl.value.trim();

    if (!userText) {
        showToast('لطفاً متن دیدگاه خود را بنویسید.');
        return;
    }

    manga.comments.unshift({
        user: userName,
        rating: parseInt(ratingEl.value, 10) || 5,
        date: 'همین الان',
        text: userText,
        spoiler: spoilerEl.checked
    });

    textEl.value = '';
    spoilerEl.checked = false;
    saveDatabase();
    renderCommentsList();
    showToast('دیدگاه شما با موفقیت ثبت و منتشر شد!');
}

// پنل‌های متحرک هر مانگا (کلید = id مانگا). برای مانگای بعدی فقط یک ورودی اضافه کن.
// پنل‌های چپترخوان در panels.js

const _panelUrlCache = {};
async function _panelUrls(id) {
    if (_panelUrlCache[id]) return _panelUrlCache[id];
    let urls;
    try { urls = await Promise.all(PANEL_SETS[id].map(async d => URL.createObjectURL(await (await fetch(d)).blob()))); }
    catch (e) { urls = PANEL_SETS[id].slice(); }
    return (_panelUrlCache[id] = urls);
}
async function applyDetailPanels(mangaId) {
    const view = document.getElementById('manga-detail-view');
    const box = document.getElementById('detail-panels-in');
    if (!view || !box) return;
    await _ensurePanels();
            if (typeof PANEL_SETS === 'undefined' || !PANEL_SETS[mangaId]) { view.classList.remove('has-panels'); box.innerHTML = ''; return; }
    const urls = await _panelUrls(mangaId);
    if (activeMangaId !== mangaId) return;
    const pan = document.getElementById('detail-panels'); const w = pan.offsetWidth || window.innerWidth, h = Math.max(pan.offsetHeight, 500);
    const colW = Math.min(Math.max(w * 0.15, 104), 192);
    const cols = Math.ceil(w / (colW + 13)) + 2;
    const per = Math.min(14, Math.ceil((h * 1.9) / (colW * 1.5 + 13)) + 2);
    let html = '';
    for (let c = 0; c < cols; c++) {
        html += '<div class="dp-col">';
        for (let i = 0; i < per; i++) html += `<img src="${urls[(c * 5 + i * 7) % urls.length]}" alt="" decoding="async">`;
        html += '</div>';
    }
    box.innerHTML = html;
    view.classList.add('has-panels');
}

(function () {
    let t, on = false;
    window.addEventListener('scroll', () => {
        const v = document.getElementById('manga-detail-view');
        if (!v || v.classList.contains('hidden')) return;
        if (!on) { v.classList.add('dp-scrolling'); on = true; }
        clearTimeout(t);
        t = setTimeout(() => { v.classList.remove('dp-scrolling'); on = false; }, 160);
    }, { passive: true });
})();

// panels.js (سنگین) فقط روی صفحهٔ مانگا و فقط وقتی لازم است بارگذاری می‌شود
function _ensurePanels() {
    if (typeof PANEL_SETS !== 'undefined') return Promise.resolve();
    return new Promise(res => {
        const s = document.createElement('script');
        s.src = 'panels.js?v=1'; s.onload = s.onerror = () => res();
        document.head.appendChild(s);
    });
}

// ---------- ناوبری ----------
function goBackToLibrary() {
    try {
        if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { history.back(); return; }
    } catch (e) {}
    location.href = 'index.html';
}
function showHomeView() { location.href = 'index.html'; }
function filterByBookmarks() { location.href = 'index.html?bm=1'; }
function handleSearchInput() {}

// ---------- راه‌اندازی ----------
(function initMangaPage() {
    initDatabase();
    const qs = new URLSearchParams(location.search);
    const id = parseInt(qs.get('id'), 10);
    const manga = mangaDatabase.find(x => x.id === id);
    if (!manga) { location.replace('index.html'); return; }
    document.title = manga.titleFa + ' | بلو مانگا';
    openMangaDetail(id, qs.get('tab') || 'info');
    window.scrollTo(0, 0);
})();
