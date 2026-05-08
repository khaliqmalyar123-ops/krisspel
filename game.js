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
  water: 30,
  food: 25,
  energy: 35,
  trust: 35,
  health: 50,
  knowledge: 20,
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
let previousMeterValues = { ...state };
let timerInterval = null;
let timerSeconds = 90;
const TIMER_DURATION = 90;

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
        effects: { water: 18, energy: -4, knowledge: 3 },
        item: { waterCans: 1 },
        feedback: "Bra grundbeslut. Vattenreserven ökade."
      },
      {
        title: "Ladda alla enheter och powerbanks",
        desc: "Du säkrar kommunikation och ljus om elen går.",
        effects: { energy: -28, knowledge: 4 },
        item: { powerbank: 1 },
        feedback: "Du säkrade energi och kommunikation."
      },
      {
        title: "Vänta och se om det verkligen blir kris",
        desc: "Du sparar tid nu, men riskerar att hamna efter.",
        effects: { water: -12, energy: -12, trust: -5, health: -4 },
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
        effects: { trust: 18, energy: -6, knowledge: 8 },
        item: { neighborList: 1 },
        feedback: "Grannskapets tillit ökade kraftigt."
      },
      {
        title: "Ge kort råd men prioritera ditt eget hem",
        desc: "Du hjälper lite utan att lägga mycket tid.",
        effects: { trust: 5, knowledge: 3 },
        feedback: "Du hjälpte lite, men byggde inte stark samverkan."
      },
      {
        title: "Säg att du inte har tid",
        desc: "Du skyddar dina resurser men tappar lokal tillit.",
        effects: { trust: -22, food: -6, health: -5 },
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
        effects: { energy: -5, knowledge: 10 },
        item: { radio: 1 },
        feedback: "Radion är redo som backup."
      },
      {
        title: "Lämna den, mobilen räcker nog",
        desc: "Du sparar tid men saknar backup.",
        effects: { knowledge: -6 },
        feedback: "Mobilen är inte alltid tillräcklig i kris."
      },
      {
        title: "Ge radion till grannskapet",
        desc: "Du bygger gemensam robusthet.",
        effects: { trust: 16, knowledge: 12, energy: -3 },
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
        effects: { health: 12, knowledge: 5 },
        item: { firstAid: 1 },
        feedback: "Första hjälpen-kitet höjde säkerheten."
      },
      {
        title: "Prioritera mat och vatten istället",
        desc: "Rimligt, men hälsomarginalen blir lägre.",
        effects: { water: 3, food: 3, health: -6 },
        feedback: "Du stärkte basresurser men saknar vårdmarginal."
      },
      {
        title: "Fråga grannar om någon har sjukvårdskunskap",
        desc: "Kunskap kan vara lika viktig som prylar.",
        effects: { trust: 10, knowledge: 10, energy: -3 },
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
        effects: { trust: 16, knowledge: 8, energy: -7 },
        feedback: "Kontaktlistan gjorde stor skillnad. Informationen blev strukturerad."
      },
      {
        title: "Spara batteri och använd telefonen sparsamt",
        desc: "Du undviker panik och sparar resurser.",
        effects: { energy: -10, knowledge: 3 },
        feedback: "Bra energibeslut. Du höll dig lugn."
      },
      {
        title: "Skicka många meddelanden till alla",
        desc: "Du försöker hjälpa men skapar brus och tömmer batteri.",
        effects: { energy: -22, trust: -10, knowledge: -6, health: -4 },
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
        effects: { water: 5, health: 4, knowledge: 6 },
        feedback: "Ransonering gav kontroll och minskade risk."
      },
      {
        title: "Dela en dunk med grannen som saknar vatten",
        desc: "Du tappar lite vatten men bygger tillit.",
        requires: { waterCans: 1 },
        effects: { water: -14, trust: 18, health: 2 },
        feedback: "Du offrade lite men stärkte grannskapets robusthet."
      },
      {
        title: "Använd vatten som vanligt tills det tar slut",
        desc: "Du undviker obehag nu men förlorar snabbt marginal.",
        effects: { water: -30, health: -10, trust: -5 },
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
        effects: { health: 8, energy: 2, food: -4 },
        feedback: "Smart krisstrategi. Hälsa och energi stabiliserades."
      },
      {
        title: "Använd powerbank och lampor hela kvällen",
        desc: "Det känns tryggt men kostar mycket energi.",
        effects: { energy: -26, health: 3 },
        feedback: "Det blev tryggare kortsiktigt men energin föll."
      },
      {
        title: "Gå runt i huset och kontrollera läget",
        desc: "Du hjälper andra men blir trött och kall.",
        effects: { trust: 12, health: -10, energy: -6 },
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
        effects: { trust: 14, knowledge: 15 },
        feedback: "Starkt beslut. Källkritik höjde tilliten."
      },
      {
        title: "Sprid varningen vidare för säkerhets skull",
        desc: "Det kan vara rätt, men utan källa kan panik öka.",
        effects: { trust: -14, knowledge: -12, health: -3 },
        feedback: "Bra intention, men obekräftad info skapade oro."
      },
      {
        title: "Ignorera allt och gör ingenting",
        desc: "Du sparar energi men hjälper inte andra att förstå läget.",
        effects: { trust: -10, knowledge: -8, health: -2 },
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
        effects: { food: 7, health: 3, knowledge: 5 },
        feedback: "Bra matstrategi. Du maximerade resurserna."
      },
      {
        title: "Dela mat med två grannar och laga gemensamt",
        desc: "Ni använder resurser effektivt och bygger relationer.",
        effects: { food: -8, trust: 16, health: 4 },
        feedback: "Gemensam matlagning stärkte både tillit och hälsa."
      },
      {
        title: "Spara allt och ät så lite som möjligt",
        desc: "Du sparar mat men tappar energi och ork.",
        effects: { food: 6, health: -18, energy: -6 },
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
        effects: { trust: 18, health: 10, knowledge: 6 },
        feedback: "Decentraliserad hjälp fungerade mycket bra."
      },
      {
        title: "Försök hjälpa själv direkt",
        desc: "Snabbt och omtänksamt, men det belastar dig.",
        effects: { trust: 8, health: -10, energy: -7 },
        feedback: "Du hjälpte, men tog för mycket ansvar själv."
      },
      {
        title: "Säg att hon bör ringa 112 direkt",
        desc: "Rätt vid livsfara, men situationen kanske behövde lokal hjälp först.",
        effects: { trust: -8, knowledge: 3, health: -4 },
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
        effects: { health: 12, trust: 6, knowledge: 8 },
        feedback: "Du agerade säkert och pedagogiskt."
      },
      {
        title: "Låt dem stå kvar eftersom folk behöver ljus",
        desc: "Kortvarig nytta men stor risk.",
        effects: { health: -26, trust: -8, knowledge: -4 },
        feedback: "Brandrisk är farligare än mörker i trapphus."
      },
      {
        title: "Ersätt med ficklampor från grannar",
        desc: "Säkrare lösning, särskilt om tilliten är hög.",
        effects: { health: 10, trust: 12, energy: -5 },
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
        effects: { trust: 20, water: -12, food: -10, knowledge: 7 },
        feedback: "Kollektiv resursdelning ökade robustheten."
      },
      {
        title: "Behåll dina resurser för säkerhets skull",
        desc: "Du skyddar hushållet men riskerar social friktion.",
        effects: { water: 3, food: 3, trust: -22, health: -4 },
        feedback: "Det hjälpte dig, men tilliten föll."
      },
      {
        title: "Be alla vänta på kommunen",
        desc: "Extern hjälp är viktig men kan dröja.",
        effects: { trust: -10, health: -8, knowledge: 2 },
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
        effects: { knowledge: 20, trust: 10, energy: 2 },
        feedback: "Batteriradio gav robust informationskanal."
      },
      {
        title: "Skapa fasta informationstider i entrén",
        desc: "Ni minskar brus och sparar batteri.",
        effects: { knowledge: 13, trust: 11, energy: 3 },
        feedback: "Strukturerad kommunikation fungerade mycket bra."
      },
      {
        title: "Fortsätt uppdatera chatten hela tiden",
        desc: "Det känns aktivt men tömmer batterier och sprider brus.",
        effects: { energy: -14, knowledge: -8, trust: -8, health: -3 },
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
  showScreen("setupScreen");
}

function startGameFromSetup() {
  state = structuredClone(initialState);
  
  // Läs vilka material som är valda
  const selectedMaterials = [
    "waterCans",
    "foodBox",
    "powerbank",
    "firstAid",
    "radio",
    "neighborList"
  ];

  selectedMaterials.forEach((material) => {
    const checkbox = $("setup-" + material);
    if (checkbox && checkbox.checked) {
      state.items[material] = 1;
    } else {
      state.items[material] = 0;
    }
  });

  showScreen("gameScreen");
  renderScenario();
  initMeterFlips();
}

function restartGame() {
  showScreen("setupScreen");
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
  startTimer();
}

function startTimer() {
  stopTimer();
  timerSeconds = TIMER_DURATION;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerDisplay();

    if (timerSeconds <= 0) {
      stopTimer();
      timeoutChoice();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  
  const timerDisplay = $("timerDisplay");
  const timerProgress = document.querySelector(".timer-progress");
  const timerText = document.querySelector(".timer-text");

  if (timerDisplay) {
    timerDisplay.textContent = display;
  }

  if (timerProgress) {
    const circumference = 2 * Math.PI * 45;
    const progress = (timerSeconds / TIMER_DURATION) * circumference;
    timerProgress.style.strokeDashoffset = circumference - progress;

    timerProgress.classList.remove("warning", "danger");
    if (timerText) timerText.classList.remove("warning", "danger");

    if (timerSeconds <= 10) {
      timerProgress.classList.add("danger");
      if (timerText) timerText.classList.add("danger");
    } else if (timerSeconds <= 30) {
      timerProgress.classList.add("warning");
      if (timerText) timerText.classList.add("warning");
    }
  }
}

function timeoutChoice() {
  stopTimer();
  
  const scenario = scenarios[state.round];
  const timeoutEffects = {
    trust: -15,
    knowledge: -10,
    health: -8
  };

  applyEffects(timeoutEffects);
  
  state.round++;
  state.log.push({
    round: state.round,
    scenario: scenario.title,
    choice: "⏰ TIDEN TAR SLUT",
    feedback: "Du reagerade för långsamt. Dina grannar misstrodde din handlingskraft och många resurser gick förlorade."
  });

  toast("⏰ Tiden tog slut! Du får en negativ effekt.");
  updateMeters();

  setTimeout(() => {
    if (checkLowResources()) {
      return;
    }
    if (state.round >= scenarios.length || isGameOver()) {
      finishGame();
    } else {
      renderScenario();
    }
  }, 850);
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
        parts.push(labels[key]);
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
  stopTimer();
  
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
    if (checkLowResources()) {
      return;
    }
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

  if (state.knowledge < 20) {
    state.trust = clamp(state.trust - 2);
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
    const valueEl = $(`${key}Value`);
    const barEl = $(`${key}Bar`);
    const meterEl = barEl.closest('.meter');

    valueEl.textContent = value;
    barEl.style.width = `${value}%`;

    if (meterEl && previousMeterValues[key] !== value) {
      meterEl.classList.add('meter-pulse');
      setTimeout(() => {
        meterEl.classList.remove('meter-pulse');
      }, 600);
    }
  });

  previousMeterValues = { ...values };
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
    state.trust <= 0 ||
    state.energy <= 0 ||
    state.knowledge <= 0
  );
}

function checkLowResources() {
  const thresholds = {
    water: { value: state.water, label: "Vatten", icon: "water" },
    food: { value: state.food, label: "Mat", icon: "food" },
    health: { value: state.health, label: "Hälsa", icon: "health" },
    energy: { value: state.energy, label: "Energi", icon: "energy" },
    trust: { value: state.trust, label: "Tillit", icon: "trust" },
    knowledge: { value: state.knowledge, label: "Kunskap", icon: "knowledge" }
  };

  for (const [key, resource] of Object.entries(thresholds)) {
    if (resource.value <= 0) {
      showDeathScreen(resource.label);
      return true;
    }
    if (resource.value <= 20 && resource.value > 0) {
      showWarningModal(resource.label, resource.value);
      return false;
    }
  }
  return false;
}

function showWarningModal(resourceName, value) {
  const warningHtml = `
    <div id="warningBackdrop" class="modal-backdrop show" style="z-index: 100;">
      <div class="modal" style="border-left: 6px solid var(--red);">
        <h3 style="color: var(--red);">⚠️ KRITISK VARNING</h3>
        <p>
          Du har bara <strong>${value} poäng</strong> kvar på <strong>${resourceName}</strong>.
          Om detta når noll är spelet över!
        </p>
        <p style="font-size: 13px; color: var(--muted);">Du måste agera snabbt för att öka denna resurs.</p>
        <button class="btn btn-primary btn-wide" onclick="closeWarningModal()">Jag förstår</button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', warningHtml);
}

function closeWarningModal() {
  const backdrop = document.getElementById('warningBackdrop');
  if (backdrop) backdrop.remove();
}

function showDeathScreen(resourceName) {
  const deathHtml = `
    <div id="deathBackdrop" class="modal-backdrop show" style="z-index: 100;">
      <div class="modal" style="border-left: 6px solid var(--red); text-align: center;">
        <h3 style="color: var(--red); font-size: 24px;">☠️ DU ÄR DÖD</h3>
        <p style="font-size: 18px; margin: 16px 0;">
          Din <strong>${resourceName}</strong> tog slut. Du dog.
        </p>
        <p style="color: var(--muted); margin-bottom: 20px;">
          Spelet är över för dig eftersom en viktig resurs nådde noll.
        </p>
        <button class="btn btn-primary btn-wide" onclick="goToResult()">Till resultat</button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', deathHtml);
}

function goToResult() {
  const backdrop = document.getElementById('deathBackdrop');
  if (backdrop) backdrop.remove();
  finishGame();
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

  const itemBonus = Object.values(state.items).reduce((sum, value) => sum + value, 0) * 5;
  const survivalBonus = state.round >= scenarios.length ? 25 : 0;
  const trustBonus = state.trust >= 75 ? 20 : 0;
  const balanceBonus = Math.min(state.water, state.food, state.health) >= 50 ? 15 : 0;

  return clamp(average + itemBonus + survivalBonus + trustBonus + balanceBonus);
}

function getPlayerProfile() {
  let personality = "";
  let strengths = [];
  let weaknesses = [];
  let focusAreas = [];

  if (state.trust >= 70) {
    strengths.push("Utmärkt grannsamverkan");
    personality = "Du är en samarbetsbar person som bygger gemenskapens styrka.";
  } else if (state.trust < 30) {
    weaknesses.push("Svag grannsamverkan");
    personality = "Du fokuserade på att skydda dig själv framför gemensam robusthet.";
  }

  if (state.health >= 70) {
    strengths.push("Stark hälsa och säkerhet");
  } else if (state.health < 40) {
    weaknesses.push("Svag hälsomarginal");
  }

  if (state.knowledge >= 70) {
    strengths.push("Utmärkt informationskontroll");
    focusAreas.push("Du prioriterade verifierad information");
  } else if (state.knowledge < 30) {
    weaknesses.push("Dålig källkritik");
  }

  if (state.water >= 60) {
    strengths.push("Väl säkrad vattenförsörjning");
    focusAreas.push("Du planerade vattenreserven tidigt");
  }

  if (state.food >= 60) {
    strengths.push("Stabil matreserv");
  }

  if (state.energy >= 60) {
    strengths.push("Bra energiberedskap");
  }

  const hasItems = Object.values(state.items).reduce((sum, v) => sum + v, 0);
  const itemNames = [];
  if (state.items.waterCans > 0) itemNames.push("vattendunkar");
  if (state.items.foodBox > 0) itemNames.push("matlåda");
  if (state.items.powerbank > 0) itemNames.push("powerbank");
  if (state.items.radio > 0) itemNames.push("batteriradio");
  if (state.items.firstAid > 0) itemNames.push("första hjälpen");
  if (state.items.neighborList > 0) itemNames.push("kontaktlista");

  if (!personality) {
    if (state.round >= 12) {
      personality = "Du är en balanserad beslutsfattare som klarade alla utmaningar.";
    } else {
      personality = "Du är en försiktig planeringsperson som tog snabba beslut.";
    }
  }

  return {
    personality,
    strengths: strengths.length > 0 ? strengths : ["Grundläggande överlevnad"],
    weaknesses: weaknesses.length > 0 ? weaknesses : [],
    focusAreas: focusAreas.length > 0 ? focusAreas : ["Du fokuserade på överlevnad"],
    items: itemNames.length > 0 ? itemNames : [],
    survived: !isGameOver()
  };
}

function finishGame() {
  stopTimer();
  
  const score = calculateScore();
  const profile = getPlayerProfile();

  showScreen("resultScreen");

  $("scoreValue").textContent = score;

  let title = "Krisen är över";
  let subtitle = "Du tog dig igenom 72 timmar.";
  let text = "";

  if (isGameOver()) {
    title = "💀 Du överlevde inte krisen";
    subtitle = "En kritisk resurs nådde noll.";
    text =
      "Du fattade några bra beslut, men en central del av beredskapen blev för svag. Testa igen och balansera hushållets behov med grannskapets samverkan.";
  } else if (score >= 90) {
    text =
      "🏆 MERITERAD! Du är en krisherald. Du kombinerade perfekt egen beredskap, källkritik och lokal samordning. Ditt hushåll och grannskapet är säkra.";
  } else if (score >= 75) {
    text =
      "✨ Utmärkt. Du kombinerade egen beredskap och lokal samordning väl. Ditt hushåll klarade sig, och du stärkte grannskapets robusthet.";
  } else if (score >= 60) {
    text =
      "👍 Bra. Du klarade krisen, men vissa resurser blev pressade. Nästa gång kan du förbättra balansen mellan vatten, energi och tillit.";
  } else if (score >= 40) {
    text =
      "⚠️ Du överlevde, men med låg marginal. Spelet visar att krisberedskap kräver både resurser, planering och samarbete.";
  } else {
    text =
      "😰 Du överlevde knappt. Du behöver fundera på bättre planering och balans mellan dina resurser.";
  }

  $("resultTitle").textContent = title;
  $("resultSubtitle").textContent = subtitle;
  $("scoreText").textContent = text;

  renderProfile(profile);
  renderLessons();
  renderLog();
}

function renderProfile(profile) {
  let profileHtml = `
    <div class="result-card">
      <h3>Din krishandling profil</h3>
      <p style="font-style: italic; color: var(--navy); margin-bottom: 12px;">
        "${profile.personality}"
      </p>
      
      ${profile.strengths.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <strong style="color: var(--green);">Din styrka:</strong>
          <ul style="margin: 6px 0; padding-left: 20px;">
            ${profile.strengths.map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
      
      ${profile.weaknesses.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <strong style="color: var(--red);">Att förbättra:</strong>
          <ul style="margin: 6px 0; padding-left: 20px;">
            ${profile.weaknesses.map(w => `<li>${w}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
      
      ${profile.focusAreas.length > 0 ? `
        <div style="margin-bottom: 14px;">
          <strong>Du fokuserade på:</strong>
          <ul style="margin: 6px 0; padding-left: 20px;">
            ${profile.focusAreas.map(f => `<li>${f}</li>`).join("")}
          </ul>
        </div>
      ` : ""}
      
      ${profile.items.length > 0 ? `
        <div>
          <strong>Resurser du hade kvar:</strong>
          <p style="color: var(--muted); margin: 6px 0;">${profile.items.join(", ")}</p>
        </div>
      ` : `<div><strong>Resurser:</strong> <p style="color: var(--muted);">Du hade inga resurser kvar</p></div>`}
    </div>
  `;
  
  const resultCards = document.querySelectorAll('.result-card');
  if (resultCards.length > 0) {
    resultCards[0].insertAdjacentHTML('beforebegin', profileHtml);
  }
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
$("startGameBtn").addEventListener("click", startGameFromSetup);
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

  
   

