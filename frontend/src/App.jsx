import React, { useState, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Papa from 'papaparse';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import moment from 'moment';

const ContactManager = () => {
  const [rowData, setRowData] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, data: null });
  const [addModal, setAddModal] = useState(false);
  const [newContact, setNewContact] = useState({});
  const [updatedRow, setUpdatedRow] = useState({});
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

  // Validate Email and Phone Format
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
          dob: input['Date of Birth'],
          age: parseInt(input.Age)
      }));
    };

    if (allValid) {
      try {
        const body = {"contacts": mapContacts(rowData)};
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
    setUpdatedRow(data);
    setEditModal({ open: true, data });
  };

  // Handle Save Edit
  const handleSaveEdit = () => {
    const updatedData = rowData.map(row => row.Name === updatedRow.Name ? updatedRow : row);
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
  const handleAddContact = () => {
    if (!newContact.Name || !newContact.Email || !newContact.Phone) {
      alert('Please fill in all fields.');
      return;
    }

    const validatedNewContact = {
      ...newContact,
      emailValid: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(newContact.Email),
      phoneValid: /^\+\d{2} \d{10}$/.test(newContact.Phone),
    };

    const newData = [...rowData, validatedNewContact];
    sortDataByValidity(newData);
    setAddModal(false);
    setNewContact({});
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
    { headerName: 'Date of Birth', field: 'Date of Birth', sortable: true, filter: true,
      valueFormatter: (params) => {
          const date = new Date(params.value);
          return moment(date).format('DD-MM-YYYY');
      }},
    { headerName: 'Age', field: 'Age', sortable: true, filter: true },
    {
      headerName: 'Actions',
      field: "actions",
      cellRenderer: (params) => {
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(params.data)}
              className="bg-blue-500 text-white px-4 py-2 text-xs font-medium rounded hover:bg-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(params.data)}
              className="bg-red-500 text-white px-4 py-2 text-xs font-medium rounded hover:bg-red-800"
            >
              Delete
            </button>
            <button
              className={`${
                params.data.emailValid && params.data.phoneValid
                  ? 'bg-green-500 hover:bg-green-800'
                  : 'bg-red-500 hover:bg-red-800'
              } text-white px-4 py-2 text-xs font-medium rounded `}
            >
              {params.data.emailValid && params.data.phoneValid ? '✔' : '✖'}
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="container mx-auto py-8">
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
            <button onClick={() => setAddModal(true)} className="bg-blue-500 text-white px-4 py-2 text-xs font-medium rounded hover:bg-blue-800">Add</button>
            <button onClick={handleReset} className="bg-gray-500 text-white px-4 py-2 text-xs font-medium rounded hover:bg-gray-800">Reset</button>
            <button
              onClick={submitData}
              className={`px-4 py-2 text-xs font-medium rounded bg-green-500 hover:bg-green-800 text-white`}
            >
              Submit
            </button>
          </div>

          <div className="ag-theme-alpine" style={{ width: '100%' }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              domLayout="autoHeight"
            />
          </div>
        </>
      )}

     
      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Add Contact</h2>
            <div className="mb-4">
              <label className="block mb-2">Name</label>
              <input
                type="text"
                value={newContact.Name || ''}
                onChange={(e) => setNewContact({ ...newContact, Name: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Email</label>
              <input
                type="text"
                value={newContact.Email || ''}
                onChange={(e) => setNewContact({ ...newContact, Email: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Phone</label>
              <input
                type="text"
                value={newContact.Phone || ''}
                onChange={(e) => setNewContact({ ...newContact, Phone: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Date of Birth</label>
              <input
                type="date"
                value={newContact.dob || ''}
                onChange={(e) => setNewContact({ ...newContact, dob: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Age</label>
              <input
                type="text"
                value={newContact.age || ''}
                onChange={(e) => setNewContact({ ...newContact, age: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={handleAddContact} className="bg-green-500 text-white px-4 py-2 text-xs font-medium rounded">Add</button>
              <button onClick={() => setAddModal(false)} className="bg-gray-500 text-white px-4 py-2 text-xs font-medium rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

          {/* Edit Modal */}
          {editModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Contact</h2>
            <div className="mb-4">
              <label className="block mb-2">Name</label>
              <input
                type="text"
                value={updatedRow.Name || ''}
                onChange={(e) => setUpdatedRow({ ...updatedRow, Name: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Email</label>
              <input
                type="text"
                value={updatedRow.Email || ''}
                onChange={(e) => setUpdatedRow({ ...updatedRow, Email: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Phone</label>
              <input
                type="text"
                value={updatedRow.Phone || ''}
                onChange={(e) => setUpdatedRow({ ...updatedRow, Phone: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Date of Birth</label>
              <input
                type="text"
                value={updatedRow.dob || ''}
                onChange={(e) => setUpdatedRow({ ...updatedRow, dob: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Age</label>
              <input
                type="text"
                value={updatedRow.age || ''}
                onChange={(e) => setUpdatedRow({ ...updatedRow, age: e.target.value })}
                className="w-full p-2 border border-gray-400 rounded"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button onClick={handleSaveEdit} className="bg-green-500 text-white px-4 py-2 text-xs font-medium rounded">Save</button>
              <button onClick={() => setEditModal({ open: false, data: null })} className="bg-gray-500 text-white px-4 py-2 text-xs font-medium rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;


