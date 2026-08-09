let renameItem = { uuid: null, oldName: null, type: null };

function initRenameHandlers() {
  // Open rename dialog
  document.addEventListener('click', function (e) {
    const renameBtn = e.target.closest('.rename-item');
    if (!renameBtn) return;

    e.preventDefault();

    const item = renameBtn.closest('.file-item');
    if (!item) return;

    renameItem = {
      uuid: item.dataset.id,
      oldName: item.querySelector('.item-name')?.textContent || 
               item.querySelector('span.text-gray-700')?.textContent,
      type: item.classList.contains('folder') ? 'folder' : 'file'
    };

    // Remove any existing dialogs first
    document.querySelectorAll('.rename-dialog, .modal-blur').forEach(el => el.remove());

    // Create blur overlay
    const blurOverlay = document.createElement('div');
    blurOverlay.className = 'modal-blur fixed inset-0 backdrop-blur-sm z-40';
    document.body.appendChild(blurOverlay);

    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'rename-dialog fixed inset-0 flex items-center justify-center z-50';
    dialog.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 class="text-lg font-medium mb-4">Rename ${renameItem.type}</h3>
        <input type="text" id="renameInput" value="${renameItem.oldName}" class="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
        <div class="flex justify-end gap-2">
          <button class="cancel-rename px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
          <button class="confirm-rename px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Rename</button>
        </div>
      </div>
    `;
    document.body.appendChild(dialog);
    
    // Focus and select text in input
    const input = dialog.querySelector('#renameInput');
    input.focus();
    input.select();

    // Close dialog when clicking on blur overlay
    blurOverlay.addEventListener('click', function() {
      dialog.remove();
      blurOverlay.remove();
    });
  });

  // Confirm rename
  document.addEventListener('click', function (e) {
    if (!e.target.classList.contains('confirm-rename')) return;
    e.preventDefault();

    const dialog = e.target.closest('.rename-dialog');
    const blurOverlay = document.querySelector('.modal-blur');
    const newName = dialog.querySelector('#renameInput').value.trim();

    if (!newName) {
      showFeedback('Name cannot be empty', false);
      dialog.remove();
      blurOverlay.remove();
      return;
    }

    if (newName === renameItem.oldName) {
      dialog.remove();
      blurOverlay.remove();
      return;
    }

    fetch(`http://172.16.100.58:8000/api/rename/${renameItem.uuid}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs',
      },
      body: JSON.stringify({ name: newName })
    })
      .then(res => res.json())
      .then(data => {
        dialog.remove();
        blurOverlay.remove();
        
        if (data.success) {
          // Update the UI directly
          const itemElement = document.querySelector(`.file-item[data-id="${renameItem.uuid}"]`);
          if (itemElement) {
            const nameElement = itemElement.querySelector('.item-name') || 
                              itemElement.querySelector('span.text-gray-700');
            if (nameElement) {
              nameElement.textContent = newName;
            }
          }
          showFeedback(`Renamed to ${newName}`, true);
        } else {
          showFeedback(`Rename failed: ${data.message || 'Unknown error'}`, false);
        }

        if (window.currentFolderUuid && window.navigateToFolder) {
          window.navigateToFolder(window.currentFolderUuid);
        }
      })
      .catch((error) => {
        dialog.remove();
        blurOverlay.remove();
        showFeedback('Network error during rename', false);
        console.error('Rename error:', error);
      });
  });

  // Cancel rename
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('cancel-rename')) {
      e.preventDefault();
      const dialog = e.target.closest('.rename-dialog');
      const blurOverlay = document.querySelector('.modal-blur');
      dialog?.remove();
      blurOverlay?.remove();
    }
  });
}

function showFeedback(message, isSuccess) {
  // Remove any existing feedback first
  document.querySelectorAll('.rename-feedback').forEach(el => el.remove());

  const feedback = document.createElement('div');
  feedback.className = 'rename-feedback';
  feedback.textContent = message;
  feedback.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${isSuccess ? '#4CAF50' : '#F44336'};
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    z-index: 1000;
    animation: fadeIn 0.3s, fadeOut 0.3s 1.7s;
  `;
  document.body.appendChild(feedback);
  setTimeout(() => feedback.remove(), 2000);
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRenameHandlers);
} else {
  initRenameHandlers();
}