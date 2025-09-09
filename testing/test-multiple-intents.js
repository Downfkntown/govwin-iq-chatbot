const SearchAssistanceFlow = require('../conversation-flows/search-assistance.js');
const searchFlow = new SearchAssistanceFlow();

console.log("=== Testing Different User Intents ===");
console.log("\n1. Filter question:");
console.log(searchFlow.handleUserInput("How do I use filters?"));

console.log("\n2. Specific opportunity search:");  
console.log(searchFlow.handleUserInput("Find opportunities for my company"));

console.log("\n3. Advanced search question:");
console.log(searchFlow.handleUserInput("Tell me about advanced search"));
