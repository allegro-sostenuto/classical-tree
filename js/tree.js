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

// Initialize draggable priority tabs
function initializeTabs() {
  const tabs = document.getElementById('priorityTabs');
  tabs.innerHTML = ''; // Clear existing static tabs

  const fields = Object.keys(compositions[0]).filter(f => f !== 'name');

  fields.forEach(field => {
    tabs.appendChild(createTab(field));
  });

  Sortable.create(tabs, {
    animation: 150,
    handle: '.handle',
    onEnd: () => renderTree(getPriorities())
  });
}

// Create a tab with draggable handle and expand button
function createTab(field) {
  const li = document.createElement('li');
  li.dataset.field = field;
  li.style.position = 'relative';  // Keep the parent <li> element positioned relatively

  const handle = createHandle();
  const label = createLabel(field);
  const button = createExpandButton(field);
  const dropdown = createTabDropdown(field);

  li.appendChild(handle);
  li.appendChild(label);
  li.appendChild(button);
  li.appendChild(dropdown); // Ensure dropdown is in the DOM

  // Double-click to toggle dropdown
  li.addEventListener('click', (e) => {
    e.stopPropagation();

    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';

    // Position the dropdown absolutely below the tab
    const rect = li.getBoundingClientRect();
    dropdown.style.position = 'absolute';  // Set dropdown to absolute positioning
    dropdown.style.top = `${rect.bottom}px`; // Position it directly below the tab
    dropdown.style.left = `0px`;  // Align it to the left of the tab

    // Optional: update expand icon
    const expandBtn = li.querySelector('.expand-btn');
    if (expandBtn) {
      expandBtn.textContent = isVisible ? '+' : '×';
    }
  });

  return li;
}

// Create draggable handle for a tab
function createHandle() {
  const handle = document.createElement('span');
  handle.className = 'handle';
  handle.textContent = '≡';
  return handle;
}

// Create the label for each field
function createLabel(field) {
  const label = document.createElement('span');
  label.textContent = field.charAt(0).toUpperCase() + field.slice(1);
  return label;
}

// Create the expand button for each tab
function createExpandButton(field) {
  const button = document.createElement('button');
  button.textContent = "+";
  button.classList.add('expand-btn');
  console.log(`Created expand button for field: ${field}`);

  button.addEventListener('click', (e) => {
    e.stopPropagation();

    // Get the parent <li> and the dropdown (if any)
    const li = button.closest('li');
    const dropdown = li.querySelector('.tab-dropdown');

    // Log the button click and the state of the dropdown
    console.log(`Toggled dropdown for field: ${field}, Current state: ${dropdown ? dropdown.style.display : 'no dropdown'}`);


    console.log(`Dropdown state before toggle: ${dropdown ? dropdown.style.display : 'no dropdown'}`);


    // If dropdown exists, toggle it
    if (dropdown) {
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
      button.textContent = dropdown.style.display === 'none' ? '+' : '×';
    } else {
      console.warn(`No dropdown found for ${field}`);  // If no dropdown found, warn in console
    }

    console.log(`Dropdown state after toggle: ${dropdown.style.display}`);
  });

  return button;
}

// Create a dropdown for each tab
function createTabDropdown(field) {
  const dropdown = document.createElement('div');
  dropdown.classList.add('tab-dropdown');
  dropdown.style.position = 'absolute'; // Make it float
  dropdown.style.display = 'none';

  const fieldValues = getFieldValues(field).sort();
  // Select/Deselect All checkbox
  const selectAllWrapper = document.createElement('div');
  const selectAllCheckbox = document.createElement('input');
  selectAllCheckbox.type = 'checkbox';
  selectAllCheckbox.id = `select-all-${field}`;
  selectAllCheckbox.checked = true;

  const selectAllLabel = document.createElement('label');
  selectAllLabel.setAttribute('for', `select-all-${field}`);
  selectAllLabel.textContent = 'Select/Deselect All';

  selectAllWrapper.appendChild(selectAllCheckbox);
  selectAllWrapper.appendChild(selectAllLabel);
  dropdown.appendChild(selectAllWrapper);

  selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = dropdown.querySelectorAll(`input[type="checkbox"]:not(#select-all-${field})`);
    selectedFilters[field] = [];

    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;
      if (selectAllCheckbox.checked) {
        selectedFilters[field].push(checkbox.value);
      }
    });

    renderTree(getPriorities());
  });


  fieldValues.forEach(value => {
    const checkboxWrapper = createCheckboxWrapper(field, value);
    dropdown.appendChild(checkboxWrapper);
  });

  return dropdown;
}

// Get unique field values for dropdown
function getFieldValues(field) {
  return [...new Set(compositions.map(comp => comp[field] || 'Unknown'))];
}

// Create a checkbox wrapper for each dropdown value
function createCheckboxWrapper(field, value) {
  const checkboxWrapper = document.createElement('div');
  const checkbox = createCheckbox(field, value);
  const checkboxLabel = createCheckboxLabel(field, value);

  checkboxWrapper.appendChild(checkbox);
  checkboxWrapper.appendChild(checkboxLabel);

  checkbox.addEventListener('change', () => {
    updateSelectedFilters(field, value, checkbox.checked);
    renderTree(getPriorities());
  });

  return checkboxWrapper;
}

// Create a checkbox element for each value
function createCheckbox(field, value) {
  // Initialize selectedFilters[field] if undefined
  if (!selectedFilters[field]) {
    selectedFilters[field] = [];
  }

  // If the value hasn't been added yet, add it (select by default)
  if (!selectedFilters[field].includes(value)) {
    selectedFilters[field].push(value);
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = value;
  checkbox.id = `${field}-${value}`;
  checkbox.checked = true;

  return checkbox;
}

// Create a checkbox label for each value
function createCheckboxLabel(field, value) {
  const checkboxLabel = document.createElement('label');
  checkboxLabel.setAttribute('for', `${field}-${value}`);
  checkboxLabel.textContent = value;
  return checkboxLabel;
}

// Update selected filters when checkbox is toggled
function updateSelectedFilters(field, value, isChecked) {
  if (!selectedFilters[field]) {
    selectedFilters[field] = [];
  }

  if (isChecked) {
    if (!selectedFilters[field].includes(value)) {
      selectedFilters[field].push(value);
    }
  } else {
    selectedFilters[field] = selectedFilters[field].filter(v => v !== value);
  }
}


// Get the current tab order into an array of field names
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
      li.textContent = item.name;
      ul.appendChild(li);
    });
    return ul;
  }

  const field = priorities[depth];
  const groups = [...new Set(arr.map(i => i[field] || 'Unknown'))].sort();

  groups.forEach(group => {
    if (!selectedFilters[field] || selectedFilters[field].includes(group)) {
      ul.appendChild(createGroupItem(arr, field, group, priorities, depth));
    }
  });

  return ul;
}

// Create a group item for the tree
function createGroupItem(arr, field, group, priorities, depth) {
  const li = document.createElement('li');
  const label = createGroupLabel(group);
  li.appendChild(label);

  const items = arr.filter(i => (i[field] || 'Unknown') === group);
  if (items.length) {
    const childUl = buildTree(items, priorities, depth + 1);
    childUl.classList.add('nested');
    li.appendChild(childUl);
  }

  return li;
}

// Create a label for a group in the tree
function createGroupLabel(group) {
  const label = document.createElement('span');
  label.textContent = group;
  label.classList.add('caret');
  return label;
}

// Render the tree with current priorities and filters
function renderTree(priorities) {
  compositions.sort((a, b) => compareItems(a, b, priorities));

  const container = document.getElementById('musicTree');
  container.innerHTML = '';
  container.appendChild(buildTree(compositions, priorities));

  addCaretEventListeners();
}

// Compare two items based on priorities
function compareItems(a, b, priorities) {
  for (let field of priorities) {
    const va = (a[field] || '').toString();
    const vb = (b[field] || '').toString();
    if (va < vb) return -1;
    if (va > vb) return 1;
  }
  return 0;
}

// Add event listeners for caret (expand/collapse)
function addCaretEventListeners() {
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

// Expand all nested tree items
function expandAll() {
  toggleCaretState(false);
}

// Collapse all nested tree items
function collapseAll() {
  toggleCaretState(true);
}

// Toggle caret state (expanded or collapsed)
function toggleCaretState(collapse) {
  const caretIcons = document.querySelectorAll('.caret');
  caretIcons.forEach(caret => {
    if (collapse && caret.classList.contains('caret-down')) {
      caret.click();
    } else if (!collapse && !caret.classList.contains('caret-down')) {
      caret.click();
    }
  });
}

document.addEventListener('click', () => console.log('A click occurred'));


// Toggle between expand all and collapse all
document.getElementById('expandCollapseAll').addEventListener('click', function () {
  const allExpanded = document.querySelectorAll('.caret-down').length === document.querySelectorAll('.caret').length;
  if (allExpanded) {
    collapseAll();
    this.textContent = "Expand All";
  } else {
    expandAll();
    this.textContent = "Collapse All";
  }
}

);