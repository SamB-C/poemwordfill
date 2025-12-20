import { FAKE_SPACE_HTML_ELEMENT, GET_ELEMENT, CARD_ONLY_REGEX, POEM_AUTHOR_ID, POEM_SELECT_ID, WORDS } from "./constantsAndTypes.js";
import { initialisePoemSelect, initialiseRangebar, initialiseWordsOrQuotesRadioButtons, initialiseGuideInputs, initialiseAnthologySelect, disableQuotes } from "./inputs.js";
import { initialiseTryAgainLink } from "./letterInputEventHandler.js";
import { initialiseNotesForPoem } from "./renderNotes.js";
import { replaceQuotes, replaceWords } from "./replaceWordsOrQuotes.js";
import { FOCUS, GET_ID, WORD_FUNCS } from "./utilities.js";
export let state;
let poems = {};
fetch("convertedPoems.json")
    .then(response => response.json())
    .then(poemData => {
    poems = poemData;
    fetch("poems/anthologies.json")
        .then(response => response.json())
        .then(anthologies => {
        anthologies;
        initialiseGuideInputs();
        initialiseState(poems, anthologies);
        initialiseAnthologySelect();
        initialiseWordsOrQuotesRadioButtons();
        initialisePoemSelect();
        initialise();
        addPoemAuthor();
        initialiseTryAgainLink();
        initialiseRangebar();
    });
});
export const clearups = [];
/**
 * @param poems - The data from the convertedPoems.json file
 * @param anthologiesData - The data from the anthologies.json file
 *
 * Initialises state of the poem such that:
 *
 * Current anthology is 'Eduquas (Pre-2027)'
 *
 * Anthologies is the anthologies and the titles of the poems they contain
 *
 * Current poem is 'The Manhunt'
 *
 * Poem data is the poems parameter
 *
 * Percentage of words to remove is 5
 *
 * Removal type is WORDS
 *
 * Focused word is ''
 *
 * Words not completed is []
 *
 * Words not completed preserved is []
 *
 * All attributes of userAid are 0
*/
function initialiseState(poems, anthologiesData) {
    state = {
        currentAnthology: 'Eduqas (Pre-2027)',
        anthologies: anthologiesData,
        currentPoemName: 'The Manhunt',
        poemData: poems,
        percentageWordsToRemove: 5,
        removalType: WORDS,
        focusedWord: '',
        wordsNotCompleted: [],
        wordsNotCompletedPreserved: [],
        userAid: {
            letterIndexOfLatestIncorrectLetter: 0,
            letterIndex: 0,
            numberOfIncorrectAttempts: 0
        }
    };
}
// ============================================================================
// ============================== Initialisation ==============================
// ============================================================================
// --------------------------- Render the poem author ---------------------------
export function addPoemAuthor() {
    const poemName = state.currentPoemName;
    const poemAuthor = state.poemData[poemName].author;
    const poemAuthorElement = document.getElementById(POEM_AUTHOR_ID);
    poemAuthorElement.innerHTML = poemAuthor.toUpperCase();
}
/**
 * If the poem is centered, aligns the poem to the center, otherwise aligns the poem to the left
 * @param poemElement - The HTML element containing the poem
 */
function alignPoem(poemElement) {
    const currentPoemName = state.currentPoemName;
    const poemSelect = document.getElementById(POEM_SELECT_ID);
    const poemAuthor = document.getElementById(POEM_AUTHOR_ID);
    // TODO: Shouldn't this be state.poems? This would allow us to delete line 10
    if (poems[currentPoemName]['centered']) {
        poemElement.style.textAlign = 'center';
        poemSelect.style.textAlign = 'center';
        poemAuthor.style.textAlign = 'center';
    }
    else {
        poemElement.style.textAlign = 'left';
        poemSelect.style.textAlign = 'left';
        poemAuthor.style.textAlign = 'left';
    }
}
// --------------------------- Split poem and convert to HTML ---------------------------
/**
 * Splits a poem into lines, adds breaks to the end of each line (whilst also calling splitLineToWords to each line).
 * Then joins all the lines back together and returns the poem
 * @param poem - The content of the poem to be split into lines
 * @returns The HTML to be rendered for the poem
 */
function splitPoemToNewLines(poem) {
    const split_poem = poem.split(/\n/);
    return split_poem.map((line) => {
        return splitLineToWords(line) + "</br>";
    }).join('');
}
/**
 * Splits a line into words, adds a span around it with the id equal to the word.
 * Then joins all the words back together and returns a line.
 * Deals with cases where words contain punctuation.
 * @param line - The line of the poem to split into words
 * @returns
 */
function splitLineToWords(line) {
    // Split into words
    const split_line = line.split(/ /);
    // For each word
    return split_line.map((word) => {
        // Split the word into text and punctuation
        const sectionsToMakeSpanFor = WORD_FUNCS.getWordSectionsFromWord(word);
        if (sectionsToMakeSpanFor.length === 1) {
            // If the word is just text, return the word with the correct span around it
            return makeSpanForWord(word);
        }
        else {
            // If the word is text an punctuation, return all sections of the word with the correct spans
            // each seperated by a fake space element
            return sectionsToMakeSpanFor.map((word) => {
                return makeSpanForWord(word);
            }).join(FAKE_SPACE_HTML_ELEMENT);
        }
    }).join(' ');
}
/**
 * @param word - The word to make a span around
 * @returns The HTML to be rendered for the word
 */
function makeSpanForWord(word) {
    if (!word.match(CARD_ONLY_REGEX)) {
        const wordId = GET_ID.formatIdForWord(word);
        return `<span id="${wordId}" class="wordSection">` + WORD_FUNCS.removeNumberFromWord(word) + "</span>";
    }
    else {
        // Spaces are represented as two numbers, so if a word is two numbers, it is a space
        return '&nbsp';
    }
}
// =========================== Intitalise poem ===========================
/**
 * Renders in the poem specified in the state, and manages the words that have been removed from the poem
 */
export function initialise() {
    reset();
    // Render the correct poem
    const poemElement = GET_ELEMENT.getPoemElement();
    const currentPoemContent = state.poemData[state.currentPoemName].convertedPoem;
    poemElement.innerHTML = splitPoemToNewLines(currentPoemContent);
    alignPoem(poemElement);
    // Replace words
    let wordsThatHaveBeenReplaced = replaceWordsOrQuotes(currentPoemContent);
    initialiseNotesForPoem();
    if (wordsThatHaveBeenReplaced.length !== 0) {
        focusFirstWord(wordsThatHaveBeenReplaced);
        updateStateINITIALISE(wordsThatHaveBeenReplaced);
    }
    else {
        setStateToZero();
    }
    fixWidth();
    disableQuotes();
}
/**
 * Replaces the correct percentage of words from the poem with inputs, and returns a list of all the words that were replaced (in order of appearance in the poem).
 * @param currentPoemContent - The content of the poem whose words/quotes are to be replaced
 * @returns A list of all the words that were removed from the poem
 */
function replaceWordsOrQuotes(currentPoemContent) {
    if (state.removalType === WORDS) {
        return replaceWords(currentPoemContent);
    }
    else {
        return replaceQuotes(state.poemData[state.currentPoemName].quotes);
    }
}
function focusFirstWord(wordsThatHaveBeenReplaced) {
    const firstWord = wordsThatHaveBeenReplaced[0];
    FOCUS.focusFirstLetterOfWord(firstWord);
}
function updateStateINITIALISE(wordsThatHaveBeenReplaced) {
    state.wordsNotCompleted = wordsThatHaveBeenReplaced;
    state.wordsNotCompletedPreserved = [...wordsThatHaveBeenReplaced];
    state.focusedWord = wordsThatHaveBeenReplaced[0];
}
function setStateToZero() {
    state.wordsNotCompleted = [];
    state.wordsNotCompletedPreserved = [];
    state.focusedWord = '';
}
/**
 * Calls each of the clearup functions stored in the clearups array
 */
function reset() {
    clearups.forEach(clearup => clearup());
}
function unfixWidth() {
    const html = GET_ELEMENT.getHtmlElement();
    html.style.setProperty('--main-content-container-width', 'fit-content');
}
function fixWidth() {
    const html = GET_ELEMENT.getHtmlElement();
    const poemContainer = GET_ELEMENT.getPoemContainer();
    const fixedWidth = poemContainer.clientWidth;
    const fixedWidthInPixels = fixedWidth.toString() + 'px';
    html.style.setProperty('--main-content-container-width', fixedWidthInPixels);
    clearups.push(unfixWidth);
}
