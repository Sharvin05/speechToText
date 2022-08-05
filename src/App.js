import React from 'react';
import {BrowserRouter, Switch, Route } from 'react-router-dom';
import Acs from './Acs';
import './custom.css'
import SpeechToText from './SpeechToText';

function App() {
  return (
      <React.Fragment>
        <BrowserRouter>
          <Switch>
            <Route path="/acs" exact={true} component={Acs} />
            <Route path="/speech" exact={true} component={SpeechToText} />
          </Switch>
        </BrowserRouter>
      </React.Fragment>
      
    
  );
}

export default App;
