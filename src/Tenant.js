import React, { Component } from "react";
import M from "materialize-css";

class MSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changed:false
    };
    this.changeTenant=this.changeTenant.bind(this)
  }
  componentDidMount() {   
    const options = {onCloseEnd:()=>this.props.updateTenants()};
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, options);
  }
  changeTenant() {
    this.setState({changed:true})
    let selectedTenant = [];
    let selected = document.querySelectorAll('.tenant .selected');
    for (var i=0;i<selected.length;i++){
      selectedTenant.push(selected[i].innerText)
    }
    this.props.changeTenant(selectedTenant)
  }
  render() {
    return (
      <>
        <div className="input-field col s5 m3 tenant">
            <select multiple onChange={this.changeTenant} value={this.props.selectedTenant}>
                {this.props.elems.map((elems, i)=>
                  <option key={i} value={elems.id} selected={(this.props.selectedTenant.indexOf(elems.id) > -1)}>{elems.label}</option>
                )}
            </select>
            <label style={{fontSize:"1.2rem",top:"-29px"}}>Tenant</label>
        </div>
      </>
    );
  }
}

export default MSelect;