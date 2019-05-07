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
                defaultFilterMethod={(filter, row) =>
                    String(row[filter.id]) === filter.value}
                columns={[
                {
                    Header: "Learning item",
                    columns: [
                    {
                        Header: "Title",
                        id: "title",
                        accessor: d => d.title,
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { keys: ["title"] }),
                        filterAll: true
                    },
                    {
                        Header: "Description",
                        id: "description",
                        accessor: d => d.description,
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { keys: ["description"] }),
                        filterAll: true
                    }
                    ]
                },
                {
                    Header: "Prediction",
                    columns: [
                    {
                        Header: "Topic",
                        id: "topic",
                        accessor: d => d.topic,
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { keys: ["topic"] }),
                        filterAll: true
                    },
                    {
                        Header: "Score",
                        accessor: "entropy",
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