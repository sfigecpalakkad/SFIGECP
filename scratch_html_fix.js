const fs = require('fs');

const files = [
  'index.html',
  'keam2026/index.html',
  'keam2026/mocktest/index.html',
  'sahayi/index.html',
  'sahayi/notes.html',
  'sahayi/qnpapers.html',
  'sahayi/scholarship.html'
];

const cdnMap = {
  'assets/vendor/bootstrap/css/bootstrap.min.css': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous',
  'assets/vendor/bootstrap-icons/bootstrap-icons.css': 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'assets/vendor/aos/aos.css': 'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'assets/vendor/glightbox/css/glightbox.min.css': 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css',
  'assets/vendor/swiper/swiper-bundle.min.css': 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'assets/vendor/bootstrap/js/bootstrap.bundle.min.js': 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmxc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous',
  'assets/vendor/aos/aos.js': 'https://unpkg.com/aos@2.3.1/dist/aos.js',
  'assets/vendor/typed.js/typed.umd.js': 'https://cdn.jsdelivr.net/npm/typed.js@2.1.0/dist/typed.umd.js',
  'assets/vendor/waypoints/noframework.waypoints.js': 'https://cdnjs.cloudflare.com/ajax/libs/waypoints/4.0.1/noframework.waypoints.min.js',
  'assets/vendor/swiper/swiper-bundle.min.js': 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js',
  'assets/vendor/glightbox/js/glightbox.min.js': 'https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js',
  'assets/vendor/imagesloaded/imagesloaded.pkgd.min.js': 'https://unpkg.com/imagesloaded@5/imagesloaded.pkgd.min.js',
  'assets/vendor/isotope-layout/isotope.pkgd.min.js': 'https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js',
  'assets/vendor/purecounter/purecounter_vanilla.js': 'https://cdn.jsdelivr.net/npm/@srexi/purecounterjs/dist/purecounter_vanilla.js'
};

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log("Missing:", file);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');

  // Fix CDNs
  for (const [local, remote] of Object.entries(cdnMap)) {
    // The prefix depends on subdirectory depth
    const prefix = file === 'index.html' ? '' : file.includes('mocktest') ? '../../' : '../';
    const findStr = prefix + local;
    content = content.replace(new RegExp(findStr.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'g'), remote);
  }

  // Fix target="_blank" without rel="noopener noreferrer"
  content = content.replace(/target="_blank"(?!\s+rel="noopener noreferrer")/g, 'target="_blank" rel="noopener noreferrer"');

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
console.log('Done');
