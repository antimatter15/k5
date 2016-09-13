import React from "react"
import ReactDOM from "react-dom"
import { K5Root, K5Primitive } from "k5"

class Demo extends K5Root {
    constructor(props){
        super(props)
        this.state = { stuff: 3, delta: 33, shrink: 0.8 }
    }
    render(){
        return <div>
            <div>
                <Slider value={this.state.delta} />
                <Slider value={this.state.shrink} min={0} max={1} step={0.01} />
            </div>
            <svg>
                <FractalTree 
                    delta={this.state.delta} shrink={this.state.shrink}
                    x1={300} y1={400} 
                    length={100} 
                    angle={-90} 
                    n={7} />
            </svg>
        </div>
    }
}

class Slider extends K5Primitive {
    render(){
        return <input type="range" 
                   {...this.props}
                   onChange={e => this.optimizeProps(props => 
                                (props.value - e.target.value)**2)} />
    }
}

function FractalTree({x1, y1, length, angle, n, delta, shrink}){
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

class DraggableCircle extends K5Primitive {
    render(){
        return <circle {...this.props} onMouseDown={this.dragStart.bind(this)} />
    }
    dragStart(startEvent){
        var dx = -this.props.cx + startEvent.clientX,
            dy = -this.props.cy + startEvent.clientY;

        var onMove = e => this.optimizeProps(props => 
            (props.cx + dx - e.clientX)**2 + (props.cy + dy - e.clientY)**2);
        
        var onUp = e => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }
        
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }
}




ReactDOM.render(<Demo />, document.getElementById('root'))

