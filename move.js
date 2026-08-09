// move.js - Cut/Move Functionality (like copy-paste but removes original)

// Track items to move (cut)
let moveItems = {
  uuid: null,
  name: null,
  type: null, // 'file' or 'folder'
  timestamp: null,
  isCut: true // Flag to distinguish from copy
};

// Handle cut/move initiation
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('move-item')) {
    e.preventDefault();
    
    const itemElement = e.target.closest('.file-item');
    if (!itemElement) {
      console.error('No file-item parent found');
      return;
    }

    // Get item details
    moveItems = {
      uuid: itemElement.dataset.id,
      name: itemElement.querySelector('span').textContent,
      type: itemElement.classList.contains('folder') ? 'folder' : 'file',
      timestamp: new Date().toISOString(),
      isCut: true
    };

    // Visual feedback that item is "cut"
    const feedback = document.createElement('div');
    feedback.textContent = `✂️ Cut ${moveItems.type}: ${moveItems.name}`;
    feedback.style.position = 'fixed';
    feedback.style.bottom = '20px';
    feedback.style.right = '20px';
    feedback.style.background = '#FF9800'; // Orange to distinguish from copy
    feedback.style.color = 'white';
    feedback.style.padding = '10px';
    feedback.style.borderRadius = '4px';
    feedback.style.zIndex = '1000';
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 2000);

    // Visual indication on the item (semi-transparent)
    itemElement.style.opacity = '0.6';
    itemElement.style.border = '2px dashed #FF9800';
  }
});

// Handle paste (move) operation
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('paste-option') && moveItems.uuid) {
    e.preventDefault();
    
    const destinationUuid = window.currentFolderUuid || 'root';
    
    console.group('Move/Paste Action');
    console.log('Source:', moveItems.uuid);
    console.log('Destination:', destinationUuid);
    console.log('Type:', moveItems.type);
    console.groupEnd();

    fetch('http://172.16.100.58:8000/api/move/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs'
      },
      body: JSON.stringify({
        uuids: [moveItems.uuid],
        parent_uuid: destinationUuid,
      })
    })
    .then(response => response.json())
    .then(data => {
      navigateToFolder(currentFolderUuid)
    })
  }
});