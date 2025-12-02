# SFI GEC Palakkad - Study Companion Portal

A modern, production-ready multi-page website featuring **Sahayi** - a comprehensive study companion portal for students at Government Engineering College, Palakkad.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Features

✅ **Multi-Page Architecture** – Department & Semester-based navigation  
✅ **Google Drive Integration** – Direct links to study materials  
✅ **Data-Driven System** – JSON manifest for easy content updates  
✅ **Production-Ready** – SEO optimization, security headers, performance tuned  
✅ **Responsive Design** – Mobile-first, works on all devices  
✅ **Vercel Optimized** – One-click deployment & auto-scaling  
✅ **Fast Performance** – Optimized assets & caching strategies  

## 📁 Project Structure

```
.
├── index.html                    # Homepage
├── sahayi/
│   ├── index.html               # Sahayi hub - main entry point
│   ├── notes.html               # Study notes by department
│   ├── qnpapers.html            # Question papers by semester
│   └── scholarship.html         # Scholarships & financial aid
├── assets/
│   ├── css/
│   │   ├── main.css             # Main styles (existing)
│   │   └── sahayi.css           # Sahayi component styles
│   ├── js/
│   │   ├── main.js              # Main scripts (existing)
│   │   └── sahayi.js            # Data loader & navigation
│   ├── data/
│   │   └── sahayi.json          # Resource manifest (departments, semesters, links)
│   ├── img/                     # Images & media
│   └── vendor/                  # Third-party libraries (Bootstrap, AOS, etc.)
├── public/
│   ├── robots.txt               # Search engine directives
│   └── sitemap.xml              # SEO sitemap
├── .github/workflows/
│   └── deploy.yml               # GitHub Actions CI/CD for Vercel
├── vercel.json                  # Vercel deployment config
├── package.json                 # Dependencies & scripts
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm (or use Python for local server)
- Git (for version control)

### Local Development

```bash
# Install dependencies
npm install

# Start local development server (opens at http://localhost:3000)
npm start

# Or use Python if Node not available
python -m http.server 8000
```

Then open http://localhost:3000 in your browser.

## 📚 Data Management

### Update Study Resources

Edit `assets/data/sahayi.json` to add/update notes, question papers, and scholarships:

```json
{
  "resources": {
    "notes": [
      {
        "id": "s1-cse-math1",
        "title": "Mathematics for Information Science-1",
        "semester": "S1",
        "department": "cse",
        "type": "note",
        "gdrive_url": "https://drive.google.com/drive/folders/..."
      }
    ]
  }
}
```

**Departments:** `cse`, `it`, `ece`, `eee`, `civil`, `mech`  
**Semesters:** `S1` through `S8`  
**Resource Types:** `note`, `qnpaper`, `scholarship`

## 🌐 Navigation Flow

```
Homepage
    ↓
Sahayi Hub (/sahayi/)
    ├── Study Notes (/sahayi/notes.html)
    │   ├── Select Department
    │   ├── Select Semester
    │   └── Open Google Drive
    ├── Question Papers (/sahayi/qnpapers.html)
    │   ├── Select Department
    │   ├── Select Semester
    │   └── Open Google Drive
    └── Scholarships (/sahayi/scholarship.html)
```

## 🔧 Deployment to Vercel

### Method 1: GitHub → Vercel (Recommended)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Select your repository
   - Vercel auto-detects settings (no build command needed)
   - Click "Deploy"

3. **Auto-Deployment:**
   - Every push to `main` branch triggers auto-deploy to production
   - Pull requests deploy to preview URLs

### Method 2: Manual Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Deploy to production
vercel --prod
```

## 🔐 Security & Performance

### Built-in Security Features
- ✅ HTTPS by default (Vercel)
- ✅ Security headers (CSP, X-Frame-Options, X-XSS-Protection)
- ✅ Referrer policy configured
- ✅ External links with `rel="noopener noreferrer"`
- ✅ No inline script execution

### Performance Optimizations
- ✅ Static file caching (1 year for assets)
- ✅ HTML caching (1 hour)
- ✅ Gzip compression (automatic on Vercel)
- ✅ Minified CSS/JS in production
- ✅ Lazy-loaded images

### SEO Features
- ✅ Meta descriptions on all pages
- ✅ Open Graph tags for social sharing
- ✅ `robots.txt` for search engines
- ✅ `sitemap.xml` for indexing
- ✅ Semantic HTML structure
- ✅ Mobile-friendly responsive design

## 📊 Google Search Console Setup

1. **Add site to Google Search Console:**
   - Go to [Google Search Console](https://search.google.com/search-console/)
   - Click "URL prefix" and enter your domain
   - Verify ownership (via DNS or HTML file)

2. **Submit sitemap:**
   - Go to Sitemaps section
   - Add `https://your-domain.vercel.app/sitemap.xml`
   - Google will crawl and index pages

3. **Monitor & Improve:**
   - Check "Performance" tab for search traffic
   - Fix any crawl errors reported
   - Monitor which pages are indexed
   - Submit URLs for faster indexing

## 🛠️ Maintenance

### Adding New Study Materials

1. Get the Google Drive folder link
2. Edit `assets/data/sahayi.json`
3. Add new resource entry with correct department & semester
4. Commit and push to GitHub
5. Vercel auto-deploys within seconds

### Updating Content

- **Homepage:** Edit `index.html`
- **Sahayi pages:** Edit corresponding `sahayi/*.html` files
- **Styles:** Update `assets/css/main.css` or `assets/css/sahayi.css`
- **JavaScript:** Update `assets/js/main.js` or `assets/js/sahayi.js`

### Rollback

If something breaks:
```bash
git log --oneline
git revert <commit-hash>
git push origin main
# Vercel automatically redeploys the previous working version
```

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 🎨 Customization

### Change Color Scheme

Edit `assets/css/main.css`:
```css
:root {
  --accent-color: #149ddd;        /* Change this */
  --heading-color: #050d18;       /* And this */
  /* ... other variables ... */
}
```

### Add New Departments

Update `assets/data/sahayi.json`:
```json
{
  "departments": [
    { "id": "new-dept", "name": "New Department", "icon": "bi-star" }
  ]
}
```

### Modify Navigation

Edit header in `sahayi/*.html` files or update `assets/js/main.js`

## 📞 Contact & Support

- **Email:** sfigecpalakkad01@gmail.com
- **Phone:** +91 7994134028
- **Facebook:** [@sfigecpkd](https://www.facebook.com/sfigecpkd)
- **Instagram:** [@sfigecp](https://www.instagram.com/sfigecp)
- **WhatsApp:** [Chat](http://wa.me/+917994134028)

## 📝 License

© 2025 SFI GEC Palakkad. All rights reserved.  
Licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Analytics & Monitoring

### View Vercel Analytics
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View real-time stats, performance metrics, and logs

### Monitor Performance
- Check Core Web Vitals in Google Search Console
- Use [PageSpeed Insights](https://pagespeed.web.dev/) for optimization suggestions
- Monitor uptime with [UptimeRobot](https://uptimerobot.com/)

## 🐛 Troubleshooting

### Site not updating after push?
- Wait 30-60 seconds for Vercel deployment
- Check deployment status at vercel.com
- Clear browser cache (Ctrl+Shift+Del)

### Google Drive links not working?
- Verify folder is shared publicly
- Check URL is correct in `sahayi.json`
- Test link in incognito window

### Pages not showing up in Google Search?
- Submit sitemap to Google Search Console
- Wait 1-2 weeks for initial indexing
- Request indexing in Search Console for faster crawl

### Mobile layout looks off?
- Clear cache and refresh
- Test in different browsers
- Check viewport meta tag in HTML

## 🎯 Performance Benchmarks

Target metrics for production:
- ⚡ First Contentful Paint: < 2s
- ⚡ Largest Contentful Paint: < 2.5s
- ⚡ Cumulative Layout Shift: < 0.1
- 📊 Google PageSpeed Score: 90+

## 🔄 Version History

### v2.0.0 (Current)
- ✨ Multi-page Sahayi section
- ✨ Data-driven JSON manifest
- ✨ Production-ready configuration
- ✨ Vercel deployment setup
- ✨ SEO & security optimizations

### v1.0.0 (Original)
- Single-page prototype with inline accordion

---

**Made with ❤️ by SFI GEC Palakkad Students Federation**

Last updated: December 1, 2025
