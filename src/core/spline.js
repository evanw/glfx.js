// from SplineInterpolator.cs in the Paint.NET source code

function SplineInterpolator(points) {
    var n = points.length;
    this.xa = [];
    this.ya = [];
    this.u = [];
    this.y2 = [];

    points.sort(function(a, b) {
        return a[0] - b[0];
    });
    for (var i = 0; i < n; i++) {
        this.xa.push(points[i][0]);
        this.ya.push(points[i][1]);
    }

    this.u[0] = 0;
    this.y2[0] = 0;

    for (var i = 1; i < n - 1; ++i) {
        // This is the decomposition loop of the tridiagonal algorithm. 
        // y2 and u are used for temporary storage of the decomposed factors.
        var wx = this.xa[i + 1] - this.xa[i - 1];
        var sig = (this.xa[i] - this.xa[i - 1]) / wx;
        var p = sig * this.y2[i - 1] + 2.0;

        this.y2[i] = (sig - 1.0) / p;

        var ddydx = 
            (this.ya[i + 1] - this.ya[i]) / (this.xa[i + 1] - this.xa[i]) - 
            (this.ya[i] - this.ya[i - 1]) / (this.xa[i] - this.xa[i - 1]);

        this.u[i] = (6.0 * ddydx / wx - sig * this.u[i - 1]) / p;
    }

    this.y2[n - 1] = 0;

    // This is the backsubstitution loop of the tridiagonal algorithm
    for (var i = n - 2; i >= 0; --i) {
        this.y2[i] = this.y2[i] * this.y2[i + 1] + this.u[i];
    }
}

SplineInterpolator.prototype.interpolate = function(x) {
    var n = this.ya.length;
    var klo = 0;
    var khi = n - 1;

    // We will find the right place in the table by means of
    // bisection. This is optimal if sequential calls to this
    // routine are at random values of x. If sequential calls
    // are in order, and closely spaced, one would do better
    // to store previous values of klo and khi.
    while (khi - klo > 1) {
        var k = (khi + klo) >> 1;

        if (this.xa[k] > x) {
            khi = k; 
        } else {
            klo = k;
        }
    }

    var h = this.xa[khi] - this.xa[klo];
    var a = (this.xa[khi] - x) / h;
    var b = (x - this.xa[klo]) / h;

    // Cubic spline polynomial is now evaluated.
    return a * this.ya[klo] + b * this.ya[khi] + 
        ((a * a * a - a) * this.y2[klo] + (b * b * b - b) * this.y2[khi]) * (h * h) / 6.0;
};
