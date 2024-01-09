var map = L.map('map').setView([36.884866,30.998911], 15); // Harita oluştur




L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map); // Harita katmanı ekle





var map2 = L.map('map2').setView([36.884866,30.998911],15);
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);

L.Routing.control({
  waypoints: [
    L.latLng(36.884866, 30.998911),
    L.latLng(36.89526, 31.009)
  ]
}).addTo(map2);




var markers = []; // Marker'ları tutmak için dizi oluştur
var polylines = []; // Çizgileri tutmak için dizi oluştur
var totalDistance = 0; // Toplam mesafeyi tutmak için değişken oluştur
var taxicabMarker;
var distance = 0;
var firstMarkerIcon = L.icon({
  iconUrl: 'placeholder.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

var secondMarkerIcon = L.icon({
  iconUrl: 'goal.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

map.on('click', function(e) { // Tıklama olayını dinle
  var marker;
  let lat = e.latlng.lat.toPrecision(8);
  let lng = e.latlng.lng.toPrecision(8);
  var taxicabLat;
  if (markers.length === 0) {
    marker = L.marker(e.latlng, { icon: firstMarkerIcon }).addTo(map).bindPopup('<a href="http://maps.google.com/maps?q=&layer=c&cbll='+lat+','+lng+'&cbp=11,0,0,0,0" target="_blank"><b> Google Street View </b> </a>').openPopup(); // İlk marker için icon'u ayarla
    taxicabLat = e.latlng.lat.toPrecision(8);
    
  } else if (markers.length === 1) {
    marker = L.marker(e.latlng, { icon: secondMarkerIcon }).addTo(map).bindPopup('<a href="http://maps.google.com/maps?q=&layer=c&cbll='+e.latlng.lat+','+e.latlng.lng+'&cbp=11,0,0,0,0" target="_blank"><b> Google Street View </b> </a>').openPopup(); // İkinci marker için icon'u ayarla
   
  } else {
    return; // İki marker'dan fazlasına izin verme
  }

  markers.push(marker); // Marker'ı diziye ekle

  if (markers.length > 1) { // Eğer 2'den fazla marker varsa
    var lastTwoMarkers = markers.slice(-2); // Son iki marker'ı al
    var latlngs = lastTwoMarkers.map(marker => marker.getLatLng()); // Marker'ların koordinatlarını al
    var polyline = L.polyline(latlngs, { color: 'red' }).addTo(map); // Marker'ları bir çizgi ile birbirine bağla
    polylines.push(polyline); // Çizgiyi diziye ekle

    distance = calculateDistance(latlngs[0], latlngs[1]); // Mesafeyi hesapla
    showDistanceOnMap(distance.toFixed(2),polyline); // Toplam mesafeyi harita üzerinde göster
  }
});

function calculateDistance(point1, point2) {
  return point1.distanceTo(point2); // İki nokta arasındaki mesafeyi Leaflet'in fonksiyonu ile hesapla
}

function showDistanceOnMap(distance, polyline) {
  var center = polyline.getCenter(); // Çizginin merkezini al
  console.log(distance);
  L.popup({ closeButton: false, closeOnClick: false })
    .setLatLng(center)
    .setContent("Aradaki mesafe: " + distance + " metre")
    .addTo(map); // Popup olarak mesafeyi haritaya ekle
}

function clearMarkers() {
  // Markerleri temizle
  markers.forEach(function(marker) {
    map.removeLayer(marker);
  });
  markers = [];

  // Çizgileri temizle
  polylines.forEach(function(polyline) {
    map.removeLayer(polyline);
  });
  polylines = [];

  // Popup'ları temizle
  map.eachLayer(function(layer) {
    if (layer instanceof L.Popup) {
      map.removeLayer(layer);
    }
  });

  // Taxicab Marker'ı temizle
  if (taxicabMarker) {
    map.removeLayer(taxicabMarker);
    taxicabMarker = null;
  }

  // Mesafe bilgisini sıfırla
  totalDistance = 0;

  // HTML içeriğini sıfırla (isteğe bağlı)
  document.querySelector('#taxicab-length').innerHTML = "";
  document.querySelector('#taxicab-info').innerHTML = "";
}


function calculateTaxicab(){
  if(markers.length === 2){
    var latlngs = markers.map(marker => marker.getLatLng()); // Marker'ların koordinatlarını al
    var taxicabLat = (latlngs[0].lat);
    var taxicabLng = (latlngs[1].lng); // Taxicab koordinatlarını hesapla
    taxicabMarker = L.marker([taxicabLat, taxicabLng]).addTo(map); // Taxicab marker'ı oluştur
    var polyline1 = L.polyline([markers[0].getLatLng(), taxicabMarker.getLatLng()], { color: 'aqua' }).addTo(map); // İlk iki marker ile taxicabMarker arasına çizgi ekle
    var polyline2 = L.polyline([markers[1].getLatLng(), taxicabMarker.getLatLng()], { color: 'goldenrod' }).addTo(map); // Son iki marker ile taxicabMarker arasına çizgi ekle
    var distance1 = calculateDistance(markers[0].getLatLng(), taxicabMarker.getLatLng()); // İlk çizgi mesafesini hesapla
    var distance2 = calculateDistance(markers[1].getLatLng(), taxicabMarker.getLatLng()); // İkinci çizgi mesafesini hesapla
    var toplam = distance1+ distance2;
    document.querySelector('#taxicab-length').innerHTML = "Eğer ki gideceğiniz yere  taxicab hesabı ile yürüyebilseydiniz, gideceğiniz mesafe <br> <span class='badge bg-primary'> yatay olarak : "  + distance1.toFixed(0) + " metre </span> <br> <span class='badge bg-primary'> dikey olarak: "  + distance2.toFixed(0) + " metre </span> <br> <span class='badge bg-primary'> yani toplamda : " + toplam.toFixed(0) + " metre </span>  <br> yol yürümeniz gerekirdi.";   
    document.querySelector('#taxicab-info').innerHTML = "<span class='badge bg-warning'> Taxicab ile gidilebilecek mesafe :" +toplam.toFixed(0) + "metre</span> <br> <span class='badge bg-warning'>Öklidyen ile gidilebilecek mesafe :" +distance.toFixed(0) +  "metre</span> <br> <span class='badge bg-warning'>Aradaki mesafe farkı :" + (toplam.toFixed(0) - distance.toFixed(0)) + "metre  </span>"
      showDistanceOnMap(distance1.toFixed(2),polyline1); // İlk çizgi üzerine mesafeyi yazdır
      showDistanceOnMap(distance2.toFixed(2),polyline2); // İkinci çizgi üzerine mesafeyi yazdır
  
    polylines.push(polyline1, polyline2); // Çizgileri diziye ekle
    }
}