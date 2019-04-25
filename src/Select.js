import React, { Component } from "react";
import M from "materialize-css";

class MSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changed:false
    };
    this.changeFiles=this.changeFiles.bind(this)
  }
  componentDidMount() {   
    const options = {};
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, options);
    var elemsT = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(elemsT, options);
    this.setState({changed:false})
  }
  changeFiles() {
    this.setState({changed:true})
    let selectedFiles = [];
    let selected = document.querySelectorAll('.selected');
    for (var i=0;i<selected.length;i++){
      selectedFiles.push('all_items_'+selected[i].innerText+'.csv')
    }
    this.props.changeFiles(selectedFiles)
  }
  render() {
    return (
      <>
        <div className="input-field col s7 m4">
            <select multiple onChange={this.changeFiles} value={this.props.selectedFiles}>
                {this.props.elems.map((elems, i)=>
                  <option key={i} value={elems.id} selected={(this.props.selectedFiles.indexOf(elems.id) > -1)}>{elems.label}</option>
                )}
            </select>
            <label style={{fontSize:"1.2rem",top:"-29px"}}>choose file</label>
        </div>
        <button className="col s2 m1 btn-flat" style={{color:'white',height:'100%'}} disabled={!this.state.changed}>
          <i id="refreshBtn" 
            style={{fontSize:"2rem"}}
            className="material-icons tooltipped"
              onClick={this.props.refreshData}
              data-position="top" data-tooltip="This will reload entire data, save your progress first"
            >done
          </i>
        </button>
      </>
    );
  }
}

export default MSelect;