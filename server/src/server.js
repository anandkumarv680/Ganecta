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



// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZDM5YWI2YTNjMzk4YmNlMzYyYmIyMiIsImlhdCI6MTc5MjI1MjczNCwiZXhwIjoxNzkyMzM5MTM0fQ.SLk0I0u5h39RMRCSCv2l_T_W-XQ5tjZ1aIETskII8bQ
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhZDM5YTlhYTNjMzk4YmNlMzYyYmIyMSIsImlhdCI6MTc5MjI1MjgxNCwiZXhwIjoxNzkyMzM5MjE0fQ.tqO_vkVw4ZDQtkl9JOLkq2f0U-S6f4gAMrT2QtB7xB4