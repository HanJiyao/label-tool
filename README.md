# Annotation Tool
[![Label Tool](/public/logo.png)](http://lssinh031.sin.sap.corp:2233)
A simple tool to edit json, manual label base on title and description
### Features
- CVS & JSON parsing
- Dynamic file l/O
- Instant filtering
- Inbuild json editor
- Keyboard short-cut support
- Mobile friendly
## Getting Started
Connet to **SAP-Corporate** network first
visit [http://lssinh031.sin.sap.corp:2233](http://lssinh031.sin.sap.corp:2233)
## For developer 
### Docker
Location at /data/lr_topics/label-tool
Docker image & process name **lr_topics_tool**
Go inside the container
```
docker exec -it lr_topics_tool /bin/bash
```
### Prerequisites
```
nodejs npm
```
### Installing
```
npm i
```
Unfortunately, react hot reloader has not fully implemented, need to manually build
```
npm run build
```
## Deployment
set port (except 2233)
```
export PORT=7890
```
Start server
```
npm run server
```
The data stored at /data
## Built With
* [NodeJS](https://reactjs.org/) - The web framework
* [React](https://reactjs.org/) - The user interfaces
* [Express](https://expressjs.com/) - The backend server
## Authors
* **Han Jiyao** - *Initial work*
## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
