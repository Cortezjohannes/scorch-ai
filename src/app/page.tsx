// Force dynamic rendering to avoid SSR issues with AuthProvider
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Redirecting to Greenlit...</title>
        <meta httpEquiv="refresh" content="0; url=/greenlit-landing.html" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Immediate redirect
            window.location.replace('/greenlit-landing.html');
            
            // Fallback redirect after 1 second
            setTimeout(() => {
              window.location.href = '/greenlit-landing.html';
            }, 1000);
          `
        }} />
        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              margin: 0;
              padding: 0;
              background-color: black;
              color: white;
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              text-align: center;
            }
            .spinner {
              width: 32px;
              height: 32px;
              border: 2px solid #10B981;
              border-top: 2px solid transparent;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </head>
      <body>
        <div className="container">
          <div className="spinner"></div>
          <p>Redirecting to Greenlit...</p>
        </div>
      </body>
    </html>
  )
}