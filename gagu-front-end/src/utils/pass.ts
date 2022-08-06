/*
  X-plore.apk getPass
*/

function md5(s: string) {
  var add32 = function (a: number, b: number) { return (a + b) & 0xffffffff; };
  /*if(md5('hello') != '5d41402abc4b2a76b9719d911017c592'){
     function add32(x, y){
        var lsw = (x & 0xFFFF) + (y & 0xFFFF), msw = (x >> 16) + (y >> 16)
              + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
     }
  }
   */
  var cmn = function (q: number, a: number, b: number, x: number, _s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << _s) | (a >>> (32 - _s)), b);
  };
  var gg = function (a: number, b: number, c: number, d: number, x: number, _s: number, t: number) { return cmn((b & d) | (c & (~d)), a, b, x, _s, t); };
  var hh = function (a: number, b: number, c: number, d: number, x: number, _s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, _s, t); };
  var ii = function (a: number, b: number, c: number, d: number, x: number, _s: number, t: number) { return cmn(c ^ (b | (~d)), a, b, x, _s, t); };
  var ff = function (a: number, b: number, c: number, d: number, x: number, _s: number, t: number) { return cmn((b & c) | ((~b) & d), a, b, x, _s, t); };
  var md5cycle = function (x: number[], k: number[]) {
    var a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  };
  var md5blk = function (a: string) {
    var b = [];
    for (var i = 0; i < 64; i += 4)
      b[i >> 2] = a.charCodeAt(i) + (a.charCodeAt(i + 1) << 8) + (a.charCodeAt(i + 2) << 16) + (a.charCodeAt(i + 3) << 24);
    return b;
  };
  var n = s.length, state = [1732584193, -271733879, -1732584194, 271733878], i;
  for (i = 64; i <= n; i += 64)
    md5cycle(state, md5blk(s.substring(i - 64, i)));
  s = s.substring(i - 64);
  var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 0; i < n; i++)
    tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) {
    md5cycle(state, tail);
    for (i = 0; i < 16; i++)
      tail[i] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return state;
}

const byteArrayToHexString = (arr: number[]) => {
  var r = ''
  for (var i = 0; i < arr.length; i++) {
    var s = arr[i].toString(16)
    if (s.length < 2)
      s = '0' + s
    r += s
  }
  return r
}

const getPass = (pass: string) => {
  const m = md5(pass)
  // get byte from int[]
  const b = (n: number) => ((m as any)[n >>> 2] >>> ((n & 3) * 8)) & 0xff
  const arr = [
    (b(0) ^ b(6)),
    (b(1) ^ b(7)),
    (b(2) ^ b(8)),
    (b(3) ^ b(9)),
    (b(4) ^ b(10)),
    (b(5) ^ b(11))
  ]
  return byteArrayToHexString(arr)
}

export default getPass
