// file-manager.js - Complete File Manager Solution with both navigation and drag-drop

// Track current folder and navigation history
let currentFolderUuid = 'home';
let folderStack = []; // Stores backward history [{uuid, name}]
let forwardStack = []; // Stores forward history [{uuid, name}]
let folderNameMap = new Map(); // Maps UUIDs to folder names

// DOM Ready Handler
document.addEventListener('DOMContentLoaded', function() {
  // Initialize from URL
  const path = window.location.pathname.replace('/file-manager', '') || '/';
  const folderUuid = path === '/' ? 'home' : path.split('/').filter(Boolean).pop();
  
  navigateToFolder(folderUuid);
  initSelectionAndDragDrop();
  
  // Set up back/forward buttons
  document.querySelector('.fa-arrow-left').closest('button').addEventListener('click', navigateBack);
  document.querySelector('.fa-arrow-right').closest('button').addEventListener('click', navigateForward);
  
  // Set up create folder modal
  const createFolderBtn = document.getElementById('createFolder');
  const cancelCreateBtn = document.getElementById('cancelCreateFolder');
  const createFolderModal = document.getElementById('createFolderModal');

  createFolderBtn.addEventListener('click', () => {
    createFolderModal.classList.remove('hidden');
  });

  cancelCreateBtn.addEventListener('click', () => {
    createFolderModal.classList.add('hidden');
  });
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

// Main navigation function
async function navigateToFolder(folderUuid, isPopState = false) {
  try {
    if (!isPopState && currentFolderUuid !== folderUuid) {
      folderStack.push(currentFolderUuid); // add to back stack
      forwardStack.length = 0; // clear forward stack when manually navigating
    }

    currentFolderUuid = folderUuid;

    const response = await fetch(`http://172.16.100.58:8000/api/folders/${folderUuid}/`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyMDkzMTI3LCJpYXQiOjE3NTE5MTMxMjcsImp0aSI6ImZmOGQxM2ZiMjVhMTQ4MmFhNzkzNWNhMDQzODM5ZTE2IiwidXNlcl9pZCI6MX0.N2j5B25Le3sZePOgX75T9DnL5rR4_wLhW6ixXZRrr8c',

        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (!data?.data || !Array.isArray(data.data)) {
      throw new Error('Invalid API response structure');
    }

    displayFolders(data.data);
    updateBreadcrumbs(data.path);
    initSelectionAndDragDrop();

    // Update browser URL
    const folderName = data.current_folder?.name || folderUuid;
    const cleanName = folderName.replace(/\s+/g, '-').toLowerCase();
    const newPath = folderUuid === 'home' ? '/' : `/${cleanName}`;
    
    if (!isPopState) {
      window.history.pushState({ folderUuid, folderName: cleanName }, '', newPath);
    }

    document.title = `File Manager - ${folderName}`;
    updateNavButtons();

  } catch (error) {
    console.error('Navigation error:', error);
    showErrorToUser('Failed to load folder contents. Please try again.');
    window.history.replaceState({ folderUuid: 'home', folderName: 'home' }, '', '/');
    navigateToFolder('home');
  }
}


// Navigation functions
function navigateBack() {
  if (folderStack.length === 0) return;
  const previousUuid = folderStack.pop();
  forwardStack.push(currentFolderUuid);
  navigateToFolder(previousUuid);
  updateNavButtons();
}

function navigateForward() {
  if (forwardStack.length === 0) return;
  const nextUuid = forwardStack.pop();
  folderStack.push(currentFolderUuid);
  navigateToFolder(nextUuid);
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


// Display folders with double-click handling
function displayFolders(folders) {
  const gridContainer = document.getElementById('foldersGrid');
  if (!gridContainer) return;

  // Clear only dynamically added items
  const dynamicItems = gridContainer.querySelectorAll('.file-item.dynamic');
  dynamicItems.forEach(item => item.remove());

  folders.forEach((folder, index) => {
    const isFolder = folder.type === 'folder';
    const card = document.createElement('div');
    card.className = `file-item ${isFolder ? 'folder' : ''} draggable ${isFolder ? 'drop-zone' : ''} bg-white rounded-md p-4 flex flex-col items-center border border-gray-200 hover:border-gray-400 cursor-pointer relative dynamic`;
    card.dataset.id = folder.uuid;
    card.draggable = !isFolder; // Only files are draggable

    if (isFolder) {
      // Folder specific setup
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.classList.add('bg-blue-100', 'border-blue-400');
        e.dataTransfer.dropEffect = 'move';
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('bg-blue-100', 'border-blue-400');
      });

      card.addEventListener('drop', async (e) => {
        e.preventDefault();
        card.classList.remove('bg-blue-100', 'border-blue-400');
        
        let draggedIds;
        try {
          draggedIds = JSON.parse(e.dataTransfer.getData('application/json')) || 
                      JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch (error) {
          console.error('Error parsing drag data:', error);
          return;
        }

        const targetId = folder.uuid;

        // Don't allow dropping into itself
        if (draggedIds.includes(targetId)) {
          console.warn('Cannot drop into itself');
          return;
        }

        try {
          const response = await fetch('http://172.16.100.58:8000/api/move/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs'
            },
            body: JSON.stringify({
              parent_uuid: targetId,
              uuids: draggedIds
            })
          });

          if (!response.ok) throw new Error('Move failed');
          navigateToFolder(currentFolderUuid); // Refresh view
        } catch (error) {
          console.error('Move error:', error);
          showErrorToUser('Failed to move items');
        }
      });

      // Double-click handler
      card.addEventListener('dblclick', (e) => {
        if (!e.target.closest('.dropdown-menu')) {
          navigateToFolder(folder.uuid);
        }
      });

      // Context menu
      card.setAttribute('oncontextmenu', 'showDropdown(event, this)');
      
      const folderIconPath = folder.icon_url || 'src/assets/images/folder.svg';
      
      card.innerHTML = `
            <img class="w-16" src="${folderIconPath}" alt="Folder Icon">
            <span class="mt-2 text-sm text-center text-gray-700">${folder.name}</span>
            <span class="text-xs text-gray-400 mt-1">${formatDate(folder.created_at)}</span>
            
            <div class="dropdown-menu hidden absolute z-10 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5">
                <div class="py-1" role="menu">
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Details</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Share</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Move</a>
                    <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rename</a>
                    <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
                </div>
            </div>
        `;
    } else {
      // File specific setup
      card.addEventListener('dragstart', (e) => {
        if (!card.classList.contains('selected')) {
          clearSelection();
          card.classList.add('selected');
          updateSelectedItems();
        }

        const ids = selectedItems.map(el => el.dataset.id);
        e.dataTransfer.setData('application/json', JSON.stringify(ids));
        e.dataTransfer.setData('text/plain', JSON.stringify(ids));
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('opacity-50');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('opacity-50');
      });

      const fileIconPath = folder.icon_url || 'src/assets/images/file.svg';
      
      card.innerHTML = `
            <img class="w-16" src="${fileIconPath}" alt="File Icon">
            <span class="mt-2 text-sm text-center text-gray-700">${folder.name}</span>
            <span class="text-xs text-gray-400 mt-1">${formatDate(folder.created_at)}</span>
            
            <div class="absolute top-2 right-2">
                <button class="text-gray-500 hover:text-gray-700 focus:outline-none" onclick="toggleDropdown(this, event)">
                    <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                
                <div class="dropdown-menu hidden absolute left-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5">
                    <div class="py-1" role="menu">
                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Details</a>
                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Share</a>
                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Move</a>
                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download</a>
                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rename</a>
                        <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
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
  let breadcrumbHTML = `
    <div class="flex items-center flex-wrap gap-1">
      <span class="cursor-pointer hover:text-blue-600" onclick="navigateToFolder('home')">
        Home
      </span>
  `;

  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    breadcrumbHTML += `
      <span class="text-gray-500">/</span>
      <span class="${isLast ? 'text-gray-800 font-medium' : 'cursor-pointer hover:text-blue-600'}" 
            ${!isLast ? `onclick="navigateToFolder('${part}')"` : ''}>
        ${part}
      </span>
    `;
  });

  breadcrumbHTML += `</div>`;
  breadcrumbsContainer.innerHTML = breadcrumbHTML;
}

// Initialize selection and drag-drop functionality
function initSelectionAndDragDrop() {
  const container = document.getElementById('container');
  if (!container) return;

  const selectionBox = document.getElementById('selectionBox');
  let startX, startY, isSelecting = false;
  let selectedItems = [];

  function updateSelectedItems() {
    selectedItems = Array.from(document.querySelectorAll('.file-item.selected'));
  }

  function clearSelection() {
    document.querySelectorAll('.file-item').forEach(item => {
      item.classList.remove('selected', 'ring', 'ring-blue-500', 'scale-105');
    });
    selectedItems = [];
  }

  container.addEventListener('mousedown', (e) => {
    if (e.target.closest('.file-item')) return;
    if (e.button !== 0) return;

    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = `0px`;
    selectionBox.style.height = `0px`;
    selectionBox.classList.remove('hidden');
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
    document.querySelectorAll('.file-item').forEach(item => {
      const itemRect = item.getBoundingClientRect();
      const isIntersecting = !(
        itemRect.right < boxRect.left ||
        itemRect.left > boxRect.right ||
        itemRect.bottom < boxRect.top ||
        itemRect.top > boxRect.bottom
      );

      if (isIntersecting) {
        item.classList.add('selected', 'ring', 'ring-blue-500', 'scale-105');
      } else {
        item.classList.remove('selected', 'ring', 'ring-blue-500', 'scale-105');
      }
    });
  });

  container.addEventListener('mouseup', () => {
    isSelecting = false;
    selectionBox.classList.add('hidden');
    updateSelectedItems();
  });

  // Handle clicks on items
  container.addEventListener('click', (e) => {
    const item = e.target.closest('.file-item');
    if (!item) return;

    if (e.ctrlKey || e.metaKey) {
      item.classList.toggle('selected');
    } else {
      clearSelection();
      item.classList.add('selected');
    }
    updateSelectedItems();
  });
}

// Helper functions
function showErrorToUser(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

// Global functions for UI
window.toggleDropdown = function(button, event) {
  event.stopPropagation();
  const dropdown = button.nextElementSibling;
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    if (menu !== dropdown) menu.classList.add('hidden');
  });
  dropdown.classList.toggle('hidden');
};

window.showDropdown = function(event, element) {
  event.preventDefault();
  const dropdown = element.querySelector('.dropdown-menu');
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    if (menu !== dropdown) menu.classList.add('hidden');
  });
  dropdown.classList.toggle('hidden');
};

// Make navigation functions globally available
window.navigateBack = navigateBack;
window.navigateForward = navigateForward;
window.navigateToFolder = navigateToFolder;
window.clearSelection = clearSelection;
window.updateSelectedItems = updateSelectedItems;