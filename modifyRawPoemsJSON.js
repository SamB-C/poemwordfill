const fs = require('fs');

/**
 * @returns {object} Raw poems
 */
function getPoemsRaw() {
    files = fs.readdirSync('./poems/', 'utf-8')
    // Get filenames
    const poemFiles = getAllTextFiles(files);
    // Convert to JSON
    const resultJSON = getJSONofPoems(poemFiles);
    // Put poems into correct order
    const order = getPoemOrder();
    return orderPoems(order, resultJSON)
}

/**
 * Filters out all files that are not text files.
 * @param {String[]} files A list of files.
 * @returns A list of filenames.
 */
function getAllTextFiles(files) {
    const poemFiles = []
    // Could use filter
    files.forEach((file) => {
        if (file.match(/.txt$/)) {
            poemFiles.push(file);
        }
    });
    return poemFiles;
}

/**
 * Reads all files provided, and returns them in a JSON format.
 * @param {String[]} poemFiles List of filenames.
 * @returns An object of poems in format {"Title": "Content"}
 */
function getJSONofPoems(poemFiles) {
    const resultJSON = {};
    // Could use reduce
    poemFiles.forEach((poem) => addPoemToJSON(poem, resultJSON));
    return resultJSON
}

/**
 * Reads file, and adds file to JSON object. If peoms name in filename and title don't match, throw error.
 * @param {string} file File to read
 * @param {object} jsonFile Object to add poem to.
 */
function addPoemToJSON(file, jsonFile) {
    const poemName = file.replace('.txt', '');
    const content = fs.readFileSync(`./poems/${file}`, {encoding: 'utf8'});
    jsonFile[poemName] = content;
    const poemNameInFile = content.split('\n')[0];
    if (poemNameInFile !== poemName) {
        throw new Error(`Poem file name doesn't equal poem name in file:\n${poemName} !== ${poemNameInFile}\n`)
    }
}

/**
 * Gets the order of the poems from poem settings.
 * @returns List of poem titles as strings.
 */
function getPoemOrder() {
    const orderJSON = fs.readFileSync('./poems/poemSettings.json', {encoding: 'utf8'});
    return JSON.parse(orderJSON)['order'];
}

/**
 * 
 * @param {string[]} order List of strings indicating order of poems in anthology.
 * @param {object} poems JSON of all the poems.
 * @returns Object containing all the poems in the correct order.
 */
function orderPoems(order, poems) {
    const poemsInOrder = {};
    order.forEach(poem => {
        poemsInOrder[poem] = poems[poem];
    })
    return poemsInOrder;
}

/**
 * Writes JSON to './rawPoems.json'.
 */
function updateRawPoemsJSON() {
    const poemsJSON = getPoemsRaw()
    fs.writeFile('./rawPoems.json', JSON.stringify(poemsJSON), (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log('rawPoems.json updated');
        }
    })
}

module.exports = {getPoemsRaw, updateRawPoemsJSON}