import { getFavicon, rAlert } from "./utils.mjs";
import { getUV, search } from "./prxy.mjs";

const { span, iframe, button, img } = van.tags;
const {
  tags: { "ion-icon": ionIcon },
} = van;

var tabs = [];
var selectedTab = null;

// Side bar
const sideBar = document.querySelector("header");

// Controls
const pageBack = document.getElementById("page-back");
const pageForward = document.getElementById("page-forward");
const pageRefresh = document.getElementById("page-refresh");

// URL Bar
const urlForm = document.getElementById("url-form");
const urlInput = document.getElementById("url-input");

// New Tab Button
const newTabButton = document.getElementById("new-tab");

// Tab List
const tabList = document.getElementById("tab-list");

// Tab View
const tabView = document.getElementById("tab-view");

// Event Listeners
window.onmousemove = (e) => {
  if (e.clientX < 50) {
    sideBar.classList.add("hovered");
  } else {
    sideBar.classList.remove("hovered");
  }
};
pageBack.onclick = () => {
  selectedTab.view.contentWindow.history.back();
};

pageForward.onclick = () => {
  selectedTab.view.contentWindow.history.forward();
};

pageRefresh.onclick = () => {
  selectedTab.view.contentWindow.location.reload();
};

newTabButton.onclick = () => {
  addTab("uvsearch.rhw.one");
};

// Options (opt menu)
const devtoolsOption = document.getElementById("devtools-option");
const abcOption = document.getElementById("abc-option");
const gitOption = document.getElementById("git-option");

devtoolsOption.onclick = () => {
  try {
    // Assuming `selectedTab.view.contentWindow` is your target window
    selectedTab.view.contentWindow.eval(eruda);
    rAlert("Injected successfully.<br>Click the icon on the bottom right.");
  } catch (error) {
    rAlert("Failed to inject.");
  }
};

abcOption.onclick = () => {
  abCloak(selectedTab.view.src);
  rAlert("Opened in about:blank");
};

gitOption.onclick = () => {
  window.open("https://github.com/rhenryw/UV-Static-2.0", "_blank");
};

urlForm.onsubmit = async (e) => {
  e.preventDefault();
  selectedTab.view.src = await getUV(urlInput.value);
};

let eruda = `fetch("https://cdn.jsdelivr.net/npm/eruda")
.then((res) => res.text())
.then((data) => {
  eval(data);
  if (!window.erudaLoaded) {
    eruda.init({ defaults: { displaySize: 45, theme: "AMOLED" } });
    window.erudaLoaded = true;
  }
});`;

function abCloak(cloakUrl) {
  var win = window.open();
  var iframe = win.document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "0px";
  iframe.style.left = "0px";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.src = cloakUrl;
  win.document.body.appendChild(iframe);
}

// Objects
const tabItem = (tab) => {
  return button(
    {
      onclick: (e) => {
        if (
          !e.target.classList.contains("close") &&
          !e.target.classList.contains("close-icon")
        ) {
          focusTab(tab);
        }
      },
      class: "tab-item hover-focus1",
    },
    img({ src: getFavicon(tab.url) }),
    span(tab.title),

    button(
      {
        onclick: () => {
          tabs.splice(tabs.indexOf(tab), 1);

          if (tab == selectedTab) {
            selectedTab = null;
            if (tabs.length) focusTab(tabs[tabs.length - 1]);
            else
              setTimeout(() => {
                addTab("uvsearch.rhw.one");
              }, 100);
          }

          tabView.removeChild(tab.view);
          tab.view.remove();

          localStorage.setItem(
            "tabs",
            JSON.stringify(
              tabs.map((tab) => {
                return tab.url;
              })
            )
          );

          tab.item.style.animation = "slide-out-from-bottom 0.1s ease";
          setTimeout(() => {
            tabList.removeChild(tab.item);
            tab.item.remove();
          }, 75);
        },
        class: "close",
      },
      ionIcon({ name: "close", class: "close-icon" })
    )
  );
};

const tabFrame = (tab) => {
  return iframe({
    class: "tab-frame",
    src: tab.proxiedUrl,
    sandbox: "allow-scripts allow-forms allow-same-origin",
    onload: (e) => {
      let parts = e.target.contentWindow.location.pathname.slice(1).split("/");
      let targetUrl = decodeURIComponent(
        __uv$config.decodeUrl(parts[parts.length - 1])
      );

      tab.title = tab.view.contentWindow.document.title;
      console.log(tab.title);
      tab.url = targetUrl;
      tabList.children[tabs.indexOf(tab)].children[1].textContent = tab.title;
      tabList.children[tabs.indexOf(tab)].children[0].src =
        getFavicon(targetUrl);

      // Update URL bar
      if (tab == selectedTab) {
        urlInput.value = targetUrl;
      }

      localStorage.setItem(
        "tabs",
        JSON.stringify(
          tabs.map((tab) => {
            return tab.url;
          })
        )
      );
    },
  });
};

function focusTab(tab) {
  if (selectedTab) {
    selectedTab.view.style.display = "none";
    tabList.children[tabs.indexOf(selectedTab)].classList.remove("selectedTab");
  }
  selectedTab = tab;
  tab.view.style.display = "block";

  // Update URL bar
  urlInput.value = tab.url;

  tabList.children[tabs.indexOf(tab)].classList.add("selectedTab");
}

async function addTab(link) {
  let url;

  url = await getUV(link);

  let tab = {};

  tab.title = decodeURIComponent(
    __uv$config.decodeUrl(url.substring(url.lastIndexOf("/") + 1))
  ).replace(/^https?:\/\//, "");
  tab.url = search(link);
  tab.proxiedUrl = url;
  tab.icon = null;
  tab.view = tabFrame(tab);
  tab.item = tabItem(tab);

  tab.view.addEventListener("load", () => {
    let links = tab.view.contentWindow.document.querySelectorAll("a");
    links.forEach((element) => {
      element.addEventListener("click", (event) => {
        let isTargetTop = event.target.target === "_top";
        if (isTargetTop) {
          event.preventDefault();
          addTab(event.target.href);
        }
      });
    });
  });

  tabs.push(tab);

  tabList.appendChild(tab.item);

  tabView.appendChild(tab.view);
  focusTab(tab);
}

addTab("uvsearch.rhw.one");

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("inject")) {
  let tab = {};
  const injection = urlParams.get("inject");

  setTimeout(() => {
    addTab(injection)
    focusTab()
  }, 100);
}
