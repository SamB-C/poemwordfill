/**
 * Should only be run if no poems contain numbers.
 * This finds the numbers in all poems, notes, and quotes, and replaces them with the cards 1 - 10 of diamonds
 * (Where 0 = 10)
 */

const fs = require('fs');

const NUMBERS = ['🃊', '🃁', '🃂', '🃃', '🃄', '🃅', '🃆', '🃇', '🃈', '🃉'];


const json = JSON.parse(fs.readFileSync("./convertedPoems.json", {encoding: 'utf-8'}));

const result = {}
Object.keys(json).forEach(poemName => {
    result[poemName] = {
        "convertedPoem": replaceNumbers(json[poemName]["convertedPoem"]),
        "wordCount": json[poemName]["wordCount"],
        "author": json[poemName]["author"],
        "quotes": replaceQuotes(json[poemName]["quotes"]),
        "notes": replaceNotes(json[poemName]["notes"]),
        "centered": json[poemName]["centered"]
    }
});

fs.writeFile('./convertedPoems.json', JSON.stringify(result, null, 4), (err) => {if (err) {throw err;} else {console.log('\nAll poems complete!')}});

/**
 * Replaces all numbers in quotes with cards.
 * @param {string[][]} quotes 
 * @returns {string[][]}
 */
function replaceQuotes(quotes) {
    return quotes.map(words => {
        return words.map(word => replaceNumbers(word));
    });
}

/**
 * Replaces all numbers in notes with cards.
 * @param {{[name: string]: string[]}} notes 
 * @returns {{[name: string]: string[]}}
 */
function replaceNotes(notes) {
    const result = {};
    Object.keys(notes).forEach(note => {
        result[note] = notes[note].map(word => replaceNumbers(word));
    });
    return result;
}

/**
 * Replaces all numbers in a string with cards.
 * @param {string} s 
 * @returns {string}
 */
function replaceNumbers(s) {
    let result = s;
    for (let index in NUMBERS) {
        result = result.replaceAll(String(index), NUMBERS[index]);
    }
    return result;
}