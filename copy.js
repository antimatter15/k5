export default function copyBackprop(targetValue, propSelector){
    return (originalState, propsFromState) => {
        var originalValue = propSelector(propsFromState(originalState))
        for(var key in originalState){
            if(!isEqual(originalState[key], originalValue)) continue;
            var candidate = { ...originalState, [key]: targetValue };
            if(isEqual(propSelector(propsFromState(candidate)), targetValue)) return candidate;
        }
        return originalState;
    }
}

function isEqual(a, b){
	if(a === b) return true;
	if(Array.isArray(a) && Array.isArray(b)) 
		return a.every((k, i) => isEqual(a[i], b[i]));
	if(typeof a === 'object' && typeof b === 'object')
		return Object.keys(a).length === Object.keys(b).length
			&& Object.keys(a).every((k, i) => isEqual(b[k], a[k]))
	return false;
}