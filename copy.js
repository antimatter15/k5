export default function copyBackprop(targetValue, propSelector){
    return (originalState, propsFromState) => {
        var originalValue = propSelector(propsFromState(originalState))
        for(var key in originalState){
            if(originalState[key] !== originalValue) continue;
            var candidate = { ...originalState, [key]: targetValue };
            if(propSelector(propsFromState(candidate)) === targetValue) return candidate;
        }
        return originalState;
    }
}