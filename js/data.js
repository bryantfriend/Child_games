(function () {
  var app = window.ICTApp = window.ICTApp || {};

  app.data = {
    games: {
      build: { title: "Computer Island", subtitle: "Build, match, and tap.", duration: "8 to 10 minutes" },
      input: { title: "Input Island", subtitle: "Sort, choose, and go fast.", duration: "8 to 10 minutes" },
      output: { title: "Output Island", subtitle: "Name it and choose it.", duration: "8 to 10 minutes" },
      challenge: { title: "Challenge Island", subtitle: "Listen, tap, or wait.", duration: "10 to 12 minutes" },
      onoff: { title: "Lesson 2: Turn It On / Off", subtitle: "Wake, wait, save, and shut down safely.", duration: "35 to 40 minutes" },
      fun: { title: "Fun Zone", subtitle: "Bonus games unlocked!", duration: "Free play" },
    },
    lessonMenu: [
      { id: "lesson1", title: "Lesson 1", subtitle: "ICT Adventure Island", emoji: "🌴" },
      { id: "lesson2", title: "Lesson 2", subtitle: "Turn On / Off", emoji: "🔘" },
      { id: "games", title: "Play Games", subtitle: "Fun Zone Arcade", emoji: "🎮" }
    ],
    buildParts: [
      { id: "monitor", label: "Monitor", asset: "assets/monitor.svg", hint: "Shows pictures", zone: "monitor" },
      { id: "keyboard", label: "Keyboard", asset: "assets/keyboard.svg", hint: "Helps you type", zone: "keyboard" },
      { id: "mouse", label: "Mouse", asset: "assets/mouse.svg", hint: "Moves and clicks", zone: "mouse" },
      { id: "system", label: "Computer", asset: "assets/computer.svg", hint: "Runs the computer", zone: "system" },
    ],
    buildFunctions: [
      { id: "type", label: "Type", emoji: "✍️", target: "keyboard" },
      { id: "see", label: "See", emoji: "👀", target: "monitor" },
      { id: "click", label: "Click", emoji: "👉", target: "mouse" },
      { id: "think", label: "Brain", emoji: "⚙️", target: "system" },
    ],
    buildPrompts: [
      { clue: "Tap the part we use to TYPE.", answer: "keyboard" },
      { clue: "Tap the part that SHOWS the work.", answer: "monitor" },
      { clue: "Tap the part that MOVES the arrow.", answer: "mouse" },
      { clue: "Tap the COMPUTER.", answer: "system" },
      { clue: "Tap the part you usually look AT.", answer: "monitor" },
    ],
    sortDeck: [
      { id: "keyboard", label: "Keyboard", emoji: "⌨️", type: "input" },
      { id: "mouse", label: "Mouse", emoji: "🖱️", type: "input" },
      { id: "microphone", label: "Microphone", emoji: "🎤", type: "input" },
      { id: "webcam", label: "Webcam", emoji: "📷", type: "input" },
      { id: "touchscreen", label: "Touch Screen", emoji: "📱", type: "input" },
      { id: "speaker", label: "Speaker", emoji: "🔊", type: "output" },
      { id: "monitor", label: "Monitor", emoji: "🖥️", type: "output" },
      { id: "printer", label: "Printer", emoji: "🖨️", type: "output" },
      { id: "projector", label: "Projector", emoji: "📽️", type: "output" },
      { id: "headphones", label: "Headphones", emoji: "🎧", type: "output" },
    ],
    inputScenarios: [
      { text: "Voice in?", answer: "input" },
      { text: "Music out?", answer: "output" },
      { text: "Type name?", answer: "input" },
      { text: "See picture?", answer: "output" },
      { text: "Photo in?", answer: "input" },
      { text: "Print page?", answer: "output" },
    ],
    outputQuestions: [
      { item: "Keyboard", emoji: "⌨️", prompt: "What does it do?", correct: "Type", options: ["Type", "Hear", "Sleep"] },
      { item: "Mouse", emoji: "🖱️", prompt: "What does it do?", correct: "Move", options: ["Move", "Print", "Sing"] },
      { item: "Monitor", emoji: "🖥️", prompt: "What does it do?", correct: "See", options: ["See", "Eat", "Jump"] },
      { item: "Speaker", emoji: "🔊", prompt: "What does it do?", correct: "Hear", options: ["Hear", "Type", "Photo"] },
      { item: "Printer", emoji: "🖨️", prompt: "What does it do?", correct: "Print", options: ["Print", "Talk", "Record"] },
      { item: "Microphone", emoji: "🎤", prompt: "What does it do?", correct: "Talk", options: ["Talk", "See", "Dance"] },
      { item: "Webcam", emoji: "📷", prompt: "What does it do?", correct: "Photo", options: ["Photo", "Music", "Move"] },
      { item: "Headphones", emoji: "🎧", prompt: "What does it do?", correct: "Hear", options: ["Hear", "Print", "Food"] },
    ],
    outputScenarios: [
      { text: "Big wall video?", correct: "Projector", options: ["Projector", "Mouse", "Keyboard"] },
      { text: "Hear story?", correct: "Headphones", options: ["Headphones", "Printer", "Webcam"] },
      { text: "Paper page?", correct: "Printer", options: ["Printer", "Speaker", "Microphone"] },
      { text: "See game?", correct: "Monitor", options: ["Monitor", "Mouse", "Microphone"] },
      { text: "Play music?", correct: "Speaker", options: ["Speaker", "Keyboard", "Touch Screen"] },
      { text: "Take class photo?", correct: "Webcam", options: ["Webcam", "Printer", "Speaker"] },
    ],
    challengeRounds: [
      { says: true, prompt: "Teacher says touch the keyboard!", answer: "keyboard" },
      { says: true, prompt: "Teacher says touch something you can SEE!", answer: "monitor" },
      { says: false, prompt: "Touch the mouse!", answer: "wait" },
      { says: true, prompt: "Teacher says touch something that gives SOUND!", answer: "speaker" },
      { says: true, prompt: "Teacher says touch the microphone!", answer: "microphone" },
      { says: false, prompt: "Touch the monitor!", answer: "wait" },
      { says: true, prompt: "Teacher says touch something used to TYPE!", answer: "keyboard" },
      { says: true, prompt: "Teacher says touch the mouse!", answer: "mouse" },
      { says: false, prompt: "Touch something that prints!", answer: "wait" },
      { says: true, prompt: "Teacher says touch the printer!", answer: "printer" },
    ],
    challengeTargets: [
      { id: "keyboard", label: "Keyboard", asset: "assets/keyboard.svg" },
      { id: "mouse", label: "Mouse", asset: "assets/mouse.svg" },
      { id: "monitor", label: "Monitor", asset: "assets/monitor.svg" },
      { id: "speaker", label: "Speaker", emoji: "🔊" },
      { id: "microphone", label: "Microphone", emoji: "🎤" },
      { id: "printer", label: "Printer", emoji: "🖨️" },
      { id: "wait", label: "Wait!", emoji: "✋" },
    ],
    moodChoices: [
      { id: "happy", emoji: "😄", label: "Happy", path: "emoji" },
      { id: "excited", emoji: "🤩", label: "Excited", path: "emoji" },
      { id: "okay", emoji: "🙂", label: "Okay", path: "emoji" },
      { id: "sleepy", emoji: "😴", label: "Sleepy", path: "mindful" },
      { id: "sad", emoji: "😢", label: "Sad", path: "mindful" },
      { id: "angry", emoji: "😠", label: "Angry", path: "mindful" },
    ],
    emojiGameRounds: [
      { target: "😄", options: ["😄", "😎", "😆", "🥳"] },
      { target: "🤩", options: ["🤩", "😴", "😊", "🥰"] },
      { target: "🥳", options: ["🥳", "😢", "😄", "😮"] },
    ],
    calmSteps: [
      { id: "flower", title: "Smell the flower", emoji: "🌸", text: "Breathe in through your nose.", helper: "Smell the flower. Big slow breath in." },
      { id: "candle", title: "Blow the candle", emoji: "🕯️", text: "Breathe out very slow.", helper: "Blow the candle. Long slow breath out." },
      { id: "stretch", title: "Stretch up high", emoji: "👐", text: "Reach your hands up to the sky.", helper: "Stretch your arms. Make your body long." },
      { id: "shake", title: "Shake it out", emoji: "✨", text: "Small shake. Let the grumpy feelings go.", helper: "Shake your hands and shoulders." },
    ],
    onoffWakeTargets: [
      { id: "plug", label: "Plug In", emoji: "🔌", hint: "Power first." },
      { id: "button", label: "Power Button", emoji: "🔘", hint: "Press to wake." },
      { id: "screen", label: "Screen On", emoji: "💡", hint: "Now we can see." }
    ],
    onoffSteps: [
      { id: "plug", label: "Plug in", emoji: "🔌" },
      { id: "press", label: "Press power", emoji: "🔘" },
      { id: "wait", label: "Wait", emoji: "⏳" },
      { id: "login", label: "Log in", emoji: "🙂" },
      { id: "work", label: "Start work", emoji: "🖥️" }
    ],
    onoffScenarios: [
      { text: "You want to start computer class.", answer: "turn_on", options: [{ id: "turn_on", label: "Turn On", emoji: "🔘" }, { id: "sleep", label: "Sleep", emoji: "😴" }, { id: "restart", label: "Restart", emoji: "🔄" }] },
      { text: "You finished your drawing. What first?", answer: "save_first", options: [{ id: "save_first", label: "Save", emoji: "💾" }, { id: "turn_off", label: "Turn Off", emoji: "⏻" }, { id: "run", label: "Run Away", emoji: "🏃" }] },
      { text: "Time to go home.", answer: "turn_off", options: [{ id: "turn_off", label: "Turn Off", emoji: "⏻" }, { id: "turn_on", label: "Turn On", emoji: "🔘" }, { id: "dance", label: "Dance", emoji: "💃" }] },
      { text: "Computer is stuck. Try this.", answer: "restart", options: [{ id: "restart", label: "Restart", emoji: "🔄" }, { id: "sleep", label: "Sleep", emoji: "😴" }, { id: "save_first", label: "Save", emoji: "💾" }] },
      { text: "Short break. Come back soon.", answer: "sleep", options: [{ id: "sleep", label: "Sleep", emoji: "😴" }, { id: "turn_off", label: "Turn Off", emoji: "⏻" }, { id: "restart", label: "Restart", emoji: "🔄" }] },
      { text: "Work is open. Do this before off.", answer: "save_first", options: [{ id: "restart", label: "Restart", emoji: "🔄" }, { id: "save_first", label: "Save", emoji: "💾" }, { id: "turn_off", label: "Turn Off", emoji: "⏻" }] }
    ],
    onoffRoutineRounds: [
      { text: "The computer is dark. What now?", answer: "turn_on" },
      { text: "You pressed power. Next?", answer: "wait" },
      { text: "Your game is open. Before off?", answer: "save_first" },
      { text: "Class is over.", answer: "turn_off" },
      { text: "Quick break only.", answer: "sleep" },
      { text: "Computer froze.", answer: "restart" },
      { text: "Screen wakes up. Now?", answer: "login" },
      { text: "You want to use the computer.", answer: "turn_on" },
      { text: "Work is done and saved.", answer: "turn_off" },
      { text: "Power light is on. Be patient.", answer: "wait" }
    ],
    onoffRoutineChoices: [
      { id: "turn_on", label: "Turn On", emoji: "🔘" },
      { id: "wait", label: "Wait", emoji: "⏳" },
      { id: "save_first", label: "Save", emoji: "💾" },
      { id: "turn_off", label: "Turn Off", emoji: "⏻" },
      { id: "sleep", label: "Sleep", emoji: "😴" },
      { id: "restart", label: "Restart", emoji: "🔄" },
      { id: "login", label: "Log In", emoji: "🙂" }
    ],
    sillyMessages: ["Boing! Silly tap!", "Splash! A funny fish!", "Twinkle! A happy star!", "Wiggle wiggle!", "Haha! Try the game too!"],
    confettiColors: ["#ff5d8f", "#ffd84f", "#4cc9f0", "#2ec27e", "#ff8e3c", "#a78bfa"],
  };
})();
