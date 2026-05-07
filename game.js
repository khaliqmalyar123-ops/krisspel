const $ = (id) => document.getElementById(id);

const icons = {
  home: `
    <svg class="icon icon-big" viewBox="0 0 24 24">
      <path d="M3 11l9-8 9 8"></path>
      <path d="M5 10v10h14V10"></path>
      <path d="M9 20v-6h6v6"></path>
    </svg>
  `,
  water: `
    <svg class="icon icon-big" viewBox="0 0 24 24">
      <path d="M12 2C8.2 6.8 6 10.2 6 14a6 6 0 0 0 12 0c0-3.8-2.2-7.2-6-12z"></path>
    </svg>
  `,
  power: `
    <svg class="icon icon-big" viewBox="0 0 24 24">
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"></path>
    </svg>
  `,
  fire: `
    <svg class="icon icon-big" viewBox="0 0 24 24">
      <path d="M8 14c-1.4-3 1-5.5 3-7 .2 2 1.3 3.2 3 4.5.8-1.2.9-2.7.5-4.2C17 9.3 20 12 20 16a8 8 0 0 1-16 0c0-2 1-3.5 2.4-5 .1 1.5.7 2.5 1.6 3z"></path>
    </svg>
  `,
  people: `
    <svg class="icon icon-big" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `,
  info: `
    <svg class="icon icon-big" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16v-4"></path>
      <path d="M12 8h.01"></path>
    </svg>
  `,
  health: `
    <svg class="icon icon-big" viewBox="0 0 24 24">
      <path d="M19 14c1.5-1.5 3-3.5 3-6a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 2.5 1.5 4.5 3 6l5 5 7-5z"></path>
    </svg>
  `,
  radio: `
    <svg class="icon icon-big" viewBox="0 0 24 24">
      <path d="M4 11h16v9H4z"></path>
      <path d="M8 16h.01"></path>
      <path d="M12 16h4"></path>
      <path d="M8 11 18 4"></path>
    </svg>
  `
};

const initialState = {
  water: 60,
  food: 55,
  energy: 100,
  trust: 50,
  health: 70,
  knowledge: 35,
  round: 0,
  log: [],
  items: {
    waterCans: 1,
    foodBox: 1,
    powerbank: 1,
    firstAid: 0,
    radio: 0,
    neighborList: 0
  }
};

let state = structuredClone(initialState);

// Flip card functionality for meters - using event delegation
let meterFlipsInitialized = false;

function initMeterFlips() {
  if (meterFlipsInitialized) return;
  
  meterFlipsInitialized = true;
  
  // Use event delegation on document level
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.meter-info-btn');
    
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      
      const meter = btn.closest('.meter');
      if (meter) {
        const flipContainer = meter.querySelector('.meter-flip-container');
        if (flipContainer) {
          flipContainer.classList.toggle('flipped');
        }
      }
    } else if (!e.target.closest('.meter-flip-container')) {
      // Close all flipped cards if clicking outside
      document.querySelectorAll('.meter-flip-container.flipped').forEach(card => {
        card.classList.remove('flipped');
      });
    }
  });
}

const scenarios = [
  {
    id: "prep-1",
    day: "Dag 1 · 08:00",
    phase: "Förberedelse",
    icon: "home",
    color: "blue",
    title: "Du har två timmar innan stormen når området",
    text: "Varningar sprids i sociala medier. Du har begränsad tid att förbereda hushållet. Vad gör du först?",
    tags: ["prioritering", "beredskap"],
    choices: [
      {
        title: "Fyll dunkar och flaskor med vatten",
        desc: "Vatten är ofta svårare att ersätta än man tror.",
        effects: { water: 25, energy: -2, knowledge: 5 },
        item: { waterCans: 1 },
        feedback: "Bra grundbeslut. Vattenreserven ökade."
      },
      {
        title: "Ladda alla enheter och powerbanks",
        desc: "Du säkrar kommunikation och ljus om elen går.",
        effects: { energy: -25, knowledge: 5 },
        item: { powerbank: 1 },
        feedback: "Du säkrade energi och kommunikation."
      },
      {
        title: "Vänta och se om det verkligen blir kris",
        desc: "Du sparar tid nu, men riskerar att hamna efter.",
        effects: { water: -8, energy: -8, trust: -2 },
        feedback: "Passivitet gjorde dig mer sårbar."
      }
    ]
  },
  {
    id: "prep-2",
    day: "Dag 1 · 10:00",
    phase: "Grannskap",
    icon: "people",
    color: "green",
    title: "En äldre granne frågar om hjälp",
    text: "Din granne på våningen under saknar ficklampa och verkar orolig. Du har själv begränsad tid.",
    tags: ["tillit", "samverkan"],
    choices: [
      {
        title: "Hjälp grannen och skapa en kontaktlista",
        desc: "Ni byter nummer och bestämmer vem som kollar läget senare.",
        effects: { trust: 25, energy: -5, knowledge: 10 },
        item: { neighborList: 1 },
        feedback: "Grannskapets tillit ökade kraftigt."
      },
      {
        title: "Ge kort råd men prioritera ditt eget hem",
        desc: "Du hjälper lite utan att lägga mycket tid.",
        effects: { trust: 8, knowledge: 4 },
        feedback: "Du hjälpte lite, men byggde inte stark samverkan."
      },
      {
        title: "Säg att du inte har tid",
        desc: "Du skyddar dina resurser men tappar lokal tillit.",
        effects: { trust: -18, food: -4 },
        feedback: "Själviskt val. Tilliten i huset sjönk."
      }
    ]
  },
  {
    id: "radio-1",
    day: "Dag 1 · 12:00",
    phase: "Förberedelse",
    icon: "radio",
    color: "blue",
    title: "Du hittar en gammal batteriradio",
    text: "Den ligger i förrådet. Den fungerar men saknar nya batterier. Du kan lägga tid på den nu.",
    tags: ["backup", "information"],
    choices: [
      {
        title: "Förbered radion med batterier",
        desc: "Ger robust informationskanal senare.",
        effects: { energy: -4, knowledge: 12 },
        item: { radio: 1 },
        feedback: "Radion är redo som backup."
      },
      {
        title: "Lämna den, mobilen räcker nog",
        desc: "Du sparar tid men saknar backup.",
        effects: { knowledge: -4 },
        feedback: "Mobilen är inte alltid tillräcklig i kris."
      },
      {
        title: "Ge radion till grannskapet",
        desc: "Du bygger gemensam robusthet.",
        effects: { trust: 14, knowledge: 10 },
        item: { radio: 1 },
        feedback: "Radion blev en gemensam resurs."
      }
    ]
  },
  {
    id: "first-aid",
    day: "Dag 1 · 13:00",
    phase: "Förberedelse",
    icon: "health",
    color: "green",
    title: "Du kan komplettera första hjälpen",
    text: "Du har plåster men saknar enklare sjukvårdsmaterial. Vad gör du?",
    tags: ["hälsa", "beredskap"],
    choices: [
      {
        title: "Bygg ett enkelt första hjälpen-kit",
        desc: "Du säkrar små skador innan de blir större problem.",
        effects: { health: 18, knowledge: 6 },
        item: { firstAid: 1 },
        feedback: "Första hjälpen-kitet höjde säkerheten."
      },
      {
        title: "Prioritera mat och vatten istället",
        desc: "Rimligt, men hälsomarginalen blir lägre.",
        effects: { water: 4, food: 4, health: -4 },
        feedback: "Du stärkte basresurser men saknar vårdmarginal."
      },
      {
        title: "Fråga grannar om någon har sjukvårdskunskap",
        desc: "Kunskap kan vara lika viktig som prylar.",
        effects: { trust: 12, knowledge: 12 },
        feedback: "Du kartlade lokal kompetens."
      }
    ]
  },
  {
    id: "power-outage",
    day: "Dag 1 · 14:00",
    phase: "Störning",
    icon: "power",
    color: "red",
    title: "Strömmen går i hela byggnaden",
    text: "Hissen stannar, porttelefonen fungerar inte och flera grannar skriver oroligt i chatten.",
    tags: ["elavbrott", "information"],
    choices: [
      {
        title: "Starta Grannhjälpen-läge och dela tydlig status",
        desc: "Du samlar läget: vilka är drabbade och vem behöver hjälp?",
        requires: { neighborList: 1 },
        effects: { trust: 20, knowledge: 10, energy: -6 },
        feedback: "Kontaktlistan gjorde stor skillnad. Informationen blev strukturerad."
      },
      {
        title: "Spara batteri och använd telefonen sparsamt",
        desc: "Du undviker panik och sparar resurser.",
        effects: { energy: -8, knowledge: 4 },
        feedback: "Bra energibeslut. Du höll dig lugn."
      },
      {
        title: "Skicka många meddelanden till alla",
        desc: "Du försöker hjälpa men skapar brus och tömmer batteri.",
        effects: { energy: -18, trust: -6, knowledge: -4 },
        feedback: "Information utan struktur skapade mer stress."
      }
    ]
  },
  {
    id: "water-pressure",
    day: "Dag 1 · 18:00",
    phase: "Vatten",
    icon: "water",
    color: "blue",
    title: "Vattentrycket försvinner",
    text: "Kranen hostar till och slutar rinna. Flera i huset vet inte om vattnet är säkert.",
    tags: ["vatten", "hygien"],
    choices: [
      {
        title: "Ransonera vatten och informera hushållet",
        desc: "Du sätter tydliga regler för dryck, mat och hygien.",
        effects: { water: 8, health: 6, knowledge: 8 },
        feedback: "Ransonering gav kontroll och minskade risk."
      },
      {
        title: "Dela en dunk med grannen som saknar vatten",
        desc: "Du tappar lite vatten men bygger tillit.",
        requires: { waterCans: 1 },
        effects: { water: -10, trust: 22, health: 3 },
        feedback: "Du offrade lite men stärkte grannskapets robusthet."
      },
      {
        title: "Använd vatten som vanligt tills det tar slut",
        desc: "Du undviker obehag nu men förlorar snabbt marginal.",
        effects: { water: -25, health: -8 },
        feedback: "Vattenreserven minskade farligt snabbt."
      }
    ]
  },
  {
    id: "night",
    day: "Dag 1 · 22:00",
    phase: "Mörker",
    icon: "power",
    color: "red",
    title: "Natten blir kall och mörk",
    text: "Lägenheten kyls ner. Barn och äldre i huset blir oroliga. Du behöver välja strategi för natten.",
    tags: ["värme", "trygghet"],
    choices: [
      {
        title: "Samla familjen i ett rum och spara värme",
        desc: "Du minskar energiförlust och håller lugnet.",
        effects: { health: 10, energy: 4, food: -3 },
        feedback: "Smart krisstrategi. Hälsa och energi stabiliserades."
      },
      {
        title: "Använd powerbank och lampor hela kvällen",
        desc: "Det känns tryggt men kostar mycket energi.",
        effects: { energy: -22, health: 4 },
        feedback: "Det blev tryggare kortsiktigt men energin föll."
      },
      {
        title: "Gå runt i huset och kontrollera läget",
        desc: "Du hjälper andra men blir trött och kall.",
        effects: { trust: 14, health: -8, energy: -4 },
        feedback: "Omsorgsfullt, men kroppen tog stryk."
      }
    ]
  },
  {
    id: "rumor",
    day: "Dag 2 · 08:00",
    phase: "Information",
    icon: "info",
    color: "blue",
    title: "Ett rykte sprids om förorenat vatten",
    text: "Någon skriver att vattnet är farligt. Ingen anger källa. Folk börjar bli stressade.",
    tags: ["tillit", "källkritik"],
    choices: [
      {
        title: "Vänta på verifierad information och markera ryktet som obekräftat",
        desc: "Du bromsar panik och uppmuntrar källkontroll.",
        effects: { trust: 16, knowledge: 18 },
        feedback: "Starkt beslut. Källkritik höjde tilliten."
      },
      {
        title: "Sprid varningen vidare för säkerhets skull",
        desc: "Det kan vara rätt, men utan källa kan panik öka.",
        effects: { trust: -10, knowledge: -8, health: 2 },
        feedback: "Bra intention, men obekräftad info skapade oro."
      },
      {
        title: "Ignorera allt och gör ingenting",
        desc: "Du sparar energi men hjälper inte andra att förstå läget.",
        effects: { trust: -8, knowledge: -5 },
        feedback: "Passivitet gjorde läget otydligare."
      }
    ]
  },
  {
    id: "food",
    day: "Dag 2 · 12:00",
    phase: "Mat",
    icon: "home",
    color: "green",
    title: "Maten i kylen börjar bli dålig",
    text: "Elavbrottet fortsätter. Du måste bestämma hur maten ska användas innan den förstörs.",
    tags: ["mat", "planering"],
    choices: [
      {
        title: "Ät kylvaror först och spara torrvaror",
        desc: "Du minskar matsvinn och sparar krislager.",
        effects: { food: 10, health: 4, knowledge: 6 },
        feedback: "Bra matstrategi. Du maximerade resurserna."
      },
      {
        title: "Dela mat med två grannar och laga gemensamt",
        desc: "Ni använder resurser effektivt och bygger relationer.",
        effects: { food: -4, trust: 20, health: 6 },
        feedback: "Gemensam matlagning stärkte både tillit och hälsa."
      },
      {
        title: "Spara allt och ät så lite som möjligt",
        desc: "Du sparar mat men tappar energi och ork.",
        effects: { food: 8, health: -14 },
        feedback: "För hård ransonering påverkade hälsan."
      }
    ]
  },
  {
    id: "medicine",
    day: "Dag 2 · 16:00",
    phase: "Akut läge",
    icon: "health",
    color: "red",
    title: "En granne behöver medicin",
    text: "Maria i lägenhet 1145 behöver hämta medicin, men kollektivtrafiken står still och hissarna fungerar inte.",
    tags: ["akut", "prioritering"],
    choices: [
      {
        title: "Organisera två personer som hjälper Maria",
        desc: "Du använder grannskapet istället för att lösa allt själv.",
        requires: { neighborList: 1 },
        effects: { trust: 25, health: 12, knowledge: 8 },
        feedback: "Decentraliserad hjälp fungerade mycket bra."
      },
      {
        title: "Försök hjälpa själv direkt",
        desc: "Snabbt och omtänksamt, men det belastar dig.",
        effects: { trust: 10, health: -8, energy: -5 },
        feedback: "Du hjälpte, men tog för mycket ansvar själv."
      },
      {
        title: "Säg att hon bör ringa 112 direkt",
        desc: "Rätt vid livsfara, men situationen kanske behövde lokal hjälp först.",
        effects: { trust: -5, knowledge: 5 },
        feedback: "Externa resurser är viktiga, men lokal samordning kan avlasta."
      }
    ]
  },
  {
    id: "fire-risk",
    day: "Dag 2 · 20:00",
    phase: "Brandrisk",
    icon: "fire",
    color: "red",
    title: "Någon tänder ljus i trapphuset",
    text: "Det är mörkt och någon har ställt levande ljus vid entrén. Det ger ljus men ökar brandrisken.",
    tags: ["brandrisk", "säkerhet"],
    choices: [
      {
        title: "Ta bort ljusen och sätt upp säker instruktion",
        desc: "Du minskar brandrisken och förklarar varför.",
        effects: { health: 15, trust: 8, knowledge: 10 },
        feedback: "Du agerade säkert och pedagogiskt."
      },
      {
        title: "Låt dem stå kvar eftersom folk behöver ljus",
        desc: "Kortvarig nytta men stor risk.",
        effects: { health: -20, trust: -4 },
        feedback: "Brandrisk är farligare än mörker i trapphus."
      },
      {
        title: "Ersätt med ficklampor från grannar",
        desc: "Säkrare lösning, särskilt om tilliten är hög.",
        effects: { health: 12, trust: 14, energy: -4 },
        feedback: "Bra kompromiss. Trygghet utan ökad brandrisk."
      }
    ]
  },
  {
    id: "resources",
    day: "Dag 3 · 08:00",
    phase: "Uthållighet",
    icon: "water",
    color: "blue",
    title: "Resurserna börjar ta slut",
    text: "Det tredje dygnet är svårast. Flera hushåll i huset saknar vatten och tydlig information.",
    tags: ["uthållighet", "resurser"],
    choices: [
      {
        title: "Skapa ett gemensamt resursbord i entrén",
        desc: "Alla kan bidra och ta det mest nödvändiga.",
        effects: { trust: 25, water: -8, food: -6, knowledge: 8 },
        feedback: "Kollektiv resursdelning ökade robustheten."
      },
      {
        title: "Behåll dina resurser för säkerhets skull",
        desc: "Du skyddar hushållet men riskerar social friktion.",
        effects: { water: 4, food: 4, trust: -18 },
        feedback: "Det hjälpte dig, men tilliten föll."
      },
      {
        title: "Be alla vänta på kommunen",
        desc: "Extern hjälp är viktig men kan dröja.",
        effects: { trust: -7, health: -5, knowledge: 3 },
        feedback: "Att bara vänta gjorde gruppen passiv."
      }
    ]
  },
  {
    id: "network",
    day: "Dag 3 · 12:00",
    phase: "Kommunikation",
    icon: "radio",
    color: "blue",
    title: "Mobilnätet blir svagt",
    text: "Meddelanden går inte alltid fram. Rykten ökar och batterier är låga.",
    tags: ["kommunikation", "backup"],
    choices: [
      {
        title: "Använd batteriradio och dela officiell info muntligt",
        desc: "Du använder alternativ kommunikation.",
        requires: { radio: 1 },
        effects: { knowledge: 25, trust: 12, energy: 4 },
        feedback: "Batteriradio gav robust informationskanal."
      },
      {
        title: "Skapa fasta informationstider i entrén",
        desc: "Ni minskar brus och sparar batteri.",
        effects: { knowledge: 16, trust: 14, energy: 6 },
        feedback: "Strukturerad kommunikation fungerade mycket bra."
      },
      {
        title: "Fortsätt uppdatera chatten hela tiden",
        desc: "Det känns aktivt men tömmer batterier och sprider brus.",
        effects: { energy: -10, knowledge: -4, trust: -4 },
        feedback: "För mycket digitalt brus försämrade läget."
      }
    ]
  }
];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  $(id).classList.add("active");
}

function startGame() {
  state = structuredClone(initialState);
  showScreen("gameScreen");
  renderScenario();
  initMeterFlips();
}

function restartGame() {
  startGame();
}

function openHowTo() {
  $("modalBackdrop").classList.add("show");
}

function closeHowTo() {
  $("modalBackdrop").classList.remove("show");
}

function toast(message) {
  const toastElement = $("toast");
  toastElement.textContent = message;
  toastElement.classList.add("show");

  setTimeout(() => {
    toastElement.classList.remove("show");
  }, 2400);
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function renderScenario() {
  if (state.round >= scenarios.length || isGameOver()) {
    finishGame();
    return;
  }

  const scenario = scenarios[state.round];

  updateMeters();

  $("dayTitle").textContent = scenario.day;
  $("phaseTitle").textContent = scenario.phase;
  $("roundBadge").textContent = `Runda ${state.round + 1}/${scenarios.length}`;
  $("eventTitle").textContent = scenario.title;
  $("eventText").textContent = scenario.text;

  $("eventTags").innerHTML = scenario.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  $("eventIcon").className = `event-icon ${scenario.color}`;
  $("eventIcon").innerHTML = icons[scenario.icon];

  $("choices").innerHTML = scenario.choices
    .map((choice, index) => {
      const locked = !requirementsMet(choice.requires);

      return `
        <button 
          class="choice ${locked ? "disabled" : ""}"
          ${locked ? "disabled" : ""}
          onclick="chooseOption(${index})"
        >
          <div class="choice-title">
            <span>${choice.title}</span>
            <span class="cost">${locked ? "Kräver resurs" : effectSummary(choice)}</span>
          </div>
          <p>${choice.desc}</p>
        </button>
      `;
    })
    .join("");

  renderInventory();
}

function requirementsMet(requirements) {
  if (!requirements) return true;

  return Object.entries(requirements).every(([key, value]) => {
    return (state.items[key] || 0) >= value;
  });
}

function effectSummary(choice) {
  const labels = {
    water: "vatten",
    food: "mat",
    energy: "energi",
    trust: "tillit",
    health: "hälsa",
    knowledge: "kunskap"
  };

  const parts = [];

  if (choice.effects) {
    Object.entries(choice.effects).forEach(([key, value]) => {
      if (labels[key]) {
        parts.push(`${value > 0 ? "+" : ""}${value} ${labels[key]}`);
      }
    });
  }

  if (choice.item) {
    Object.values(choice.item).forEach((value) => {
      if (value > 0) {
        parts.push("+resurs");
      }
    });
  }

  return parts.slice(0, 2).join(" · ") || "val";
}

function chooseOption(index) {
  const scenario = scenarios[state.round];
  const choice = scenario.choices[index];

  if (!requirementsMet(choice.requires)) {
    toast("Du saknar resursen som krävs för detta val.");
    return;
  }

  applyEffects(choice.effects);
  applyItems(choice.item);

  state.round++;

  state.log.push({
    round: state.round,
    scenario: scenario.title,
    choice: choice.title,
    feedback: choice.feedback
  });

  toast(choice.feedback);
  updateMeters();

  setTimeout(() => {
    if (state.round >= scenarios.length || isGameOver()) {
      finishGame();
    } else {
      renderScenario();
    }
  }, 850);
}

function applyEffects(effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    if (state[key] !== undefined) {
      state[key] = clamp(state[key] + value);
    }
});

  if (state.trust >= 75 && effects.trust > 0) {
    state.health = clamp(state.health + 2);
    state.knowledge = clamp(state.knowledge + 2);
  }

  if (state.water < 25) {
    state.health = clamp(state.health - 4);
  }

  if (state.food < 20) {
    state.health = clamp(state.health - 3);
  }

  if (state.energy < 15) {
    state.knowledge = clamp(state.knowledge - 3);
  }
}

function applyItems(item = {}) {
  Object.entries(item).forEach(([key, value]) => {
    state.items[key] = Math.max(0, (state.items[key] || 0) + value);
  });
}

function updateMeters() {
  const values = {
    health: state.health,
    knowledge: state.knowledge,
    water: state.water,
    food: state.food,
    energy: state.energy,
    trust: state.trust
  };

  Object.entries(values).forEach(([key, value]) => {
    $(`${key}Value`).textContent = value;
    $(`${key}Bar`).style.width = `${value}%`;
  });
}

function renderInventory() {
  const inventory = [
    ["waterCans", "Vattendunkar", "Extra vatten för hushåll eller grannar"],
    ["foodBox", "Matlåda", "Torrvaror och mat som klarar avbrott"],
    ["powerbank", "Powerbank", "Reservenergi för mobil och lampor"],
    ["firstAid", "Första hjälpen", "Material för mindre skador"],
    ["radio", "Batteriradio", "Backup för krisinformation"],
    ["neighborList", "Kontaktlista", "Strukturerad grannsamverkan"]
  ];

  $("inventoryItems").innerHTML = inventory
    .map(([key, title, desc]) => {
      const count = state.items[key] || 0;

      return `
        <div class="item">
          <strong>${title} × ${count}</strong>
          <span>${desc}</span>
        </div>
      `;
    })
    .join("");
}

function isGameOver() {
  return (
    state.water <= 0 ||
    state.food <= 0 ||
    state.health <= 0 ||
    state.trust <= 0
  );
}

function calculateScore() {
  const average = Math.round(
    (state.water +
      state.food +
      state.energy +
      state.trust +
      state.health +
      state.knowledge) / 6
  );

  const itemBonus = Object.values(state.items).reduce((sum, value) => sum + value, 0) * 2;
  const survivalBonus = state.round >= scenarios.length ? 10 : 0;

  return clamp(average + itemBonus + survivalBonus);
}

function finishGame() {
  const score = calculateScore();

  showScreen("resultScreen");

  $("scoreValue").textContent = score;

  let title = "Krisen är över";
  let subtitle = "Du tog dig igenom 72 timmar.";
  let text = "";

  if (isGameOver()) {
    title = "Krisen blev för svår";
    subtitle = "En kritisk resurs föll till noll.";
    text =
      "Du fattade några bra beslut, men en central del av beredskapen blev för svag. Testa igen och balansera hushållets behov med grannskapets samverkan.";
  } else if (score >= 85) {
    text =
      "Utmärkt. Du kombinerade egen beredskap, källkritik och lokal samordning. Ditt hushåll klarade sig, och du stärkte även grannskapets robusthet.";
  } else if (score >= 65) {
    text =
      "Bra. Du klarade krisen, men vissa resurser blev pressade. Nästa gång kan du förbättra balansen mellan vatten, energi och tillit.";
  } else {
    text =
      "Du överlevde, men med låg marginal. Spelet visar att krisberedskap kräver både resurser, planering och samarbete.";
  }

  $("resultTitle").textContent = title;
  $("resultSubtitle").textContent = subtitle;
  $("scoreText").textContent = text;

  renderLessons();
  renderLog();
}

function renderLessons() {
  const lessons = [];

  if (state.water < 45) {
    lessons.push("Vatten behöver prioriteras tidigt. När det väl saknas blir alla andra beslut svårare.");
  } else {
    lessons.push("Tidigt säkrat vatten ger handlingsfrihet under hela krisen.");
  }

  if (state.trust >= 70) {
    lessons.push("Hög lokal tillit gör att hjälp kan fördelas snabbare och mer rättvist.");
  } else {
    lessons.push("Grannsamverkan måste byggas innan eller tidigt i krisen, annars blir hjälpen långsammare.");
  }

  if (state.knowledge >= 65) {
    lessons.push("Verifierad information minskar panik och gör besluten bättre.");
  } else {
    lessons.push("Obekräftad information och dålig kommunikation kan förvärra en kris.");
  }

  if (state.items.radio > 0) {
    lessons.push("Backup-kanaler som batteriradio gör systemet mindre beroende av mobilnät och el.");
  }

  if (state.items.neighborList > 0) {
    lessons.push("En enkel kontaktlista kan vara viktigare än en avancerad app när läget blir pressat.");
  }

  $("learningList").innerHTML = lessons
    .slice(0, 5)
    .map((lesson) => `<li>${lesson}</li>`)
    .join("");
}

function renderLog() {
  $("resultLog").innerHTML = state.log
    .map((entry) => {
      return `
        <div class="log-entry">
          <strong>Runda ${entry.round}:</strong> ${entry.choice}
          <br>
          ${entry.feedback}
        </div>
      `;
    })
    .join("");
}

/* EVENT LISTENERS */

$("startBtn").addEventListener("click", startGame);
$("restartBtn").addEventListener("click", restartGame);

$("homeBtn").addEventListener("click", () => {
  showScreen("startScreen");
});

$("howBtn").addEventListener("click", openHowTo);
$("closeModalBtn").addEventListener("click", closeHowTo);

$("modalBackdrop").addEventListener("click", (event) => {
  if (event.target.id === "modalBackdrop") {
    closeHowTo();
  }
});

  
   

