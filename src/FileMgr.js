import React, { Component } from "react";
import M from "materialize-css";

class FileMgr extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files:{}
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount() {
    const options = {
      onOpenStart: () => {},
      onOpenEnd: () => {},
      onCloseStart: () => {},
      onCloseEnd: () => {},
      dismissible: true,
    };
    M.Modal.init(this.Modal, options);
    let files = {}
    this.props.items.map(item=>files[item.id]=false)
    this.setState({files:files})
  }
  handleChange(e) {
    let files = this.state.files
    const item = e.target.name;
    const isChecked = e.target.checked;
    files[item]=isChecked
    this.setState({files:files});
  }
  render() {
    return (
      <> 
        <a className="modal-trigger" data-target="fileModal" href="#!"><i class="material-icons" style={{paddingTop: "3.6px"}}>folder</i></a>
        <div
          ref={Modal => {this.Modal = Modal}} id="fileModal" className="modal modal-fixed-footer center-align">
          <div className="modal-content" style={{padding:0,lineHeight:"2"}}>
            <table className="striped highlight" style={{color:'#000'}}>
              <thead>
                <tr>
                  <th style={{textAlign:'center'}}>Select Delete</th>
                  <th style={{textAlign:'center'}}>File Name</th>
                  <th style={{textAlign:'center'}}>Status</th>
                </tr>
              </thead>
              <tbody >
                {this.props.items.map((item,i)=>
                <tr key = {i}>
                  <td style={{textAlign:'center'}}>
                    <label>
                      <input type="checkbox" name={item.id} onChange={this.handleChange} checked={this.state.files[item.id]}/>
                      <span></span>
                    </label>
                  </td>
                  <td style={{textAlign:'center'}}>{item.id}</td>
                  <td style={{textAlign:'center'}}>{(this.props.selectedFiles.indexOf(item.id)!==-1?'Active':'')}</td>
                </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="modal-footer" style={{lineHeight:"1.5"}}>
            <button className="modal-close waves-effect waves red btn" 
              onClick = {()=>this.props.deleteFile(this.state.files)}>
              <i class="material-icons left" style={{lineHeight:"1.5"}}>
                delete
              </i> Delete
            </button>
            <button className="modal-close waves-effect waves-grey btn-flat" id="queryCancel" >
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default FileMgr;