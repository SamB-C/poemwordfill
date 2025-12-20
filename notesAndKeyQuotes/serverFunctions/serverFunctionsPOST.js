const fs = require('fs');
const { getAllWordsInPoem } = require('../../checkNotesAndQuotes')

// TODO: Delete FAKE_SPACE as not needed.
const FAKE_SPACE = '|+|'

/**
 * Sorts a string of words into their order in the poem.
 * @param {string} poem 
 * @param {string[]} words words to sort
 * @returns {string[]} The ordered words.
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

/**
 * `return oldIdentifier === '__NEW__';`
 * @param {string} oldIdentifier 
 * @returns Boolean
 */
function isNew(oldIdentifier) {
    return oldIdentifier === '__NEW__';
}

/**
 * Sorts notes into their order in the poem by their first word.
 * @param {object} notes All notes in poem
 * @param {string} poemContent
 * @returns Notes in order.
 */
function orderNotes(notes, poemContent) {
    // Get and order first words of each note.
    const firstWords = Object.keys(notes).map(noteText => notes[noteText][0]);
    const orderedFirstWords = insertionSortIntoOrderInPoem(poemContent, firstWords);
    // Order notes
    const orderedNotes = {};
    orderedFirstWords.forEach(firstWord => {
        // Iterate over first words
        Object.keys(notes).forEach(noteText => {
            // Iterate over all notes
            const wordsInNote = notes[noteText];                                // Get the list of words associated with quote.
            const orderedNotesTexts = Object.keys(orderedNotes);                // Get note text for all already ordered notes.
            const wordsInNotesJoined = wordsInNote.join(' ');                   // Convert words in note into a single string
            const orderedNotesWordsJoined = orderedNotesTexts.map(orderedNoteText => orderedNotes[orderedNoteText].join(' '));              // Do the same with the ordered notes
            // Check if note already sorted (Either note text must be different, or the associated words must be different)
            const noteNotInOrderedNotes = (!orderedNotesTexts.includes(noteText) || !orderedNotesWordsJoined.includes(wordsInNotesJoined))  
            if (wordsInNote[0] === firstWord && noteNotInOrderedNotes) {
                // Note must be minimum element in notes, so add to ordered notes.
                orderedNotes[noteText] = wordsInNote;
            }
        })
    });
    return orderedNotes;
}

/**
 * Adds note to, or alters note in, given poem, and orders the notes.
 * @param {object} existingNotes All existing notes for a given poem
 * @param {string} oldIdentifier Old identified for the note
 * @param {object} newVersion New version of the note
 * @param {object} convertedPoem All content for current poem
 * @returns A new object with the updated note
 */
function editNote(existingNotes, oldIdentifier, newVersion, convertedPoem) {
    // Setup
    const alteredNotes = {}
    
    if (existingNotes) {
        // Keep all notes that are not the note in question
        Object.keys(existingNotes).forEach(identifier => {
            if (identifier !== oldIdentifier) {
                alteredNotes[identifier] = existingNotes[identifier];
            } else {
                // Add the changed note in its new form
                alteredNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoem, newVersion.value);
            }
        });
    }

    // Create new note if new
    if (isNew(oldIdentifier)) {
        alteredNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoem, newVersion.value);
    }

    // Order notes by their first word.
    const orderedNotes = orderNotes(alteredNotes, convertedPoem);

    return orderedNotes;
}

/**
 * Remove the number indexes from a word
 * @param {string} word 
 * @returns {string}
 */
function removeCards(word) {
    return word.split('').filter(letter => !letter.match(/[🃊🃁🃂🃃🃄🃅🃆🃇🃈🃉]/)).join('')
}

/**
 * Checks if every word in words appears consecutively in quote to check
 * @param {string[]} words 
 * @param {string[]} quoteToCheck 
 * @returns {object | undefined} Error object or undefined.
 */
function checkAllWordsConsecutive(words, quoteToCheck) {
    // Remove spaces
    const wordsNoSpaces = words.filter(word => removeCards(word) !== '')
    // Get index of first word in quote in the poem
    const indexOfFirstWord = wordsNoSpaces.indexOf(quoteToCheck[0]);
    const errors = quoteToCheck.map((word, index) => {
        // Find where next word should be
        const nextWordInPoem = wordsNoSpaces[indexOfFirstWord + index];
        if (word !== nextWordInPoem) {
            // Return splice of what the next word should be, and what it is instead
            const incorrectSequence = [quoteToCheck[index - 1], word];
            const correctSequence = [quoteToCheck[index - 1] ,nextWordInPoem];
            return {
                incorrectSequence,
                correctSequence,
            }
        }
    });
    // Return the first error
    return errors.filter(err => err !== undefined)[0];
}

/**
 * Checks that no two quotes contain the same word section.
 * @param {string[][]} allQuotes 
 * @param {string[]} quoteToCheck 
 * @returns {string | undefined} Offending word | undefined
 */
function checkNoOverlaps(allQuotes, quoteToCheck) {
    let overlap = undefined
    allQuotes.forEach(quote => {
        // Check each quote
        const quoteIdentifier = quote.join(' ');
        const quoteToCheckIdentifier = quoteToCheck.join(' ');
        if (quoteIdentifier !== quoteToCheckIdentifier) {
            // Given that the quote being checked is not the current quote in the loop
            quote.forEach(word => {
                // Check for overlaps
                if (quoteToCheck.includes(word)) {
                    overlap = word
                }
            })
        }
    })
    return overlap;
}

/**
 * Checks that the contents of all quotes are consecutive in the poem, and that none overlap with each other.
 * @param {string[]} quoteToCheck 
 * @param {string} poemContent 
 * @param {string[][]} allQuotes 
 * @returns {object | undefined} Error object | undefined
 */
function checkQuoteIsValid(quoteToCheck, poemContent, allQuotes) {
    const words = getAllWordsInPoem(poemContent);
    // Check if all words are consecutive in the poem
    const errNotConsecutive = checkAllWordsConsecutive(words, quoteToCheck);
    if (errNotConsecutive) {
        return {
            errorType: 'Words not consecutive',
            error: errNotConsecutive
        }
    }
    // Check if no two quotes overlap
    const errOverlap = checkNoOverlaps(allQuotes, quoteToCheck);
    if (errOverlap !== undefined) {
        return {
            errorType: 'Quote overlap',
            error: errOverlap
        }
    }
    return undefined
}

/**
 * Examines whether note has more than 3 overlaps, and returns the offending word section if it does.
 * @param {object} allNotes 
 * @param {object} noteToCheck 
 * @returns string | undefined
 */
function checkOverlaps(allNotes, noteToCheck) {
    let tooManyOverlaps = undefined;
    noteToCheck.value.forEach(wordSection => {
        let numberOfQuotesWordSectionIsIn = 1;
        Object.keys(allNotes).forEach(noteText => {
            const noteContent = allNotes[noteText];
            if (noteText !== noteToCheck.key) {
                if (noteContent.includes(wordSection)) {
                    numberOfQuotesWordSectionIsIn++;
                }
            }
        });
        if (numberOfQuotesWordSectionIsIn > 3) {
            tooManyOverlaps = wordSection;
        }
    });
    return tooManyOverlaps;
}

/**
 * Checks if note illegally overlaps with 4 others
 * @param {object} noteToCheck 
 * @param {object} allNotes 
 * @returns Error object | undefined
 */
function checkNoteIsValid(noteToCheck, allNotes) {
    const errMoreThanThreeOverlap = checkOverlaps(allNotes, noteToCheck)
    if (errMoreThanThreeOverlap !== undefined) {
        return {
            errorType: 'Note overlap four times',
            error: errMoreThanThreeOverlap
        }
    }
    return undefined
}

/**
 * Sorts quotes against poemContent by their first word.
 * @param {string[][]} quotes 
 * @param {string} poemContent 
 * @returns {string[][]} Ordered quotes
 */
function orderQuotes(quotes, poemContent) {
    // Get first words (enough to sort as there are no overlaps)
    const firstWords = quotes.map(quote => quote[0]);
    const orderedFirstWords = insertionSortIntoOrderInPoem(poemContent, firstWords);
    // Sort by first word
    const orderedQuotes = [];
    orderedFirstWords.forEach(firstWord => {
        quotes.forEach(quote => {
            if (quote[0] === firstWord) {
                orderedQuotes.push(quote);
            }
        })
    });
    return orderedQuotes;
}

/**
 * Edit or add new quote to list of quotes. Order all the quotes and return.
 * @param {string[][]} existingQuotes 
 * @param {string} oldIdentifier 
 * @param {string[][]} newVersion 
 * @param {string} poemContent 
 * @returns 
 */
function editQuote(existingQuotes, oldIdentifier, newVersion, poemContent) {
    // Check if any quotes exist to begin with
    if (existingQuotes) {
        // Replace old quote with new quote
        const alteredQuotes = existingQuotes.map(existingQuote => {
            const identifier = existingQuote.join(' ');
            if (identifier === oldIdentifier) {
                return newVersion;
            }
            return existingQuote;
        });

        // Add new quote if new
        if (isNew(oldIdentifier)) {
            alteredQuotes.push(newVersion);
        }

        const orderedAlteredQuotes = orderQuotes(alteredQuotes, poemContent)

        return orderedAlteredQuotes;
    }
    return [newVersion]
}

/**
 * Logs error to the console.
 * @param {object} err Error to log
 * @param {object} newVersion Offending note/quote
 */
function logErrorMessage(err, newVersion) {
    if (err.errorType === 'Words not consecutive') {
        console.log(`'${newVersion.join(' ')}' is not a valid quote - ${err.errorType}:`);
        const { incorrectSequence, correctSequence } = err.error;
        console.log(`Incorrect sequence = ${incorrectSequence}`);
        console.log(`Correct sequence = ${correctSequence}\n`)
    } else if (err.errorType === 'Quote overlap') {
        console.log(`'${newVersion.join(' ')}' is not a valid quote - ${err.errorType}:`);
        const overlap = err.error;
        console.log(`Word '${overlap}' in multiple quotes.\n`)
    } else {
        console.log(`'${newVersion.key}: ${newVersion.value.join(' ')}' is not a valid note - ${err.errorType}:`);
        const overlap = err.error;
        console.log(`Word ${overlap} appears in more than three notes\n`)
    }
    console.log('Update not complete\n')
}

/**
 * Edits the specified note or quote in convertedPoems.json.
 * @param {string} noteType 'Note' | 'Quote'
 * @param {string} oldIdentifier How the note/quote used to be identified in convertedPoems.json
 * @param {*} newVersion 
 * @param {string} poemName 
 * @returns Whether an error occurs or not.
 */
function editNoteOrQuote(noteType, oldIdentifier, newVersion, poemName) {
    // Gets the converted Poems object from file
    const convertedPoemsJSON = fs.readFileSync('./convertedPoems.json', {encoding: 'utf-8'});
    const convertedPoems = JSON.parse(convertedPoemsJSON);

    const poemContent = convertedPoems[poemName].convertedPoem

    // Edit notes or quotes accordingly
    if (noteType === 'Note') {
        const existingNotes = convertedPoems[poemName].notes;
        const noteNoteValidErrorMessage = checkNoteIsValid(newVersion, existingNotes);
        if (noteNoteValidErrorMessage !== undefined) {
            // Invalid note, log and return error.
            logErrorMessage(noteNoteValidErrorMessage, newVersion);
            return noteNoteValidErrorMessage;
        } else {
            // Valid note, edit in convertedPoems.json
            const alteredNotes = editNote(existingNotes, oldIdentifier, newVersion, poemContent);
            convertedPoems[poemName].notes = alteredNotes
        }
    } else if (noteType === 'Quote') {
        const existingQuotes = convertedPoems[poemName].quotes;
        const quoteNotValidErrorMessage = checkQuoteIsValid(newVersion, poemContent, existingQuotes);
        if (quoteNotValidErrorMessage !==  undefined) {
            // Inalid notee, log and return error.
            logErrorMessage(quoteNotValidErrorMessage, newVersion)
            return quoteNotValidErrorMessage
        } else {
            // Valid quote, edit in convertedPoems.json
            const alteredQuotes = editQuote(existingQuotes, oldIdentifier, newVersion, poemContent);
            convertedPoems[poemName].quotes = alteredQuotes;
        }
    }

    // Write the converted poems object back to file
    fs.writeFile('./convertedPoems.json', JSON.stringify(convertedPoems, null, 4), (err) => {if (err) {throw err;} else {console.log('\nUpdate complete')}});
    return {errorType: 'No error', error: null}
}

/**
 * Handles a post request to the server.
 * @param {object} req Request object.
 * @param {object} res Response object.
 */
function handlePost(req, res) {
    console.log('POST request:');
    // Get content of post request.
    let body = '';
    req.on('data', (data) => {
        body += data;
        console.log('Partial data ->', body);
    });
    req.on('end', () => {
        body = JSON.parse(body);
        console.log('Body ->', body);
        // Make the required edit
        const err = editNoteOrQuote(body.noteType, body.oldIdentifier, body.newVersion, body.poemName)
        // Respond to the client
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(JSON.stringify(err));
        res.end();
    });
}

module.exports = handlePost;