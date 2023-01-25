import { Quotes } from "../notesAndKeyQuotes/utilities.js";
import { INPUT_OPTIONS, NUMBER_ONLY_REGEX, QUOTES, REPLACE_QUOTES_RADIO_BUTTON_ID, REPLACE_WORDS_RADIO_BUTTON_ID, WORDS, WordsOrQuotesType } from "./constantsAndTypes.js";
import { initialise, onInputEventHandler, state } from "./index.js";
import { getArrayOfChildrenThatAreInputs, getElementOfWord, getIdForLetter, getWordSectionsFromWord, isIlleagalLetter } from "./utilities.js";


// Initialise the radio buttons so that their value is represented in the state
export function initialiseWordsOrQuotesRadioButtons() {
    const wordsButton = document.getElementById(REPLACE_WORDS_RADIO_BUTTON_ID) as HTMLInputElement;
    const quotesButton = document.getElementById(REPLACE_QUOTES_RADIO_BUTTON_ID) as HTMLInputElement;
    wordsButton.checked = true;
    wordsButton.oninput = () => radioButtonOnInput(WORDS);
    quotesButton.oninput = () => radioButtonOnInput(QUOTES);
}

function radioButtonOnInput(removalType: WordsOrQuotesType) {
    state.removalType = removalType;
    initialise();
}


// --------------------------- Replace quotes in the poem ---------------------------

export function replaceQuotes(quotes: Quotes): Array<string> {
    let allWordsInQuotes: Array<string> = [];
    quotes.forEach(quote => quote.forEach(word => allWordsInQuotes.push(word)))
    const currentPoemContent = state.poemData[state.currentPoemName].convertedPoem;
    // The words should already be in order but used as a precaution
    insertionSortIntoOrderInPoem(currentPoemContent, allWordsInQuotes)
    allWordsInQuotes.forEach(word => replaceWord(word, currentPoemContent));
    return allWordsInQuotes;
}


// --------------------------- Replace words in the poem ---------------------------

// Removes a certain number of words from the poem, and returns the words that were removed
// in order of appearance
export function replaceWords(currentPoem: string): Array<string> {
    const wordsReplaced: Array<string> = [];
    while (wordsReplaced.length < state.numWordsToRemove) {
        const potentialWord: string = selectRandomWordFromPoem(currentPoem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    insertionSortIntoOrderInPoem(currentPoem, wordsReplaced);
    const wordSectionsReplaced: Array<Array<string>> = wordsReplaced.map((word: string): Array<string> => replaceWord(word, currentPoem));
    return wordSectionsReplaced.reduce((accumulator: Array<string>, wordSections) => {
        return accumulator.concat(wordSections);
    });
}


// Selects a word at random from the poem
function selectRandomWordFromPoem(poem: string):string {
    // Select random line
    const lines: Array<string> = poem.split(/\n/);
    const nonEmptyLines: Array<string> = lines.filter((line:string) => !line.match(NUMBER_ONLY_REGEX));
    const randomLine: string = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words: Array<string> = randomLine.split(/ /);
    const nonEmptyWords: Array<string> = words.filter((word:string) => !word.match(NUMBER_ONLY_REGEX));
    const randomWord: string = nonEmptyWords[Math.floor(Math.random() * nonEmptyWords.length)];
    return randomWord;
}


// Sorts the missing word in the poem into the order of appearance so they can be focused in order
function insertionSortIntoOrderInPoem(poem: string, words: Array<string>): Array<string> {
    for (let i: number = 1; i < words.length; i++) {
        let currentWordIndex: number = i
        let comparingWordIndex: number = i - 1;
        while (poem.indexOf(words[currentWordIndex]) < poem.indexOf(words[comparingWordIndex])) {
            [words[comparingWordIndex], words[currentWordIndex]] = [words[currentWordIndex], words[comparingWordIndex]];
            currentWordIndex--;
            comparingWordIndex--;
            if (currentWordIndex === 0) {
                break
            }
        }
    }
    return words
}

// Replaces a word from the poem in the HTML with underscores with equal length to the length of the word
export function replaceWord(word: string, poem: string): Array<string> {
    // Turn each word into letter inputs
    const wordSectionsToHide = getWordSectionsFromWord(word);
    const nonEmptySectionsToHide = wordSectionsToHide.filter(word => !word.match(NUMBER_ONLY_REGEX));
    nonEmptySectionsToHide.forEach((wordSection) => {
        const wordToHide: HTMLSpanElement = getElementOfWord(wordSection);
        const wordInUnderScores: string = wordSection.split('').map((letter) => {
            if (!isIlleagalLetter(letter)) {
                const htmlForLetter: string = `<input ${INPUT_OPTIONS} id="${getIdForLetter(wordSection, letter)}"></input>`
                return htmlForLetter;
            }
        }).join('');
        wordToHide.innerHTML = wordInUnderScores;
        // Adds the event handlers for the input
        wordToHide.oninput = (event) => onInputEventHandler(wordSection, event, poem)
        wordToHide.onclick = () => {
            state.focusedWord = wordSection
        }
        const childrenToAddOnInputTo: Array<HTMLInputElement> = getArrayOfChildrenThatAreInputs(wordToHide);
        childrenToAddOnInputTo.forEach((input: HTMLInputElement) => {
            input.oninput = ensureMaxLengthNotExceeded;
        })
    });
    return nonEmptySectionsToHide;
}

function ensureMaxLengthNotExceeded(event: Event) {
    const targetInput = event.target as HTMLInputElement;
    const firstLetter = targetInput.value.charAt(0);
    targetInput.value = firstLetter;
}