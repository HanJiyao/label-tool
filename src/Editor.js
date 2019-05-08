import React, { Component } from "react";
import M from "materialize-css";
import ReactJson from 'react-json-view'
class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {display:false};
  }
  componentDidMount() {
    const options = {
      onOpenStart: () => {},
      onOpenEnd: () => {
        this.setState({display:true})
      },
      onCloseStart: () => {
        this.setState({display:false})
      },
      onCloseEnd: () => {},
      dismissible: true,
    };
    M.Modal.init(this.EditorModal, options);
  }
  render() {
    return (
      <>
        <button
          data-target="editorModal"
          className="btn-floating btn-large halfway-fab waves-effect waves-light teal deep-orange modal-trigger z-depth-3 hide-on-small-only" >
          <i className="material-icons left">edit</i>
        </button>
        <div
          ref={EditorModal => {this.EditorModal = EditorModal}} id="editorModal" className="modal"
          style={{maxHeight:"100%",fontSize:"12.5px"}}>
          <div className="modal-content left-align" style={{background:"rgb(29, 31, 33)",minHeight:'100%'}} id="jsonEditor">
            {this.state.display?
              <ReactJson 
                src={this.props.keywordsJson} 
                theme="google"
                displayDataTypes={false}
                enableClipboard={false}
                onDelete={this.props.deleteJson}
              />
            :<h5 className="center-align white-text"> Loading • • • </h5>}
          </div>
        </div>
      </>
    );
  }
}

export default Editor;