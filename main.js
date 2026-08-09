// main.js - Entry point
// import { setAuthToken } from './auth.js';
// import { initNavigation, navigateToFolder } from './navigator.js';
// import { initDragDrop } from './drag_drop.js';
// import { initSelection } from './selection.js';

// Disable right-click context menu globally
window.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  
});




// Temporary token setup - REPLACE with actual login flow
// const TEMP_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your token here
// setAuthToken(TEMP_TOKEN);

// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const path = window.location.pathname.replace('/file-manager', '') || '/';
//     const folderUuid = path === '/' ? 'home' : path.split('/').filter(Boolean).pop();

//     initNavigation();
//     initDragDrop();
//     initSelection();
    
//     await navigateToFolder(folderUuid);
//   } catch (error) {
//     console.error('Initialization error:', error);
//     showErrorToUser('Failed to initialize application');
//   }
// });

// function showErrorToUser(message) {
//   const errorDiv = document.createElement('div');
//   errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded';
//   errorDiv.textContent = message;
//   document.body.appendChild(errorDiv);
//   setTimeout(() => errorDiv.remove(), 5000);
// }

// // Make available globally
// window.showErrorToUser = showErrorToUser;
// window.navigateToFolder = navigateToFolder;