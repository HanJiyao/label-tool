import  React, { Component } from 'react';
import ReactTable from 'react-table'
import "react-table/react-table.css";
import matchSorter from 'match-sorter'

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
                        accessor: "Title",
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { keys: ["Title"] }),
                        filterAll: true
                    },
                    {
                        Header: "Description",
                        accessor: "Description",
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { keys: ["Description"] }),
                        filterAll: true
                    }
                    ]
                },
                {
                    Header: "Prediction",
                    columns: [
                    {
                        Header: "Topic",
                        accessor: "Topic",
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { keys: ["Topic"] }),
                        filterAll: true
                    },
                    {
                        Header: "Score",
                        accessor: "Score",
                    }
                    ]
                }
                ]}
                defaultPageSize={20}
                style={{
                height: "666px" 
                }}
                className="-striped -highlight"
            />
        );
    }
  }
  export default Table