// item_load.js - Handles displaying files/folders
export function displayFolders(folders) {
  const gridContainer = document.getElementById('foldersGrid');
  if (!gridContainer) return;

  // Clear previous items
  gridContainer.querySelectorAll('.file-item.dynamic').forEach(item => item.remove());

  folders.forEach((folder, index) => {
    const isFolder = folder.type === 'folder';
    const card = document.createElement('div');
    card.className = `file-item ${isFolder ? 'folder' : ''} draggable ${isFolder ? 'drop-zone' : ''} dynamic`;
    card.dataset.id = folder.uuid;
    card.draggable = !isFolder;

    if (isFolder) {
      card.innerHTML = `
        <img class="w-16" src="${folder.icon_url || 'src/assets/images/folder.svg'}" alt="Folder Icon">
        <span class="item-name mt-2 text-sm text-center text-gray-700">${folder.name}</span>
        <span class="text-xs text-gray-400 mt-1">${formatDate(folder.created_at)}</span>
        ${getFolderContextMenu()}
      `;
      card.addEventListener('dblclick', () => window.navigateToFolder(folder.uuid));
    } else {
      card.innerHTML = `
        <img class="w-16" src="${folder.icon_url || 'src/assets/images/file.svg'}" alt="File Icon">
        <span class="mt-2 text-sm text-center text-gray-700">${folder.name}</span>
        <span class="text-xs text-gray-400 mt-1">${formatDate(folder.created_at)}</span>
        ${getFileContextMenu()}
      `;
    }

    gridContainer.appendChild(card);
  });
}

function getFolderContextMenu() {
  return `
    <div class="dropdown-menu hidden absolute z-10 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5">
      <div class="py-1" role="menu">
        <a href="#" class="share-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Share</a>
        <a href="#" class="move-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Move</a>
        <a href="#" class="copy-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Copy</a>
        <a href="#" class="rename-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rename</a>
        <a href="#" class="delete-item block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
      </div>
    </div>
  `;
}

function getFileContextMenu() {
  return `
    <div class="absolute top-2 right-2">
      <button class="text-gray-500 hover:text-gray-700 focus:outline-none" onclick="toggleDropdown(this)">
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </button>
      <div class="dropdown-menu hidden absolute left-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-gray-300 ring-opacity-5">
        <div class="py-1" role="menu">
          <a href="#" class="share-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Share</a>
          <a href="#" class="move-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Move</a>
          <a href="#" class="copy-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Copy</a>
          <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download</a>
          <a href="#" class="rename-item block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rename</a>
          <a href="#" class="delete-item block px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</a>
        </div>
      </div>
    </div>
  `;
}

export function updateBreadcrumbs(path) {
  const breadcrumbsContainer = document.querySelector('#breadcrumbs');
  if (!breadcrumbsContainer) return;

  const parts = path.split('/').filter(Boolean);
  const maxVisible = 3;
  let visibleParts = parts.slice(-maxVisible);
  let hiddenParts = parts.slice(0, -maxVisible);

  let breadcrumbHTML = `
    <div class="flex items-center flex-wrap gap-y-2">
      <div class="flex items-center">
        <span class="cursor-pointer hover:text-blue-600" onclick="window.navigateToFolder('home')">Home</span>
        <span class="mx-2">/</span>
      </div>
  `;

  if (hiddenParts.length > 0) {
    breadcrumbHTML += `
      <div class="relative inline-block group">
        <button class="text-blue-600 hover:underline">
          <span>...</span>
        </button>
        <div class="absolute left-0 mt-1 hidden group-hover:block bg-white shadow-lg rounded-md p-2 z-10 min-w-max border border-gray-200">
          ${hiddenParts.map((part, index) => `
            <div class="py-1 px-2 hover:bg-gray-100 rounded cursor-pointer" 
                 onclick="window.navigateToFolder('${part}')">
              ${part}
            </div>
          `).join('')}
        </div>
        <span class="mx-2">/</span>
      </div>
    `;
  }

  visibleParts.forEach((part, index) => {
    const isLast = index === visibleParts.length - 1;
    breadcrumbHTML += `
      <div class="flex items-center">
        <span class="${isLast ? '' : 'cursor-pointer hover:text-blue-600'}" 
              ${!isLast ? `onclick="window.navigateToFolder('${part}')"` : ''}>
          ${part}
        </span>
        ${!isLast ? '<span class="mx-2">/</span>' : ''}
      </div>
    `;
  });

  breadcrumbHTML += `</div>`;
  breadcrumbsContainer.innerHTML = breadcrumbHTML;
}

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