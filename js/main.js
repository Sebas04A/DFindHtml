import { initHome } from '../components/home/js/home.js'
import { initAlerts } from '../components/alerts/js/alerts.js'
import { initProfile } from '../components/profile/js/profile.js'
import {
    initInventory,
    renderInventory,
    resetInventoryNav,
} from '../components/inventory/js/inventory.js'

async function loadFragment(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`No se pudo cargar ${url}: ${res.status}`)
    return res.text()
}

async function appendTo(selector, url) {
    const container = document.querySelector(selector)
    const html = await loadFragment(url)
    const tmp = document.createElement('div')
    tmp.innerHTML = html.trim()
    // Mover todos los nodos al contenedor
    while (tmp.firstChild) {
        container.appendChild(tmp.firstChild)
    }
}

async function replaceWith(selector, url) {
    const container = document.querySelector(selector)
    container.innerHTML = await loadFragment(url)
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-button')
    const activeNavButtonClass = 'active'
    const activeTextColorClass = 'text-blue-600'
    const inactiveTextColorClass = 'text-gray-500'
    const darkInactiveTextColorClass = 'dark:text-gray-400'

    function hideAllScreens() {
        document
            .querySelectorAll('#main-content > div[id^="screen-"]')
            .forEach(s => s.classList.add('hidden'))
    }

    function showScreen(screenId) {
        hideAllScreens()
        const screenToShow = document.getElementById(`screen-${screenId}`)
        if (screenToShow) screenToShow.classList.remove('hidden')

        // Hooks por pantalla
        if (screenId === 'inventory') {
            resetInventoryNav()
            renderInventory('propiedades')
        }
    }

    // Exponer showScreen a los init de componentes
    const api = { showScreen }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const screenId = button.dataset.screen
            navButtons.forEach(btn => {
                btn.classList.remove(activeTextColorClass, activeNavButtonClass)
                btn.classList.add(inactiveTextColorClass, darkInactiveTextColorClass)
            })
            button.classList.add(activeTextColorClass, activeNavButtonClass)
            button.classList.remove(inactiveTextColorClass, darkInactiveTextColorClass)
            showScreen(screenId)
        })
    })

    // Estado inicial
    showScreen('home')
    const homeBtn = document.querySelector('.nav-button[data-screen="home"]')
    if (homeBtn) {
        homeBtn.classList.add(activeTextColorClass, activeNavButtonClass)
        homeBtn.classList.remove(inactiveTextColorClass, darkInactiveTextColorClass)
    }

    return api
}

async function bootstrap() {
    // Cargar pantallas y pie
    await appendTo('#main-content', '../components/home/html/home.html')
    await appendTo('#main-content', '../components/inventory/html/inventory.html')
    await appendTo('#main-content', '../components/alerts/html/alerts.html')
    await appendTo('#main-content', '../components/profile/html/profile.html')

    await replaceWith('footer.nav-bar', '../components/home/html/footer.html')

    // Modales
    await replaceWith('#modal-add-object', '../components/inventory/html/modal-add-object.html')
    await replaceWith('#modal-add-generic', '../components/inventory/html/modal-add-generic.html')

    // Inicializar navegación y componentes
    const api = setupNavigation()
    initInventory()
    initHome(api)
    initAlerts(api)
    initProfile(api)
}

bootstrap().catch(err => {
    console.error(err)
})
