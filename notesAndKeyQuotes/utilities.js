// Functions used in more than one file
export function removeCards(word) {
    return word.split('').filter(letter => !letter.match(/[🃊🃁🃂🃃🃄🃅🃆🃇🃈🃉]/)).join('');
}
export function highlightText(textToHighlight, color) {
    textToHighlight.forEach((word) => {
        const wordSpan = document.getElementById(word);
        wordSpan.style.color = color;
    });
}
export function unHighlightText(textToUnhighlight) {
    textToUnhighlight.forEach((word) => {
        const wordSpan = document.getElementById(word);
        wordSpan.style.color = 'black';
    });
}
