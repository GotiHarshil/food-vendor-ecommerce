import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI
};

if (!config.mongoUri) {
  throw new Error("MONGO_URI missing in .env");
}
