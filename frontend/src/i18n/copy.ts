// All words shown to people live here, in English and Hindi. The Hindi is a first draft
// that a native reader should check before it goes in front of users.

export interface Copy {
  htmlLang: string
  speechLang: string
  nav: { myPlan: string; whatIf: string; compare: string; tradeoffs: string }
  listen: string
  households: Record<string, string>
  shell: { sample: string; assumptions: string }
  footer: { example: string; scope: string; legal: string }
  common: {
    back: string
    stepOf: (step: number) => string
    moneyIn: string
    moneyOut: string
    dreams: string
    loading: string
    offline: string
    retry: string
    tryAgain: string
  }
  home: {
    title: string
    subtitle: string
    forFamily: (name: string) => string
    heroTitle: string
    heroBody: string
    start: string
    steps: string
    stepIn: string
    stepOut: string
    stepDreams: string
  }
  income: {
    title: string
    subtitle: string
    arjun: string
    meera: string
    hintWork: string
    hintUsual: string
    together: string
    exampleNote: (name: string) => string
    noBank: string
    next: string
  }
  spending: {
    title: string
    subtitle: string
    food: string
    school: string
    loan: string
    other: string
    totalOut: string
    inMinusOut: (income: string, out: string) => string
    left: (amount: string) => string
    short: (amount: string) => string
    leftNote: string
    next: string
  }
  dreamsSetup: {
    title: string
    subtitle: string
    priority: (rank: number) => string
    moveUp: string
    moveDown: string
    moneyNeeded: string
    neededBy: string
    alreadySaved: (amount: string) => string
    alreadyFull: string
    sharedTitle: (amount: string) => string
    sharedBody: (need: string) => string
    tooMuch: (need: string) => string
    planStarts: (month: string) => string
    showPlan: string
    decrease: string
    increase: string
  }
  goalNames: Record<string, string>
  status: {
    onTime: string
    late: (months: number) => string
    notReachable: string
    readyNow: string
    readyBy: (month: string) => string
    needed: (month: string) => string
    paused: string
    perMonth: (amount: string) => string
    savedGrow: (amount: string) => string
  }
  plan: {
    title: string
    subtitle: (family: string, month: string) => string
    tileIn: string
    tileOut: string
    tileLeft: string
    yourFour: string
    dashed: string
    chartTitle: string
    living: string
    barsNote: (income: string) => string
    oneMonth: string
    oneMonthBody: string
    noGrowth: string
    whatIf: string
    change: string
    lab: string
    labBody: string
    assumptions: string
  }
  verdict: {
    allOnTime: string
    allOnTimeBody: string
    stillOnTime: string
    stillOnTimeBody: string
    oneLateTitle: (goal: string, months: number | null) => string
    oneLateBody: (others: number) => string
    manyLateTitle: (count: number) => string
    manyLateBody: string
    deficitTitle: string
    deficitBody: (amount: string) => string
  }
  whatIf: {
    title: string
    chooseOne: string
    normal: string
    noIncome: string
    expense: string
    headingNoIncome: string
    headingExpense: string
    subNoIncome: (range: string) => string
    subExpense: (month: string) => string
    shortBy: (amount: string) => string
    usualTitle: string
    usualBody: (left: string) => string
    noIncomeTitle: string
    noIncomeUse: (out: string, months: number, total: string) => string
    noIncomeStop: string
    noIncomeBack: (month: string, income: string, out: string, left: string) => string
    refill: (month: string) => string
    expenseTitle: (amount: string) => string
    expenseUse: (used: string) => string
    expenseSame: string
    smallestFix: (text: string) => string
    tryNoIncome: string
    tryExpense: string
    backToPlan: string
    whatCanIDo: string
    fixKept: (text: string) => string
    undoFix: string
  }
  fixes: {
    title: string
    subtitle: (after: string) => string
    startSmall: string
    startSmallBody: (text: string) => string
    smallest: string
    another: string
    extraTitle: (amount: string) => string
    extraLine: string
    extraSpend: (spending: string) => string
    delayTitle: (months: number) => string
    delayLine: (goal: string) => string
    delayNew: (month: string) => string
    reduceTitle: (percent: number) => string
    reduceLine: (goal: string) => string
    reduceNew: (amount: string) => string
    verified: string
    backOnTime: (goals: string) => string
    stillLate: (goals: string) => string
    doThis: string
    careful: string
    compareSmallest: string
    nothingToFix: string
    nothingToFixBody: string
    noSingle: string
    summary: (lever: 'extra_savings' | 'delay_goal' | 'reduce_target', amount: string) => string
  }
  compare: {
    title: string
    subtitle: (after: string) => string
    same: (change: string) => string
    baseline: (after: string) => string
    keepAsIs: string
    selected: string
    spendLess: string
    waitLonger: string
    aimLower: string
    eachMonth: string
    moneyIn: string
    moneyOut: string
    leftForJars: string
    noChange: string
    changeLine: (text: string) => string
    keep: string
    backToFixes: string
    onTime: string
    lateBy: (months: number) => string
  }
  tradeoffs: {
    title: string
    subtitle: string
    sample: string
    live: string
    leftEachMonth: (amount: string) => string
    goalCount: (count: number) => string
    situation: (name: string) => string
    pickTitle: string
    rank: (rank: number) => string
    firstNow: string
    pickPrompt: string
    sameAsNow: string
    timelineTitle: string
    timelineNote: string
    legendTarget: string
    legendNow: string
    legendIfFirst: string
    laneNow: (status: string) => string
    laneIfFirst: (status: string) => string
    movedLater: string
    movedEarlier: string
    impactTitle: string
    broughtOnTime: string
    newlyLate: string
    longer: string
    shorter: string
    unchanged: string
    nothing: string
    byMonths: (months: number) => string
    totalsTitle: string
    totalsNow: string
    totalsIfFirst: string
    goalsLate: string
    totalDelay: string
    shortfall: string
    same: string
    months: (count: number) => string
    receiptTitle: string
    receiptOpening: (goal: string) => string
    receiptOnTime: (goals: string) => string
    receiptNewlyLate: (goals: string) => string
    receiptLonger: (goals: string) => string
    receiptShorter: (goals: string) => string
    receiptNoChange: string
    howTitle: string
    howSteps: string[]
    howOrderNow: (order: string) => string
    howOrderIfFirst: (order: string) => string
    assumptionsTitle: string
    asOf: (month: string) => string
    inflation: (rate: string) => string
    returns: (rate: string) => string
    noGrowthNote: string
    use: string
    confirmTitle: (order: string) => string
    confirmBody: string
    confirm: string
    cancel: string
    reset: string
    repair: string
    backToPlan: string
    undoNote: string
    undo: string
    unavailable: string
  }
}

const en: Copy = {
  htmlLang: 'en',
  speechLang: 'en-IN',
  nav: { myPlan: 'My plan', whatIf: 'What if', compare: 'Compare', tradeoffs: 'Who goes first' },
  listen: 'Listen',
  households: { household: 'Arjun & Meera', family_stretched: 'Ravi & Sunita' },
  shell: { sample: 'Sample household', assumptions: 'Assumptions' },
  footer: {
    example: 'An example, with no interest or growth assumed.',
    scope: 'A helper for your decisions. It does not predict markets or replace your bank or adviser.',
    legal: 'Illustrative tool, not investment advice.',
  },
  common: {
    back: 'Back',
    stepOf: (step) => `Step ${step} of 3`,
    moneyIn: 'Money in',
    moneyOut: 'Money out',
    dreams: 'Dreams',
    loading: 'Working it out…',
    offline: 'We could not reach the calculator. Check your connection and try again.',
    retry: 'Try again',
    tryAgain: 'Something went wrong. Try again.',
  },
  home: {
    title: 'A little planning. A brighter tomorrow.',
    subtitle: 'Your family. Your money. Your dreams.',
    forFamily: (name) => `For ${name}`,
    heroTitle: 'Make room for what matters.',
    heroBody: 'See what comes in, what goes out, and how your dreams fill up.',
    start: 'Start',
    steps: '3 simple steps. Keep your monthly amounts ready.',
    stepIn: 'Money in',
    stepOut: 'Money out',
    stepDreams: 'Your dreams',
  },
  income: {
    title: 'What comes in each month?',
    subtitle: 'Add the money your family usually receives.',
    arjun: 'Arjun’s income',
    meera: 'Meera’s income',
    hintWork: 'Salary, work or business',
    hintUsual: 'Use a usual month, not your best month.',
    together: 'Together, each month',
    exampleNote: (name) => `An example for ${name}. You can change any amount.`,
    noBank: 'No bank details needed. Just the monthly amount.',
    next: 'Next: money out',
  },
  spending: {
    title: 'What goes out each month?',
    subtitle: 'Count the things your family pays for.',
    food: 'Food, home & bills',
    school: 'School & travel',
    loan: 'Loan payments',
    other: 'Other spending',
    totalOut: 'Total going out',
    inMinusOut: (income, out) => `${income} in − ${out} out`,
    left: (amount) => `${amount} left`,
    short: (amount) => `${amount} short`,
    leftNote: 'This is the money we can put towards your dreams.',
    next: 'Next: choose dreams',
  },
  dreamsSetup: {
    title: 'Which dreams come first?',
    subtitle: 'All four chosen. Move the most important one up.',
    priority: (rank) => `Priority ${rank}`,
    moveUp: 'Move up',
    moveDown: 'Move down',
    moneyNeeded: 'Money needed',
    neededBy: 'Needed by',
    alreadySaved: (amount) => `Already saved: ${amount}`,
    alreadyFull: 'Already full',
    sharedTitle: (amount) => `${amount} shared between your dreams`,
    sharedBody: (need) => `Your dreams need about ${need} a month at the latest.`,
    tooMuch: (need) =>
      `Your dreams need about ${need} a month. That is more than you have left, so some dreams will wait.`,
    planStarts: (month) =>
      `Planning starts ${month}. Existing savings are separate from monthly income.`,
    showPlan: 'Show my plan',
    decrease: 'Less',
    increase: 'More',
  },
  goalNames: {
    emergency_fund: 'Emergency money',
    home: 'Home',
    education: 'Children’s education',
    retirement: 'Old age',
    loan_payoff: 'Loan payoff',
  },
  status: {
    onTime: 'On time',
    late: (months) => (months === 1 ? '1 month late' : `${months} months late`),
    notReachable: 'Not reachable',
    readyNow: 'Ready now',
    readyBy: (month) => `Ready by ${month}`,
    needed: (month) => `Needed: ${month}`,
    paused: 'Paused for now',
    perMonth: (amount) => `${amount} / month`,
    savedGrow: (amount) => `${amount} saved • grow your cushion`,
  },
  plan: {
    title: 'Your dreams have a place.',
    subtitle: (family, month) => `${family}’s plan • starting ${month}`,
    tileIn: 'In',
    tileOut: 'Out',
    tileLeft: 'Left',
    yourFour: 'Your four dreams',
    dashed: 'Dashed line = money needed by the target date',
    chartTitle: 'Each month’s money',
    living: 'Living costs',
    barsNote: (income) => `Total in ${income} • every rupee has a place`,
    oneMonth: 'One month at a time.',
    oneMonthBody: 'Each month, the money left goes into the jars, most important dream first.',
    noGrowth: 'Dates use your saved money and monthly amounts, with no growth added.',
    whatIf: 'What if life changes?',
    change: 'Change my amounts',
    lab: 'Which goal gets protected first?',
    labBody: 'See what happens to every goal when a different one goes first, before you change anything.',
    assumptions: 'Dates use no growth or inflation unless the plan says so. Open a comparison to see the assumptions used.',
  },
  verdict: {
    allOnTime: 'You’re on time.',
    allOnTimeBody: 'All four dreams fit your monthly money.',
    stillOnTime: 'Still on time.',
    stillOnTimeBody: 'Even with this change, every dream stays on time.',
    oneLateTitle: (goal, months) =>
      months === null ? `${goal} is out of reach.` : `${goal} waits ${months} months.`,
    oneLateBody: (others) =>
      others > 0
        ? `The other ${others} jars stay on time.`
        : 'Your savings are used first, starting with emergency money.',
    manyLateTitle: (count) => `${count} dreams run late.`,
    manyLateBody: 'Your savings are used first, starting with emergency money.',
    deficitTitle: 'Your savings run out.',
    deficitBody: (amount) => `${amount} could not be covered. A smaller change would help.`,
  },
  whatIf: {
    title: 'What if life changes?',
    chooseOne: 'Choose one situation. See what changes.',
    normal: 'Everything normal',
    noIncome: 'No income for 6 months',
    expense: 'Sudden big expense',
    headingNoIncome: 'Six months without income.',
    headingExpense: 'A sudden big expense.',
    subNoIncome: (range) => `A separate example • ${range}`,
    subExpense: (month) => `A separate example • a home repair in ${month}`,
    shortBy: (amount) => `${amount} short each month, paid from savings`,
    usualTitle: 'Your usual month',
    usualBody: (left) => `${left} goes into the jars each month. No missed income. No extra expense.`,
    noIncomeTitle: 'The safety jar does its job.',
    noIncomeUse: (out, months, total) => `${out} × ${months} months = ${total} from savings.`,
    noIncomeStop: 'No new money goes into any jar while income stops.',
    noIncomeBack: (month, income, out, left) =>
      `From ${month}: income returns to ${income}, spending ${out}, saving ${left}.`,
    refill: (month) => `Emergency money is full again by ${month}.`,
    expenseTitle: (amount) => `${amount} for a home repair`,
    expenseUse: (used) => `Paid from savings: ${used} from the emergency jar first.`,
    expenseSame: 'Monthly income and spending stay the same.',
    smallestFix: (text) => `Smallest fix: ${text}`,
    tryNoIncome: 'Try no income',
    tryExpense: 'Try a big expense',
    backToPlan: 'Back to my plan',
    whatCanIDo: 'What can I do?',
    fixKept: (text) => `Fix kept: ${text}`,
    undoFix: 'Undo',
  },
  fixes: {
    title: 'Bring your dreams back on time.',
    subtitle: (after) => `After ${after} • smallest change first`,
    startSmall: 'Start with the smallest change.',
    startSmallBody: (text) => `${text} is enough to bring everything back on time.`,
    smallest: 'Smallest change',
    another: 'Another way',
    extraTitle: (amount) => amount,
    extraLine: 'less spending each month',
    extraSpend: (spending) => `Spending becomes ${spending}.`,
    delayTitle: (months) => (months === 1 ? '1 month' : `${months} months`),
    delayLine: (goal) => `wait longer for ${goal}`,
    delayNew: (month) => `New date: ${month}`,
    reduceTitle: (percent) => `${percent}%`,
    reduceLine: (goal) => `aim lower for ${goal}`,
    reduceNew: (amount) => `New target: ${amount}`,
    verified: 'Checked: with this change, every dream is on time.',
    backOnTime: (goals) => `Back on time: ${goals}`,
    stillLate: (goals) => `Still late: ${goals}`,
    doThis: 'Do this',
    careful: 'Only choose a change your family can manage. Food, bills, school and loan payments stay unchanged.',
    compareSmallest: 'Compare smallest change',
    nothingToFix: 'Nothing to fix.',
    nothingToFixBody: 'Every dream is on time as it is.',
    noSingle: 'No single change fixes every dream within the limits you set.',
    summary: (lever, amount) =>
      lever === 'extra_savings'
        ? `${amount} less spending a month`
        : lever === 'delay_goal'
          ? `Waiting ${amount} longer`
          : `Aiming ${amount} lower`,
  },
  compare: {
    title: 'A small change. A clear difference.',
    subtitle: (after) => `Compare after ${after}.`,
    same: (change) => `Same dreams. Same income. ${change}`,
    baseline: (after) => `Baseline • after ${after}`,
    keepAsIs: 'Keep things as they are',
    selected: 'Selected • smallest fix',
    spendLess: 'Spend a little less',
    waitLonger: 'Wait a little longer',
    aimLower: 'Aim a little lower',
    eachMonth: 'Each month',
    moneyIn: 'Money in',
    moneyOut: 'Money out',
    leftForJars: 'Left for jars',
    noChange: 'No monthly change.',
    changeLine: (text) => text,
    keep: 'Keep the smallest fix',
    backToFixes: 'Back to fixes',
    onTime: 'On time',
    lateBy: (months) => (months === 1 ? '1 month late' : `${months} months late`),
  },
  tradeoffs: {
    title: 'Every goal matters. Which one gets protected first?',
    subtitle: 'Try an order and see what happens to every goal. Nothing changes until you choose to use it.',
    sample: 'Sample household • illustrative',
    live: 'Worked out by the ArthaYukti engine',
    leftEachMonth: (amount) => `${amount} left each month for goals`,
    goalCount: (count) => `${count} goals`,
    situation: (name) => `Situation: ${name}`,
    pickTitle: 'Put this goal first',
    rank: (rank) => `Now #${rank}`,
    firstNow: 'First now',
    pickPrompt: 'Choose a goal to see what changes.',
    sameAsNow: 'This is the order you have now, so nothing changes.',
    timelineTitle: 'Goal ripple timeline',
    timelineNote:
      'Each line is one goal. Markers show when the goal is reached today and when it would be reached with the chosen goal first.',
    legendTarget: 'Target date',
    legendNow: 'Now',
    legendIfFirst: 'If first',
    laneNow: (status) => `Now: ${status}`,
    laneIfFirst: (status) => `If first: ${status}`,
    movedLater: 'Moves later',
    movedEarlier: 'Moves earlier',
    impactTitle: 'What changes',
    broughtOnTime: 'Brought on time',
    newlyLate: 'Newly late',
    longer: 'Waits longer',
    shorter: 'Waits less',
    unchanged: 'No change',
    nothing: 'None',
    byMonths: (months) => (months === 1 ? 'by 1 month' : `by ${months} months`),
    totalsTitle: 'Totals from the engine',
    totalsNow: 'Now',
    totalsIfFirst: 'If first',
    goalsLate: 'Goals late',
    totalDelay: 'Total delay',
    shortfall: 'Short at deadlines (today’s money)',
    same: 'Same',
    months: (count) => (count === 1 ? '1 month' : `${count} months`),
    receiptTitle: 'In plain words',
    receiptOpening: (goal) => `Putting ${goal} first:`,
    receiptOnTime: (goals) => `${goals} comes on time.`,
    receiptNewlyLate: (goals) => `Newly late: ${goals}.`,
    receiptLonger: (goals) => `Waits longer: ${goals}.`,
    receiptShorter: (goals) => `Waits less: ${goals}.`,
    receiptNoChange: 'No goal changes.',
    howTitle: 'How this was calculated',
    howSteps: [
      'The chosen goal moves to the front. The other goals keep their order.',
      'Each month, the money left after spending goes to goals in that order, so each goal is ready by its target date if the money allows.',
      'Whatever a goal cannot get in time becomes its delay and its shortfall.',
      'The engine runs the whole plan again for every order. Nothing here is estimated on this screen.',
    ],
    howOrderNow: (order) => `Order now: ${order}`,
    howOrderIfFirst: (order) => `Order if first: ${order}`,
    assumptionsTitle: 'Assumptions used',
    asOf: (month) => `Planning starts ${month}`,
    inflation: (rate) => `Inflation: ${rate} a year`,
    returns: (rate) => `Return on savings: ${rate} a year`,
    noGrowthNote: 'Amounts are in rupees. Delays are in months.',
    use: 'Use this order',
    confirmTitle: (order) => `Change your priorities to ${order}?`,
    confirmBody: 'You can undo this from My plan.',
    confirm: 'Yes, use this order',
    cancel: 'Not now',
    reset: 'Reset comparison',
    repair: 'Find the smallest repair',
    backToPlan: 'Back to my plan',
    undoNote: 'Your priority order was changed.',
    undo: 'Undo',
    unavailable: 'The order calculator is not available yet. Please try again later.',
  },
}

const hi: Copy = {
  htmlLang: 'hi',
  speechLang: 'hi-IN',
  nav: { myPlan: 'मेरी योजना', whatIf: 'अगर ऐसा हो', compare: 'तुलना करें', tradeoffs: 'किसे पहले?' },
  listen: 'सुनें',
  households: { household: 'अर्जुन और मीरा', family_stretched: 'रवि और सुनीता' },
  shell: { sample: 'नमूना परिवार', assumptions: 'मान्यताएँ' },
  footer: {
    example: 'बिना ब्याज या बढ़त का उदाहरण।',
    scope: 'यह आपके फ़ैसलों में मदद करता है। यह बाज़ार का अनुमान नहीं लगाता और आपके बैंक या सलाहकार की जगह नहीं लेता।',
    legal: 'सिर्फ़ समझने के लिए, निवेश की सलाह नहीं।',
  },
  common: {
    back: 'पीछे',
    stepOf: (step) => `कदम ${step} / 3`,
    moneyIn: 'आमदनी',
    moneyOut: 'खर्च',
    dreams: 'सपने',
    loading: 'हिसाब लगा रहे हैं…',
    offline: 'कैलकुलेटर तक नहीं पहुँच पाए। इंटरनेट देखकर फिर कोशिश करें।',
    retry: 'फिर कोशिश करें',
    tryAgain: 'कुछ गड़बड़ हो गई। फिर कोशिश करें।',
  },
  home: {
    title: 'थोड़ी योजना, बेहतर कल।',
    subtitle: 'आपका परिवार। आपका पैसा। आपके सपने।',
    forFamily: (name) => `${name} के लिए`,
    heroTitle: 'जो ज़रूरी है, उसके लिए जगह बनाइए।',
    heroBody: 'देखिए कितना आता है, कितना जाता है, और आपके सपने कैसे भरते हैं।',
    start: 'शुरू करें',
    steps: '3 आसान कदम। अपनी महीने की रकम तैयार रखें।',
    stepIn: 'आमदनी',
    stepOut: 'खर्च',
    stepDreams: 'आपके सपने',
  },
  income: {
    title: 'हर महीने कितना आता है?',
    subtitle: 'वह पैसा जोड़िए जो आपके परिवार को आमतौर पर मिलता है।',
    arjun: 'अर्जुन की आमदनी',
    meera: 'मीरा की आमदनी',
    hintWork: 'नौकरी, काम या दुकान',
    hintUsual: 'आम महीना लें, सबसे अच्छा महीना नहीं।',
    together: 'दोनों मिलाकर, हर महीने',
    exampleNote: (name) => `यह ${name} का उदाहरण है। आप कोई भी रकम बदल सकते हैं।`,
    noBank: 'बैंक की जानकारी नहीं चाहिए। बस महीने की रकम।',
    next: 'आगे: खर्च',
  },
  spending: {
    title: 'हर महीने कितना जाता है?',
    subtitle: 'जिन चीज़ों पर परिवार खर्च करता है, उन्हें गिनिए।',
    food: 'खाना, घर और बिल',
    school: 'स्कूल और सफ़र',
    loan: 'कर्ज़ की किस्तें',
    other: 'दूसरे खर्च',
    totalOut: 'कुल खर्च',
    inMinusOut: (income, out) => `${income} आमदनी − ${out} खर्च`,
    left: (amount) => `${amount} बचे`,
    short: (amount) => `${amount} कम पड़ा`,
    leftNote: 'यह वह पैसा है जो आपके सपनों में लग सकता है।',
    next: 'आगे: सपने चुनिए',
  },
  dreamsSetup: {
    title: 'कौन से सपने पहले?',
    subtitle: 'चारों चुने जा चुके हैं। सबसे ज़रूरी को ऊपर ले जाइए।',
    priority: (rank) => `प्राथमिकता ${rank}`,
    moveUp: 'ऊपर करें',
    moveDown: 'नीचे करें',
    moneyNeeded: 'ज़रूरी रकम',
    neededBy: 'कब तक चाहिए',
    alreadySaved: (amount) => `पहले से जमा: ${amount}`,
    alreadyFull: 'पहले से पूरा',
    sharedTitle: (amount) => `${amount} आपके सपनों में बाँटे जाएँगे`,
    sharedBody: (need) => `आपके सपनों को कम से कम हर महीने लगभग ${need} चाहिए।`,
    tooMuch: (need) =>
      `आपके सपनों को हर महीने लगभग ${need} चाहिए। यह बचे पैसे से ज़्यादा है, इसलिए कुछ सपने इंतज़ार करेंगे।`,
    planStarts: (month) =>
      `योजना ${month} से शुरू होती है। मौजूदा बचत महीने की आमदनी से अलग है।`,
    showPlan: 'मेरी योजना दिखाइए',
    decrease: 'कम',
    increase: 'ज़्यादा',
  },
  goalNames: {
    emergency_fund: 'आपातकालीन पैसा',
    home: 'घर',
    education: 'बच्चों की पढ़ाई',
    retirement: 'बुढ़ापा',
    loan_payoff: 'कर्ज़ चुकाना',
  },
  status: {
    onTime: 'समय पर',
    late: (months) => `${months} महीने देर`,
    notReachable: 'पहुँच से बाहर',
    readyNow: 'अभी तैयार',
    readyBy: (month) => `${month} तक तैयार`,
    needed: (month) => `ज़रूरत: ${month}`,
    paused: 'अभी रुका है',
    perMonth: (amount) => `${amount} / महीना`,
    savedGrow: (amount) => `अभी ${amount} • सुरक्षा बढ़ाएँ`,
  },
  plan: {
    title: 'आपके सपनों की योजना',
    subtitle: (family, month) => `${family} • शुरुआत ${month}`,
    tileIn: 'आमदनी',
    tileOut: 'खर्च',
    tileLeft: 'बचा',
    yourFour: 'आपके चार सपने',
    dashed: 'टूटी रेखा = तय तारीख तक ज़रूरत',
    chartTitle: 'हर महीने का पैसा',
    living: 'खर्च',
    barsNote: (income) => `कुल आमदनी ${income} • पूरा पैसा बाँटा गया`,
    oneMonth: 'हर महीने, थोड़ा आगे।',
    oneMonthBody: 'हर महीने जो पैसा बचता है, वह सबसे ज़रूरी सपने से शुरू करके मटकों में जाता है।',
    noGrowth: 'तारीखें आपकी बचत और हर महीने की रकम पर आधारित हैं। ब्याज नहीं जोड़ा गया है।',
    whatIf: 'अगर कुछ बदल जाए?',
    change: 'रकम बदलें',
    lab: 'पहले किस लक्ष्य को बचाएँ?',
    labBody: 'कुछ बदलने से पहले देखें कि कोई दूसरा लक्ष्य पहले आने पर हर लक्ष्य का क्या होता है।',
    assumptions: 'जब तक योजना न कहे, तारीखों में बढ़त या महँगाई नहीं जोड़ी गई है। इस्तेमाल की गई मान्यताएँ तुलना में देखें।',
  },
  verdict: {
    allOnTime: 'सपने समय पर पूरे होंगे।',
    allOnTimeBody: 'चारों सपनों के लिए हर महीने पैसा है।',
    stillOnTime: 'अब भी समय पर।',
    stillOnTimeBody: 'इस बदलाव के बाद भी हर सपना समय पर रहेगा।',
    oneLateTitle: (goal, months) =>
      months === null ? `${goal} पहुँच से बाहर है।` : `${goal} ${months} महीने रुकेगा।`,
    oneLateBody: (others) =>
      others > 0
        ? `बाक़ी ${others} मटके समय पर रहेंगे।`
        : 'आपकी बचत पहले काम आती है, सबसे पहले आपातकालीन पैसा।',
    manyLateTitle: (count) => `${count} सपने देर से पूरे होंगे।`,
    manyLateBody: 'आपकी बचत पहले काम आती है, सबसे पहले आपातकालीन पैसा।',
    deficitTitle: 'आपकी बचत खत्म हो जाएगी।',
    deficitBody: (amount) => `${amount} पूरे नहीं हो पाए। थोड़ा बदलाव मदद करेगा।`,
  },
  whatIf: {
    title: 'अगर कुछ बदल जाए?',
    chooseOne: 'एक स्थिति चुनिए। देखिए क्या बदलता है।',
    normal: 'सब कुछ सामान्य',
    noIncome: '6 महीने कोई आमदनी नहीं',
    expense: 'अचानक बड़ा खर्च',
    headingNoIncome: 'छह महीने बिना आमदनी।',
    headingExpense: 'अचानक बड़ा खर्च।',
    subNoIncome: (range) => `एक अलग उदाहरण • ${range}`,
    subExpense: (month) => `एक अलग उदाहरण • ${month} में घर की मरम्मत`,
    shortBy: (amount) => `हर महीने ${amount} कम पड़ा, बचत से भरा गया`,
    usualTitle: 'आपका आम महीना',
    usualBody: (left) => `हर महीने ${left} मटकों में जाते हैं। कोई आमदनी नहीं रुकी। कोई अतिरिक्त खर्च नहीं।`,
    noIncomeTitle: 'सुरक्षा मटका अपना काम करता है।',
    noIncomeUse: (out, months, total) => `${out} × ${months} महीने = बचत से ${total}।`,
    noIncomeStop: 'आमदनी रुकने पर किसी मटके में नया पैसा नहीं जाता।',
    noIncomeBack: (month, income, out, left) =>
      `${month} से: आमदनी फिर ${income}, खर्च ${out}, बचत ${left}।`,
    refill: (month) => `आपातकालीन पैसा ${month} तक फिर भर जाता है।`,
    expenseTitle: (amount) => `घर की मरम्मत के लिए ${amount}`,
    expenseUse: (used) => `बचत से भरा गया: पहले आपातकालीन मटके से ${used}।`,
    expenseSame: 'महीने की आमदनी और खर्च वही रहते हैं।',
    smallestFix: (text) => `सबसे छोटा उपाय: ${text}`,
    tryNoIncome: 'बिना आमदनी आज़माएँ',
    tryExpense: 'बड़ा खर्च आज़माएँ',
    backToPlan: 'मेरी योजना पर वापस',
    whatCanIDo: 'मैं क्या कर सकता हूँ?',
    fixKept: (text) => `उपाय रखा गया: ${text}`,
    undoFix: 'वापस लें',
  },
  fixes: {
    title: 'अपने सपनों को फिर समय पर लाइए।',
    subtitle: (after) => `${after} के बाद • सबसे छोटा बदलाव पहले`,
    startSmall: 'सबसे छोटे बदलाव से शुरू करें।',
    startSmallBody: (text) => `${text} काफ़ी है, सब कुछ फिर समय पर आ जाएगा।`,
    smallest: 'सबसे छोटा बदलाव',
    another: 'एक और तरीका',
    extraTitle: (amount) => amount,
    extraLine: 'हर महीने कम खर्च',
    extraSpend: (spending) => `खर्च ${spending} हो जाएगा।`,
    delayTitle: (months) => `${months} महीने`,
    delayLine: (goal) => `${goal} के लिए और इंतज़ार`,
    delayNew: (month) => `नई तारीख: ${month}`,
    reduceTitle: (percent) => `${percent}%`,
    reduceLine: (goal) => `${goal} का लक्ष्य थोड़ा कम`,
    reduceNew: (amount) => `नया लक्ष्य: ${amount}`,
    verified: 'जाँच लिया: इस बदलाव से हर सपना समय पर है।',
    backOnTime: (goals) => `फिर समय पर: ${goals}`,
    stillLate: (goals) => `अब भी देर: ${goals}`,
    doThis: 'यह करें',
    careful: 'सिर्फ़ वही बदलाव चुनिए जो आपका परिवार निभा सके। खाना, बिल, स्कूल और कर्ज़ की किस्तें वही रहेंगी।',
    compareSmallest: 'सबसे छोटे बदलाव की तुलना',
    nothingToFix: 'ठीक करने को कुछ नहीं।',
    nothingToFixBody: 'हर सपना जैसा है वैसे ही समय पर है।',
    noSingle: 'आपकी तय सीमा में कोई एक बदलाव हर सपने को ठीक नहीं करता।',
    summary: (lever, amount) =>
      lever === 'extra_savings'
        ? `हर महीने ${amount} कम खर्च`
        : lever === 'delay_goal'
          ? `${amount} और इंतज़ार`
          : `लक्ष्य ${amount} कम`,
  },
  compare: {
    title: 'छोटा बदलाव, साफ़ फ़र्क़।',
    subtitle: (after) => `${after} के बाद की तुलना।`,
    same: (change) => `वही सपने। वही आमदनी। ${change}`,
    baseline: (after) => `अभी जैसा • ${after} के बाद`,
    keepAsIs: 'जैसा है वैसा रहने दें',
    selected: 'चुना हुआ • सबसे छोटा उपाय',
    spendLess: 'थोड़ा कम खर्च करें',
    waitLonger: 'थोड़ा और इंतज़ार करें',
    aimLower: 'लक्ष्य थोड़ा कम करें',
    eachMonth: 'हर महीने',
    moneyIn: 'आमदनी',
    moneyOut: 'खर्च',
    leftForJars: 'मटकों के लिए बचा',
    noChange: 'महीने में कोई बदलाव नहीं।',
    changeLine: (text) => text,
    keep: 'सबसे छोटा उपाय रखें',
    backToFixes: 'उपायों पर वापस',
    onTime: 'समय पर',
    lateBy: (months) => `${months} महीने देर`,
  },
  tradeoffs: {
    title: 'हर लक्ष्य ज़रूरी है। पहले किसे बचाएँ?',
    subtitle: 'कोई क्रम आज़माएँ और देखें हर लक्ष्य पर क्या असर पड़ता है। आप चुनें, तब तक कुछ नहीं बदलता।',
    sample: 'नमूना परिवार • उदाहरण',
    live: 'ArthaYukti इंजन ने निकाला',
    leftEachMonth: (amount) => `हर महीने लक्ष्यों के लिए ${amount} बचते हैं`,
    goalCount: (count) => `${count} लक्ष्य`,
    situation: (name) => `स्थिति: ${name}`,
    pickTitle: 'इस लक्ष्य को पहले रखें',
    rank: (rank) => `अभी #${rank}`,
    firstNow: 'अभी पहला',
    pickPrompt: 'देखने के लिए कोई लक्ष्य चुनें।',
    sameAsNow: 'यही आपका मौजूदा क्रम है, इसलिए कुछ नहीं बदलता।',
    timelineTitle: 'लक्ष्यों का असर: समयरेखा',
    timelineNote:
      'हर रेखा एक लक्ष्य है। निशान बताते हैं कि लक्ष्य आज कब पूरा होगा और चुने हुए लक्ष्य को पहले रखने पर कब।',
    legendTarget: 'तय तारीख',
    legendNow: 'अभी',
    legendIfFirst: 'पहले रखने पर',
    laneNow: (status) => `अभी: ${status}`,
    laneIfFirst: (status) => `पहले रखने पर: ${status}`,
    movedLater: 'देर से',
    movedEarlier: 'जल्दी',
    impactTitle: 'क्या बदलता है',
    broughtOnTime: 'समय पर आया',
    newlyLate: 'नई देरी',
    longer: 'ज़्यादा इंतज़ार',
    shorter: 'कम इंतज़ार',
    unchanged: 'कोई बदलाव नहीं',
    nothing: 'कोई नहीं',
    byMonths: (months) => `${months} महीने`,
    totalsTitle: 'इंजन के कुल आँकड़े',
    totalsNow: 'अभी',
    totalsIfFirst: 'पहले रखने पर',
    goalsLate: 'देर वाले लक्ष्य',
    totalDelay: 'कुल देरी',
    shortfall: 'तय तारीख पर कमी (आज के पैसे में)',
    same: 'बराबर',
    months: (count) => `${count} महीने`,
    receiptTitle: 'सीधी भाषा में',
    receiptOpening: (goal) => `${goal} को पहले रखने पर:`,
    receiptOnTime: (goals) => `${goals} समय पर आ जाता है।`,
    receiptNewlyLate: (goals) => `नई देरी: ${goals}।`,
    receiptLonger: (goals) => `ज़्यादा इंतज़ार: ${goals}।`,
    receiptShorter: (goals) => `कम इंतज़ार: ${goals}।`,
    receiptNoChange: 'किसी लक्ष्य में बदलाव नहीं।',
    howTitle: 'यह कैसे निकाला गया',
    howSteps: [
      'चुना हुआ लक्ष्य सबसे आगे आता है। बाकी लक्ष्य अपने क्रम में रहते हैं।',
      'हर महीने खर्च के बाद बचा पैसा इसी क्रम में लक्ष्यों को जाता है, ताकि पैसा हो तो हर लक्ष्य तय तारीख तक तैयार हो।',
      'जो लक्ष्य समय पर नहीं पा सकता, वही उसकी देरी और कमी बनती है।',
      'इंजन हर क्रम के लिए पूरी योजना फिर से चलाता है। इस स्क्रीन पर कुछ भी अंदाज़े से नहीं निकाला गया।',
    ],
    howOrderNow: (order) => `अभी का क्रम: ${order}`,
    howOrderIfFirst: (order) => `पहले रखने पर क्रम: ${order}`,
    assumptionsTitle: 'इस्तेमाल की गई मान्यताएँ',
    asOf: (month) => `योजना ${month} से शुरू`,
    inflation: (rate) => `महँगाई: ${rate} सालाना`,
    returns: (rate) => `बचत पर कमाई: ${rate} सालाना`,
    noGrowthNote: 'रकम रुपयों में है। देरी महीनों में है।',
    use: 'यह क्रम चुनें',
    confirmTitle: (order) => `प्राथमिकता बदलकर ${order} करें?`,
    confirmBody: 'आप इसे मेरी योजना से वापस कर सकते हैं।',
    confirm: 'हाँ, यह क्रम चुनें',
    cancel: 'अभी नहीं',
    reset: 'तुलना हटाएँ',
    repair: 'सबसे छोटा उपाय खोजें',
    backToPlan: 'मेरी योजना पर वापस',
    undoNote: 'आपकी प्राथमिकता का क्रम बदला गया।',
    undo: 'वापस करें',
    unavailable: 'क्रम वाला कैलकुलेटर अभी उपलब्ध नहीं है। कृपया बाद में फिर कोशिश करें।',
  },
}

export const copy: Record<'en' | 'hi', Copy> = { en, hi }
