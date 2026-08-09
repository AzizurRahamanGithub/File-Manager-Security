// navigator.js - Handles folder navigation
import { getAuthHeader } from './auth.js';
import { displayFolders, updateBreadcrumbs } from './item_load.js';

let currentFolderUuid = 'home';
let folderStack = [];
let forwardStack = [];

export async function navigateToFolder(folderUuid, isPopState = false) {
  try {
    if (!isPopState && currentFolderUuid !== folderUuid) {
      folderStack.push(currentFolderUuid);
      forwardStack.length = 0;
    }

    const response = await fetch(`http://172.16.100.58:8000/api/folders/${folderUuid}/`, {
      headers: getAuthHeader()
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    currentFolderUuid = data.uuid;
    
    displayFolders(data.data);
    updateBreadcrumbs(data.path);
    
    if (!isPopState) {
      const folderName = data.current_folder?.name || folderUuid;
      const cleanName = folderName.replace(/\s+/g, '-').toLowerCase();
      const newPath = folderUuid === 'home' ? '/' : `/${cleanName}`;
      window.history.pushState({ folderUuid, folderName: cleanName }, '', newPath);
    }

    document.title = `File Manager - ${data.current_folder?.name || folderUuid}`;
    updateNavButtons();
    
  } catch (error) {
    console.error('Navigation error:', error);
    window.showErrorToUser('Failed to load folder contents. Please try again.');
  }
}

export function navigateBack() {
  if (folderStack.length === 0) return;
  const previousUuid = folderStack.pop();
  forwardStack.push(currentFolderUuid);
  navigateToFolder(previousUuid, true);
}

export function navigateForward() {
  if (forwardStack.length === 0) return;
  const nextUuid = forwardStack.pop();
  folderStack.push(currentFolderUuid);
  navigateToFolder(nextUuid, true);
}

function updateNavButtons() {
  const backButton = document.querySelector('.fa-arrow-left').closest('button');
  const forwardButton = document.querySelector('.fa-arrow-right').closest('button');

  backButton.disabled = folderStack.length === 0;
  forwardButton.disabled = forwardStack.length === 0;

  backButton.classList.toggle('opacity-50', folderStack.length === 0);
  forwardButton.classList.toggle('opacity-50', forwardStack.length === 0);
}

export function initNavigation() {
  document.querySelector('.fa-arrow-left').closest('button').addEventListener('click', navigateBack);
  document.querySelector('.fa-arrow-right').closest('button').addEventListener('click', navigateForward);
  window.addEventListener('popstate', (event) => {
    const folderUuid = event.state?.folderUuid || 'home';
    navigateToFolder(folderUuid, true);
  });
}

// Make current folder accessible
window.currentFolderUuid = currentFolderUuid;