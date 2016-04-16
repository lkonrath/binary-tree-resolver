/*  
# Requisitos
 - identificar se é uma expressão valida
 - quebrar toda a expressão em uma arvore de subformulas em json
 - representar visualmente a arvore 
 - exibir e ocultar passo a passo as quebras das subformulas através do click
 */ 

//prototypes
String.prototype.replaceAll = function(searchValue, replaceValue){ //Substitui em toda a string
    var regex = new RegExp(searchValue, 'g'); 
    return this.replace(regex,replaceValue);
}
String.prototype.replaceAt = function(position, char){ //substitui um caractere especifico da string
    return this[position] = char;
}

var connectors = ['∧','∨','→','↔'];
var negation = '¬';


function getConnectors(){
    //Orientation options: LR = left to right , RL = right to left
    //Precedence: 1 more important than 2
    var connectors = [];
    
    connectors.push({ // connectors must be a prototype?
        character: '∧',
        type:'conjunction',
        precedence: 2,
        orientation: 'LR',
        position: 0 // stores and identify the position of connector in a expression 
    });
    
    connectors.push({
        character: '∨',
        type:'disjunction',
        precedence: 2,
        orientation: 'LR',
        position: 0  
    });    
    
    connectors.push({
        character: '→',
        type:'conditional',
        precedence: 1,
        orientation: 'RL',
        position: 0  
    });
    
    connectors.push({
        character: '↔',
        type:'biconditional',
        precedence: 1,
        orientation: 'LR',
        position: 0  
    });    
    
    return connectors;
}
function getConnector(character){
    
    var connectors = getConnectors();
    
    for(var i=0; i < connectors.length; i++){ // search for the connector corresponding 
        if(connectors[i].character == character){
            return connectors[i];
        }
    }
    
    return -1;
}


function isConnector(char){
    return connectors.indexOf(char) >= 0 // encontrou?
}
function isProposition(char){
    if(!isConnector(char)){
        //se não é um connector, pode ser uma proposição ou não ter nada
        return char != '' ? true : false;   
    }
    else{
        return false;
    }
}


function isValidExpression(expression){
    /* 
       1 - Identificar se a expressão possúi algum conectivo que não esteja conectando duas proposições
    */
    var _expression = expression.replaceAll('[\\(\\ \\¬\\~)]',''); //remove todos os parenteses e espaços em branco para checar os conectores
    var currentChar; 
    var previousChar;
    var nextChar;
    
    for (var index = 0; index < _expression.length; index++) { //checa todos os caracteres da expressão
        currentChar =  _expression.charAt(index);
        previousChar = _expression.charAt(index-1);
        nextChar = _expression.charAt(index+1);
        
        if(isConnector(currentChar)){ 
            //se é um conector e não tem uma proposicao de cada lado, a expressão é invalida
            if(!isProposition(previousChar)  || !isProposition(nextChar)){
                return false; 
            }
        }
        else{
            //se é uma proposição, não pode possuir uma proposição em nenhum dos lados
            if(isProposition(previousChar) || isProposition(nextChar)){
                return false; 
            }  
        }
    }
       
    return true;
}

/*
 Analisa uma lista de connetores e determina qual é o connector predominante
 */
function getPredominantConnector(connectors){
    
    var predominantConnector;
    
    for(var i=0; i < connectors.length; i++){
        
        if(predominantConnector == undefined){
            predominantConnector = connectors[i];
        }
        else if(connectors[i].precedence < predominantConnector.precedence){ // current loop connector must be resolved before the actual predominant connector?
            predominantConnector = connectors[i];
        }
        else if(connectors[i].precedence == predominantConnector.precedence) {
            if(connectors[i].orientation == 'LR'){
                if(connectors[i].position < predominantConnector.position){// Left to Right and the current connector occurs after of the actual predominant connector
                    predominantConnector = connectors[i];
                }
            }
            else{
                if(connectors[i].position > predominantConnector.position){ // Right to Left and the current connector occurs before of the actual predominant connector
                    predominantConnector = connectors[i];
                }
            }
        }
    }
    
    //caso nao exista connector, deve retornar -1
    return connectors.length > 0 ? predominantConnector.position : -1; 
}


/*
- a partir desta função é possível quebrar a expressão em duas partes, localizando seu connector
- serve de base para uma segunda função que vai montar um objeto com as duas partes da função e seu connector e depois
de forma recursiva, quebrar todas as partes da expressao
 */
function getConnectorPosition(expression){
    
    var countIgnore = false;
    var currentChar = undefined;
    var connectorsLocalized = [];
    
    for( var i=0; i < expression.length; i++){
        currentChar = expression[i];
        if(currentChar == '('){
            countIgnore++;
        }
        else if(currentChar == ')'){
            countIgnore--;
        }
        
        if(countIgnore == 0 && isConnector(currentChar)){ // adaptar isConnector para identificar atraves do novo objeto
            var connector = getConnector(currentChar);
            connector.position = i;
            connectorsLocalized.push(connector);
        }
    }
   
    return getPredominantConnector(connectorsLocalized); //send the list of connectors and positions of ocurrency in the expression
}
function removeParenteses(expression){
    var opened = false;
    for( var i=1; i < expression.length -1; i++){// search on the mid of the first and last characters 
        
        if(expression[i] == '('){
            opened = true;
        }
        else if(expression[i] == ')'){
            opened = false;
        }
        
    }    
    
    if(expression[0]=='(' && expression[expression.length - 1] == ')' && opened == false){
        return expression.substring(1,expression.length - 1);
    }
    else{
        return expression;
    }
    
}

function getNodes(expression){
    
    var _expression = expression.replaceAll(' ',''); 
    _expression = removeParenteses(_expression);

    var connectorPosition = getConnectorPosition(_expression);
    var leftExpression = _expression.substring(0,connectorPosition);
    var rightExpression = _expression.substring(connectorPosition + 1,_expression.length);
    var hasConnector = connectorPosition > 0;
    
    var node = {};
    node.expression = _expression;
    node.connector = connectorPosition > 0 ? _expression[connectorPosition] : undefined;
    
    node.subnodes = [];
    
    if(hasConnector){ // Divide the expression in two parts based on the connector
        node.subnodes.push(getNodes(leftExpression));
        node.subnodes.push(getNodes(rightExpression));  
    }
    else{ // Create sub nodes for negations
        if(_expression.charAt(0) == negation){
            node.subnodes.push(getNodes(_expression.substring(1,_expression.length)));
        }
    }
        
    return node;
}