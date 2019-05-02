/* eslint-disable jsx-a11y/anchor-is-valid */
import  React, { Component } from 'react';
import axios from 'axios';
import load from './load.svg';
import 'materialize-css'
import 'materialize-css/dist/css/materialize.min.css';
import M from "materialize-css";
import './App.css';
import Table from './Table'
import Editor from './Editor'
import Select from 'react-select';

class App extends Component {
    constructor() {
        super();
        this.state = {
            load:true,
            data: [],
            keywordsJson:{},
            options:[],
            selectedOption:null,
            topic: '',
            topicValue: '',
        };
        this.editJson = this.editJson.bind(this);
        this.handleTopicChange = this.handleTopicChange.bind(this);
    }
    componentDidMount() {
        this.setState({load:false})
        axios.get('/api/initData/')
        .then(res=>{
            this.setState({
                load:true,
                data: res.data.data,
                keywordsJson: res.data.keywordsJson,
                options : res.data.options
            })
            M.FormSelect.init(document.querySelectorAll('select',{}))
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
                                        style={{paddingTop: "3.6px"}}>
                                        <i class="material-icons">contact_support</i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div class="nav-content white black-text">
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
                                <div class="input-field col s12 l6">
                                    <input id="keywords" type="text" class="validate" />
                                    <label for="keywords">New keywords</label>
                                </div>
                            </div>
                            <Editor 
                                keywordsJson = {this.state.keywordsJson} 
                                editJson = {this.editJson}
                            />    
                        </div>
                    </nav>
                    <div className="content-wrapper" style={{textAlign:'left', padding:'3rem'}}>
                        <Table data = {this.state.data}/>
                    </div>
                </div>
            </div>
        );
    }
}
export default App