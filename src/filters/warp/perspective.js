function getSquareToQuad(x0, y0, x1, y1, x2, y2, x3, y3) {
    var dx1 = x1 - x2;
    var dy1 = y1 - y2;
    var dx2 = x3 - x2;
    var dy2 = y3 - y2;
    var dx3 = x0 - x1 + x2 - x3;
    var dy3 = y0 - y1 + y2 - y3;
    var m = {};
    var invdet = 1 / (dx1*dy2 - dx2*dy1);
    m.m20 = (dx3*dy2 - dx2*dy3)*invdet;
    m.m21 = (dx1*dy3 - dx3*dy1)*invdet;
    m.m22 = 1;
    m.m00 = x1 - x0 + m.m20*x1;
    m.m01 = x3 - x0 + m.m21*x3;
    m.m02 = x0;
    m.m10 = y1 - y0 + m.m20*y1;
    m.m11 = y3 - y0 + m.m21*y3;
    m.m12 = y0;
    return m;
}

function getAdjoint(m) {
    return {
        m00: m.m11*m.m22 - m.m12*m.m21,
        m10: m.m12*m.m20 - m.m10*m.m22,
        m20: m.m10*m.m21 - m.m11*m.m20,
        m01: m.m02*m.m21 - m.m01*m.m22,
        m11: m.m00*m.m22 - m.m02*m.m20,
        m21: m.m01*m.m20 - m.m00*m.m21,
        m02: m.m01*m.m12 - m.m02*m.m11,
        m12: m.m02*m.m10 - m.m00*m.m12,
        m22: m.m00*m.m11 - m.m01*m.m10
    };
}

function multiply(a, b) {
    return {
        m00: a.m00*b.m00 + a.m10*b.m01 + a.m20*b.m02,
        m10: a.m00*b.m10 + a.m10*b.m11 + a.m20*b.m12,
        m20: a.m00*b.m20 + a.m10*b.m21 + a.m20*b.m22,
        m01: a.m01*b.m00 + a.m11*b.m01 + a.m21*b.m02,
        m11: a.m01*b.m10 + a.m11*b.m11 + a.m21*b.m12,
        m21: a.m01*b.m20 + a.m11*b.m21 + a.m21*b.m22,
        m02: a.m02*b.m00 + a.m12*b.m01 + a.m22*b.m02,
        m12: a.m02*b.m10 + a.m12*b.m11 + a.m22*b.m12,
        m22: a.m02*b.m20 + a.m12*b.m21 + a.m22*b.m22
    };
}

function perspective(before, after) {
    var A = getSquareToQuad.apply(null, after);
    var B = getSquareToQuad.apply(null, before);
    var C = multiply(getAdjoint(A), B);
    return this.matrixWarp(
        C.m00, C.m01, C.m02,
        C.m10, C.m11, C.m12,
        C.m20, C.m21, C.m22
    );
}
