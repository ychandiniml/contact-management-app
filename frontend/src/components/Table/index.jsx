import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

const Table = ({ rowData, columnDefs }) => (
  <div className="ag-theme-alpine" style={{ width: '100%' }}>
    <AgGridReact
      rowData={rowData}
      columnDefs={columnDefs}
      domLayout="autoHeight"
    />
  </div>
);

export default Table;
