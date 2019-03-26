import  React, { Component } from 'react';
import './App.css';
import Select from 'react-select';
import load from './load.svg';
import update from 'react-addons-update'; 
import { CSVLink } from 'react-csv'
import { FilePond, registerPlugin } from 'react-filepond';
import ReactAutocomplete from 'react-autocomplete';
import 'filepond/dist/filepond.min.css';
import Modal from './Modal'
registerPlugin();

const fileName = ['all_items_barclaysT2.csv']
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
options.unshift({value: "Cannot be determined", label: "Cannot be determined"})
items.unshift({id: "Cannot be determined", label: "Cannot be determined"})
const inlineStyle = {
  customStyles:{
    option: (provided, state) => ({
      ...provided,})
  },
  divStyle : {textAlign:"center",padding:"0"},
  contentStyle:{textAlign:"left",margin:"0",paddingTop:".5rem"},
  btnStyle:{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.5rem",fontWeight:"600"},
  symbolStyle:{fontSize:"2rem",fontWeight:"900",margin:"0"},
  actStyle:{textAlign:"left",paddingTop:"0",},
  rowStyle:{paddingTop:"1.5rem",margin:"0",},
  arrowStyle:{color:"white"},
  arrowTxtStyle:{fontSize:"3rem",margin:"0"},
  hideStyle:{display:'none'},
  red:{color:"red"},saveBtn:{borderRadius:"100px",width:"100%",marginBottom:"1rem"},
  selectStyle:{paddingTop:"2rem",margin:"0",height:"85px"},
  mainRowStyle:{paddingTop:"1rem",width:"100%",margin:"0"},
  descStyle:{height:"7.5rem",overflowY:"scroll"},
  titleStyle:{height:"4.2rem",overflowY:"scroll",fontSize:"1.8rem"}
}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded:false,
      data:{},
      displayData:{},
      queryData:[],
      topic: '',
      correct: false,
      index: 0,
      download:false,
      filter:'',
      keyword:[],
      keywordJson:topicTxt,
      checkDisabled:true
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
    this.outputHandler = this.outputHandler.bind(this);
    this.filterData = this.filterData.bind(this)
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
    this.setState({topic:(this.state.data[this.state.index].Manual===undefined)?"":this.state.data[this.state.index].Manual})
    this.setState({correct:(this.state.data[this.state.index].Correct===0)?false:((this.state.data[this.state.index].Correct===undefined)?false:true)})
    this.setState({keyword:[]})
    this.setState({checkDisabled:true})  
  }
  async updateData(result) {
    const data = result.data;
    await this.setState({data: data}); 
    await this.loadNewItem();
    this.setState({loaded: true})
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
    var Papa = require("papaparse/papaparse.min.js");
    for (var i = 0; i < fileName.length; i++){
      var csvFilePath = require("./data/"+fileName[i]);
      Papa.parse(csvFilePath, {
        header: true,
        download: true,
        skipEmptyLines: true,
        complete: this.updateData
      });
    }
    document.addEventListener("keydown", this.keyFunction, false);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
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
        case 67: document.getElementById("checkBtn").click();break;
        case 13:if(!this.state.correct) this.selectRef.focus();break;
        default: break;
      }
    }
  }
  outputHandler(){
    console.log("out")
  }
  filterData(){
    var queryKeyword = this.state.keyword.sort((a,b)=>{
      if (parseInt(b.key) > parseInt(a.key))
        return -1;
      if (parseInt(b.key) < parseInt(a.key))
        return 1;
      return 0;
    })
    queryKeyword = queryKeyword.map((item,i)=>{
      return item.word
    }).join(" ").toLowerCase()
    this.setState({queryData:this.state.data.filter((item)=>{
        return (item.Title.toLowerCase().indexOf(queryKeyword)!==-1)
      })
    })
  }
  render() {
    if(this.state.loaded){
      let currentTopic=""
      let titleTextList=[]
      let description=""
      try{
        currentTopic = this.state.data[this.state.index].Topic.replace(/[["\]]/g, '');
        titleTextList = this.state.data[this.state.index].Title.replace(/[^A-Za-z0-9\s-']/ig, '').split(' ');
        description = this.state.data[this.state.index].Description
      } catch{
        currentTopic="Error: Invalid Data "
        titleTextList=["Error: Invalid Data "]
        description="Error: Invalid Data "
      }
      const titleList = titleTextList.map((word, i)=>
        <span
          style={{cursor:"pointer"}}
          key={i} 
          className={(this.state.keyword.find(element=>element.word===word)!==undefined)?"selectTitle orange-text text-darken-4":"selectTitle"}
          onClick={()=>{
              if(this.state.keyword.find(element=>element.word===word)===undefined){
                this.setState(prevState => ({
                  keyword: [...prevState.keyword, {key:i,word:word}]
                }))
              } else {
                this.setState(prevState => ({
                  keyword: prevState.keyword.filter(keyword => keyword.word !== word)
                }));
              }  
              this.setState({checkDisabled:false})          
          }}> {word} 
        </span>)
      return (
        <div className="container">
          <div className="card valign-wrapper" style={inlineStyle.divStyle} >
            <div className="row valign-wrapper" style={inlineStyle.mainRowStyle}>
              <div className="col m2 hide-on-small-only"  style={inlineStyle.arrowStyle}>
                <button id="arrowDown" 
                  onClick={this.indexDown} 
                  disabled={this.state.index===0?'disabled' : null} 
                  className=" btn-floating btn-large waves-effect waves-light orange">
                    <i style={inlineStyle.arrowTxtStyle} className="material-icons">keyboard_arrow_left</i>
                </button>
              </div>
              <div className="col m8 s12" style={inlineStyle.mainRowStyle}>
                <div className="card-content row" style={inlineStyle.contentStyle}>
                  <div className="col s4 m3">
                    <div className="input-field" style={inlineStyle.indexStyle}>
                      <i className="material-icons prefix">search</i>
                      <input type="number" id="index" value={this.state.index} onChange={this.indexSearch}/>
                      <label htmlFor="index" className="active">Index</label>
                    </div>
                  </div>
                  <div className="col s8 m4">
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
                          width:'5rem',
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
                  <div className="col s3 hide-on-med-and-up mobileNav mobileArrowLeft"  style={inlineStyle.arrowStyle}>
                    <button id="arrowDown" 
                      onClick={this.indexDown} 
                      disabled={this.state.index===0?'disabled' : null} 
                      className=" btn-floating btn-large waves-effect waves-light orange">
                        <i style={inlineStyle.arrowTxtStyle} className="material-icons">keyboard_arrow_left</i>
                    </button>
                  </div>
                  <div className="col s6 m5 mobileNav">
                    {this.state.download?
                    <CSVLink 
                      data={this.state.data} 
                      filename="all_items.csv"
                      target="_blank">
                      <button style={inlineStyle.saveBtn} className="waves-effect waves-light btn-large orange darken-4" onClick={this.startDownload}><i className="material-icons left">save_alt</i>Confirm</button>
                    </CSVLink>
                    :<button style={inlineStyle.saveBtn} className="waves-effect waves-light btn-large orange" onClick={this.startDownload}><i className="material-icons left">save</i>save</button>}
                  </div>
                  <div className="col s3 hide-on-med-and-up mobileNav mobileArrowRight" style={inlineStyle.arrowStyle}>
                    <button id="arrowUp" 
                      onClick={this.indexUp} 
                      disabled={this.state.index===this.state.data.length-1?'disabled' : null} 
                      className="btn-floating btn-large waves-effect waves-light orange">
                        <i style={inlineStyle.arrowTxtStyle} className=" material-icons">keyboard_arrow_right</i>
                    </button>
                  </div>
                </div>
                <div className="card-content row" style={inlineStyle.contentStyle}>
                  <h5 id="customScroll"  className="col s12" style={inlineStyle.titleStyle}>{titleList}</h5>
                  <h6 id="customScroll" className="col s12" style={inlineStyle.descStyle}>{description}</h6>
                </div>
                <div className="card-action" style={inlineStyle.actStyle}>
                  {(this.state.correct)?
                    <div className="row currentTopic valign-wrapper" style={inlineStyle.selectStyle}>
                      <h5 className="col s12 center-align" style={(currentTopic===""||currentTopic==="Cannot be determined")?inlineStyle.red:null}>
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
                        <Modal 
                          checkDisabled ={this.state.checkDisabled}
                          outputHandler = {this.outputHandler}
                          filterData = {this.filterData}
                          queryData = {this.state.queryData}
                        />
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
                  className="btn-floating btn-large waves-effect waves-light orange">
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
        <div style={{width:'100vw',height:'100vh'}} className="valign-wrapper center-align">
          <img style={{margin:"auto"}} src={load} alt="Loading..." height="200" width="200"/>
        </div>
      )
    }
  }
}
export default App;
