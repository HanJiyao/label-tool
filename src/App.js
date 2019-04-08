import  React, { Component } from 'react';
import load from './load.svg';
import './App.css';
import Modal from './Modal'
import MSelect from './Select'
import Editor from './Editor'
import FileMgr from './FileMgr'
import Select from 'react-select';
import axios from 'axios';
import 'materialize-css'
import 'materialize-css/dist/css/materialize.min.css';
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
    this.initData = this.initData.bind(this)
    this.filterData = this.filterData.bind(this);
    this.editJson = this.editJson.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.clearKeywords = this.clearKeywords.bind(this);
    this.changeFiles = this.changeFiles.bind(this);
    this.searchData = this.searchData.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
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
    this.setState({
      topic:selectedOption.label,
      topicValue:selectedOption.value,
      selectedOption:selectedOption,
      dataModified:true
    })
    if(this.state.keyword.length!==0) this.setState({checkDisabled:false})
  } 
  loadNewItem(){
    this.setState({dataModified:false})
    axios.get('/api/loadNewItem/'+this.state.index)
    .then(res=>{
      let topic = res.data.topic
      this.setState({
        dataLength:res.data.dataLength,
        title:res.data.title,
        description:res.data.description,
        topicPrev:res.data.topicPrev,
        topic:topic,
        selectedOption:(topic==="")?null:this.state.options.find((element)=>element.label===topic),
        topicValue:(topic==="")?null:this.state.options.find((element)=>element.label===topic).value,
        correct:res.data.correct,
        keyword:[],
        checkDisabled:true,
        arrowDisabledLeft:false,
        arrowDisabledRight:false
      })
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
          if(res.data.updateDone){
            this.setState({index: this.state.index-1},()=>this.loadNewItem())
          }
        })
        .catch(err=>console.log(err))
      }
    }
  }
  searchData(index){
    this.setState({index:index},()=>this.loadNewItem())
  }
  clearSearch(){
    this.setState({keyword:[],keywordSearch:'',checkDisabled:true})
  }
  filterData(){
    axios.post('/api/filterData',{keywords:this.state.keyword})
      .then(res=>{
        this.setState({newKeyword:res.data.queryKeyword, queryData:res.data.queryData})
      })
      .catch(err=>console.log(err))
  }
  jsonUpdate(){
    this.setState({
      updateDone:false,
      title:'Loading。。。',
      description:'Please be patient (´・ω・｀)'
    })
    axios.post('/api/updateData',{
      index:this.state.index,
      topic:this.state.topicValue,
      newKeyword:this.state.newKeyword,
      keywordsJson:this.state.keywordsJson
    }).then(res=>{
      let topic = res.data.topic
      this.setState({
        title:res.data.title,
        description:res.data.description,
        dataLength:res.data.dataLength,
        topicPrev:res.data.topicPrev,
        topic:topic,
        selectedOption:(topic==="")?null:this.state.options.find((element)=>element.label===topic),
        topicValue:(topic==="")?null:this.state.options.find((element)=>element.label===topic).value,
        correct:res.data.correct,
        keyword:[],
        checkDisabled:true,
        dataModified:false,
        keywordsJson:res.data.keywordsJson,
        updateDone:res.data.updateDone
      })
    })
    .catch(err=>console.log(err))
  }
  editJson(result){
    this.setState({keywordsJson:result.updated_src})
  }
  clearKeywords(){
    this.setState({newKeyword:'',keyword:[],checkDisabled:true})
  }
  initData(){
    this.setState({updateDone:false})
    fetch('/api/initData')
    .then(res => res.json())
    .then(result => {
      this.setState({
        dataLength:result.dataLength,
        items:result.items,
        options:result.options,
        loaded:true,
        keywordsJson:result.keywordsJson,
        allFiles:result.file,
        selectedFiles:result.selectedFiles,
        files:null
      })
    }).then(()=>{
      this.loadNewItem()
      this.setState({loaded:true,updateDone:true})
    })
  }
  refreshData(){
    this.clearKeywords()
    this.setState({
      updateDone:false,
      title:'Loading。。。',
      description:'Please be patient (´・ω・｀)'
    })
    axios.post('/api/refreshData',{
      index:this.state.index,
      selectedFiles:this.state.selectedFiles,
      keywordsJson:this.state.keywordsJson
    }).then(res=>{
      let topic = res.data.topic
      this.setState({
        items:res.data.items,
        title:res.data.title,
        description:res.data.description,
        dataLength:res.data.dataLength,
        topicPrev:res.data.topicPrev,
        topic:topic,
        selectedOption:(topic==="")?null:this.state.options.find((element)=>element.label===topic),
        topicValue:(topic==="")?null:this.state.options.find((element)=>element.label===topic).value,
        correct:res.data.correct,
        keyword:[],
        keywordSearch:'',
        checkDisabled:true,
        keywordsJson:res.data.keywordsJson,
        files:null,
        updateDone:res.data.updateDone,
        dataModified:false
      })
      const options = {};
      var elems = document.querySelectorAll('select');
      M.FormSelect.init(elems, options);
    })
    .catch(err=>console.log(err))
  }
  deleteFile(deleteFiles){
    let selectedFiles = this.state.selectedFiles
    for (var i in deleteFiles){
      if(deleteFiles[i].status){
        var index = selectedFiles.indexOf(deleteFiles[i].file); 
        if (index > -1) {
            selectedFiles.splice(index, 1);
        }
      }
    }
    this.setState({selectedFiles:selectedFiles},()=>{
      console.log('update selected:',selectedFiles)
      console.log("delete files:",deleteFiles)
      axios.post('/api/deleteFile',{
        deleteFiles: deleteFiles,
        selectedFiles:selectedFiles
      }).then(res=>{if(res.data.deleteDone) this.refreshData()})
    })
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
    this.initData()
    document.addEventListener('FilePond:processfile', e => {
      if (e.detail.error) {
          console.log('Upload Failed');
          return;
      } else 
      this.setState({
        selectedFiles: [...this.state.selectedFiles, this.state.files[0].name]
      },()=>{
        if (e.detail.file.filename==='topics_keywords_latest.json'||e.detail.file.filename==='all_items_Merged.json') 
        this.initData()
        else this.refreshData()
      })
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
            <nav class="nav-extended orange">
              <div class="nav-wrapper orange">
                <form style={{height:"64px"}} onSubmit={(e)=>{
                  e.preventDefault()
                  const search = this.state.keywordSearch.split(/\W+/);
                  const searchList = search.map((word, i)=>{
                    return {key:i, word:word}
                  })
                  console.log('search on :',searchList)
                  this.setState({checkDisabled:false,keyword:searchList},()=>document.getElementById("checkBtn").click())
                }}>
                  <div class="input-field orange">
                    <input id="search" type="search" value={this.state.keywordSearch} 
                      onChange={(e)=>this.setState({keywordSearch:e.target.value})} 
                    />
                    <label class="label-icon" for="search"><i class="material-icons" style={{lineHeight:"64px"}}>search</i></label>
                  </div>
                </form>
                <ul style={{position:"absolute",top:"0",right:"0"}}>
                  <li><FileMgr items = {this.state.items} selectedFiles = {this.state.selectedFiles} deleteFile = {this.deleteFile} /></li>
                  <li><a href="/api/download" download><i class="material-icons" style={{paddingTop: "3.6px"}}>get_app</i></a></li>
                  <li><a href="/"><i class="material-icons" style={{paddingTop: "3.6px"}}>refresh</i></a></li>
                  <li><a href="#!" style={{paddingTop: "3.6px"}}><i class="material-icons">more_vert</i></a></li>
                </ul>
              </div>
              <div class="nav-content">
                <div className="row" style={{margin:"0",padding:"30px 8px 0 8px"}}>
                  <div className="input-field col s3 m2">
                    <input style={{color:"white"}} type="number" id="index" value={this.state.index} onChange={this.indexSearch}/>
                    <label htmlFor="index" className="active" style={{fontSize:"1.2rem"}}>{this.state.index}/{this.state.dataLength-1}</label>
                  </div>
                  <MSelect 
                    elems={this.state.items} 
                    selectedFiles={this.state.selectedFiles} 
                    changeFiles={this.changeFiles}
                  />
                  <div className="col s2 m1">
                    <i id="refreshBtn" 
                      style={{fontSize:"2rem"}}
                      className="material-icons white-text"
                      onClick={this.refreshData}
                      title="This will reload data, save keywords file first">cached
                    </i>
                  </div>
                </div>
                <Editor 
                  keywordsJson = {this.state.keywordsJson} 
                  editJson = {this.editJson} 
                  jsonUpdateRefresh={this.refreshData} 
                  clearKeywords={this.clearKeywords}
                />    
              </div>
            </nav>
            <div id="cardContent" className="row valign-wrapper" style={{width:"100%",marginTop:"2rem",padding:"0 24px"}}>
              <div className="col m2 hide-on-small-only"  style={{color:"white"}}>
                <button id="arrowDown" 
                  onClick={this.indexDown} 
                  disabled={(this.state.index===0||this.state.arrowDisabledLeft)?'disabled': null} 
                  className=" btn-floating btn-large waves-effect waves-light deep-orange">
                    <i style={{fontSize:"3rem",margin:"0"}} className="material-icons">keyboard_arrow_left</i>
                </button>
              </div>
              <div className="col m8 s12" style={{margin:"0"}}>
                <div className="card-content row" style={{textAlign:"left",margin:"0",paddingTop:".5rem"}}>
                  <h5 id="customScroll"  className="col s12" style={{height:"4.2rem",overflowY:"scroll",fontSize:"1.8rem"}}>{titleList}</h5>
                  <h6 id="customScroll" className="col s12" style={{height:"7.5rem",overflowY:"scroll",wordBrea:"break-word"}}>{description}</h6>
                </div>
                <div className="card-content" style={{textAlign:"left",paddingTop:"0",borderTop:"1px solid rgba(160,160,160,0.2)"}}>
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
                          searchData = {this.searchData}
                          clearSearch = {this.clearSearch}
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
              <div className="col m2 hide-on-small-only" style={{color:"white"}}>
                <button id="arrowUp" 
                  onClick={this.indexUp} 
                  disabled={this.state.index===this.state.dataLength-1||this.state.arrowDisabledRight?'disabled' : null} 
                  className="btn-floating btn-large waves-effect waves-light deep-orange">
                    <i style={{fontSize:"3rem",margin:"0"}} className=" material-icons">keyboard_arrow_right</i>
                </button>
              </div>
            </div>
          </div>    
          <FilePond ref={ref => this.pond = ref}
            labelIdle='Drag & Drop or <span class="filepond--label-action"> Browse </span>'
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
