/**
 * @filter         White Balance
 * @description    Adjust image white balance. Internally this uses the curves filter.
 * @param amount   -1 to 1 (-1 for cooler, 0 for no effect, 1 for warmer)
 */
function whiteBalance(amount) {
     var r, b;
     
     if (amount > 0) {
         // Add red, remove blue and green
         r = [0.5, 0.5 + (amount / 2.0)];
         b = [0.5, 0.5 - (amount / 4.0)];
     } else {
         // Add blue, remove red and green
         r = [0.5, 0.5 + (amount / 4.0)];
         b = [0.5, 0.5 - (amount / 2.0)];
     }
     
     return this.curves(
         [[0, 0], r, [1, 1]],
         [[0, 0], [0.5, 0.5 - (Math.abs(amount) / 4.0)], [1, 1]],
         [[0, 0], b, [1, 1]]
     );
}
