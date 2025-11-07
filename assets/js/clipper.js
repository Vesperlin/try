(function () {
  const params = new URLSearchParams(window.location.search);

  function parseList(value, separator) {
    if (!value) return [];
    return value
      .split(separator)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  const defaultCover = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80';
  const highlights = parseList(params.get('highlights'), /\||\n/g);
  const tasks = parseList(params.get('tasks'), /\||\n/g);
  const tags = parseList(params.get('tags'), /,|\n|\|/g);
  const title = params.get('title') || 'NovaBoard 剪藏示例';
  const description = params.get('description') || '使用 NovaBoard 工具箱生成的剪藏页，记录摘要、重点、标签与行动计划。';
  const url = params.get('url') || 'https://novaboard.example/toolbox';
  const notes = params.get('notes') || '';
  const cover = params.get('cover') || defaultCover;
  const created = params.get('created') || new Date().toISOString();

  document.title = `${title} · NovaBoard 剪藏`;

  function getDomain(input) {
    try {
      const parsed = new URL(input);
      return parsed.hostname.replace(/^www\./, '');
    } catch (e) {
      return input;
    }
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const titleEl = document.querySelector('[data-clip-title]');
  if (titleEl) titleEl.textContent = title;

  const descEl = document.querySelector('[data-clip-description]');
  if (descEl) descEl.textContent = description;

  const coverEl = document.querySelector('[data-clip-cover]');
  if (coverEl) {
    coverEl.style.backgroundImage = `url("${cover}")`;
  }

  const urlEl = document.querySelector('[data-clip-url]');
  if (urlEl) {
    urlEl.href = url;
    urlEl.textContent = url.replace(/^https?:\/\//, '');
  }

  const domainEl = document.querySelector('[data-clip-domain]');
  if (domainEl) {
    domainEl.textContent = `来源：${getDomain(url)}`;
  }

  const readingEl = document.querySelector('[data-clip-reading]');
  if (readingEl) {
    const text = [description, ...highlights].join(' ');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const minutes = words ? Math.max(1, Math.round(words / 250)) : 0;
    readingEl.textContent = minutes ? `≈ ${minutes} 分钟阅读` : '';
  }

  const highlightsEl = document.querySelector('[data-clip-highlights]');
  if (highlightsEl) {
    highlightsEl.innerHTML = '';
    const list = highlights.length
      ? highlights
      : ['把核心观点整理为卡片，便于团队快速理解。', '关联下一步行动，为项目推进提供上下文。', '与 NovaBoard 其他工具协同，打造高效工作流。'];
    list.forEach((item) => {
      const block = document.createElement('div');
      block.className = 'highlight';
      block.textContent = item;
      highlightsEl.appendChild(block);
    });
  }

  const tasksEl = document.querySelector('[data-clip-tasks]');
  if (tasksEl) {
    tasksEl.innerHTML = '';
    const list = tasks.length
      ? tasks
      : ['整理剪藏重点，存入 NovaBoard 工具箱。', '与团队同步链接，确认下一步负责人。', '在行动清单中勾选完成进度。'];
    list.forEach((task) => {
      const li = document.createElement('li');
      li.textContent = task;
      tasksEl.appendChild(li);
    });
  }

  const tagsEl = document.querySelector('[data-clip-tags]');
  if (tagsEl) {
    tagsEl.innerHTML = '';
    const list = tags.length ? tags : ['NovaBoard', '剪藏', '效率'];
    list.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.textContent = tag;
      tagsEl.appendChild(span);
    });
  }

  const notesEl = document.querySelector('[data-clip-notes]');
  if (notesEl) {
    if (notes) {
      notesEl.textContent = notes;
      notesEl.style.display = 'block';
    } else {
      notesEl.style.display = 'none';
    }
  }

  const footerEl = document.querySelector('[data-clip-footer]');
  if (footerEl) {
    const dateText = formatDate(created);
    footerEl.textContent = dateText
      ? `最后更新：${dateText} · 使用 NovaBoard 工具箱生成`
      : '使用 NovaBoard 工具箱生成';
  }
})();
