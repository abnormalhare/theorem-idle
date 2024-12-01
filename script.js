let metaCount = 0;
let metasPerSecond = 0.5;
let characterCounts = {
    phi: 0,
    psi: 0,
    not: 0,
    alpha: 0,
    beta: 0,
    gamma: 0
};

// Character data: symbol, name, cost
const characters = [
    { id: 'phi', symbol: '𝜑', name: 'Phi', cost: 5 },
    { id: 'psi', symbol: '𝜓', name: 'Psi', cost: 10 },
    { id: 'chi', symbol: '𝜒', name: 'Chi', cost: 15 },
    { id: 'not', symbol: '¬', name: 'Not', cost: 5 },
    { id: 'imply', symbol: '→', name: 'Imply', cost: 10 },
    { id: 'bicon', symbol: '↔', name: 'Bi-con', cost: 10 },
    { id: 'and', symbol: '¬', name: 'Not', cost: 10 },
];

const theorems = [
    { name: 'Theorem idi', func: '⊢ 𝜑 ⇒ ⊢ 𝜑', mps: .5, cost: { 'phi': 2 } },
    { name: 'Theorem a1ii', func: '⊢ 𝜑 & ⊢ 𝜓 ⇒ ⊢ 𝜑', mps: 1, cost: { 'phi': 2, 'psi': 1 }, purchase: 'Syntax wn' },
]

const upgrades = [
    { name: "Syntax wn", symbol: '¬', cost: 10, unlock: 'not' }
];

// DOM elements
const metaCountElem = document.getElementById('metaCount');
const darkModeButton = document.getElementById('darkModeButton');
const characterGrid = document.querySelector('.character-grid'); // Container for character buttons
const upgradeContainer = document.querySelector('.upgrades'); // Container for upgrades
const theoremsContainer = document.querySelector('.theorems'); // Container for theorems

const visibleCharacters = characters.filter(character => character.id === 'phi' || character.id === 'psi');
let visibleUpgrades = [];
const purchasedUpgrades = [];
let visibleTheorems = [];
const purchasedTheorems = [];

// Automatically give metas per second based on metasPerSecond
setInterval(() => {
    metaCount += metasPerSecond;
    updateDisplay();
}, 1000);

// Purchase a character
function purchaseCharacter(characterId, characterCost) {
    if (metaCount >= characterCost) {
        metaCount -= characterCost;
        characterCounts[characterId]++;
        updateDisplay();
        // check if a theorem can be purchased
        const theoremsToUnlock = theorems.filter(theorem => Object.keys(theorem.cost).includes(characterId));
        theoremsToUnlock.forEach(theorem => {
            const canPurchase = Object.entries(theorem.cost).every(([id, cost]) => characterCounts[id] >= cost - 1);
            if (canPurchase && !visibleTheorems.includes(theorem) && !purchasedTheorems.includes(theorem)) {
                visibleTheorems.push(theorem);
                regenerateTheorems();
            }
        });
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
        
        updateDisplay();
        regenerateCharacterButtons();
        regenerateUpgrades();
    }
}

function purchaseTheorem(theorem) {

    const canPurchase = Object.entries(theorem.cost).every(([id, cost]) => characterCounts[id] >= cost);
    if (canPurchase) {
        Object.entries(theorem.cost).forEach(([id, cost]) => characterCounts[id] -= cost);
        metasPerSecond += theorem.mps;
        if (theorem.purchase) {
            const unlock = upgrades.find(purchase => purchase.name === theorem.purchase);
            visibleUpgrades.push(unlock);
        }
        visibleTheorems = visibleTheorems.filter(t => t !== theorem);
        purchasedTheorems.push(theorem);
        
        updateDisplay();
        regenerateTheorems();
        regenerateUpgrades();
    }
}

// Dark mode toggle
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

// Generate character buttons dynamically (only Phi and Psi visible initially)
function generateCharacterButtons() {
    visibleCharacters.forEach(character => {
        const button = document.createElement('button');
        button.classList.add('character-button');
        button.id = character.id;

        // Add character content
        button.innerHTML = `
            <div class="character-symbol">${character.symbol}</div>
            <div class="character-name">${character.name}</div>
            <div class="character-cost">Cost: ${character.cost} Metas</div>
            <div class="character-count">Owned: 0</div>
        `;

        // Event listener for purchasing character
        button.addEventListener('click', () => {
            purchaseCharacter(character.id, character.cost);
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

// Update displayed values
function updateDisplay() {
    metaCountElem.textContent = `${metaCount.toFixed(1)} Metas`; // Format the count to one decimal place

    // Update character button content
    document.querySelectorAll('.character-button').forEach(button => {
        const characterId = button.id;
        const characterCount = characterCounts[characterId];
        button.querySelector('.character-count').textContent = `Owned: ${characterCount}`;
    });
}

// Initial setup
window.addEventListener('DOMContentLoaded', () => {
    generateCharacterButtons(); // Only Phi and Psi will be generated
    generateUpgrades();
    generateTheorems();
    updateDisplay();
});
