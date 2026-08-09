// drag_drop.js - Handles drag and drop functionality
import { getAuthHeader } from './auth.js';
import { navigateToFolder } from './navigator.js';

export function initDragDrop() {
  const container = document.getElementById('container');
  if (!container) return;

  container.addEventListener('dragstart', handleDragStart);
  container.addEventListener('dragend', handleDragEnd);

  const dropZones = document.querySelectorAll('.file-item.folder');
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('drop', handleDrop);
  });
}

function handleDragStart(e) {
  const draggedItem = e.target.closest('.file-item.draggable:not(.folder)');
  if (!draggedItem) return;
  
  draggedItem.classList.add('dragging');
  e.dataTransfer.setData('application/json', JSON.stringify({
    type: 'file',
    id: draggedItem.dataset.id
  }));
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  document.querySelectorAll('.file-item.dragging').forEach(item => {
    item.classList.remove('dragging');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('dropzone-active');
  e.dataTransfer.dropEffect = 'move';
}

function handleDragLeave(e) {
  e.currentTarget.classList.remove('dropzone-active');
}

async function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('dropzone-active');

  try {
    const data = JSON.parse(e.dataTransfer.getData('application/json'));
    if (!data.id) throw new Error("No ID in transfer data");
    
    const draggedId = data.id;
    const targetId = e.currentTarget.dataset.id;
    
    if (draggedId === targetId) {
      console.warn('Cannot drop into itself');
      return;
    }

    await moveItemToFolder(draggedId, targetId);
  } catch (error) {
    console.error('Drop error:', error);
    window.showErrorToUser('Failed to move item');
  }
}

async function moveItemToFolder(itemId, folderId) {
  const response = await fetch('http://172.16.100.58:8000/api/move/', {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({
      parent_uuid: folderId,
      uuids: [itemId]
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  await navigateToFolder(window.currentFolderUuid);
}