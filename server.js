const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { TextServiceClient } = require("@google-ai/generativelanguage");
const { GoogleAuth } = require("google-auth-library");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.API_KEY;

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

// Example user authentication function
const authenticateUser = (userid, password) => {
  // Replace this with your actual authentication logic.
  return true;
};

// Function to ask AI for CLI commands
const askAI = async (task) => {
  const promptString = `Generate a list or array of CLI commands required for the given task , the task is to ${task}. The response should be an ordered list or array, enclosed in square brackets, containing onl`;

  const stopSequences = [];

  try {
    const result = await client.generateText({
      model: MODEL_NAME,
      temperature: 0.3,
      candidateCount: 1,
      top_k: 40,
      top_p: 0.95,
      max_output_tokens: 1024,
      safety_settings: [
        { category: "HARM_CATEGORY_DEROGATORY", threshold: 1 },
        { category: "HARM_CATEGORY_TOXICITY", threshold: 1 },
        { category: "HARM_CATEGORY_VIOLENCE", threshold: 2 },
        { category: "HARM_CATEGORY_SEXUAL", threshold: 2 },
        { category: "HARM_CATEGORY_MEDICAL", threshold: 2 },
        { category: "HARM_CATEGORY_DANGEROUS", threshold: 2 },
      ],
      prompt: {
        text: promptString,
      },
    });

    const output = result[0].candidates[0].output;
    const outputWithoutBackticks = output.replace(/```/g, "");
    const outputArray = JSON.parse(outputWithoutBackticks); // Parse the JSON string
    const dataArray = Object.values(outputArray);
    return dataArray;
  } catch (error) {
    throw error;
  }
};

// for testing purpose // Call the askAI function
// askAI("Create a new folder").then((commandsArray) => {
//   if (commandsArray) {
//     console.log(commandsArray);
//   } else {
//     console.log("No valid response.");
//   }
// });

// Endpoint to get CLI commands
app.post("/getcommands", async (req, res) => {
  const { userid, password, task } = req.body;

  // Authenticate the user
  //   const isAuthenticated = authenticateUser(userid, password);

  //   if (!isAuthenticated) {
  //     return res.status(401).json({
  //       error: {
  //         message: "Authentication failed. Please provide valid credentials.",
  //       },
  //     });
  //   }

  const data = await askAI(task);
  console.log(typeof(data));
  console.log("inside post");
  console.log("and the data is ->");
  data.forEach((element) => {
    console.log(element);
    console.log("\n");
  });
  res.json(data);
});

const port = process.env.PORT || 3300;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
