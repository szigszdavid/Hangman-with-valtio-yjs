import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
//import { YArray, YMap } from 'yjs/dist/src/internals';
//import { integretyCheck } from 'yjs/dist/src/internals'

//import "./styles.css";

let gameState = "game"; // 'won', 'lost'

// Selected elements
const wordDiv = document.querySelector("#the-word");
const lettersDiv = document.querySelector("#letters");
const scoreDiv = document.querySelector("#score");
const endOfGameDiv = document.querySelector("#end-of-game");
const endOfGameSpan = document.querySelector("#end-of-game span");

const doc = new Y.Doc()
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'david', doc)

wsProvider.on('status', event => {
  console.log(event.status) // logs "connected" or "disconnected"
})

/* Régi megoldás
const guesses = doc.getArray('my-array')
const newWord = doc.getArray('new-word')
const buttonDisable = doc.getArray('buttons')
*/

/* Új megközelítés */
const hangmanMap = doc.getMap("hangmanMap")
/* Állapottér elemei
- word
- letters
- guesses
- gameState
*/


hangmanMap.set("guesses", "")
let tempGuesses = hangmanMap.get("guesses").toString() + ""
hangmanMap.set("guesses",tempGuesses)


/* Régi megoldás
guesses.observe(yarrayEvent => {
  yarrayEvent.target === guesses // => true
  // Find out what changed: 
  // Log the Array-Delta Format to calculate the difference to the last observe-event
  console.log(yarrayEvent.changes.delta)
  console.log(guesses.toJSON());

  UpdateWindow()

  if(guesses.length == 0)
  {
    NewGame()
  }
})

newWord.observe(yarrayEvent => {
  yarrayEvent.target === newWord // => true
  // Find out what changed: 
  // Log the Array-Delta Format to calculate the difference to the last observe-event
  console.log(yarrayEvent.changes.delta)
  console.log(newWord.toJSON());
  word = newWord.get(newWord.length - 1)
  console.log("word after new game " + word);

  UpdateWindow()
})


buttonDisable.observe(yarrayEvent => {
  yarrayEvent.target === buttonDisable // => true
  // Find out what changed: 
  // Log the Array-Delta Format to calculate the difference to the last observe-event
  console.log(buttonDisable.toJSON());
  lettersDiv.innerHTML = buttons
  .split("")
  .map((letter) => buttonDisable.toArray().includes(letter) ?  `<button disabled="true">${letter}</button>` : `<button>${letter}</button>`)
  .join("");
})

// every time a local or remote client modifies yarray, the observer is called
 // => "yarray was modified"
window.guesses = guesses
window.newWord = newWord
*/
// Data + business logic
const MAX_BAD_ATTEMPTS = 9;
const wordList = ["alma", "körte", "szilva", "barack", "szótár"];
let word = wordList[random(0,wordList.length - 1)];
hangmanMap.set("word", word)
console.log("Ez került a wordbe: " + hangmanMap.get("word"));
let buttons = "aábcdeéfghiíjklmnoóöőpqrstuúüűxyz";
//let guesses = [];
hangmanMap.set("gameState","game")

const newGameButton = document.querySelector("#newgame")
newGameButton.addEventListener("click", () => {
  NewGame()  
})

let currentAnswer

hangmanMap.observe(ymapEvent => {
  ymapEvent.target === hangmanMap // => true
  // Find out what changed: 
  // Option 1: A set of keys that changed
  ymapEvent.keysChanged // => Set<strings>
  // Option 2: Compute the differences
  ymapEvent.changes.keys // => Map<string, { action: 'add'|'update'|'delete', oldValue: any}>
  // sample code.
  ymapEvent.changes.keys.forEach((change, key) => {
    if (change.action === 'add') {
      console.log(`Property "${key}" was added. Initial value: "${hangmanMap.get(key)}".`)
    } else if (change.action === 'update') {
      console.log(`Property "${key}" was updated. New value: "${hangmanMap.get(key)}". Previous value: "${change.oldValue}".`)
    } else if (change.action === 'delete') {
      console.log(`Property "${key}" was deleted. New value: undefined. Previous value: "${change.oldValue}".`)
    }
    
  })

  word = hangmanMap.get("word")
  gameState = hangmanMap.get("gameState")
  
  UpdateWindow()  
  lettersDiv.innerHTML = buttons
  .split("")
  .map((letter) => hangmanMap.get("guesses").split("").includes(letter) ?  `<button disabled="true">${letter}</button>` : `<button>${letter}</button>`)
  .join("");
})


function NewGame()
{
  gameState = "game"
  hangmanMap.set("word",wordList[random(0,wordList.length - 1)].toString())
  hangmanMap.set("guesses","")
  hangmanMap.set("gameState","game")
  lettersDiv.hidden = false;
  endOfGameDiv.hidden = true;
  endOfGameSpan.innerHTML = gameState === "lost" ? "You lost!" : "You won!";

  //#region Régi guesses és buttonDisable YArrayok 
  //Clear YArray
  //guesses.delete(0,guesses.length)
  //buttonDisable.delete(0,buttonDisable.length)
  //#endregion

  //Clear characters
  //word = wordList[random(0, wordList.length - 1)];

  //#region Régi közös kitalálandó kiválasztása
  /*
  if(newWord.length == 0)
  {
    newWord.insert(0,[word])
    currentAnswer = word
    console.log("currentAnswer: " + currentAnswer);
    
  }
  else if(newWord.length >= 3)
  {
    newWord.push([word])
    console.log("the pushed word is : " + word);
    
  }
  else{
    newWord.push([word])
    word = newWord.get(0)
  }
  */
 //#endregion
  //hangmanMap.set("word",[word])
  wordDiv.innerHTML = genWord(word, hangmanMap.get("guesses"),gameState);

  //Clear score div
  scoreDiv.innerHTML = genScore(word, hangmanMap.get("guesses"));

  //Clear svg
  //const bads = badAttempts(word, hangmanMap.get("guesses"))
  const svg = document.querySelector("svg")
  svg.innerHTML = ""

  //Clear button div
  lettersDiv.innerHTML = ""
  lettersDiv.innerHTML = buttons
  .split("")
  .map((letter) => `<button>${letter}</button>`)
  .join("");

}

function UpdateWindow()
{
    wordDiv.innerHTML = genWord(word, hangmanMap.get("guesses"), gameState);
    scoreDiv.innerHTML = genScore(word, hangmanMap.get("guesses"));
    // imperative
    //e.target.disabled = true;
    const bads = badAttempts(word, hangmanMap.get("guesses"))
    
    for (let i = 0; i <= bads; i++) 
    {
      let svgEl = document.querySelector(`svg *:nth-child(${i})`);   
      svgEl?.classList.add("show");  
    }

    console.log("Current gameState: " + hangmanMap.get("gameState"));
    if (bads >= MAX_BAD_ATTEMPTS) {
      gameState = "lost";
    }
    if (isWon(word, hangmanMap.get("guesses"))) {
      gameState = "won";
    }
    console.log("Current2 gameState: " + hangmanMap.get("gameState"));
    if (gameState != "game") {
      lettersDiv.hidden = true;
      endOfGameDiv.hidden = false;
      endOfGameSpan.innerHTML = gameState === "lost" ? "You lost!" : "You won!";
      
    }
    else{
      lettersDiv.hidden = false;
      endOfGameDiv.hidden = true;
    }
}

function badAttempts(word, guesses) {
  console.log("BadAttempts Word: " + word.toString().split(""));
  console.log("Guesses: " + guesses.split(""));
  return guesses.split("").filter((guess) => !word.toString().split("").includes(guess)).length;
}
function isWon(word, guesses) {
  return word.toString().split("").every((letter) => Array.from(guesses).includes(letter));
}
function init() {
  word = "alma";
  gameState = "game";
}

// Helper function
function random(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// Event handlers
lettersDiv.addEventListener("click", onLetterClick);
function onLetterClick(e) {
   //console.log(e.target);
  if (e.target.matches("button")) {
    // Read input
    const letter = e.target.innerHTML;
    /* Régi */
    /*
    //buttonDisable.push([e.target.innerHTML])
    // Process
    hangmanMap.get("guesses").insert(0, [letter]);
    //guesses.delete(1,5)
    */
    //Guesses String bővítése
    let tempGuesses = hangmanMap.get("guesses")
    tempGuesses = tempGuesses + letter
    hangmanMap.set("guesses", tempGuesses)
    
    const bads = badAttempts(word, hangmanMap.get("guesses"));
    
    if (bads >= MAX_BAD_ATTEMPTS) {
      gameState = "lost";
    }
    if (isWon(word, hangmanMap.get("guesses"))) {
      gameState = "won";
    }
    // Write output
    // declarative
    wordDiv.innerHTML = genWord(word, hangmanMap.get("guesses"), gameState);
    scoreDiv.innerHTML = genScore(word, hangmanMap.get("guesses"));
    // imperative
    e.target.disabled = true;
    const svgEl = document.querySelector(`svg *:nth-child(${bads})`);
    svgEl?.classList.add("show");
    if (gameState !== "game") {
      lettersDiv.hidden = true;
      endOfGameDiv.hidden = false;
      endOfGameSpan.innerHTML = gameState === "lost" ? "You lost!" : "You won!";
    }
    if (gameState === "won") {
      wordDiv.classList.add("won");
    }
  }
}

// HTML generators
function genWord(word, guesses, gameState) {
  return word
    .toString()
    .split("")
    .map(
      (letter) => `
      <span class="${
        gameState === "lost" && !Array.from(guesses).includes(letter) ? "missing" : ""
      }">
        ${Array.from(guesses).includes(letter) || gameState === "lost" ? letter : ""}
      </span>
    `
    )
    .join("");
}
function genScore(word, guesses) {
  console.log("bad: " + badAttempts(word, guesses));
  return `Bad attempts: ${badAttempts(word, guesses)}/${MAX_BAD_ATTEMPTS}`;
}

// Page load
wordDiv.innerHTML = genWord(word, hangmanMap.get("guesses"),gameState);
lettersDiv.innerHTML = buttons
  .split("")
  .map((letter) => `<button>${letter}</button>`)
  .join("");

init()