// share.js - Updated sharing functionality

document.addEventListener('DOMContentLoaded', function() {
  // Handle share clicks from dropdown menus
  document.addEventListener('click', function(e) {
    const shareBtn = e.target.closest('.share-item');
    if (!shareBtn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get selected items or the context menu's parent item
    let items = Array.from(document.querySelectorAll('.file-item.selected'));
    if (items.length === 0) {
      const contextItem = shareBtn.closest('.file-item');
      if (contextItem) items = [contextItem];
    }
    
    if (items.length === 0) {
      console.warn('No items selected for sharing');
      return;
    }
    
    // Extract UUIDs
    const uuids = items.map(item => item.dataset.id);
    console.log('Preparing to share items:', uuids);
    
    // Show share dialog
    showShareDialog(uuids);
  });

  // Handle copy link button click
  document.getElementById('copyShareLink').addEventListener('click', function() {
    const shareLinkInput = document.getElementById('shareLink');
    shareLinkInput.select();
    document.execCommand('copy');
    
    // Show copied feedback
    const copyBtn = document.getElementById('copyShareLink');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  });

  // Handle cancel share button
  document.getElementById('cancelShare').addEventListener('click', function() {
    document.getElementById('shareModal').classList.add('hidden');
  });
});

async function showShareDialog(uuids) {
  // Show the modal
  const modal = document.getElementById('shareModal');
  modal.classList.remove('hidden');
  
  // Set loading state
  const shareLinkInput = document.getElementById('shareLink');
  shareLinkInput.value = 'Generating link...';
  document.getElementById('copyShareLink').disabled = true;
  
  try {
    // Call API to share items
    const response = await fetch('http://172.16.100.58:8000/api/share/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs'
      },
      body: JSON.stringify({
        share_uuid: uuids
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Share successful:', result);
    
    // Construct the full shareable URL
    const baseUrl = window.location.origin;
    const sharePath = result.share_url.replace('/api', ''); // Remove /api from the path
    const fullShareUrl = `${baseUrl}${sharePath}`;
    
    // Update the modal with the share link
    shareLinkInput.value = fullShareUrl;
    document.getElementById('copyShareLink').disabled = false;
    
  } catch (error) {
    console.error('Error sharing items:', error);
    shareLinkInput.value = 'Error generating share link';
  }
}