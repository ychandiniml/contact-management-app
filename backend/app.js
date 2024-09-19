import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import contactRouter from './api/contactRouter.js'

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/contacts', contactRouter);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
