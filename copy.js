// Add this at the top of your script (global variable to store copied item)
let copiedItem = null;

// Inside your displayFolders function, add this after creating each card:
const copyButtons = card.querySelectorAll('.copy-item');
copyButtons.forEach(button => {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    copiedItem = {
      id: folder.uuid,
      type: isFolder ? 'folder' : 'file',
      name: folder.name
    };
    
    console.log('Copied item:', copiedItem);
  });
});