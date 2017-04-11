import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import logo from './logo.svg';
import './App.css';
import {XYPlot, XAxis, YAxis, HorizontalGridLines, LineSeries} from 'react-vis';

/* Slider imports */
import 'rc-slider/assets/index.css';
const Tooltip = require('rc-tooltip');
const Slider = require('rc-slider');
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Handle = Slider.Handle;


const handle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle {...restProps} />
    </Tooltip>
  )
};

const wrapperStyle = { width: 400, margin: 50 };
const heat_coords = [];

function heating_t(t_a, t_f, kappa, k_h, kelv, t){
  var cooling_factor = Math.exp(-kelv*t);
  return t_a + (k_h*cooling_factor)*t;
}

function cooling_t(t_a, t_o, kelv, t){
  return t_a + (t_o-t_a)*Math.exp(-kelv*t);
}

const App = React.createClass({
  getInitialState(){
    return {
      time: 0,
      resistance: 9.9,
      area: 320,
      voltage: 5,
      heating_data: [],
      cooling_data: []
    };
  },
  updateTime(){
    /* HEATING EQUATION VARIABLES */
    var t_a = 72;
    var t_f = 92;
    var kappa = 0.00186436;
    var k_h = (this.state.voltage*this.state.voltage) / (kappa*this.state.resistance*this.state.area);
    var kelv = 0.016;

    this.state.heating_data = []; //clear heating coordinates

    for(var i = 0; i < 60; i++){
      if(Math.round(heating_t(t_a,t_f,kappa,k_h,kelv,i)) === t_f){ //check if there exists a time within 60 sec, where the heater heats up to 92 degrees
        this.setState({
          time: i,
        });
      }
      this.state.heating_data.push({
        x: i,
        y: heating_t(t_a, t_f, kappa, k_h, kelv, i),
      });
      this.state.cooling_data.push({
        x: i,
        y: cooling_t(t_a, t_f, kelv, i),
      });
    }
    this.setState({
      heating_data: this.state.heating_data,
      cooling_data: this.state.cooling_data
    })

  },
  onResistanceChange(e){
    this.setState({
      resistance: e,
    });
    this.updateTime();
  },
  onAreaChange(e){
    this.setState({
      area: e,
    });
    this.updateTime();
  },
  onVoltageChange(e){
    this.setState({
      voltage: e,
    });
    this.updateTime();
  },
  render() {
    return (
      <div className="App">
          <div style={wrapperStyle}>
            <p>Resistance</p>
              <Slider min={9.9} max={78.5} defaultValue={15} handle={handle} onChange={this.onResistanceChange}/> <br/>
            <p>Area</p>
              <Slider min={320} max={1697} defaultValue={320} handle={handle} onChange={this.onAreaChange}/> <br/>
            <p>Voltage</p>
              <Slider min={5} max={9} defaultValue={5} handle={handle} onChange={this.onVoltageChange}/> <br/>
            <p>Time</p>
              <input value={this.state.time} />
          </div>
          <XYPlot
            yDomain={[70, 100]}
            xDomain={[0, 60]}
            width={500}
            height={300}
            fill={"transparent"}
            >

            <HorizontalGridLines />

            <LineSeries
              // color="red"
              fill="transparent"
              data={this.state.heating_data}/>
            <XAxis title="Dt(s)"/>
            <YAxis title = "Expected"/>
          </XYPlot>

          <XYPlot
            yDomain={[70, 100]}
            xDomain={[0, 60]}
            width={500}
            height={300}
            fill={"transparent"}
            >

            <HorizontalGridLines />

            <LineSeries
              // color="red"
              fill="transparent"
              data={this.state.cooling_data}/>
            <XAxis title="Dt(s)"/>
            <YAxis title = "Expected"/>
          </XYPlot>
      </div>

    );
  }
});

export default App;
