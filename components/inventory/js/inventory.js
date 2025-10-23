let inventoryDB = {
    propiedades: [
        { id: 'prop1', nombre: 'Casa Principal', icono: '🏠', children: ['hab1', 'hab2', 'hab3'] },
        { id: 'prop2', nombre: 'Apartamento de Playa', icono: '🏖️', children: ['hab4'] },
        { id: 'prop3', nombre: 'Oficina', icono: '🏢', children: [] },
    ],
    habitaciones: {
        hab1: { nombre: 'Cocina', parent: 'prop1', children: ['alm1', 'obj1'] },
        hab2: { nombre: 'Dormitorio Principal', parent: 'prop1', children: ['alm2'] },
        hab3: { nombre: 'Garaje', parent: 'prop1', children: ['alm3', 'obj2'] },
        hab4: { nombre: 'Salón', parent: 'prop2', children: [] },
    },
    almacenamientos: {
        alm1: { nombre: 'Despensa', parent: 'hab1', children: ['obj3', 'obj4'] },
        alm2: { nombre: 'Armario Ropa', parent: 'hab2', children: [] },
        alm3: { nombre: 'Caja Herramientas', parent: 'hab3', children: ['obj5'] },
    },
    objetos: {
        obj1: { nombre: 'Televisión', parent: 'hab1' },
        obj2: { nombre: 'Bicicleta', parent: 'hab3' },
        obj3: { nombre: 'Latas de atún', parent: 'alm1' },
        obj4: { nombre: 'Paquete de arroz', parent: 'alm1' },
        obj5: { nombre: 'Taladro Inalámbrico', parent: 'alm3' },
    },
}

let navStack = []

export function getInventoryDB() {
    return inventoryDB
}

export function resetInventoryNav() {
    navStack = []
}

export function getFullPath(type, id) {
    let path = []
    let currentId = id
    let currentType = type

    while (currentId) {
        let item
        if (currentType === 'propiedades') {
            item = inventoryDB.propiedades.find(p => p.id === currentId)
            if (item) path.unshift(item.nombre)
            currentId = null
        } else {
            item = inventoryDB[currentType]?.[currentId]
            if (item) {
                if (currentType !== 'objetos') path.unshift(item.nombre)
                currentId = item.parent
                if (inventoryDB.almacenamientos[currentId]) currentType = 'almacenamientos'
                else if (inventoryDB.habitaciones[currentId]) currentType = 'habitaciones'
                else if (inventoryDB.propiedades.find(p => p.id === currentId))
                    currentType = 'propiedades'
                else currentType = null
            } else {
                currentId = null
            }
        }
    }
    return path.join(' > ')
}

export function initInventory() {
    const addObjectBtn = document.getElementById('add-object-btn')
    const closeModalBtn = document.getElementById('close-modal-btn')
    const saveObjectBtn = document.getElementById('save-object-btn')
    const modal = document.getElementById('modal-add-object')
    const modalObjectNameInput = document.getElementById('modal-object-name')
    const modalAddGeneric = document.getElementById('modal-add-generic')
    const modalGenericTitle = document.getElementById('modal-generic-title')
    const modalGenericInput = document.getElementById('modal-generic-input')
    const modalGenericCancel = document.getElementById('modal-generic-cancel')
    const modalGenericSave = document.getElementById('modal-generic-save')

    if (addObjectBtn && modal) {
        addObjectBtn.addEventListener('click', e => {
            modal.classList.remove('hidden')
            modal.classList.add('flex')
        })
    }

    if (closeModalBtn && modal) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden')
            modal.classList.remove('flex')
        })
    }

    function hideGenericModal() {
        modalAddGeneric.classList.add('hidden')
        modalAddGeneric.classList.remove('flex')
        modalGenericInput.value = ''
    }
    if (modalGenericCancel) modalGenericCancel.addEventListener('click', hideGenericModal)

    if (modalGenericSave) {
        modalGenericSave.addEventListener('click', () => {
            const newItemName = modalGenericInput.value
            const addType = modalAddGeneric.dataset.addType
            const parentId = modalAddGeneric.dataset.parentId

            if (newItemName && newItemName.trim() !== '') {
                const trimmedName = newItemName.trim()
                const newId = `${addType.substring(0, 3)}${Date.now()}`
                switch (addType) {
                    case 'propiedad':
                        inventoryDB.propiedades.push({
                            id: newId,
                            nombre: trimmedName,
                            icono: '🏠',
                            children: [],
                        })
                        renderInventory('propiedades')
                        break
                    case 'habitacion':
                        inventoryDB.habitaciones[newId] = {
                            nombre: trimmedName,
                            parent: parentId,
                            children: [],
                        }
                        inventoryDB.propiedades.find(p => p.id === parentId).children.push(newId)
                        renderInventory('habitaciones', parentId)
                        break
                    case 'almacenamiento':
                        inventoryDB.almacenamientos[newId] = {
                            nombre: trimmedName,
                            parent: parentId,
                            children: [],
                        }
                        inventoryDB.habitaciones[parentId].children.push(newId)
                        renderInventory('contenidos', parentId)
                        break
                }
            }
            hideGenericModal()
        })
    }

    if (saveObjectBtn) {
        saveObjectBtn.addEventListener('click', () => {
            const objectName = modalObjectNameInput.value
            const parentId = modal.dataset.parentId
            if (objectName && objectName.trim() !== '' && parentId) {
                const trimmedName = objectName.trim()
                const newId = `obj${Date.now()}`
                inventoryDB.objetos[newId] = { nombre: trimmedName, parent: parentId }
                if (inventoryDB.almacenamientos[parentId])
                    inventoryDB.almacenamientos[parentId].children.push(newId)
                else if (inventoryDB.habitaciones[parentId])
                    inventoryDB.habitaciones[parentId].children.push(newId)
                modal.classList.add('hidden')
                modal.classList.remove('flex')
                modalObjectNameInput.value = ''
                const currentState = navStack[navStack.length - 1] || {
                    level: 'propiedades',
                    id: null,
                }
                renderInventory(currentState.level, currentState.id)
            } else {
                modalObjectNameInput.classList.add('border-red-500', 'ring-red-500')
                setTimeout(
                    () => modalObjectNameInput.classList.remove('border-red-500', 'ring-red-500'),
                    2000
                )
            }
        })
    }
}

export function renderInventory(level, id) {
    const inventoryContent = document.getElementById('inventory-content')
    const inventoryNavHeader = document.getElementById('inventory-nav-header')
    if (!inventoryContent || !inventoryNavHeader) return

    inventoryContent.innerHTML = ''
    let items = []
    let title = 'Inventario'

    if (level === 'propiedades') {
        items = inventoryDB.propiedades
        title = 'Propiedades'
    } else if (level === 'habitaciones') {
        const prop = inventoryDB.propiedades.find(p => p.id === id)
        items = prop.children.map(childId => ({
            ...inventoryDB.habitaciones[childId],
            id: childId,
            tipo: 'habitacion',
        }))
        title = prop.nombre
    } else if (level === 'contenidos') {
        const hab = inventoryDB.habitaciones[id]
        const contenedores = hab.children
            .filter(childId => childId.startsWith('alm'))
            .map(childId => ({
                ...inventoryDB.almacenamientos[childId],
                id: childId,
                tipo: 'almacenamiento',
            }))
        const objetosSueltos = hab.children
            .filter(childId => childId.startsWith('obj'))
            .map(childId => ({ ...inventoryDB.objetos[childId], id: childId, tipo: 'objeto' }))
        items = [...contenedores, ...objetosSueltos]
        title = hab.nombre
    } else if (level === 'objetos') {
        const alm = inventoryDB.almacenamientos[id]
        items = alm.children.map(childId => ({
            ...inventoryDB.objetos[childId],
            id: childId,
            tipo: 'objeto',
        }))
        title = alm.nombre
    }

    let backButtonHTML = ''
    if (navStack.length > 0) {
        backButtonHTML = `<button id="inventory-back-btn" class="p-2 mr-3 -ml-2 text-gray-600 rounded-full hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>`
    }
    inventoryNavHeader.innerHTML = `${backButtonHTML}<h1 class="text-2xl font-bold text-gray-800 truncate dark:text-white">${title}</h1>`

    if (items.length > 0) {
        items.forEach(item => {
            const div = document.createElement('div')
            div.className =
                'flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 card'
            div.dataset.id = item.id
            let nextLevel = '',
                icon = item.icono || '📁'
            if (level === 'propiedades') nextLevel = 'habitaciones'
            if (item.tipo === 'habitacion') {
                nextLevel = 'contenidos'
                icon = '🚪'
            }
            if (item.tipo === 'almacenamiento') {
                nextLevel = 'objetos'
                icon = '📦'
            }
            if (item.tipo === 'objeto') {
                icon = '🔩'
            }
            div.dataset.nextLevel = nextLevel
            div.innerHTML = `<div class="flex items-center"><span class="mr-4 text-2xl">${icon}</span><span class="font-medium text-gray-800 dark:text-gray-100">${
                item.nombre
            }</span></div>${
                item.tipo !== 'objeto'
                    ? '<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>'
                    : ''
            }`
            inventoryContent.appendChild(div)
        })
    } else {
        inventoryContent.innerHTML = `<p class="py-10 text-center text-gray-500">No hay elementos aquí.</p>`
    }

    // Botones de añadir dinámicos
    const addButtonsContainer = document.createElement('div')
    addButtonsContainer.className = 'mt-4 space-y-3'

    const buttonConfig = {
        propiedades: [{ text: '+ Añadir Propiedad', type: 'propiedad' }],
        habitaciones: [{ text: '+ Añadir Habitación', type: 'habitacion' }],
        contenidos: [
            { text: '+ Añadir Almacenamiento', type: 'almacenamiento' },
            { text: '+ Añadir Objeto', type: 'objeto_principal' },
        ],
        objetos: [{ text: '+ Añadir Objeto', type: 'objeto_principal' }],
    }

    if (buttonConfig[level]) {
        buttonConfig[level].forEach(config => {
            const addButton = document.createElement('button')
            addButton.className =
                'w-full py-3 font-semibold text-blue-600 border-2 border-blue-500 border-dashed rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700'
            addButton.textContent = config.text
            addButton.addEventListener('click', () => {
                const modal = document.getElementById('modal-add-object')
                const modalAddGeneric = document.getElementById('modal-add-generic')
                const modalGenericTitle = document.getElementById('modal-generic-title')
                const modalGenericInput = document.getElementById('modal-generic-input')
                if (config.type === 'objeto_principal') {
                    modal.dataset.parentId = id
                    modal.classList.remove('hidden')
                    modal.classList.add('flex')
                } else {
                    modalGenericTitle.textContent = config.text.replace('+', 'Añadir')
                    modalGenericInput.placeholder = `Nombre de ${config.type}`
                    modalAddGeneric.dataset.addType = config.type
                    modalAddGeneric.dataset.parentId = id
                    modalAddGeneric.classList.remove('hidden')
                    modalAddGeneric.classList.add('flex')
                    modalGenericInput.focus()
                }
            })
            addButtonsContainer.appendChild(addButton)
        })
        inventoryContent.appendChild(addButtonsContainer)
    }

    // Navegación interna
    inventoryContent.querySelectorAll('div[data-id]').forEach(el => {
        el.addEventListener('click', () => {
            if (el.dataset.nextLevel) {
                navStack.push({ level, id })
                renderInventory(el.dataset.nextLevel, el.dataset.id)
            }
        })
    })

    const backBtn = document.getElementById('inventory-back-btn')
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const lastState = navStack.pop()
            if (lastState) renderInventory(lastState.level, lastState.id)
        })
    }
}
