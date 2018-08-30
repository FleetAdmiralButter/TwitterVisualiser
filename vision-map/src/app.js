// Copyright (c) 2018 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, { Component } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { css } from 'react-emotion';
import window from 'global/window';
import { connect } from 'react-redux';
import * as fs from 'fs';
import axios from 'axios';
import { CircleLoader } from 'react-spinners';

// Kepler.gl Data processing APIs
import { loadSampleConfigurations } from './actions';
import { replaceLoadDataModal } from './factories/load-data-modal';

const KeplerGl = require('kepler.gl/components').injectComponents();


function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}
var jsonTypes = requireAll(require.context("./data", false, /.json$/));

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Sample data
/* eslint-disable no-unused-vars */
import { updateVisData, addDataToMap } from 'kepler.gl/actions';
import Processors from 'kepler.gl/processors';
/* eslint-enable no-unused-vars */

const bannerHeight = 30;

const GlobalStyleDiv = styled.div`
  font-family: ff-clan-web-pro, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.71429;

  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
`;

const override = css`
    position: absolute;
    margin: 0 auto;
    border-color: red;
`;
class App extends Component {
  

  constructor(props) {
    super(props);
    this.state = {
      showGrid: false,
      width: window.innerWidth,
      showTools: true,
      height: window.innerHeight * 0.75,
      loading: true
    };

    // This binding is necessary to make `this` work in the callback
    this._getDataForMap = this._getDataForMap.bind(this);
    this._toggleTools = this._toggleTools.bind(this);
  }


  componentWillMount() {
    // if we pass an id as part of the url
    // we ry to fetch along map configurations
    //data_fetcher.checkLocalData();
    //const { params: { id: sampleMapId } = {} } = this.props;
    //this.props.dispatch(loadSampleConfigurations(sampleMapId));
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  componentDidMount() 
  {
    axios.get('http://localhost:3000/tweetMap')
      .then((res) => {
          res.data.forEach(item => {            
            let label = "Chicago Crime Data"
            const data  = Processors.processGeojson(item);
            const dataset = { 
              data,
              info: 
              {
                label: label
              }
            };
            this.props.dispatch(addDataToMap({ datasets: dataset }));
          });
      });
  }

  _onResize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight * 0.75
    });
  };
  
  _toggleTools = () =>
  {
     this.state.showTools = this.state.showTools ? false : true;
     console.log(this.state.showTools)
  }
  _getDataForMap = () => {

    axios.get('http://localhost:3000/tweetMap')
      .then((res) => {
          res.data.forEach(item => {            
            let label = item.features[0].properties.primary_type
            const data  = Processors.processGeojson(item);
            const dataset = { 
              data,
              info: 
              {
                label: label
              }
            };
            this.props.dispatch(addDataToMap({ datasets: dataset }));
          });
      });
  }

  render() {
    const { showBanner, width, height } = this.state;
    return (
      <GlobalStyleDiv>
        <div
          style={{
            transition: 'margin 1s, height 1s',
            position: 'absolute',
            width: '100%',
            height: '100%',
            minHeight: `calc(100% - ${bannerHeight}px)`,
            visibility: this.state.showTools ? 'visible' : 'hidden'
          }}
        >
          <KeplerGl
            mapboxApiAccessToken="pk.eyJ1IjoidmlzaW9uc3dpbiIsImEiOiJjamtyeHV6c3kzejQ5M3FvM25mYmo2bTM1In0.kaVi7yYgddR5uEjkGHfuSQ"
            id="map"
            /*
             * Specify path to keplerGl state, because it is not mount at the root
             */
            
            getState={state => state.demo.keplerGl}
            width={width}
            height={height}
          />

        </div>
        <div
          style={{
            position: 'absolute',
            marginTop: window.innerHeight * 0.8
          }}
        >
          <button onClick={this._getDataForMap}>Set Data</button>
          <button onClick={this._toggleTools}>Toggle Tools</button>

        </div>
      </GlobalStyleDiv>
    );
  }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({ dispatch });

export default connect(
  mapStateToProps,
  dispatchToProps
)(App);
