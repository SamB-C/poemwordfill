import { ANIMATION_SPEED, COMPLETION_BORDER_CSS, COMPLETION_TEXT_COLOUR, COVER_OVER_COMPLETED_WORDS, GET_ELEMENT, LETTER_INPUT_DEFAULT_COLOR, CARD_ONLY_REGEX, SPECIAL_CHARACTER_REGEX } from "./constantsAndTypes.js";
import { clearups, initialise, state } from "./index.js";
import { disableInputs, resetInputs, updateRangeBar } from "./inputs.js";
import { FOCUS, WORD_FUNCS, getAllWordSectionsInPoem, getArrayOfChildrenThatAreInputs } from "./utilities.js";
// =========================== Letter input onchange event handler ===========================
/**
 * Checks if a letter is correct. If it is, focuses the next letter, if not, handles an incorrect letter input.
 * @param word The word that the letter being input is in
 * @param event The event object for the event being handled
 * @param poem The poem that the word is in
 */
export function onInputEventHandler(word, event, poem) {
    // Check if letter is incorrect
    const targetInput = event.target;
    if (targetInput.value.length === 0) {
        return;
    }
    // Center the input if the input is not a special character
    if (!targetInput.value.match(SPECIAL_CHARACTER_REGEX)) {
        targetInput.style.textAlign = 'center';
    }
    // Check if the letter is correct by comparing it to it's id
    if (!compareInputToLetterId(targetInput.value, targetInput.id)) {
        handleIncorrectLetter(targetInput, word, poem);
    }
    else {
        focusNextLetter(targetInput, poem);
    }
}
// --------------------------- Compare letter ---------------------------
// Compares the input to the correct answer
/**
 * Uses the id of the input element to get the correct letter and compares it to the letter that was input.
 * @param input The letter/character that the user has input
 * @param id The id of the letter input
 * @returns Whether the input is correct or not
 */
function compareInputToLetterId(input, id) {
    const letter = getLetterFromId(id);
    return input === letter || (letter === '—' && input === '-');
}
/**
 * Calculates the letter that the input corresponds to using the ASCII value stored in the id.
 * @param id The id a letter input
 * @returns The letter that the input corresponds to
 */
function getLetterFromId(id) {
    // Splits the id into a list [word, letterInBinary]
    const wordAndLetterList = id.split('_');
    // Get the letterInBinary element from the array
    const letterInBinary = wordAndLetterList[wordAndLetterList.length - 1];
    // Convert the letter from binary to character
    const letter = String.fromCharCode(parseInt(letterInBinary, 2));
    return letter;
}
// --------------------------- Letter Wrong ---------------------------
/**
 *
 * @param targetInput The input that was incorrect
 * @param word The word that the input was part of
 * @param poem The poem that the word was part of
 */
function handleIncorrectLetter(targetInput, word, poem) {
    // Change the color of the input to red to indicate that it was wrong
    targetInput.style.color = 'red';
    // Update the user aid to reflect the incorrect input
    updateUserAid();
    // Destroy handler and replace after 1s
    const parent = targetInput.parentElement;
    parent.oninput = () => { };
    if (state.userAid.numberOfIncorrectAttempts === 3) {
        // Show the user the correct letter and move to the next letter after 1s
        setTimeout(() => {
            targetInput.value = getLetterFromId(targetInput.id);
            parent.oninput = (event) => onInputEventHandler(word, event, poem);
            focusNextLetter(targetInput, poem);
            targetInput.style.color = LETTER_INPUT_DEFAULT_COLOR;
        }, 1000);
    }
    else {
        // Reset the letter and restore the handler after 1s
        setTimeout(() => {
            targetInput.value = '';
            parent.oninput = (event) => onInputEventHandler(word, event, poem);
            targetInput.style.color = LETTER_INPUT_DEFAULT_COLOR;
            targetInput.style.textAlign = 'start';
        }, 1000);
    }
}
/**
 * Updates the user aid to reflect that the user has input an incorrect letter
 */
function updateUserAid() {
    if (state.userAid.letterIndex === state.userAid.letterIndexOfLatestIncorrectLetter) {
        state.userAid.numberOfIncorrectAttempts++;
    }
    else {
        state.userAid.letterIndexOfLatestIncorrectLetter = state.userAid.letterIndex;
        state.userAid.numberOfIncorrectAttempts = 1;
    }
}
// --------------------------- Letter Right ---------------------------
/**
 * Focuses on the next/missing letter in the word, or if it is complete, move to next word
 * @param currentLetter The current letter that the user is focused on
 * @param poem The poem that the letter is in
 */
function focusNextLetter(currentLetter, poem) {
    // Check if this letter is full
    if (currentLetter.value.length > 0) {
        // Focuses on the next letter
        const nextLetter = currentLetter.nextSibling;
        if (nextLetter === null || nextLetter.value !== '') {
            // End of word so focuses on next word
            focusMissingLetter(currentLetter, poem);
        }
        else {
            // Not end of word so focuses on next letter
            incrementLetterIndex();
            nextLetter.focus();
        }
    }
}
/**
 * Check if word is full. If it is, completes the word, else focusses on the missing letter.
 * @param letterToCheckUsing The letter that was just input
 * @param poem The poem that the word is in
 */
function focusMissingLetter(letterToCheckUsing, poem) {
    const missingLetter = checkAllLettersFull(letterToCheckUsing);
    if (missingLetter === null) {
        completeWord(poem);
    }
    else {
        incrementLetterIndex();
        missingLetter.focus();
    }
}
/**
 * Checks if all the letters in a word are full - returns the letter that isn't if there is one
 * @param singleLetter The element of the letter that was just input
 * @returns The next letter that is empty, or null if all letters are full
 */
function checkAllLettersFull(singleLetter) {
    // Retrieves all the letters in the word
    const parentSpan = singleLetter.parentElement;
    const allLetterInputs = getArrayOfChildrenThatAreInputs(parentSpan);
    // Tries to find an empty letter
    for (let i = 0; i < allLetterInputs.length; i++) {
        if (allLetterInputs[i].value === '') {
            // Returns an empty letter
            return allLetterInputs[i];
        }
    }
    // All full
    return null;
}
/**
 * When a word is completed, check if it is correct, if so, move onto next word
 * @param poem The poem that the word is in
 */
function completeWord(poem) {
    resetUserAid();
    revertToTextAsComplete(state.focusedWord);
    moveToNextWord(poem);
}
/**
 * Marks a word as complete by converting back to text and cahnging colour to green
 * @param wordToRevert The word to revert to text
 */
function revertToTextAsComplete(wordToRevert) {
    const wordToRevertElement = GET_ELEMENT.getElementOfWord(wordToRevert);
    wordToRevertElement.innerHTML = WORD_FUNCS.removeNumberFromWord(wordToRevert);
    wordToRevertElement.style.color = 'green';
    wordToRevertElement.classList.remove('extraSpace');
}
/**
 * Moves to the next word, if none left, marks poem as complete
 * @param poem The poem that the word is in
 */
function moveToNextWord(poem) {
    const indexOfCompleteWord = state.wordsNotCompleted.indexOf(state.focusedWord);
    state.wordsNotCompleted.splice(indexOfCompleteWord, 1);
    if (state.wordsNotCompleted.length > 0) {
        state.focusedWord = state.wordsNotCompleted[indexOfCompleteWord];
        FOCUS.focusFirstLetterOfWord(state.focusedWord);
    }
    else {
        completePoem(poem);
    }
}
/**
 * Marks a poem as complete by changing all the words green, adding a green border, disabling the inputs and showing the try again link
 * @param poem The poem to complete
 */
function completePoem(poem) {
    addGreenCompletionBorder();
    const allWordsInPoem = getAllWordSectionsInPoem(poem);
    // Disable the inputs that re-render the poem
    const rangeBar = GET_ELEMENT.getRangeBar();
    const rangeBarIntitialValue = rangeBar.value;
    disableInputs();
    // Do animation
    changeAllWordsToColor(allWordsInPoem, state.wordsNotCompletedPreserved, COMPLETION_TEXT_COLOUR, ANIMATION_SPEED, () => changeAllWordsToColourAnimationCleanup(rangeBar, rangeBarIntitialValue));
}
/**
 * Adds a green border to the poem container to indicate that the poem has been completed
 */
function addGreenCompletionBorder() {
    const poemContainer = GET_ELEMENT.getPoemContainer();
    poemContainer.style.border = COMPLETION_BORDER_CSS;
    clearups.push(removeGreenCompletionBorder);
}
/**
 * Removes the green border from the poem container
 */
function removeGreenCompletionBorder() {
    const poemContainer = GET_ELEMENT.getPoemContainer();
    poemContainer.style.border = 'none';
}
/**
 * Animation to change all the words in the poem to a different color - A recursive function
 * @param wordsToChange List of words to change the colour of
 * @param wordsNotToChange List of words that should not be changed (if setting enabled)
 * @param color The colour to change the words to
 * @param timeBetweenConversion The time between each successive word changing colour
 * @param callbackOption Cleanup function called after all words have been changed
 */
function changeAllWordsToColor(wordsToChange, wordsNotToChange, color, timeBetweenConversion, callbackOption) {
    // pops off next word to change color for
    const wordToChange = wordsToChange.shift();
    // Base case - word undefined
    if (wordToChange === undefined) {
        return setTimeout(callbackOption, timeBetweenConversion);
    }
    // Only change color if it was not on of the words completed by the user and is a actual word not a number (can be overridden)
    if ((!wordsNotToChange.includes(wordToChange) || COVER_OVER_COMPLETED_WORDS) && !wordToChange.match(CARD_ONLY_REGEX)) {
        const wordElement = GET_ELEMENT.getElementOfWord(wordToChange);
        wordElement.style.color = color;
    }
    // Recursive call with setTimeout so words don't all change colour at once
    return setTimeout(() => changeAllWordsToColor(wordsToChange, wordsNotToChange, color, timeBetweenConversion, callbackOption), timeBetweenConversion);
}
/**
 * Cleanup function for after animation
 * @param rangeBar The range bar element
 * @param rangeBarIntitialValue The initial value the rangebar should be set to
 */
function changeAllWordsToColourAnimationCleanup(rangeBar, rangeBarIntitialValue) {
    showTryAgainButton();
    // Resets the disabled inputs
    resetInputs();
    setTimeout(() => updateRangeBar(rangeBar, rangeBarIntitialValue), 500);
}
export function initialiseTryAgainLink() {
    const tryAgainLink = GET_ELEMENT.getTryAgainLink();
    tryAgainLink.onclick = initialise;
}
/**
 * Shows the try again button to the user
 */
function showTryAgainButton() {
    // Tells the user they completed the poem
    // Add try again selection
    const completionTextContainer = GET_ELEMENT.getCompletionText();
    completionTextContainer.style.display = 'block';
    if (state.poemData[state.currentPoemName].centered) {
        completionTextContainer.style.textAlign = 'center';
    }
    clearups.push(hideTryAgainButton);
}
/**
 * Hides the try again button from the user
 */
function hideTryAgainButton() {
    const completionTextContainer = GET_ELEMENT.getCompletionText();
    completionTextContainer.style.display = 'none';
    completionTextContainer.style.textAlign = 'left';
}
/**
 * Reset user aid to indicate that a new word is being focused on
 */
function resetUserAid() {
    state.userAid.letterIndex = 0;
    state.userAid.numberOfIncorrectAttempts = 0;
}
/**
 * Increments the letter index in the user aid, to reflect that the user has moved onto the next letter.
 */
function incrementLetterIndex() {
    state.userAid.letterIndex++;
}
