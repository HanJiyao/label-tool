import  React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import App from './App'
import AppItem from './App_bak'
import M from "materialize-css";
class MainRouter extends Component {
    componentDidMount() {    
        M.FloatingActionButton.init(document.querySelectorAll('.fixed-action-btn'), {});
    }
    render() {
        return (
            <Router>
                {/* <div class="fixed-action-btn">
                    <Link to="/" class="btn-floating btn-large red"><i class="large material-icons">list</i></Link>
                    <ul>
                        <li><Link to="/item" class="btn-floating red"><i class="material-icons">rate_review</i></Link></li>
                    </ul>
                </div> */}
                <Route exact path="/" component={Home} />
                <Route path="/item" component={Item} />
            </Router>
        );
    }
    
}

function Home() {
  return (
    <App />
  );
}

function Item() {
  return (
    <AppItem />
  );
}

export default MainRouter;