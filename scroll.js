document.addEventListener('DOMContentLoaded', function() {
  // Make the header stay fixed while scrolling
  const container = document.getElementById('container');
  const header = container.firstElementChild;
  
  // Adjust header position on scroll
  container.addEventListener('scroll', function() {
    if (container.scrollTop > 10) {
      header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // Ensure proper initial positioning
  header.style.position = 'sticky';
  header.style.top = '0';
});