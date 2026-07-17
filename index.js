const express = require("express");
const cors = require("cors");
const loginRoutes = require("./routes/authRoutes");
require("dotenv").config();
const sequelize = require("./config/mysqldb");

(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database Connected");
    } catch (err) {
        console.log(err);
    }
})();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running for Sarees Website!');
});

app.use("/new", loginRoutes);

const port = process.env.PORT || 5002;
app.listen(port, () => console.log("Server running on port 5002"));
