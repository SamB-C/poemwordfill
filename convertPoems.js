const fs = require('fs');
const { checkNotesAndQuotes } = require('./checkNotesAndQuotes');
const { getPoemsRaw } = require('./modifyRawPoemsJSON');

const NUMBERS = ['🃊', '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉'];
const SPECIAL_CHARACTER_REGEX = /[.,:;]/;
const FAKE_SPACE = '|+|';


// Gets existing Converted Poems
const prevConvertedPoemsJSON = fs.readFileSync('./convertedPoems.json', {encoding: 'utf-8'});
const prevConvertedPoems = JSON.parse(prevConvertedPoemsJSON);

const result = {};
const poems = getPoemsRaw();
const poemSettings = getPoemSettings();
// Iterate over all poems
Object.entries(poems).map((keyValuePair) => {
    const poemName = keyValuePair[0];
    const poemFileContent = keyValuePair[1];

    const { poemContent, poemAuthor } = getPoemNameContentAuthor(poemFileContent);

    // Adds instance numbers around words, and adds in fake spaces where necessary.
    const poemInfo = addInstanceNumbersToWords(poemName, poemContent);

    // Create object to write.
    result[poemName] = poemInfo;
    result[poemName]["author"] = poemAuthor;
    if (prevConvertedPoems[poemName] !== undefined) {
        // Poem already existed, so copy over notes and quotes. (Although poem may have been altered)
        // TODO add seperate check before poemInfo, to see if poem hasn't changed at all
        const prevQuotes = prevConvertedPoems[poemName]["quotes"];
        const prevNotes = prevConvertedPoems[poemName]["notes"];
        const newPoemContent = result[poemName]['convertedPoem'];
        // Check that no notes and quotes have been made invalid by the edit
        // TODO, automatically shift indexes in notes and quotes as needed if poem altered
        const {validNotes, validQuotes} = checkNotesAndQuotes(prevNotes, prevQuotes, newPoemContent);
        result[poemName]['quotes'] = validQuotes
        result[poemName]['notes'] = validNotes;
    } else {
        result[poemName]['quotes'] = [];
        result[poemName]['notes'] = {};
    }
    addSettings(poemSettings, poemName, result)
    console.log(poemName, `by ${poemAuthor}` , poemInfo['wordCount']);
})
fs.writeFile('./convertedPoems.json', JSON.stringify(result, null, 4), (err) => {if (err) {throw err;} else {console.log('\nAll poems complete!')}});


/**
 * Gets the poem name, content, and author from the raw string.
 * @param {String} poemFileContent Content of poem as string.
 * @returns {poemName: string, poemContent: string, poemAuthor: string}
 */
function getPoemNameContentAuthor(poemFileContent) {
    const listOfLines = poemFileContent.split('\n');
    const poemName = listOfLines.splice(0, 2)[0];
    const poemAuthor = listOfLines.splice(listOfLines.length - 2, 2)[1];
    const poemContent = listOfLines.join('\n');
    return {
        poemName,
        poemContent,
        poemAuthor
    }
}

/**
 * @returns An object contaning the poem settings stored in './poems/poemSettings.json'.
 */
function getPoemSettings() {
    const poemSettingsJSON = fs.readFileSync('./poems/poemSettings.json', {encoding: 'utf8'});
    const poemSettings = JSON.parse(poemSettingsJSON)
    return poemSettings
}

/**
 * Copy poem settings for this poem into result. Poem settings are currently only if poem is centered or not.
 * This is where I should also add the anthology it is in, and position in the anthology.                           <----- IMPORTANT
 * @param {object} poemSettings The poem settings stored in './poems/poemSettings.json'.
 * @param {string} poemName
 * @param {object} result Object to write settings to.
 */
function addSettings(poemSettings, poemName, result) {
    const centeredPoems = poemSettings["centered"];
    if (centeredPoems.includes(poemName)) {
        result[poemName]['centered'] = true;
    } else {
        result[poemName]['centered'] = false;
    }
}

/**
 * Gets add the instance numbers to the words in the poem, and gets the poem's word count
 * @param {string} poemName
 * @param {string} poemContent 
 * @returns {convertedPoem: , wordCount: int}
 */
function addInstanceNumbersToWords(poemName, poemContent) {
    const wordsAlreadyInPoem = {"__words__": 0};
    return {
        'convertedPoem': mapOverLines(poemContent, wordsAlreadyInPoem), 
        'wordCount': wordsAlreadyInPoem['__words__'],
    };
}


/**
 * Maps over all the lines in the poem.
 * @param {string} poem 
 * @param {object} wordsAlreadyInPoem Object containing a count of existing words in the poem
 * @returns String of poem with word indexes wrapped around each word.
 */
function mapOverLines(poem, wordsAlreadyInPoem) {
    const returnValue =  poem.split(/\n/)
                .map((line) => lineMapFunction(line, wordsAlreadyInPoem))
                .join('\n');
    return returnValue
}

// 
/**
 * Maps over all the words in each line. Also increments the word count.
 * @param {string} line 
 * @param {object} wordsAlreadyInPoem Object containing a count of existing words in the poem
 * @returns String of line with word indexes wrapped around each word.
 */
function lineMapFunction(line, wordsAlreadyInPoem) {
    const returnValue = line.split(' ')
                .map((word) => {
                    increaseWordCount(word, wordsAlreadyInPoem)
                    return wordMapFunction(word, wordsAlreadyInPoem)
                })
                .join(' ');
    return returnValue;
}

/**
 * Increases the word count if the word is not a space.
 * @param {string} word 
 * @param {object} wordsAlreadyInPoem Object containing a count of existing words in the poem
 */
function increaseWordCount(word, wordsAlreadyInPoem) {
    // Only increases word count for words that are not a space
    if (word) {
        wordsAlreadyInPoem['__words__'] = wordsAlreadyInPoem['__words__'] + 1
    }
}

/**
 * Sorts out whether the word has a special character and deals with it, before giving the word instance numbers
 * @param {string} word 
 * @param {object} wordsAlreadyInPoem Object containing a count of existing words in the poem
 * @returns String with word wrapped in instance numbers.
 */
function wordMapFunction(word, wordsAlreadyInPoem) {
    if (word.match(SPECIAL_CHARACTER_REGEX)) {
        // Add the fake space between text and special character
        const newWord = specialCharacterCaseGetWordSections(word);
        // Gives each word section their instance numbers
        return newWord.split(FAKE_SPACE).map((sectionOfWord) => {
            return giveWordInstanceNumber(sectionOfWord, wordsAlreadyInPoem);
        }).join(FAKE_SPACE);
    }
    else {
        // Case for normal words (and spaces)
        return giveWordInstanceNumber(word, wordsAlreadyInPoem);
    }
}

/**
 * Add the fake space between text and special character.
 * @param {string} word word containing a special character.
 * @returns String with word and special character seperated by fake space |+|.
 */
function specialCharacterCaseGetWordSections(word) {
    return word.split('')
    .map((letter) => {
        if (letter.match(SPECIAL_CHARACTER_REGEX)) {
            return FAKE_SPACE + letter;
        }
        return letter;
    }).join('');
}

/**
 * Adds instance numbers to word sections
 * @param {string} word Word to add instance numbers to
 * @param {object} instances Object containing a count of existing words in the poem
 * @returns Word wrapped in instance numbers.
 */
function giveWordInstanceNumber(word, instances) {
    if (word in instances) {
        instances[word] = instances[word] + 1;
    }
    else {
        instances[word] = 1;
    }
    return NUMBERS[instances[word]] + word + NUMBERS[instances[word]];
}