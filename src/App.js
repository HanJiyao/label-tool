/* eslint-disable jsx-a11y/anchor-is-valid */
import  React, { Component } from 'react';
import axios from 'axios';
import load from './load.svg';
import gitImg from './git.png'
import 'materialize-css'
import 'materialize-css/dist/css/materialize.min.css';
import M from "materialize-css";
import './App.css';
import Table from './Table'
import Editor from './Editor'
import MSelect from './Select'

class App extends Component {
    constructor() {
        super();
        this.state = {
            load:true,
            data: [],
            keywordsJson:{},
            topic: '',
            keywords: '',
            checked:false,
            tenants:[
                {id:'CoastCapial',label:'CoastCapial'},
                {id:'SAPLearningHub',label:'SAPLearningHub'},
                {id:'Nedbank',label:'Nedbank'},
            ],
            selectedTenant:[],
            modified:false,
        };
        this.editJson = this.editJson.bind(this);
        this.handleTopicChange = this.handleTopicChange.bind(this);
        this.changeTenant = this.changeTenant.bind(this);
    }
    componentDidMount() {
        this.setState({load:false})
        axios.get('/api/initData/')
        .then(res=>{
            const keywordsJson = res.data.keywordsJson
            this.setState({
                load:true,
                data: res.data.data,
                keywordsJson: keywordsJson,
            })
            const options = {}
            for (var i in keywordsJson){
                options[i] = null
            }
            M.FormSelect.init(document.querySelectorAll('select', {}))
            M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {
                data:options
            });
        })
        .catch(err=>console.log(err))
    }
    editJson(result){
        this.setState({keywordsJson:result.updated_src})
    }
    handleTopicChange(selectedOption){
        this.setState({
          topic:selectedOption.label,
          topicValue:selectedOption.value,
          selectedOption:selectedOption
        })
    } 
    handleCreate = (inputValue) => {
        const createOption = (label) => ({
            label,
            value: label.toLowerCase().replace(/\W/g, ''),
        });
        const options = this.state.options;
        const newOption = createOption(inputValue);
        this.setState({
            options: [...options, newOption],
            selectedOption : newOption,
            topic: newOption.label,
            topicValue: newOption.value
        });
    }
    changeTenant(selectedTenant){
        this.setState({selectedTenant:selectedTenant})
    }
    render() {
        return (
            <div className="container">
                <div className="loading" style={this.state.load?{display:"none"}:null}>
                    <div style={{width:'100vw',height:'100vh',position:"fixed",top:'0',left:'0',zIndex:'99999',background:'rgba(0,0,0,0.3)'}} className="valign-wrapper center-align">
                        <img style={{margin:"auto"}} src={load} alt="Loading..." height="100" width="100"/>
                    </div>
                </div>
                <div  id="cardContent" className="card z-depth-4" style={{textAlign:"center",marginTop:"1.5rem",marginBottom:"3px"}} >
                    <nav class="nav-extended orange">
                        <div class="nav-wrapper orange">
                            <ul style={{position:"absolute",top:"0",right:"0"}}>
                                <li className="hide-on-med-and-up"><a className="modal-trigger" data-target="editorModal"><i className="material-icons" style={{paddingTop: "3.6px"}}>edit</i></a></li>
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
                        <div class="bak nav-content orange">
                            <div className="row tool-bar" style={{margin:"0",padding:"30px 50px 0 50px"}}>
                                <MSelect 
                                    elems={this.state.tenants} 
                                    selectedTenant={this.state.selectedTenant} 
                                    changeTenant={this.changeTenant}
                                />
                            </div>
                            <Editor 
                                keywordsJson = {this.state.keywordsJson} 
                                editJson = {this.editJson}
                            />    
                        </div>
                    </nav>
                    <div className="content-wrapper" style={{textAlign:'left'}}>
                        <Table style={{padding:'20px'}} data = {this.state.data}/>
                        <div style={{textAlign:"left",paddingTop:"0",borderTop:"1px solid rgba(160,160,160,0.2)",margin:"0"}}>
                            <div className="row" style={this.state.correct ? {display:'none'} : {padding:"1.5rem .5rem",margin:"0"}}>
                                <div class="input-field col s6 l3" style={{marginTop:'.2rem',marginBottom:'0'}}>
                                    <i class="material-icons prefix">keyboard_arrow_right</i>
                                    <input type="text" id="autocomplete-input" className="autocomplete" autocomplete="false"/>
                                    <label for="autocomplete-input">Topic</label>
                                </div>
                                <div class="input-field col s6 l3" style={{marginTop:'.2rem',marginBottom:'0'}}>
                                    <input id="keywords" type="text" />
                                    <label for="keywords">Keywords</label>
                                </div>
                                <div className="col s6 l2">
                                    <button id="queryBtn"
                                    style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.2rem",fontWeight:"600"}} 
                                    className='waves-effect waves-light btn-large orange'
                                    onClick={this.checkData}><i style={{fontWeight:"900",margin:"0"}} className="material-icons left">search</i>check
                                    </button>
                                </div>
                                <div className="col s6 l2">
                                    <button id="addBtn"
                                    style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.2rem",fontWeight:"600"}} 
                                    className='waves-effect waves-light btn-large orange' 
                                    disabled={!this.state.checked}
                                    onClick={this.addKeywords}><i style={{fontWeight:"900",margin:"0"}} className="material-icons left">add</i>add
                                    </button>
                                </div>
                                <div className="col s6 l2">
                                    <button id="trainBtn"
                                    style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.2rem",fontWeight:"600"}} 
                                    className='waves-effect waves-light btn-large orange'
                                    disabled={!this.state.modified}
                                    onClick={this.checkData}><i style={{fontWeight:"900",margin:"0"}} className="material-icons left">check</i>train
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default App