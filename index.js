"use strict";
const POEM = `I met a traveller from an antique land,
Who said—"Two vast and trunkless legs of stone
Stand in the desert. . . . Near them, on the sand,
Half sunk a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them, and the heart that fed;
And on the pedestal, these words appear:
My name is Ozymandias, King of Kings;
Look on my Works, ye Mighty, and despair!
Nothing beside remains. Round the decay
Of that colossal Wreck, boundless and bare
The lone and level sands stretch far away."
`;
const NUMBER_OF_WORDS_TO_REPLACE = 30;
// ============================================================================
// ================= Event handler (Assigned in replaceWord) =================
// ============================================================================
// =========================== Main event handler function ===========================
// Event handler for each individual letter input
function onInputEventHandler(word, event) {
    // Check if letter is incorrect
    const targetInput = event.target;
    if (targetInput.value === '') {
        return;
    }
    if (compareInputToLetterId(targetInput.value, targetInput.id)) {
        targetInput.style.color = 'red';
        // Destroy handler and replace after 1s
        targetInput.oninput = () => { };
        setTimeout(() => {
            revertWordToEmpty(word);
            targetInput.oninput = (event) => onInputEventHandler(word, event);
            targetInput.style.color = 'black';
        }, 1000);
    }
    else {
        focusNextLetter(event.target);
    }
}
// --------------------------- Letter Wrong ---------------------------
// Reverts a word back to underscores after incorrect input
function revertWordToEmpty(word) {
    // Retrive all inputs
    const wordElement = getElementOfWord(word);
    const arrayOfChildren = Array.from(wordElement.children);
    // Resets word
    for (let i = 0; i < arrayOfChildren.length; i++) {
        arrayOfChildren[i].value = '';
        focusFirstLetterOfWord(word);
    }
}
// --------------------------- Letter Right ---------------------------
// Focuses on the next/missing letter in the word, or if it is complete, move to next word
function focusNextLetter(currentLetter) {
    // Check if this letter is full
    if (currentLetter.value.length > 0) {
        // Focuses on the next letter
        const nextLetter = currentLetter.nextSibling;
        if (nextLetter === null || nextLetter.value !== '') {
            focusMissingLetter(currentLetter);
        }
        else {
            nextLetter.focus();
        }
    }
}
// Check if word is full, completes if so, else focuses on missing letter
function focusMissingLetter(letterToCheckUsing) {
    const missingLetter = checkAllLettersFull(letterToCheckUsing);
    if (missingLetter === null) {
        completeWord();
    }
    else {
        missingLetter.focus();
    }
}
// Checks if all the letters in a word are full - returns the letter that isn't if there is one
function checkAllLettersFull(singleLetter) {
    // Retrieves all the letters in the word
    const parentSpan = singleLetter.parentElement;
    const allLetterInputs = Array.from(parentSpan.children);
    // Tries to find an empty letter
    for (let i = 0; i < allLetterInputs.length; i++) {
        if (allLetterInputs[i].value === '') {
            return allLetterInputs[i];
        }
    }
    // All full
    return null;
}
// When a word is completed, check if it is correct, if so, move onto next word
function completeWord() {
    // Get the input values and combine into guessed word
    const focusedWordElement = getElementOfWord(focusedWord);
    const arrayOfChildren = Array.from(focusedWordElement.children);
    let userInput = '';
    for (let i = 0; i < arrayOfChildren.length; i++) {
        userInput = userInput + arrayOfChildren[i].value;
    }
    // Checks if the word the user input was correct
    if (userInput === focusedWord) {
        // Marks as complete
        revertToTextAsComplete(focusedWord);
        wordsNotCompleted.splice(wordsNotCompleted.indexOf(focusedWord), 1);
        // Changes the word that is focused
        focusedWord = wordsNotCompleted[0];
        focusFirstLetterOfWord(focusedWord);
    }
}
// Marks a word as complete by converting back to text and cahnging colour to green
function revertToTextAsComplete(wordToRevert) {
    const wordToRevertElement = getElementOfWord(wordToRevert);
    wordToRevertElement.innerHTML = wordToRevert;
    wordToRevertElement.style.color = 'green';
}
// ============================================================================
// ============================== Initialisation ==============================
// ============================================================================
// --------------------------- Replace words in the poem ---------------------------
// Removes a certain number of words from the poem, and returns the words that were removed
// in order of appearance
function replaceWords(poem, numberOfWords) {
    const wordsReplaced = [];
    while (wordsReplaced.length < numberOfWords) {
        const potentialWord = selectRandomWordFromPoem(poem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    insertionSortIntoOrderInPoem(poem, wordsReplaced);
    wordsReplaced.forEach((word) => replaceWord(word));
    return wordsReplaced;
}
// Selects a word at random from the poem
function selectRandomWordFromPoem(poem) {
    // Select random line
    const lines = poem.split(/\n/);
    const nonEmptyLines = lines.filter((line) => line !== '');
    const randomLine = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words = randomLine.split(/ /);
    const nonEmptyWords = words.filter((word) => word !== '');
    const randomWord = nonEmptyWords[Math.floor(Math.random() * nonEmptyWords.length)];
    return randomWord;
}
// Sorts the missing word in the poem into the order of appearance so they can be focused in order
function insertionSortIntoOrderInPoem(poem, words) {
    for (let i = 1; i < words.length; i++) {
        let currentWordIndex = i;
        let comparingWordIndex = i - 1;
        while (poem.indexOf(words[currentWordIndex]) < poem.indexOf(words[comparingWordIndex])) {
            [words[comparingWordIndex], words[currentWordIndex]] = [words[currentWordIndex], words[comparingWordIndex]];
            currentWordIndex--;
            comparingWordIndex--;
            if (currentWordIndex === 0) {
                break;
            }
        }
    }
    return words;
}
// Replaces a word from the poem in the HTML with underscores with equal length to the length of the word
function replaceWord(word) {
    // Turn each word into letter inputs
    console.log(word);
    const wordToHide = getElementOfWord(word);
    const wordInUnderScores = word.split('').map((letter) => {
        const htmlForLetter = `<input placeholder="_" size="1" maxlength="1" id="${getIdForLetter(word, letter)}"></input>`;
        console.log(htmlForLetter);
        return htmlForLetter;
    }).join('');
    wordToHide.innerHTML = wordInUnderScores;
    // Adds the event handlers for the input
    wordToHide.oninput = (event) => onInputEventHandler(word, event);
    wordToHide.onclick = () => {
        focusedWord = word;
    };
}
// --------------------------- Split poem and converty to HTML ---------------------------
// Splits a poem into lines, adds breaks to the end of each line (whilst also calling splitLineToWords to each line)
// Then joins all the lines back together and returns the poem
function splitPoemToNewLines(poem) {
    const split_poem = poem.split(/\n/);
    return split_poem.map((line) => {
        return splitLineToWords(line) + "</br>";
    }).join('');
}
// Splits a line into words, adds a span around it with the id equal to the word
// Then joins all the words back together and returns a line
function splitLineToWords(line) {
    const split_line = line.split(/ /);
    return split_line.map((word) => {
        const wordId = getIdForWord(word);
        return `<span id="${wordId}">` + word + "</span>";
    }).join(' ');
}
// =========================== Intitalise poem ===========================
// Initialises the poem, by rendering it in
function initialise(poem) {
    const poemElement = document.getElementById("1poem_id1");
    poemElement.innerHTML = splitPoemToNewLines(poem);
    const wordsThatHaveBeenReplaced = replaceWords(poem, NUMBER_OF_WORDS_TO_REPLACE);
    const firstWord = wordsThatHaveBeenReplaced[0];
    focusFirstLetterOfWord(firstWord);
    return wordsThatHaveBeenReplaced;
}
const wordsNotCompleted = initialise(POEM);
let focusedWord = wordsNotCompleted[0];
console.log(wordsNotCompleted);
// HELPER FUNCTIONS
// Finds the element for the first letter of a missing word
function focusFirstLetterOfWord(word) {
    const inputToFocusId = `${getIdForLetter(word, word[0])}`;
    const firstInputElement = document.getElementById(inputToFocusId);
    firstInputElement.focus();
}
function getBinaryFromLetter(letter) {
    return letter.charCodeAt(0).toString(2);
}
function getIdForLetter(word, letter) {
    return `${getIdForWord(word)}_${getBinaryFromLetter(letter)}`;
}
function getIdForWord(word) {
    if (word.includes('"')) {
        return word.replace(/"/, getBinaryFromLetter('"'));
    }
    else {
        return word;
    }
}
function getElementOfWord(word) {
    console.log('this');
    const wordElement = document.getElementById(getIdForWord(word));
    return wordElement;
}
function compareInputToLetterId(input, id) {
    const wordAndLetterList = id.split('_');
    const letterInBinary = wordAndLetterList[wordAndLetterList.length - 1];
    const letter = String.fromCharCode(parseInt(letterInBinary, 2));
    return input !== letter;
}
