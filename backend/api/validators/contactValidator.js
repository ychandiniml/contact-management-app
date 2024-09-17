import {body} from 'express-validator'


export const registerContactValidator = () => {
    return [        
    body('name')
        .isString()
        .isLength({ min: 2 })
        .withMessage('name must be at least 2 characters long'),
    body('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    body('phone')
        .isMobilePhone()  
        .withMessage('Phone must be a valid mobile number'),
    body('dob')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('Date of birth must be a valid date'),
    body('age')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Age must be a non-negative integer')
    ]
};