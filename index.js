import React from "react"
import minimize from "./minimize.js"

export class K5Primitive extends React.Component {
    optimizeProps(propLoss){
        // TODO: add support for "affects" whitelist
        var chain = getInstanceAncestry(this._reactInternalInstance);
        var root = chain[0]._instance;
        root.optimizeState(state => propLoss(computePropsFromState(chain, state)))
    }
}

export class K5Root extends React.Component {
    optimizeState(loss){
        var keys = Object.keys(this.state),
            x0 = keys.map(key => this.state[key]);
        var result = minimize(x => loss(zipObject(keys, x)), x0)
        this.setState(zipObject(keys, result.solution))
    }
}

function zipObject(keys, values){
    var obj = {};
    keys.forEach((key, i) => obj[key] = values[i]);
    return obj;
}

function getInstanceAncestry(inst){
    var chain = [inst]
    while(inst._currentElement._owner){
        inst = inst._currentElement._owner
        chain.unshift(inst)
        if(inst._instance instanceof K5Root) return chain;
    }
    throw new Error('K5Primitive must be a descendent of K5Root.')
}

function computePropsFromState(chain, rootState){
    var lastRender = renderProxiedInstance(chain[0]._instance, undefined, rootState)
    for(var i = 1; i < chain.length; i++){
        var lastElement = chain[i - 1]._renderedComponent._currentElement,
            currentElement = chain[i]._currentElement;
        var match = matchEquivalent(currentElement, lastElement, lastRender)
        if(i < chain.length - 1){
            var inst = chain[i]._instance;
            lastRender = renderProxiedInstance(inst, match.props)
        }else return match.props;
    }
}

function renderProxiedInstance(inst, props, state){
    var proxiedInst = new Proxy(inst, {
        get(target, key){
            if(key === 'props' && props) return props;
            if(key === 'state' && state) return state;
            return target[key] || target.getItem(key) || undefined;
        }
    })
    return inst.render.call(proxiedInst)
}

function matchEquivalent(needle, haystack, yaystack){
    if(needle === haystack) return yaystack;
    if(Array.isArray(haystack)){
        // TODO: instead of looking up a match by index, do it by key
        for(var i = 0; i < haystack.length; i++){
            var haychild = haystack[i],
                yaychild = yaystack[i],
                match = matchEquivalent(needle, haychild, yaychild);
            if(match) return match;
        }
    }else if(Array.isArray(haystack.props.children)){
        for(var i = 0; i < haystack.props.children.length; i++){
            var haychild = haystack.props.children[i],
                yaychild = yaystack.props.children[i],
                match = matchEquivalent(needle, haychild, yaychild);
            if(match) return match;
        }
    }else if(haystack.props.children){
        return matchEquivalent(needle, haystack.props.children, yaystack.props.children)
    }
}

