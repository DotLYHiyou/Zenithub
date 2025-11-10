export function getFavicon(url) {
  return (
    "https://s2.googleusercontent.com/s2/favicons?sz=64&domain_url=" +
    encodeURIComponent(url)
  );
}

export function rAlert(text) {
  const div = document.createElement("div");
  div.className = "r-alert";

  div.innerHTML = `<p>${text}</p>`;

  document.body.appendChild(div);

  div.style.transform = "translateX(150%)";
  setTimeout(() => {
    div.style.transform = "translateX(0)";
  }, 10);

  setTimeout(() => {
    div.style.transform = "translateX(150%)";
    setTimeout(() => {
      div.remove();
    }, 150);
  }, 1500);
}
