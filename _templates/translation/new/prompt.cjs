// see types of prompts:
// https://github.com/enquirer/enquirer/tree/master/examples
//
module.exports = [
  {
    type: "input",
    name: "name",
    message: "What is the name of the translation?",
  },
  {
    type: "select",
    name: "type",
    message: "Pick a translation type.",
    choices: ["component", "page", "hook"],
  },
];
