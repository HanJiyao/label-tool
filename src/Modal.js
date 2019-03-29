import React, { Component } from "react";
import M from "materialize-css";

class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
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
  }
  render() {
    return (
      <>
        <button id="checkBtn"
            data-target="dataModal"
            style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.5rem",fontWeight:"600"}} 
            className='waves-effect waves-light btn-large orange modal-trigger'
            onClick={this.props.filterData}
            disabled={this.props.checkDisabled}>
            <i style={{fontSize:"2rem",fontWeight:"900",margin:"0"}} className="material-icons left">edit</i>check
        </button>
        <div
          ref={Modal => {this.Modal = Modal}} id="dataModal" className="modal bottom-sheet modal-fixed-footer">
          <div className="modal-content">
            <table className="striped highlight">
              <thead>
                <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Topic</th>
                    <th>Subject Area</th>
                    <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {this.props.queryData.map((item,i)=>
                  <tr key={i}>
                    <td>
                      <strong>{item.Title}</strong>
                    </td>
                    <td>
                      {item.Description}
                    </td>
                    <td>
                      <strong>{item.Topic}</strong>
                    </td>
                    <td>
                      {item['Subject Area']}
                    </td>
                    <td>
                      {item.Score}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="modal-footer">
            <button className="btn-flat" style={{textTransform:"none",fontSize:"1.35rem"}}>
              <strong>{this.props.newKeyword} <i className="material-icons" style={{verticalAlign:"-0.2rem"}}>keyboard_arrow_right</i> {this.props.topic}</strong>
            </button>
            <button type="submit" className="modal-close waves-effect waves blue btn" 
              onClick = {this.props.jsonUpdate}>
              <i class="material-icons">
                add_circle_outline
              </i> Add
            </button>
            <button className="modal-close waves-effect waves-grey btn-flat">
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default Modal;