const socket = io("http://localhost:8000");
let nsSocket = "";
// Listen for nsList
socket.on("nsList", (nsData) => {
  // Update the DOM
  let namespacesDiv = document.querySelector(".namespaces");
  namespacesDiv.innerHTML = "";
  nsData.forEach((ns) => {
    namespacesDiv.innerHTML += `<div class="namespace" ns="${ns.endpoint}"><img src="${ns.img}"></div>`;
  });
  // Adding click listener to each namespace
  Array.from(document.getElementsByClassName("namespace")).forEach((elem) => {
    elem.addEventListener("click", (e) => {
      const nsEndPoint = elem.getAttribute("ns");
      //   console.log(nsEndPoint);
      joinNs(nsEndPoint);
    });
  });

  joinNs("/wiki");
});
