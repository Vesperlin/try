(function () {
  const TASK_KEY = 'novaboard:toolbox:tasks';

  const textInput = document.querySelector('[data-text-lab-input]');
  const statTargets = {
    chars: document.querySelector('[data-text-stat="chars"]'),
    words: document.querySelector('[data-text-stat="words"]'),
    lines: document.querySelector('[data-text-stat="lines"]'),
    reading: document.querySelector('[data-text-stat="reading"]')
  };

  const form = document.querySelector('[data-checklist-form]');
  const list = document.querySelector('[data-checklist-list]');
  const template = document.querySelector('[data-clip-template]');
  const shareInput = document.querySelector('[data-clip-link]');
  const copyBtn = document.querySelector('[data-copy-link]');
  const openBtn = document.querySelector('[data-open-link]');

  function updateTextStats() {
    if (!textInput) return;
    const value = textInput.value;
    const chars = value.length;
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    const lines = value ? value.split(/\n/).length : 0;
    const readingMinutes = words ? Math.max(1, Math.round(words / 250)) : 0;

    if (statTargets.chars) statTargets.chars.textContent = String(chars);
    if (statTargets.words) statTargets.words.textContent = String(words);
    if (statTargets.lines) statTargets.lines.textContent = String(lines);
    if (statTargets.reading) {
      statTargets.reading.textContent = readingMinutes ? `${readingMinutes} 分钟` : '—';
    }
  }

  function toTitleCase(text) {
    return text.replace(/[\w\u00C0-\u024F\u4E00-\u9FA5][^\s-]*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  }

  function normalizeWhitespace(text) {
    return text
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter((line, index, arr) => line || (index > 0 && arr[index - 1]))
      .join('\n');
  }

  function handleTextAction(action) {
    if (!textInput) return;
    const value = textInput.value;
    switch (action) {
      case 'uppercase':
        textInput.value = value.toUpperCase();
        break;
      case 'lowercase':
        textInput.value = value.toLowerCase();
        break;
      case 'title':
        textInput.value = toTitleCase(value);
        break;
      case 'clean':
        textInput.value = normalizeWhitespace(value);
        break;
      case 'copy':
        copyText(value);
        break;
      default:
        break;
    }
    updateTextStats();
  }

  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.warn('Clipboard copy failed', e);
    }
    document.body.removeChild(textarea);
  }

  document.querySelectorAll('[data-text-action]').forEach((button) => {
    button.addEventListener('click', () => handleTextAction(button.dataset.textAction));
  });

  if (textInput) {
    textInput.addEventListener('input', updateTextStats);
    updateTextStats();
  }

  function loadTasks() {
    try {
      const saved = JSON.parse(localStorage.getItem(TASK_KEY) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      console.warn('Failed to parse toolbox tasks', e);
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
  }

  let tasks = loadTasks();

  function renderTasks() {
    if (!list) return;
    list.innerHTML = '';
    if (!tasks.length) {
      const empty = document.createElement('li');
      empty.textContent = '暂未添加任务，写下第一条吧。';
      empty.style.color = 'var(--text-subtle)';
      list.appendChild(empty);
      return;
    }
    tasks.forEach((task) => {
      const item = document.createElement('li');
      const text = document.createElement('span');
      text.textContent = task.text;
      if (task.done) text.classList.add('done');
      text.addEventListener('click', () => toggleTask(task.id));

      const actions = document.createElement('div');
      actions.className = 'actions';

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.textContent = task.done ? '重启' : '完成';
      toggleBtn.addEventListener('click', () => toggleTask(task.id));

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.innerHTML = '<svg class="icon" width="16" height="16"><use href="../assets/icons.svg#icon-trash"></use></svg>';
      removeBtn.addEventListener('click', () => removeTask(task.id));

      actions.append(toggleBtn, removeBtn);
      item.append(text, actions);
      list.appendChild(item);
    });
  }

  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const task = {
      id: Date.now().toString(36),
      text: trimmed,
      done: false
    };
    tasks.unshift(task);
    saveTasks(tasks);
    renderTasks();
  }

  function toggleTask(id) {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    saveTasks(tasks);
    renderTasks();
  }

  function removeTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks(tasks);
    renderTasks();
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="text"]');
      if (!input) return;
      addTask(input.value);
      input.value = '';
      input.focus();
    });
    renderTasks();
  }

  // Clipper builder
  const clipFields = template
    ? Array.from(template.querySelectorAll('[data-clip-field]'))
    : [];
  const preview = document.querySelector('[data-clip-preview]');

  function getClipData() {
    const data = {};
    clipFields.forEach((field) => {
      const key = field.dataset.clipField;
      if (!key) return;
      data[key] = field.value.trim();
    });
    return data;
  }

  function buildShareLink(data) {
    const base = new URL('clipper.html', window.location.href);
    const params = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (!value) return;
      if (key === 'highlights' || key === 'tasks') {
        params.set(key, value.split(/\n+/).map((line) => line.trim()).filter(Boolean).join('|'));
      } else if (key === 'tags') {
        params.set(key, value.split(/[,\n]+/).map((tag) => tag.trim()).filter(Boolean).join(','));
      } else {
        params.set(key, value);
      }
    });
    base.search = params.toString();
    return base.toString();
  }

  function updatePreview() {
    if (!preview) return;
    const data = getClipData();
    const cover = data.cover || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80';
    preview.querySelector('[data-preview-title]').textContent = data.title || '你的专属剪藏标题';
    preview.querySelector('[data-preview-desc]').textContent = data.description || '为重要网页生成摘要、标签、行动项与知识留痕，集中保存你的灵感。';
    const coverEl = preview.querySelector('.preview-cover');
    if (coverEl) {
      coverEl.style.backgroundImage = `url("${cover}")`;
    }
    const linkEl = preview.querySelector('[data-preview-link]');
    if (linkEl) {
      const url = data.url || '';
      linkEl.textContent = url ? url.replace(/^https?:\/\//, '') : '链接将显示在这里';
    }
    const tagWrap = preview.querySelector('[data-preview-tags]');
    if (tagWrap) {
      tagWrap.innerHTML = '';
      const tags = data.tags
        ? data.tags.split(/[,\n]+/).map((tag) => tag.trim()).filter(Boolean)
        : [];
      if (tags.length) {
        tags.slice(0, 6).forEach((tag) => {
          const span = document.createElement('span');
          span.className = 'chip';
          span.textContent = tag;
          tagWrap.appendChild(span);
        });
      }
    }
    const highlightsWrap = preview.querySelector('[data-preview-highlights]');
    if (highlightsWrap) {
      highlightsWrap.innerHTML = '';
      const highlights = data.highlights
        ? data.highlights.split(/\n+/).map((line) => line.trim()).filter(Boolean)
        : [];
      if (highlights.length) {
        highlights.slice(0, 3).forEach((text) => {
          const div = document.createElement('div');
          div.className = 'highlight';
          div.textContent = text;
          highlightsWrap.appendChild(div);
        });
      }
    }
    const tasksWrap = preview.querySelector('[data-preview-tasks]');
    if (tasksWrap) {
      tasksWrap.innerHTML = '';
      const tasks = data.tasks
        ? data.tasks.split(/\n+/).map((line) => line.trim()).filter(Boolean)
        : [];
      if (tasks.length) {
        tasks.slice(0, 3).forEach((task) => {
          const row = document.createElement('div');
          row.className = 'task';
          row.innerHTML = '<span class="bullet"></span>';
          const label = document.createElement('span');
          label.textContent = task;
          row.appendChild(label);
          tasksWrap.appendChild(row);
        });
      }
    }
    const notesEl = preview.querySelector('[data-preview-notes]');
    if (notesEl) {
      if (data.notes) {
        notesEl.textContent = data.notes;
        notesEl.style.display = 'block';
      } else {
        notesEl.textContent = '';
        notesEl.style.display = 'none';
      }
    }
  }

  if (template) {
    template.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        updatePreview();
        clearGeneratedLink();
      });
    });
    updatePreview();
  }

  function clearGeneratedLink() {
    if (shareInput) {
      shareInput.value = '';
    }
    if (openBtn) {
      openBtn.setAttribute('aria-disabled', 'true');
      openBtn.classList.add('disabled');
      openBtn.href = '#';
    }
    if (copyBtn) {
      copyBtn.textContent = '复制链接';
    }
  }

  const generateBtn = document.querySelector('[data-generate-link]');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const data = getClipData();
      const link = buildShareLink(data);
      if (shareInput) {
        shareInput.value = link;
      }
      if (openBtn) {
        openBtn.setAttribute('aria-disabled', 'false');
        openBtn.classList.remove('disabled');
        openBtn.href = link;
      }
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!shareInput || !shareInput.value) return;
      copyText(shareInput.value);
      copyBtn.textContent = '已复制';
      setTimeout(() => {
        copyBtn.textContent = '复制链接';
      }, 1600);
    });
  }

  if (openBtn) {
    openBtn.addEventListener('click', (event) => {
      if (openBtn.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
      }
    });
  }
})();
