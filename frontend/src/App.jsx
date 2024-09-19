import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import moment from 'moment';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Modal from './components/Modal';
import Button from './components/Button';
import FormField from './components/FormField';
import Table from './components/Table';

const contactSchema = Yup.object().shape({
  Name: Yup.string().required('Name is required'),
  Email: Yup.string().email('Invalid email format').required('Email is required'),
  Phone: Yup.string().matches(/^\+\d{2} \d{10}$/, 'Invalid phone number format').required('Phone is required'),
  Dob: Yup.date().required('Date of Birth is required'),
  Age: Yup.number().integer().positive().required('Age is required'),
});

const ContactManager = () => {
  const [rowData, setRowData] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const fileInputRef = useRef(null);

  // Handle CSV File Upload and Parse it
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          const parsedData = results.data.map(item => ({
            ...item,
            emailValid: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(item.Email),
            phoneValid: /^\+\d{2} \d{10}$/.test(item.Phone),
          }));
          sortDataByValidity(parsedData);
        }
      });
    }
  };

  // Sort data with invalid entries on top
  const sortDataByValidity = (data) => {
    const sortedData = [...data].sort((a, b) => {
      const aInvalid = !a.emailValid || !a.phoneValid;
      const bInvalid = !b.emailValid || !b.phoneValid;
      return bInvalid - aInvalid;
    });
    setRowData(sortedData);
  };

  const validateData = (data) => {
    return data.map((row) => {
      const emailValid = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(row.Email);
      const phoneValid = /^\+\d{2} \d{10}$/.test(row.Phone);
      return { ...row, emailValid, phoneValid };
    });
  };

  // Check validity and submit data
  const submitData = async () => {
    const validatedData = validateData(rowData);
    sortDataByValidity(validatedData);
    const allValid = validatedData.every(row => row.emailValid && row.phoneValid);

    const mapContacts = (inputArray) => {
      return inputArray.map(input => ({
        name: input.Name,
        email: input.Email,
        phone: input.Phone,
        dob: input['Dob'],
        age: parseInt(input.Age),
      }));
    };

    if (allValid) {
      try {
        const body = { contacts: mapContacts(rowData) };
        const response = await axios.post('http://localhost:8000/api/contacts', body);
        console.log('Data submitted successfully:', response);
        alert('Data submitted successfully!');
        setRowData([]); // Clear the table after submission
      } catch (error) {
        console.error('Error submitting data:', error);
        alert('Failed to submit data. Please try again.');
      }
    } else {
      alert('Please correct the errors before submitting.');
    }
  };

  // Handle Edit
  const handleEdit = (data) => {
    setEditModal({ open: true, data });
  };

  // Handle Save Edit
  const handleSaveEdit = (values) => {
    const updatedData = rowData.map(row => row.Name === values.Name ? values : row);
    const validatedData = validateData(updatedData);
    sortDataByValidity(validatedData);
    setEditModal({ open: false, data: null });
  };

  // Handle Delete
  const handleDelete = (data) => {
    const filteredData = rowData.filter(row => row.Name !== data.Name);
    setRowData(filteredData);
  };

  // Handle Add Contact
  const handleAddContact = (values) => {
    const validatedNewContact = {
      ...values,
      emailValid: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.Email),
      phoneValid: /^\+\d{2} \d{10}$/.test(values.Phone),
    };

    const newData = [...rowData, validatedNewContact];
    sortDataByValidity(newData);
    setAddModal(false);
  };

  // Handle Reset
  const handleReset = () => {
    const confirmReset = window.confirm('Are you sure you want to reset the table?');
    if (confirmReset) {
      setRowData([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset the file input
      }
    }
  };

  const columnDefs = [
    { headerName: 'Name', field: 'Name', sortable: true, filter: true },
    { headerName: 'Email', field: 'Email', sortable: true, filter: true },
    { headerName: 'Phone', field: 'Phone', sortable: true, filter: true },
    { headerName: 'Date of Birth', field: 'Dob', sortable: true, filter: true,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return moment(date).format('DD-MM-YYYY');
      }},
    { headerName: 'Age', field: 'Age', sortable: true, filter: true },
    {
      headerName: 'Actions',
      field: "actions",
      cellRenderer: (params) => (
        <div className="flex space-x-2">
          <Button onClick={() => handleEdit(params.data)} className="bg-blue-300 hover:bg-blue-500">Edit</Button>
          <Button onClick={() => handleDelete(params.data)} className="bg-red-300 hover:bg-red-500">Delete</Button>
          <Button
              className={`${
                params.data.emailValid && params.data.phoneValid
                  ? 'bg-green-300 hover:bg-green-500'
                  : 'bg-red-300 hover:bg-red-500'
              } `}
            >
              {params.data.emailValid && params.data.phoneValid ? '✔' : '✖'}
            </Button>       
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Contact Manager</h1>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="mb-4 p-2 border border-gray-400"
      />

      {rowData.length > 0 && (
        <>
          <div className="my-4 flex justify-end space-x-4">
            <Button onClick={() => setAddModal(true)} className="bg-blue-300 hover:bg-blue-500">Add Contact</Button>
            <Button onClick={handleReset} className="bg-gray-300 hover:bg-gray-500">Reset</Button>
            <Button onClick={submitData} className="bg-green-300 hover:bg-green-500">Submit</Button>
          </div>
          <Table rowData={rowData} columnDefs={columnDefs} />
        </>      
      )}

      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Add Contact">
        <Formik
          initialValues={{ Name: '', Email: '', Phone: '', Dob: '', Age: '' }}
          validationSchema={contactSchema}
          onSubmit={handleAddContact}
        >
          <Form>
            <FormField label="Name" name="Name" />
            <FormField label="Email" name="Email" type="email" />
            <FormField label="Phone" name="Phone" />
            <FormField label="Date of Birth" name="Dob" type="date" />
            <FormField label="Age" name="Age" type="number" />
            <div className="flex justify-end space-x-4">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-700">Add</Button>
              <Button type="button" onClick={() => setAddModal(false)} className="bg-gray-500 hover:bg-gray-700">Cancel</Button>        
            </div>
          </Form>
        </Formik>
      </Modal>

      <Modal isOpen={editModal.open} onClose={() => setEditModal({ open: false, data: null })} title="Edit Contact">
        <Formik
          initialValues={editModal.data || { Name: '', Email: '', Phone: '', Dob: '', Age: '' }}
          validationSchema={contactSchema}
          onSubmit={handleSaveEdit}
        >
          <Form>
            <FormField label="Name" name="Name" />
            <FormField label="Email" name="Email" type="email" />
            <FormField label="Phone" name="Phone" />
            <FormField label="Date of Birth" name="Dob" type="date" />
            <FormField label="Age" name="Age" type="number" />
            <div className="flex justify-end space-x-4">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-700">Save</Button>
              <Button type="button" onClick={() => setEditModal({ open: false, data: null })} className="bg-gray-500 hover:bg-gray-700">Cancel</Button>
            </div>
          </Form>
        </Formik>
      </Modal>
    </div>
  );
};

export default ContactManager;
