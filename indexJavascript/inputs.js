import { GET_ELEMENT, QUOTES, WORDS } from "./constantsAndTypes.js";
import { addPoemAuthor, initialise, state } from "./index.js";
// =========================== Intitalise range bar ===========================
/**
 * Initialises the range bar by setting the correct min, max, and value, and creating the correct event handlers
 */
export function initialiseRangebar() {
    const rangeBar = GET_ELEMENT.getRangeBar();
    // Sets min/max values for rangebar
    rangeBar.value = `${state.percentageWordsToRemove}`;
    rangeBar.min = "0";
    rangeBar.max = "100";
    // Sets up the element that displays the value of the rangebar
    const rangeBarResult = GET_ELEMENT.getRangeBarResult();
    rangeBarResult.innerHTML = rangeBar.value + '%';
    addRangebarEvents(rangeBar, rangeBarResult);
}
/**
 * Creates event handlers for the range bar input element
 * @param rangeBar The range bar element
 * @param rangeBarResult The range bar result elemnent
 */
function addRangebarEvents(rangeBar, rangeBarResult) {
    // Don't re-render poem every time bar is dragged
    rangeBar.onpointerup = () => onRangebarInput(rangeBar);
    // Only update the displayed value of the input
    rangeBar.oninput = () => {
        const newValue = rangeBar.value;
        rangeBarResult.innerHTML = newValue + '%';
    };
}
/**
 * Event handler for the rangebar input that changes the number of missing words
 * @param rangeBar The range bar element
 */
function onRangebarInput(rangeBar) {
    // Get new value from range
    const newValue = parseInt(rangeBar.value);
    // Changes the state accordingly
    state.percentageWordsToRemove = newValue;
    // Restart the poem with a new number of words
    initialise();
}
/**
 * Sets the range bar to a specfic value
 * @param rangeBar Range bar element
 * @param initialValue Value that range bar should be set to
 */
export function updateRangeBar(rangeBar, initialValue) {
    if (initialValue !== rangeBar.value) {
        onRangebarInput(rangeBar);
    }
}
// =========================== Intitalise poem select bar ===========================
/**
 * Initialises the poem select dropdown by adding the correct options and setting the correct poem to be selected
 *
 * The oninput event handler is set to onPoemSelectInput
 */
export function initialisePoemSelect() {
    const poemSelect = GET_ELEMENT.getPoemSelect();
    for (let poemName in state.poemData) {
        let newOption = `<option value="${poemName}">${poemName}</option>`;
        if (poemName === state.currentPoemName) {
            newOption = `<option value="${poemName}" selected="seleted">${poemName}</option>`;
        }
        poemSelect.innerHTML = poemSelect.innerHTML + newOption;
    }
    poemSelect.oninput = () => onPoemSelectInput(poemSelect);
}
/**
 * Changes the selected poem in the poem select dropdown and in the state, then initialises with the new state
 * @param poemSelect - The dropdown element that contains the poem that can be selected
 */
function onPoemSelectInput(poemSelect) {
    const poemSelected = poemSelect.value;
    state.currentPoemName = poemSelected;
    initialise();
    addPoemAuthor();
    initialiseRangebar();
}
// =========================== Intitalise Radio buttons ===========================
/**
 * Initialises the radio buttons by creating their oninput event handlers, and setting the correct button to be checked
 */
export function initialiseWordsOrQuotesRadioButtons() {
    const { wordsRadioButton, quotesRadioButton } = GET_ELEMENT.getRadioButtons();
    if (state.removalType === WORDS) {
        wordsRadioButton.checked = true;
    }
    else {
        quotesRadioButton.checked = true;
    }
    wordsRadioButton.oninput = () => radioButtonOnInput(WORDS);
    quotesRadioButton.oninput = () => radioButtonOnInput(QUOTES);
}
/**
 * Event handler for the radion buttons that changes the removal type in state, updates the range bar titles, and re-renders the poem with the new state
 * @param removalType - Whether the radio button is for words or quotes
 */
function radioButtonOnInput(removalType) {
    state.removalType = removalType;
    updateRangeBarTitles(removalType);
    initialise();
}
/**
 * Sets the titles of the range bar and range bar result elements to reflect the current removal type
 * @param removalType - Whether words or quotes are currently being removed
 */
function updateRangeBarTitles(removalType) {
    GET_ELEMENT.getRangeBar().title = `Drag to adjust the percentage of ${removalType} removed from the poem`;
    GET_ELEMENT.getRangeBarResult().title = `The percentage of ${removalType} removed from the poem`;
}
// =========================== Disable and enable inputs ===========================
/**
 * Disables the range bar, poem select, and radio buttons so that the user cannot interact with them.
 */
export function disableInputs() {
    const rangeBar = GET_ELEMENT.getRangeBar();
    rangeBar.onpointerup = () => { };
    const poemSelectInput = GET_ELEMENT.getPoemSelect();
    poemSelectInput.disabled = true;
    const { wordsRadioButton, quotesRadioButton } = GET_ELEMENT.getRadioButtons();
    wordsRadioButton.disabled = true;
    quotesRadioButton.disabled = true;
}
/**
 * Resets the event handlers for the range bar, poem select, and radio buttons so that the user can interact with them.
 */
export function resetInputs() {
    const rangeBar = GET_ELEMENT.getRangeBar();
    const rangeBarResult = GET_ELEMENT.getRangeBarResult();
    addRangebarEvents(rangeBar, rangeBarResult);
    const poemSelectInput = GET_ELEMENT.getPoemSelect();
    poemSelectInput.disabled = false;
    const { wordsRadioButton, quotesRadioButton } = GET_ELEMENT.getRadioButtons();
    wordsRadioButton.disabled = false;
    quotesRadioButton.disabled = false;
}
// =========================== Intitalise guide closing inputs ===========================
/**
 * Sets the event handlers that open and close the dialog containing the guide.
 * Opens the guide by default on startup.
 *
 * The dialog element may not exist. If it doesn't, ignore, rather than trying to set event handlers.
 */
export function initialiseGuideInputs() {
    const cross = GET_ELEMENT.getGuideCross();
    const close = GET_ELEMENT.getGuideClose();
    const dialog = GET_ELEMENT.getDialog();
    const open = GET_ELEMENT.getGuideOpenText();
    if (dialog === null) {
        return;
    }
    if (cross !== null)
        cross.onpointerup = () => closeModal(dialog);
    if (close !== null)
        close.onpointerup = () => closeModal(dialog);
    if (open !== null)
        open.onpointerup = () => dialog.showModal();
    dialog.showModal();
}
function closeModal(modal) {
    modal.close();
}
