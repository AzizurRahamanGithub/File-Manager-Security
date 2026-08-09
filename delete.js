// delete.js - Enhanced with SweetAlert2 for beautiful confirmations

// API Configuration
const API_BASE_URL = 'http://172.16.100.58:8000/api';
const DELETE_ENDPOINT = '/delete/';
const AUTH_TOKEN ='Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzgzNzcwLCJpYXQiOjE3NTI2MDM3NzAsImp0aSI6ImY1Y2VhMzhmYzEzYTQ4MTQ4ZDNjM2Y5MGE3NDViYTQ5IiwidXNlcl9pZCI6MX0.APuaR7N6eLE5kJjjXLOeICvdDS11aVW8D4B-ah8HGKs';

// Initialize SweetAlert2 (make sure to include the library in your HTML)
function initSweetAlert() {
    return new Promise(resolve => {
        if (typeof Swal === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
            script.onload = resolve;
            document.head.appendChild(script);
        } else {
            resolve();
        }
    });
}

// Initialize deletion handlers
async function initDeleteHandlers() {
    await initSweetAlert();
    
    // Handle delete from dropdown menus
    document.addEventListener('click', async function(e) {
        if (e.target.classList.contains('delete-item')) {
            e.preventDefault();
            const itemElement = e.target.closest('.file-item');
            if (itemElement) {
                const uuid = itemElement.dataset.id;
                const isFolder = itemElement.classList.contains('folder');
                const itemName = itemElement.querySelector('span').textContent;
                await showDeleteConfirmation(uuid, isFolder, itemName);
            }
        }
    });
}

// Show beautiful delete confirmation dialog
async function showDeleteConfirmation(uuid, isFolder, itemName) {
    const itemType = isFolder ? 'folder' : 'file';
    
    const result = await Swal.fire({
        title: `Delete ${itemType}?`,
        html: `Are you sure you want to delete <strong>"${itemName}"</strong>? This action cannot be undone.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        backdrop: `
            rgba(0,0,0,0.7)
            url("/images/trash-icon.png")
            center top
            no-repeat
        `
    });

    if (result.isConfirmed) {
        await deleteItem(uuid, itemName);
    }
}

// Delete item via API
async function deleteItem(uuid, itemName) {
    try {
        const response = await fetch(`${API_BASE_URL}${DELETE_ENDPOINT}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify({
          uuid: [uuid] // currentFolderUuid is global from file-manager.js
          
        })
        });

        const data = await response.json();
        
        if (response.ok || data.success) {
            await Swal.fire(
                'Deleted!',
                `"${itemName}" has been deleted.`,
                'success'
            );
            // Refresh current view
            if (typeof navigateToFolder === 'function') {
                navigateToFolder(currentFolderUuid);
            }
        } else {
            throw new Error(data.message || 'Failed to delete item');
        }
    } catch (error) {
        await Swal.fire(
            'Error!',
            error.message || 'Failed to delete. Please try again.',
            'error'
        );
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get current folder from your existing navigation system
    if (typeof currentFolderUuid !== 'undefined') {
        currentFolderUuid = window.currentFolderUuid || 'home';
    }
    initDeleteHandlers();
});