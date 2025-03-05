// setInterval(async () => {
//   try {
//     // check device active
//     let res = await fetch(
//       "${url}/devices/2a42bc399905?apikey=LsJQ1NKETw_Jtc6Y7WD6r"
//     );
//     let json = await res.json();
//     console.log(0);
//     if (json.status === 200) {
//       if (json.metadata.is_active) {
//         console.log(1);
//         // get new proxy
//         let proxy = await fetch("https://tmproxy.com/api/proxy/get-new-proxy", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             api_key: "c80de013a4c24b3425e7997c19c3bf2b",
//             id_location: 1,
//             id_isp: 0,
//           }),
//         });
//         let proxyJson = await proxy.json();
//         // set proxy
//         let result = await fetch("http://192.168.105.1/api/v1/set-proxy-auto", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             allow_duplicate: true,
//             proxy_list: [
//               `socks5://${proxyJson.data.username}:${proxyJson.data.password}@${proxyJson.data.socks5}`,
//             ],
//             rotate_by_time: false,
//           }),
//         });
//         console.log(2);
//         let resultJson = await result.json();
//         if (isEmptyObject(resultJson)) {
//           // set device inactive
//           await fetch(
//             "${url}/devices/2a42bc399905?apikey=LsJQ1NKETw_Jtc6Y7WD6r",
//             {
//               method: "PUT",
//               headers: {
//                 "Content-Type": "application/json",
//               },
//               body: JSON.stringify({
//                 is_active: false,
//               }),
//             }
//           );
//         }
//         console.log(3);
//       }
//     }
//   } catch (error) {}
// }, 1000);

// function isEmptyObject(obj) {
//   return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
// }

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const url = "https://qunpcdevelopers.quantm2004.com"

const app = express();
const PORT = 3000;

// Tạo HTTP Server
const server = createServer(app);

// Cấu hình CORS để nhận kết nối từ Android
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Lắng nghe kết nối từ Android
io.on("connection", (socket) => {
  console.log("📡 Android Connected:", socket.id);

  socket.on("log", async (message) => {
    console.log(`[📲 LOG] ${message}`);

    if (message.startsWith("GET_PROXY")) {
      try {
        let mac = message.split("|")[1];
        // get new proxy
        if (message.split("|")[2] === "TM") {
          let proxy = await fetch(
            "https://tmproxy.com/api/proxy/get-new-proxy",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                api_key: message.split("|")[3],
                id_location: 1,
                id_isp: 0,
              }),
            }
          );

          let proxyJson = await proxy.json();
          console.log("🔥 Proxy: ", proxyJson);
          // set proxy
          let result = await fetch("http://192.168.105.1/api/v1/assign-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mac_proxy: {
                [mac]: `socks5://${proxyJson.data.username}:${proxyJson.data.password}@${proxyJson.data.socks5}`,
              },
            }),
          });
          let resultJson = await result.json();
          console.log("🔥 Result: ", resultJson);
        } else if (message.split("|")[2] === "WW") {
          console.log("🔥 WW: " + message.split("|")[3]);
          let proxy = await fetch(
            `https://wwproxy.com/api/client/proxy/available?key=${message.split("|")[3]}&provinceId=-1`
          );

          let proxyJson = await proxy.json();
          console.log("🔥 Proxy: ", proxyJson);
          // set proxy
          let result = await fetch("http://192.168.105.1/api/v1/assign-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mac_proxy: {
                [mac]: `http://${proxyJson.data.proxy}`,
              },
            }),
          });
          let resultJson = await result.json();
          console.log("🔥 Result: ", resultJson);
        } else if (message.split("|")[2] === "Rai") {
          console.log("🔥 Rai: " + message.split("|")[3]);
          let proxy = await fetch(
            `https://be.raiproxy.com/api/package/${message.split("|")[3]}/reload?type=http`
          );

          let proxyJson = await proxy.json();
          console.log("🔥 Proxy: ", proxyJson);
          // set proxy
          let result = await fetch("http://192.168.105.1/api/v1/assign-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mac_proxy: {
                [mac]: `http://${proxyJson.result.http}`,
              },
            }),
          });
          let resultJson = await result.json();
          console.log("🔥 Result: ", resultJson);
        } else if (message.split("|")[2] === "ZING") {
          console.log("🔥 ZING: " + message.split("|")[3]);
          let proxy = await fetch(
            `${deviceJson.metadata.proxy.split("|")[1]}`, {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2MwNDUzMTM3NjMzZDY0Y2EzMTMzNjUiLCJpYXQiOjE3NDExNjk2MjIsImV4cCI6MTc0ODk0NTYyMn0.0THCPTJmxULO1S-LLHnyXdOFkoAEBocXOskUrPsmFdY'
            }
          }
          );
        }
      } catch (error) { }
    }

    if (message.startsWith("NoInternet")) {
      try {
        let mac = message.split("|")[1];
        let device = await fetch(
          `${url}/devices/${message.split("|")[2]}?apikey=LsJQ1NKETw_Jtc6Y7WD6r`
        );
        let deviceJson = await device.json();

        if (deviceJson.metadata.proxy.split("|")[0] === "WW") {
          let proxyResponse = await fetch(
            `https://wwproxy.com/api/client/proxy/current?key=${deviceJson.metadata.proxy.split("|")[1]}`
          );
          let proxyJson = await proxyResponse.json();

          // If the proxy is unavailable, fetch a new available proxy
          if (proxyJson.message.includes("không tồn tại trên hệ thống") || proxyJson.message.includes("Key hiện đang không")) {
            proxyResponse = await fetch(
              `https://wwproxy.com/api/client/proxy/available?key=${deviceJson.metadata.proxy.split("|")[1]}&provinceId=-1`
            );
            proxyJson = await proxyResponse.json();
          }

          console.log(proxyJson);

          // Now you can use the proxy data without re-reading the body
          let result = await fetch("http://192.168.105.1/api/v1/assign-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mac_proxy: {
                [mac]: `http://${proxyJson.data.proxy}`,
              },
            }),
          });

          let resultJson = await result.json();
          console.log("🔥 Result: ", resultJson);
        } else if (deviceJson.metadata.proxy.split("|")[0] === "Rai") {
          let proxyResponse = await fetch(
            `https://be.raiproxy.com/api/package/${deviceJson.metadata.proxy.split("|")[1]}`
          );
          let proxyJson = await proxyResponse.json();

          // If the proxy is unavailable, fetch a new available proxy
          if (!proxyJson.result.http) {
            proxyResponse = await fetch(
              `https://be.raiproxy.com/api/package/${deviceJson.metadata.proxy.split("|")[1]}/reload?type=http`
            );
            proxyJson = await proxyResponse.json();
          }

          console.log(proxyJson);

          // Now you can use the proxy data without re-reading the body
          let result = await fetch("http://192.168.105.1/api/v1/assign-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mac_proxy: {
                [mac]: `http://${proxyJson.result.http}`,
              },
            }),
          });

          let resultJson = await result.json();
          console.log("🔥 Result: ", resultJson);
        } else if (deviceJson.metadata.proxy.split("|")[0] === "ZING") {
          let proxyResponse = await fetch(
            `${deviceJson.metadata.proxy.split("|")[1]}`, {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2MwNDUzMTM3NjMzZDY0Y2EzMTMzNjUiLCJpYXQiOjE3NDExNjk2MjIsImV4cCI6MTc0ODk0NTYyMn0.0THCPTJmxULO1S-LLHnyXdOFkoAEBocXOskUrPsmFdY'
            }
          }
          );
          let proxyJson = await proxyResponse.json();

          // Now you can use the proxy data without re-reading the body
          let result = await fetch("http://192.168.105.1/api/v1/assign-proxy", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              mac_proxy: {
                [mac]: `http://${proxyJson.info.username}:${proxyJson.info.password}@${proxyJson.info.hostIp}:${proxyJson.info.portHttp}`,
              },
            }),
          });

          let resultJson = await result.json();
          console.log("🔥 Result: ", resultJson);
        }
      } catch (error) {
        console.log(error);
      }
    }

  });

  socket.on("disconnect", () => {
    console.log("❌ Android Disconnected:", socket.id);
  });
});

// Khởi động server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
