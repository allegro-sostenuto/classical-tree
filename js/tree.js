let compositions = [];
let selectedFilters = {};

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
  tabs.innerHTML = ''; // Clear existing static tabs

  const fields = Object.keys(compositions[0]).filter(f => f !== 'name');

  fields.forEach(field => {
    const li = document.createElement('li');
    li.dataset.field = field;

    const handle = document.createElement('span');
    handle.className = 'handle';
    handle.textContent = '≡';
    li.appendChild(handle);

    li.appendChild(document.createTextNode(field.charAt(0).toUpperCase() + field.slice(1)));

    const button = document.createElement('button');
    button.textContent = "▼";
    button.classList.add('expand-btn');
    button.addEventListener('click', () => {
      console.log(`Expand dropdown for ${field}`);
    });
    li.appendChild(button);

    tabs.appendChild(li);
  });

  Sortable.create(tabs, {
    animation: 150,
    handle: '.handle'
  });

  document.getElementById('applyTabs')
    .addEventListener('click', () => {
      renderTree(getPriorities());
    });
}

// Generate the dropdowns and checkboxes dynamically based on composition fields
function generateDropdownFilters() {
  const fields = Object.keys(compositions[0]); // Get all fields dynamically

  fields.forEach(field => {
    const fieldValues = [...new Set(compositions.map(comp => comp[field] || 'Unknown'))];

    // Create a container for the field
    const fieldContainer = document.createElement('div');
    fieldContainer.classList.add('filter-container');

    // Create a label for the field
    const label = document.createElement('label');
    label.textContent = field.charAt(0).toUpperCase() + field.slice(1);
    fieldContainer.appendChild(label);

    // Create a dropdown for the field
    const dropdownButton = document.createElement('button');
    dropdownButton.classList.add('dropdown-btn');
    dropdownButton.textContent = '▼';
    fieldContainer.appendChild(dropdownButton);

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');
    fieldContainer.appendChild(dropdownContent);

    // Create checkboxes for each unique field value
    fieldValues.forEach(value => {
      const checkboxWrapper = document.createElement('div');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = value;
      checkbox.id = `${field}-${value}`;
      checkbox.checked = selectedFilters[field] ? selectedFilters[field].includes(value) : true;
      const checkboxLabel = document.createElement('label');
      checkboxLabel.setAttribute('for', `${field}-${value}`);
      checkboxLabel.textContent = value;

      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(checkboxLabel);
      dropdownContent.appendChild(checkboxWrapper);

      // Add event listener to update selectedFilters when checkbox is toggled
      checkbox.addEventListener('change', () => {
        updateSelectedFilters(field, value, checkbox.checked);
        renderTree(getPriorities());
      });
    });

    document.getElementById('filterContainer').appendChild(fieldContainer);

    // Toggle dropdown visibility
    dropdownButton.addEventListener('click', () => {
      dropdownContent.classList.toggle('show');
    });
  });
}

// Update the selected filter values
function updateSelectedFilters(field, value, isChecked) {
  if (isChecked) {
    if (!selectedFilters[field]) selectedFilters[field] = [];
    selectedFilters[field].push(value);
  } else {
    selectedFilters[field] = selectedFilters[field].filter(v => v !== value);
  }
}

// Read the current tab order into an array of field names
function getPriorities() {
  return Array.from(document.querySelectorAll('#priorityTabs li'))
    .map(li => li.dataset.field);
}



// Recursively build the tree using priority order
function buildTree(arr, priorities, depth = 0) {
  const ul = document.createElement('ul');

  if (depth >= priorities.length) {
    arr.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name;  // Show the name at the end
      ul.appendChild(li);
    });
    return ul;
  }

  const field = priorities[depth];
  const groups = [...new Set(arr.map(i => i[field] || 'Unknown'))].sort();

  groups.forEach(group => {
    if (!selectedFilters[field] || selectedFilters[field].includes(group)) {
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
    }
  });

  return ul;
}

// Render the tree with current priorities and filters
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

  // Add event listeners for the caret (expand/collapse)
  document.querySelectorAll('.caret').forEach(caret => {
    caret.addEventListener('click', () => {
      const nested = caret.parentElement.querySelector('.nested');
      if (nested) {
        nested.classList.toggle('active');
        caret.classList.toggle('caret-down');
      }

      // Toggle the checkbox container when a genre is clicked
      const checkboxContainer = caret.parentElement.querySelector('.checkbox-container');
      if (checkboxContainer) {
        checkboxContainer.classList.toggle('active');
      }
    });
  });
}

// Function to expand all nested tree items recursively
function expandAll() {
  const caretIcons = document.querySelectorAll('.caret');
  caretIcons.forEach(caret => {
    if (!caret.classList.contains('caret-down')) { // If not expanded
      caret.click(); // Simulate a click to expand the node
    }
  });
}

// Function to collapse all nested tree items recursively
function collapseAll() {
  const caretIcons = document.querySelectorAll('.caret');
  caretIcons.forEach(caret => {
    if (caret.classList.contains('caret-down')) { // If expanded
      caret.click(); // Simulate a click to collapse the node
    }
  });
}

// Toggle between expand all and collapse all based on current state
document.getElementById('expandCollapseAll').addEventListener('click', function () {
  const allExpanded = document.querySelectorAll('.caret-down').length === document.querySelectorAll('.caret').length;
  if (allExpanded) {
    collapseAll();
    this.textContent = "Expand All";
  } else {
    expandAll();
    this.textContent = "Collapse All";
  }
});
