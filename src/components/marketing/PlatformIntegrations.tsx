export function PlatformIntegrations() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="mb-12 text-foreground">Join Thousands of Productive Users</h2>
        
        <div className="flex flex-wrap justify-center items-center gap-12">
          {/* Slack */}
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#E01E5A"/>
            </svg>
            <span className="text-lg font-semibold text-foreground">slack</span>
          </div>
          
          {/* Google Meet */}
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M16 10V6h6l-6 4z" fill="#00832D"/>
              <path d="M16 14v4l6-4h-6z" fill="#0066DA"/>
              <path d="M2 10v4l4-2-4-2z" fill="#E94235"/>
              <path d="M6 10v4h10v-4H6z" fill="#2684FC"/>
              <path d="M16 10v4l4-2-4-2z" fill="#00AC47"/>
            </svg>
            <span className="text-lg font-semibold text-foreground">Google Meet</span>
          </div>
          
          {/* Zoom */}
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#2D8CFF"/>
              <path d="M6 8h7v5l4-3v6l-4-3v5H6V8z" fill="white"/>
            </svg>
            <span className="text-lg font-semibold text-foreground">ZOOM</span>
          </div>
          
          {/* Microsoft Teams */}
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="2" fill="#5059C9"/>
              <path d="M12 8h6v8h-6z" fill="#7B83EB"/>
              <circle cx="9" cy="12" r="3" fill="white"/>
            </svg>
            <span className="text-lg font-semibold text-foreground">Microsoft Teams</span>
          </div>
        </div>
      </div>
    </section>
  );
}
