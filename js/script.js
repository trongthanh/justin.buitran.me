/**
 * Copyright: 2011 (c) int3ractive.com
 * Author: Thanh Tran - trongthanh@gmail.com
 */

//util
window.debugEl = $('debug');
window.trace = function(line, str) {
  //window.debugEl.getElement('.line' + line).set('html', str);
};

/*window.debugPoint = $('debug-point');
window.tracePos = function(screenX, screenY, anchorX, anchorY) {
  if(anchorX === undefined) anchorX = 0;
  if(anchorY === undefined) anchorY = 0;

  debugPoint.setPosition({x: anchorX + screenX, y: anchorY + screenY});
};*/

//TTT namespace
var T3 = {};

//CONSTANT
T3.SLIDE_WIDTH = 1900;
T3.SLIDE_HEIGHT = 900;
T3.BG_FAR_SPEED = 0.2;
T3.BG_NEAR_SPEED = 0.5 * T3.SLIDE_HEIGHT;
T3.FOREGROUND_SPEED = 1.8 * T3.SLIDE_HEIGHT;
T3.SKY_SEA_BOUNDARY = 8365; //pixel distance of content
T3.FRAME_RATE = 20;
