
export function getHTMLPage(javascriptPath) {
  return `
    <!DOCTYPE html>
      <html lang="en" translate="no">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </head>
        <body>
          <div id="gameWrapper"></div>
          <script>
            if (globalThis === undefined) {
              var globalThis = window;
            }
          </script>

          <script type="module" src="${javascriptPath}"></script>
        </body>
      </html>
  <style>
    body {
      overflow: hidden;
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }
  </style>
  `
}

