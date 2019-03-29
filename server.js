const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Papa = require('papaparse')
const fs = require('fs');


const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname+'/build/index.html'));
});

app.get('/api/initData', (req,res) => {
    const topicJson = require('./data/topics_keywords_latest.json')
    const fileName=['all_items_barclaysT2.csv']
    var options=[]
    var items=[]
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
        if (data.length === fileName.length){
            const data = results.data
            const ordered = {};
            Object.keys(topicJson).sort().forEach(function(key) {
            ordered[key] = topicJson[key];
            })
            for (var key in ordered) {
                if (ordered.hasOwnProperty(key)) {
                    options.push({value: ordered[key].ui_text, label: ordered[key].ui_text});
                    items.push({id:ordered[key].ui_text[0],label:ordered[key].ui_text[0]})
                }
            }
            items.unshift({id: "Cannot be determined", label: "Cannot be determined"}) 
            var keywordsArr = [].concat.apply([],Object.values(topicJson).map((val)=>val.keywords))
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
            fs.writeFile('./data/database.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)});
        }
    }
    res.json({
        data:displayedData,
        options:options,
        items:items,
        keywordsJson:topicJson
    });
});

app.post('/api/filterData', function(req, res) {
    const data = require('./data/database.json')
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
    const data = require('./data/database.json')
    let topicJson = require('./data/topics_keywords_latest.json')
    let keywordsArr = [].concat.apply([],Object.values(topicJson).map((val)=>val.keywords))
    const newKeyword = req.body.newKeyword
    keywordsArr.push(newKeyword)
    let filtered = data.filter((val)=>{
        let diff = []
        keywordsArr.forEach((key)=>{
            if(val.Title.toLowerCase().includes(key.toLowerCase()))
            diff.push(val)
        })
        return diff[0]
    })
    let displayedData = data.filter(function(obj) {
        return !filtered.some(function(obj2) {
            return (obj.Title===obj2.Title&&obj.Description===obj2.Description);
        });
    })
    topicJson[req.body.topic].keywords.push(newKeyword)
    fs.writeFile('./data/database.json', JSON.stringify(displayedData) , 'utf-8',(err,result)=>{if(err) console.log(err)});
    fs.writeFile('./data/topics_keywords_latest.json', JSON.stringify(topicJson) , 'utf-8',(err,result)=>{if(err) console.log(err)});
    res.json({
        newData:displayedData
    })
}); 

const port = process.env.PORT || 3000;

app.listen(port);

console.log('Label tool activated on port :' + port);
