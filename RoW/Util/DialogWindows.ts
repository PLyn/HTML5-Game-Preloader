﻿/*
    draws rectangle with border with colours being passed in the function
    as well as the dimensions of the rectangle
*/
function quickWindow(context, x, y, w, h, fcolor, scolor) {
    context.globalAlpha = 0.3;
    context.fillStyle = fcolor;
    context.fillRect(x, y, w, h);
    
    context.strokeStyle = scolor;
    context.strokeRect(x - 1, y - 1, w + 2, h + 2);
    context.globalAlpha = 1;
}
