// // context-menu.js - Handles right-click context menu for multiple selections

// // Global state for context menu
// let contextMenuTarget = null;
// let selectedItemsBeforeContextMenu = [];

// // Initialize context menu
// function initContextMenu() {
//   document.addEventListener('contextmenu', handleContextMenu);
//   document.addEventListener('click', closeAllContextMenus);
// }

// function handleContextMenu(e) {
//   const fileItem = e.target.closest('.file-item');
//   if (!fileItem) return;
  
//   e.preventDefault();
  
//   // Store current selection
//   selectedItemsBeforeContextMenu = Array.from(document.querySelectorAll('.file-item.selected'));
  
//   // If right-clicked item isn't selected, clear selection and select it
//   if (!fileItem.classList.contains('selected')) {
//     clearSelection();
//     fileItem.classList.add('selected');
//     updateSelectedItems();
//   }
  
//   // Show context menu
//   contextMenuTarget = fileItem;
//   showContextMenu(e.clientX, e.clientY);
// }

// function showContextMenu(x, y) {
//   closeAllContextMenus();
  
//   const menu = document.createElement('div');
//   menu.className = 'context-menu';
//   menu.style.left = `${x}px`;
//   menu.style.top = `${y}px`;
  
//   menu.innerHTML = `
//     <div class="menu-item" data-action="download">Download</div>
//     <div class="menu-item" data-action="share">Share</div>
//     <div class="menu-item" data-action="move">Move</div>
//     <div class="menu-item" data-action="copy">Copy</div>
//     <div class="menu-item" data-action="rename">Rename</div>
//     <div class="menu-item danger" data-action="delete">Delete</div>
//   `;
  
//   document.body.appendChild(menu);
  
//   // Add event listeners to menu items
//   menu.querySelectorAll('.menu-item').forEach(item => {
//     item.addEventListener('click', () => handleMenuAction(item.dataset.action));
//   });
// }

// function handleMenuAction(action) {
//   const selectedItems = Array.from(document.querySelectorAll('.file-item.selected'));
  
//   switch(action) {
//     case 'download':
//       handleDownload(selectedItems);
//       break;
//     case 'share':
//       handleShare(selectedItems);
//       break;
//     case 'move':
//       handleMove(selectedItems);
//       break;
//     case 'copy':
//       handleCopy(selectedItems);
//       break;
//     case 'rename':
//       handleRename(selectedItems);
//       break;
//     case 'delete':
//       handleDelete(selectedItems);
//       break;
//   }
  
//   closeAllContextMenus();
// }

// function closeAllContextMenus() {
//   document.querySelectorAll('.context-menu').forEach(menu => menu.remove());
// }

// // Action handlers
// function handleDownload(items) {
//   const ids = items.map(item => item.dataset.id);
//   console.log('Downloading items:', ids);
//   // Implement download logic
// }

// function handleShare(items) {
//   const ids = items.map(item => item.dataset.id);
//   console.log('Sharing items:', ids);
//   // Implement share logic
// }

// function handleMove(items) {
//   const ids = items.map(item => item.dataset.id);
//   console.log('Moving items:', ids);
//   // Show move dialog or implement move logic
// }

// function handleCopy(items) {
//   const ids = items.map(item => item.dataset.id);
//   console.log('Copying items:', ids);
//   // Implement copy logic
// }

// function handleRename(items) {
//   if (items.length !== 1) {
//     showErrorToUser('Please select only one item to rename');
//     return;
//   }
//   const item = items[0];
//   console.log('Renaming item:', item.dataset.id);
//   // Implement rename logic
// }

// function handleDelete(items) {
//   const ids = items.map(item => item.dataset.id);
//   console.log('Deleting items:', ids);
  
//   if (confirm(`Are you sure you want to delete ${items.length} item(s)?`)) {
//     // Implement delete logic
//     fetch('http://172.16.100.58:8000/api/delete/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNjAyOTU2LCJpYXQiOjE3NTI0MjI5NTYsImp0aSI6IjRjYjVmMzdjOWJiYTRiMzU5MmY0ZDE2NmU4ZTRmYzljIiwidXNlcl9pZCI6MX0.QmPtQdv23ycK8PrZVYAKjnR014zbMdivxNum6ill4ag'
//       },
//       body: JSON.stringify({
//         uuids: ids
//       })
//     })
//     .then(response => {
//       if (!response.ok) throw new Error('Delete failed');
//       navigateToFolder(currentFolderUuid); // Refresh view
//     })
//     .catch(error => {
//       console.error('Delete error:', error);
//       showErrorToUser('Failed to delete items');
//     });
//   }
// }

// // Initialize when DOM is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   initContextMenu();
  
//   // Add to your existing initSelectionAndDragDrop function:
//   const container = document.getElementById('container');
//   container.addEventListener('click', (e) => {
//     if (!e.target.closest('.context-menu')) {
//       closeAllContextMenus();
//     }
//   });
// });