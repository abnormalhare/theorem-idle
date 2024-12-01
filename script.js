const baseMetaCount = 0;
let metaCount = baseMetaCount;
let metaCountDisp = metaCount;
let metasPerSecond = 0.5;

const characters = {
    'phi': { symbol: '𝜑', name: 'Phi', baseCost: 4 },
    'psi': { symbol: '𝜓', name: 'Psi', baseCost: 7 },
    'chi': { symbol: '𝜒', name: 'Chi', baseCost: 13 },
    'imply': { symbol: '→', name: 'Imply', baseCost: 6 },
    'not': { symbol: '¬', name: 'Not', baseCost: 12 },
    'bicon': { symbol: '↔', name: 'Bi-con', baseCost: 10 },
    'and': { symbol: '^', name: 'And', baseCost: 15 },
};

const characterCostAdd = 1.5;

const theorems = {
    'Theorem idi':  {
        func: '⊢ 𝜑 ⇒ ⊢ 𝜑',
        mps: .5,  costW: { 'phi': 2 }
    },
    'Theorem a1ii': {
        func: '⊢ 𝜑 & ⊢ 𝜓 ⇒ ⊢ 𝜑',
        mps: 1,   costW: { 'phi': 2, 'psi': 1 },
        purchase: 'Syntax wi'
    },
    'Axiom ax-mp': {
        func: '⊢ 𝜑 & ⊢ (𝜑 → 𝜓) ⇒ ⊢ 𝜓',
        mps: 2,   costW: { 'phi': 2, 'psi': 2, 'imply': 1 },
        purchase: 'Syntax chi'
    },
    'Axiom ax-1': {
        func: '⊢ (𝜑 → (𝜓 → 𝜑))',
        mps: 2,   costW: { 'phi': 2, 'psi': 1, 'imply': 2 },
        purchase: 'Syntax wn'
    },
    'Axiom ax-2': {
        func: '⊢ ((𝜑 → (𝜓 → 𝜒)) → ((𝜑 → 𝜓) → (𝜑 → 𝜒)))',
        mps: 4,   costW: { 'phi': 3, 'psi': 2, 'chi': 2, 'imply': 5 }
    },
    'Axiom ax-3': {
        func: '⊢ ((¬𝜑 → ¬𝜓) → (𝜓 → 𝜑))',
        mps: 2.5, costW: { 'phi': 2, 'psi': 2, 'not': 2, 'imply': 3 }
    },
    'Theorem mp2': {
        func: '⊢ 𝜑 & ⊢ 𝜓 & ⊢ (𝜑 → (𝜓 → 𝜒)) ⇒ ⊢ 𝜒',
        mps: 1, costW: { 'phi': 2, 'psi': 2, 'chi': 2, 'imply': 2 },
                costT: { 'Axiom ax-mp': 2 }
    },
    'Theorem mp2b': {
        func: '⊢ 𝜑 & ⊢ (𝜑 → 𝜓) & ⊢ (𝜓 → 𝜒) ⇒ ⊢ 𝜒',
        mps: 1, costW: { '': 1 },
                costT: { '': 1 }
    },

    // '': {
    //     func: '',
    //     mps: 1, costW: { '': 1 },
    //             costT: { '': 1 }
    // },
};

const upgrades = {
    'Syntax wi': { symbol: '→', cost: 10, unlock: 'imply' },
    'Syntax wn': { symbol: '¬', cost: 20, unlock: 'not' },
    'Syntax chi': { symbol: '𝜒', cost: 35, unlock: 'chi' }
};

// DOM elements
const metaCountElem = document.getElementById('metaCount');
const mpsCountElem = document.getElementById('mpsCount');
const characterGrid = document.querySelector('.character-grid');
const upgradeContainer = document.querySelector('.upgrades');
const theoremsContainer = document.querySelector('.theorems');

let visibleCharacters = ['phi', 'psi'];
let purchasedCharacters = {};
let characterCost = {};
let visibleUpgrades = [];
let purchasedUpgrades = [];
let visibleTheorems = [];
let purchasedTheorems = {};

function updateMetaCount() {
    const startTime = performance.now();

    const startPoint = metaCountDisp;
    const endPoint = metaCount;
    const distance = endPoint - startPoint;

    function animate(time) {
        const elapsed = time - startTime;
        const progress = elapsed / 1000;

        metaCountDisp = startPoint + distance * progress;

        metaCountElem.textContent = `${metaCountDisp.toFixed(2)} Metas`;

        if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);

    mpsCountElem.textContent = `${metasPerSecond.toFixed(1)} m/s`;
}

// Automatically give metas per second based on metasPerSecond

function updateMeta() {
    metaCount += metasPerSecond;
    updateMetaCount();
    localStorage.setItem('metaCount', metaCount);
    regenerateCharacterButtons();
}

setInterval(() => {
    updateMeta();
}, 1000);

function save() {
    localStorage.setItem('metaCount', metaCount);
    localStorage.setItem('metasPerSecond', metasPerSecond);
    localStorage.setItem('visibleCharacters', JSON.stringify(visibleCharacters));
    localStorage.setItem('purchasedCharacters', JSON.stringify(purchasedCharacters));
    localStorage.setItem('characterCost', JSON.stringify(characterCost));
    localStorage.setItem('visibleTheorems', JSON.stringify(visibleTheorems));
    localStorage.setItem('purchasedTheorems', JSON.stringify(purchasedTheorems));
    localStorage.setItem('visibleUpgrades', JSON.stringify(visibleUpgrades));
    localStorage.setItem('purchasedUpgrades', JSON.stringify(purchasedUpgrades));
}

function load() {
    const savedMetaCount = localStorage.getItem('metaCount');
    if (savedMetaCount) {
        metaCount = parseFloat(savedMetaCount);
        updateMetaCount();
    }

    const savedMetasPerSecond = localStorage.getItem('metasPerSecond');
    if (savedMetasPerSecond) {
        metasPerSecond = parseFloat(savedMetasPerSecond);
        updateMetaCount();
    }

    const savedVisibleCharacters = localStorage.getItem('visibleCharacters');
    if (savedVisibleCharacters) {
        visibleCharacters = JSON.parse(savedVisibleCharacters);
    }

    const savedPurchasedCharacters = localStorage.getItem('purchasedCharacters');
    if (savedPurchasedCharacters) {
        purchasedCharacters = JSON.parse(savedPurchasedCharacters);
    }

    const savedCharacterCost = localStorage.getItem('characterCost');
    if (savedCharacterCost) {
        characterCost = JSON.parse(savedCharacterCost);
    }

    const savedVisibleTheorems = localStorage.getItem('visibleTheorems');
    if (savedVisibleTheorems) {
        visibleTheorems = JSON.parse(savedVisibleTheorems);
    }

    const savedPurchasedTheorems = localStorage.getItem('purchasedTheorems');
    if (savedPurchasedTheorems) {
        purchasedTheorems = JSON.parse(savedPurchasedTheorems);
    }

    const savedVisibleUpgrades = localStorage.getItem('visibleUpgrades');
    if (savedVisibleUpgrades) {
        visibleUpgrades = JSON.parse(savedVisibleUpgrades);
    }

    const savedPurchasedUpgrades = localStorage.getItem('purchasedUpgrades');
    if (savedPurchasedUpgrades) {
        purchasedUpgrades = JSON.parse(savedPurchasedUpgrades);
    }

    save();
}

function theoremCanSeeCharacter(theorem) {
    let costW = Object.entries(theorem.costW).every(([id, cost]) => {
        c = purchasedCharacters[id];
        return c >= cost - 1 && c != 0;
    })
    let costT = true;
    if (theorem.costT) {
        Object.entries(theorem.costT || {}).every(([id, cost]) => {
            c = purchasedTheorems[id];
            return c >= cost - 1 && c != 0;
        });
    }
    return costW && costT;
}

function theoremCanPurchaseCharacter(theorem) {
    let costW = Object.entries(theorem.costW).every(([id, cost]) => {
        c = purchasedCharacters[id];
        return c >= cost;
    })
    let costT = true;
    if (theorem.costT) {
        costT = Object.entries(theorem.costT || {}).every(([id, cost]) => {
            c = purchasedTheorems[id];
            return c >= cost;
        });
    }
    return costW && costT;
}

function removeCost(theorem) {
    Object.entries(theorem.costW).forEach(([charID, cost]) => {
        purchasedCharacters[charID] -= cost;
    });
    if (theorem.costT) {
        Object.entries(theorem.costT).forEach(([theoremID, cost]) => {
            purchasedTheorems[theoremID] -= cost;
        });
    }
}

function updateCharacterPrice(id) {
    characterCost[id] += characterCostAdd * (characters[id].baseCost * 0.15);
}

// Purchase a character
function purchaseCharacter(id) {
    const character = characters[id];
    if (metaCount >= characterCost[id]) {
        metaCount -= characterCost[id];
        purchasedCharacters[id]++;
        updateCharacterPrice(id);
        regenerateCharacterButtons();
        // check if a theorem can be purchased
        for (const [id, theorem] of Object.entries(theorems)) {
            if (theoremCanSeeCharacter(theorem) && !visibleTheorems.includes(id) && !purchasedTheorems[id]) {
                visibleTheorems.push(id);
                regenerateTheorems();
            }
        }

        save();
        updateMetaCount();
    }
}

function purchaseUpgrade(id) {
    const upgrade = upgrades[id];
    if (metaCount >= upgrade.cost) {
        metaCount -= upgrade.cost;

        visibleCharacters.push(upgrade.unlock);
        visibleUpgrades = visibleUpgrades.filter(uid => uid !== id);
        purchasedUpgrades.push(id);
        
        regenerateCharacterButtons();
        regenerateUpgrades();

        save();
        updateMetaCount();
    }
}

function purchaseTheorem(id) {
    const theorem = theorems[id];
    const canPurchase = theoremCanPurchaseCharacter(theorem);
    if (purchasedTheorems[id] > 10) {
        purchasedTheorems[id] = 10;
        regenerateTheorems();
        save();
        updateMetaCount();
    }
    if (canPurchase && purchasedTheorems[id] < 10) {
        removeCost(theorem);
        metasPerSecond += theorem.mps;
        if (theorem.purchase && !visibleUpgrades.includes(theorem.purchase) && !purchasedUpgrades.includes(theorem.purchase)) {
            visibleUpgrades.push(theorem.purchase);
        }
        purchasedTheorems[id]++;
        
        regenerateCharacterButtons();
        regenerateTheorems();
        regenerateUpgrades();

        save();
        updateMetaCount();
    }
}

// Generate character buttons dynamically (only Phi and Psi visible initially)
function generateCharacterButtons() {
    visibleCharacters.forEach(id => {
        const button = document.createElement('button');
        button.classList.add('character-button');
        button.id = id;

        const character = characters[id];
        purchasedCharacters[id] = purchasedCharacters[id] || 0;
        characterCost[id] = characterCost[id] || character.baseCost;

        // Add character content
        button.innerHTML = `
            <div class="character-symbol">${character.symbol}</div>
            <div class="character-name">${character.name}</div>
            <div class="character-cost">Cost: ${characterCost[id].toFixed(2)} Metas</div>
            <div class="character-count">Owned: ${purchasedCharacters[id]}</div>
        `;

        // Event listener for purchasing character
        button.addEventListener('click', () => {
            purchaseCharacter(id);
        });

        // Append to the character grid
        characterGrid.appendChild(button);
    });
}

function regenerateCharacterButtons() {
    characterGrid.innerHTML = '';
    generateCharacterButtons();
}

function generateUpgrades() {
    visibleUpgrades.forEach(id => {
        const upgrade = upgrades[id];
        const button = document.createElement('button');
        button.classList.add('upgrade-button');
        button.innerHTML = `
            <h3>${id}</h3>
            <p>Cost: ${upgrade.cost} Metas</p>
        `;

        button.addEventListener('click', () => {
            purchaseUpgrade(id);
        });

        upgradeContainer.appendChild(button);
    });
}

function regenerateUpgrades() {
    upgradeContainer.innerHTML = '';
    generateUpgrades();
}

function genCostStr(theorem) {
    let costW = Object.entries(theorem.costW).map(([key, value]) => `${value} ${key}`).join(', ');
    let costT = Object.entries(theorem.costT || {}).map(([key, value]) => `${value} ${key}`).join(', ');
    return `${costW}${costT ? ', ' + costT : ''}`;
}

function generateTheorems() {
    visibleTheorems.forEach(id => {
        const theorem = theorems[id];
        const button = document.createElement('button');
        button.classList.add('theorem-button');
        button.id = theorem.name;

        purchasedTheorems[id] = purchasedTheorems[id] || 0;

        // Add character content
        button.innerHTML = `
            <div class="theorem-button-top">
                <h3>${id}</h3>
                <p>${theorem.func}</p>
            </div>
            <div class="theorem-button-bottom">
                <p>Owned: ${purchasedTheorems[id]}/10</p>
                <p><strong>${genCostStr(theorem)}</strong></p>
            </div>
        `;

        // Event listener for purchasing character
        button.addEventListener('click', () => {
            purchaseTheorem(id);
        });

        // Append to the character grid
        theoremsContainer.appendChild(button);
    });
}

function regenerateTheorems() {
    theoremsContainer.innerHTML = '';
    generateTheorems();
}

function resetGame() {
    metaCount = baseMetaCount;
    metasPerSecond = 0.5;
    updateMetaCount();
    visibleCharacters = ['phi', 'psi'];
    purchasedCharacters = {};
    characterCost = {};
    visibleUpgrades = [];
    purchasedUpgrades = [];
    visibleTheorems = [];
    purchasedTheorems = {};
    save();
    location.reload();
}

const darkModeButton = document.getElementById('darkModeButton');
const resetButton = document.getElementById('resetButton');

darkModeButton.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeButton(isDarkMode);
});

// Update the button text based on the mode
function updateDarkModeButton(isDarkMode) {
    darkModeButton.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Load dark mode preference on page load
window.addEventListener('DOMContentLoaded', () => {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark', darkModeEnabled);
    updateDarkModeButton(darkModeEnabled);
});

resetButton.addEventListener('click', () => {
    localStorage.setItem('metaCount', 0);
    resetGame();
});

// Initial setup
window.addEventListener('DOMContentLoaded', () => {
    load();
    generateCharacterButtons();
    generateUpgrades();
    generateTheorems();
});
