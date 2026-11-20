// کدهای مشترک بین همهٔ صفحه‌ها
// آدرس فضای ذخیره‌سازی آروان برای فایل‌های سنگین (کاورها، پنل‌ها، ویدیو).
// اگر خالی بگذاری ('')، فایل‌ها مثل قبل از خود گیت‌هاب خوانده می‌شوند.
const ASSET_BASE = 'https://mahdiggff2.s3.ir-central1.arvanstorage.ir/assets/';
function assetUrl(f) {
    if (!f || !ASSET_BASE || /^(https?:|data:|blob:|\/\/)/.test(f)) return f;
    return ASSET_BASE + f;
}
const cv = c => IMG[c] || assetUrl(c);

let mangaDatabase = [];
let bookmarkedIds = [];

function shuffled(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

let activeMangaId = 0;
let isChapterDescending = true;

// وضعیت چپترخوان
let activeReaderChapterNum = 1;
let readerMode = 'vertical';
let readerZoom = 100;
let currentSinglePageIndex = 0;
let currentReaderPages = [];

function initDatabase() {
    try {
        const savedManga = localStorage.getItem('blueManga_db_v1');
        if (savedManga) {
            mangaDatabase = JSON.parse(savedManga);
            // مانگاهای جدیدِ داخلی (id از ۱۰۰ به بالا) که هنوز در کتابخانه‌ی ذخیره‌شده نیستند اضافه می‌شوند
            let seen = [];
            try { seen = JSON.parse(localStorage.getItem('blueManga_seen_extra_v1') || '[]'); } catch (e) {}
            initialMangaList.filter(m => m.id >= 100 && !seen.includes(m.id) && !mangaDatabase.some(x => x.id === m.id))
                .forEach(m => mangaDatabase.push(JSON.parse(JSON.stringify(m))));
            localStorage.setItem('blueManga_seen_extra_v1', JSON.stringify(initialMangaList.filter(m => m.id >= 100).map(m => m.id)));
            saveDatabase();
        } else {
            mangaDatabase = JSON.parse(JSON.stringify(initialMangaList));
        }

        const savedBookmarks = localStorage.getItem('blueManga_bookmarks_v1');
        if (savedBookmarks) {
            bookmarkedIds = JSON.parse(savedBookmarks);
        }
    } catch (e) {
        mangaDatabase = JSON.parse(JSON.stringify(initialMangaList));
    }
    updateBookmarkBadge();
}

function saveDatabase() {
    try {
        localStorage.setItem('blueManga_db_v1', JSON.stringify(mangaDatabase));
    } catch (e) {}
}

function toggleBookmark(id) {
    if (bookmarkedIds.includes(id)) {
        bookmarkedIds = bookmarkedIds.filter(item => item !== id);
        showToast('از لیست مطالعه شما حذف شد');
    } else {
        bookmarkedIds.push(id);
        showToast('به لیست مطالعه شما اضافه شد');
    }
    try {
        localStorage.setItem('blueManga_bookmarks_v1', JSON.stringify(bookmarkedIds));
    } catch (e) {}
    updateBookmarkBadge();
    if (typeof renderMangaGrid === 'function') renderMangaGrid();
    updateDetailBookmarkButton();
}

function toggleBookmarkCurrent() {
    toggleBookmark(activeMangaId);
}

function updateBookmarkBadge() {
    const badge = document.getElementById('bookmark-count-badge');
    if (badge) badge.textContent = bookmarkedIds.length;
}

function updateDetailBookmarkButton() {
    const btn = document.getElementById('detail-bookmark-btn');
    if (!btn) return;
    const isMarked = bookmarkedIds.includes(activeMangaId);
    btn.innerHTML = isMarked
        ? `<i class="fa-solid fa-bookmark text-sky-400"></i><span>در لیست مطالعه شما</span>`
        : `<i class="fa-regular fa-bookmark"></i><span>افزودن به لیست من</span>`;
}

function showToast(msg) {
    const box = document.getElementById('toast-box');
    document.getElementById('toast-text').textContent = msg;
    box.classList.remove('translate-y-24', 'opacity-0');
    setTimeout(() => {
        box.classList.add('translate-y-24', 'opacity-0');
    }, 2600);
}

function observeScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
}

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    const bar = document.getElementById('scroll-bar');
    if (bar) bar.style.width = `${pct}%`;
});

document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
        e.preventDefault();
        const i = document.getElementById('global-search-input');
        if (i) { i.focus(); }
    }
});

document.addEventListener('pointermove', e => {
    const g = e.target.closest && e.target.closest('.glass');
    if (!g) return;
    const r = g.getBoundingClientRect();
    g.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    g.style.setProperty('--my', (e.clientY - r.top) + 'px');
});


(function () {
    var t, root = document.documentElement;
    window.addEventListener('scroll', function () {
        if (!root.classList.contains('is-scrolling')) root.classList.add('is-scrolling');
        clearTimeout(t); t = setTimeout(function () { root.classList.remove('is-scrolling'); }, 160);
    }, { passive: true });
})();

