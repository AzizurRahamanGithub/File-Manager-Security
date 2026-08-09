document.addEventListener('DOMContentLoaded', () => {
  const createFolderBtn = document.getElementById('createFolder');
  const cancelCreateBtn = document.getElementById('cancelCreateFolder');
  const createFolderModal = document.getElementById('createFolderModal');
  const createFolderForm = createFolderModal.querySelector('form');

  createFolderBtn.addEventListener('click', () => {
    createFolderModal.classList.remove('hidden');
  });

  cancelCreateBtn.addEventListener('click', () => {
    createFolderModal.classList.add('hidden');
  });

  createFolderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const folderName = createFolderForm.querySelector('input').value.trim();
    if (!folderName) return;

    try {
      const response = await fetch('http://172.16.100.58:8000/api/folders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs',
        },
        body: JSON.stringify({
          name: folderName,
          parent_uuid: currentFolderUuid // currentFolderUuid is global from file-manager.js
          
        })
      });

      if (!response.ok) throw new Error('Create folder failed');

      createFolderModal.classList.add('hidden');
      createFolderForm.reset();
      navigateToFolder(currentFolderUuid); // global function from file-manager.js
    } catch (err) {
      console.error('Folder create error:', err);
      showErrorToUser('Could not create folder'); // also global
    }
  });
});
