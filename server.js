/* eslint-disable no-sequences */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Papa = require('papaparse')
const fs = require('fs');
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const cors = require('cors')
const JSZip = require("jszip");
const XRegExp = require('xregexp');
let zip = new JSZip();

const app = express();
// const webpack = require("webpack");
// const webpackConfig = require("./webpack.config");
// //const compiler = webpack(webpackConfig);
// app.use(express.static("public"));
// app.use(
//     require("webpack-dev-middleware")(compiler, {
//         noInfo: true,
//         publicPath: webpackConfig.output.publicPath,
//     })
// );
// app.use(require("webpack-hot-middleware")(compiler));
app.use(logger('dev'))
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cookieParser())
app.use(fileUpload())

app.use(express.static(path.join(__dirname, 'build')));

app.get("/dev", (req, res) =>
    res.sendFile(path.resolve(__dirname, "./public/index.html"))
);

app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname+'/build/index.html'));
});

app.get('/api/loadNewItem/:index', function(req, res) {
    try{
        const data = require('./data/all_items_Merged.json')
        const index = req.params.index
        const title = data[index].Title
        res.json({
            dataLength: data.length,
            title: title,
            description: data[index].Description,
            topicPrev: data[index].Topic,
            topic: data[index].TopicModified===undefined?"":data[index].TopicModified,
            correct: data[index].Correct===0?false:(data[index].Correct===undefined?false:true),
            characterSpace: (XRegExp('[\\p{Han}]').test(title) || XRegExp('[\\p{Hiragana}]').test(title) || XRegExp('[\\p{Katakana}]').test(title) || XRegExp('[\\p{Hangul}]').test(title)?'':' ')
        })
    }
    catch (e) {
        console.log(e)
        res.json({
            dataLength: 0,
            title: "No data loaded",
            description: "Please check the file selection / upload below  Σ(っ °Д °;)っ",
            topicPrev: "",
            topic: "",
            correct: false
        })
    }
}); 

app.post('/api/updateItem', function(req, res) {
    const index = req.body.index
    let data = require('./data/all_items_Merged.json')
    data[index].Correct = req.body.correct
    data[index].TopicModified = req.body.topicModified
    fs.writeFileSync('./data/all_items_Merged.json', JSON.stringify(data) , 'utf-8',(err,result)=>{if(err) console.log(err)});
    console.log("updated item "+index)
    res.json({updateDone:true})
}); 

app.post('/api/filterData', function(req, res) {
    const data = require('./data/all_items_Merged.json')
    let queryKeyword = req.body.keywords.sort((a,b)=>{
        if (parseInt(b.key) > parseInt(a.key))
            return -1;
        if (parseInt(b.key) < parseInt(a.key))
            return 1;
        return 0;
    })
    queryKeyword = queryKeyword.map(item => item.word).join(req.body.characterSpace).toLowerCase().trim()
    console.log(queryKeyword)
    let queryData = data.filter((item)=>{
        let title = item.Title.toLowerCase()
        var titleText
        if (req.body.characterSpace===' ')
        titleText = title.replace(/[\W_]+/g, " ");
        else titleText = title;
        return (titleText.indexOf(queryKeyword)!==-1)
    })
    let indexArr = queryData.map(item=>{
        return data.indexOf(item)
    })
    for (var i in queryData){
        queryData[i].index = indexArr[i]
    }
    res.json({
        queryKeyword:queryKeyword,
        queryData:queryData
    })
}); 

app.post('/api/updateData', function(req, res) {
    const data = require('./data/all_items_Merged.json')
    let topicJson = require('./data/topics_keywords_latest.json')
    const index = req.body.index
    const newKeyword = req.body.newKeyword
    let filtered = req.body.queryData
    console.log("filtered items: ",filtered.length)
    let displayedData = data.filter(obj=>!filtered.some(obj2=>obj.Title===obj2.Title))
    console.log("display items: ",displayedData.length)
    let keywordsJson = {}
    if(!(req.body.topic===null)){
        topicJson[req.body.topic].keywords.push(newKeyword)
    } else {
        for(var key in topicJson){
            topicJson[key].keywords = req.body.keywordsJson[key]
        }
    }
    for(var i in topicJson){
        keywordsJson[i] = topicJson[i].keywords
    }
    if (displayedData.length!==0){
        fs.writeFileSync('./data/topics_keywords_latest.json', JSON.stringify(topicJson) , 'utf-8',(err,result)=>{if(err) console.log(err)})
        fs.writeFileSync('./data/all_items_Merged.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)})
    }
    keywordsJson = Object.keys(keywordsJson).sort().reduce((a, c) => (a[c] = keywordsJson[c], a), {})
    res.json({
        updateDone:true,
        dataLength: displayedData.length,
        title: displayedData[index].Title,
        description: displayedData[index].Description,
        topicPrev: displayedData[index].Topic,
        topic: displayedData[index].TopicModified===undefined?"":displayedData[index].TopicModified,
        correct: displayedData[index].Correct===0?false:(displayedData[index].Correct===undefined?false:true),
        keywordsJson: keywordsJson
    })
}); 

app.post('/api/refreshData', function(req, res) {
    var data = []
    var displayedData = []
    const files = fs.readdirSync('./data')
    let fileName = []
    var topicJson
    var items = []
    var keywordsJson = {}
    var existFile=false
    try{
        topicJson = require('./data/topics_keywords_latest.json')
        if(req.body.initFile){
            try {
                displayedData = require('./data/all_items_Merged.json')
                existFile = true
            }
            catch { existFile = false }
        }
        for (var x in topicJson) {
            if (topicJson.hasOwnProperty(x)) {
                keywordsJson[x] = topicJson[x].keywords
            }
        }
        files.forEach(function (file) {
            if(path.extname('./data'+file)===".csv"){
                fileName.push(file)
                items.push({id:file,label:file.substr(file.lastIndexOf('_')+1,file.lastIndexOf('.')-file.lastIndexOf('_')-1)})
            }
        })
        var selectedFiles=req.body.selectedFiles
        var existSelectedFiles = []
        try{
            existSelectedFiles=require("./data/selected_files.json")
            if (req.body.initFile && selectedFiles===null) {
                selectedFiles = existSelectedFiles
                if (existSelectedFiles.length === 0) selectedFiles = fileName
            }
        } catch {
            selectedFiles = fileName
            existFile = false
        }
        let options=[]
        let ordered = {};
        Object.keys(topicJson).sort(Intl.Collator().compare).forEach(function(key) {
            ordered[key] = topicJson[key];
        })
        for (var key in ordered) {
            if (ordered.hasOwnProperty(key)) {
                options.push({value: key, label: ordered[key].ui_text[0]});
                keywordsJson[key] = ordered[key].keywords
            }
        }
        if (Object.keys(req.body.keywordsJson).length!==0){
            console.log("hey")
            for(var k in topicJson){
                topicJson[k].keywords = req.body.keywordsJson[k]
                keywordsJson[k] = req.body.keywordsJson[k]
            }
        }
        keywordsJson = Object.keys(keywordsJson).sort().reduce((a, c) => (a[c] = keywordsJson[c], a), {})
        const keywordsArr = [].concat.apply([],Object.values(topicJson).map((val)=>val.keywords))
        const index = req.body.index
        if ((selectedFiles.length !== 0 && !existFile) || req.body.addFile || req.body.forceUpdate){
            for (var i = 0; i < selectedFiles.length; i++) {
                var csvFilePath = fs.readFileSync("./data/"+selectedFiles[i], "utf8"); 
                Papa.parse(csvFilePath, {
                    header: true,
                    skipEmptyLines: true,
                    complete: initData
                })
            }
            function initData(results){
                data.push(results.data);
                if ((data.length === selectedFiles.length)){
                    data = [].concat.apply([], data)
                    console.log("total items:", data.length)
                    let filtered = []
                    keywordsArr.map(key=>
                        filtered.push(
                            data.filter(
                                item=>{
                                    if(item.Title!==undefined){
                                        let titleText = item.Title.toLowerCase().replace(/[\W_]+/g," ")
                                        return titleText.indexOf(key.toLowerCase())>-1
                                    } else {
                                        return undefined
                                    }
                                }
                                    
                            )
                        )
                    )
                    filtered = [].concat.apply([], filtered);
                    displayedData = data.filter(obj=>!filtered.some(obj2=>obj.Title===obj2.Title))
                    console.log("display items: ", displayedData.length)
                    fs.writeFileSync('./data/all_items_Merged.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)});
                } 
            }
            fs.writeFileSync('./data/topics_keywords_latest.json', JSON.stringify(topicJson) , 'utf-8',(err,result)=>{if(err) console.log(err)})
            fs.writeFileSync('./data/selected_files.json', JSON.stringify(selectedFiles) , 'utf-8',(err,result)=>{if(err) console.log(err)})
        } 
        else {
            if(!existFile)
            throw Error
        }
        res.json({
            items:items,
            options:options,
            updateDone:true,
            dataLength: displayedData.length,
            title: displayedData[index].Title,
            description: displayedData[index].Description,
            topicPrev: displayedData[index].Topic,
            topic: displayedData[index].TopicModified===undefined?"":displayedData[index].TopicModified,
            correct: displayedData[index].Correct===0?false:(displayedData[index].Correct===undefined?false:true),
            keywordsJson: keywordsJson,
            selectedFiles: selectedFiles
        });
    }catch{
        res.json({
            items: items,
            updateDone: true,
            dataLength: 0,
            title: "No data loaded",
            description: "Please check the file selection / upload below  Σ(っ °Д °;)っ",
            topicPrev: "",
            topic: "",
            correct: false,
            keywordsJson: keywordsJson
        });
    }
})

app.post('/api/deleteFile', (req, res) => {
    for (var i in req.body.deleteFiles){
        if (req.body.deleteFiles[i].status) {
            fs.unlinkSync('./data/' + req.body.deleteFiles[i].file)
        }
    }
    if (req.body.selectedFiles.length===0) {
        fs.unlinkSync('./data/all_items_Merged.json')
    }
    res.json({ deleteDone: true }) 
})

app.post('/api/upload', (req, res) => {
    let uploadFile = req.files.file
    const fileName = req.files.file.name
    uploadFile.mv(
      `${__dirname}/data/${fileName}`,
      function (err) {
        if (err) {
          return res.status(500).send(err)
        }
        res.json({
            uploaded: true,
        })
      }
    )
})

app.get('/api/download', (req, res) => {
    const keywords = require("./data/topics_keywords_latest.json")
    const data = require("./data/all_items_Merged.json")
    zip.file("topics_keywords_latest.json", JSON.stringify(keywords, null, 4));
    zip.file("all_items_Merged.json",JSON.stringify(data, null, 4));
    zip
    .generateNodeStream({type:'nodebuffer',streamFiles:true})
    .pipe(fs.createWriteStream('./data/out.zip'))
    .on('finish', function () {
        res.download('./data/out.zip')
    });
})

const port = process.env.PORT || 2233;
const host = process.env.HOST || '0.0.0.0'

app.listen(port);

console.log("Label App Running at: "+host+":"+port)
