import express from "express";
import { validate } from "../../middleware/validate.js";
import { addContact, updateContact, getAllContacts } from '../controllers/contactController.js';
import { registerContactValidator } from "../validators/contactValidator.js";

const router = express.Router();

router.get("/all", validate, getAllContacts );
// router.post("/add", registerContactValidator(), validate, uploadContact);
router.post("/add", registerContactValidator(), validate, addContact);
router.put("/:id", updateContact);

export default router;