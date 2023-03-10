const fs = require('fs');
const { getAllWordsInPoem } = require('../../checkNotesAndQuotes')

const FAKE_SPACE = '|+|'

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

function isNew(oldIdentifier) {
    return oldIdentifier === '__NEW__';
}

function orderNotes(notes, poemContent) {
    const firstWords = Object.keys(notes).map(noteText => notes[noteText][0]);
    const orderedFirstWords = insertionSortIntoOrderInPoem(poemContent, firstWords);
    const orderedNotes = {};
    orderedFirstWords.forEach(firstWord => {
        Object.keys(notes).forEach(noteText => {
            const wordsInNote = notes[noteText];
            const orderedNotesTexts = Object.keys(orderedNotes);
            const wordsInNotesJoined = wordsInNote.join(' ');
            const orderedNotesWordsJoined = orderedNotesTexts.map(orderedNoteText => orderedNotes[orderedNoteText].join(' '));
            const noteNotInOrderedNotes = (!orderedNotesTexts.includes(noteText) || !orderedNotesWordsJoined.includes(wordsInNotesJoined))
            if (wordsInNote[0] === firstWord && noteNotInOrderedNotes) {
                orderedNotes[noteText] = wordsInNote;
            }
        })
    });
    return orderedNotes;
}

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

    if (isNew(oldIdentifier)) {
        alteredNotes[newVersion.key] = insertionSortIntoOrderInPoem(convertedPoem, newVersion.value);
    }

    const orderedNotes = orderNotes(alteredNotes, convertedPoem);

    return orderedNotes;
}

function removeNumbers(word) {
    return word.split('').filter(letter => !letter.match(/[0-9]/)).join('')
}

function checkAllWordsConsecutive(words, quoteToCheck) {
    const wordsNoSpaces = words.filter(word => removeNumbers(word) !== '')
    const indexOfFirstWord = wordsNoSpaces.indexOf(quoteToCheck[0]);
    const errors = quoteToCheck.map((word, index) => {
        const nextWordInPoem = wordsNoSpaces[indexOfFirstWord + index];
        if (word !== nextWordInPoem) {
            const incorrectSequence = [quoteToCheck[index - 1], word];
            const correctSequence = [quoteToCheck[index - 1] ,nextWordInPoem];
            return {
                incorrectSequence,
                correctSequence,
            }
        }
    });
    return errors.filter(err => err !== undefined)[0];
}

function checkNoOverlaps(allQuotes, quoteToCheck) {
    let overlap = undefined
    allQuotes.forEach(quote => {
        const quoteIdentifier = quote.join(' ');
        const quoteToCheckIdentifier = quoteToCheck.join(' ');
        if (quoteIdentifier !== quoteToCheckIdentifier) {
            quote.forEach(word => {
                if (quoteToCheck.includes(word)) {
                    overlap = word
                }
            })
        }
    })
    return overlap;
}

function checkQuoteIsValid(quoteToCheck, poemContent, allQuotes) {
    const words = getAllWordsInPoem(poemContent);
    const errNotConsecutive = checkAllWordsConsecutive(words, quoteToCheck);
    if (errNotConsecutive) {
        return {
            errorType: 'Words not consecutive',
            error: errNotConsecutive
        }
    }
    const errOverlap = checkNoOverlaps(allQuotes, quoteToCheck);
    if (errOverlap !== undefined) {
        return {
            errorType: 'Quote overlap',
            error: errOverlap
        }
    }
    return undefined
}

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

function orderQuotes(quotes, poemContent) {
    const firstWords = quotes.map(quote => quote[0]);
    const orderedFirstWords = insertionSortIntoOrderInPoem(poemContent, firstWords);
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

function editQuote(existingQuotes, oldIdentifier, newVersion, poemContent) {
    if (existingQuotes) {
        const alteredQuotes = existingQuotes.map(existingQuote => {
            const identifier = existingQuote.join(' ');
            if (identifier === oldIdentifier) {
                return newVersion;
            }
            return existingQuote;
        });

        if (isNew(oldIdentifier)) {
            alteredQuotes.push(newVersion);
        }

        const orderedAlteredQuotes = orderQuotes(alteredQuotes, poemContent)

        return orderedAlteredQuotes;
    }
    return [newVersion]
}

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
            logErrorMessage(noteNoteValidErrorMessage, newVersion);
            return noteNoteValidErrorMessage;
        } else {
            const alteredNotes = editNote(existingNotes, oldIdentifier, newVersion, poemContent);
            convertedPoems[poemName].notes = alteredNotes
        }
    } else if (noteType === 'Quote') {
        const existingQuotes = convertedPoems[poemName].quotes;
        const quoteNotValidErrorMessage = checkQuoteIsValid(newVersion, poemContent, existingQuotes);
        if (quoteNotValidErrorMessage !==  undefined) {
            logErrorMessage(quoteNotValidErrorMessage, newVersion)
            return quoteNotValidErrorMessage
        } else {
            const alteredQuotes = editQuote(existingQuotes, oldIdentifier, newVersion, poemContent);
            convertedPoems[poemName].quotes = alteredQuotes;
        }
    }

    // Write the converted poems object back to file
    fs.writeFile('./convertedPoems.json', JSON.stringify(convertedPoems, null, 4), (err) => {if (err) {throw err;} else {console.log('\nUpdate complete')}});
    return {errorType: 'No error', error: null}
}

function handlePost(req, res) {
    console.log('POST request:');
    let body = '';
    req.on('data', (data) => {
        body += data;
        console.log('Partial data ->', body);
    });
    req.on('end', () => {
        body = JSON.parse(body);
        console.log('Body ->', body);
        const err = editNoteOrQuote(body.noteType, body.oldIdentifier, body.newVersion, body.poemName)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(JSON.stringify(err));
        res.end();
    });
}

module.exports = handlePost;