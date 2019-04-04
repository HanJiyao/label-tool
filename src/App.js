import  React, { Component } from 'react';
import load from './load.svg';
import './App.css';
import Modal from './Modal'
import MSelect from './Select'
import Editor from './Editor'
import Select from 'react-select';
import axios from 'axios';
import M from "materialize-css";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import { hot } from 'react-hot-loader'
registerPlugin();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded:false,
      allFiles:[],
      selectedFiles:[],
      dataLength:0,
      queryData:[],
      title:'',
      description:'',
      topicPrev:'',
      topic: '',
      topicValue: '',
      correct: false,
      index: 0,
      filter:'',
      keyword:[],
      keywordsArr:[],
      newKeyword:'',
      keywordsJson:{},
      checkDisabled:true,
      items:[],
      options:[],
      selectedOption:null,
      updateDone:true,
      dataModified:false,
      arrowDisabledRight:false,
      arrowDisabledLeft:false,
    };
    this.handleTopicChange = this.handleTopicChange.bind(this);
    this.setCorrect = this.setCorrect.bind(this);
    this.setFalse = this.setFalse.bind(this);
    this.indexSearch = this.indexSearch.bind(this);
    this.indexDown = this.indexDown.bind(this);
    this.indexUp = this.indexUp.bind(this);
    this.keyFunction = this.keyFunction.bind(this);
    this.loadNewItem = this.loadNewItem.bind(this);
    this.selectRef=React.createRef();
    this.jsonUpdate = this.jsonUpdate.bind(this);
    this.getData = this.getData.bind(this)
    this.filterData = this.filterData.bind(this);
    this.editJson = this.editJson.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.clearKeywords = this.clearKeywords.bind(this);
    this.changeFiles = this.changeFiles.bind(this);
  }
  changeFiles(selectedFiles){
    this.setState({selectedFiles:selectedFiles})
  }
  setCorrect(){
    this.setState({correct:true, dataModified:true});
  }
  setFalse(){
    this.setState({correct:false, dataModified:true});
  }
  handleTopicChange(selectedOption){
    this.setState({topic:selectedOption.label});
    this.setState({topicValue:selectedOption.value});
    this.setState({selectedOption:selectedOption});
    this.setState({dataModified:true});
    if(this.state.keyword.length!==0)
      this.setState({checkDisabled:false})
  } 
  loadNewItem(){
    this.setState({dataModified:false})
    axios.get('/api/loadNewItem/'+this.state.index)
    .then(res=>{
      let topic = res.data.topic
      this.setState({dataLength:res.data.dataLength})
      this.setState({title:res.data.title})
      this.setState({description:res.data.description})
      this.setState({topicPrev:res.data.topicPrev})
      this.setState({topic:topic})
      this.setState({selectedOption:(topic==="")?null:this.state.options.find((element)=>element.label===topic)})
      this.setState({topicValue:(topic==="")?null:this.state.options.find((element)=>element.label===topic).value})
      this.setState({correct:res.data.correct})
      this.setState({keyword:[]})
      this.setState({checkDisabled:true}) 
      this.setState({arrowDisabledLeft:false,arrowDisabledRight:false})
    })
    .catch(err=>console.log(err))
  }
  indexSearch(event){
    var index = parseInt(event.target.value)
    if(index>this.state.dataLength-1 ){
      this.setState({index: this.state.dataLength-1},()=>{this.loadNewItem()});
    } else if (index < 0 || isNaN(index)) {
      this.setState({index:0},()=>{this.loadNewItem()});
    } else {
      if(!this.state.dataModified){
        this.setState({index:index},()=>{this.loadNewItem()})
      } else {
        axios.post('/api/updateItem',{
          index:this.state.index,
          correct:this.state.correct===true?1:0,
          topicModified:this.state.topic
        }).then((res)=>{
          console.log("update item "+this.state.index, res.data.updateDone)
          if(res.data.updateDone){
            this.setState({index: this.state.index+1},()=>this.loadNewItem())
          }
        })
        .catch(err=>console.log(err))
      }
    }
  }
  indexUp(){
    if(this.state.index<this.state.dataLength-1){
      this.setState({arrowDisabledRight:true})
      if(!this.state.dataModified){
        this.setState({index: this.state.index+1},()=>this.loadNewItem())
      } else {
        axios.post('/api/updateItem',{
          index:this.state.index,
          correct:this.state.correct===true?1:0,
          topicModified:this.state.topic
        }).then((res)=>{
          console.log("update item "+this.state.index, res.data.updateDone)
          if(res.data.updateDone){
            this.setState({index: this.state.index+1},()=>this.loadNewItem())
          }
        })
        .catch(err=>console.log(err))
      }
    }
  }
  indexDown(){
    if(this.state.index>=0){
      this.setState({arrowDisabledLeft:true})
      if(!this.state.dataModified){
        this.setState({index: this.state.index-1},()=>this.loadNewItem())
      } else {
        axios.post('/api/updateItem',{
          index:this.state.index,
          correct:this.state.correct===true?1:0,
          topicModified:this.state.topic
        }).then((res)=>{
          console.log("update item "+this.state.index, res.data.updateDone)
          if(res.data.updateDone){
            this.setState({index: this.state.index-1},()=>this.loadNewItem())
          }
        })
        .catch(err=>console.log(err))
      }
    }
  }
  filterData(){
    axios.post('/api/filterData',{keywords:this.state.keyword})
      .then(res=>{
        this.setState({newKeyword:res.data.queryKeyword})
        this.setState({queryData:res.data.queryData})
      })
      .catch(err=>console.log(err))
  }
  async jsonUpdate(){
    this.setState({updateDone:false})
    this.setState({title:'Loading。。。'})
    this.setState({description:'Please be patient (´・ω・｀)'})
    await axios.post('/api/updateData',{
      index:this.state.index,
      topic:this.state.topicValue,
      newKeyword:this.state.newKeyword,
      keywordsJson:this.state.keywordsJson
    }).then(async res=>{
      this.setState({title:res.data.title})
      this.setState({description:res.data.description})
      let topic = res.data.topic
      this.setState({dataLength:res.data.dataLength})
      this.setState({topicPrev:res.data.topicPrev})
      this.setState({topic:topic})
      this.setState({selectedOption:(topic==="")?null:this.state.options.find((element)=>element.label===topic)})
      this.setState({topicValue:(topic==="")?null:this.state.options.find((element)=>element.label===topic).value})
      this.setState({correct:res.data.correct})
      this.setState({keyword:[]})
      this.setState({checkDisabled:true}) 
      this.setState({dataModified:false})
      await this.setState({keywordsJson:res.data.keywordsJson})
      this.setState({updateDone:res.data.updateDone})
    })
    .catch(err=>console.log(err))
  }
  editJson(result){
    this.setState({keywordsJson:result.updated_src})
  }
  clearKeywords(){
    this.setState({newKeyword:'',keyword:[]})
  }
  getData(){
    fetch('/api/initData')
    .then(res => res.json())
    .then(result => {
      this.setState({dataLength:result.dataLength})
      this.setState({items:result.items})
      this.setState({options:result.options})
      this.setState({loaded:true})
      this.setState({keywordsJson:result.keywordsJson})
      this.setState({allFiles:result.file,selectedFiles:result.file})
    }).then(()=>{
      this.loadNewItem()
      this.setState({loaded:true})
    })
  }
  async refreshData(){
    this.clearKeywords()
    this.setState({updateDone:false})
    this.setState({title:'Loading。。。'})
    this.setState({description:'Please be patient (´・ω・｀)'})
    await axios.post('/api/refreshData',{
      index:this.state.index,
      selectedFiles:this.state.selectedFiles,
      keywordsJson:this.state.keywordsJson
    }).then(async res=>{
      this.setState({items:res.data.items})
      this.setState({title:res.data.title})
      this.setState({description:res.data.description})
      let topic = res.data.topic
      this.setState({dataLength:res.data.dataLength})
      this.setState({topicPrev:res.data.topicPrev})
      this.setState({topic:topic})
      this.setState({selectedOption:(topic==="")?null:this.state.options.find((element)=>element.label===topic)})
      this.setState({topicValue:(topic==="")?null:this.state.options.find((element)=>element.label===topic).value})
      this.setState({correct:res.data.correct})
      this.setState({keyword:[]})
      this.setState({checkDisabled:true}) 
      await this.setState({keywordsJson:res.data.keywordsJson})
      this.setState({files:null})
      this.setState({updateDone:res.data.updateDone})
      this.setState({dataModified:false})
      const options = {};
      var elems = document.querySelectorAll('select');
      M.FormSelect.init(elems, options);
    })
    .catch(err=>console.log(err))
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
        case 13: this.selectRef.focus();break;
        default: break;
      }
    }
  }
  componentDidMount() {
    this.getData();
    const options = {};
    var elems = this.tooltip
    M.Tooltip.init(elems, options);
    document.addEventListener('FilePond:processfile', e => {
      if (e.detail.error) {
          console.log('Upload Failed');
          return;
      }
      this.setState({
        selectedFiles: [...this.state.selectedFiles, this.state.files[0].name]
      },()=>this.refreshData())
    });
    document.addEventListener("keydown", this.keyFunction, false);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
  }  
  render() {
    if(this.state.loaded){
      let currentTopic=""
      let titleTextList=[]
      let description=""
      try{
        currentTopic = this.state.topicPrev.replace(/[["\]]/g, '');
        titleTextList = this.state.title.split(/\W+/);
        description = this.state.description
      } catch {
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
                }),()=>{
                  if(this.state.topic!==""&&this.state.keyword.length!==0)
                  this.setState({checkDisabled:false})  
                  else
                  this.setState({checkDisabled:true})
                })
              } else {
                this.setState(prevState => ({
                  keyword: prevState.keyword.filter(keyword => keyword.word !== word)
                }),()=>{
                  if(this.state.topic!==""&&this.state.keyword.length!==0)
                  this.setState({checkDisabled:false})  
                  else
                  this.setState({checkDisabled:true})  
                })
              }                 
          }}> {word} 
        </span>)
      return (
        <div className="container">
          {!this.state.updateDone?
          <div style={{width:'100vw',height:'100vh',position:"absolute",top:'0',left:'0',zIndex:'99999',background:'rgba(0,0,0,0.3)'}} className="valign-wrapper center-align">
            <img style={{margin:"auto"}} src={load} alt="Loading..." height="200" width="200"/>
          </div>:<></>}
          <div className="card" style={{textAlign:"center",paddingBottom:"1rem"}} >
            <div className="card-action row" style={{paddingTop:"2rem",margin:"0",border:"none"}}>
              <div className="input-field col s3 m2">
                <input type="number" id="index" value={this.state.index} onChange={this.indexSearch}/>
                <label htmlFor="index" className="active">{this.state.index}/{this.state.dataLength-1}</label>
              </div>
              <MSelect 
                elems={this.state.items} 
                selectedFiles={this.state.selectedFiles} 
                changeFiles={this.changeFiles}
              />
              <div className="input-field col s2 left-align">
                <i ref={tooltip => {this.tooltip = tooltip}} id="refreshBtn" 
                  className="material-icons prefix grey-text tooltipped" 
                  data-position="top" data-tooltip="Reset all data"
                  onClick={this.refreshData}
                  title="Danger: this will reload data, save keywords file first">cached
                </i>
              </div>
              <div className="col s3 hide-on-med-and-up mobileNav mobileArrowLeft"  style={{color:"white"}}>
                <button id="arrowDown" s
                  onClick={this.indexDown} 
                  disabled={this.state.index===0||this.state.arrowDisabledLeft?'disabled' : null} 
                  className=" btn-floating btn-large waves-effect waves-light orange">
                    <i style={{fontSize:"3rem",margin:"0"}} className="material-icons">keyboard_arrow_left</i>
                </button>
              </div>
              <div className="col s6 m4">
                <Editor 
                  keywordsJson = {this.state.keywordsJson} 
                  editJson = {this.editJson} 
                  jsonUpdateRefresh={this.refreshData} 
                  clearKeywords={this.clearKeywords}/>
              </div>
              <div className="col s3 hide-on-med-and-up mobileNav mobileArrowRight" style={{color:"white"}}>
                <button id="arrowUp" 
                  onClick={this.indexUp} 
                  disabled={this.state.index===this.state.dataLength-1||this.state.arrowDisabledRight?'disabled' : null} 
                  className="btn-floating btn-large waves-effect waves-light orange">
                    <i style={{fontSize:"3rem",margin:"0"}} className=" material-icons">keyboard_arrow_right</i>
                </button>
              </div>
            </div>
            <div id="cardContent" className="row valign-wrapper" style={{width:"100%",margin:"0",padding:"0 24px",borderTop:"1px solid rgba(160,160,160,0.2)"}}>
              <div className="col m2 hide-on-small-only"  style={{color:"white"}}>
                <button id="arrowDown" 
                  onClick={this.indexDown} 
                  disabled={(this.state.index===0||this.state.arrowDisabledLeft)?'disabled': null} 
                  className=" btn-floating btn-large waves-effect waves-light orange">
                    <i style={{fontSize:"3rem",margin:"0"}} className="material-icons">keyboard_arrow_left</i>
                </button>
              </div>
              <div className="col m8 s12" style={{margin:"0"}}>
                <div className="card-content row" style={{textAlign:"left",margin:"0",paddingTop:".5rem"}}>
                  <h5 id="customScroll"  className="col s12" style={{height:"4.2rem",overflowY:"scroll",fontSize:"1.8rem",padding:"0"}}>{titleList}</h5>
                  <h6 id="customScroll" className="col s12" style={{height:"7.5rem",overflowY:"scroll",wordBrea:"break-word",padding:"0"}}>{description}</h6>
                </div>
              </div>
              <div className="col m2 hide-on-small-only" style={{color:"white"}}>
                <button id="arrowUp" 
                  onClick={this.indexUp} 
                  disabled={this.state.index===this.state.dataLength-1||this.state.arrowDisabledRight?'disabled' : null} 
                  className="btn-floating btn-large waves-effect waves-light orange">
                    <i style={{fontSize:"3rem",margin:"0"}} className=" material-icons">keyboard_arrow_right</i>
                </button>
              </div>
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
                      placeholder="Select Topic ..."
                      classNamePrefix="react-select"
                      ref={ref => { this.selectRef = ref; }}
                      blurInputOnSelect
                      value={this.state.selectedOption}
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
          <FilePond ref={ref => this.pond = ref}
            labelIdle='Import Data Here'
            files={this.state.files}
            name={"file"}
            server="/api/upload"
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
export default process.env.NODE_ENV === "development" ? hot(module)(App) : App
