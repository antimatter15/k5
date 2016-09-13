export function K5Primitive(BaseComponent){
    return class K5Primitive extends BaseComponent {
        optimizeProps(stateOptimizer){
            var chain = getInstanceAncestry(this._reactInternalInstance);
            var rootInstance = chain[0]._instance;
            rootInstance.stateOptimized(
                stateOptimizer(rootInstance.state, 
                    state => computePropsFromState(chain, state)))
        }
    }
}

export function K5Root(BaseComponent){
    return class K5Root extends BaseComponent {
        // this serves as the callback for when the state has updated
        stateOptimized(newState){ this.setState(newState) }
    }
}

function getInstanceAncestry(inst){
    var chain = [inst]
    while(inst._currentElement._owner){
        inst = inst._currentElement._owner
        chain.unshift(inst)
        if(inst._instance.stateOptimized) return chain;
    }
    throw new Error('K5Primitive must be a descendent of a component implementing method "stateOptimized(newState)".')
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

