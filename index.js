const express = require("express");
const cors = require("cors");
const loginRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
require("dotenv").config();
const sequelize = require("./config/mysqldb");

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API is running for Sarees Website!');
});

app.use("/new", loginRoutes);
app.use("/category", categoryRoutes);
app.use("/products", productRoutes);
app.use("/orders", ordersRoutes);


const port = process.env.PORT || 5002;
app.listen(port, () => console.log("Server running on port 5002"));
