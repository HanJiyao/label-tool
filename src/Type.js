import React, { Component } from "react";
import M from "materialize-css";

class TypeSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changed:false
    };
    this.changeType=this.changeType.bind(this)
  }
  componentDidMount() {   
    const options = {};
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, options);
  }
  changeType() {
    this.setState({changed:true})
    let selectedType = [];
    let selected = document.querySelectorAll('.type .selected');
    for (var i=0;i<selected.length;i++){
      selectedType.push(selected[i].innerText)
    }
    this.props.changeType(selectedType)
  }
  render() {
    return (
      <>
        <div className="type input-field col s6 m3">
            <select multiple onChange={this.changeType} value={this.props.selectedType}>
                {this.props.elems.map((elems, i)=>
                  <option key={i} value={elems.id} selected={(this.props.selectedType.indexOf(elems.id) > -1)}>{elems.label}</option>
                )}
            </select>
            <label style={{fontSize:"1.2rem",top:"-29px"}}>Type</label>
        </div>
      </>
    );
  }
}

export default TypeSelect;