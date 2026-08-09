// Paste menu functionality
if (customPasteMenu && browse) {
  function showGlobalPasteMenu(e) {
    if (!browse.contains(e.target) || 
        e.target.closest('.file-item') || 
        e.target.closest('.dropdown-menu')) {
      return;
    }

    isContextMenuActive = true;
    closeAllDropdowns();
    
    customPasteMenu.style.left = `${e.clientX+15}px`;
    customPasteMenu.style.top = `${e.clientY+15}px`;
    customPasteMenu.classList.remove('hidden');
    customPasteMenu.style.zIndex = '1000';
    
    e.preventDefault();
  }

  browse.addEventListener('contextmenu', showGlobalPasteMenu);

  customPasteMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('hover:bg-gray-100')) {
      const action = e.target.textContent.trim();
      switch(action) {
        case 'Paste':
          console.log('Paste action triggered');
          break;
      }
      closeAllDropdowns();
    }
  });
}