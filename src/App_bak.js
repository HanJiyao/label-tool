/* eslint-disable jsx-a11y/anchor-is-valid */
import  React, { Component } from 'react';
import load from './load.svg';
import gitImg from './git.png'
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
import SwipeableViews from 'react-swipeable-views'
import virtualize from 'react-swipeable-views-utils/lib/virtualize'
import { Scrollbars } from 'react-custom-scrollbars';
import { Swipeable } from 'react-swipeable'
registerPlugin();

const EnhancedSwipeableViews = virtualize(SwipeableViews)
const XRegExp = require('xregexp');

class AppItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allFiles:[],
      selectedFiles:null,
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
      swipeIndex:0,
      animation:true,
      characterSpace:' '
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
    this.filterData = this.filterData.bind(this);
    this.editJson = this.editJson.bind(this);
    this.refreshData = this.refreshData.bind(this);
    this.clearKeywords = this.clearKeywords.bind(this);
    this.changeFiles = this.changeFiles.bind(this);
    this.searchData = this.searchData.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.deleteFile = this.deleteFile.bind(this);
    this.handleKewordChange = this.handleKewordChange.bind(this);
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
  handleKewordChange(word){
    var titleTextList
    if(this.state.characterSpace===' ')
    titleTextList = this.state.title.split(/\W+/);
    else titleTextList = this.state.title.split('');
    let i = titleTextList.indexOf(word)
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
        arrowDisabledRight:false,
        characterSpace:res.data.characterSpace
      })
    })
    .catch(err=>console.log(err))
  }
  handleChangeIndex = (index, indexLatest) => {
    if(indexLatest>index) this.indexDown()
    else this.indexUp()
    this.setState({swipeIndex: index})
  };
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
        this.setState({index: this.state.index+1,swipeIndex: this.state.swipeIndex+1},()=>this.loadNewItem())
      } else {
        axios.post('/api/updateItem',{
          index:this.state.index,
          correct:this.state.correct===true?1:0,
          topicModified:this.state.topic
        }).then((res)=>{
          if(res.data.updateDone){
            this.setState({index: this.state.index+1,swipeIndex: this.state.swipeIndex+1},()=>this.loadNewItem())
          }
        })
        .catch(err=>console.log(err))
      }
    }
  }
  indexDown(){
    if(this.state.index>0){
      this.setState({arrowDisabledLeft:true})
      if(!this.state.dataModified){
        this.setState({index: this.state.index-1,swipeIndex: this.state.swipeIndex-1},()=>this.loadNewItem())
      } else {
        axios.post('/api/updateItem',{
          index:this.state.index,
          correct:this.state.correct===true?1:0,
          topicModified:this.state.topic
        }).then((res)=>{
          if(res.data.updateDone){
            this.setState({index: this.state.index-1,swipeIndex: this.state.swipeIndex-1},()=>this.loadNewItem())
          }
        })
        .catch(err=>console.log(err))
      }
    }
  }
  searchData(index){
    this.setState({ index: index, keyword: [], keywordSearch: '', checkDisabled: true},()=>this.loadNewItem())
  }
  clearSearch(){
    this.setState({ keyword: [], keywordSearch: '', checkDisabled: true }, () => this.loadNewItem())
  }
  filterData(){
    axios.post('/api/filterData',{
      keywords:this.state.keyword,
      characterSpace:this.state.characterSpace
    })
    .then(res=>{
      this.setState({
        newKeyword:res.data.queryKeyword, 
        queryData:res.data.queryData})
    })
    .catch(err=>console.log(err))
  }
  jsonUpdate(){
    this.setState({
      updateDone:false,
      topicPrev:'',
      title:'Loading • • • ',
      description:'Please be patient'
    })
    axios.post('/api/updateData',{
      index:this.state.index,
      topic:this.state.topicValue,
      newKeyword:this.state.newKeyword,
      keywordsJson:this.state.keywordsJson,
      queryData:this.state.queryData,
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
  refreshData(initFile=false,addFile=false,forceUpdate=false){
    this.clearKeywords()
    this.setState({
      updateDone:false,
      topicPrev:'',
      title:'Loading • • • ',
      description:'Please be patient'
    })
    axios.post('/api/refreshData',{
      index:this.state.index,
      selectedFiles:this.state.selectedFiles,
      keywordsJson:this.state.keywordsJson,
      initFile:initFile,
      addFile:addFile,
      forceUpdate: forceUpdate
    }).then(res=>{
      let topic = res.data.topic
      let options = res.data.options
      this.setState({
        selectedFiles: res.data.selectedFiles,
        items:res.data.items,
        options: options,
        title:res.data.title,
        description:res.data.description,
        dataLength:res.data.dataLength,
        topicPrev:res.data.topicPrev,
        topic:topic,
        selectedOption:(topic==="")?null:options.find((element)=>element.label===topic),
        topicValue:(topic==="")?null:options.find((element)=>element.label===topic).value,
        correct:res.data.correct,
        keyword:[],
        keywordSearch:'',
        checkDisabled:true,
        keywordsJson:res.data.keywordsJson,
        files:null,
        updateDone:res.data.updateDone,
        dataModified:false
      })
      M.FormSelect.init(document.querySelectorAll('select',{}))
    })
    .catch(err=>console.log(err))
  }
  deleteFile(deleteFiles){
    let forceUpdate = false
    let selectedFiles = this.state.selectedFiles
    for (var i in deleteFiles){
      if(deleteFiles[i].status){
        var index = selectedFiles.indexOf(deleteFiles[i].file); 
        if (index > -1) {
            selectedFiles.splice(index, 1);
            forceUpdate=true
        }
      }
    }
    this.setState({selectedFiles:selectedFiles},()=>{
      console.log('update selected:',selectedFiles)
      console.log("delete files:",deleteFiles)
      axios.post('/api/deleteFile',{
        deleteFiles: deleteFiles,
        selectedFiles: selectedFiles,
      }).then(res=>{if(res.data.deleteDone) this.refreshData(true,false,forceUpdate)})
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
        case 70: document.getElementById("search").focus();break;
        case 13: this.selectRef.focus();break;
        default: break;
      }
    }
  }
  componentDidMount() {
    this.refreshData(true)
    document.addEventListener('FilePond:processfile', e => {
      if (e.detail.error) {
          console.log('Upload Failed');
          return;
      } else {
        console.log("upload :", this.state.files[0].name)
        switch (this.state.files[0].name){
          case "all_items_Merged.json": this.refreshData(true);break;
          case "topics_keywords_latest.json": this.refreshData(false, false, true);break;
          default: 
            if (this.state.selectedFiles===undefined)
            this.setState({ selectedFiles:this.state.files[0].name},()=>this.refreshData(false,true))
            else 
            this.setState({
              selectedFiles: [...this.state.selectedFiles, this.state.files[0].name]
            }, () => this.refreshData(false, true))
            break;
        }
      }
    })
    document.addEventListener("keydown", this.keyFunction, false);
  }
  componentWillUnmount(){
    document.removeEventListener("keydown", this.keyFunction, false);
  }  
  render() {
      var titleHTML = this.state.title
      if (this.state.characterSpace===''){
        titleHTML = titleHTML.split('')
      }else{
        titleHTML = titleHTML.split(/\W+/);
      }
      let symbol = this.state.title.split(/\w+/);
      titleHTML = titleHTML.map((word,i)=>
        <><span
        key={i} onClick={()=>{
          this.handleKewordChange(word)}}
          className={(this.state.keyword.find(element=>element.word===word)!==undefined)?
          "selectTitle orange-text text-darken-4 active waves-effect waves-orange waves-ripple"
          :"selectTitle waves-effect waves-orange waves-ripple"}
        >{word}</span>{symbol[i+1]}{this.state.characterSpace}</>
      )
      let slideRenderer = ({ key, index }) => (
        <div key={index}>
            <div className="card-content row" style={{textAlign:"left",margin:"0",paddingTop:".5rem"}}>
                <h6 style={{marginTop:'0.8rem',padding:"0 .75rem"}}>
                  <strong style={(this.state.topicPrev.replace(/[["\]]/g, '')===""||this.state.topicPrev.replace(/[["\]]/g, '')==="Cannot be determined")?{color:"red"}:null}>
                  {this.state.topicPrev.replace(/[["\]]/g, '')===""?"Cannot be determined":this.state.topicPrev.replace(/[["\]]/g, '')}</strong>
                </h6>
                <Scrollbars autoHide className="customScroll" style={{height: 80, margin:"1rem 0 .5rem", padding:"0 .75rem",overflowX:"hidden",overflowY:"scroll"}}>
                    <p style={{fontSize:"1.8rem",padding:"0 .75rem"}}>{titleHTML}</p>
                </Scrollbars>
                <Scrollbars autoHide className="customScroll" style={{height: 87, margin:".1rem 0", padding:"0 .75rem",overflowX:"hidden",overflowY:"scroll"}}>
                    <p style={{wordBrea:"break-word",padding:"0 .75rem"}}>{this.state.description}</p>
                </Scrollbars>
            </div>
        </div>
      )
      return (
        <>
        <div className="container bak">
          <div className="loading" style={this.state.updateDone?{display:"none"}:null}>
            <div style={{width:'100vw',height:'100vh',position:"fixed",top:'0',left:'0',zIndex:'99999',background:'rgba(0,0,0,0.3)'}} className="valign-wrapper center-align">
              <img style={{margin:"auto"}} src={load} alt="Loading..." height="100" width="100"/>
            </div>
          </div>
          <div  id="cardContent" className="card z-depth-4" style={{textAlign:"center",marginTop:"1.5rem",marginBottom:"3px"}} >
            <nav class="nav-extended orange">
              <div class="nav-wrapper orange">
                <form style={{height:"64px"}} onSubmit={(e)=>{
                    e.preventDefault()
                    var search = this.state.keywordSearch
                    if (XRegExp('[\\p{Han}]').test(search) || XRegExp('[\\p{Hiragana}]').test(search) || XRegExp('[\\p{Katakana}]').test(search) || XRegExp('[\\p{Hangul}]').test(search))
                    {search = search.split('');this.setState({characterSpace:''})}
                    else
                    { search = search.split(/\W+/); this.setState({ characterSpace: ' ' })}
                    const searchList = search.map((word, i)=>{
                      return {key:i, word:word}
                    })
                    console.log('search on :',searchList)
                    this.setState({checkDisabled:false,keyword:searchList},()=>document.getElementById("checkBtn").click())
                }}>
                  <div class="input-field orange">
                    <input autocomplete="off" required id="search" type="search" value={this.state.keywordSearch} 
                      onChange={(e)=>this.setState({keywordSearch:e.target.value})} 
                    />
                    <label class="label-icon" for="search"><i class="material-icons" style={{lineHeight:"64px"}}>search</i></label>
                  </div>
                </form>
                <ul style={{position:"absolute",top:"0",right:"0"}}>
                  <li className="hide-on-med-and-up"><a className="modal-trigger" data-target="editorModal"><i className="material-icons" style={{paddingTop: "3.6px"}}>edit</i></a></li>
                  <li><FileMgr items = {this.state.items} selectedFiles = {this.state.selectedFiles} deleteFile = {this.deleteFile} /></li>
                  <li>
                      {(this.state.animation)?<a style={{paddingTop: "3.6px"}} onClick={()=>this.setState({animation:false})}><i class="material-icons">cancel_presentation</i></a>
                      :<a style={{paddingTop: "3.6px"}} onClick={()=>this.setState({animation:true})}><i class="material-icons">input</i></a>}
                  </li>
                  <li><a href="/api/download" download><i class="material-icons" style={{paddingTop: "3.6px"}}>get_app</i></a></li>
                  <li>
                    <a  href="https://github.wdf.sap.corp/ML-Leonardo/ML-SFSF-LearningRecommendations/tree/master/research/topics/lr_topics_tool" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{paddingTop: "6px"}}>
                        <img style={{margin:"auto"}} src={gitImg} alt="Git" height="20" width="20"/>
                    </a>
                  </li>                
                </ul>
              </div>
              <div class="nav-content">
                <div className="row tool-bar" style={{margin:"0",padding:"30px 50px 0 50px"}}>
                  <div className="col m2 hide-on-small-only"></div>
                  <div className="input-field col s3 m2">
                    <input style={{color:"white"}} type="number" id="index" 
                      value={this.state.index} 
                      onChange={(e)=>{this.indexSearch(e)}}/>
                    <label htmlFor="index" className="active" style={{fontSize:"1.2rem"}}>{this.state.index}/{this.state.dataLength-1}</label>
                  </div>
                  <MSelect 
                    elems={this.state.items} 
                    selectedFiles={this.state.selectedFiles} 
                    changeFiles={this.changeFiles}
                    refreshData = {()=>this.refreshData(false, false, true)}
                  />
                </div>
                <Editor 
                  keywordsJson = {this.state.keywordsJson} 
                  editJson = {this.editJson} 
                  jsonUpdateRefresh={()=>this.refreshData(false, false, true)} 
                  clearKeywords={this.clearKeywords}
                />    
              </div>
            </nav>
            <div className="valign-wrapper content-wrapper">
              <div style={{width:"100%"}}>
                <div className="row valign-wrapper" style={{width:"100%",marginTop:"1rem",paddingBottom:".5rem", marginBottom:".3rem"}}>
                  <div className="col m2 hide-on-small-only"  style={{color:"white"}}>
                      <button id="arrowDown" 
                          onClick={this.indexDown}
                          disabled={(this.state.index===0||this.state.arrowDisabledLeft)?'disabled': null} 
                          className="btn-floating btn-flat btn-large waves-effect white">
                          <i style={{fontSize:"3rem",margin:"0",color:"#bdbdbd"}} className="material-icons">keyboard_arrow_left</i>
                      </button>
                  </div>
                  <div className="col m8 s12" style={{margin:"0"}}>
                      {(this.state.animation)?
                      <EnhancedSwipeableViews
                          index={this.state.swipeIndex}
                          onChangeIndex={this.handleChangeIndex}
                          slideRenderer={slideRenderer}
                          enableMouseEvents={true}
                      />
                    :<Swipeable onSwipedLeft={this.indexUp} onSwipedRight={this.indexDown}>
                        {slideRenderer(this.state.index)}
                    </Swipeable>}
                  </div>
                  <div className="col m2 hide-on-small-only" style={{color:"white"}}>
                      <button id="arrowUp" 
                          onClick={this.indexUp}
                          disabled={this.state.index===this.state.dataLength-1||this.state.arrowDisabledRight?'disabled' : null} 
                          className="btn-floating btn-flat btn-large waves-effect white">
                          <i style={{fontSize:"3rem",margin:"0",color:"#bdbdbd"}} className="material-icons">keyboard_arrow_right</i>
                      </button>
                  </div>
                </div>
                <div className="card-content row" style={{textAlign:"left",paddingTop:"0",paddingBottom:"36px",borderTop:"1px solid rgba(160,160,160,0.2)",margin:"0"}}>
                  <div className="col s2 hide-on-small"></div>
                  <div className="col s12 m8">
                  {(this.state.correct)?
                    <div className="row currentTopic valign-wrapper" style={{paddingTop:"2rem",margin:"0",height:"85px"}}>
                      <h5 className="col s12 center-align" style={(this.state.topicPrev.replace(/[["\]]/g, '')===""||this.state.topicPrev.replace(/[["\]]/g, '')==="Cannot be determined")?{color:"red"}:null}>
                        <strong >{this.state.topicPrev.replace(/[["\]]/g, '')===""?"Cannot be determined":this.state.topicPrev.replace(/[["\]]/g, '')}</strong>
                      </h5>
                    </div>
                    :
                    <div className="row" style={this.state.correct ? {display:'none'} : {paddingTop:"2rem",margin:"0",height:"85px"}}>
                      <div className="col s12 l6">
                        <Select 
                          placeholder="Select Topic . . ."
                          classNamePrefix="react-select"
                          ref={ref => { this.selectRef = ref; }}
                          blurInputOnSelect
                          value={this.state.selectedOption}
                          options={this.state.options} 
                          onChange={this.handleTopicChange}
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
                    </div>}
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
                  <div className="col s2 hide-on-small"></div>
                </div>
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
        </>
      );
  }
}
export default process.env.NODE_ENV === "development" ? hot(module)(AppItem) : AppItem
