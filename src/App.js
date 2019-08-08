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
import MSelect from './Tenant'
import TypeSelect from './Type'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class App_bak extends Component {
    constructor() {
        super();
        this.state = {
            load:true,
            data: [],
            keywordsJson:{},
            checked:false,
            tenants:[],
            selectedTenant:[],
            type:[
                {id:'1 Algorithm', label:'1 Algorithm'},
                {id:'2 Subject Area', label:'2 Subject Area'},
                {id:'3 Undetermined', label:'3 Undetermined'},
                {id:'Undefined',label:'Undefined'},
            ],
            selectedType:[],
            reload:false,
            modified:false,
        };
        this.deleteJson = this.deleteJson.bind(this);
        this.editJson = this.editJson.bind(this);
        this.openAutocomplete = this.openAutocomplete.bind(this);
        this.changeTenant = this.changeTenant.bind(this);
        this.changeType = this.changeType.bind(this);
        this.reloadData = this.reloadData.bind(this);
        this.addKeywords = this.addKeywords.bind(this);
    }
    componentDidMount() {
        this.setState({load:false})
        const selectedTenant = localStorage.getItem("selectedTenant")
        const selectedType = localStorage.getItem("selectedType")
        axios.post('/api/initData/', {
            selectedTenant: selectedTenant,
            selectedType: selectedType
        })
        .then(res=>{
            const keywordsJson = res.data.keywordsJson
            this.setState({
                load:true,
                data: res.data.data,
                tenants: res.data.tenants,
                selectedTenant: res.data.selectedTenant,
                selectedType: res.data.selectedType,
                keywordsJson: keywordsJson,
            }, ()=>{
                let options = {}
                for (var i in this.state.keywordsJson){
                    options[this.state.keywordsJson[i].ui_text] = null
                }
                M.FormSelect.init(document.querySelectorAll('select', {}))
                M.Autocomplete.init(document.querySelectorAll('.autocomplete'), {data:options});
                M.Tooltip.init(document.querySelectorAll('.tooltipped'), options);
            })
        })
        .catch(err=>console.log(err))
    }
    deleteJson(result){
        let topic = ''
        let keywords = ''
        if (result.namespace[1]==='keywords'){
            topic = result.namespace[0]
            keywords = result.existing_value
        } else {
            topic = result.name
        }
        this.setState({keywordsJson:result.updated_src, load:false}, ()=>{
            axios.post('/api/delete',{
                topic: topic,
                keywords: keywords,
            })
            .then(res=>{this.setState({
                load:res.data.done
            })})
            .catch(err=>console.log(err))
        })
    }
    editJson(result){
        this.setState({keywordsJson:result.updated_src, load:false}, ()=>{
            axios.post('/api/edit',{
                index: result.name,
                existKeyword: result.existing_value,
                keyword: result.new_value,
                topic: result.namespace[0],
                field: result.namespace[1],
            })
            .then(res=>{this.setState({
                load:res.data.done
            })})
            .catch(err=>console.log(err))
        })
    }
    openAutocomplete(){
        console.log(M.Autocomplete.getInstance(document.querySelectorAll('.autocomplete')))
    }
    changeTenant(selectedTenant){
        localStorage.setItem('selectedTenant', selectedTenant)
        this.setState({selectedTenant:selectedTenant, reload:true})
    }
    changeType(selectedType){
        localStorage.setItem('selectedType', selectedType)
        this.setState({selectedType: selectedType, reload:true})
    }
    reloadData(e){
        if (e!==undefined){
            e.preventDefault();
        }
        this.setState({load:false})
        const topic = document.getElementById('topic').value.trim()
        const keywords = document.getElementById('keywords').value.trim()
        axios.post('/api/reloadData',{
            selectedTenant:this.state.selectedTenant,
            selectedType:this.state.selectedType,
            checkData: keywords
        })
        .then(res=>{
            this.setState({
                data:res.data.data, 
                load:true, 
                reload:false,
                checked:(topic!==''&&keywords!=='')
            })
        })
        .catch(err=>console.log(err))
    }
    addKeywords(){
        this.setState({load:false})
        let keywordsJson = this.state.keywordsJson
        let topicArr = []
        for (var i in keywordsJson) { topicArr.push(keywordsJson[i].ui_text) }
        const topic = document.getElementById('topic').value.trim()
        const keywords = document.getElementById('keywords').value.trim()
        if(topicArr.includes(topic)){
            axios.post('/api/addKeywords',{
                topic: topic,
                keywords: keywords,
            })
            .then(res=>{this.setState({
                keywordsJson: res.data.keywordsJson
            }, ()=>{
                document.getElementById('topic').value = ''
                document.getElementById('keywords').value = ''
                this.reloadData()
            })})
            .catch(err=>console.log(err))
        } else {
            axios.post('/api/addTopic',{
                topic: topic,
                keywords: keywords,
            })
            .then(res=>{this.setState({
                keywordsJson: res.data.keywordsJson
            }, ()=>{
                document.getElementById('topic').value = ''
                document.getElementById('keywords').value = ''
                this.reloadData()
            })})
            .catch(err=>console.log(err))
        }
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
                                <li><Link to="/item"><i class="material-icons" style={{paddingTop: "3.6px"}}>rate_review</i></Link></li>
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
                            <div className="row tool-bar" style={{margin:"0",padding:"30px 50px 0"}}>
                                <TypeSelect 
                                    elems={this.state.type} 
                                    selectedType={this.state.selectedType} 
                                    changeType={this.changeType}
                                />
                                <MSelect 
                                    elems={this.state.tenants} 
                                    selectedTenant={this.state.selectedTenant} 
                                    changeTenant={this.changeTenant}
                                    updateTenants={this.updateTenants}
                                />
                                <button className="col s1 m1 btn-flat" style={{color:'white',height:'100%'}} disabled={!this.state.reload}>
                                    <i id="refreshBtn" 
                                        style={{fontSize:"2rem"}}
                                        className="material-icons tooltipped"
                                        onClick={this.reloadData}
                                        data-position="top" data-tooltip="Reload entire data"
                                    >done</i>
                                </button>
                            </div>
                            <Editor 
                                keywordsJson = {this.state.keywordsJson} 
                                deleteJson = {this.deleteJson}
                                editJson = {this.editJson}
                            />    
                        </div>
                    </nav>
                    <div className="content-wrapper new" style={{textAlign:'left'}}>
                        <Table 
                            style = {{padding:'20px'}} 
                            data = {this.state.data} 
                        />
                        <div style={{textAlign:"left",paddingTop:"0",margin:"0"}}>
                            <form className="row" style={{padding:"1.5rem .5rem",margin:"0"}}
                                onSubmit={this.reloadData}>
                                <div class="input-field col s6 l3" style={{marginTop:'.2rem',marginBottom:'0'}}>
                                    <i class="material-icons prefix" 
                                        onClick={this.openAutocomplete}>keyboard_arrow_right</i>
                                    <input type="text" id="topic" className="autocomplete" autocomplete="off" />
                                    <label for="topic">Topic</label>
                                </div>
                                <div class="input-field col s6 l3" style={{marginTop:'.2rem',marginBottom:'0'}}>
                                    <input id="keywords" type="text" />
                                    <label for="keywords">Keywords</label>
                                </div>
                                <div className="col s4 l2">
                                    <button id="queryBtn"
                                        type='submit'
                                        style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.2rem",fontWeight:"600",padding:'0 15px'}} 
                                        className='waves-effect waves-light btn-large orange'>
                                        <i style={{fontWeight:"900",margin:"0"}} className="material-icons left">search</i>check
                                    </button>
                                </div>
                                <div className="col s4 l2">
                                    <button id="addBtn"
                                        style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.2rem",fontWeight:"600",padding:'0 15px'}} 
                                        type="button"
                                        className='waves-effect waves-light btn-large orange' 
                                        disabled={!this.state.checked}
                                        onClick={this.addKeywords}><i style={{fontWeight:"900",margin:"0"}} className="material-icons left">add</i>add
                                    </button>
                                </div>
                                <div className="col s4 l2">
                                    <button id="trainBtn"
                                        style={{width:"100%",borderRadius:'100px',zIndex:"0",fontSize:"1.2rem",fontWeight:"600",padding:'0 15px'}} 
                                        type="button"
                                        className='waves-effect waves-light btn-large orange'
                                        disabled={!this.state.modified}
                                        onClick={this.trainData}><i style={{fontWeight:"900",margin:"0"}} className="material-icons left">check</i>train
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default App_bak