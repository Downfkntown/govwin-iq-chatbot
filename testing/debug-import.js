const imported = require('../conversation-flows/search-assistance.js');
console.log("Type of imported:", typeof imported);
console.log("Constructor name:", imported.constructor.name);
console.log("Keys:", Object.keys(imported));
console.log("Is function:", typeof imported === 'function');
