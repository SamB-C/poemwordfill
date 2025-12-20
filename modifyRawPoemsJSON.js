const fs = require('fs');

/**
 * @returns {object} Raw poems
 */
function getPoemsRaw() {
    files = fs.readdirSync('./poems/', 'utf-8')
    // Get filenames
    const poemFiles = getAllTextFiles(files);
    // Convert to JSON
    return getJSONofPoems(poemFiles);
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