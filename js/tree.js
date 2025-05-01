// js/tree.js

let compositions = [];

// 1. Load your compositions data from data.json
fetch('data.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Failed to load data.json: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    compositions = data;
    renderTree();               // build the tree once data is ready
  })
  .catch(err => console.error('Error loading compositions:', err));

// 2. Recursively build the nested <ul> tree by a given field
function buildTree(arr, field) {
  // get unique, sorted group keys
  const groups = [...new Set(arr.map(item => item[field] || 'Unknown'))].sort();
  const ul = document.createElement('ul');

  groups.forEach(group => {
    const li = document.createElement('li');

    // create the clickable label
    const label = document.createElement('span');
    label.textContent = group;
    label.classList.add('caret');
    li.appendChild(label);

    // items belonging to this group
    const items = arr.filter(item => (item[field] || 'Unknown') === group);

    if (items.length) {
      // determine next field in priority cycle
      const priority = ['composer','year','genre','instrumentation','category','name'];
      const nextField = priority[(priority.indexOf(field) + 1) % priority.length];

      // build a nested <ul> for children
      const childUl = document.createElement('ul');
      childUl.classList.add('nested');

      if (field === 'name') {
        // leaf nodes: individual compositions
        items.forEach(item => {
          const leafLi = document.createElement('li');
          leafLi.textContent = `${item.name} (${item.year}, ${item.genre})`;
          childUl.appendChild(leafLi);
        });
      } else {
        // recurse deeper
        const subtree = buildTree(items, nextField);
        subtree.classList.add('nested');
        childUl.appendChild(subtree);
      }

      li.appendChild(childUl);
    }

    ul.appendChild(li);
  });

  return ul;
}

// 3. Render the tree in the page according to the selected sort field
function renderTree() {
  const field = document.getElementById('sortField').value;

  // sort the flat array by the chosen field, with name as tiebreaker
  compositions.sort((a, b) => {
    const va = (a[field] || '').toString();
    const vb = (b[field] || '').toString();
    if (va < vb) return -1;
    if (va > vb) return 1;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });

  // clear and rebuild the tree
  const container = document.getElementById('musicTree');
  container.innerHTML = '';
  container.appendChild(buildTree(compositions, field));

  // wire up expand/collapse on every caret
  document.querySelectorAll('.caret').forEach(caret => {
    caret.addEventListener('click', () => {
      const nested = caret.parentElement.querySelector('.nested');
      nested.classList.toggle('active');
      caret.classList.toggle('caret-down');
    });
  });
}

// 4. Attach the sort button after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sortBtn').addEventListener('click', renderTree);
});
