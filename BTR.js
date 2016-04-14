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
- a partir desta função é possível quebrar a expressão em duas partes, localizando seu connector
- serve de base para uma segunda função que vai montar um objeto com as duas partes da função e seu connector e depois
de forma recursiva, quebrar todas as partes da expressao
 */
function getConnectorPosition(expression){
    
    var countIgnore = false;
    var currentChar = undefined;
    
    for( var i=0; i < expression.length; i++){
        currentChar = expression[i];
        if(currentChar == '('){
            countIgnore++;
        }
        else if(currentChar == ')'){
            countIgnore--;
        }
        
        if(countIgnore == 0 && isConnector(currentChar)){
            return i;   
        }
    }
    
    return -1;
}
function removeParenteses(expression){
    
    var openPositions = [];
    var closePositions = [];
    var firstOpenPosition;
    
    for( i = 0; i < expression.length; i++ ){
        if(expression[i] == '(' && firstOpenPosition == undefined){
            firstOpenPosition = i;
        }
        else{
            if(expression[i] == '('){
                openPositions.push(i);
            }
            else if( expression[i] == ')'){
                closePositions.push(i);
            }
        }
    }
    
    return expression.substring(firstOpenPosition + 1,closePositions[closePositions.length - 1]);
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