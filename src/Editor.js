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
          className="btn-floating btn-large halfway-fab waves-effect waves-light teal deep-orange modal-trigger hide-on-small-only" >
          <i className="material-icons left">edit</i>
        </button>
        <div
          ref={EditorModal => {this.EditorModal = EditorModal}} id="editorModal" className="modal modal-fixed-footer"
          style={{maxHeight:"100%",fontSize:"12.5px"}}>
          <div className="modal-content left-align" style={{background:"rgb(29, 31, 33)"}} id="jsonEditor">
            {this.state.display?
            <ReactJson 
              src={this.props.keywordsJson} 
              theme="google"
              displayDataTypes={false}
              onEdit={this.props.editJson}
              onAdd={this.props.editJson}
              onDelete={this.props.editJson}
            />
            :<h5 className="center-align white-text">Loading...</h5>}
          </div>
          <div className="modal-footer" style={{background:"rgb(29, 31, 33)"}}>
            <button type="submit" className="modal-close waves-effect waves btn" style={{background:"rgb(57, 113, 237)"}} onClick={this.props.jsonUpdateRefresh}>
              <i className="material-icons left" style={{lineHeight:"1.5"}}>
                save
              </i> save
            </button>
            <button className="modal-close waves-effect waves-grey btn-flat white-text">
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default Editor;