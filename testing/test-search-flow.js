const SearchAssistanceFlow = require('../conversation-flows/search-assistance.js');

// Create an instance
const searchFlow = new SearchAssistanceFlow();

// Test basic functionality
console.log("Testing search assistance flow...");
console.log("Response:", searchFlow.handleUserInput("How do I search for opportunities?"));
