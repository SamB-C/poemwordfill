import { FAKE_SPACE, GET_ID } from "./utilities.js";
export const GUIDE_CROSS_ID = "__dialog_cross__";
export const GUIDE_CLOSE_ID = "__guide_close_button__";
export const GUIDE_OPEN_TEXT_ID = "__guide_open__";
export const POEM_ID = '__poem_id__';
export const POEM_CONTAINER = '__main_content_container__';
export const RANGEBAR_ID = '__range_bar__';
export const RANGEBAR_RESULT_ID = '__range_bar_result__';
export const POEM_SELECT_ID = '__poem_selection__';
export const ANTHOLOGY_SELECT_ID = '__anthology__';
export const NOTES_ID = '__notes__';
export const NOTES_INFO_ID = '__notes_info__';
export const NOTE_REMOVAL_DELAY = 1000;
export const UNDERLINE_COLORS = ['red', 'blue', 'green'];
export const TRY_AGAIN_LINK_ID = '__try_again__';
export const COMPLETION_TEXT_ID = '__completion_text__';
export const COMPLETION_TEXT_COLOUR = '#00FF00';
export const COMPLETION_BORDER_CSS = '1vh solid green';
export const POEM_AUTHOR_ID = "__poem_author__";
export const NUMBER_ONLY_REGEX = /^[0-9]+$/;
export const SPECIAL_CHARACTER_REGEX = /[.,:;]/;
export const FAKE_SPACE_HTML_ELEMENT = `<p class="fakeSpace">${FAKE_SPACE}</p>`;
export const ANIMATION_SPEED = 20;
export const COVER_OVER_COMPLETED_WORDS = true;
export const INPUT_OPTIONS = 'placeholder="_" size="1" maxlength="1" autocapitalize="off" class="letter_input"';
export const NUMBER_OF_INCORRECT_ATTEMPTS_FOR_AID = 3;
export const LETTER_INPUT_DEFAULT_COLOR = 'orange';
export const REPLACE_WORDS_RADIO_BUTTON_ID = '__words__';
export const REPLACE_QUOTES_RADIO_BUTTON_ID = '__quotes__';
export const WORDS = 'words';
export const QUOTES = 'quotes';
/**
 * An object containing methods that get specific elements from the DOM
 */
export const GET_ELEMENT = {
    /**
     * @param word The word to get the element of
     * @returns The element of that word from the DOM
     */
    getElementOfWord(word) {
        return document.getElementById(GET_ID.formatIdForWord(word));
    },
    /**
     * @returns The element of the poem container element from the DOM
     */
    getPoemElement() {
        return document.getElementById(POEM_ID);
    },
    /**
     * @returns The range bar input element from the DOM
     */
    getRangeBar() {
        return document.getElementById(RANGEBAR_ID);
    },
    /**
     * @returns The dropdown anthology selection element from the DOM
     */
    getAnthologySelect() {
        return document.getElementById(ANTHOLOGY_SELECT_ID);
    },
    /**
     * @returns The dropdown poem selection element from the DOM
     */
    getPoemSelect() {
        return document.getElementById(POEM_SELECT_ID);
    },
    /**
     * @returns The paragraph displaying the percentage of the words/quotes to remove from the poem
     */
    getRangeBarResult() {
        return document.getElementById(RANGEBAR_RESULT_ID);
    },
    /**
     * @returns The words and quotes selection radio buttons form the DOM
     */
    getRadioButtons() {
        const wordsRadioButton = document.getElementById(REPLACE_WORDS_RADIO_BUTTON_ID);
        const quotesRadioButton = document.getElementById(REPLACE_QUOTES_RADIO_BUTTON_ID);
        return { wordsRadioButton, quotesRadioButton };
    },
    /**
     * @returns The try again link element that displays when a user has completed a poem, from the DOM
     */
    getTryAgainLink() {
        return document.getElementById(TRY_AGAIN_LINK_ID);
    },
    /**
     * @returns The DOM element containing the Notes header and the currently displayed notes
     */
    getNotes() {
        return document.getElementById(NOTES_ID);
    },
    /**
     * @returns The DOM of the card containing the poem title, content and author
     */
    getPoemContainer() {
        return document.getElementById(POEM_CONTAINER);
    },
    /**
     * @returns The DOM element containing the completion text that shows when the user completes a poem
     */
    getCompletionText() {
        return document.getElementById(COMPLETION_TEXT_ID);
    },
    /**
     * @returns The DOM paragraph element hinting to the user how to use the notes
     */
    getNotesInfo() {
        return document.getElementById(NOTES_INFO_ID);
    },
    /**
     * @returns The entire HTML element from the DOM
     */
    getHtmlElement() {
        return document.getElementsByTagName('html')[0];
    },
    /**
     * @returns The Cross element in the guide modal, or null.
     */
    getGuideCross() {
        return document.getElementById(GUIDE_CROSS_ID);
    },
    /**
     * @returns The Close button element in the guide modal, or null.
     */
    getGuideClose() {
        return document.getElementById(GUIDE_CLOSE_ID);
    },
    /**
     * @returns The first dialog element, or null.
     */
    getDialog() {
        const dialogs = document.getElementsByTagName('dialog');
        if (dialogs.length === 0) {
            return null;
        }
        else {
            return dialogs[0];
        }
    },
    /**
     * @returns The text "here" that opens the guide dialog, or null.
     */
    getGuideOpenText() {
        return document.getElementById(GUIDE_OPEN_TEXT_ID);
    }
};
