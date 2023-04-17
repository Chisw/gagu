export const GPSUtil = {
  PI: 3.14159265358979324,
  x_pi: 3.14159265358979324 * 3000.0 / 180.0,
  delta: function (lat: number, lon: number) {
    var a = 6378245.0;
    var ee = 0.00669342162296594323;
    var dLat = this.transformLat(lon - 105.0, lat - 35.0);
    var dLon = this.transformLon(lon - 105.0, lat - 35.0);
    var radLat = lat / 180.0 * this.PI;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
    return { 'lat': dLat, 'lon': dLon };
  },
  //WGS-84 to GCJ-02
  gcj_encrypt: function (wgsLat: number, wgsLon: number) {
    if (this.outOfChina(wgsLat, wgsLon))
      return { 'lat': wgsLat, 'lon': wgsLon };

    var d = this.delta(wgsLat, wgsLon);
    return { 'lat': parseFloat(String(wgsLat)) + parseFloat(String(d.lat)), 'lon': parseFloat(String(wgsLon)) + parseFloat(String(d.lon)) };
  },
  outOfChina: function (lat: number, lon: number) {
    if (lon < 72.004 || lon > 137.8347)
      return true;
    if (lat < 0.8293 || lat > 55.8271)
      return true;
    return false;
  },
  //GCJ-02 to BD-09
  bd_encrypt : function (gcjLat: number, gcjLon: number) {
    var x = gcjLon, y = gcjLat;  
    var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);  
    var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);  
    const bdLon = z * Math.cos(theta) + 0.0065;  
    const bdLat = z * Math.sin(theta) + 0.006; 
    return { lat : bdLat, lon : bdLon };
  },
  transformLat: function (x: number, y: number) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
    return ret;
  },
  transformLon: function (x: number, y: number) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
    return ret;
  }
};

export const getGPSBaiduMapUrl = (ExifData: any, content?: string) => {
  const { GPS } = ExifData || {}
  const { GPSLatitude, GPSLongitude } = GPS || {}
  if (GPSLatitude && GPSLongitude) {
    const [[a, b], [c, d], [e, f]] = GPSLatitude as any
    const [[g, h], [i, j], [k, l]] = GPSLongitude as any
    const lat = a / b + c / d / 60 + e / f / 3600
    const lon = g / h + i / j / 60 + k / l / 3600

    const { lat: _lat, lon: _lon } = GPSUtil.gcj_encrypt(lat, lon)
    const point = GPSUtil.bd_encrypt(_lat, _lon)

    return `http://api.map.baidu.com/marker?location=${point.lat},${point.lon}&title=图片位置-GAGU&content=${content}&output=html`
  } else {
    return ''
  }
}
