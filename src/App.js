import React, { Component } from 'react';
import './App.css';
const divStyle = {
  marginTop:"5rem",
  textAlign:"center"
};
const contentStyle={
  textAlign:"left",
  marginTop:"3rem",
};
const btnStyle = {
  margin:"0.5rem 1rem 0  0",
};
const actStyle = {
  paddingTop:"3rem",
  textAlign:"left"
}
const rowStyle = {
  marginBottom:"0"
}
const arrowStyle={
  color:"white",
  marginTop:"12rem"
}
const arrowTxtStyle={
  fontSize:"2rem",
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {value: 'coconut'};
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    this.setState({value: event.target.value});
  }
  handleSubmit(event) {
    alert('Your favorite flavor is: ' + this.state.value);
    event.preventDefault();
  }
  componentDidMount () {
    const s = document.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.innerHTML = "document.addEventListener('DOMContentLoaded', function() {var elems = document.querySelectorAll('select');var instances = M.FormSelect.init(elems); });";
    this.instance.appendChild(s);
  }
  render() {
      // var XLSX = require('xlsx');
      // var workbook = XLSX.readFile('all_items_NedbankTest_label.xlsx');
      // var first_sheet_name = workbook.SheetNames[0];
      // var address_of_cell = 'D5';
      // /* Get worksheet */
      // var worksheet = workbook.Sheets[first_sheet_name];
      // /* Find desired cell */
      // var desired_cell = worksheet[address_of_cell];
      // /* Get the value */
      // var desired_value = desired_cell.v;
    return (
      <div className="container ">
        <div className="card row" style={divStyle} ref={el => (this.instance = el)}>
          <div className="col s2" style={arrowStyle}><button className=" btn-floating btn-large waves-effect waves-light"><i style={arrowTxtStyle} className="material-icons">keyboard_arrow_left</i></button></div>
          <div className="col s8">
          
            <div className="card-content" style={contentStyle}>
              <h4>Content Title</h4>
              <br/>
              <h5>This is the content</h5>
            </div>
            <div className="card-action" style={actStyle}>
              <div className="row" style={rowStyle}>
                <div className="col l6 m12">
                  <button style={btnStyle} className="waves-effect waves-light btn-large"><i className="material-icons left">check</i>yes</button>
                  <button style={btnStyle} className="waves-effect waves-light btn-large"><i className="material-icons left">clear</i>no</button>
                </div>
                <div className="input-field col l6 m12" >
                  <select value={this.state.value} onChange={this.handleChange}>
                    <option value="grapefruit">Grapefruit</option>
                    <option value="lime">Lime</option>
                    <option value="coconut">Coconut</option>
                    <option value="mango">Mango</option>
                  </select>
                  <label>Topics</label>
                </div>
              </div>
            </div>
          </div>
          <div className="col s2" style={arrowStyle}><button className="btn-floating btn-large waves-effect waves-light"><i style={arrowTxtStyle} className=" material-icons">keyboard_arrow_right</i></button></div>
        </div>
      </div>
    );
  }
}

export default App;
