// src/services/rule_validator.js
/**
 * Anti-Hallucination Engine: Cross-check AI issues against Lighthouse.
 * - Accessibility issues must roughly match a Lighthouse rule.
 * - Pure UX issues are allowed but marked as "ux-only".
 * - Prevents AI from inventing fake accessibility problems.
 */

function normalize(text) {
  if (!text) return '';
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Filter AI issues against Lighthouse accessibility issues.
 * @param {Array} aiIssues - from vision_analyzer.js or code_analyzer.js
 * @param {Array} lighthouseIssues - from lighthouseScan.js (accessibilityIssues)
 * @returns {Array} validated issues (hallucinations removed)
 */
function validateIssuesAgainstLighthouse(aiIssues, lighthouseIssues) {
  // Build set of known Lighthouse rule ids (normalized)
  const lhRules = new Set(
    (lighthouseIssues || []).map((issue) =>
      normalize(issue.rule || issue.id || ''),
    ),
  );

  const validated = [];

  for (const issue of aiIssues || []) {
    const type = issue.type || 'ux';
    const ruleHint = normalize(issue.rule || issue.title || issue.description);

    if (type === 'accessibility') {
      // Accessibility claims must have Lighthouse evidence
      const matches = [...lhRules].some(
        (lhRule) =>
          ruleHint && lhRule &&
          (lhRule.includes(ruleHint) || ruleHint.includes(lhRule)),
      );

      if (matches) {
        validated.push({ 
          ...issue, 
          source: 'ai+lh' // validated against Lighthouse
        });
        console.log(`✅ AI accessibility issue validated: ${issue.title}`);
      } else {
        console.log(
          `❌ Dropping AI accessibility hallucination: ${issue.title || issue.rule}`,
        );
      }
    } else {
      // Pure UX issues (Nielsen heuristics) are always allowed
      validated.push({ 
        ...issue, 
        source: 'ux-only' // not WCAG, but still valid UX advice
      });
      console.log(`✅ UX-only issue kept: ${issue.title}`);
    }
  }

  console.log(`🔍 Rule Validator: ${validated.length} issues validated from ${aiIssues.length} raw AI issues`);
  return validated;
}

module.exports = { validateIssuesAgainstLighthouse };