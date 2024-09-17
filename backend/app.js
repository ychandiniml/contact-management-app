import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import contactRoutes from "./api/routes/contactRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/contact", contactRoutes);


var PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log('app listening on port ' + PORT);
});