const baseMetaCount = 0;
let metaCount = baseMetaCount;
let metasPerSecond = 0.5;

// Character data: symbol, name, cost
const characters = [
    { id: 'phi', symbol: '𝜑', name: 'Phi', cost: 5 },
    { id: 'psi', symbol: '𝜓', name: 'Psi', cost: 10 },
    { id: 'chi', symbol: '𝜒', name: 'Chi', cost: 15 },
    { id: 'imply', symbol: '→', name: 'Imply', cost: 5 },
    { id: 'not', symbol: '¬', name: 'Not', cost: 10},
    { id: 'bicon', symbol: '↔', name: 'Bi-con', cost: 10 },
    { id: 'and', symbol: '^', name: 'And', cost: 15 },
];

const theorems = [
    { name: 'Theorem idi', func: '⊢ 𝜑 ⇒ ⊢ 𝜑', mps: .5, cost: { 'phi': 2 } },
    { name: 'Theorem a1ii', func: '⊢ 𝜑 & ⊢ 𝜓 ⇒ ⊢ 𝜑', mps: 1, cost: { 'phi': 2, 'psi': 1 }, purchase: 'Syntax wi' },
    { name: 'Axiom ax-mp', func: '⊢ 𝜑 & ⊢ (𝜑 → 𝜓) ⇒ ⊢ 𝜓', mps: 3, cost: { 'phi': 2, 'psi': 2, 'imply': 1 } }
]

const upgrades = [
    { name: "Syntax wi", symbol: '→', cost: 10, unlock: 'imply' },
    { name: "Syntax wn", symbol: '¬', cost: 20, unlock: 'not' },
];

// DOM elements
const metaCountElem = document.getElementById('metaCount');
const characterGrid = document.querySelector('.character-grid'); // Container for character buttons
const upgradeContainer = document.querySelector('.upgrades'); // Container for upgrades
const theoremsContainer = document.querySelector('.theorems'); // Container for theorems

let visibleCharacters = characters.filter(character => character.id === 'phi' || character.id === 'psi');
let purchasedCharacters = {};
let visibleUpgrades = [];
let purchasedUpgrades = [];
let visibleTheorems = [];
let purchasedTheorems = [];

function updateMetaCount() {
    metaCountElem.textContent = `${metaCount.toFixed(1)} Metas`;
}

// Automatically give metas per second based on metasPerSecond
setInterval(() => {
    metaCount += metasPerSecond;
    updateMetaCount();
    localStorage.setItem('metaCount', metaCount);
    regenerateCharacterButtons();
}, 1000);

function save() {
    localStorage.setItem('metaCount', metaCount);
    localStorage.setItem('visibleCharacters', JSON.stringify(visibleCharacters));
    localStorage.setItem('purchasedCharacters', JSON.stringify(purchasedCharacters));
    localStorage.setItem('visibleTheorems', JSON.stringify(visibleTheorems));
    localStorage.setItem('purchasedTheorems', JSON.stringify(purchasedTheorems));
    localStorage.setItem('visibleUpgrades', JSON.stringify(visibleUpgrades));
    localStorage.setItem('purchasedUpgrades', JSON.stringify(purchasedUpgrades));
}

function load() {
    const savedMetaCount = localStorage.getItem('metaCount');
    if (savedMetaCount) {
        metaCount = parseFloat(savedMetaCount);
        metaCountElem.textContent = `${metaCount.toFixed(1)} Metas`;
    }

    const savedVisibleCharacters = localStorage.getItem('visibleCharacters');
    if (savedVisibleCharacters) {
        visibleCharacters = JSON.parse(savedVisibleCharacters);
    }

    const savedPurchasedCharacters = localStorage.getItem('purchasedCharacters');
    if (savedPurchasedCharacters) {
        purchasedCharacters = JSON.parse(savedPurchasedCharacters);
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
}

function theoremCanSeeCharacter(theorem) {
    // check if the count of all characters in the theorem is greater than the cost of the theorem - 1
    return Object.entries(theorem.cost).every(([id, cost]) => {
        c = purchasedCharacters[characters.find(character => character.id === id).id];
        return c >= cost - 1 && c != 0;
    });
}

function theoremCanPurchaseCharacter(theorem) {
    return Object.entries(theorem.cost).every(([id, cost]) => {
        c = purchasedCharacters[characters.find(character => character.id === id).id];
        return c >= cost;
    });
}

// Purchase a character
function purchaseCharacter(character) {
    if (metaCount >= character.cost) {
        metaCount -= character.cost;
        purchasedCharacters[character.id]++;
        regenerateCharacterButtons();
        // check if a theorem can be purchased
        const theoremsToUnlock = theorems.filter(theorem => Object.keys(theorem.cost).includes(character.id));
        theoremsToUnlock.forEach(theorem => {
            const canPurchase = theoremCanSeeCharacter(theorem);

            if (canPurchase && !visibleTheorems.includes(theorem) && !purchasedTheorems.includes(theorem)) {
                visibleTheorems.push(theorem);
                regenerateTheorems();
            }
        });

        save();
        updateMetaCount();
    }
}

// Purchase an upgrade (upgrade)
function purchaseUpgrade(upgrade) {

    if (metaCount >= upgrade.cost) {
        metaCount -= upgrade.cost;

        const unlock = characters.find(character => character.id === upgrade.unlock);
        visibleCharacters.push(unlock); // Unlock the character
        visibleUpgrades = visibleUpgrades.filter(u => u !== upgrade);
        purchasedUpgrades.push(upgrade);
        
        regenerateCharacterButtons();
        regenerateUpgrades();

        save();
        updateMetaCount();
    }
}

function purchaseTheorem(theorem) {

    const canPurchase = theoremCanPurchaseCharacter(theorem);
    if (canPurchase) {
        Object.entries(theorem.cost).forEach(([id, cost]) => {
            c = characters.find(character => character.id === id);
            purchasedCharacters[c.id] -= cost
        });
        metasPerSecond += theorem.mps;
        if (theorem.purchase) {
            const unlock = upgrades.find(purchase => purchase.name === theorem.purchase);
            visibleUpgrades.push(unlock);
        }
        visibleTheorems = visibleTheorems.filter(t => t !== theorem);
        purchasedTheorems.push(theorem);
        
        regenerateCharacterButtons();
        regenerateTheorems();
        regenerateUpgrades();

        save();
        updateMetaCount();
    }
}

// Generate character buttons dynamically (only Phi and Psi visible initially)
function generateCharacterButtons() {
    visibleCharacters.forEach(character => {
        const button = document.createElement('button');
        button.classList.add('character-button');
        button.id = character.id;

        purchasedCharacters[character.id] = purchasedCharacters[character.id] || 0;

        // Add character content
        button.innerHTML = `
            <div class="character-symbol">${character.symbol}</div>
            <div class="character-name">${character.name}</div>
            <div class="character-cost">Cost: ${character.cost} Metas</div>
            <div class="character-count">Owned: ${purchasedCharacters[character.id]}</div>
        `;

        // Event listener for purchasing character
        button.addEventListener('click', () => {
            purchaseCharacter(character);
        });

        // Append to the character grid
        characterGrid.appendChild(button);
    });
}

function regenerateCharacterButtons() {
    characterGrid.innerHTML = '';
    generateCharacterButtons();
}

// Generate purchase buttons dynamically (for characters as purchases)
function generateUpgrades() {
    visibleUpgrades.forEach((upgrade, index) => {
        const button = document.createElement('button');
        button.classList.add('upgrade-button');
        button.innerHTML = `
            <h3>${upgrade.name}</h3>
            <p>Cost: ${upgrade.cost} Metas</p>
        `;
        button.disabled = metaCount < upgrade.cost; // Disable if not enough metas

        button.addEventListener('click', () => {
            purchaseUpgrade(upgrade);
        });

        upgradeContainer.appendChild(button);
    });
}

function regenerateUpgrades() {
    upgradeContainer.innerHTML = '';
    generateUpgrades();
}

function genCostStr(cost) {
    return Object.entries(cost).map(([key, value]) => `${value}x ${key}`).join(', ');
}

function generateTheorems() {
    visibleTheorems.forEach((theorem, index) => {
        const button = document.createElement('button');
        button.classList.add('theorem-button');
        button.id = theorem.name;

        // Add character content
        button.innerHTML = `
            <h3>${theorem.name}</h3>
            <p>${theorem.func}</p>
            <p>Requires: ${genCostStr(theorem.cost)}</p>
        `;

        // Event listener for purchasing character
        button.addEventListener('click', () => {
            purchaseTheorem(theorem);
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
    metaCountElem.textContent = `${metaCount.toFixed(1)} Metas`;
    metasPerSecond = 0.5;
    visibleCharacters = characters.filter(character => character.id === 'phi' || character.id === 'psi');
    purchasedCharacters = {};
    visibleUpgrades = [];
    purchasedUpgrades = [];
    visibleTheorems = [];
    purchasedTheorems = [];
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
