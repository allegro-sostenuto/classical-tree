// js/tree.js

let compositions = [];

// 1. Load compositions data
fetch('data.json')
  .then(response => {
    if (!response.ok) throw new Error(`Failed to load data.json: ${response.status}`);
    return response.json();
  })
  .then(data => {
    compositions = data;
    initializeTabs();
    // Initial render with default tab order
    renderTree(getPriorities());
  })
  .catch(err => console.error('Error loading compositions:', err));

// 2. Set up draggable priority tabs and Apply button
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

// 3. Read the current tab order into an array of field names
function getPriorities() {
  return Array.from(
    document.querySelectorAll('#priorityTabs li')
  ).map(li => li.dataset.field);
}

// 4. Recursively build the tree using your priority array
function buildTree(arr, priorities, depth = 0) {
  // If we've exhausted priorities, return an empty UL
  if (depth >= priorities.length) return document.createElement('ul');

  const field = priorities[depth];
  const groups = [...new Set(arr.map(i => i[field] || 'Unknown'))].sort();
  const ul = document.createElement('ul');

  groups.forEach(group => {
    const li = document.createElement('li');

    // The collapsible label
    const label = document.createElement('span');
    label.textContent = group;
    label.classList.add('caret');
    li.appendChild(label);

    // Items in this group
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

// 5. Sort & render the tree based on the given priorities
function renderTree(priorities) {
  // Multi-key sort on compositions
  compositions.sort((a, b) => {
    for (let field of priorities) {
      const va = (a[field] || '').toString();
      const vb = (b[field] || '').toString();
      if (va < vb) return -1;
      if (va > vb) return 1;
    }
    return 0;
  });

  // Rebuild the DOM
  const container = document.getElementById('musicTree');
  container.innerHTML = '';
  container.appendChild(buildTree(compositions, priorities));

  // Wire up collapse/expand on each caret
  document.querySelectorAll('.caret').forEach(caret => {
    caret.addEventListener('click', () => {
      const nested = caret.parentElement.querySelector('.nested');
      nested.classList.toggle('active');
      caret.classList.toggle('caret-down');
    });
  });
}
