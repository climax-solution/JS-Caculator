$(document).ready(function() {
  const seed = "b3RwYXV0aDovL3RvdHAvR2l0SHViJTNBY2xpbWF4LXNvbHV0aW9uP3NlY3JldD1FTFlLUFJaVE5BWVFPVExEJmlzc3Vlcj1HaXRIdWI="
  // A database of the symbols and functions of every operand. Order of operators determines precedence.
  var operators = [
    {
      id: "op-power",
      numOperands: 2,
      symbol: " ^ ",
      calc: function(a, b) {
        return Math.pow(a, b);
      }
    },
    {
      id: "op-negate",
      numOperands: 1,
      symbol: " -",
      calc: function(a) {
        return -a;
      }
    },
    {
      id: "op-square-root",
      numOperands: 1,
      symbol: " √",
      calc: function(a) {
        return Math.sqrt(a);
      }
    },
    {
      id: "op-log",
      numOperands: 1,
      symbol: " log ",
      calc: function(a) {
        return Math.log10(a);
      }
    },
    {
      id: "op-natural-log",
      numOperands: 1,
      symbol: " ln ",
      calc: function(a) {
        return Math.log(a);
      }
    },
    {
      id: "op-sin",
      numOperands: 1,
      symbol: " sin ",
      calc: function(a) {
        return Math.sin(a);
      }
    },
    {
      id: "op-cos",
      numOperands: 1,
      symbol: " cos ",
      calc: function(a) {
        return Math.cos(a);
      }
    },
    {
      id: "op-tan",
      numOperands: 1,
      symbol: " tan ",
      calc: function(a) {
        return Math.tan(a);
      }
    },
    {
      id: "op-inverse-sin",
      numOperands: 1,
      symbol: " sin-1 ",
      calc: function(a) {
        return Math.asin(a);
      }
    },
    {
      id: "op-inverse-cos",
      numOperands: 1,
      symbol: " cos-1 ",
      calc: function(a) {
        return Math.acos(a);
      }
    },
    {
      id: "op-inverse-tan",
      numOperands: 1,
      symbol: " tan-1 ",
      calc: function(a) {
        return Math.atan(a);
      }
    },
    {
      id: "op-e",
      numOperands: 1,
      symbol: " e ^ ",
      calc: function(a) {
        return Math.exp(a);
      }
    },
    {
        id: "percent",
        numOperands: 2,
        symbol: " % ",
        calc: function(a, b) {
          return (a / b) * 100
        }
    },
    {
      id: "op-nth-root",
      numOperands: 2,
      symbol: "*√",
      calc: function(a, b) {
        return Math.pow(b, 1/a);
      }
    },
    {
      id: "op-multiply",
      numOperands: 2,
      symbol: " x ",
      calc: function(a, b) {
        return a * b;
      }
    },
    {
      id: "op-divide",
      numOperands: 2,
      symbol: " ÷ ",
      calc: function(a, b) {
        return a / b;
      }
    },
    {
      id: "op-add",
      numOperands: 2,
      symbol: " + ",
      calc: function(a, b) {
        return a + b;
      }
    },
    {
      id: "op-subtract",
      numOperands: 2,
      symbol: " - ",
      calc: function(a, b) {
        return a - b;
      }
    }
  ];
  
  // The number of places to round to
  const roundPlaces = 15;
  
  // Get the operator object for a given operator ID
  function getOperator(opID) {
    for(var i = 0; i < operators.length; i++) {
      if(operators[i].id === opID) {
        return operators[i];
      }
    }
    return undefined;
  }
  
  // Get the precedence of an operator given its ID
  function getOpPrecedence(opID) {
    for(var i = 0; i < operators.length; i++) {
      if(operators[i].id === opID) {
        return i;
      }
    }
    
    // If the given ID does not return an operator, then return a large value that will always lose in precedence
    return 1000;
  }
      
  // Returns true if op1 ID has equal or higher precedence than op2 ID, false otherwise
  function hasPrecedence(op1, op2) {
    if(getOperator(op1) != undefined) {
      return getOpPrecedence(op1) <= getOpPrecedence(op2);
    }
  }
  
  // Converts the given radian value to degrees
  function toDegrees(radians) {
    return radians * (180 / Math.PI);
  }
  
  // Converts the given degrees value to radians
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  // A list of every token (number or operator) currently in the expression
  var tokenList = [];
  
  // A list of previous results and expressions in the form {out: output, expression: expression string, tokens: list of tokens in the expression}
  var calcHistory = [];
  
  // Evaluates the expression and outputs the result
  function calculate() {
    // Check if brackets are balanced
    var count = 0;
    for(var i = 0; i < tokenList.length; i++) {
      if(tokenList[i] === "bracket-left") {
        count++;
      } else if(tokenList[i] === "bracket-right") {
        count--;
      }
    }
    if(count != 0) {
      output("Error: unbalanced brackets");
      return;
    }
    
    // Evaluate the expression using a modified version of the shunting yard algorithm
    var valStack = [];
    var opStack = [];
    for(var i = 0; i < tokenList.length; i++) {
      if(!isNaN(tokenList[i])) {
        valStack.push(tokenList[i]);
      } else if(tokenList[i] === "num-pi") {
        valStack.push(Math.PI);
      } else if(tokenList[i] === "bracket-left") {
        opStack.push(tokenList[i]);
      } else if(tokenList[i] === "bracket-right") {
        while(opStack[opStack.length - 1] !== "bracket-left") {
          var operator = getOperator(opStack.pop());
          if(operator.numOperands === 1)
            valStack.push(applyOperator(operator, [valStack.pop()]));
          else
            valStack.push(applyOperator(operator, [valStack.pop(), valStack.pop()]));
        }
        opStack.pop();
      } else {
        while(opStack.length > 0 && hasPrecedence(opStack[opStack.length - 1], tokenList[i])) {
          var operator = getOperator(opStack.pop());
          if(operator.numOperands === 1)
            valStack.push(applyOperator(operator, [valStack.pop()]));
          else
            valStack.push(applyOperator(operator, [valStack.pop(), valStack.pop()]));
        }
        opStack.push(tokenList[i]);
      }
    }
    
    while(opStack.length > 0) {
      var operator = getOperator(opStack.pop());

      if(operator.numOperands === 1)
        valStack.push(applyOperator(operator, [valStack.pop()]));
      else
        valStack.push(applyOperator(operator, [valStack.pop(), valStack.pop()]));
    }
    
    // Output the calculated result and the original expression
    output(valStack[0], $("#expression").html(), tokenList);
  }
  
  // Returns the result of applying the given unary or binary operator on the top values of the value stack
  function applyOperator(operator, vals) {
    var valA = vals[0];
    var result;
    
    if(vals.length === 1) {
      result = operator.calc(parseFloat(valA));
    } else {
      var valB = vals[1];
      result = operator.calc(parseFloat(valB), parseFloat(valA));
    }

    return result;
  }
  
  // Updates the equation and calc history with the given output
  function output(out, expression, tokens) {
    out = +out.toFixed(roundPlaces);
    $("#expression").html(out.toString());
    
    calcHistory.push({out: out, expression: expression, tokens: tokens});
    $("#calc-history-box").html("");
    for(var i = calcHistory.length - 1; i >= 0; i--) {
      $("#calc-history-box").append("<p style='color: #B0B0B0; ' class='calc-history-eq' id='eq" + i + "'>" + calcHistory[i].expression + "</p><p style='text-align: right; margin-top: -10px;'>= " + calcHistory[i].out + "</p>");
    }
  }
  
  // Adds a token to the token list and updates the display
  function addToken(token) {
    if(isNaN(token)) {
      if((token === "bracket-left" || token === "num-pi") && !isNaN(tokenList[tokenList.length - 1])) {
        tokenList.push("op-multiply");
      }
      tokenList.push(token);
    } else {
      if(!isNaN(tokenList[tokenList.length - 1])) {
        tokenList[tokenList.length - 1] = tokenList[tokenList.length - 1] + token;
      } else {
        if(!isNaN(token) && (tokenList[tokenList.length - 1] === "bracket-right" || tokenList[tokenList.length - 1] === "num-pi")) {
          tokenList.push("op-multiply");
        }
        tokenList.push(token);
      }
    }
        
    displayEquation();
  }

  // Updates the expression display's HTML
  function displayEquation() {
    var htmlString = "";
    for(var i = 0; i < tokenList.length; i++) {
      if(isNaN(tokenList[i])) {
        if(tokenList[i] === "bracket-left") {
          htmlString += " (";
        } else if(tokenList[i] === "bracket-right") {
          htmlString += ") ";
        } else if(tokenList[i] === "num-pi") {
          htmlString += " π ";
        } else {
          htmlString += getOperator(tokenList[i]).symbol;
        }
      } else {
        htmlString += tokenList[i];
      }
    }
    $("#expression").html(htmlString);
  }
  
  // Deletes the last entered token
  function deleteLast() {
    if(isNaN(tokenList[tokenList.length - 1])) {
      tokenList.pop();
    } else {
      tokenList[tokenList.length - 1] = tokenList[tokenList.length - 1].slice(0, -1);
      if(tokenList[tokenList.length -1].length === 0) {
        tokenList.pop();
      }
    }
    
    displayEquation();
  }
  
  // Shows/hides the advanced operators panel
  function toggleAdvanced() {
    $("#advanced-buttons").toggle();
    if($("#advanced-buttons").is(":visible")) {
      $("#toggle-advanced").removeClass("button-off");
      $("#toggle-advanced span").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-top");
    } else {
      $("#toggle-advanced").addClass("button-off");
      $("#toggle-advanced span").removeClass("glyphicon-triangle-top").addClass("glyphicon-triangle-bottom");
    }
  }
  
  // Triggers the appropriate action for each button that can be pressed
  function processButton(button) {
    switch($(button).attr("id")) {
      case "delete":
        deleteLast();
        break;
      case "clear":
        if(tokenList.length === 0) {
          calcHistory.length = 0;
          $("#calc-history-box").html("");
        } else {
          tokenList.length = 0;
          displayEquation();
        }
        break;
      case "period":
        if(isNaN(tokenList[tokenList.length - 1])) {
          addToken("0.");
        } else {
          if(tokenList[tokenList.length - 1].indexOf(".") === -1) {
            tokenList[tokenList.length - 1] += ".";
          }
        }
        displayEquation();
        break;
      case "equals":
        calculate();
        break;
      case "toggle-advanced":
        toggleAdvanced();
        break;
      case "num-pi":
        addToken("num-pi");
        break;
      default:
        if($(button).hasClass("num")) {
          addToken($(button).html());
        } else {
          addToken($(button).attr("id"));
        }
    }
  }
  
  // Catches all button clicks on the page
  $(".btn").click(function(event) {
    $(event.target).blur();
    processButton(event.target);
  });
  
  $(document).on("click", ".calc-history-eq", function(event) {
    var tokens = calcHistory[parseInt($(event.target).attr("id").substring(2))].tokens;
    console.log(parseInt($(event.target).attr("id").substring(2)));
    console.log(calcHistory);
    console.log(tokens);
    tokenList = tokens;
    displayEquation();
  });
  
});
