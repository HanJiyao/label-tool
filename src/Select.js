import React, { Component } from "react";
import M from "materialize-css";

class MSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  componentDidMount() {
    const options = {};
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, options);
  }
  render() {
    return (
        <div className="input-field col s6 m4">
            <select multiple>
                {this.props.elems.map((elems, i)=>
                <option key={i} value={elems.id} style={{fontSize:"10px"}}>{elems.label}</option>)}
            </select>
            <label>Filter</label>
        </div>
    );
  }
}

export default MSelect;