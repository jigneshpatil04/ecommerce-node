/**
 * product-specs-helper.js
 * Comprehensive Product Details Specification & Smart Analyzer
 * Matches Amazon-style Product Details (Top Highlights, About This Item, Additional Info)
 */

(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        module.exports = factory();
    } else {
        root.ProductSpecsHelper = factory();
    }
})(typeof self !== "undefined" ? self : this, function () {

    /**
     * Intelligently analyzes product name, category, and description
     * to generate realistic, category-specific product specifications.
     */
    function analyzeProductDetails(product) {
        if (!product) product = {};

        const rawName = String(product.name || "").trim();
        const rawCategory = String(product.category || "").trim();
        const rawDesc = String(product.description || "").trim();
        const combined = `${rawName} ${rawCategory} ${rawDesc}`.toLowerCase();

        // 1. Detect category / garment type
        const isPolo = combined.includes("polo") || combined.includes("collar tee");
        const isTShirt = combined.includes("t-shirt") || combined.includes("tshirt") || combined.includes("tee");
        const isShirt = combined.includes("shirt") && !isTShirt && !isPolo;
        const isJeans = combined.includes("jean") || combined.includes("denim");
        const isPants = combined.includes("pant") || combined.includes("cargo") || combined.includes("chino") || combined.includes("trouser");
        const isJacket = combined.includes("jacket") || combined.includes("coat") || combined.includes("blazer");
        const isHoodie = combined.includes("hoodie") || combined.includes("sweatshirt");
        const isShorts = combined.includes("short");
        const isShoes = combined.includes("shoe") || combined.includes("sneaker") || combined.includes("loafer") || combined.includes("boot");

        let specs = {
            highlights: {},
            about: [],
            additional: {},
            style: {},
            itemDetails: {}
        };

        if (isPolo) {
            specs.highlights = {
                "Material composition": "100% Cotton",
                "Fit type": "Slim Fit",
                "Sleeve type": "Half Sleeve",
                "Collar style": "Polo Collar",
                "Length": "Standard Length",
                "Neck style": "Round Neck",
                "Country of Origin": "India"
            };
            specs.about = [
                "Hemline: Side slit for added comfort and ease of movement",
                "Cuff & Collar Type: Contrast rib and solid rib collar for a stylish finish",
                "Placket Type: 3-button placket for a classic polo look",
                "Premium Fabric: Crafted from high-end pique in DCH cotton for superior softness and durability",
                "Design: Cut & sew construction with color-blocked shoulder for a modern, sporty appeal"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Item Weight": "300 g",
                "Item Dimensions LxWxH": "27.5 x 22.5 x 3 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": "T-Shirt"
            };
        } else if (isTShirt) {
            specs.highlights = {
                "Material composition": "100% Combed Cotton (180 GSM)",
                "Fit type": "Regular Fit",
                "Sleeve type": "Half Sleeve",
                "Collar style": "Ribbed Crew Collar",
                "Length": "Standard Length",
                "Neck style": "Round Neck",
                "Country of Origin": "India"
            };
            specs.about = [
                "Premium Fabric: 100% combed cotton jersey offering supreme breathability and cloud-soft hand feel",
                "Neckline: Reinforced dual-stitched crew neck that retains structural shape wash after wash",
                "Durability: Bio-washed and pre-shrunk fabric to prevent post-wash shrinkage and pilling",
                "Style: Minimalist versatile silhouette ideal for everyday casual wear and layering",
                "Care Instructions: Machine wash cold with like colors, gentle cycle, tumble dry low"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Item Weight": "220 g",
                "Item Dimensions LxWxH": "26 x 21 x 2.5 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": "T-Shirt"
            };
        } else if (isShirt) {
            specs.highlights = {
                "Material composition": "100% Pure Cotton",
                "Fit type": "Slim Fit",
                "Sleeve type": "Full Sleeve",
                "Collar style": "Spread Collar",
                "Length": "Standard Length",
                "Neck style": "Collared",
                "Country of Origin": "India"
            };
            specs.about = [
                "Fabric: High-thread-count breathable cotton weave for premium comfort and formal sharpness",
                "Cuffs: 2-button adjustable angled cuffs with buttoned gauntlet for custom sleeve styling",
                "Collar: Stiffened spread collar with fused interlining that stays crisp all day",
                "Hemline: Curved shirttail hem tailored to stay neatly tucked in or worn relaxed untucked",
                "Occasion: Perfect for office, business meetings, evening dinners, and formal gatherings"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Item Weight": "340 g",
                "Item Dimensions LxWxH": "29 x 24 x 3.5 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": "Shirt"
            };
        } else if (isJeans) {
            specs.highlights = {
                "Material composition": "98% Cotton, 2% Elastane",
                "Fit type": "Slim Tapered Fit",
                "Rise style": "Mid Rise",
                "Closure type": "Zip Fly with Shank Button",
                "Length": "Full Length",
                "Country of Origin": "India"
            };
            specs.about = [
                "Fabric: Premium 12.5 oz ring-spun denim with 2-way stretch for flexible unrestricted movement",
                "Pockets: Classic 5-pocket architecture reinforced with antiqued copper rivets at tension points",
                "Wash: Artisan enzyme wash with hand-crafted whiskering and subtle sanding accents",
                "Waistband: Ergonomic curved waistband engineered to eliminate back-gap when sitting",
                "Durability: Reinforced double-needle chain stitching along inseam for enduring wear"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Item Weight": "650 g",
                "Item Dimensions LxWxH": "34 x 28 x 4 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": "Jeans"
            };
        } else if (isPants) {
            specs.highlights = {
                "Material composition": "97% Cotton Twill, 3% Spandex",
                "Fit type": "Straight Cargo Fit",
                "Rise style": "Mid Rise",
                "Closure type": "Button and Zip",
                "Length": "Full Length",
                "Country of Origin": "India"
            };
            specs.about = [
                "Fabric: Heavy-duty stretch cotton twill combining rugged durability with flex comfort",
                "Pockets: 6 functional multi-utility pockets including flap cargo side pockets",
                "Gusset: Articulated knee panels and reinforced seat for active mobility",
                "Style: Casual utilitarian aesthetic designed for weekend adventures and streetwear"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Item Weight": "520 g",
                "Item Dimensions LxWxH": "33 x 26 x 3.5 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": "Trousers"
            };
        } else if (isJacket || isHoodie) {
            specs.highlights = {
                "Material composition": "80% Cotton, 20% Polyester Fleece (320 GSM)",
                "Fit type": "Regular Fit",
                "Sleeve type": "Long Sleeve",
                "Closure type": isJacket ? "Full Metal Zipper" : "Pullover",
                "Collar style": isHoodie ? "Hooded with Drawstrings" : "Stand Collar",
                "Length": "Standard Hip Length",
                "Country of Origin": "India"
            };
            specs.about = [
                "Insulation: Brushed interior fleece lining providing plush warmth and thermal insulation",
                "Ribbing: 2x2 elastane ribbed cuffs and hem that seal in body heat and retain shape",
                "Pockets: Deep split kangaroo pockets for cozy hand warmth and secure everyday carry",
                "Hood: Double-layered contour hood with durable metal-tipped drawstrings"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Item Weight": "580 g",
                "Item Dimensions LxWxH": "32 x 26 x 5 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": isJacket ? "Jacket" : "Hoodie"
            };
        } else if (isShorts) {
            specs.highlights = {
                "Material composition": "100% Breathable Cotton",
                "Fit type": "Regular Fit",
                "Closure type": "Elastic Waistband with Drawstring",
                "Length": "Above Knee Length",
                "Country of Origin": "India"
            };
            specs.about = [
                "Fabric: Lightweight airy loopback French terry cotton for active lounging and workouts",
                "Waistband: Wide soft elastic band with adjustable exterior drawcord for custom fit",
                "Pockets: Deep side seam pockets with secure back patch pocket"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Item Weight": "260 g",
                "Item Dimensions LxWxH": "25 x 20 x 2 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": "Shorts"
            };
        } else if (isShoes) {
            specs.highlights = {
                "Material composition": "Breathable Mesh / Synthetic Leather",
                "Sole material": "Cushioned EVA & Anti-Slip Rubber",
                "Closure type": "Lace-Up",
                "Heel type": "Flat",
                "Country of Origin": "India"
            };
            specs.about = [
                "Insole: High-density memory foam footbed provides cloud-like shock absorption",
                "Outsole: Multi-directional traction rubber lug pattern for slip resistance",
                "Upper: Hydrophobic breathable knitted mesh keeps feet dry and odor-free"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL Footwear Div, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Item Weight": "750 g",
                "Item Dimensions LxWxH": "32 x 20 x 12 Centimeters",
                "Net Quantity": "1 Pair",
                "Generic Name": "Footwear"
            };
        } else {
            // General apparel fallback
            specs.highlights = {
                "Material composition": "100% Cotton",
                "Fit type": "Regular Fit",
                "Sleeve type": "Standard",
                "Length": "Standard Length",
                "Country of Origin": "India"
            };
            specs.about = [
                "Premium Fabric: Crafted with high-grade materials for enduring durability and daily comfort",
                "Finishing: Detailed craftsmanship with precision stitching and reinforced seams",
                "Care: Machine wash cold with similar colors"
            ];
            specs.additional = {
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Item Weight": "300 g",
                "Item Dimensions LxWxH": "28 x 22 x 3 Centimeters",
                "Net Quantity": "1 Count",
                "Generic Name": rawName || "Apparel"
            };
        }

        // Detect or choose primary color
        let detectedColor = "";
        if (product.selectedColor && String(product.selectedColor).trim()) {
            detectedColor = String(product.selectedColor).trim();
        } else if (product.activeColor && String(product.activeColor).trim()) {
            detectedColor = String(product.activeColor).trim();
        } else if (product.color && String(product.color).trim()) {
            detectedColor = String(product.color).trim();
        } else if (Array.isArray(product.colors) && product.colors.length > 0) {
            detectedColor = typeof product.colors[0] === "string" ? product.colors[0] : (product.colors[0].name || "");
        } else if (typeof product.colors === "string" && product.colors.trim()) {
            try {
                const parsed = JSON.parse(product.colors);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    detectedColor = typeof parsed[0] === "string" ? parsed[0] : (parsed[0].name || "");
                }
            } catch (e) {
                detectedColor = product.colors.split(",")[0].trim();
            }
        } else if (Array.isArray(product.variants) && product.variants.length > 0) {
            const vColor = product.variants.find(function (v) { return v && v.color; });
            if (vColor) detectedColor = vColor.color;
        }

        if (!detectedColor) {
            const commonColors = ["White", "Black", "Navy", "Blue", "Red", "Green", "Grey", "Yellow", "Pink", "Beige", "Olive", "Maroon", "Brown"];
            for (const c of commonColors) {
                if (combined.includes(c.toLowerCase())) {
                    detectedColor = c;
                    break;
                }
            }
        }

        if (!detectedColor) {
            detectedColor = "White";
        }

        const brandName = product.brand || "Louis Philippe";
        const modelName = rawName || (isPolo ? "LR Tshirt- 22_Best seller repeat: Shoulder colour block" : "Classic Apparel");
        const prodIdCode = product.id ? String(product.id).padStart(5, "0") : "25183";
        const styleNum = "LRKPNSLBZ" + prodIdCode;
        const gtinNum = "0890915" + (product.id ? String(product.id).padStart(7, "0") : "8788810");
        const partNum = "LRKPNSLF" + (product.id ? String(product.id).padStart(6, "0") : "475219") + "_L";
        const asinNum = "B0D4V" + (product.id ? String(product.id).padStart(5, "0") : "PH1YB");

        let styleObj = {};
        let itemDetailsObj = {};

        if (isPolo) {
            styleObj = {
                "Colour": detectedColor,
                "Fitting type": "Slim Fit",
                "Style Name": "Modern",
                "Neck Style": "Round Neck",
                "Sleeve Type": "Half Sleeve",
                "Shirt Form Type": "T-Shirt",
                "Collar Style": "Polo Collar",
                "Pattern": "Solid",
                "top-style": "Polo",
                "Season": "Spring",
                "Apparel Closure Type": "Pull On",
                "Cuff Style": "Ribbed Cuff",
                "Apparel Occasion and Lifestyle": "Casual",
                "Back Style": "T Back"
            };
            itemDetailsObj = {
                "Brand Name": brandName,
                "Model Name": modelName,
                "Style Number": styleNum,
                "Unit Count": "1 Count",
                "Country Of Origin": "India",
                "Global Trade Identification Number": gtinNum,
                "number-of-items": "1",
                "Age Range Description": "Adult",
                "Item Type Name": "T-Shirt",
                "Item Weight": "300 Grams",
                "Manufacturer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Packer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer Part Number": partNum,
                "Best Sellers Rank": "#73 in Clothing & Accessories (See Top 100 in Clothing & Accessories) | #10 in Men's Polos",
                "ASIN": asinNum
            };
        } else if (isTShirt) {
            styleObj = {
                "Colour": detectedColor,
                "Fitting type": "Regular Fit",
                "Style Name": "Casual",
                "Neck Style": "Round Neck",
                "Sleeve Type": "Half Sleeve",
                "Shirt Form Type": "T-Shirt",
                "Collar Style": "Ribbed Crew Collar",
                "Pattern": "Solid",
                "top-style": "T-Shirt",
                "Season": "All Season",
                "Apparel Closure Type": "Pull On",
                "Cuff Style": "Regular Cuff",
                "Apparel Occasion and Lifestyle": "Casual",
                "Back Style": "Solid"
            };
            itemDetailsObj = {
                "Brand Name": brandName,
                "Model Name": modelName,
                "Style Number": styleNum,
                "Unit Count": "1 Count",
                "Country Of Origin": "India",
                "Global Trade Identification Number": gtinNum,
                "number-of-items": "1",
                "Age Range Description": "Adult",
                "Item Type Name": "T-Shirt",
                "Item Weight": "220 Grams",
                "Manufacturer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Packer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer Part Number": partNum,
                "Best Sellers Rank": "#45 in Clothing & Accessories (See Top 100 in Clothing & Accessories) | #15 in Men's T-Shirts",
                "ASIN": asinNum
            };
        } else if (isShirt) {
            styleObj = {
                "Colour": detectedColor,
                "Fitting type": "Slim Fit",
                "Style Name": "Formal / Business Casual",
                "Neck Style": "Collared",
                "Sleeve Type": "Full Sleeve",
                "Shirt Form Type": "Shirt",
                "Collar Style": "Spread Collar",
                "Pattern": "Solid",
                "top-style": "Button Down",
                "Season": "All Season",
                "Apparel Closure Type": "Button",
                "Cuff Style": "Button Cuff",
                "Apparel Occasion and Lifestyle": "Formal",
                "Back Style": "Yoke"
            };
            itemDetailsObj = {
                "Brand Name": brandName,
                "Model Name": modelName,
                "Style Number": styleNum,
                "Unit Count": "1 Count",
                "Country Of Origin": "India",
                "Global Trade Identification Number": gtinNum,
                "number-of-items": "1",
                "Age Range Description": "Adult",
                "Item Type Name": "Shirt",
                "Item Weight": "340 Grams",
                "Manufacturer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Packer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer Part Number": partNum,
                "Best Sellers Rank": "#82 in Clothing & Accessories (See Top 100 in Clothing & Accessories) | #22 in Men's Shirts",
                "ASIN": asinNum
            };
        } else if (isJeans) {
            styleObj = {
                "Colour": detectedColor,
                "Fitting type": "Slim Tapered Fit",
                "Style Name": "Modern Denim",
                "Neck Style": "N/A",
                "Sleeve Type": "N/A",
                "Shirt Form Type": "Jeans",
                "Collar Style": "N/A",
                "Pattern": "Washed",
                "top-style": "Jeans",
                "Season": "All Season",
                "Apparel Closure Type": "Zip Fly with Button",
                "Cuff Style": "Hemmed Cuff",
                "Apparel Occasion and Lifestyle": "Casual",
                "Back Style": "5-Pocket"
            };
            itemDetailsObj = {
                "Brand Name": brandName,
                "Model Name": modelName,
                "Style Number": styleNum,
                "Unit Count": "1 Count",
                "Country Of Origin": "India",
                "Global Trade Identification Number": gtinNum,
                "number-of-items": "1",
                "Age Range Description": "Adult",
                "Item Type Name": "Jeans",
                "Item Weight": "650 Grams",
                "Manufacturer Contact Information": "ABFRL Denim Div, Mumbai-400059",
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer Contact Information": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Manufacturer Part Number": partNum,
                "Best Sellers Rank": "#60 in Clothing & Accessories | #8 in Men's Jeans",
                "ASIN": asinNum
            };
        } else {
            // General apparel fallback
            styleObj = {
                "Colour": detectedColor,
                "Fitting type": "Regular Fit",
                "Style Name": "Modern",
                "Neck Style": "Round Neck",
                "Sleeve Type": "Standard",
                "Shirt Form Type": "Apparel",
                "Collar Style": "Classic",
                "Pattern": "Solid",
                "top-style": "Casual",
                "Season": "All Season",
                "Apparel Closure Type": "Standard",
                "Cuff Style": "Regular",
                "Apparel Occasion and Lifestyle": "Casual",
                "Back Style": "Solid"
            };
            itemDetailsObj = {
                "Brand Name": brandName,
                "Model Name": modelName,
                "Style Number": styleNum,
                "Unit Count": "1 Count",
                "Country Of Origin": "India",
                "Global Trade Identification Number": gtinNum,
                "number-of-items": "1",
                "Age Range Description": "Adult",
                "Item Type Name": rawCategory || "Apparel",
                "Item Weight": "300 Grams",
                "Manufacturer Contact Information": "Aditya Birla Fashion & Retail Ltd, 7th Flr, Skyline Ikon Business Park, AK Road, Andheri East, Mumbai-400059",
                "Manufacturer": "ABFRL, Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Packer Contact Information": "Aditya Birla Fashion & Retail Ltd, Mumbai-400059",
                "Manufacturer Part Number": partNum,
                "Best Sellers Rank": "#100 in Clothing & Accessories",
                "ASIN": asinNum
            };
        }

        specs.style = styleObj;
        specs.itemDetails = itemDetailsObj;

        // 2. If the product already has stored product_details (e.g. from admin side), merge them!
        if (product.product_details) {
            let custom = product.product_details;
            if (typeof custom === "string") {
                try { custom = JSON.parse(custom); } catch (e) { custom = null; }
            }
            if (custom && typeof custom === "object") {
                if (custom.highlights && typeof custom.highlights === "object") {
                    specs.highlights = { ...specs.highlights, ...custom.highlights };
                }
                if (Array.isArray(custom.about) && custom.about.length > 0) {
                    specs.about = custom.about;
                }
                if (custom.additional && typeof custom.additional === "object") {
                    specs.additional = { ...specs.additional, ...custom.additional };
                }
                if (custom.style && typeof custom.style === "object") {
                    specs.style = { ...specs.style, ...custom.style };
                }
                if (custom.itemDetails && typeof custom.itemDetails === "object") {
                    specs.itemDetails = { ...specs.itemDetails, ...custom.itemDetails };
                }
            }
        }

        if (product.selectedColor && specs.style) {
            specs.style["Colour"] = product.selectedColor;
        }

        return specs;
    }

    return {
        analyzeProductDetails: analyzeProductDetails
    };
});
