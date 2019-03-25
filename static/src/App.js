import  React, { Component } from 'react';
import './App.css';
import Select from 'react-select';
import load from './load.gif';
import update from 'react-addons-update'; 
import { CSVLink } from 'react-csv'
import { FilePond, registerPlugin } from 'react-filepond';
import ReactAutocomplete from 'react-autocomplete';
import 'filepond/dist/filepond.min.css';
import M from "materialize-css";
import Modal from './Modal'
registerPlugin();

const fileName = 'all_items_C0014376286T1.csv'
var options = []
var items = []
const topicTxt = require('./data/topics_keywords_latest.json')
const ordered = {};
Object.keys(topicTxt).sort().forEach(function(key) {
  ordered[key] = topicTxt[key];
})
for (var key in ordered) {
  if (ordered.hasOwnProperty(key)) {
    options.push({value: ordered[key].ui_text, label: ordered[key].ui_text});
    items.push({id:ordered[key].ui_text[0],label:ordered[key].ui_text[0]})
  }
}
const inlineStyle = {
  customStyles:{
    option: (provided, state) => ({
      ...provided,})
  },
  divStyle : {textAlign:"center",padding:"0"},
  contentStyle:{textAlign:"left",margin:"0",paddingTop:".5rem"},
  btnStyle:{width:"100%",height:'65px',borderRadius:'100px',zIndex:"0",fontSize:"1.5rem",fontWeight:"600"},
  symbolStyle:{fontSize:"2rem",fontWeight:"900",margin:"0"},
  actStyle:{textAlign:"left",paddingTop:"0",},
  rowStyle:{paddingTop:"1.5rem",margin:"0",},
  arrowStyle:{color:"white"},
  arrowTxtStyle:{fontSize:"3rem",margin:"0"},
  hideStyle:{display:'none'},
  loadingStyle:{height:'100vh',width:'100vw',position:'relative',},
  loadImg:{position:'absolute',top: '42%',left: '48%',},
  red:{color:"red"},saveBtn:{borderRadius:"100px",marginTop:".6rem",width:"100%",marginBottom:"1rem"},
  selectStyle:{paddingTop:"2rem",margin:"0",height:"100px"},
  mainRowStyle:{paddingTop:"1rem",width:"100%"},
  descStyle:{height:"4rem",overflowY:"scroll"},
  titleStyle:{height:"4.2rem",overflowY:"scroll",fontSize:"1.8rem"}
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      topic: '',
      correct: true,
      index: 0,
      download:false,
      filter:'',
      keyword:[],
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setCorrect = this.setCorrect.bind(this);
    this.setFalse = this.setFalse.bind(this);
    this.updateData = this.updateData.bind(this);
    this.indexSearch = this.indexSearch.bind(this);
    this.indexDown = this.indexDown.bind(this);
    this.indexUp = this.indexUp.bind(this);
    this.keyFunction = this.keyFunction.bind(this);
    this.loadNewItem = this.loadNewItem.bind(this);
    this.writeData = this.writeData.bind(this);
    this.startDownload = this.startDownload.bind(this);
    this.selectRef=React.createRef();
  }
  setCorrect(){
    this.setState({correct:true});
  }
  setFalse(){
    this.setState({correct:false});
  }
  handleSubmit(event) {
    this.writeData();
    event.preventDefault();
  }
  indexSearch(event){
    var index = parseInt(event.target.value)
    if(index>this.state.data.length-1 ){
      this.setState({index: this.state.data.length-1},()=>{this.loadNewItem()});
    } else if (index < 0 || isNaN(index)) {
      this.setState({index: 0},()=>{this.loadNewItem()});
    } else {
      this.setState({index: index}, () => {this.loadNewItem()})
    }
  }
  loadNewItem(){
    this.setState({topic:this.state.data[this.state.index].Manual})
    this.setState({correct:(this.state.data[this.state.index].Correct===0||this.state.data[this.state.index].Correct==="0")?false:true})
  }
  updateData(result) {
    const data = result.data;
    this.setState({data: data}); 
    this.loadNewItem();
  }
  async indexUp(){
    await this.writeData()
    if(this.state.index<this.state.data.length-1){
      this.setState({index: this.state.index+1},()=>{this.loadNewItem()});
    }
  }
  async indexDown(){
    await this.writeData()
    if(this.state.index>=0){
      this.setState({index: this.state.index-1},()=>{this.loadNewItem();}); 
    }
  }
  handleChange = (selectedOption) => {
    this.setState({topic:selectedOption.value[0]});
  }
  async startDownload(){
    await this.writeData()
    this.setState({download:true})
  }
  writeData(){
    this.setState({download:false})
    var correct=(this.state.correct===true)?1:0;
    var manual = this.state.topic;
    this.setState({
      data: update(this.state.data, {[this.state.index]: {Correct: {$set: correct}}}),
    },()=>{this.setState({
        data: update(this.state.data, {[this.state.index]: {Manual: {$set: manual}}}),
      })
    })
  }
  componentDidMount() {
    var csvFilePath = require("./data/"+fileName);
    var Papa = require("papaparse/papaparse.min.js");
    Papa.parse(csvFilePath, {
      header: true,
      download: true,
      skipEmptyLines: true,
      complete: this.updateData
    });
    document.addEventListener("keydown", this.keyFunction, false);
    M.Modal.init(this.Modal);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
  }
  handleInit() {
  }
  keyFunction(event) {
    var key = event.keyCode || event.charCode || 0;
    var target = event.target || event.srcElement;
    var targetTagName = (target.nodeType === 1) ? target.nodeName.toUpperCase() : "";
    if ( !/INPUT|SELECT|TEXTAREA/.test(targetTagName) ){
      switch(key){
        case 65: document.getElementById("arrowDown").click();break;
        case 68: document.getElementById("arrowUp").click();break;
        case 37: document.getElementById("arrowDown").click();break;
        case 39: document.getElementById("arrowUp").click();break;
        case 89: document.getElementById("yesBtn").click();break;
        case 78: document.getElementById("noBtn").click();break;
        case 13:if(!this.state.correct) this.selectRef.focus();break;
        default: break;
      }
    }
  }
  render() {
    if(this.state.data!==undefined){
      const currentTopic = this.state.data[this.state.index].Topic.replace(/[["\]]/g, '')
      const titleTextList = this.state.data[this.state.index].Title.replace(/[^A-Z0-9\s-]/ig, '').split(' ');
      var prevKeyword = {}
      const titleList = titleTextList.map((word, i)=>
        <span
          style={{cursor:"pointer"}}
          key={i} 
          className={(this.state.keyword.find(element=>element.word===word)!==undefined)?"orange-text":null}
          onClick={()=>{
            console.log(this.state.keyword.length===0)
            if(this.state.length===0){
              prevKeyword = {key:i,word:word}
              this.setState({keyword:{key:i,word:word}},()=>{
                console.log(prevKeyword)
              })
            } else {
              if(this.state.keyword.find(element=>element.word===word)===undefined){
                this.setState(prevState => ({
                  keyword: [...prevState.keyword, {key:i,word:word}]
                }))
              } else {
                this.setState(prevState => ({
                  keyword: prevState.keyword.filter(keyword => keyword.word !== word)
                }));
              }
            }
            
          }}
        >{word} </span>)
      return (
        <div className="container">
          <div className="card valign-wrapper" style={inlineStyle.divStyle} >
            <div className="row valign-wrapper" style={inlineStyle.mainRowStyle}>
              <div className="col m2 hide-on-small-only"  style={inlineStyle.arrowStyle}>
                <button id="arrowDown" 
                  onClick={this.indexDown} 
                  disabled={this.state.index===0?'disabled' : null} 
                  className=" btn-floating btn-large waves-effect waves-light blue">
                    <i style={inlineStyle.arrowTxtStyle} className="material-icons">keyboard_arrow_left</i>
                </button>
              </div>
              <div className="col m8 s12" style={inlineStyle.mainRowStyle}>
                <div className="card-content row" style={inlineStyle.contentStyle}>
                  <div className="col s6 l3">
                    <div className="input-field" style={inlineStyle.indexStyle}>
                      <i className="material-icons prefix">search</i>
                      <input type="number" id="index" value={this.state.index} onChange={this.indexSearch}/>
                      <label htmlFor="index" className="active">Index</label>
                    </div>
                  </div>
                  <div className="col s6 l4">
                    <div className="input-field" style={inlineStyle.indexStyle}>
                      <ReactAutocomplete
                        items={items}
                        getItemValue={item => item.label}
                        shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                        menuStyle={{
                          borderRadius: '3px',
                          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                          background: 'rgba(255, 255, 255, 0.9)',
                          padding: '2px 0',
                          fontSize: '80%',
                          position: 'fixed',
                          overflowX: 'hidden',
                          maxHeight: '15rem',
                          width:'3rem',
                          zIndex:"20000"}}
                        renderItem={(item, highlighted) =>
                          <div
                            key={item.id}
                            style={{ backgroundColor: highlighted ? '#e0e0e0' : 'white'}}>
                            {item.label}
                          </div>
                        }
                        value={this.state.filter}
                        onChange={(e) => this.setState({filter:e.target.value})}
                        onSelect={(val) => this.setState({filter:val})}
                      />
                      <label className="active" htmlFor="filter">Filter</label>
                    </div>
                  </div>
                  <div className="col s12 m6 l5 right">
                    {this.state.download?
                    <CSVLink 
                      data={this.state.data} 
                      filename={fileName}
                      target="_blank">
                      <button style={inlineStyle.saveBtn} className="waves-effect waves-light btn-large orange darken-4" onClick={this.startDownload}><i className="material-icons left">save_alt</i>Confirm</button>
                    </CSVLink>
                    :<button style={inlineStyle.saveBtn} className="waves-effect waves-light btn-large orange" onClick={this.startDownload}><i className="material-icons left">save</i>Download</button>}
                  </div>
                </div>
                <div className="card-content row" style={inlineStyle.contentStyle}>
                  <h5 id="customScroll"  className="col s12" style={inlineStyle.titleStyle}>{titleList}</h5>
                  <h6 id="customScroll" className="col s12" style={inlineStyle.descStyle}>{this.state.data[this.state.index].Description}</h6>
                </div>
                <div className="card-action" style={inlineStyle.actStyle}>
                  {(this.state.correct)?
                    <div className="row" style={inlineStyle.selectStyle}>
                      <h5 className="col s12" style={(currentTopic===""||currentTopic==="Cannot be determined")?inlineStyle.red:null}>
                        <strong >{currentTopic===""?"Cannot be determined":currentTopic}</strong>
                      </h5>
                    </div>
                    :
                    <div className="row" style={this.state.correct ? inlineStyle.hideStyle : inlineStyle.selectStyle}>
                      <div className="col s12 l6">
                        <Select 
                          classNamePrefix="react-select"
                          ref={ref => { this.selectRef = ref; }}
                          blurInputOnSelect
                          defaultValue={this.state.topic}
                          styles={inlineStyle.customStyles} 
                          value={{label : this.state.topic}}
                          options={options} 
                          onChange={this.handleChange}
                          theme={(theme) => ({
                            ...theme,
                            borderRadius: '10px'})}
                        />
                      </div>
                      <div className="col s12 l6">
                        <Modal />
                      </div>
                    </div>
                  }
                  <div className="row">
                    <div className="col s12">
                      <div className="row" style={inlineStyle.rowStyle}>
                        <div className="col s6">
                          <button id="yesBtn"
                            style={inlineStyle.btnStyle} 
                            className={this.state.correct ? 'waves-effect waves-light btn-large green': 'waves-effect waves-light btn-large grey'} 
                            onClick={this.setCorrect}><i style={inlineStyle.symbolStyle} className="material-icons left">check</i>yes
                          </button>
                        </div>
                        <div className="col s6">
                          <button id="noBtn"
                            style={inlineStyle.btnStyle} 
                            className={this.state.correct ? 'waves-effect waves-light btn-large grey': 'waves-effect waves-light btn-large red'} 
                            onClick={this.setFalse}><i style={inlineStyle.symbolStyle} className="material-icons left">clear</i>no
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col m2 hide-on-small-only" style={inlineStyle.arrowStyle}>
                <button id="arrowUp" 
                  onClick={this.indexUp} 
                  disabled={this.state.index===this.state.data.length-1?'disabled' : null} 
                  className="btn-floating btn-large waves-effect waves-light blue">
                    <i style={inlineStyle.arrowTxtStyle} className=" material-icons">keyboard_arrow_right</i>
                </button>
              </div>
            </div>
          </div>
          <FilePond ref={ref => this.pond = ref}
            files={this.state.files}
            allowMultiple={true}
            maxFiles={1}
            server="/api"
            oninit={() => this.handleInit() }
            onupdatefiles={(fileItems) => {
              this.setState({
                  files: fileItems.map(fileItem => fileItem.file)
              });
            }}>
          </FilePond>
        </div>
      );
    } else {
      return (
        <div style={inlineStyle.loadingStyle}><img src={load} alt="Loading..." style={inlineStyle.loadImg} height="100" width="100"/></div>
      )
    }
  }
}
export default App;
