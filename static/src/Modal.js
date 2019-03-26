import React, { Component } from "react";
import M from "materialize-css";

class Modal extends Component {
  componentDidMount() {
    const options = {
      onOpenStart: () => {},
      onOpenEnd: () => {},
      onCloseStart: () => {},
      onCloseEnd: () => {},
      inDuration: 250,
      outDuration: 250,
      opacity: 0.5,
      dismissible: true,
      startingTop: "2%",
      endingTop: "10%"
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
            onClick={this.props.filterData}>
            <i style={{fontSize:"2rem",fontWeight:"900",margin:"0"}} className="material-icons left">edit</i>check
        </button>
        <div
          ref={Modal => {this.Modal = Modal}} id="dataModal" className=" container modal">
          <div className="modal-content">
            <h6>Modal Header</h6>
            <p>A bunch of text</p>
          </div>
          <div className="modal-content">
            <button className="modal-close waves-effect waves blue btn" 
              onClick = {this.props.outputHandler}>
              Add
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