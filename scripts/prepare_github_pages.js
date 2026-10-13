const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const viewsDir = path.join(rootDir, 'views');
const publicDir = path.join(rootDir, 'public');

console.log('--- Preparing Repository for GitHub Pages Static Deployment ---');

// Helper to update normalizeProductImagePath
function updateImageNormalizer(filePath) {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Replace existing normalizeProductImagePath
    const regex = /function\s+normalizeProductImagePath\s*\([^)]*\)\s*\{[\s\S]*?return\s+[`'"]\/images\/[^;]+;\s*\}/;
    
    const replacement = `function normalizeProductImagePath(image) {
    let value = String(image || "").trim();
    if (!value) value = "tshirt1.jpg";
    if (value.startsWith("http://") || value.startsWith("https://")) return value;

    const isStaticDeploy = (typeof window !== "undefined") && (
        window.location.hostname.endsWith("github.io") ||
        window.location.protocol === "file:"
    );
    const cleanPath = value.replace(/^\\/+/, "");

    if (isStaticDeploy) {
        if (cleanPath.startsWith("public/")) return "./" + cleanPath;
        if (cleanPath.startsWith("images/")) return "./public/" + cleanPath;
        return "./public/images/" + cleanPath;
    }

    if (cleanPath.startsWith("public/images/")) return "/" + cleanPath.slice(7);
    if (cleanPath.startsWith("images/")) return "/" + cleanPath;
    return "/images/" + cleanPath;
}`;

    if (regex.test(code)) {
        code = code.replace(regex, replacement);
        fs.writeFileSync(filePath, code, 'utf8');
        console.log('Updated normalizeProductImagePath in:', path.basename(filePath));
    } else {
        console.log('Regex did not match in:', path.basename(filePath));
    }
}

// 1. Update JS files
updateImageNormalizer(path.join(publicDir, 'js', 'products.js'));
updateImageNormalizer(path.join(publicDir, 'js', 'product-details.js'));
updateImageNormalizer(path.join(publicDir, 'js', 'script.js'));

// 2. Add fallback products to script.js if needed
const scriptJsPath = path.join(publicDir, 'js', 'script.js');
let scriptJs = fs.readFileSync(scriptJsPath, 'utf8');
if (!scriptJs.includes('DEFAULT_FALLBACK_PRODUCTS')) {
    const productsJs = fs.readFileSync(path.join(publicDir, 'js', 'products.js'), 'utf8');
    const fallbackMatch = productsJs.match(/const DEFAULT_FALLBACK_PRODUCTS = \[[\s\S]*?\];/);
    if (fallbackMatch) {
        scriptJs = fallbackMatch[0] + '\n\n' + scriptJs;
        
        // Update getProducts catch block
        scriptJs = scriptJs.replace(
            /catch\s*\(\s*error\s*\)\s*\{[\s\S]*?console\.error\(\s*["']Product API Error:["']\s*,\s*error\s*\);[\s\S]*?\}/,
            `catch (error) {
        console.warn("Product API offline / static mode, using fallback:", error);
        if (typeof DEFAULT_FALLBACK_PRODUCTS !== "undefined" && Array.isArray(DEFAULT_FALLBACK_PRODUCTS)) {
            if (trendingContainer || newArrivalsContainer || customerFavoritesContainer) {
                populateHomeSections(DEFAULT_FALLBACK_PRODUCTS);
            }
            if (productContainer) {
                displayProducts(DEFAULT_FALLBACK_PRODUCTS);
            }
        }
    }`
        );
        fs.writeFileSync(scriptJsPath, scriptJs, 'utf8');
        console.log('Added DEFAULT_FALLBACK_PRODUCTS and catch handler to script.js');
    }
}

// 3. Synchronize views/*.html to root directory for GitHub Pages
const viewFiles = fs.readdirSync(viewsDir).filter(f => f.endsWith('.html'));

viewFiles.forEach(file => {
    const srcPath = path.join(viewsDir, file);
    const destPath = path.join(rootDir, file);
    
    let content = fs.readFileSync(srcPath, 'utf8');
    
    // Convert relative paths from views-level (../public/) to root-level (./public/)
    content = content.replace(/\.\.\/public\//g, './public/');
    
    // Also add ./public/ alongside /public/ or /css/ or /js/ if needed
    // In root HTML files, paths like href="/css/style.css" should have relative fallback href="./public/css/style.css"
    // Since ../public/ was replaced by ./public/, any <link href="../public/css/..."> is now <link href="./public/css/...">!
    
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`Synced views/${file} -> ${file} (${content.length} bytes)`);
});

console.log('--- GitHub Pages Preparation Complete ---');
