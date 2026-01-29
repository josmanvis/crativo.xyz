# Auditing Your Site

This project includes scripts to run Lighthouse audits to measure performance, accessibility, best practices, and SEO.

## Running Audits

### Local Audit
To audit your local development server:
```bash
npm run dev
# In another terminal:
npm run audit-local
```

### Production Audit
To audit the production site:
```bash
npm run audit
```

## Improvements Made

The following improvements have been made to achieve better Lighthouse scores:

### Performance
- Added preconnect hints for external domains
- Optimized image loading with proper `sizes` attribute
- Improved script loading strategies

### Accessibility
- Added proper ARIA attributes to navigation
- Improved semantic HTML structure
- Added ARIA labels and roles where needed
- Enhanced keyboard navigation support

### SEO
- Enhanced metadata with additional Open Graph properties
- Added canonical URLs and alternate language options
- Improved structured data (JSON-LD)

### Best Practices
- Improved security headers
- Enhanced PWA capabilities
- Better resource loading strategies

## Expected Results

After implementing these changes, your site should see improvements in:
- Performance: Better resource loading and optimization
- Accessibility: Proper semantic markup and ARIA attributes
- SEO: Enhanced metadata and structured data
- Best Practices: Improved security and privacy practices

Run the audit commands above to see your updated scores!