export function toggleDarkMode(modeToggle, modeIcon) {
  modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      modeIcon.classList.replace('fa-moon', 'fa-sun');
      modeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Light Mode';
    } else {
      modeIcon.classList.replace('fa-sun', 'fa-moon');
      modeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Dark Mode';
    }
  });
}
