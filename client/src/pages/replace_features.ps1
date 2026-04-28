$filePath = "GameHub.jsx"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Find the start of the FEATURES section and REVIEWS section
$featuresStart = $content.IndexOf("  {/* " + [char]0x2500 + [char]0x2500 + " FEATURES " + [char]0x2500 + [char]0x2500 + " */}")
$reviewsStart = $content.IndexOf("  {/* " + [char]0x2500 + [char]0x2500 + " REVIEWS " + [char]0x2500 + [char]0x2500 + " */}")

Write-Host "Features start: $featuresStart"
Write-Host "Reviews start: $reviewsStart"

if ($featuresStart -ge 0 -and $reviewsStart -gt $featuresStart) {
    $newSection = @"

  {/* FEATURES: REDESIGNED */}
  <div className="py-32 relative overflow-hidden bg-[#060606]">
    {/* Atmospheric Background Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="max-w-[1400px] mx-auto px-6 relative z-10">
      <div className="text-center mb-20">
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="h-px bg-gradient-to-r from-transparent to-white/20 flex-1 hidden md:block"></div>
          <h2 className="text-2xl md:text-4xl font-black text-white tracking-[0.2em] uppercase">
            Optimize Your Time With <span className="text-primary">BoostGG</span>
          </h2>
          <div className="h-px bg-gradient-to-l from-transparent to-white/20 flex-1 hidden md:block"></div>
        </div>
        <p className="text-white/40 font-medium text-sm max-w-xl mx-auto uppercase tracking-widest">
          Over 10 years in gaming, we know exactly what elite players need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {[
          { 
            svg: '/game-hub/competitive_prices_new.svg', 
            title: 'Competitive Prices', 
            desc: 'Premium services at the most competitive rates in the market.',
            btnText: 'Price Policy'
          },
          { 
            svg: '/game-hub/monitored_quality_new.svg', 
            title: 'Monitored Quality', 
            desc: '24/7 Human supervision and quality checks. No AI, only Pros.',
            btnText: 'Monitoring Systems'
          },
          { 
            svg: '/game-hub/safety_with_transparency_new.svg', 
            title: 'Safety & Transparency', 
            desc: 'Industry-leading encryption and VPN protocols for account safety.',
            btnText: 'Our Practices'
          },
        ].map(({ svg, title, desc, btnText }, i) => (
          <div key={i} className="flex flex-col items-center text-center group">
            <div className="relative mb-10">
              <div className="absolute inset-0 rounded-full border border-dashed border-primary/40 animate-spin-slow group-hover:border-primary transition-colors" style={{ padding: '4px', margin: '-10px' }}></div>
              <div className="w-28 h-28 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_40px_rgba(162,230,62,0.2)]">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img src={svg} alt={title} className="w-14 h-14 transition-all duration-500 group-hover:scale-110" />
              </div>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-[0.1em] mb-4 group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-white/40 font-medium leading-relaxed text-sm max-w-xs mb-8">{desc}</p>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 hover:border-white/20 hover:text-white transition-all">
              <Info className="w-3.5 h-3.5" />
              {btnText}
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>

  
"@

    $before = $content.Substring(0, $featuresStart)
    $after = $content.Substring($reviewsStart)
    $newContent = $before + $newSection + $after

    Set-Content $filePath -Value $newContent -Encoding UTF8 -NoNewline
    Write-Host "SUCCESS: Features section replaced!"
} else {
    Write-Host "ERROR: Could not find section boundaries."
    Write-Host "Features: $featuresStart, Reviews: $reviewsStart"
}
