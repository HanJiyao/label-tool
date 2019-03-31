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
      onOpenEnd: () => {},
      onCloseStart: () => {},
      onCloseEnd: () => {},
      dismissible: false,
    };
    M.Modal.init(this.EditorModal, options);
  }
  display=()=>{
    this.setState({display:true})
  }
  endDisplay=()=>{
    this.setState({display:false})
  }
  render() {
    return (
      <>
        <button style={{borderRadius:"100px",width:"100%",marginBottom:"1rem"}} 
          onClick={this.display}
          data-target="editorModal"
          className="waves-effect waves-light btn-large orange modal-trigger" ><i className="material-icons left" style={{margin:"0"}}>edit</i>edit
        </button>
        <div
          ref={EditorModal => {this.EditorModal = EditorModal}} id="editorModal" className="modal modal-fixed-footer">
          <div className="modal-content left-align" style={{background:"rgb(29, 31, 33)"}} id="jsonEditor">
            {this.state.display?
            <ReactJson 
              src={this.props.keywordsJson} 
              theme="google"
            />
            :<></>}
          </div>
          <div className="modal-footer" style={{background:"rgb(29, 31, 33)"}}>
            <button type="submit" className="modal-close waves-effect waves btn" style={{background:"rgb(57, 113, 237)"}} >
              <i class="material-icons left">
                save
              </i> save
            </button>
            <button className="modal-close waves-effect waves-grey btn-flat white-text" onClick={this.endDisplay}>
              Cancel
            </button>
          </div>
        </div>
      </>
    );
  }
}

export default Editor;