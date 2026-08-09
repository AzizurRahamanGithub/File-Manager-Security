// Get DOM elements
const customPasteMenu = document.getElementById('custom-paste-menu');
const browse = document.getElementById('browseFileFolder');

// Track if we're handling a context menu
let isContextMenuActive = false;

// Enhanced dropdown positioning function
function positionDropdown(element, dropdown, isContextMenu = false, event = null) {
  const rect = element.getBoundingClientRect();
  const dropdownRect = dropdown.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  if (isContextMenu && event) {
    // Context menu positioning (right-click)
    let left = event.clientX + 15;
    let top = event.clientY + 15;
    
    // Adjust if near right edge
    if (left + dropdownRect.width > viewportWidth) {
      left = event.clientX - dropdownRect.width - 5;
    }
    
    // Adjust if near bottom edge
    if (top + dropdownRect.height > viewportHeight) {
      top = event.clientY - dropdownRect.height - 5;
    }
    
    dropdown.style.position = 'fixed';
    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${top}px`;
  } else {
    // Button menu positioning (ellipsis click)
    let left = rect.left;
    let top = rect.bottom + window.scrollY;
    
    // Adjust if near right edge
    if (left + dropdownRect.width > viewportWidth) {
      left = viewportWidth - dropdownRect.width - 10;
    }
    
    // Adjust if near bottom edge
    if (top + dropdownRect.height > viewportHeight + window.scrollY) {
      top = rect.top + window.scrollY - dropdownRect.height;
    }
    
    dropdown.style.position = 'absolute';
    dropdown.style.left = `${left}px`;
    dropdown.style.top = `${top}px`;
  }
  
  dropdown.style.zIndex = '1000';
}

// Close all dropdowns function
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.add('hidden');
  });
  if (customPasteMenu) customPasteMenu.classList.add('hidden');
  isContextMenuActive = false;
}

// Global click handler
document.addEventListener('click', function(e) {
  if (!isContextMenuActive && 
      !e.target.closest('.dropdown-menu') && 
      !e.target.closest('[onclick*="toggleDropdown"]') && 
      !e.target.closest('[oncontextmenu*="showDropdown"]') &&
      !e.target.closest('#custom-paste-menu')) {
    closeAllDropdowns();
  }
  isContextMenuActive = false;
});

// Improved toggleDropdown function
window.toggleDropdown = function(button) {
  const dropdown = button.nextElementSibling;
  const isVisible = !dropdown.classList.contains('hidden');
  
  closeAllDropdowns();
  
  if (!isVisible) {
    dropdown.classList.remove('hidden');
    positionDropdown(button.closest('.file-item') || button, dropdown);
  }
};

// Improved showDropdown function
window.showDropdown = function(event, element) {
  event.preventDefault();
  isContextMenuActive = true;
  const dropdown = element.querySelector('.dropdown-menu');
  
  closeAllDropdowns();
  
  dropdown.classList.remove('hidden');
  positionDropdown(element, dropdown, true, event);
};

// Add click handler for dropdown menu items to close the menu
document.addEventListener('click', function(e) {
  if (e.target.closest('.dropdown-menu a')) {
    closeAllDropdowns();
  }
});

// Alternatively, you can add event listeners to each menu item when creating them
function setupDropdownItemBehavior() {
  document.querySelectorAll('.dropdown-menu a').forEach(item => {
    item.addEventListener('click', function(e) {
      closeAllDropdowns();
      
      // If you need to prevent default for some items (like href="#")
      if (item.getAttribute('href') === '#') {
        e.preventDefault();
      }
    });
  });
}

// Initialize the dropdown item behavior when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupDropdownItemBehavior);
} else {
  setupDropdownItemBehavior();
}