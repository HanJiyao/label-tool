const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Papa = require('papaparse')
const fs = require('fs');


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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


app.use(express.static(path.join(__dirname, 'build')));

app.get("/dev", (req, res) =>
    res.sendFile(path.resolve(__dirname, "./public/index.html"))
);

app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname+'/build/index.html'));
});

app.get('/api/initData', (req,res) => {
    const topicJson = require('./data/topics_keywords_latest.json')
    const keywordsArr = [].concat.apply([],Object.values(topicJson).map((val)=>val.keywords))
    const fileName=['all_items_barclaysT2.csv']
    let options=[]
    let items=[]
    let ordered = {};
    let keywordsJson = {};
    Object.keys(topicJson).sort().forEach(function(key) {
        ordered[key] = topicJson[key];
    })
    for (var key in ordered) {
        if (ordered.hasOwnProperty(key)) {
            options.push({value: key, label: ordered[key].ui_text[0]});
            items.push({id:key[0], label:ordered[key].ui_text[0]})
            keywordsJson[key] = ordered[key].keywords
        }
    }
    items.unshift({id: "", label: "Cannot be determined"}) 
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
            data.push(results);
            if ((data.length === fileName.length)){
                const data = results.data
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
                fs.writeFile('./data/all_items_Merged.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)});
            } 
        }
    } 
    res.json({
        dataLength:displayedData.length,
        options:options,
        items:items,
        keywordsJson:keywordsJson
    });
});

app.get('/api/loadNewItem/:index', function(req, res) {
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
}); 

app.post('/api/updateItem', function(req, res) {
    let data = require('./data/all_items_Merged.json')
    const index = req.body.index
    data[index].Correct = req.body.correct
    data[index].TopicModified = req.body.topicModified
    fs.writeFile('./data/all_items_Merged.json', JSON.stringify(data) , 'utf-8',(err,result)=>{if(err) console.log(err)});
    res.json()
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
    queryKeyword = queryKeyword.map((item,i)=>{
        return item.word
    }).join(" ").toLowerCase()
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
        console.log(newKeyword in keywordsArr)
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
    console.log(filtered.length)
    let displayedData = data.filter(function(obj) {
        return !filtered.some(function(obj2) {
            return (obj.Title===obj2.Title&&obj.Description===obj2.Description);
        });
    })
    console.log(displayedData.length)
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
    if (displayedData.length===0){

    }else{
        fs.writeFile('./data/all_items_Merged.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)})
        fs.writeFile('./data/topics_keywords_latest.json', JSON.stringify(topicJson) , 'utf-8',(err,result)=>{if(err) console.log(err)})
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
app.get('/api/refreshData', function(req, res) {
    try{
        fs.unlinkSync('./data/all_items_Merged.json');
    } catch {}
    const topicJson = require('./data/topics_keywords_latest.json')
    const keywordsArr = [].concat.apply([],Object.values(topicJson).map((val)=>val.keywords))
    const fileName=['all_items_barclaysT2.csv']
    let options=[]
    let items=[]
    let ordered = {};
    let keywordsJson = {};
    Object.keys(topicJson).sort().forEach(function(key) {
        ordered[key] = topicJson[key];
    })
    for (var key in ordered) {
        if (ordered.hasOwnProperty(key)) {
            options.push({value: key, label: ordered[key].ui_text[0]});
            items.push({id:key[0], label:ordered[key].ui_text[0]})
            keywordsJson[key] = ordered[key].keywords
        }
    }
    items.unshift({id: "", label: "Cannot be determined"}) 
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
        data.push(results);
        if ((data.length === fileName.length)){
            const data = results.data
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
            fs.writeFileSync('./data/all_items_Merged.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)});
        } 
    }
    res.json({
        dataLength:displayedData.length,
        options:options,
        items:items,
        keywordsJson:keywordsJson
    });
})

const port = process.env.PORT || 3000;

app.listen(port);

console.log("Label App Listening at port: "+port)
