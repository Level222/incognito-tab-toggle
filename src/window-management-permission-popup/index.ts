import "./style.css";

const siteDetailsUrl = `chrome://settings/content/siteDetails?site=chrome-extension://${chrome.runtime.id}`;

const siteDetailsUrlArea = document.getElementById("site-details-url");

if (!siteDetailsUrlArea) {
  throw new TypeError("Element #site-details-url not found.");
}

const urlCode = document.createElement("code");
urlCode.textContent = siteDetailsUrl;
siteDetailsUrlArea.replaceChildren(urlCode);

const openSiteDetailsButton = document.getElementById("open-site-details");

if (!openSiteDetailsButton) {
  throw new TypeError("Element #open-site-details not found.");
}

openSiteDetailsButton.addEventListener("click", () => {
  chrome.windows.create({
    url: siteDetailsUrl
  });
});
