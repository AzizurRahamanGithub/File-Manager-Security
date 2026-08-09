// selection.js - Handles file selection
let selectedItems = [];

export function initSelection() {
  const container = document.getElementById('container');
  if (!container) return;

  const selectionBox = document.getElementById('selectionBox');
  let isSelecting = false;
  let startX, startY;

  container.addEventListener('mousedown', (e) => {
    const clickedItem = e.target.closest('.file-item');
    if (clickedItem) {
      if (!e.ctrlKey && !e.metaKey) {
        clearSelection();
      }
      clickedItem.classList.add('selected');
      updateSelectedItems();
      return;
    }

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

    updateSelection(x, y, width, height);
  });

  container.addEventListener('mouseup', () => {
    if (!isSelecting) return;
    isSelecting = false;
    selectionBox.classList.add('hidden');
    updateSelectedItems();
  });
}

function updateSelection(x, y, width, height) {
  const boxRect = { left: x, top: y, right: x + width, bottom: y + height };
  document.querySelectorAll('.file-item').forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const isSelected = !(
      itemRect.right < boxRect.left ||
      itemRect.left > boxRect.right ||
      itemRect.bottom < boxRect.top ||
      itemRect.top > boxRect.bottom
    );
    item.classList.toggle('selected', isSelected);
  });
}

function clearSelection() {
  document.querySelectorAll('.file-item.selected').forEach(item => {
    item.classList.remove('selected');
  });
  selectedItems = [];
}

function updateSelectedItems() {
  selectedItems = Array.from(document.querySelectorAll('.file-item.selected'));
}

export { selectedItems };