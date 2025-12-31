export const FAKE_SPACE: string = '|+|';

/**
 * Helper functions used to manipulate words
 */
export const WORD_FUNCS = {
    /**
     * Splits a word into sections on the fake space character
     * @param word The word to split into sections
     * @returns A list of the sections of the word
     */
    getWordSectionsFromWord(word: string): Array<string> {
        return word.split(FAKE_SPACE).filter((wordSection: string) => {
            return wordSection !== '';
        })
    },
    /**
     * @param word The word to remove the instance numbers from
     * @returns The words with all numbers removed
     */
    removeNumberFromWord(word: string): string {
        return word
            .split('')
            .filter(letter => !isCard(letter))
            .join('');
    }
}

/**
 * Helper functions used to get ids for words and letters
 */
export const GET_ID = {
    /**
     * @param letter The letter to get the binary representation of
     * @returns The binary representation of the letter as a string
     */
    getBinaryFromLetter(letter:string): string {
        return letter.charCodeAt(0).toString(2);
    },
    /**
     * Replaces double quotes with single quotes to avoid errors in the HTML
     * @param word - The word to format for use in an id
     * @returns The word with all double quotes replaced with single quotes
     */
    formatIdForWord(word: string): string {
        if (word.includes('"')) {
            return word.replace(/"/, "'");
        } else {
            return word
        }
    },
    /**
     * Calculates the id for a letter in a word
     * @param word The word that the letter is in
     * @param letter The letter to get the id for
     * @returns The id for the letter
     */
    getIdForLetter(word: string, letter: string): string {
        return `${this.formatIdForWord(word)}_${this.getBinaryFromLetter(letter)}`
    },
}


/**
 * Compares a letter against the cards 1 to 10 of diamonds to see if it is a card.
 * @param letter Letter to check.
 * @returns Whether the letter is a card or not.
 */
export function isCard(letter: string): boolean {
    return letter.match(/[🃊🃁🃂🃃🃄🃅🃆🃇🃈🃉]/) !== null
}


/**
 * Helper functions used to focus the user on specific elements
 */
export const FOCUS = {
    /**
     * Focuses the user on the first letter of the specified word
     * @param word The word to focus the first letter of
     */
    focusFirstLetterOfWord(word: string) {
        const firstLetter = WORD_FUNCS.removeNumberFromWord(word)[0];
        const inputToFocusId: string = `${GET_ID.getIdForLetter(word, firstLetter)}`;
        const firstInputElement: HTMLElement = document.getElementById(inputToFocusId)!;
        firstInputElement.focus();
    }
}

/**
 * @param element The element to get the children of. All the children should be input elements
 * @returns An array of input elements
 */
export function getArrayOfChildrenThatAreInputs(element: HTMLSpanElement): Array<HTMLInputElement> {
    const arrayOfChildren = Array.from(element.children) as Array<HTMLInputElement>;
    return arrayOfChildren;
}

// Splits the poem into a list of words
/**
 * Split the poem into a list of word sections
 * @param poem The content of the poem to get all the word sections from
 * @returns A list of all non-empty word sections in the poem
 */
export function getAllWordSectionsInPoem(poem: string): Array<string> {
    const allLinesInPoem: Array<string> = poem.split(/\n/);
    const allWordsInPoem: Array<string> = allLinesInPoem.map((line: string): Array<string> => {
        return line.split(' ');
    }).reduce((accumulator: Array<string>, current: Array<string>) => {
        return accumulator.concat(current);
    })
    const allWordSectionsInPoem: Array<string> = allWordsInPoem.map((word: string) => {
        return WORD_FUNCS.getWordSectionsFromWord(word);
    }).reduce((accumulator: Array<string>, wordSections: Array<string>) => {
        return accumulator.concat(wordSections);
    })
    return allWordSectionsInPoem.filter(wordSection => WORD_FUNCS.removeNumberFromWord(wordSection) !== '');
}


/**
 * Removes the instance numbers from a word
 * @param word The word to remove numbers from
 * @returns A word without the instance numbers
 */
/*
export function removeNumbers(word: string): string {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('');
}
*/