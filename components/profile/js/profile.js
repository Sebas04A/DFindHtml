export function initProfile() {
    const themeToggle = document.getElementById('theme-toggle')
    const appFrame = document.getElementById('app-frame')
    if (themeToggle && appFrame) {
        themeToggle.addEventListener('change', () => {
            appFrame.classList.toggle('dark')
        })
    }
}
