import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const askAI = async (task) => {
  const prompt = `I need a list of CLI commands for ${task} in the form of an array of strings; the response should only include the array of commands`;

  const response = await openai.completions.create({
    engine: "davinci-codex",
    prompt: prompt,
    max_tokens: 100,
    n: 1, // Generate a single response
  });

  if (response && response.choices && response.choices[0]) {
    const commands = response.choices[0].text.trim().split("\n");
    return { commands };
  } else {
    throw new Error("An error occurred while generating the commands. Unexpected response from OpenAI.");
  }
};

// Example user authentication function
const authenticateUser = (userid, password) => {
  // Replace this with your actual authentication logic.
  // Check if userid and password are valid, and return true for authenticated or false for authentication failure.
  // You should have a secure authentication mechanism in your application.
  return true; // For this example, we assume authentication is successful.
};

app.post("/getcommands", async (req, res) => {
  const { userid, password, task } = req.body;

  // Authenticate the user before proceeding
  const isAuthenticated = authenticateUser(userid, password);

  if (!isAuthenticated) {
    return res.status(401).json({
      error: {
        message: "Authentication failed. Please provide valid credentials.",
      },
    });
  }

  // If the user is authenticated, call askAI to get the commands.
  try {
    const response = await askAI(task);
    res.json(response);
  } catch (error) {
    res.status(500).json({
      error: {
        message: error.message,
      },
    });
  }
});

app.listen(3300, () => {
  console.log("Server started at 3300");
});
