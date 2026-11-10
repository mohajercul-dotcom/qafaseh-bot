/* ========================================================
   Qafaseh Bot (قفسه) - Telegram Mini App Engine
   ======================================================== */

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

// مدیریت تم دارک و لایت با انیمیشن نرم ۳۰ درجه
function toggleDarkMode() {
  const html = document.documentElement;
  const svgIcon = document.getElementById('theme-icon-svg');
  const pathElem = document.getElementById('theme-path');
  
  html.classList.add('theme-anim');
  svgIcon.classList.add('changing');
  
  setTimeout(() => {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    
    if (isDark) {
      // تغییر مسیر به وکتور تک‌رنگ خورشید (Sun)
      pathElem.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
    } else {
      // تغییر مسیر به وکتور تک‌رنگ ماه (Moon)
      pathElem.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    svgIcon.classList.remove('changing');
  }, 200);

  setTimeout(() => {
    html.classList.remove('theme-anim');
  }, 500);
}

// باز و بسته کردن منوی کشویی (+) با چرخش کلید
function togglePlusMenu() {
  const menu = document.getElementById('plus-menu');
  const plusIcon = document.querySelector('.plus-icon');
  
  const isHidden = menu.classList.contains('menu-hidden');

  if (isHidden) {
    menu.classList.remove('menu-hidden');
    menu.classList.add('menu-visible');
    plusIcon.classList.add('active');
  } else {
    menu.classList.remove('menu-visible');
    menu.classList.add('menu-hidden');
    plusIcon.classList.remove('active');
  }
}

// بستن منوی کشویی (+) هنگام کلیک خارج از آن
window.addEventListener('click', (e) => {
  const menu = document.getElementById('plus-menu');
  const plusBtn = document.getElementById('plus-btn');
  
  if (menu && !menu.contains(e.target) && plusBtn && !plusBtn.contains(e.target)) {
    menu.classList.remove('menu-visible');
    menu.classList.add('menu-hidden');
    document.querySelector('.plus-icon')?.classList.remove('active');
  }
});

// چک کردن تم ذخیره شده موقع لود شدن صفحه
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const pathElem = document.getElementById('theme-path');

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    if (pathElem) {
      pathElem.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
    }
  }
  loadCategoryData(currentCategory);
});

// متاداده‌های ۷ دسته اصلی
const categoriesMeta = {
  all:     { label: "الكل", className: "cat-all", color: "#374151" },
  aqidah: { label: "العقيدة", className: "cat-aqidah", color: "#8b0000" },
  ilhad:   { label: "الإلحاد", className: "cat-ilhad", color: "#1e3a8a" },
  shia:    { label: "الشيعة", className: "cat-shia", color: "#064e3b" },
  adyan:   { label: "الأديان", className: "cat-adyan", color: "#78350f" },
  makatib: { label: "مکاتب فكرية", className: "cat-makatib", color: "#4c1d95" },
  firaq:   { label: "فرق", className: "cat-firaq", color: "#831843" },
  dawah:   { label: "دعوة", className: "cat-dawah", color: "#14532d" }
};

let currentCategory = 'all';
let allBooksData = [];

async function loadCategoryData(categoryKey) {
  const container = document.getElementById('books-list');
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  container.innerHTML = `<div class="text-center py-12 text-sm animate-pulse" style="color: var(--gray);">جاري تحميل الكتب...</div>`;

  try {
    if (categoryKey === 'all') {
      const keys = ['aqidah', 'ilhad', 'shia', 'adyan', 'makatib', 'firaq', 'dawah'];
      const promises = keys.map(k => fetch(`data/${k}.json`).then(res => res.json()).catch(() => []));
      const results = await Promise.all(promises);
      
      allBooksData = [];
      results.forEach((booksArray, index) => {
        const catKey = keys[index];
        booksArray.forEach(book => {
          book._categoryKey = catKey;
          allBooksData.push(book);
        });
      });
    } else {
      const response = await fetch(`data/${categoryKey}.json`);
      if (!response.ok) throw new Error(`خطا`);
      const books = await response.json();
      books.forEach(book => book._categoryKey = categoryKey);
      allBooksData = books;
    }
    renderBooks(allBooksData, categoriesMeta[categoryKey]);
  } catch (error) {
    container.innerHTML = `<div class="text-center py-10 text-red-400 text-sm">عذراً، تعذر تحميل الكتب.</div>`;
  }
}

function filterBooks() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  const filtered = allBooksData.filter(book => {
    return (book.title || '').toLowerCase().includes(query) || (book.author || '').toLowerCase().includes(query);
  });
  renderBooks(filtered, categoriesMeta[currentCategory]);
}

// تابع اشتراک‌گذاری کتاب
function shareBook(title, author, url) {
  if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();

  const shareText = `📚 کتاب: ${title}\n✍️ نویسنده: ${author}\n🔗 مشاهده در قفسه:\n${url}`;

  if (navigator.share) {
    navigator.share({
      title: 'مكتبة قفسة',
      text: shareText,
      url: url,
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(shareText);
    alert('تم نسخ معلومات الكتاب بنجاح!');
  }
}

function renderBooks(books, meta) {
  const container = document.getElementById('books-list');
  container.innerHTML = '';

  if (!books || books.length === 0) {
    container.innerHTML = `<div class="text-center py-10 text-sm" style="color: var(--gray);">لا توجد كتب مطابقة لبحثك.</div>`;
    return;
  }

  // تعریف آیکون یکسان دانلود تک‌رنگ بصورت وکتور SVG
  const downloadIconSvg = `
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
    </svg>
  `;

  books.forEach(book => {
    const card = document.createElement('div');
    const cardMetaClass = book._categoryKey ? categoriesMeta[book._categoryKey].className : meta.className;
    const cardBadgeLabel = book._categoryKey ? categoriesMeta[book._categoryKey].label : meta.label;

    card.className = `book-card p-5 shadow-sm transition-all ${cardMetaClass}`;
    
    const links = book.links || {};

    card.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <span class="text-xs font-bold px-3 py-1 rounded-full border" 
              style="background-color: var(--badge-bg); color: var(--badge-text); border-color: var(--badge-border);">
          ${cardBadgeLabel}
        </span>
        <span class="text-xs font-mono" style="color: var(--gray);">#${book.id || ''}</span>
      </div>

      <div class="w-full h-56 mb-4 rounded-xl overflow-hidden relative shadow-inner" style="background-color: var(--bg);">
        <img src="${book.cover || 'https://via.placeholder.com/400x600?text=No+Cover'}" alt="${book.title}" class="w-full h-full object-cover" loading="lazy">
      </div>

      <div class="space-y-3 mb-5 text-sm">
        <div class="flex justify-between items-center pb-2 dashed-line">
          <span style="color: var(--gray);">اسم الكتاب</span>
          <span class="font-bold text-left" style="color: var(--text);">${book.title || '-'}</span>
        </div>
        <div class="flex justify-between items-center pb-2 dashed-line">
          <span style="color: var(--gray);">اسم المؤلف</span>
          <span class="font-bold text-left" style="color: var(--text);">${book.author || '-'}</span>
        </div>
        <div class="flex justify-between items-center pb-2 dashed-line">
          <span style="color: var(--gray);">المجلدات</span>
          <span class="font-bold text-left" style="color: var(--text);">${book.volumes || '-'}</span>
        </div>
        <div class="flex justify-between items-center pb-2 dashed-line">
          <span style="color: var(--gray);">الصفحات</span>
          <span class="font-bold text-left" style="color: var(--text);">${book.pages || '-'}</span>
        </div>
        <div class="flex justify-between items-center pb-2">
          <span style="color: var(--gray);">اللغة</span>
          <span class="font-bold text-left" style="color: var(--text);">${book.language || 'العربية'}</span>
        </div>
      </div>

      <!-- ساختار دکمه‌ها با وکتورهای تک‌رنگ و کاملاً خوانا در تم روز و شب -->
      <div class="space-y-2 pt-2 border-t" style="border-color: var(--border);" dir="ltr">
        
        <!-- ردیف اول: مشاهده وب‌سایت (آیکون کره زمین) و اشتراک‌گذاری (آیکون اشتراک‌گذاری) -->
        <div class="grid grid-cols-2 gap-2">
          <button onclick="openLink('${links.website || '#'}')" class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition active:scale-95" style="background-color: var(--bg); border-color: var(--border); color: var(--text);">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
            <span>تصفح الموقع</span>
          </button>

          <button onclick="shareBook('${book.title.replace(/'/g, "\\'")}', '${book.author.replace(/'/g, "\\'")}', '${links.website || window.location.href}')" class="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition active:scale-95" style="background-color: var(--bg); border-color: var(--border); color: var(--accent);">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
            <span>مشاركة الكتاب</span>
          </button>
        </div>

        <!-- ردیف دوم: سه گزینه دانلود با علامت وکتور یکسان، تک‌رنگ و مشخص -->
        <div class="grid grid-cols-3 gap-1.5">
          <button onclick="openLink('${links.telegram || '#'}')" class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[11px] font-semibold transition active:scale-95" title="تحميل من تلگرام">
            ${downloadIconSvg}
            <span>تلگرام</span>
          </button>
          
          <button onclick="openLink('${links.server || '#'}')" class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-semibold transition active:scale-95" title="تحميل من السيرفر">
            ${downloadIconSvg}
            <span>السيرفر</span>
          </button>
          
          <button onclick="openLink('${links.archive || '#'}')" class="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold transition active:scale-95" title="تحميل من الأرشيف">
            ${downloadIconSvg}
            <span>الأرشيف</span>
          </button>
        </div>

      </div>
    `;
    container.appendChild(card);
  });
}

function switchCategory(catKey, btnElement) {
  currentCategory = catKey;
  if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.className = "cat-btn px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm border";
    btn.style.backgroundColor = 'var(--card)';
    btn.style.borderColor = 'var(--border)';
    btn.style.color = 'var(--gray)';
  });
  
  const meta = categoriesMeta[catKey];
  btnElement.className = "cat-btn active px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md text-white scale-105 border-transparent";
  btnElement.style.backgroundColor = meta.color;
  btnElement.style.color = '#ffffff';

  btnElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  loadCategoryData(catKey);
}

function openLink(url) {
  if (!url || url === '#') return;
  if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
  if (tg?.openLink) tg.openLink(url);
  else window.open(url, '_blank');
}