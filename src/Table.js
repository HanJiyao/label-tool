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
                    Header: "Learning Items",
                    columns: [
                    {
                        Header: "Title",
                        id: "title",
                        accessor: d => d.title,
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { minRanking: matchSorter.rankings.CONTAINS, keys: ["title"] }),
                        filterAll: true,
                        width: 250
                    },
                    {
                        Header: "Description",
                        id: "description",
                        accessor: d => d.description,
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { minRanking: matchSorter.rankings.CONTAINS, keys: ["description"] }),
                        filterAll: true
                    }
                    ]
                },
                {
                    Header: "Predictions",
                    columns: [
                    {
                        Header: "Topic",
                        id: "topic",
                        accessor: d => d.topic,
                        filterMethod: (filter, rows) =>
                            matchSorter(rows, filter.value, { minRanking: matchSorter.rankings.CONTAINS, keys: ["topic"] }),
                        filterAll: true,
                        width: 150
                    },
                    {
                        Header: "Score",
                        accessor: "entropy",
                        width: 150
                    }
                    ]
                }
                ]}
                defaultPageSize={20}
                style={{
                height: "calc(95vh - 272.55px)" 
                }}
                className="-striped -highlight"
            />
        );
    }
  }
  export default Table