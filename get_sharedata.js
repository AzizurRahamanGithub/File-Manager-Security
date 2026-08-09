// get_sharedata.js - Updated to match your Django API structure

document.addEventListener('DOMContentLoaded', function() {
  // Hide sidebar and adjust layout for share page
  document.querySelector('aside').classList.add('hidden');
  document.querySelector('main').classList.remove('ml-64');
  
  // Extract the username and share path from URL
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const username = pathParts[1]; // 'sifat' in example
  const sharePath = pathParts[2]; // '12cf320c69a34d44a6e38411f5070883' in example
  
  if (username && sharePath) {
    fetchSharedData(username, sharePath);
  } else {
    showError("Invalid share URL format");
  }
});

// get_sharedata.js - Updated to handle URL parameters

document.addEventListener('DOMContentLoaded', function() {
  // Hide sidebar and adjust layout for share page
  document.querySelector('aside')?.classList.add('hidden');
  document.querySelector('main')?.classList.remove('ml-64');
  
  // Get the share URL from query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const shareUrl = urlParams.get('share_url');
  
  if (!shareUrl) {
    showError("No share link provided");
    return;
  }
  
  // Extract username and share ID from the share URL
  const pathParts = shareUrl.split('/').filter(Boolean);
  const username = pathParts[1];
  const shareId = pathParts[2];
  
  if (username && shareId) {
    fetchSharedData(username, shareId);
  } else {
    showError("Invalid share link format");
  }
});

async function fetchSharedData(username, shareId) {
  try {
    showLoading();
    
    const response = await fetch(`http://172.16.100.58:8000/api/share/${username}/${shareId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (responseData.status !== 'success') {
      throw new Error(responseData.message || 'Failed to load shared content');
    }
    
    displaySharedContent(responseData, username);
    
  } catch (error) {
    console.error('Error:', error);
    showError(error.message);
  }
}

// ... (keep the rest of your existing get_sharedata.js functions)

function displaySharedContent(responseData, username) {
  const foldersGrid = document.getElementById('foldersGrid');
  foldersGrid.innerHTML = '';
  
  // Update page title
  document.title = `Shared by ${username} | CloudVault`;
  
  // Create header
  const header = document.createElement('div');
  header.className = 'col-span-6 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100';
  header.innerHTML = `
    <h2 class="text-xl font-semibold text-gray-800 mb-1">Shared Content</h2>
    <p class="text-sm text-gray-600">Shared by ${username}</p>
    <p class="text-sm text-green-600 mt-1">${responseData.message}</p>
  `;
  foldersGrid.appendChild(header);
  
  // Display items if available
  if (responseData.data && responseData.data.length > 0) {
    responseData.data.forEach(item => {
      const itemElement = createItemElement(item);
      foldersGrid.appendChild(itemElement);
    });
  } else {
    foldersGrid.innerHTML += `
      <div class="col-span-6 text-center py-10 text-gray-500">
        No items found in this shared content
      </div>
    `;
  }
}

function createItemElement(item) {
  const element = document.createElement('div');
  element.className = 'file-item bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors';
  element.dataset.id = item.uuid;
  
  const icon = item.type === 'folder' 
    ? '<i class="fa-regular fa-folder text-3xl text-yellow-400"></i>'
    : getFileIcon(item.name.split('.').pop().toLowerCase());
  
  element.innerHTML = `
    <div class="flex flex-col items-center text-center">
      ${icon}
      <span class="mt-2 text-sm font-medium text-gray-700 truncate w-full">${item.name}</span>
      <span class="text-xs text-gray-500">${item.type === 'folder' ? '' : formatFileSize(item.size)}</span>
    </div>
  `;
  
  return element;
}

function showLoading() {
  const foldersGrid = document.getElementById('foldersGrid');
  foldersGrid.innerHTML = `
    <div class="col-span-6 text-center py-10">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">Loading shared content...</p>
    </div>
  `;
}

function showError(message) {
  const foldersGrid = document.getElementById('foldersGrid');
  foldersGrid.innerHTML = `
    <div class="col-span-6 text-center py-10">
      <i class="fa-solid fa-circle-exclamation text-red-500 text-3xl mb-2"></i>
      <div class="text-red-500 font-medium">Couldn't load shared content</div>
      <div class="text-sm text-gray-600 mt-1">${message || 'The link may be invalid or expired'}</div>
    </div>
  `;
}

// Helper functions
function getFileIcon(fileType) {
  const fileIcons = {
    pdf: 'fa-regular fa-file-pdf text-red-500',
    doc: 'fa-regular fa-file-word text-blue-500',
    docx: 'fa-regular fa-file-word text-blue-500',
    xls: 'fa-regular fa-file-excel text-green-500',
    xlsx: 'fa-regular fa-file-excel text-green-500',
    ppt: 'fa-regular fa-file-powerpoint text-orange-500',
    pptx: 'fa-regular fa-file-powerpoint text-orange-500',
    jpg: 'fa-regular fa-file-image text-purple-500',
    jpeg: 'fa-regular fa-file-image text-purple-500',
    png: 'fa-regular fa-file-image text-purple-500',
    gif: 'fa-regular fa-file-image text-purple-500',
    txt: 'fa-regular fa-file-lines text-gray-500',
    zip: 'fa-regular fa-file-zipper text-gray-500',
    rar: 'fa-regular fa-file-zipper text-gray-500',
    mp3: 'fa-regular fa-file-audio text-blue-400',
    mp4: 'fa-regular fa-file-video text-red-400'
  };
  return `<i class="${fileIcons[fileType] || 'fa-regular fa-file text-gray-400'} text-3xl"></i>`;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}