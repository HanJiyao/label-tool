import React, { Component } from "react";
import M from "materialize-css";

class FileMgr extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files:[]
    };
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount() {
    const options = {
      onOpenStart: () => {
        let itemArr = this.props.items.map(itm => itm.id)
        let fileArr = []
        itemArr.map(elem => {
          document.getElementById(elem).checked = false
          return fileArr.push({ file: elem, status: false })})
        this.setState({ files: fileArr })},
      onOpenEnd: () => {},
      onCloseStart: () => {},
      onCloseEnd: () => {},
      dismissible: true,
    };
    M.Modal.init(this.Modal, options);
    let itemArr = this.props.items.map(itm => itm.id)
    let fileArr = []
    itemArr.map(elem=>fileArr.push({file:elem,status:false}))
    this.setState({ files: fileArr})
  }
  handleChange(e) {
    let files = this.state.files
    let itemArr = this.props.items.map(itm => itm.id)
    files = files.filter(itm=>{
      return itemArr.indexOf(itm.file) > -1});
    const item = e.target.name;
    const isChecked = e.target.checked;
    for (var i in files){
      if(files[i].file === item) files[i].status = isChecked
    }
    console.log("select delete:",files)
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
                  <th style={{textAlign:'right'}}>Select</th>
                  <th style={{ textAlign: 'center' }}>File Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody >
                {this.props.items.map((item,i)=>
                <tr key = {i}>
                    <td style={{ textAlign: 'right', paddingTop: "24px"}}>
                    <label>
                        <input type="checkbox" id={item.id} name={item.id} onChange={this.handleChange} checked={undefined}/>
                      <span></span>
                    </label>
                  </td>
                  <td style={{ textAlign: 'center' }}>{item.label}</td>
                  <td>
                  {(this.props.selectedFiles.indexOf(item.id)!==-1)?
                  <><i class="material-icons left green-text" style={{height: "24px",lineHeight: "28px"}}>check_circle</i>Active</>
                  :<><i class="material-icons left red-text" style={{height: "24px",lineHeight: "28px"}}>remove_circle</i>Not active</>}
                  </td>
                </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="modal-footer" style={{lineHeight:"1.5"}}>
            <button className="modal-close waves-effect waves red btn" 
              onClick = {()=>{
                this.props.deleteFile(this.state.files)
              }}>
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