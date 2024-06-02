function updateRealTime() {
  const realTimeElement = document.getElementById("real-time");
  const now = new Date();

  // const oneHourLater = new Date(now.getTime());
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const options = {
    weekday: "long",

    hour: "numeric",
    hour12: false,
    timeZone: "Asia/Jakarta",
  };

  const formattedHour = oneHourLater.toLocaleTimeString("id-ID", options);
  const formattedTime = formattedHour + ":00";

  realTimeElement.textContent = formattedTime;

  return oneHourLater;
}
function updateHeadTime() {
  const realTimeElement = document.getElementById("head-time");
  const now = new Date();

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    hour12: false,
    minute: "numeric",

    timeZone: "Asia/Jakarta",
  };

  const formattedDate = now.toLocaleString("id-ID", options);

  realTimeElement.textContent = formattedDate;

  return now;
}

function updateCardsTime() {
  const cards = document.querySelectorAll(".cards .card");
  const startTime = updateRealTime();

  cards.forEach((card, index) => {
    const cardTime = new Date(
      startTime.getTime() - (index + 1) * 60 * 60 * 1000 //waktu mundur kebelakang
      // startTime.getTime() + (index + 1) * 60 * 60 * 1000 //waktu maju kedepan
    );

    const options = {
      weekday: "long",
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    };

    const formattedTime = cardTime.toLocaleTimeString("id-ID", options);
    const cardDateTimeElement = card.querySelector(".date-time");
    cardDateTimeElement.textContent = formattedTime + ":00";
  });
}

function updateTime() {
  updateCardsTime();
}

setInterval(updateTime, 1000);

window.onload = updateTime;

// Fungsi untuk mengambil data dari API dan menyimpannya ke dalam database
$(document).ready(function () {
  function updateWeatherData() {
    $.ajax({
      url: "HTTP_all.php", // Nama file PHP yang akan menangani permintaan
      method: "GET",
      dataType: "json",
      success: function (response) {
        // console.log("Data cuaca berhasil diperbarui:", response);
      },
      error: function (xhr, status, error) {
        console.error("Terjadi kesalahan:", error);
      },
    });
  }

  // Panggil fungsi untuk memperbarui data cuaca secara berkala (misalnya setiap 1 jam)
  setInterval(updateWeatherData, 10000); // 3600000 milidetik = 1 jam
});

$(document).ready(function () {
  function updateSensorData() {
    $.ajax({
      url: "HTTP_get_sensor.php",
      method: "GET", // Ganti method sesuai kebutuhan Anda
      dataType: "json",
      success: function (response) {
        // console.log("Data cuaca berhasil diperbarui:", response);
      },
      error: function (xhr, status, error) {
        console.error("Terjadi kesalahan:", error);
      },
    });
  }

  // Panggil fungsi untuk memperbarui data cuaca setiap 5 menit (300.000 milidetik)
  setInterval(updateSensorData, 10000); // 300.000 milidetik = 5 menit
});

$(document).ready(function () {
  // Function to reload data from the server
  function loadData(dataType, elementId) {
    $.ajax({
      url: "get_last_data.php",
      type: "GET",
      success: function (response) {
        displayData(response, dataType, elementId); // Display the last data
      },
      error: function (xhr, status, error) {
        console.error(`Error getting ${dataType} data:`, error);
      },
    });
  }

  // Function to display data
  function displayData(data, dataType, elementId) {
    let value;
    switch (dataType) {
      case "temperature":
        value = data.temperature + " °C";
        break;
      case "humidity":
        value = data.humidity + " %";
        break;
      case "pressure":
        value = data.pressure + " kPa";
        break;
      case "wind_speed":
        value = data.wind_speed + " m/s";
        break;
    }
    $(`#${elementId}`).html(value);
  }

  // Reload data every 1 second for each type
  const dataTypes = [
    { type: "temperature", elementId: "temperature" },
    { type: "humidity", elementId: "humidity" },
    { type: "pressure", elementId: "pressure" },
    { type: "wind_speed", elementId: "wind_speed" },
  ];

  dataTypes.forEach((dataType) => {
    setInterval(() => loadData(dataType.type, dataType.elementId), 1000);
  });
});

// URL website yang akan diperiksa statusnya
// Fungsi untuk memuat status server menggunakan AJAX
function loadServerStatus() {
  let xhr = new XMLHttpRequest();
  xhr.open("GET", "server_status.php", true);
  xhr.onload = function () {
    if (xhr.status == 200) {
      // Tanggapan berhasil, tampilkan notifikasi
      let serverStatus = xhr.responseText.trim();
      document.getElementById("announcement-text").innerText = serverStatus;
      let announcement = document.getElementById("announcement");
      // Ubah warna background berdasarkan status server
      if (serverStatus === "Server Online") {
        announcement.style.backgroundColor = "#008000"; // Warna hijau
        // Sembunyikan notifikasi setelah 5 detik
        setTimeout(function () {
          announcement.style.display = "none";
        }, 5000);
      } else if (
        serverStatus === "Server sedang Offline!!!, Data tidak Up To Date"
      ) {
        announcement.style.backgroundColor = "#C7141A"; // Warna merah
        // Jika server mati, tampilkan notifikasi tanpa batas waktu
        announcement.style.display = "block";
      }
    } else {
      // Tanggapan gagal, tangani kesalahan
      console.error("Gagal memuat status server:", xhr.statusText);
    }
  };
  xhr.onerror = function () {
    // Terjadi kesalahan saat melakukan permintaan
    console.error("Kesalahan saat memuat status server.");
  };
  xhr.send();
}

// Panggil fungsi untuk memuat status server saat halaman dimuat
loadServerStatus();

// Fungsi untuk menampilkan gambar cuaca berdasarkan prediksi
function displayWeatherImages(imageFilename, cardID) {
  const container = document.getElementById(cardID);
  if (!container) {
    console.error("Container not found:", cardID);
    return;
  }

  const img = container.querySelector(".img");
  if (!img) {
    console.error("Image element not found in container:", cardID);
    return;
  }

  img.src = "assets/" + imageFilename;
  img.alt = "Weather Icon";
  img.loading = "lazy";
}
// Fungsi untuk menampilkan gambar cuaca berdasarkan prediksi
function displayWeather(imageFilename, weatherID) {
  const container = document.getElementById(weatherID);
  if (!container) {
    console.error("Container not found:", weatherID);
    return;
  }

  const img = container.querySelector(".img");
  if (!img) {
    console.error("Image element not found in container:", weatherID);
    return;
  }

  img.src = "assets/" + imageFilename;
  img.alt = "Weather Icon";
  img.loading = "lazy";
}

// Pemetaan prediksi cuaca ke file gambar
let prediction_image_mapping = {
  "Hujan Lebat": "hujan-lebat-siang.png",
  Berawan: "berawan-siang.png",
  Cerah: "cerah-siang.png",
  Gerimis: "gerimis-siang.png",
  // Tambahkan pemetaan lain jika diperlukan
};

function fetchImages() {
  fetch("api.php") // Mengambil data dari api.php
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json(); // Mengubah respons menjadi JSON
    })
    .then((data) => {
      if (data.length >= 0) {
        // Mengambil item pertama untuk elemen dengan ID weather
        const firstItem = data[0];
        const prediction = firstItem.prediction; // Akses properti 'prediction' dari objek 'data'
        const imageFilename = prediction_image_mapping[prediction];
        if (imageFilename) {
          displayWeather(imageFilename, "weather");
        } else {
          console.error("No image found for prediction:", prediction);
        }

        // Mengambil sisa item untuk elemen dengan ID cardID
        data.slice(0).forEach((item, index) => {
          const prediction = item.prediction;
          const imageFilename = prediction_image_mapping[prediction];
          if (imageFilename) {
            const cardID = "card" + index;
            displayWeather(imageFilename, cardID); // Tambahkan nomor indeks untuk membedakan setiap elemen
          } else {
            console.error("No image found for prediction:", prediction);
          }
        });
      } else {
        console.error("No data received from API");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Panggil fetchImages() untuk pertama kali
fetchImages();

// Auto reload setiap 1 detik
setInterval(fetchImages, 1000);

// Membuat fungsi untuk melakukan permintaan AJAX
function fetchLatestPrediction() {
  fetch("api.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat mengambil data.");
      }
      return response.json();
    })
    .then((data) => {
      // Mengambil prediksi terakhir dari respons JSON
      let latestPrediction = data[data.length - 24].prediction;
      // Memasukkan prediksi ke dalam elemen HTML
      document.getElementById("result").innerText = latestPrediction;
    })
    .catch((error) => console.error(error));
}

// Memanggil fungsi untuk mengambil prediksi terakhir saat halaman dimuat
fetchLatestPrediction();
// Auto reload setiap 1 detik
setInterval(fetchLatestPrediction, 1000);

// Membuat fungsi untuk melakukan permintaan AJAX
function fetchCardPrediction() {
  fetch("api.php")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat mengambil data.");
      }
      return response.json();
    })
    .then((data) => {
      // Mengulang untuk setiap card
      for (let i = 0; i < data.length; i++) {
        // Mengambil prediksi dari data ke-i
        let prediction = data[i].prediction;
        // Memasukkan prediksi ke dalam elemen HTML card yang sesuai
        document
          .getElementById("card" + i)
          .getElementsByClassName("day-temp")[0].innerText = prediction;
      }
    })
    .catch((error) => console.error(error));
}

// Memanggil fungsi untuk mengambil prediksi saat halaman dimuat
fetchCardPrediction();
// Auto reload setiap 1 detik
setInterval(fetchCardPrediction, 1000);

$(document).ready(function () {
  // Tangani klik tombol "Get Data"
  $("#downloadCsv").click(function () {
    let rangeOption = $("#rangeOption").val();
    let startDate = $("#startDate").val();
    let endDate = $("#endDate").val();

    // Kirim data sesuai dengan opsi yang dipilih
    $.ajax({
      url: "download.php",
      type: "GET",
      data: {
        range_option: rangeOption,
        start_date: startDate,
        end_date: endDate,
      },
      success: function (response) {
        // Periksa apakah respons mengandung data atau pesan kesalahan
        if (response.hasOwnProperty("error")) {
          // Tampilkan pesan kesalahan jika respon berisi error
          $("#alertError").show().text(response.error);
          setTimeout(function () {
            $("#alertError").hide();
          }, 5000);
        }
        // Download data CSV jika respon berisi data yang valid
        if (typeof response === "object" && response !== null) {
          downloadCsv(response);
        } else {
          $("#alertError").show().text("Invalid data format received");
          setTimeout(function () {
            $("#alertError").hide();
          }, 5000);
        }
      },
      error: function (xhr, status, error) {
        $("#alertError").show().text(error);
        setTimeout(function () {
          $("#alertError").hide();
        }, 5000);
      },
    });
  });

  // Fungsi untuk mengunduh respons dalam format CSV sebagai file
  function downloadCsv(data) {
    // Periksa apakah data yang diterima adalah array
    if (Array.isArray(data) && data.length > 0) {
      // Membuat header CSV
      let csvHeader =
        "Timestamp,Temperature (°C),Humidity (%),Wind Speed (m/s),Pressure (kPa),Prediction\n";

      // Mengonversi setiap objek dalam data menjadi baris CSV
      let csvRows = data.map(function (obj) {
        return (
          [
            obj.timestamp,
            obj.temperature,
            obj.humidity,
            obj.wind_speed,
            obj.pressure,
            obj.prediction,
          ].join(",") + "\n"
        );
      });

      // Menggabungkan header CSV dan baris CSV menjadi satu string
      let csvData = csvHeader + csvRows.join("");

      // Membuat objek Blob dari data CSV
      let blob = new Blob([csvData], { type: "text/csv" });

      // Membuat URL objek Blob
      let url = URL.createObjectURL(blob);

      // Membuat elemen <a> untuk mengunduh file
      let a = document.createElement("a");
      a.href = url;
      a.download = "weather_data.csv"; // Nama file yang akan diunduh

      // Menambahkan elemen <a> ke dalam dokumen dan mengkliknya secara otomatis
      document.body.appendChild(a);
      a.click();

      // Membersihkan URL objek Blob setelah pengunduhan selesai
      URL.revokeObjectURL(url);
      // Tampilkan pesan keberhasilan
      $("#alertSuccess").show();
      setTimeout(function () {
        $("#alertSuccess").hide();
      }, 5000);
    } else {
      $("#alertError").show();
      setTimeout(function () {
        $("#alertError").hide();
      }, 5000);
    }
  }
});

$(document).ready(function () {
  // Tampilkan input untuk Custom Range jika opsi dipilih
  $("#rangeOption").change(function () {
    if ($(this).val() === "Custom Range") {
      $("#customRange").show();
    } else {
      $("#customRange").hide();
    }
  });
});

// Inisialisasi datepicker untuk input tanggal
$(".datepicker").datepicker({
  format: "yyyy-mm-dd",
  autoclose: true,
  todayHighlight: true,
});
let slideIndex = 0;
let timer; // letiabel untuk menyimpan timer

// Fungsi untuk menggerakkan slide ke kiri atau kanan
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Fungsi untuk menampilkan slide tertentu
function showSlides(n) {
  let slides = document.getElementsByClassName("card");
  if (n >= slides.length) {
    slideIndex = 0;
  }
  if (n < 0) {
    slideIndex = slides.length - 1;
  }
  for (let i = 0; i < slides.length; i++) {
    slides[i].style.transform = "translateX(" + -100 * slideIndex + "%)";
  }
}

// Fungsi untuk memulai slideshow otomatis
function startSlideshow() {
  timer = setInterval(function () {
    plusSlides(1); // Geser slide ke kanan
  }, 3000); // Set interval ke 3 detik (3000 milidetik)
}

// Fungsi untuk menghentikan slideshow otomatis
function stopSlideshow() {
  clearInterval(timer); // Hentikan timer
}

let myChart;

async function fetchDataFromAPI(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch data from API");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

function chartTime() {
  return Array.from(
    { length: 24 },
    (_, i) => `${String(i).padStart(2, "0")}:00`
  );
}

function createChart() {
  const ctx = document.getElementById("myChart").getContext("2d");
  const initialChartData = {
    labels: chartTime(),
    datasets: [
      {
        label: "Sensor",
        data: Array(24).fill(0),
        borderWidth: 4,
        borderColor: "rgb(255, 99, 132)",
        fill: true,
      },
    ],
  };
  const initialChartOptions = {
    scales: {
      y: { beginAtZero: true },
    },
    responsive: true,
    maintainAspectRatio: false,
  };
  myChart = new Chart(ctx, {
    type: "line",
    data: initialChartData,
    options: initialChartOptions,
  });
}

const sensorColors = {
  temperature: "rgb(220,20,60)",
  humidity: "rgb(65,105,225)",
  pressure: "rgb(34,139,34)",
  wind_speed: "rgb(255,215,0)",
};

function updateChart(data, chartType) {
  if (!data || !Array.isArray(data)) {
    console.error("Error updating chart: Invalid data received");
    return;
  }

  let labelSuffix = "";
  switch (chartType) {
    case "temperature":
      labelSuffix = " (°C)";
      break;
    case "humidity":
      labelSuffix = " (%)";
      break;
    case "pressure":
      labelSuffix = " (hPa)";
      break;
    case "wind_speed":
      labelSuffix = " (m/s)";
      break;
    default:
      break;
  }

  const newData = data.map((entry) => parseFloat(entry.data[chartType]));

  myChart.data.datasets[0].data = newData;
  myChart.data.datasets[0].label = `${chartType
    .replace("_", " ")
    .toUpperCase()}${labelSuffix}`;
  myChart.data.datasets[0].borderColor = sensorColors[chartType];

  myChart.update();
}

function fetchDataAndUpdateChart(url, chartType) {
  fetchDataFromAPI(url)
    .then((data) => {
      updateChart(data, chartType);
    })
    .catch((error) => {
      console.error("Error updating chart:", error);
    });
}

function changeChart() {
  const chartSelector = document.getElementById("chartSelector");
  const chartType = chartSelector.value;

  fetchDataAndUpdateChart(
    "http://localhost/weather-predict",
    chartType
  );
}

// Memanggil fungsi ini saat halaman dimuat
window.onload = function () {
  createChart();
  startSlideshow();
  changeChart(); // Mengambil data dari API dan memperbarui grafik saat halaman dimuat
  updateHeadTime();
};
