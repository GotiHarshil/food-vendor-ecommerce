require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`  /auth       → ${process.env.AUTH_SERVICE_URL}`);
  console.log(`  /orders     → ${process.env.ORDER_SERVICE_URL}`);
  console.log(`  /translate  → ${process.env.TRANSLATION_SERVICE_URL}`);
});
