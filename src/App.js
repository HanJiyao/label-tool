import React, { Component } from 'react';
import './App.css';
import {Input} from 'react-materialize'
const divStyle = {
  textAlign:"center",
  marginTop:"5rem"
};
const contentStyle={
  textAlign:"left",
};
const btnStyle = {
  width:"100%",
  marginTop:".5rem"
};
const actStyle = {
  textAlign:"left"
}
const rowStyle = {
  paddingTop:"1rem",
  marginBottom:"0",
}
const arrowStyle={
  color:"white",
  lineHeight:"36rem"
}
const arrowTxtStyle={
  fontSize:"2rem",
}
const hideStyle={
  display:'none'
}
const indexStyle={
  width:"10rem",
  margin:"auto",
}
const colStyle={
  paddingTop:"2rem"
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topic: 'test',
      correct: true,
      index: 0
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setCorrect = this.setCorrect.bind(this);
    this.setFalse = this.setFalse.bind(this);
    this.updateData = this.updateData.bind(this);
    this.index = this.index.bind(this);
    this.indexDown = this.indexDown.bind(this);
    this.indexUp = this.indexUp.bind(this);
  }
  setCorrect(){
    this.setState({correct:true});
  }
  setFalse(){
    this.setState({correct:false});
  }
  handleChange(event) {
    this.setState({topic: event.target.value});
  }
  handleSubmit(event) {
    alert('The new topic saved as: ' + this.state.topic);
    event.preventDefault();
  }
  index(event){
    var index = parseInt(event.target.value)
    if(index>this.state.data.length ){
      this.setState({index: this.state.data.length-1});
    } else if (index < 0 || isNaN(index)) {
      this.setState({index: 0});
    } else {
      this.setState({index: index}, () => {
        console.log(this.state.index);
      })
    }
  }
  updateData(result) {
    const data = result.data;
    this.setState({data: data}); 
  }
  indexUp(){
    this.setState({index: this.state.index+1}); 
  }
  indexDown(){
    this.setState({index: this.state.index-1}); 
  }
  componentWillMount() {
    var csvFilePath = require("./all_items_C0014376286P_label.csv");
    var Papa = require("papaparse/papaparse.min.js");
    Papa.parse(csvFilePath, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: this.updateData
    });
  }
  render() {
    if(this.state.data!==undefined){
      return (
        <div className="container">
          <div className="card" style={divStyle} >
            <div className="row" style={rowStyle}>
              <div className="col s2"  style={arrowStyle}><button onClick={this.indexDown} disabled={this.state.index===0?'disabled' : null} className=" btn-floating btn-large waves-effect waves-light blue"><i style={arrowTxtStyle} className="material-icons">keyboard_arrow_left</i></button></div>
              <div className="col s8" style={colStyle}>
                <div className="input-field" style={indexStyle}>
                  <i className="material-icons prefix">search</i>
                  <input type="number" id="index" value={this.state.index} onChange={this.index}/>
                  <label htmlFor="index" className="active">Index</label>
                </div>
                <div className="card-content" style={contentStyle}>
                  <h4>{(this.state.data[this.state.index].Title!==undefined)?this.state.data[this.state.index].Title:"Invalid Index"}</h4>
                  <h5>{(this.state.data[this.state.index].Description!==undefined)?this.state.data[this.state.index].Description:"Invalid Index"})</h5>
                </div>
                <div className="card-action" style={actStyle}>
                  <div className="row" style={rowStyle}>
                    <h5 className="col l6 m12">Topic: {this.state.data[this.state.index].Topic}</h5>
                    <div className="col l6 m12">
                      <div className="row">
                        <div className="col s6">
                          <button style={btnStyle} className={this.state.correct ? 'waves-effect waves-light btn-large green': 'waves-effect waves-light btn-large grey'} onClick={this.setCorrect}><i className="material-icons left">check</i>yes</button>
                        </div>
                        <div className="col s6">
                          <button style={btnStyle} className={this.state.correct ? 'waves-effect waves-light btn-large grey': 'waves-effect waves-light btn-large red'} onClick={this.setFalse}><i className="material-icons left">clear</i>no</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row" style={this.state.correct ? hideStyle : rowStyle}>
                    <Input l={6} m={12} type='select' label="New Topic" onChange={this.handleChange}>
                      <option value='1'>Option 1</option>
                      <option value='2'>Option 2</option>
                      <option value='3'>Option 3</option>
                    </Input>
                    <div className="col l6 m12">
                      <button style={btnStyle} className="waves-effect waves-light btn-large blue" onClick={this.handleSubmit}><i className="material-icons left">save</i>save</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col s2" style={arrowStyle}><button onClick={this.indexUp} disabled={this.state.index===this.state.data.length-1?'disabled' : null} className="btn-floating btn-large waves-effect waves-light blue"><i style={arrowTxtStyle} className=" material-icons">keyboard_arrow_right</i></button></div>
            </div>
          </div>
        </div>
      );
    } else {
      return(
        <div>Hello</div>
      )
    }
  }
}

export default App;
