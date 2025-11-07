(function () {
  const assetPrefix = document.body.dataset.assetPrefix || '';

  const STORAGE_KEYS = {
    FAVS: 'novaboard:favorites',
    CUSTOM: 'novaboard:shortcuts',
    PROFILE: 'novaboard:profile',
    ACCENT: 'novaboard:accent'
  };

  const DEFAULTS = {
    ACCENT: getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#5c7cfa',
    TAGLINE: '集中管理你的 AI 工具与效率入口。'
  };

  const builtInEntries = [
    {
      id: 'ocr',
      type: 'category',
      name: '视觉识别',
      description: '图片转文字、批量 OCR 与识别流程。',
      path: 'category/ocr.html',
      icon: 'icon-ocr',
      badge: '系统分类',
      keywords: ['ocr', '文字识别', '图片', '扫描']
    },
    {
      id: 'ai',
      type: 'category',
      name: 'AI 助手',
      description: '对话、写作、知识检索，一站式管理 AI 入口。',
      path: 'category/ai.html',
      icon: 'icon-robot',
      badge: '系统分类',
      keywords: ['ai', '聊天', '写作', '模型']
    },
    {
      id: 'workspace',
      type: 'category',
      name: '效率工具',
      description: '文本整理、便笺速记、网页存档等效率小工具。',
      path: 'category/tools.html',
      icon: 'icon-bolt',
      badge: '系统分类',
      keywords: ['效率', '工具', '便笺', 'workflow']
    },
    {
      id: 'personal',
      type: 'category',
      name: '个人中心',
      description: '管理资料、偏好设置与自定义入口。',
      path: 'category/mine.html',
      icon: 'icon-user',
      badge: '系统分类',
      keywords: ['个人', '设置', '资料']
    }
  ];

  const categoryDetails = {
    ocr: {
      id: 'ocr',
      title: '视觉识别',
      description: '把纸质内容快速转换成可编辑文本，支撑你的整理与二次创作。',
      intro: '从单图快速识别到多图合并，NovaBoard 内置的 OCR 工具帮助你轻松采集与整理素材。'
    },
    ai: {
      id: 'ai',
      title: 'AI 助手',
      description: '打造你的私人大模型工作流，从提示语到知识检索一步到位。',
      intro: '集中常用的 AI 写作、聊天与知识辅助工具，搭建可靠的智能助手工作台。'
    },
    workspace: {
      id: 'workspace',
      title: '效率工具',
      description: '快速记录灵感、拆分任务与保存网页，让零散信息有序沉淀。',
      intro: '这些轻量工具专注于日常效率，将灵感、待办与剪藏归档在同一个面板中。'
    },
    personal: {
      id: 'personal',
      title: '个人中心',
      description: '维护你的资料与偏好，让面板始终契合个人习惯。',
      intro: '在这里更新欢迎语、主题色以及自定义入口，打造只属于你的 NovaBoard。'
    }
  };

  const toolRegistry = {
    ocr: [
      {
        id: 'ocr-single',
        name: '单图识别',
        description: '上传单张图片，自动提取并预览识别结果。',
        path: 'tools/ocr_single.html',
        icon: 'icon-ocr',
        badge: 'OCR 工具',
        keywords: ['ocr', '单图', '识别']
      },
      {
        id: 'ocr-multi',
        name: '多图合并',
        description: '批量处理多张图片，合并输出一份完整文本。',
        path: 'tools/ocr_multi.html',
        icon: 'icon-grid',
        badge: 'OCR 工具',
        keywords: ['ocr', '批量', '合并']
      }
    ],
    ai: [
      {
        id: 'prompt-notebook',
        name: '提示语手册',
        description: '整理高质量提示词，分类保存并一键复制。',
        path: 'tools/prompt_notebook.html',
        icon: 'icon-pencil',
        badge: 'AI 工作流',
        keywords: ['prompt', 'notebook', '提示']
      }
    ],
    workspace: [
      {
        id: 'quick-capture',
        name: '快写便笺',
        description: '收集灵感、任务与摘要，支持标签与完成状态。',
        path: 'tools/quick_capture.html',
        icon: 'icon-bolt',
        badge: '效率工具',
        keywords: ['note', '便笺', '快速记录']
      },
      {
        id: 'universal-toolbox',
        name: '全能工具箱',
        description: '集合文本整理、行动清单与剪藏链接生成的一站式工作台。',
        path: 'tools/toolbox.html',
        icon: 'icon-grid',
        badge: '效率工具',
        keywords: ['toolbox', '剪藏', 'workflow', '合集']
      },
      {
        id: 'smart-clipper',
        name: '剪藏展示页',
        description: '以分享页形式呈现网页摘要、标签、摘录与行动计划。',
        path: 'tools/clipper.html',
        icon: 'icon-link',
        badge: '效率工具',
        keywords: ['剪藏', '收藏', '分享', '链接']
      }
    ],
    personal: [
      {
        id: 'profile-center',
        name: '个人资料',
        description: '更新昵称、欢迎语与专注方向。',
        path: 'profile.html',
        icon: 'icon-user',
        badge: '系统页面',
        keywords: ['profile', '资料', '昵称']
      },
      {
        id: 'preferences',
        name: '偏好设置',
        description: '调整主题色，管理自定义快捷入口。',
        path: 'settings.html',
        icon: 'icon-settings',
        badge: '系统页面',
        keywords: ['设置', '主题', '自定义']
      }
    ]
  };

  function loadFavorites() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVS) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (e) {
      console.warn('Failed to parse favorites', e);
      return [];
    }
  }

  function saveFavorites(list) {
    localStorage.setItem(STORAGE_KEYS.FAVS, JSON.stringify(list));
  }

  function isFavorite(id) {
    return loadFavorites().includes(id);
  }

  function loadCustomEntries() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM) || '[]');
      if (!Array.isArray(value)) return [];
      return value
        .map((item) => ({
          id: item.id,
          type: 'shortcut',
          name: item.name,
          description: item.description,
          path: item.path,
          icon: item.icon || 'icon-link',
          badge: item.badge || '自定义入口',
          keywords: item.keywords || [item.name, item.description, item.path],
          external: Boolean(item.external)
        }))
        .filter((item) => item.id && item.name && item.path);
    } catch (e) {
      console.warn('Failed to parse custom entries', e);
      return [];
    }
  }

  function saveCustomEntries(list) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM, JSON.stringify(list));
  }

  function removeOrphanedFavorites() {
    const favs = loadFavorites();
    const validIds = new Set(getAllEntries().map((item) => item.id));
    const filtered = favs.filter((id) => validIds.has(id));
    if (filtered.length !== favs.length) {
      saveFavorites(filtered);
    }
  }

  function loadProfile() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILE) || '{}');
      return {
        name: value.name || '',
        tagline: value.tagline || '',
        focus: value.focus || ''
      };
    } catch (e) {
      console.warn('Failed to parse profile', e);
      return { name: '', tagline: '', focus: '' };
    }
  }

  function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  function loadAccent() {
    return localStorage.getItem(STORAGE_KEYS.ACCENT) || '';
  }

  function saveAccent(value) {
    localStorage.setItem(STORAGE_KEYS.ACCENT, value);
  }

  function applyAccent() {
    const accent = loadAccent() || DEFAULTS.ACCENT.trim();
    if (accent) {
      document.documentElement.style.setProperty('--accent', accent);
      document.documentElement.style.setProperty('--accent-soft', hexToSoft(accent));
    }
  }

  function hexToSoft(hex) {
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) return 'rgba(92, 124, 250, 0.16)';
    const normalized = hex.length === 4
      ? '#' + hex.slice(1).split('').map((c) => c + c).join('')
      : hex;
    const intVal = parseInt(normalized.slice(1), 16);
    const r = (intVal >> 16) & 255;
    const g = (intVal >> 8) & 255;
    const b = intVal & 255;
    return `rgba(${r}, ${g}, ${b}, 0.18)`;
  }

  function getAllEntries() {
    return [...builtInEntries, ...loadCustomEntries()];
  }

  function resolvePath(path, external) {
    if (external) return path;
    if (!path) return '#';
    return assetPrefix + path.replace(/^\.\//, '');
  }

  function renderEntryTile(entry) {
    const tile = document.createElement('article');
    tile.className = 'tile';
    tile.dataset.entryId = entry.id;

    const favBtn = document.createElement('button');
    favBtn.type = 'button';
    favBtn.className = 'fav-toggle';
    favBtn.dataset.favKey = entry.id;
    updateFavButtonState(favBtn);
    favBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(entry.id);
    });
    tile.appendChild(favBtn);

    const link = document.createElement('a');
    link.className = 'tile-main';
    link.href = resolvePath(entry.path, entry.external);
    if (entry.external) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }

    const iconWrap = document.createElement('span');
    iconWrap.className = 'tile-icon';
    iconWrap.innerHTML = `<svg class="icon"><use href="${assetPrefix}assets/icons.svg#${entry.icon || 'icon-link'}"></use></svg>`;

    const textWrap = document.createElement('div');
    textWrap.className = 'tile-text';

    const header = document.createElement('div');
    header.className = 'tile-header';

    const title = document.createElement('div');
    title.className = 'tile-title';
    title.textContent = entry.name;
    header.appendChild(title);

    if (entry.badge) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = entry.badge;
      header.appendChild(badge);
    }

    const desc = document.createElement('p');
    desc.className = 'tile-desc';
    desc.textContent = entry.description;

    textWrap.append(header, desc);
    link.append(iconWrap, textWrap);
    tile.appendChild(link);

    return tile;
  }

  function renderGrid(container, entries) {
    if (!container) return;
    container.innerHTML = '';
    if (!entries.length) {
      const message = container.dataset.emptyText || '暂无内容';
      const placeholder = document.createElement('div');
      placeholder.className = 'empty-state';
      placeholder.textContent = message;
      container.appendChild(placeholder);
      return;
    }
    const fragment = document.createDocumentFragment();
    entries.forEach((entry) => {
      fragment.appendChild(renderEntryTile(entry));
    });
    container.appendChild(fragment);
  }

  function renderHomeFavorites() {
    const container = document.getElementById('fav');
    if (!container) return;
    const favIds = loadFavorites();
    const entriesMap = new Map(getAllEntries().map((item) => [item.id, item]));
    const favorites = favIds
      .map((id) => entriesMap.get(id))
      .filter(Boolean);
    renderGrid(container, favorites);
  }

  function renderAllEntries(entries) {
    const container = document.getElementById('all');
    if (!container) return;
    renderGrid(container, entries || getAllEntries());
  }

  function filterEntries(keyword) {
    const query = keyword.trim().toLowerCase();
    if (!query) return getAllEntries();
    return getAllEntries().filter((entry) => {
      const fields = [entry.name, entry.description, ...(entry.keywords || [])];
      return fields.some((text) => text && text.toLowerCase().includes(query));
    });
  }

  function updateFavButtonState(button) {
    const id = button.dataset.favKey;
    const active = isFavorite(id);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.setAttribute('aria-label', active ? '取消收藏' : '加入收藏');
    button.innerHTML = `<svg class="icon"><use href="${assetPrefix}assets/icons.svg#${active ? 'icon-star' : 'icon-star-line'}"></use></svg>`;
  }

  function updateFavButtons() {
    document.querySelectorAll('.fav-toggle').forEach((btn) => updateFavButtonState(btn));
  }

  function toggleFavorite(id) {
    const favs = new Set(loadFavorites());
    if (favs.has(id)) {
      favs.delete(id);
    } else {
      favs.add(id);
    }
    saveFavorites(Array.from(favs));
    onFavoritesChanged();
  }

  function onFavoritesChanged() {
    updateFavButtons();
    renderHomeFavorites();
    renderFavoritesPage();
    updateProfileStats();
  }

  function highlightNav(page) {
    const activeKey =
      page === 'favorites' ? 'favorites' :
      page === 'profile' ? 'profile' :
      page === 'settings' ? 'settings' :
      'home';
    document.querySelectorAll('.navbar [data-nav]').forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === activeKey);
    });
  }

  function applyProfileGreeting() {
    const profile = loadProfile();
    const brandEl = document.querySelector('[data-brand]');
    const taglineEl = document.querySelector('[data-tagline]');
    if (brandEl) {
      brandEl.textContent = profile.name ? `${profile.name} 的 NovaBoard` : 'NovaBoard';
    }
    if (taglineEl) {
      const defaultText = taglineEl.dataset.default || DEFAULTS.TAGLINE;
      taglineEl.textContent = profile.tagline || defaultText;
    }
  }

  function initSearch() {
    const input = document.getElementById('q');
    if (!input) return;
    input.addEventListener('input', (event) => {
      const value = event.target.value || '';
      const filtered = filterEntries(value);
      renderAllEntries(filtered);
      updateFavButtons();
    });
  }

  function initHome() {
    applyProfileGreeting();
    renderHomeFavorites();
    renderAllEntries();
    updateFavButtons();
    initSearch();
    highlightNav('home');
  }

  function renderFavoritesPage() {
    const container = document.getElementById('favoritesList');
    if (!container) return;
    const favIds = loadFavorites();
    const entriesMap = new Map(getAllEntries().map((item) => [item.id, item]));
    const favorites = favIds
      .map((id) => entriesMap.get(id))
      .filter(Boolean);
    renderGrid(container, favorites);
  }

  function initFavoritesPage() {
    renderFavoritesPage();
    updateFavButtons();
    highlightNav('favorites');
  }

  function initCategoryPage() {
    const categoryId = document.body.dataset.category;
    if (!categoryId) return;
    const meta = categoryDetails[categoryId];
    if (!meta) return;
    const titleEl = document.querySelector('[data-category-title]');
    const descEl = document.querySelector('[data-category-description]');
    const introEl = document.querySelector('[data-category-intro]');
    if (titleEl) titleEl.textContent = meta.title;
    if (descEl) descEl.textContent = meta.description;
    if (introEl) introEl.textContent = meta.intro;
    const entries = toolRegistry[categoryId] || [];
    const container = document.getElementById('categoryGrid');
    renderGrid(container, entries);
    updateFavButtons();
    highlightNav('home');
  }

  function updateProfileStats() {
    const favStat = document.querySelector('[data-stat-favorites]');
    if (favStat) {
      favStat.textContent = String(loadFavorites().length);
    }
    const shortcutStat = document.querySelector('[data-stat-shortcuts]');
    if (shortcutStat) {
      shortcutStat.textContent = String(loadCustomEntries().length);
    }
  }

  function initProfilePage() {
    const profile = loadProfile();
    const nameInput = document.getElementById('profileName');
    const taglineInput = document.getElementById('profileTagline');
    const focusInput = document.getElementById('profileFocus');
    if (nameInput) nameInput.value = profile.name;
    if (taglineInput) taglineInput.value = profile.tagline;
    if (focusInput) focusInput.value = profile.focus;

    const previewName = document.querySelector('[data-preview-name]');
    const previewFocus = document.querySelector('[data-preview-focus]');
    if (previewName) previewName.textContent = profile.name || 'NovaBoard 用户';
    if (previewFocus) previewFocus.textContent = profile.focus || '点击右侧编辑你的关注领域。';

    const form = document.getElementById('profileForm');
    const status = document.querySelector('[data-profile-status]');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const updated = {
          name: nameInput ? nameInput.value.trim() : '',
          tagline: taglineInput ? taglineInput.value.trim() : '',
          focus: focusInput ? focusInput.value.trim() : ''
        };
        saveProfile(updated);
        if (status) {
          status.textContent = '已保存至本地浏览器。';
          status.classList.add('sub');
          setTimeout(() => (status.textContent = ''), 2400);
        }
        if (previewName) previewName.textContent = updated.name || 'NovaBoard 用户';
        if (previewFocus) previewFocus.textContent = updated.focus || '点击右侧编辑你的关注领域。';
        applyProfileGreeting();
      });
    }

    updateProfileStats();
    highlightNav('profile');
  }

  function initSettingsPage() {
    const accentInput = document.getElementById('accentColor');
    const savedAccent = loadAccent();
    if (accentInput) {
      accentInput.value = savedAccent || DEFAULTS.ACCENT.trim() || '#5c7cfa';
      accentInput.addEventListener('input', (event) => {
        const value = event.target.value;
        saveAccent(value);
        applyAccent();
      });
    }

    const form = document.getElementById('shortcutForm');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const name = (formData.get('name') || '').toString().trim();
        const description = (formData.get('description') || '').toString().trim();
        const path = (formData.get('path') || '').toString().trim();
        const external = formData.get('external') === 'on' || /^https?:/i.test(path);
        if (!name || !path) {
          alert('请填写名称和链接地址。');
          return;
        }
        const entries = loadCustomEntries();
        const newEntry = {
          id: `custom-${Date.now()}`,
          name,
          description,
          path,
          icon: 'icon-link',
          badge: '自定义入口',
          keywords: [name, description, path],
          external
        };
        entries.push(newEntry);
        saveCustomEntries(entries);
        form.reset();
        renderCustomList();
        onFavoritesChanged();
      });
    }

    renderCustomList();
    updateProfileStats();
    highlightNav('settings');
  }

  function renderCustomList() {
    const container = document.getElementById('customList');
    if (!container) return;
    const entries = loadCustomEntries();
    container.innerHTML = '';
    if (!entries.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = '暂未添加自定义入口。';
      container.appendChild(empty);
      return;
    }
    entries.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'item-row';

      const meta = document.createElement('div');
      meta.className = 'meta';
      const title = document.createElement('strong');
      title.textContent = entry.name;
      const url = document.createElement('span');
      url.textContent = entry.path;
      meta.append(title, url);

      const actions = document.createElement('div');
      actions.className = 'actions';

      const openBtn = document.createElement('a');
      openBtn.className = 'btn secondary';
      openBtn.href = resolvePath(entry.path, entry.external);
      openBtn.target = entry.external ? '_blank' : '_self';
      openBtn.rel = entry.external ? 'noopener noreferrer' : '';
      openBtn.innerHTML = '<svg class="icon"><use href="' + assetPrefix + 'assets/icons.svg#icon-link"></use></svg> 打开';

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn danger';
      deleteBtn.innerHTML = '<svg class="icon"><use href="' + assetPrefix + 'assets/icons.svg#icon-trash"></use></svg> 删除';
      deleteBtn.addEventListener('click', () => {
        const next = loadCustomEntries().filter((item) => item.id !== entry.id);
        saveCustomEntries(next);
        const favs = loadFavorites().filter((id) => id !== entry.id);
        saveFavorites(favs);
        renderCustomList();
        onFavoritesChanged();
      });

      actions.append(openBtn, deleteBtn);
      row.append(meta, actions);
      container.appendChild(row);
    });
  }

  function boot() {
    applyAccent();
    removeOrphanedFavorites();
    const page = document.body.dataset.page;
    switch (page) {
      case 'home':
        initHome();
        break;
      case 'favorites':
        initFavoritesPage();
        break;
      case 'category':
        initCategoryPage();
        break;
      case 'profile':
        initProfilePage();
        break;
      case 'settings':
        initSettingsPage();
        break;
      default:
        highlightNav('home');
        break;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
