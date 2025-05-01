let compositions = [];

// Load compositions data
fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error(`Failed to load data.json: ${response.status}`);
    return response.json();
  })
  .then(data => {
    compositions = data;
    initializeTabs();
    renderTree(getPriorities());
  })
  .catch(err => console.error('Error loading compositions:', err));

// Setup draggable priority tabs and Apply button
function initializeTabs() {
  const tabs = document.getElementById('priorityTabs');
  Sortable.create(tabs, {
    animation: 150,
    handle: '.handle'
  });

  document.getElementById('applyTabs')
    .addEventListener('click', () => {
      renderTree(getPriorities());
    });
}

// Read the current tab order into an array of field names
function getPriorities() {
  return Array.from(document.querySelectorAll('#priorityTabs li'))
    .map(li => li.dataset.field);
}

// Recursively build the tree using priority order
function buildTree(arr, priorities, depth = 0) {
  if (depth >= priorities.length) return document.createElement('ul');

  const field = priorities[depth];
  const groups = [...new Set(arr.map(i => i[field] || 'Unknown'))].sort();
  const ul = document.createElement('ul');

  groups.forEach(group => {
    const li = document.createElement('li');

    const label = document.createElement('span');
    label.textContent = group;
    label.classList.add('caret');
    li.appendChild(label);

    const items = arr.filter(i => (i[field] || 'Unknown') === group);
    if (items.length) {
      const childUl = buildTree(items, priorities, depth + 1);
      childUl.classList.add('nested');
      li.appendChild(childUl);
    }

    ul.appendChild(li);
  });

  return ul;
}

// Render the tree with current priorities
function renderTree(priorities) {
  compositions.sort((a, b) => {
    for (let field of priorities) {
      const va = (a[field] || '').toString();
      const vb = (b[field] || '').toString();
      if (va < vb) return -1;
      if (va > vb) return 1;
    }
    return 0;
  });

  const container = document.getElementById('musicTree');
  container.innerHTML = '';
  container.appendChild(buildTree(compositions, priorities));

  document.querySelectorAll('.caret').forEach(caret => {
    caret.addEventListener('click', () => {
      const nested = caret.parentElement.querySelector('.nested');
      if (nested) {
        nested.classList.toggle('active');
        caret.classList.toggle('caret-down');
      }
    });
  });
}
