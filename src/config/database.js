// src/config/database.js

import { Sequelize } from "sequelize";

const sequelize = new Sequelize("marks", "postgres", "semo", {
  host: "localhost",
  dialect: "postgres", // or 'mysql', 'sqlite', 'mssql'
});

export default sequelize;
