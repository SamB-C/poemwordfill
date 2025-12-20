const fs = require('fs');

/**
 * Deletes a note or quote from convertedPoems.json
 * @param {string} poemName 
 * @param {string} noteOrQuote 'Note' | 'Quote' 
 * @param {string} identifier 
 */
function deleteNoteOrQuote(poemName, noteOrQuote, identifier) {
    // Read convertedPoems.json
    const convertedPoemsJSON = fs.readFileSync('./convertedPoems.json', {encoding: 'utf-8'});
    const convertedPoems = JSON.parse(convertedPoemsJSON);

    if (noteOrQuote === 'Note') {
        const existingNotes = convertedPoems[poemName].notes;
        const remainingNotes = {}
        // Filter out note to remove
        Object.keys(existingNotes).forEach(noteText => {
            if (noteText !== identifier) {
                remainingNotes[noteText] = existingNotes[noteText];
            }
        });
        convertedPoems[poemName].notes = remainingNotes;

    } else {
        const existingQuotes = convertedPoems[poemName].quotes;
        const listToRemove = identifier.split(' ');
        // Filter out quote to remove
        const remainingQuotes = existingQuotes.filter((quote) => {
            const matches = quote.map((word, index) => word === listToRemove[index]);
            return matches.includes(false);
        });
        convertedPoems[poemName].quotes = remainingQuotes;
    }
    // Write result
    fs.writeFile('./convertedPoems.json', JSON.stringify(convertedPoems, null, 4), (err) => {if (err) {throw err;} else {console.log('\nDeletion complete')}});
}

/**
 * Handle DELETE requests and returns a response.
 * @param {object} req Request object
 * @param {object} res Response object
 */
function handleDelete(req, res) {
    console.log('DELETE request:');
    let body = '';
    req.on('data', (data) => {
        body += data;
        console.log('Partial data ->', body);
    });
    req.on('end', () => {
        body = JSON.parse(body);
        console.log('Body ->', body);
        deleteNoteOrQuote(body.poemName, body.identifierFor, body.identifier)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('deleted successfuly');
    });
}

module.exports = handleDelete;