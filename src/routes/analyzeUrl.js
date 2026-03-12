router.post('/url', async (req, res) => {
  const { url, projectType = 'general web app', framework = 'react' } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 🔴 TEMP: skip screenshot + Lighthouse while debugging
    const report = {
      url,
      screenshotUrl: null,
      scores: {
        ux: 85,
        accessibility: 82,
        performance: 75
      },
      issues: [
        {
          id: 'nav-visibility',
          type: 'ux',
          title: 'Navigation may not be prominent enough',
          severity: 'medium',
          description: 'Top navigation might not stand out clearly.',
          suggestion: 'Increase contrast and spacing for primary navigation items.'
        }
      ],
      accessibility: [
        {
          id: 'color-contrast',
          rule: 'color-contrast',
          description: 'Low contrast detected',
          severity: 'medium'
        }
      ],
      aiSuggestions: [
        'Improve color contrast on primary buttons.',
        'Increase tap target size for mobile navigation.'
      ],
      meta: { projectType, framework }
    };

    return res.json(report);
  } catch (error) {
    console.error('Error in /analyze/url:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
