export const POEM_ID = '__poem_id__';
export const RANGEBAR_ID = '__range_bar__';
export const RANGEBAR_RESULT_ID = '__range_bar_result__';
export const POEM_SELECT_ID = '__poem_selection__'
export const TRY_AGAIN_LINK_ID = '__try_again__'
export const POEM_AUTHOR_ID = "__poem_author__";
export const NUMBER_ONLY_REGEX = /^[0-9]+$/
export const SPECIAL_CHARACTER_REGEX = /[.,:;]/
export const FAKE_SPACE: string = '|+|';
export const FAKE_SPACE_HTML_ELEMENT: string = `<p class="fakeSpace">${FAKE_SPACE}</p>`
export const ANIMATION_SPEED: number = 20
export const COVER_OVER_COMPLETED_WORDS = false;
export const INPUT_OPTIONS: string = 'placeholder="_" size="1" maxlength="1" autocapitalize="off" class="letter_input"'

export type convertedPoemsJSON = {
    [nameOfPoem: string]: {
        convertedPoem: string,
        wordCount: number,
        author: string,
        centered: boolean
    }
}