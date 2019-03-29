import  React, { Component } from 'react';
import load from './load.svg';
import './App.css';
import Modal from './Modal'
import MSelect from './Select'
import Select from 'react-select';
import update from 'react-addons-update'; 
import axios from 'axios';
import { CSVLink } from 'react-csv'
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
registerPlugin();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded:false,
      data:[],
      queryData:[],
      topic: '',
      correct: false,
      index: 0,
      download:false,
      filter:'',
      keyword:[],
      keywordsArr:[],
      newKeyword:'',
      keywordsJson:{},
      checkDisabled:true,
      items:[],
      options:[],
    };
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setCorrect = this.setCorrect.bind(this);
    this.setFalse = this.setFalse.bind(this);
    this.indexSearch = this.indexSearch.bind(this);
    this.indexDown = this.indexDown.bind(this);
    this.indexUp = this.indexUp.bind(this);
    this.keyFunction = this.keyFunction.bind(this);
    this.loadNewItem = this.loadNewItem.bind(this);
    this.writeData = this.writeData.bind(this);
    this.startDownload = this.startDownload.bind(this);
    this.selectRef=React.createRef();
    this.jsonUpdate = this.jsonUpdate.bind(this);
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
  handleTopicChange = (selectedOption) => {
    this.setState({topic:selectedOption.value[0]});
    if(this.state.keyword.length!==0)
      this.setState({checkDisabled:false})
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
  filterData(e){
    e.preventDefault();
    axios.post('/api/filterData',{keywords:this.state.keyword})
      .then(res=>{
        this.setState({newKeyword:res.data.queryKeyword})
        this.setState({queryData:res.data.queryData})
      })
      .catch(e=>console.log(e))
  }
  jsonUpdate(e){
    e.preventDefault();
    axios.post('/api/updateData',{
      topic:this.state.topic,
      newKeyword:this.state.newKeyword
    })
    .then(res=>{
      this.setState({data:res.data.newData})
      this.loadNewItem()
    })
    .catch(e=>console.log(e))
  }
  getData = () => {
    fetch('/api/initData')
    .then(res => res.json())
    .then(result => {
      this.setState({data:result.data})
      this.setState({items:result.items})
      this.setState({options:result.options})
      this.setState({loaded:true})
    })
  }
  componentDidMount() {
    this.getData();
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
        currentTopic="Error: Invalid Data"
        titleTextList=["Error: Invalid Data"]
        description="Error: Invalid Data"
      }
      const titleList = titleTextList.map((word, i)=>
        <span
          key={i} 
          className={(this.state.keyword.find(element=>element.word===word)!==undefined)?"selectTitle orange-text text-darken-4 active":"selectTitle"}
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
              if(this.state.topic!=="")
              this.setState({checkDisabled:false})          
          }}> {word} 
        </span>)
      return (
        <div className="container">
          <div className="card" style={{textAlign:"center",padding:"0"}} >
            <div className="row valign-wrapper" style={{width:"100%",margin:"0"}}>
              <div className="col m2 hide-on-small-only"  style={{color:"white"}}>
                <button id="arrowDown" 
                  onClick={this.indexDown} 
                  disabled={this.state.index===0?'disabled' : null} 
                  className=" btn-floating btn-large waves-effect waves-light orange">
                    <i style={{fontSize:"3rem",margin:"0"}} className="material-icons">keyboard_arrow_left</i>
                </button>
              </div>
              <div className="col m8 s12" style={{width:"100%",margin:"0"}}>
                <div className="row" style={{padding:".75rem",paddingTop:"2rem",margin:"0"}}>
                  <div className="input-field col s5 m3">
                    <i className="material-icons prefix black-text">search</i>
                    <input type="number" id="index" value={this.state.index} onChange={this.indexSearch}/>
                    <span id="indexSuffix"></span>
                    <label htmlFor="index" className="active">{this.state.index}/{this.state.data.length}</label>
                  </div>
                  <MSelect elems={this.state.items}/>
                  <div className="col s3 hide-on-med-and-up mobileNav mobileArrowLeft"  style={{color:"white"}}>
                    <button id="arrowDown" 
                      onClick={this.indexDown} 
                      disabled={this.state.index===0?'disabled' : null} 
                      className=" btn-floating btn-large waves-effect waves-light orange">
                        <i style={{fontSize:"3rem",margin:"0"}} className="material-icons">keyboard_arrow_left</i>
                    </button>
                  </div>
                  <div className="col s6 m4 mobileNav">
                    <button style={{borderRadius:"100px",width:"100%",marginBottom:"1rem"}} 
                      className="waves-effect waves-light btn-large orange" ><i className="material-icons left">save</i>save
                    </button>
                  </div>
                  <div className="col s3 hide-on-med-and-up mobileNav mobileArrowRight" style={{color:"white"}}>
                    <button id="arrowUp" 
                      onClick={this.indexUp} 
                      disabled={this.state.index===this.state.data.length-1?'disabled' : null} 
                      className="btn-floating btn-large waves-effect waves-light orange">
                        <i style={{fontSize:"3rem",margin:"0"}} className=" material-icons">keyboard_arrow_right</i>
                    </button>
                  </div>
                </div>
                <div className="card-content row" style={{textAlign:"left",margin:"0",paddingTop:".5rem"}}>
                  <h5 id="customScroll"  className="col s12" style={{height:"4.2rem",overflowY:"scroll",fontSize:"1.8rem"}}>{titleList}</h5>
                  <h6 id="customScroll" className="col s12" style={{height:"7.5rem",overflowY:"scroll"}}>{description}</h6>
                </div>
                <div className="card-action" style={{textAlign:"left",paddingTop:"0",}}>
                  {(this.state.correct)?
                    <div className="row currentTopic valign-wrapper" style={{paddingTop:"2rem",margin:"0",height:"85px"}}>
                      <h5 className="col s12 center-align" style={(currentTopic===""||currentTopic==="Cannot be determined")?{color:"red"}:null}>
                        <strong >{currentTopic===""?"Cannot be determined":currentTopic}</strong>
                      </h5>
                    </div>
                    :
                    <div className="row" style={this.state.correct ? {display:'none'} : {paddingTop:"2rem",margin:"0",height:"85px"}}>
                      <div className="col s12 l6">
                        <Select 
                          classNamePrefix="react-select"
                          ref={ref => { this.selectRef = ref; }}
                          blurInputOnSelect
                          defaultValue={this.state.topic}
                          value={{label : this.state.topic}}
                          options={this.state.options} 
                          onChange={this.handleTopicChange}
                          theme={(theme) => ({
                            ...theme,
                            borderRadius: '10px'})}
                        />
                      </div>
                      <div className="col s12 l6">
                        <Modal 
                          checkDisabled ={this.state.checkDisabled}
                          jsonUpdate = {this.jsonUpdate}
                          filterData = {this.filterData}
                          queryData = {this.state.queryData}
                          newKeyword = {this.state.newKeyword}
                          topic = {this.state.topic}
                        />
                      </div>
                    </div>
                  }
                  <div className="row">
                    <div className="col s12">
                      <div className="row" style={{paddingTop:"1.5rem",margin:"0",}}>
                        <div className="col s6">
                          <button id="yesBtn"
                            style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.5rem",fontWeight:"600"}} 
                            className={this.state.correct ? 'waves-effect waves-light btn-large green': 'waves-effect waves-light btn-large grey'} 
                            onClick={this.setCorrect}><i style={{fontSize:"2rem",fontWeight:"900",margin:"0"}} className="material-icons left">check</i>yes
                          </button>
                        </div>
                        <div className="col s6">
                          <button id="noBtn"
                            style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.5rem",fontWeight:"600"}} 
                            className={this.state.correct ? 'waves-effect waves-light btn-large grey': 'waves-effect waves-light btn-large red'} 
                            onClick={this.setFalse}><i style={{fontSize:"2rem",fontWeight:"900",margin:"0"}} className="material-icons left">clear</i>no
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col m2 hide-on-small-only" style={{color:"white"}}>
                <button id="arrowUp" 
                  onClick={this.indexUp} 
                  disabled={this.state.index===this.state.data.length-1?'disabled' : null} 
                  className="btn-floating btn-large waves-effect waves-light orange">
                    <i style={{fontSize:"3rem",margin:"0"}} className=" material-icons">keyboard_arrow_right</i>
                </button>
              </div>
            </div>
          </div>    
          <div className="row">            
            <div className="col s6">
              <FilePond ref={ref => this.pond = ref}
                labelIdle='Import'
                files={this.state.files}
                allowMultiple={true}
                maxFiles={3}
                server="/api/upload"
                onupdatefiles={(fileItems) => {
                  this.setState({
                    files: fileItems.map(fileItem => fileItem.file)
                  });
                }}>
              </FilePond>
            </div>
            <div className="col s6 center-align valign-helper">
              {this.state.download?
                <CSVLink 
                  data={this.state.data} 
                  filename="all_items.csv"
                  target="_blank">
                  <button style={{textTransform:"none",minHeight:"4.75rem",width:"100%"}} 
                    className="waves-effect waves-grey btn-flat red-text" 
                    onClick={this.startDownload}><strong>Start Download</strong></button>
                </CSVLink>
                :<button style={{textTransform:"none",minHeight:"4.75rem",fontSize:".875rem",color:"#9e9e9e",width:"100%"}} 
                  className="waves-effect waves-grey btn-flat" 
                  onClick={this.startDownload}>Export CSV
                </button>
              }
            </div>
          </div>
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
