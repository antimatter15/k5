import { K5Root, K5Primitive, K5Intermediate } from "k5"
import numericalBackprop from "k5/numerical.js"
import copyBackprop from "k5/copy.js"


import React from 'react';
import ReactDOM from 'react-dom';


class App extends K5Root(React.Component) {
  constructor(){
      super()
      this.state = { 
          index: 2, // tabs
          tree: {delta: 33, shrink: 0.8, cactus: "#E09494"}, // fractal tree
          dragon: {squareness: 0.8, x1: 100, y1: 200, x2: 500, y2: 200}, // dragon curve
          "spin": 0, "scale": 1, // warp drive
          hyperwarp: {"spin": 0, "scale": 1,},
          text: 'hello darkness my old friend',
      }
  }
  render() {
    return (
      <K5Tabs selectedIndex={this.state.index}>
        <TabList>
          <Tab>Fractal Tree</Tab>
          <Tab>Dragon Curve</Tab>
          <Tab>Spin Warp</Tab>
          <Tab>Hyperspin Warp</Tab>
          <Tab>Word Count</Tab>
        </TabList>
        <TabPanel>
          <HyperTreePane {...this.state.tree} />
        </TabPanel>
        <TabPanel>
            <HyperDragonPane {...this.state.dragon} />
        </TabPanel>
        <TabPanel>
            <WarpDrive {...this.state} />
        </TabPanel>
        <TabPanel>
            <HyperWarpDrive {...this.state.hyperwarp} />
        </TabPanel>
        <TabPanel>
            <TextArea value={this.state.text} style={{ width: 400, height: 200 }} />
            <br />
            Word Count: {this.state.text.trim().split(/\s/).length}
        </TabPanel>
      </K5Tabs>
    );
  }
}

// TODO: figure out how to make K5 intermediates more elegant

// class HyperWarpDrive extends K5Primitive(React.Component) {
//     stateOptimized(newState){
//         this.optimizeProps(copyBackprop(newState, props => props))
//     }
//     get state(){ return this.props }
//     set state(value){}

//     render(){
//         var points = []
//         for(var i = -5; i <= 5; i++){
//             for(var j = -5; j <= 5; j++){
//                 points.push(<WarpedPoint i={i} j={j} scale={this.state.scale} spin={this.state.spin} />)
//             }
//         }
//         return <svg>{points}</svg>
//     }
// }




class HyperWarpDrive extends K5Intermediate(React.Component) {
    render(){
        var points = []
        for(var i = -5; i <= 5; i++){
            for(var j = -5; j <= 5; j++){
                points.push(<WarpedPoint i={i} j={j} scale={this.props.scale} spin={this.props.spin} />)
            }
        }
        return <svg>{points}</svg>
    }
}


function WarpDrive(props){
    var points = []
    for(var i = -5; i <= 5; i++){
        for(var j = -5; j <= 5; j++){
            points.push(<WarpedPoint i={i} j={j} scale={props.scale} spin={props.spin} />)
        }
    }
    return <svg>{points}</svg>
}

class WarpedPoint extends React.PureComponent {
    render(){
        var dx = this.props.i,
            dy = this.props.j;
        var { spin, scale } = this.props;
        
        var r  = Math.sqrt(dx * dx + dy * dy)
        var theta = Math.atan2(dy, dx)
        var wx = scale * r * Math.cos(theta + spin * r),
            wy = scale * r * Math.sin(theta + spin * r);
        
        return <DraggableCircle cx={200 + 30*wx} cy={200 + 30*wy} r={4} /> 
    }
}

class HyperDragonPane extends K5Intermediate(React.Component) {
    render(){
        return <DragonPane {...this.props} />
    }
}

function DragonPane(props){
    return <div>
        <div>
            <Slider value={props.squareness} min={0} max={1} step={0.01} />
        </div>
        <svg>
            <DraggableDragon 
                x1={props.x1} x2={props.x2}
                y1={props.y1} y2={props.y2}
                squareness={props.squareness}
                level={10} />
        </svg>
    </div>
}

function DraggableDragon({x1, y1, x2, y2, level, squareness}){
    return <g>
        <Dragon x1={x1} y1={y1} x2={x2} y2={y2} level={level} dir={-1} squareness={squareness} />
        <DraggableCircle cx={x1} cy={y1} r={10} affects={"x1"} />
        <DraggableCircle cx={x2} cy={y2} r={10} affects={"y2"} />
    </g>
}



class Dragon extends React.PureComponent {
    render(){
        var {x1, y1, x2, y2, dir, level, squareness} = this.props;
        if(level == 0)
            return <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={4} strokeLinecap="round" stroke="black" />;
        var midx = (x1 + x2 + squareness*dir*(y2 - y1))/2
        var midy = (y1 + y2 - squareness*dir*(x2 - x1))/2
        return <g>
            <Dragon x1={x1} y1={y1} x2={midx} y2={midy} dir={-1} level={level-1} squareness={squareness} />
            <Dragon x1={midx} y1={midy} x2={x2} y2={y2} dir={+1} level={level-1} squareness={squareness} />
        </g>
    }
}


class HyperTreePane extends K5Intermediate(React.Component) {
    render(){
        return <TreePane {...this.props} />
    }
}

function TreePane(props){
    return <div>
        <div>
            <Slider value={props.delta} />
            <Slider value={props.shrink} min={0} max={1} step={0.01} />
            <TextInput value={props.cactus} />
            <ColorPicker color={props.cactus} />
        </div>
        <svg>
            <FractalTree 
                delta={props.delta} shrink={props.shrink}
                stroke={props.cactus}
                x1={300} y1={400} 
                length={100} 
                angle={-90} 
                n={8} />
        </svg>
    </div>
}


class FractalTree extends React.PureComponent {
    render(){
        var {x1, y1, length, angle, n, delta, shrink, stroke} = this.props;
        var x2 = x1 + length * Math.cos(angle * Math.PI/180);
        var y2 = y1 + length * Math.sin(angle * Math.PI/180);
        if(n > 0){
            var spawn = [
                <FractalTree 
                    key="left"
                    stroke={stroke}
                    delta={delta} shrink={shrink}
                    x1={x2} y1={y2} 
                    length={length * shrink} 
                    angle={angle - delta} 
                    n={n - 1} />,
                <FractalTree 
                    key="right"
                    stroke={stroke}
                    delta={delta} shrink={shrink}
                    x1={x2} y1={y2} 
                    length={length * shrink} 
                    angle={angle + delta} 
                    n={n - 1} />
            ]
        }
        return <g>
            {spawn}
            <line stroke={stroke} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={n + 1} 
                pointerEvents="none" />
            <DraggableCircle cx={x2} cy={y2} r={5} fill="green" />
        </g>
    }
}

import {Panel as ColorPickerPanel} from "rc-color-picker"
import 'rc-color-picker/assets/index.css';

class ColorPicker extends K5Primitive(React.Component) {
    render(){
        return <ColorPickerPanel 
                   color={this.props.color}
                   onChange={obj => this.optimizeProps(
                        copyBackprop(obj.color, props => props.color))}/>
    }
}

class Slider extends K5Primitive(React.Component) {
    render(){
        return <input type="range" 
                   {...this.props}
                   onChange={e => this.optimizeProps(numericalBackprop(props => 
                                (props.value - e.target.value)**2,
                                this.props.affects))} />
    }
}

class TextArea extends K5Primitive(React.Component) {
    render(){
        return <textarea {...this.props} onChange={e => this.optimizeProps(
                        copyBackprop(e.target.value, props => props.value))} />
    }
}

                   
class IntegerSlider extends K5Primitive(React.Component) {
    static defaultProps = { value: 0, min: 0, max: 10, step: 1 }
    render(){
        return <input type="range" 
                   {...this.props}
                   onChange={e => this.optimizeProps(
                        copyBackprop(+e.target.value, props => props.value))} />
    }
}


class TextInput extends K5Primitive(React.Component) {
    render(){
        return <input type="text" 
                   {...this.props}
                   onChange={e => this.optimizeProps(
                        copyBackprop(e.target.value, props => props.value)) } />
    }
}

// TODO: try to preserve polar coordinates relative to the center of the circle
// that way we can drag circles to resize them as well as move them around
class DraggableCircle extends K5Primitive(React.Component) {
    render(){
        return <circle {...this.props} onMouseDown={this.dragStart.bind(this)} />
    }
    dragStart(startEvent){
        var offsetX = -this.props.cx + startEvent.clientX,
            offsetY = -this.props.cy + startEvent.clientY;

        onDrag(dragEvent => {
            this.optimizeProps(numericalBackprop(props => 
                (props.cx + offsetX - dragEvent.clientX)**2 + (props.cy + offsetY - dragEvent.clientY)**2,
                this.props.affects));
        })
    }
}


function onDrag(onMove){
    var onUp = e => {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
}


import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
class K5Tabs extends K5Primitive(React.Component) {
    handleSelect(index, last) {
        this.optimizeProps(copyBackprop(index, props => props.selectedIndex))
        return false
    }
    render(){
        return <Tabs 
                   onSelect={this.handleSelect.bind(this)} 
                   selectedIndex={this.props.selectedIndex}>
            {this.props.children}
        </Tabs>
    }
}

ReactDOM.render(<App/>, document.getElementById('root'));
