import React from "react"
import ReactDOM from "react-dom"
import { K5Root, K5Primitive } from "k5"
import numericalBackprop from "k5/numerical.js"
import copyBackprop from "k5/copy.js"

class Demo extends K5Root(React.Component) {
    constructor(props){
        super(props)
        this.state = {
            delta: 33, shrink: 0.8,
            squareness: 0.8, x1: 100, y1: 500, x2: 500, y2: 500,
            cactus: "wumbo"
        }
    }
    render(){
        return <div>
            <div>
                <Slider value={this.state.delta} />
                <Slider value={this.state.shrink} min={0} max={1} step={0.01} />
                <Slider value={this.state.squareness} min={0} max={1} step={0.01} />
                <TextInput value={this.state.cactus} />
            </div>
            <svg>
                <FractalTree 
                    delta={this.state.delta} shrink={this.state.shrink}
                    x1={300} y1={400} 
                    length={100} 
                    angle={-90} 
                    n={8} />
                
                <DraggableDragon 
                    x1={this.state.x1} x2={this.state.x2}
                    y1={this.state.y1} y2={this.state.y2}
                    squareness={this.state.squareness}
                    level={11} />
                
            </svg>
        </div>
    }
}

function DraggableDragon({x1, y1, x2, y2, level, squareness}){
    return <g>
        <Dragon x1={x1} y1={y1} x2={x2} y2={y2} level={level} dir={-1} squareness={squareness} />
        <DraggableCircle cx={x1} cy={y1} r={10} />
        <DraggableCircle cx={x2} cy={y2} r={10} />
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



class FractalTree extends React.PureComponent {
    render(){
        var {x1, y1, length, angle, n, delta, shrink} = this.props;
        var x2 = x1 + length * Math.cos(angle * Math.PI/180);
        var y2 = y1 + length * Math.sin(angle * Math.PI/180);
        if(n > 0){
            var spawn = [
                <FractalTree 
                    key="left"
                    delta={delta} shrink={shrink}
                    x1={x2} y1={y2} 
                    length={length * shrink} 
                    angle={angle - delta} 
                    n={n - 1} />,
                <FractalTree 
                    key="right"
                    delta={delta} shrink={shrink}
                    x1={x2} y1={y2} 
                    length={length * shrink} 
                    angle={angle + delta} 
                    n={n - 1} />
            ]
        }
        return <g>
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={n + 1} 
                pointerEvents="none" stroke="black" />
            <DraggableCircle cx={x2} cy={y2} r={5} />
            {spawn}
        </g>
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

class TextInput extends K5Primitive(React.Component) {
    render(){
        return <input type="text" 
                   {...this.props}
                   onChange={e => this.optimizeProps(
                        copyBackprop(e.target.value, props => props.value)) } />
    }
}

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


ReactDOM.render(<Demo />, document.getElementById('root'))

