// Required by Vite
// for debug
/*
window.addEventListener('DOMContentLoaded', () => {
  document.body.append <= document.createElement(`<div style="position: absolute; top: 100px; z-index: 1000;">
      <p>
        Process <span id="process-execpath"></span>,
        Node.js <span id="node-version"></span>,
        Chromium <span id="chrome-version"></span>,
        Electron <span id="electron-version"></span>.
      </p>
    </div>`)
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerText = text;
    }
  };

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }

  document.getElementById('process-execpath').innerText = process.execPath;
});
*/
