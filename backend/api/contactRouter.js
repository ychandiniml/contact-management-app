import prisma from "../lib/prisma.js";
import express from "express";
import Joi from "joi";

const router = express.Router();

// Define a Joi schema for contact validation
const contactSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+\d{2} \d{10}$/).required(), // Adjust pattern as necessary
    dob: Joi.date().iso().required(),
    age: Joi.number().integer().min(0).required()
});

// Validate incoming contacts
const validateContacts = (contacts) => {
    return Joi.array().items(contactSchema).validate(contacts);
};

router.post('/', async (req, res) => {
    const { contacts } = req.body;
    console.log('Incoming contacts:', contacts);

    // Check if contacts is defined and is an array
    if (!contacts || !Array.isArray(contacts)) {
        return res.status(400).json({ message: 'Contacts must be an array.' });
    }

    // Validate contacts
    const { error } = validateContacts(contacts);
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details });
    }

    try {
        const savedContacts = await prisma.contact.createMany({
            data: contacts,
        });

        console.log("savedContacts", savedContacts);

        res.status(201).json({ message: 'Contacts saved successfully!' });
    } catch (error) {
      console.error('Error saving contacts:', error);
      res.status(500).json({ message: 'Failed to save contacts', error: error.message });
    }
});


export default router;
