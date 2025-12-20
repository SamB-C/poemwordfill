import { GET_ELEMENT, INPUT_OPTIONS, CARD_ONLY_REGEX } from "./constantsAndTypes.js";
import { state } from "./index.js";
import { onInputEventHandler } from "./letterInputEventHandler.js";
import { GET_ID, WORD_FUNCS, getArrayOfChildrenThatAreInputs, isDigit } from "./utilities.js";
// =========================== Choose words to replace ===========================
// --------------------------- Replace quotes in the poem ---------------------------
/**
 * Randomly selects correct number of quotes to replace with blanks to be filled in in the poem.
 * @param quotes The quotes that can be replaced in the poem
 * @returns A list of all the words in the poem that were replaced
 */
export function replaceQuotes(quotes) {
    const quotesToReplace = [];
    // Gets number of quotes to replace
    const numberOfQuotesToReplace = Math.ceil((state.percentageWordsToRemove / 100) * quotes.length);
    // Case where no quotes are to be replaced
    if (numberOfQuotesToReplace === 0) {
        return [];
    }
    // Randomly select that number of unique quotes to replace
    while (quotesToReplace.length < numberOfQuotesToReplace) {
        const potentialQuote = quotes[Math.floor(Math.random() * quotes.length)];
        let wordAlreadySelected = false;
        quotesToReplace.forEach(quote => {
            if (quote.join(' ') === potentialQuote.join(' ')) {
                wordAlreadySelected = true;
            }
        });
        if (!wordAlreadySelected) {
            quotesToReplace.push(potentialQuote);
        }
    }
    let allWordsInQuotes = [];
    quotesToReplace.forEach(quote => quote.forEach(word => allWordsInQuotes.push(word)));
    const currentPoemContent = state.poemData[state.currentPoemName].convertedPoem;
    // The words should already be in order but used as a precaution
    insertionSortIntoOrderInPoem(currentPoemContent, allWordsInQuotes);
    allWordsInQuotes.forEach(word => replaceWord(word, currentPoemContent));
    return allWordsInQuotes;
}
// --------------------------- Replace words in the poem ---------------------------
/**
 * Selects random words from the poem to remove, and replaces them with inputs in the DOM, returing the removed words
 * @param currentPoem - The content of the current poem that the words are to be removed from
 * @returns A list of all the words that were removed from the poem, in order of appearance
 */
export function replaceWords(currentPoem) {
    const wordsReplaced = [];
    // Find the number of words to replace
    const numberOfWordsToReplace = Math.ceil((state.percentageWordsToRemove / 100) * state.poemData[state.currentPoemName].wordCount);
    // Case that no words are to be replaced
    if (numberOfWordsToReplace === 0) {
        return [];
    }
    // Randomly select that number of unique words to replace
    while (wordsReplaced.length < numberOfWordsToReplace) {
        const potentialWord = selectRandomWordFromPoem(currentPoem);
        if (!wordsReplaced.includes(potentialWord)) {
            wordsReplaced.push(potentialWord);
        }
    }
    // Sort the words in order of appearance in the poem
    insertionSortIntoOrderInPoem(currentPoem, wordsReplaced);
    // Replace the words in the DOM
    const wordSectionsReplaced = wordsReplaced.map((word) => replaceWord(word, currentPoem));
    // Return words replaced in order of appearance
    return wordSectionsReplaced.reduce((accumulator, wordSections) => {
        return accumulator.concat(wordSections);
    });
}
/**
 * @param poem The content of the poem to select a word from
 * @returns The selected random word from the poem
 */
function selectRandomWordFromPoem(poem) {
    // Select random line
    const lines = poem.split(/\n/);
    const nonEmptyLines = lines.filter((line) => !line.match(CARD_ONLY_REGEX));
    const randomLine = nonEmptyLines[Math.floor(Math.random() * nonEmptyLines.length)];
    // Select random word
    const words = randomLine.split(/ /);
    const nonEmptyWords = words.filter((word) => !word.match(CARD_ONLY_REGEX));
    const randomWord = nonEmptyWords[Math.floor(Math.random() * nonEmptyWords.length)];
    return randomWord;
}
/**
 * Sorts the missing word in the poem into the order of appearance so they can be focused in order
 * @param poem - The content of the poem to order the words by
 * @param words - The words that need to be sorted
 * @returns The sorted list of words
 */
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
// =========================== Replacing words ===========================
/**
 * Replaces a word from the poem in the HTML with underscores with equal length to the length of the word
 * @param word The word to replace with inputs in the DOM
 * @param poem The content of the poem to replace the word in
 * @returns A list of the word sections that have been replaced (eg "1phase1|+|1,1" -> ["1phase1", "1,1"])
 */
export function replaceWord(word, poem) {
    // Get word sections to hide
    const wordSectionsToHide = WORD_FUNCS.getWordSectionsFromWord(word);
    const nonEmptySectionsToHide = wordSectionsToHide.filter(word => !word.match(CARD_ONLY_REGEX));
    // Turn each word section into letter inputs
    nonEmptySectionsToHide.forEach((wordSection) => {
        // Get element of word (not word section) to hide
        const wordToHide = GET_ELEMENT.getElementOfWord(wordSection);
        // Create html for the word section
        const wordInUnderScores = wordSection.split('').map((letter) => {
            if (!isDigit(letter)) {
                const htmlForLetter = `<input ${INPUT_OPTIONS} id="${GET_ID.getIdForLetter(wordSection, letter)}"></input>`;
                return htmlForLetter;
            }
        }).join('');
        // Replace the word in the DOM with the inputs
        wordToHide.innerHTML = wordInUnderScores;
        wordToHide.classList.add('extraSpace');
        // Adds the event handlers for the input
        wordToHide.oninput = (event) => onInputEventHandler(wordSection, event, poem);
        wordToHide.onclick = () => {
            state.focusedWord = wordSection;
        };
        const childrenToAddOnInputTo = getArrayOfChildrenThatAreInputs(wordToHide);
        childrenToAddOnInputTo.forEach((input) => {
            input.oninput = ensureMaxLengthNotExceeded;
        });
    });
    return nonEmptySectionsToHide;
}
/**
 * Truncates the input to one letter
 * @param event The event that triggered the function
 */
function ensureMaxLengthNotExceeded(event) {
    const targetInput = event.target;
    const firstLetter = targetInput.value.charAt(0);
    targetInput.value = firstLetter;
}
