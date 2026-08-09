// copy-logger.js

// Track copied items
let copiedItems = {
    uuid: null,
    name: null,
    type: null, // 'file' or 'folder'
    timestamp: null,
    canPaste: false // NEW: Track if paste is allowed
};

// Function to update paste button states
function updatePasteButtons() {
    const pasteButtons = document.querySelectorAll('.paste-option');
    pasteButtons.forEach(button => {
        button.disabled = !copiedItems.canPaste;
    });
}

// Handle copy actions
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('copy-item')) {
        e.preventDefault();

        const itemElement = e.target.closest('.file-item');
        if (!itemElement) return;

        // Get item details
        copiedItems = {
            uuid: itemElement.dataset.id,
            name: itemElement.querySelector('span').textContent,
            type: itemElement.classList.contains('folder') ? 'folder' : 'file',
            timestamp: new Date().toISOString(),
            canPaste: true // Allow paste after copy
        };

        updatePasteButtons();

        // Visual feedback
        const feedback = document.createElement('div');
        feedback.textContent = `📋 Copied ${copiedItems.type}: ${copiedItems.name}`;
        feedback.style.position = 'fixed';
        feedback.style.bottom = '20px';
        feedback.style.right = '20px';
        feedback.style.background = '#4CAF50';
        feedback.style.color = 'white';
        feedback.style.padding = '10px';
        feedback.style.borderRadius = '4px';
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
    }
});

// Handle paste actions
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('paste-option')) {
        e.preventDefault();

        if (!copiedItems.canPaste) {
            const feedback = document.createElement('div');
            feedback.textContent = '⚠️ Copy something first!';
            feedback.style.position = 'fixed';
            feedback.style.bottom = '20px';
            feedback.style.right = '20px';
            feedback.style.background = '#FF9800';
            feedback.style.color = 'white';
            feedback.style.padding = '10px';
            feedback.style.borderRadius = '4px';
            document.body.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
            return;
        }

        const destinationUuid = window.currentFolderUuid;

        fetch('http://172.16.100.58:8000/api/copy/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs'
            },
            body: JSON.stringify({
                uuid: [copiedItems.uuid],
                parent_uuid: destinationUuid
            })
        })
        .then(response => response.json())
        .then(data => {
            // Disable paste after successful paste
            copiedItems.canPaste = false;
            updatePasteButtons();
            navigateToFolder(currentFolderUuid);
        });
    }
});

// Initialize paste button states
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePasteButtons);
} else {
    updatePasteButtons();
}