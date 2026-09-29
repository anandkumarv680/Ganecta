require("dotenv").config();

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;
const app = require("./app");

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
