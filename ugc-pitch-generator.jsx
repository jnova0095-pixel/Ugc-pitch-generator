import React, { useState } from 'react';
import { Loader2, Copy, Check } from 'lucide-react';

export default function UGCPitchGenerator() {
  const [formData, setFormData] = useState({
    brandInput: '',
    personalStory: '',
    pitchFocus: '',
    yourName: 'Julia',
    portfolio: 'https://juliasupernova.com/',
    tiktok: '@julia_supernova'
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [pitch, setPitch] = useState('');
  const [research, setResearch] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const callClaude = async (prompt, useWebSearch = false) => {
    const requestBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }]
    };

    if (useWebSearch) {
      requestBody.tools = [{
        type: "web_search_20250305",
        name: "web_search"
      }];
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.content
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("\n");

    return textContent;
  };

  const parseJSON = (text) => {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('JSON parse error:', e);
        return null;
      }
    }
    return null;
  };

  const generatePitch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPitch('');
    setResearch(null);

    try {
      // Step 1: Research brand
      setLoadingStep('🔍 Researching brand...');
      const brandPrompt = `Research this brand: ${formData.brandInput}

Analyze and provide:
1. Brand name (clean, no URL extensions)
2. Industry/niche
3. Main products or services
4. Brand style and vibe
5. Target audience
6. Content strategy
7. Opportunities

Respond ONLY with valid JSON:
{
  "brandName": "string",
  "industry": "string",
  "products": "string",
  "brandStyle": "string",
  "targetAudience": "string",
  "contentStrategy": "string",
  "opportunities": "string"
}`;

      const brandText = await callClaude(brandPrompt, true);
      const brandResearch = parseJSON(brandText) || {
        brandName: formData.brandInput,
        industry: 'Brand',
        products: brandText.substring(0, 200),
        brandStyle: brandText.substring(0, 200),
        targetAudience: 'General consumers',
        contentStrategy: brandText.substring(0, 200),
        opportunities: 'UGC content opportunities'
      };

      // Step 2: Research competitors
      setLoadingStep('🎯 Analyzing competitors...');
      const competitorPrompt = `Find 2-3 competitors for ${brandResearch.brandName} in ${brandResearch.industry}.

For each provide:
1. Name
2. Strengths (especially UGC/content)
3. Social media approach
4. Advantages

Respond ONLY with valid JSON:
{
  "competitors": [
    {
      "name": "string",
      "strengths": "string",
      "contentApproach": "string",
      "advantages": "string"
    }
  ]
}`;

      const competitorText = await callClaude(competitorPrompt, true);
      const competitorResearch = parseJSON(competitorText) || {
        competitors: [{
          name: 'Industry competitor',
          strengths: 'Active social presence',
          contentApproach: 'Regular UGC content',
          advantages: 'Established content library'
        }]
      };

      setResearch({ brand: brandResearch, competitors: competitorResearch });

      // Step 3: Generate pitch
      setLoadingStep('✍️ Crafting your pitch...');
      const focusSection = formData.pitchFocus ? `

PITCH FOCUS (CRITICAL - CENTER ENTIRE PITCH AROUND THIS):
${formData.pitchFocus}

Make this the core problem/opportunity.` : '';

      const pitchPrompt = `Create a personalized UGC pitch.

BRAND: ${JSON.stringify(brandResearch, null, 2)}
COMPETITORS: ${JSON.stringify(competitorResearch, null, 2)}
PERSONAL CONNECTION: ${formData.personalStory || "Create genuine connection based on brand's product"}${focusSection}
CREATOR: ${formData.yourName}
PORTFOLIO: ${formData.portfolio}
TIKTOK: ${formData.tiktok}

STRUCTURE:
1. Genuine personal connection about the brand${formData.personalStory ? ' (use provided connection)' : ''}
2. Mention competitors' UGC usage if relevant
3. Identify market gap${formData.pitchFocus ? ' (MUST relate to pitch focus)' : ''}
4. Position as UGC solution
5. Propose collaboration
6. Call to action

EXAMPLES:
- "I came across your ad and discovered [product] and I'm genuinely fascinated – as someone who deals with [problem], this looks amazing"
- "I was targeted by your ad and I can't express the joy I felt seeing [specific thing]"

RULES:
- Personal and authentic
- Only REAL data from research
- Clear business angle (UGC for Q4, ads, social)
- Match brand's tone
- Include portfolio and TikTok links
- Conversational but professional${formData.pitchFocus ? '\n- CRITICAL: Entire pitch revolves around pitch focus' : ''}

Write the complete pitch as plain text.`;

      const generatedPitch = await callClaude(pitchPrompt, false);
      setPitch(generatedPitch);

    } catch (err) {
      console.error('Error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const copyPitch = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
            ✨ UGC Pitch Generator
          </h1>
          <p className="text-gray-400 text-lg">AI-powered personalized pitches for brands</p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
          <form onSubmit={generatePitch} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Brand Website or Instagram Handle *
              </label>
              <input
                type="text"
                name="brandInput"
                value={formData.brandInput}
                onChange={handleChange}
                placeholder="e.g., nurosym.com or @nurosymofficial"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Enter a website URL or Instagram handle</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Your Personal Connection (Optional)
              </label>
              <textarea
                name="personalStory"
                value={formData.personalStory}
                onChange={handleChange}
                placeholder="e.g., 'As someone who deals with anxiety since early age...'"
                rows="3"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Add your authentic connection to the brand</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Pitch Focus/Angle (Optional)
              </label>
              <textarea
                name="pitchFocus"
                value={formData.pitchFocus}
                onChange={handleChange}
                placeholder="e.g., 'Focus on Q4 holiday campaigns' or 'Emphasize TikTok trending formats'"
                rows="3"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">What angle should the pitch emphasize?</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Name *</label>
                <input
                  type="text"
                  name="yourName"
                  value={formData.yourName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Portfolio URL *</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">TikTok Handle *</label>
                <input
                  type="text"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {loadingStep || 'Generating...'}
                </>
              ) : (
                '🚀 Generate Pitch'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
              {error}
            </div>
          )}

          {pitch && (
            <div className="mt-8 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">✨ Your Pitch</h2>
                <button
                  onClick={copyPitch}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-xl p-6 whitespace-pre-wrap leading-relaxed">
                {pitch}
              </div>

              {research && (
                <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-lg font-bold mb-3">📊 Research Summary</h3>
                  <div className="text-sm space-y-2 text-gray-300">
                    <p><strong>Brand:</strong> {research.brand.brandName}</p>
                    <p><strong>Industry:</strong> {research.brand.industry}</p>
                    <p><strong>Style:</strong> {research.brand.brandStyle}</p>
                    {research.competitors.competitors.length > 0 && (
                      <p><strong>Competitors:</strong> {research.competitors.competitors.map(c => c.name).join(', ')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}