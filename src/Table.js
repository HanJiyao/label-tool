import  React, { Component } from 'react';
import ReactTable from 'react-table'
import "react-table/react-table.css";

class Table extends Component {
    
    render(){
        return (
            <ReactTable
                data={this.props.data}
                filterable
                columns={[
                {
                    Header: "Learning item",
                    columns: [
                    {
                        Header: "Title",
                        accessor: "Title"
                    },
                    {
                        Header: "Description",
                        accessor: "Description"
                    }
                    ]
                },
                {
                    Header: "Prediction",
                    columns: [
                    {
                        Header: "Topic",
                        accessor: "Topic"
                    },
                    {
                        Header: "Score",
                        accessor: "Score"
                    }
                    ]
                }
                ]}
                defaultPageSize={100}
                style={{
                height: "600px" 
                }}
                className="-striped -highlight"
            />
        );
    }
  }
  export default Table