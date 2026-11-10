/* ========================================================
   Qafaseh Bot (قفسه) - Telegram Mini App Engine
   ======================================================== */

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

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
      pathElem.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
    } else {
      pathElem.setAttribute('d', 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    svgIcon.classList.remove('changing');
  }, 200);

  setTimeout(() => {
    html.classList.remove('theme-anim');
  }, 500);
}

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

window.addEventListener('click', (e) => {
  const menu = document.getElementById('plus-menu');
  const plusBtn = document.getElementById('plus-btn');
  
  if (menu && !menu.contains(e.target) && plusBtn && !plusBtn.contains(e.target)) {
    menu.classList.remove('menu-visible');
    menu.classList.add('menu-hidden');
    document.querySelector('.plus-icon')?.classList.remove('active');
  }
});

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

function renderBooks(books, meta) {
  const container = document.getElementById('books-list');
  container.innerHTML = '';

  if (!books || books.length === 0) {
    container.innerHTML = `<div class="text-center py-10 text-sm" style="color: var(--gray);">لا توجد كتب مطابقة لبحثك.</div>`;
    return;
  }

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

      <div class="grid grid-cols-2 gap-2 pt-2 border-t" style="border-color: var(--border);" dir="ltr">
        <button onclick="openLink('${links.website || '#'}')" class="flex items-center justify-center py-2.5 px-3 rounded-xl border text-xs font-semibold transition active:scale-95" style="background-color: var(--bg); border-color: var(--border); color: var(--text);">Website</button>
        <button onclick="openLink('${links.telegram || '#'}')" class="flex items-center justify-center py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold transition active:scale-95">Telegram</button>
        <button onclick="openLink('${links.server || '#'}')" class="flex items-center justify-center py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition active:scale-95">Server</button>
        <button onclick="openLink('${links.archive || '#'}')" class="flex items-center justify-center py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition active:scale-95">Archive</button>
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