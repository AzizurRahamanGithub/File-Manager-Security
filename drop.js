
// file-manager.js - Complete File Manager Solution

// Track current folder and navigation history
let currentFolderUuid = 'home';
let folderStack = []; // Stores backward history
let forwardStack = []; // Stores forward history
let folderPathMap = new Map(); // Maps folder UUIDs to their full paths

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', function () {
  // Initialize from URL
  const path = window.location.pathname.replace('/file-manager', '') || '/';
  const folderUuid = path === '/' ? 'home' : path.split('/').filter(Boolean).pop();

  navigateToFolder(folderUuid);
  initSelectionAndDragDrop();

  // Set up back/forward buttons
  document.querySelector('.fa-arrow-left').closest('button').addEventListener('click', navigateBack);
  document.querySelector('.fa-arrow-right').closest('button').addEventListener('click', navigateForward);




});

// Format date function
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
}

// Update the navigateToFolder function to show only folder names in URL
async function navigateToFolder(folderUuid, isPopState = false) {
  try {
    if (!isPopState && currentFolderUuid !== folderUuid) {
      // Normal navigation: update back stack
      folderStack.push(currentFolderUuid);
      forwardStack.length = 0; // Clear forward stack
    } else if (isPopState) {
      // Popstate triggered (browser back/forward): don't update history
      // But also prevent duplicate push
    }

    window.currentFolderUuid = folderUuid;

    const response = await fetch(`http://172.16.100.58:8000/api/folders/${folderUuid}/`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs',

        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    displayFolders(data.data);
    updateBreadcrumbs(data.path);
    initSelectionAndDragDrop();
    
    currentFolderUuid= data.uuid

    const folderName = data.current_folder?.name || folderUuid;
    const cleanName = folderName.replace(/\s+/g, '-').toLowerCase();
    const newPath = folderUuid === 'home' ? '/' : `/${cleanName}`;

    if (!isPopState) {
      window.history.pushState({ folderUuid, folderName: cleanName }, '', newPath);
    }

    document.title = `File Manager - ${folderName}`;
    updateNavButtons();

  } 
catch (error) {
  console.error('Navigation error:', error);
  showErrorToUser('Failed to load folder contents. Please try again.');

  if (!isPopState && folderUuid !== 'home' && !hasRetriedHome) {
    hasRetriedHome = true;
    window.history.replaceState({ folderUuid: 'home', folderName: 'home' }, '', '/');
    navigateToFolder('home');
  }
}
}



function navigateBack() {
  if (folderStack.length === 0) return;
  const previousUuid = folderStack.pop();
  forwardStack.push(currentFolderUuid);
  // Important: Don't trigger pushState again
  navigateToFolder(previousUuid, true);
  updateNavButtons();
}

function navigateForward() {
  if (forwardStack.length === 0) return;
  const nextUuid = forwardStack.pop();
  folderStack.push(currentFolderUuid);
  // Important: Don't trigger pushState again
  navigateToFolder(nextUuid, true);
  updateNavButtons();
}





function updateNavButtons() {
  const backButton = document.querySelector('.fa-arrow-left').closest('button');
  const forwardButton = document.querySelector('.fa-arrow-right').closest('button');

  backButton.disabled = folderStack.length === 0;
  forwardButton.disabled = forwardStack.length === 0;

  // Visual styling for disabled state
  backButton.classList.toggle('opacity-50', folderStack.length === 0);
  forwardButton.classList.toggle('opacity-50', forwardStack.length === 0);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
  const folderUuid = event.state?.folderUuid || 'home';
  navigateToFolder(folderUuid, true);
});


// Update the displayFolders function to handle double-click
function displayFolders(folders) {
  const gridContainer = document.getElementById('foldersGrid');
  if (!gridContainer) return;

  // Clear only dynamically added items
  const dynamicItems = gridContainer.querySelectorAll('.file-item.dynamic');
  dynamicItems.forEach(item => item.remove());

  folders.forEach((folder, index) => {
    // console.log({"CleanName ": folder})
    const isFolder = folder.type === 'folder';
    const cardId = `manage${index}`;

    const card = document.createElement('div');
    card.id = cardId;
    card.dataset.id = folder.uuid;
    card.draggable = !isFolder;
    card.className = `file-item ${isFolder ? 'folder' : ''} draggable ${isFolder ? 'drop-zone' : ''} bg-white rounded-md p-4 flex flex-col items-center border border-gray-200 hover:border-gray-400 cursor-pointer relative dynamic`;

    if (isFolder) {
      // Add double-click handler for folders
      card.addEventListener('dblclick', (e) => {
        if (!e.target.closest('.dropdown-menu')) {
          navigateToFolder(folder.uuid);
        }
      });

      card.setAttribute('oncontextmenu', 'showDropdown(event, this)');

      // Fix: Use proper path for folder icon
      const folderIconPath = folder.icon_url || 'src/assets/images/folder.svg';

      card.innerHTML = `
        <img class="w-16" src="${folderIconPath}" alt="Folder Icon">
        <span class=" item-name mt-2 text-sm text-center text-gray-700">${folder.name}</span>
        <span class="text-xs text-gray-400 mt-1">${formatDate(folder.created_at)}</span>
        
        <div class="dropdown-menu hidden absolute z-10 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5">
          <div class="py-1" role="menu">
          <a href="share.html"  class="share-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Share</a>
              <a href="#" class="move-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Move</a>
            <a href="#" class="copy-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Copy</a>
            <a href="#" class="rename-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rename</a>
            <a href="#" class="delete-item block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
          </div>
        </div>
      `;
    } else {
      // Fix: Use proper path for file icon
      const fileIconPath = folder.icon_url || 'src/assets/images/file.svg';

      card.innerHTML = `
        <img class="w-16" src="${fileIconPath}" alt="File Icon">
        <span class="mt-2 text-sm text-center text-gray-700">${folder.name}</span>
        <span class="text-xs text-gray-400 mt-1">${formatDate(folder.created_at)}</span>
        
        <div class="absolute top-2 right-2">
          <button class="text-gray-500 hover:text-gray-700 focus:outline-none" onclick="toggleDropdown(this)">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
          
          <div class="dropdown-menu hidden absolute left-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5">
            <div class="py-1" role="menu">
            <a href="#" class="share-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Share</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Move</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Copy</a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download</a>
              <a href="#" class=" rename-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rename</a>
              <a href="#" class="delete-item block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
            </div>
          </div>
        </div>
      `;
    }

    gridContainer.appendChild(card);
  });
}

function updateBreadcrumbs(path) {
  const breadcrumbsContainer = document.querySelector('#breadcrumbs');
  if (!breadcrumbsContainer) return;

  const parts = path.split('/').filter(Boolean);
  const maxVisible = 3; // Number of items to show before collapsing

  // Always show Home + up to maxVisible items
  let visibleParts = parts.slice(-maxVisible);
  let hiddenParts = parts.slice(0, -maxVisible);

  let breadcrumbHTML = `
    <div class="flex items-center flex-wrap gap-y-2">
      <!-- Home link -->
      <div class="flex items-center">
        <span class="cursor-pointer hover:text-blue-600" onclick="navigateToFolder('home')">Home</span>
        <span class="mx-2">/</span>
      </div>
  `;

  // Show dropdown if there are hidden parts
  if (hiddenParts.length > 0) {
    breadcrumbHTML += `
      <div class="relative inline-block group">
        <button class="text-blue-600 hover:underline">
          <span>...</span>
        </button>
        <div class="absolute left-0 mt-1 hidden group-hover:block bg-white shadow-lg rounded-md p-2 z-10 min-w-max border border-gray-200">
          ${hiddenParts.map((part, index) => `
            <div class="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer" 
                 onclick="navigateToFolder('${part}')">
              ${part}
            </div>
          `).join('')}
        </div>
        <span class="mx-2">/</span>
      </div>
    `;
  }

  // Show visible parts
  visibleParts.forEach((part, index) => {
    const isLast = index === visibleParts.length - 1;
    breadcrumbHTML += `
      <div class="flex items-center">
        <span class="${isLast ? '' : 'cursor-pointer hover:text-blue-600'}" 
              ${!isLast ? `onclick="navigateToFolder('${part}')"` : ''}>
          ${part}
        </span>
        ${!isLast ? '<span class="mx-2">/</span>' : ''}
      </div>
    `;
  });

  breadcrumbHTML += `</div>`; // Close main container
  breadcrumbsContainer.innerHTML = breadcrumbHTML;
}



// Initialize selection and drag-drop functionality
function initSelectionAndDragDrop() {
  const container = document.getElementById('container');
  if (!container) return;

  const selectionBox = document.getElementById('selectionBox');

  // Initialize variables
  let startX, startY, isSelecting = false;
  let selectedItems = [];

  // Update selected items array
  function updateSelectedItems() {
    selectedItems = Array.from(document.querySelectorAll('.file-item.selected'));
  }

  // Clear selection styles and array
  function clearSelection() {
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.remove('selected', 'ring', 'ring-blue-500', 'scale-105');
    });
    selectedItems = [];
  }

  container.addEventListener('mousedown', (e) => {
    const clickedItem = e.target.closest('.file-item');

    // If clicking directly on a file item, skip box selection
    if (clickedItem) return;

    // Only start selection box with left mouse button
    if (e.button !== 0) return;

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = `0px`;
    selectionBox.style.height = `0px`;
    selectionBox.classList.remove('hidden');

    clearSelection();
  });

  container.addEventListener('mousemove', (e) => {
    if (!isSelecting) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.style.left = `${x}px`;
    selectionBox.style.top = `${y}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    const boxRect = selectionBox.getBoundingClientRect();
    const items = document.querySelectorAll('.file-item');

    items.forEach(item => {
      const itemRect = item.getBoundingClientRect();

      // Select items that are even partially touched by the selection box
      const isTouched = !(
        itemRect.right < boxRect.left ||
        itemRect.left > boxRect.right ||
        itemRect.bottom < boxRect.top ||
        itemRect.top > boxRect.bottom
      );

      if (isTouched) {
        item.classList.add('selected', 'ring', 'ring-blue-500', 'scale-105');
      } else {
        item.classList.remove('selected', 'ring', 'ring-blue-500', 'scale-105');
      }
    });
  });

  container.addEventListener('mouseup', (e) => {
    if (!isSelecting) return;

    isSelecting = false;
    selectionBox.classList.add('hidden');
    updateSelectedItems();
  });

  // Drag events
  container.addEventListener('dragstart', (e) => {
    const draggedItem = e.target.closest('.file-item');
    if (!draggedItem) return;

    // If the dragged item isn't selected, clear selection and select only it
    if (!draggedItem.classList.contains('selected')) {
      clearSelection();
      draggedItem.classList.add('selected');
      updateSelectedItems();
    }

    // Highlight all selected items
    selectedItems.forEach(item => {
      item.classList.add('dragging');
    });

    const ids = selectedItems.map(el => el.dataset.id);
    e.dataTransfer.setData('text/plain', JSON.stringify(ids));
    e.dataTransfer.effectAllowed = 'move';
  });

  container.addEventListener('dragend', () => {
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.remove('dragging');
    });
  });

  // Drop zone events
  const dropZones = document.querySelectorAll('.drop-zone');
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('bg-blue-200');
      e.dataTransfer.dropEffect = 'move';
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('bg-blue-200');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('bg-blue-200');

      const targetId = zone.dataset.id;
      const draggedIds = JSON.parse(e.dataTransfer.getData('text/plain'));

      if (draggedIds.includes(targetId)) {
        console.warn('Cannot drop into itself:', targetId);
        return;
      }

      const url = 'http://172.16.100.58:8000/api/move/';
      const data = {
        parent_uuid: targetId,
        uuids: draggedIds
      };

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs',
        },
        body: JSON.stringify(data)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          console.log('Success:', data);
          // Refresh the current view after move
          navigateToFolder(currentFolderUuid);
        })
        .catch(error => {
          console.error('Error:', error);
          showErrorToUser('Failed to move items. Please try again.');
        });
    });
  });
}

// Helper functions
function getFileIcon(file) {
  return file.type === 'video' ? 'video.svg' : 'file.svg';
}

function showErrorToUser(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}





// Make functions available globally
window.navigateBack = navigateBack;
window.navigateForward = navigateForward;
window.navigateToFolder = navigateToFolder;