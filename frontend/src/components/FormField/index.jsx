import React from 'react';
import { Field, ErrorMessage } from 'formik';

const FormField = ({ label, name, type = 'text', ...rest }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <Field
      type={type}
      name={name}
      id={name}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
      {...rest}
    />
    <ErrorMessage name={name} component="div" className="text-red-600 text-xs mt-1" />
  </div>
);

export default FormField;
