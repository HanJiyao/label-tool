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

app.get('/api/initData', (req,res) => {
    const files = fs.readdirSync('./data')
    let fileName = []
    let items = []
    files.forEach(function (file) {
        if(path.extname('./data'+file)===".csv"){
            fileName.push(file)
            items.push({id:file,label:file.substr(file.lastIndexOf('_')+1,file.lastIndexOf('.')-file.lastIndexOf('_')-1)})
        }
    })
    const topicJson = require('./data/topics_keywords_latest.json')
    const keywordsArr = [].concat.apply([],Object.values(topicJson).map((val)=>val.keywords))
    let options=[]
    let ordered = {};
    let keywordsJson = {};
    Object.keys(topicJson).sort().forEach(function(key) {
        ordered[key] = topicJson[key];
    })
    for (var key in ordered) {
        if (ordered.hasOwnProperty(key)) {
            options.push({value: key, label: ordered[key].ui_text[0]});
            keywordsJson[key] = ordered[key].keywords
        }
    }
    var data = []
    var displayedData = []
    try {
        require('./data/all_items_Merged.json')
        displayedData = require('./data/all_items_Merged.json')
    } catch {
        for (var i = 0; i < fileName.length; i++){
            var csvFilePath = fs.readFileSync("./data/"+fileName[i], "utf8"); 
            Papa.parse(csvFilePath, {
                header: true,
                skipEmptyLines: true,
                complete: initData
            })
        }
        function initData(results){
            data.push(results.data);
            if ((data.length === fileName.length)){
                data = [].concat.apply([], data)
                console.log("total items: ", data.length)
                let filtered = data.filter((val)=>{
                    let diff = []
                    keywordsArr.forEach((key)=>{
                        if(val.Title.toLowerCase().includes(key.toLowerCase()))
                        diff.push(val)
                    })
                    return diff[0]
                })
                displayedData = data.filter(function(obj) {
                    return !filtered.some(function(obj2) {
                        return (obj.Title===obj2.Title&&obj.Description===obj2.Description);
                    });
                })
                console.log("display items: ", displayedData.length)
                fs.writeFileSync('./data/all_items_Merged.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)});
            } 
        }
    } 
    res.json({
        dataLength:displayedData.length,
        options:options,
        items:items,
        keywordsJson:keywordsJson,
        file:fileName
    });
});

app.get('/api/loadNewItem/:index', function(req, res) {
    try{
        const data = require('./data/all_items_Merged.json')
        const index = req.params.index
        res.json({
            dataLength: data.length,
            title: data[index].Title,
            description: data[index].Description,
            topicPrev: data[index].Topic,
            topic: data[index].TopicModified===undefined?"":data[index].TopicModified,
            correct: data[index].Correct===0?false:(data[index].Correct===undefined?false:true)
        })
    }
    catch {
        res.json({
            dataLength: 0,
            title: "Error when loading new item",
            description: "Please refresh page",
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
    queryKeyword = queryKeyword.map(item=>{return item.word}).join(" ").toLowerCase().trim()
    let queryData = data.filter((item)=>{
        return (item.Title.toLowerCase().indexOf(queryKeyword)!==-1)
    })
    res.json({
        queryKeyword:queryKeyword,
        queryData:queryData
    })
}); 

app.post('/api/updateData', function(req, res) {
    const data = require('./data/all_items_Merged.json')
    let topicJson = require('./data/topics_keywords_latest.json')
    const index = req.body.index
    let keywordsJson = {}
    let keywordsArr = []
    const newKeyword = req.body.newKeyword
    if (newKeyword===""){
        keywordsArr = [].concat.apply([],Object.values(req.body.keywordsJson))
    }else{
        keywordsArr = [].concat.apply([],Object.values(topicJson).map((val)=>val.keywords))
        keywordsArr.push(newKeyword)
    }
    keywordsArr = keywordsArr.filter(function (el) {
        return el !== "";
    });
    let filtered = data.filter((val)=>{
        let diff = []
        keywordsArr.forEach((key)=>{
            if(val.Title.toLowerCase().includes(key.toLowerCase())){
                diff.push(val)
            }
        })
        return diff[0]
    })
    console.log("filtered items: ",filtered.length)
    let displayedData = data.filter(function(obj) {
        return !filtered.some(function(obj2) {
            return (obj.Title===obj2.Title&&obj.Description===obj2.Description);
        });
    })
    console.log("display items: ",displayedData.length)
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
    const files = fs.readdirSync('./data')
    let topicJson = require('./data/topics_keywords_latest.json')
    let keywordsJson = {}
    for (var x in topicJson) {
        if (topicJson.hasOwnProperty(x)) {
            keywordsJson[x] = topicJson[x].keywords
        }
    }
    let fileNameList = []
    let items = []
    files.forEach(function (file) {
        if(path.extname('./data'+file)===".csv"){
            fileNameList.push(file)
            items.push({id:file,label:file.substr(file.lastIndexOf('_')+1,file.lastIndexOf('.')-file.lastIndexOf('_')-1)})
        }
    })
    const fileName=req.body.selectedFiles
    if(fileName.length!==0){
        for(var k in topicJson){topicJson[k].keywords = req.body.keywordsJson[k]}
        const keywordsArr = [].concat.apply([],Object.values(topicJson).map((val)=>val.keywords))
        let options=[]
        let ordered = {};
        const index = req.body.index
        Object.keys(topicJson).sort().forEach(function(key) {
            ordered[key] = topicJson[key];
        })
        for (var key in ordered) {
            if (ordered.hasOwnProperty(key)) {
                options.push({value: key, label: ordered[key].ui_text[0]});
                keywordsJson[key] = ordered[key].keywords
            }
        }
        var data = []
        var displayedData = []
        for (var i = 0; i < fileName.length; i++){
            var csvFilePath = fs.readFileSync("./data/"+fileName[i], "utf8"); 
            Papa.parse(csvFilePath, {
                header: true,
                skipEmptyLines: true,
                complete: initData
            })
        }
        function initData(results){
            data.push(results.data);
            if ((data.length === fileName.length)){
                data = [].concat.apply([], data)
                console.log("total items: ", data.length)
                let filtered = data.filter((val)=>{
                    let diff = []
                    keywordsArr.forEach((key)=>{
                        if(val.Title.toLowerCase().includes(key.toLowerCase()))
                        diff.push(val)
                    })
                    return diff[0]
                })
                displayedData = data.filter(function(obj) {
                    return !filtered.some(function(obj2) {
                        return (obj.Title===obj2.Title&&obj.Description===obj2.Description);
                    });
                })
                console.log("display items: ", displayedData.length)
                fs.writeFileSync('./data/all_items_Merged.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)});
            } 
        }
        fs.writeFileSync('./data/topics_keywords_latest.json', JSON.stringify(topicJson) , 'utf-8',(err,result)=>{if(err) console.log(err)})
        res.json({
            items:items,
            updateDone:true,
            dataLength: displayedData.length,
            title: displayedData[index].Title,
            description: displayedData[index].Description,
            topicPrev: displayedData[index].Topic,
            topic: displayedData[index].TopicModified===undefined?"":displayedData[index].TopicModified,
            correct: displayedData[index].Correct===0?false:(displayedData[index].Correct===undefined?false:true),
            keywordsJson: keywordsJson
        });
    } else {
        res.json({
            items:items,
            updateDone:true,
            dataLength: 0,
            title: "No data loaded",
            description: "Please check the file selection  Σ(っ °Д °;)っ",
            topicPrev: "",
            topic: "",
            correct: false,
            keywordsJson: keywordsJson
        });
    }
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
