/* ========================================================
   Qafaseh Bot (قفسه) - Telegram Mini App Engine
   ======================================================== */

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

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

  container.innerHTML = `
    <div class="text-center py-12 text-zinc-400 text-sm animate-pulse">
      جاري تحميل الكتب...
    </div>
  `;

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
      if (!response.ok) throw new Error(`خطا در لود فایل: ${categoryKey}.json`);
      
      const books = await response.json();
      books.forEach(book => book._categoryKey = categoryKey);
      allBooksData = books;
    }
    
    renderBooks(allBooksData, categoriesMeta[categoryKey]);
  } catch (error) {
    container.innerHTML = `
      <div class="text-center py-10 text-red-400 text-sm dir-rtl">
        عذراً، تعذر تحميل قائمة الكتب لهذا القسم.
      </div>
    `;
    console.error('Qafaseh Bot Error:', error);
  }
}

function filterBooks() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  
  const filtered = allBooksData.filter(book => {
    const title = (book.title || '').toLowerCase();
    const author = (book.author || '').toLowerCase();
    return title.includes(query) || author.includes(query);
  });

  renderBooks(filtered, categoriesMeta[currentCategory]);
}

function renderBooks(books, meta) {
  const container = document.getElementById('books-list');
  container.innerHTML = '';

  if (!books || books.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 text-zinc-400 text-sm">
        لا توجد كتب مطابقة لبحثك.
      </div>
    `;
    return;
  }

  books.forEach(book => {
    const card = document.createElement('div');
    const cardMetaClass = book._categoryKey ? categoriesMeta[book._categoryKey].className : meta.className;
    const cardBadgeLabel = book._categoryKey ? categoriesMeta[book._categoryKey].label : meta.label;

    card.className = `book-card p-5 shadow-sm transition-all ${cardMetaClass}`;
    
    const links = book.links || {};
    const websiteUrl = links.website || '#';
    const telegramUrl = links.telegram || '#';
    const serverUrl = links.server || '#';
    const archiveUrl = links.archive || '#';

    card.innerHTML = `
      <div class="flex justify-between items-center mb-4">
        <span class="text-xs font-bold px-3 py-1 rounded-full border" 
              style="background-color: var(--badge-bg); color: var(--badge-text); border-color: var(--badge-border);">
          ${cardBadgeLabel}
        </span>
        <span class="text-xs text-zinc-400 font-mono">#${book.id || ''}</span>
      </div>

      <div class="w-full h-56 mb-4 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 relative shadow-inner">
        <img src="${book.cover || 'https://via.placeholder.com/400x600?text=No+Cover'}" 
             alt="${book.title}" 
             class="w-full h-full object-cover"
             loading="lazy">
      </div>

      <div class="space-y-3 mb-5 text-sm">
        <div class="flex justify-between items-center pb-2 dashed-line">
          <span class="text-zinc-500 dark:text-zinc-400">اسم الكتاب</span>
          <span class="font-bold text-zinc-900 dark:text-zinc-100 text-left">${book.title || '-'}</span>
        </div>
        <div class="flex justify-between items-center pb-2 dashed-line">
          <span class="text-zinc-500 dark:text-zinc-400">اسم المؤلف</span>
          <span class="font-bold text-zinc-900 dark:text-zinc-100 text-left">${book.author || '-'}</span>
        </div>
        <div class="flex justify-between items-center pb-2 dashed-line">
          <span class="text-zinc-500 dark:text-zinc-400">مجلدات</span>
          <span class="font-bold text-zinc-900 dark:text-zinc-100 text-left">${book.volumes || '-'}</span>
        </div>
        <div class="flex justify-between items-center pb-2 dashed-line">
          <span class="text-zinc-500 dark:text-zinc-400">صفحات</span>
          <span class="font-bold text-zinc-900 dark:text-zinc-100 text-left">${book.pages || '-'}</span>
        </div>
        <div class="flex justify-between items-center pb-2">
          <span class="text-zinc-500 dark:text-zinc-400">زبان کتاب</span>
          <span class="font-bold text-zinc-900 dark:text-zinc-100 text-left">${book.language || 'العربية'}</span>
        </div>
      </div>

      <!-- Action Buttons (Without Icons) -->
      <div class="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5" dir="ltr">
        <button onclick="openLink('${websiteUrl}')" class="flex items-center justify-center py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition">
          Website
        </button>
        <button onclick="openLink('${telegramUrl}')" class="flex items-center justify-center py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 text-xs font-semibold transition">
          Telegram
        </button>
        <button onclick="openLink('${serverUrl}')" class="flex items-center justify-center py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-semibold transition">
          Server
        </button>
        <button onclick="openLink('${archiveUrl}')" class="flex items-center justify-center py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition">
          Archive
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function switchCategory(catKey, btnElement) {
  currentCategory = catKey;
  
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light');
  }

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.className = "cat-btn px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300";
    btn.style.backgroundColor = '';
    btn.style.color = '';
  });
  
  const meta = categoriesMeta[catKey];
  btnElement.className = "cat-btn active px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md text-white scale-105";
  btnElement.style.backgroundColor = meta.color;

  btnElement.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest'
  });

  loadCategoryData(catKey);
}

function openLink(url) {
  if (!url || url === '#') return;

  if (tg?.HapticFeedback) {
    tg.HapticFeedback.selectionChanged();
  }

  if (tg?.openLink) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategoryData(currentCategory);
});