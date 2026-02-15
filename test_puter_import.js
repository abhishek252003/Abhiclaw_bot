const puter = require('@heyputer/puter.js');

console.log('Type of puter:', typeof puter);
console.log('Is puter.ai defined?', !!puter.ai);
console.log('Is puter.default defined?', !!puter.default);
if (puter.default) {
    console.log('Is puter.default.ai defined?', !!puter.default.ai);
}
console.log('Keys:', Object.keys(puter));

try {
    const ai = puter.ai || (puter.default && puter.default.ai);
    if (ai) {
        console.log('AI methods:', Object.keys(ai));
        console.log('Is chat a function?', typeof ai.chat);
    } else {
        console.log('AI module not found in export');
    }
} catch (e) {
    console.error(e);
}
