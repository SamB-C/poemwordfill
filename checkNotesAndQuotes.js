const fs = require('fs');
const FAKE_SPACE = '|+|'

/**
 * 
 * @param {object} prevNotes The previous notes for the poem.
 * @param {string[][]} prevQuotes A list of quotes.
 * @param {string} newContent New poem content.
 * @returns All the notes and quotes that are valid given the new content.
 */
function checkNotesAndQuotes(prevNotes, prevQuotes, newContent) {
    // Find which notes and quotes are valid and invalid.
    const notesResult = checkNotes(prevNotes, newContent);
    const quotesResult = checkQuotes(prevQuotes, newContent);
    // Add invalid notes and quotes to './invalidNotesAndQuotes.json' so they can be fixed.
    const invalidNotesAndQuotesJSON = fs.readFileSync('./invalidNotesAndQuotes.json');
    const invalidNotesAndQuotes = JSON.parse(invalidNotesAndQuotesJSON);
    Object.keys(notesResult["invalid"]["word-no-longer-exists"]).forEach(invalidNote => {
        invalidNotesAndQuotes["notes"]["word-no-longer-exists"][invalidNote] = notesResult["invalid"]["word-no-longer-exists"][invalidNote];
    });
    Object.keys(notesResult["invalid"]["four-overlaps"]).forEach(invalidNote => {
        invalidNotesAndQuotes["notes"]["four-overlaps"][invalidNote] = notesResult["invalid"]["four-overlaps"][invalidNote];
    });
    invalidNotesAndQuotes["quotes"]["word-no-longer-exists"] = [
        ...invalidNotesAndQuotes["quotes"]["word-no-longer-exists"],
        ...quotesResult["invalid"]["word-no-longer-exists"]
    ];
    invalidNotesAndQuotes["quotes"]["non-consecutive"] = [
        ...invalidNotesAndQuotes["quotes"]["non-consecutive"],
        ...quotesResult["invalid"]["non-consecutive"]
    ];
    invalidNotesAndQuotes["quotes"]["overlapping"] = [
        ...invalidNotesAndQuotes["quotes"]["overlapping"],
        ...quotesResult["invalid"]["overlapping"]
    ];
    fs.writeFileSync('./invalidNotesAndQuotes.json', JSON.stringify(invalidNotesAndQuotes, null, 4));
    return {
        validNotes: notesResult["valid"],
        validQuotes: quotesResult["valid"]
    }
}

/**
 * @param {object} prevNotes Object containing the previous notes.
 * @param {string} newContent New poem string.
 * @returns Object containing which notes are valid and invalid, and if invalid, why.
 */
function checkNotes(prevNotes, newContent) {
    const validNotes = {}
    const invalidNotes = {}
    if (prevNotes !== undefined) {
        // Iterate over previous notes.
        Object.keys(prevNotes).forEach(noteText => {
            // Check if each word still exists.
            let valid = true;
            prevNotes[noteText].forEach(wordSection => {
                valid = checkWordSectionExists(wordSection, newContent)
            })
            if (valid) {
                validNotes[noteText] = prevNotes[noteText];
            } else {
                invalidNotes[noteText] = prevNotes[noteText];
            }
        })
    }
    // Check
    const { overlappingNotes, nonOverlappingNotes } = checkOverlaps(validNotes)
    return {
        "invalid": {
            "word-no-longer-exists": invalidNotes,
            "four-overlaps": overlappingNotes
        },
        "valid": nonOverlappingNotes
    }
}

/**
 * Checks if quotes are valid, and if not, indicates why.
 * @param {string[][]} prevQuotes 
 * @param {string} newContent 
 * @returns object indicating whether quote is invalid or valid, and if invalid, why it is invalid.
 */
function checkQuotes(prevQuotes, newContent) {
    const validQuotes = [];
    const invalidQuotes = [];
    if (prevQuotes !== undefined) {
        // Iterate over all quotes.
        prevQuotes.forEach(quoteToCheck => {
            let valid = true;
            // Check if each word still exists
            quoteToCheck.forEach(wordSection => {
                valid = checkWordSectionExists(wordSection, newContent);
            });
            if (valid) {
                validQuotes.push(quoteToCheck);
            } else {
                invalidQuotes.push(quoteToCheck);
            }
        });
    }
    // Check if words in quotes are consecutive, and if quotes overlap.
    const { consecutiveWordsQuotes, nonConsecutiveWordsQuotes } = checkQuotesConsecutive(validQuotes, newContent);
    const { nonOverlappingQuotes, overlappingQuotes } = checkQuoteOverlaps(consecutiveWordsQuotes);
    return {
        "invalid": {
            "word-no-longer-exists": invalidQuotes,
            "non-consecutive": nonConsecutiveWordsQuotes,
            "overlapping": overlappingQuotes,
        },
        "valid": nonOverlappingQuotes
    };
}

/**
 * Finds notes that have a word section appearing in more than three notes.
 * @param {object} prevNotes Object containing the previous notes.
 * @returns Object partitioning notes into those that contain overlaps, and those that don't.
 */
function checkOverlaps(prevNotes) {
    const returnValue = {
        overlappingNotes: {},
        nonOverlappingNotes: {},
    };
    // Iterate over each note.
    Object.keys(prevNotes).forEach(noteText => {
        valid = true;
        // Iterate over highlighted words in note.
        prevNotes[noteText].forEach(wordSection => {
            let numberOfQuotesWordSectionIsIn = 1;
            // Iterate over all notes.
            Object.keys(prevNotes).forEach(noteTextForNoteToCheckAgainst => {
                // Get words in quote to check against
                const noteToCheckAgainstContent = prevNotes[noteTextForNoteToCheckAgainst];
                // Increment counter of how many times word appears in other notes
                if (noteText !== noteTextForNoteToCheckAgainst) {
                    if (noteToCheckAgainstContent.includes(wordSection)) {
                        numberOfQuotesWordSectionIsIn++;
                    }
                }
            });
            // If word is in more than 3 notes, mark as invalid.
            if (numberOfQuotesWordSectionIsIn > 3) {
                valid = false;
            }
        });
        if (valid) {
            returnValue.nonOverlappingNotes[noteText] = prevNotes[noteText];
        } else {
            returnValue.overlappingNotes[noteText] = prevNotes[noteText];
        }
    });
    return returnValue;
}

/**
 * Finds which quotes overlap, and which don't
 * @param {string[][]} quotes 
 * @returns Object containing which quotes don't overlap, and which do.
 */
function checkQuoteOverlaps(quotes) {
    const returnValue = {
        overlappingQuotes: [],
        nonOverlappingQuotes: []
    };
    // Check if each word in a quote is not in another quote.
    quotes.forEach(quote => {
        let valid = true;
        quote.forEach(word => {
            quotes.forEach(quoteToCheckAgainst => {
                if (quote.join(' ') !== quoteToCheckAgainst.join(' ')) {
                    valid = !quoteToCheckAgainst.includes(word)
                }
            });
        });
        if (valid) {
            returnValue.nonOverlappingQuotes.push(quote);
        } else {
            returnValue.overlappingQuotes.push(quote);
        }
    });
    return returnValue;
}

/**
 * Removes any numbers from a word.
 * @param {string} word 
 * @returns {string}
 */
function removeCards(word) {
    return word.split('').filter(letter => !letter.match(/[🃊🃁🃂🃃🃄🃅🃆🃇🃈🃉]/)).join('');
}

/**
 * Gets all the word sections in the poem, in order.
 * @param {string} poemContent 
 * @returns {string[][]}
 */
function getAllWordsInPoem(poemContent) {
    // Get lines
    const lines = poemContent.split('\n');
    const words = [];
    // Get words
    lines.forEach(line => {
        const wordsInLine = line.split(' ');
        const wordSections = [];
        // Get word sections
        wordsInLine.forEach(word => {
            const wordSectionsOfSingleWord = word.split(FAKE_SPACE);
            wordSections.push(...wordSectionsOfSingleWord);
        });
        words.push(...wordSections);
    })
    return words
}

/**
 * Checks if all the words in a quote are consecutive in the poem.
 * @param {string[][]} quotes 
 * @param {string} poemContent 
 * @returns Object of which quotes are consecutive or not.
 */
function checkQuotesConsecutive(quotes, poemContent) {
    const returnValue = {
        consecutiveWordsQuotes: [],
        nonConsecutiveWordsQuotes: []
    }
    // Get all words in the poem
    const allWordsinPoem = getAllWordsInPoem(poemContent);
    quotes.forEach(quote => {
        const wordsNoSpaces = allWordsinPoem.filter(word => removeCards(word) !== '')
        const indexOfFirstWord = wordsNoSpaces.indexOf(quote[0])
        let valid = true;
        // Check that the words are consecutive.
        quote.forEach((word, index) => {
            const nextWordInPoem = wordsNoSpaces[indexOfFirstWord + index];
            if (word !== nextWordInPoem) {
                valid = false;
            }
        });
        if (valid) {
            returnValue.consecutiveWordsQuotes.push(quote);
        } else {
            returnValue.nonConsecutiveWordsQuotes.push(quote);
        }
    })
    return returnValue;
}

/**
 * Checks that a word section actually exists in the new poem
 * @param {string} wordSection word to check 
 * @param {string} newContent poem content to check against
 * @returns {bool} Whether wordSection exists in poem
 */
function checkWordSectionExists(wordSection, newContent) {
    return newContent.includes(wordSection);
}


module.exports = {getAllWordsInPoem, checkNotesAndQuotes}