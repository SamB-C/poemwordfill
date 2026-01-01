[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A project where the user needs to fill in the blanks in a poem

# Developer Notes:

1. Pre-processing
   To run the preprocessing server run the command 'npm run server'
   then input localhost:8080/modifyNotesAndKeyQuotes.html into the browser

2. Typescript compiler
   To run the Typescript compiler, run the command 'npm run tsc'

## Pre-Processing

To add a new poem to the website:

1.  Add the poem as a text file in './poems'. See ['./poems/Rules.md'](poems/Rules.md) for the correct formatting.
2.  Add poem to the order in './poems/poemSettings.json'
3.  Run `npm run edit-poems`.

If a poem simply needs to be edited, make the necessary changes and run `npm run edit-poems`. If this results in any invalid notes or quotes
for that poem, they will be written to './invalidNotesAndQuotes.json', and should be reimplemented using the pre-processing server.

# TODO

Create script for adding new poem, and add as npm command.
