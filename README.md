# Classical Music Tree Viewer

This project is a web-based application designed to display and organize a collection of classical music compositions in a hierarchical tree structure. Users can explore, filter, and sort the compositions dynamically based on various attributes such as composer, genre, category, and instrumentation.

## Features

- **Dynamic Tree Structure**: Displays a collapsible tree view of classical music compositions.
- **Priority Sorting**: Allows users to reorder sorting priorities dynamically using draggable tabs.
- **Filtering**: Provides dropdown filters for attributes like genre, composer, and instrumentation.
- **Expand/Collapse All**: Includes a button to expand or collapse all nodes in the tree.
- **Interactive UI**: Features hover effects, drag-and-drop functionality, and responsive design.

## Project Structure

The project is organized into the following directories and files:

- **HTML**:
  - `catalogue.html`: The main HTML file that serves as the entry point for the application.
- **CSS**:
  - `css/style.css`: Contains styles for the tree structure, draggable tabs, dropdown filters, and other UI elements.
- **JavaScript**:
  - `js/tree.js`: Implements the logic for rendering the tree, handling sorting, filtering, and expand/collapse functionality.
- **Data**:
  - `data.json`: A JSON file containing metadata about classical music compositions, including their name, composer, year, genre, category, and instrumentation.
- **Assets**:
  - `images/book.ico`: The favicon for the application.

## How It Works

1. **Data Loading**: The application fetches composition data from `data.json` and initializes the tree structure.
2. **Tree Rendering**: The tree is built dynamically based on user-defined sorting priorities and filters.
3. **Sorting**: Users can reorder sorting priorities by dragging and dropping tabs in the priority bar.
4. **Filtering**: Dropdown filters allow users to refine the displayed compositions based on specific attributes.
5. **Expand/Collapse**: Users can expand or collapse all nodes in the tree with a single button.

## Installation and Usage

1. Clone the repository to your local machine.
2. Open `catalogue.html` in a web browser.
3. Interact with the tree structure using the provided UI controls.

## Dependencies

- [Sortable.js](https://github.com/SortableJS/Sortable): Used for implementing drag-and-drop functionality for the priority tabs.

## Future Enhancements

- Add support for saving user preferences (e.g., selected filters and sorting priorities).
- Include additional metadata for compositions, such as performance recordings or sheet music links.
- Improve accessibility for keyboard and screen reader users.

## License

This project is open-source and available under the MIT License.