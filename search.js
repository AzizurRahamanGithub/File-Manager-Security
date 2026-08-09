const searchInput = document.querySelector('input[type="search"]');
let searchTimeout;

searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  const query = searchInput.value.trim();

  if (!query) {
    removeSuggestions();
    return;
  }

  searchTimeout = setTimeout(() => {
    searchFilesAndFolders(query);
  }, 300); // Debounce delay
});

async function searchFilesAndFolders(query) {
  try {
    const response = await fetch(`http://172.16.100.58:8000/api/search/?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs'
      }
    });

    if (!response.ok) throw new Error('Search failed');

    const results = await response.json(); // Expect: { data: [{ name, uuid, type }] }
    showSuggestions(results.data || []);
  } catch (err) {
    console.error('Search error:', err);
  }
}

function showSuggestions(results) {
  removeSuggestions();

  const container = document.createElement('div');
  container.id = 'searchSuggestions';
  container.className = 'absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow';

  if (results.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'px-4 py-2 text-sm text-gray-500';
    empty.textContent = 'No matches found';
    container.appendChild(empty);
  }

  results.forEach(item => {
    const div = document.createElement('div');
    div.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm';
    div.textContent = `${item.name} (${item.type})`;
    div.dataset.uuid = item.uuid;
    div.dataset.type = item.type;

    div.addEventListener('click', () => {
      navigateToFolderOrFile(item.uuid, item.type);
      removeSuggestions();
      searchInput.value = '';
    });

    container.appendChild(div);
  });

  searchInput.parentElement.appendChild(container);
}

function navigateToFolderOrFile(uuid, type) {
  if (type === 'folder') {
    navigateToFolder(uuid);
  } else if (type === 'file') {
    // Replace with your actual logic: download or preview
    window.open(`http://172.16.100.58:8000/api/files/${uuid}/download/`, '_blank');
  }
}

function removeSuggestions() {
  const existing = document.getElementById('searchSuggestions');
  if (existing) existing.remove();
}

document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target)) {
    removeSuggestions();
  }
});
