import sequelize from "./config/database.js";
import User from "./models/User.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import authRoutes from "./routes/authRoutes.js";

const run = () => {
  config();
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(bodyParser.json());
  app.use(cors());

  app.get("/", (req, res) => {
    res.send("Hello, World!");
  });

  app.use("/api/auth", authRoutes);

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  sequelize.sync().then(() => {
    console.log("Database & tables created!");
  });
};

export default run;
