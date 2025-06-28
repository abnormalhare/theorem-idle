const baseMetaCount = 0;
let metaCount = baseMetaCount;
let metaCountDisp = metaCount;
let metasPerSecond = 0.5;
let rebirthCount = 0;
let rebirthGetCount = 0;
let rebirthBonus = 1;
const rebirthInitialValue = 10000;

const characters = {
    'phi':   { symbol: '𝜑', name: 'Phi', baseCost: 2 },
    'psi':   { symbol: '𝜓', name: 'Psi', baseCost: 4 },
    'chi':   { symbol: '𝜒', name: 'Chi', baseCost: 6 },
    'theta': { symbol: '𝜃', name: 'Theta', baseCost: 12 },
    'tau':   { symbol: '𝜏', name: 'Tau', baseCost: 20 },
    'imply': { symbol: '→', name: 'Imply', baseCost: 4 },
    'not':   { symbol: '¬', name: 'Not', baseCost: 7 },
    'bicon': { symbol: '↔', name: 'Biconditonal', baseCost: 10 },
    'and':   { symbol: '^', name: 'And', baseCost: 15 },
};

const characterCostAdd = 1.5;
var theoremMaxCnt = 10;

const theorems = {
    'Theorem idi':  {
        func: '⊢ 𝜑 ⇒ ⊢ 𝜑',
        mps: .25,  costW: { 'phi': 1 }
    },
    'Theorem a1ii': {
        func: '⊢ 𝜑 & ⊢ 𝜓 ⇒ ⊢ 𝜑',
        mps: .5,   costW: { 'phi': 1, 'psi': 1 },
        purchase: 'Syntax wi'
    },
    'Axiom ax-mp': {
        func: '⊢ 𝜑 & ⊢ (𝜑 → 𝜓) ⇒ ⊢ 𝜓',
        mps: 1,    costW: { 'phi': 2, 'psi': 1, 'imply': 1 },
        purchase: 'Syntax chi',
        limit: 25
    },
    'Axiom ax-1': {
        func: '⊢ (𝜑 → (𝜓 → 𝜑))',
        mps: 1,    costW: { 'phi': 2, 'psi': 1, 'imply': 2 },
        purchase: 'Syntax wn'
    },
    'Axiom ax-2': {
        func: '⊢ ((𝜑 → (𝜓 → 𝜒)) → ((𝜑 → 𝜓) → (𝜑 → 𝜒)))',
        mps: 2,    costW: { 'phi': 3, 'psi': 2, 'chi': 2, 'imply': 5 }
    },
    'Axiom ax-3': {
        func: '⊢ ((¬𝜑 → ¬𝜓) → (𝜓 → 𝜑))',
        mps: 1.5,  costW: { 'phi': 2, 'psi': 2, 'not': 2, 'imply': 3 }
    },
    'Theorem mp2': {
        func: '⊢ 𝜑 & ⊢ 𝜓 & ⊢ (𝜑 → (𝜓 → 𝜒)) ⇒ ⊢ 𝜒',
        mps: 4,    costW: { 'phi': 2, 'psi': 2, 'chi': 1, 'imply': 2 },
                   costT: { 'Axiom ax-mp': 2 }
    },
    'Theorem mp2b': {
        func: '⊢ 𝜑 & ⊢ (𝜑 → 𝜓) & ⊢ (𝜓 → 𝜒) ⇒ ⊢ 𝜒',
        mps: 4,    costW: { 'phi': 2, 'psi': 2, 'chi': 1, 'imply': 2 },
                   costT: { 'Axiom ax-mp': 2 }
    },
    'Theorem a1i': {
        func: '⊢ 𝜑 ⇒ ⊢ (𝜓 → 𝜑)',
        mps: 4,    costW: { 'phi': 1, 'psi': 1 },
                   costT: { 'Axiom ax-1': 1, 'Axiom ax-mp': 1 }
    },
    'Theorem 2a1i': {
        func: '⊢ 𝜑 ⇒ ⊢ (𝜓 → (𝜒 → 𝜑))',
        mps: 10,   costW: { 'phi': 1, 'psi': 1, 'chi': 1 },
                   costT: { 'Theorem a1i': 2 }
    },
    'Theorem mp1i': {
        func: '⊢ 𝜑 & ⊢ (𝜑 → 𝜓) ⇒ ⊢ (𝜒 → 𝜓)',
        mps: 9,    costW: { 'phi': 2, 'psi': 1, 'chi': 1, 'imply': 1 },
                   costT: { 'Axiom ax-mp': 1, 'Theorem a1i': 1 }
    },
    'Theorem a2i': {
        func: '⊢ (𝜑 → (𝜓 → 𝜒)) ⇒ ⊢ ((𝜑 → 𝜓) → (𝜑 → 𝜒))',
        mps: 9,    costW: { 'phi': 1, 'psi': 1, 'chi': 1, 'imply': 2 },
                   costT: { 'Axiom ax-2': 1, 'Axiom ax-mp': 1 }
    },
    'Theorem mpd': {
        func: '⊢ (𝜑 → 𝜓) & ⊢ (𝜑 → (𝜓 → 𝜒)) ⇒ ⊢ (𝜑 → 𝜒)',
        mps: 11,  costW: { 'phi': 2, 'psi': 2, 'chi': 1, 'imply': 3 },
                   costT: { 'Theorem a2i': 1, 'Axiom ax-mp': 1 }
    },
    'Theorem imim2i': {
        func: '⊢ (𝜑 → 𝜓) ⇒ ⊢ ((𝜒 → 𝜑) → (𝜒 → 𝜓))',
        mps: 13,    costW: { 'phi': 1, 'psi': 1, 'chi': 1, 'imply': 1 },
                   costT: { 'Theorem a1i': 1, 'Theorem a2i': 1 }
    },
    'Theorem syl': {
        func: '⊢ (𝜑 → 𝜓) & ⊢ (𝜓 → 𝜒) ⇒ ⊢ (𝜑 → 𝜒)',
        mps: 16,   costW: { 'phi': 2, 'psi': 2, 'chi': 1, 'imply': 2 },
                   costT: { 'Theorem a1i': 1, 'Theorem mpd': 1 },
        purchase: 'Syntax theta'
    },
    'Theorem 3syl': {
        func: '⊢ (𝜑 → 𝜓) & ⊢ (𝜓 → 𝜒) & ⊢ (𝜒 → 𝜃) ⇒ ⊢ (𝜑 → 𝜃)',
        mps: 20,   costW: { 'phi': 2, 'psi': 2, 'chi': 2, 'theta': 1, 'imply': 2 },
                   costT: { 'Theorem syl': 2 },
        purchase: 'Syntax tau'
    },
    'Theorem 4syl': {
        func: '⊢ (𝜑 → 𝜓) & ⊢ (𝜓 → 𝜒) & ⊢ (𝜒 → 𝜃) & ⊢ (𝜃 → 𝜏) ⇒ ⊢ (𝜑 → 𝜏)',
        mps: 25,   costW: { 'phi': 2, 'psi': 2, 'chi': 2, 'theta': 2, 'tau': 1, 'imply': 2 },
                   costT: { 'Theorem 3syl': 1, 'Theorem syl': 1 },
    },
    'Theorem mpi': {
        func: '⊢ 𝜓 & ⊢ (𝜑 → (𝜓 → 𝜒)) ⇒ ⊢ (𝜑 → 𝜒)',
        mps: 18,  costW: { 'phi': 2, 'psi': 2, 'chi': 2, 'imply': 2 },
                  costT: { 'Theorem a1i': 1, 'Theorem mpd': 1 }
    },
    'Theorem mpisyl': {
        func: '⊢ (𝜑 → 𝜓) & ⊢ 𝜒 & ⊢ (𝜓 → (𝜒 → 𝜃)) ⇒ ⊢ (𝜑 → 𝜃)',
        mps: 30,   costW: { 'phi': 2, 'psi': 2, 'chi': 2, 'theta': 2, 'imply': 3 },
                   costT: { 'Theorem a1i': 1, 'Theorem mpd': 1, 'Theorem syl': 1 },
    },
    'Theorem id': {
        func: '⊢ (𝜑 → 𝜑)',
        mps: 10,   costW: { 'phi': 2 },
                   costT: { 'Axiom ax-1': 2, 'Theorem mpd': 1 }
    }

    // '': {
    //     func: '',
    //     mps: 1, costW: { '': 1 },
    //             costT: { '': 1 }
    // },
};

const upgrades = {
    'Syntax wi':    { symbol: '→', cost: 10,  unlock: 'imply' },
    'Syntax wn':    { symbol: '¬', cost: 40,  unlock: 'not'   },
    'Syntax chi':   { symbol: '𝜒', cost: 80,  unlock: 'chi'   },
    'Syntax theta': { symbol: '𝜃', cost: 200, unlock: 'theta' },
    'Syntax tau':   { symbol: '𝜏', cost: 400, unlock: 'tau'   }
};

// DOM elements
const metaCountElem = document.getElementById('metaCount');
const mpsCountElem = document.getElementById('mpsCount');
const characterGrid = document.querySelector('.character-grid');
const upgradeContainer = document.querySelector('.upgrades');
const theoremsContainer = document.querySelector('.theorems');
const rebirthInfo = document.getElementById('rebirthInfo');

let visibleCharacters = ['phi', 'psi'];
let purchasedCharacters = {};
let characterCost = {};
let visibleUpgrades = [];
let purchasedUpgrades = [];
let visibleTheorems = [];
let purchasedTheorems = {};

const SECOND = 1000;

let prevTime = performance.now();
function updatePage(time) {
    metaCount += metasPerSecond * ((time - prevTime) / SECOND);
    if (metaCount < 2 * rebirthInitialValue) {
        rebirthGetCount = +(metaCount >= rebirthInitialValue);
    } else {
        rebirthGetCount = 2 + Math.floor(Math.log2(metaCount / (2 * rebirthInitialValue)));
    }
    prevTime = time;
    metaCountElem.textContent = `${metaCount.toFixed(2)} Metas`;
    mpsCountElem.textContent = `${metasPerSecond.toFixed(2)} m/s`;
    rebirthButton.textContent = `🔁 Rebirth (${rebirthGetCount})`;
    localStorage.setItem('metaCount', metaCount);
    requestAnimationFrame(updatePage);
}

requestAnimationFrame(updatePage);

function save() {
    localStorage.setItem('metaCount', metaCount);
    localStorage.setItem('visibleCharacters', JSON.stringify(visibleCharacters));
    localStorage.setItem('purchasedCharacters', JSON.stringify(purchasedCharacters));
    localStorage.setItem('characterCost', JSON.stringify(characterCost));
    localStorage.setItem('visibleTheorems', JSON.stringify(visibleTheorems));
    localStorage.setItem('purchasedTheorems', JSON.stringify(purchasedTheorems));
    localStorage.setItem('visibleUpgrades', JSON.stringify(visibleUpgrades));
    localStorage.setItem('purchasedUpgrades', JSON.stringify(purchasedUpgrades));
    localStorage.setItem('rebirthCount', rebirthCount);
}

function calcMPS() {
    metasPerSecond = 0.5 * rebirthBonus; // base mps with rebirth bonus
    for (var key in purchasedTheorems) {
        metasPerSecond += theorems[key].mps * purchasedTheorems[key] * rebirthBonus;
    }
}

function load() {
    const savedMetaCount = localStorage.getItem('metaCount');
    if (savedMetaCount) {
        metaCount = parseFloat(savedMetaCount);
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

    const savedRebirthCount = localStorage.getItem('rebirthCount');
    if (savedRebirthCount) {
        rebirthCount = parseInt(savedRebirthCount, 10);
    }
    rebirthBonus = 1 + rebirthCount * 0.15;

    calcMPS();
    save();
}

function theoremCanSeeCharacter(theorem) {
    let costW = Object.entries(theorem.costW).every(([id, cost]) => {
        c = purchasedCharacters[id];
        return c >= cost - 1 && c != 0;
    })
    let costT = true;
    if (theorem.costT) {
        costT = Object.entries(theorem.costT || {}).every(([id, cost]) => {
            c = purchasedTheorems[id];
            return c >= cost - 1 && c;
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
            metasPerSecond -= theorems[theoremID].mps;
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
    }
}

function purchaseTheorem(id) {
    const theorem = theorems[id];
    const canPurchase = theoremCanPurchaseCharacter(theorem);
    if (purchasedTheorems[id] > theoremMaxCnt && !theorem.limit) {
        purchasedTheorems[id] = theoremMaxCnt;
        regenerateTheorems();
        save();
    }

    let limit = theorem.limit || theoremMaxCnt;
    if ((canPurchase && purchasedTheorems[id] < limit)) {
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
    }
}

function updateRebirthInfo() {
    rebirthInfo.textContent = `Rebirths: ${rebirthCount} | Bonus: +${((rebirthBonus-1)*100).toFixed(0)}% m/s`;
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

        // button.style.transition = "background-color 0.3s, transform 0.1s ease-out";
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
        let limit = theorem.limit || 10;

        // Add character content
        button.innerHTML = `
            <div class="theorem-button-top">
                <h3>${id}</h3>
                <p>${theorem.func}</p>
            </div>
            <div class="theorem-button-bottom">
                <p>Owned: ${purchasedTheorems[id]}/${limit}</p>
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
    visibleCharacters = ['phi', 'psi'];
    purchasedCharacters = {};
    characterCost = {};
    visibleUpgrades = [];
    purchasedUpgrades = [];
    visibleTheorems = [];
    purchasedTheorems = {};
    theoremMaxCnt = 10;
    rebirthCount = 0;
    rebirthBonus = 1;
    save();
    location.reload();
}

const darkModeButton = document.getElementById('darkModeButton');
const resetButton = document.getElementById('resetButton');
const rebirthButton = document.getElementById('rebirthButton');

darkModeButton.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeButton(isDarkMode);
});

// Update the button text based on the mode
function updateDarkModeButton(isDarkMode) {
    darkModeButton.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
}

rebirthButton.addEventListener('click', () => {
    if (metaCount >= rebirthInitialValue) { // Example threshold for rebirth
        performRebirth();
    } else {
        alert(`You need at least ${rebirthInitialValue} Metas to rebirth!`);
    }
});


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
    updateRebirthInfo();
});

function performRebirth() {
    rebirthCount++;
    rebirthBonus = 1 + rebirthCount * 0.15;
    metaCount = baseMetaCount;
    metasPerSecond = 0.5 * rebirthBonus;
    visibleCharacters = ['phi', 'psi'];
    purchasedCharacters = {};
    characterCost = {};
    visibleUpgrades = [];
    purchasedUpgrades = [];
    visibleTheorems = [];
    purchasedTheorems = {};
    save();
    updateRebirthInfo();
    regenerateCharacterButtons();
    regenerateUpgrades();
    regenerateTheorems();
}
