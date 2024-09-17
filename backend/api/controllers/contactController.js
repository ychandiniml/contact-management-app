import prisma from "../../lib/prisma.js";

// export const uploadContact = async (req, res) => {
//     try {
//         const contacts = req.body.contacts;
//         await prisma.contact.createMany({
//             data: contacts
//         });
//         res.status(200).json({ message: 'Contacts uploaded successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Error saving contacts' });
//     }     
// };

export const addContact = async (req, res) => {
    const { name, email, phone, dob, age } = req.body;

    try {
        const newContact = await prisma.contact.create({
            data: {
                name, 
                email,
                phone, 
                dob: new Date(dob),
                age 
            },
        });
        return res.status(201).json({ message: "contact created successfully", contact: newContact });
    } catch (error) {
        console.error("Error during contact creation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateContact = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, dob, age } = req.body;

    const contact = await prisma.contact.findFirst({
        where: { id: Number(id) },
    });

    if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
    }

    try {
        const updatedContact = await prisma.contact.update({
            where: { id: Number(id) },
            data: {
                name, 
                email,
                phone, 
                dob: new Date(dob),
                age 
            },
        });
        return res.status(200).json({ message: "Contact updated successfully", contact: updatedContact });
    } catch (error) {
        console.error("Error during contact update:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllContacts = async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany();
        return res.status(200).json({ contacts });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

