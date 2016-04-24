function switchFontSize(element,command){
    
    var sizes = [
        "font-size-50",
        "font-size-60",
        "font-size-70",
        "font-size-80",
        "font-size-90",
        "font-size-100",
        "font-size-110",
        "font-size-120",
        "font-size-130",
        "font-size-140",
        "font-size-150"
    ]
    
    
    for(var i=0; i < sizes.length; i++){
        if(element.classList.contains(sizes[i])){
            if(command == 'increase' && sizes[i + 1] != undefined){
                element.classList.remove(sizes[i]);
                element.classList.add(sizes[ i + 1]);
                return true;
            }
            else if(command == 'decrease' && sizes[i - 1] != undefined){
                element.classList.remove(sizes[i]);
                element.classList.add(sizes[ i - 1]);
                return true;
            }
        }
    }
    return false;
}