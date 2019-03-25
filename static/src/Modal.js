import React, { Component } from "react";
import M from "materialize-css";

class Modal extends Component {
  componentDidMount() {
    const options = {
      onOpenStart: () => {
        console.log("Open Start");
      },
      onOpenEnd: () => {
        console.log("Open End");
      },
      onCloseStart: () => {
        console.log("Close Start");
      },
      onCloseEnd: () => {
        console.log("Close End");
      },
      inDuration: 250,
      outDuration: 250,
      opacity: 0.5,
      dismissible: false,
      startingTop: "4%",
      endingTop: "10%"
    };
    M.Modal.init(this.Modal, options);
  }
  render() {
    return (
      <>
        <button id="checkBtn"
            data-target="modal1"
            style={{width:"100%",height:'65px',borderRadius:'100px',zIndex:"0",fontSize:"1.5rem",fontWeight:"600"}} 
            className='waves-effect waves-light btn-large orange modal-trigger'>
            <i style={{fontSize:"2rem",fontWeight:"900",margin:"0"}} className="material-icons left">search</i>check
        </button>
        <div
          ref={Modal => {
            this.Modal = Modal;
          }}
          id="modal1"
          className="modal"
        >
          <div className="modal-content">
            <h4>Modal Header</h4>
            <p>A bunch of text</p>
          </div>
          <div className="modal-footer">
            <button href="#" className="modal-close waves-effect waves-red btn-flat">
              Disagree
            </button>
            <button href="#" className="modal-close waves-effect waves-green btn-flat">
              Agree
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default Modal;