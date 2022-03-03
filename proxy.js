const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// The rest of this snippet for the demo page
function redirectResponse() {
  return new Response(
    `
  <!DOCTYPE html>
  <html>
  <body>
    <h1>Redirecting...</h1>
    <script>window.location.replace("https://directory.jameslittle.me");</script>
  </body>
  </html>`,
    {
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    }
  );
}

async function handleRequest(request) {
  let requestUrl = new URL(request.url);
  let proxyUrl =
    "https://webapi.bowdoin.edu/webapi/directory/search" +
    "?" +
    requestUrl.searchParams.toString();
    console.log("first", requestUrl.searchParams.get("first"));
    console.log("last", requestUrl.searchParams.get("last"));

  // Rewrite request to point to API url.
  request = new Request(proxyUrl, request);
  request.headers.set("Origin", new URL(proxyUrl).origin);
  let response = await fetch(request);

  // Recreate the response so we can modify the headers
  response = new Response(response.body, response);
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.append("Vary", "Origin");

  return response;
}

function handleOptions(request) {
  let headers = request.headers;
  if (
    headers.get("Origin") !== null &&
    headers.get("Access-Control-Request-Method") !== null &&
    headers.get("Access-Control-Request-Headers") !== null
  ) {
    let respHeaders = {
      ...corsHeaders,
      "Access-Control-Allow-Headers": request.headers.get(
        "Access-Control-Request-Headers"
      ),
    };

    return new Response(null, {
      headers: respHeaders,
    });
  } else {
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, OPTIONS",
      },
    });
  }
}

addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/corsproxy")) {
    if (request.method === "OPTIONS") {
      event.respondWith(handleOptions(request));
    } else if (request.method === "GET" || request.method === "HEAD") {
      // Handle requests to the API server;
      event.respondWith(handleRequest(request));
    } else {
      event.respondWith(
        new Response(null, {
          status: 405,
          statusText: "Method Not Allowed",
        })
      );
    }
  } else {
    event.respondWith(redirectResponse());
  }
});

