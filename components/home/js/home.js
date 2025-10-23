import { getInventoryDB, getFullPath } from '../../inventory/js/inventory.js'

export function initHome({ showScreen }) {
    const searchInput = document.getElementById('search-input')
    const screenSearchResults = document.getElementById('screen-search-results')
    const searchResultsContent = document.getElementById('search-results-content')
    const searchBackBtn = document.getElementById('search-back-btn')

    if (!searchInput) return // Aún no montado

    searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase()
        if (term.length < 2) {
            if (!screenSearchResults.classList.contains('hidden')) {
                showScreen('home')
            }
            return
        }

        // Mostrar resultados
        document
            .querySelectorAll('#main-content > div[id^="screen-"]')
            .forEach(s => s.classList.add('hidden'))
        screenSearchResults.classList.remove('hidden')
        searchResultsContent.innerHTML = ''

        const db = getInventoryDB()
        const results = Object.keys(db.objetos).filter(objId =>
            db.objetos[objId].nombre.toLowerCase().includes(term)
        )

        if (results.length > 0) {
            results.forEach(objId => {
                const item = db.objetos[objId]
                const path = getFullPath('objetos', objId)
                const resultDiv = document.createElement('div')
                resultDiv.className = 'p-4 bg-white border border-gray-200 rounded-lg card'
                resultDiv.innerHTML = `<p class="font-semibold text-gray-800 dark:text-gray-100">${item.nombre}</p><p class="text-sm text-gray-500 dark:text-gray-400">${path}</p>`
                searchResultsContent.appendChild(resultDiv)
            })
        } else {
            searchResultsContent.innerHTML = `<p class="py-10 text-center text-gray-500">No se encontraron resultados para "${searchInput.value}".</p>`
        }
    })

    if (searchBackBtn) {
        searchBackBtn.addEventListener('click', () => {
            searchInput.value = ''
            showScreen('home')
        })
    }
}
