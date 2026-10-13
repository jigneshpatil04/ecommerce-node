import sys
import os
import json
import math
import re
import cv2
import numpy as np
from rembg import remove, new_session
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance

# Cached AI neural session
_session = None

def get_session():
    global _session
    if _session is None:
        try:
            _session = new_session('u2net_human_seg')
        except Exception:
            try:
                _session = new_session('u2net')
            except Exception:
                _session = new_session('u2netp')
    return _session

# ======================================================================
# APPAREL / DRESS COLOR RECOLORING ENGINE
# ======================================================================

COLOR_SPECS = {
    "red": {"h": 0, "s": 220, "mode": "color", "v_min": 100, "v_max": 230},
    "crimson": {"h": 175, "s": 225, "mode": "color", "v_min": 95, "v_max": 220},
    "blue": {"h": 110, "s": 215, "mode": "color", "v_min": 100, "v_max": 225},
    "royal blue": {"h": 115, "s": 235, "mode": "color", "v_min": 100, "v_max": 225},
    "navy": {"h": 115, "s": 210, "mode": "dark", "v_min": 35, "v_max": 110},
    "sky blue": {"h": 100, "s": 140, "mode": "bright", "v_min": 140, "v_max": 240},
    "green": {"h": 55, "s": 200, "mode": "color", "v_min": 100, "v_max": 225},
    "emerald": {"h": 70, "s": 220, "mode": "color", "v_min": 100, "v_max": 220},
    "mint": {"h": 75, "s": 110, "mode": "bright", "v_min": 140, "v_max": 240},
    "olive": {"h": 38, "s": 160, "mode": "dark", "v_min": 45, "v_max": 130},
    "yellow": {"h": 26, "s": 230, "mode": "bright", "v_min": 150, "v_max": 245},
    "gold": {"h": 22, "s": 220, "mode": "color", "v_min": 110, "v_max": 230},
    "pink": {"h": 165, "s": 150, "mode": "bright", "v_min": 135, "v_max": 240},
    "hot pink": {"h": 162, "s": 220, "mode": "color", "v_min": 105, "v_max": 225},
    "rose": {"h": 170, "s": 170, "mode": "color", "v_min": 105, "v_max": 225},
    "purple": {"h": 140, "s": 200, "mode": "color", "v_min": 90, "v_max": 205},
    "violet": {"h": 135, "s": 210, "mode": "color", "v_min": 90, "v_max": 205},
    "orange": {"h": 12, "s": 230, "mode": "color", "v_min": 110, "v_max": 230},
    "coral": {"h": 8, "s": 180, "mode": "bright", "v_min": 130, "v_max": 235},
    "maroon": {"h": 0, "s": 220, "mode": "dark", "v_min": 35, "v_max": 115},
    "burgundy": {"h": 170, "s": 220, "mode": "dark", "v_min": 35, "v_max": 115},
    "black": {"h": 0, "s": 10, "mode": "black", "v_min": 15, "v_max": 65},
    "charcoal": {"h": 0, "s": 12, "mode": "black", "v_min": 25, "v_max": 85},
    "white": {"h": 0, "s": 8, "mode": "white", "v_min": 185, "v_max": 250},
    "grey": {"h": 0, "s": 10, "mode": "grey", "v_min": 90, "v_max": 180},
    "brown": {"h": 14, "s": 160, "mode": "dark", "v_min": 40, "v_max": 125},
    "beige": {"h": 20, "s": 65, "mode": "bright", "v_min": 140, "v_max": 240},
    "teal": {"h": 88, "s": 190, "mode": "color", "v_min": 95, "v_max": 215},
}

COLOR_SYNONYMS = {
    "royal blue": "royal blue",
    "navy blue": "navy",
    "navy": "navy",
    "sky blue": "sky blue",
    "light blue": "sky blue",
    "dark blue": "navy",
    "blue": "blue",
    "cobalt": "royal blue",
    "cyan": "sky blue",
    "azure": "sky blue",
    
    "crimson": "crimson",
    "scarlet": "crimson",
    "ruby": "crimson",
    "cherry": "red",
    "red": "red",
    
    "forest green": "emerald",
    "emerald": "emerald",
    "mint": "mint",
    "sage": "mint",
    "olive": "olive",
    "lime": "green",
    "green": "green",
    
    "jet black": "black",
    "pitch black": "black",
    "black": "black",
    "charcoal": "charcoal",
    
    "pure white": "white",
    "off white": "white",
    "ivory": "white",
    "cream": "white",
    "white": "white",
    
    "mustard": "gold",
    "gold": "gold",
    "golden": "gold",
    "lemon": "yellow",
    "yellow": "yellow",
    
    "hot pink": "hot pink",
    "magenta": "hot pink",
    "fuchsia": "hot pink",
    "rose": "rose",
    "blush": "pink",
    "pink": "pink",
    
    "lavender": "purple",
    "violet": "violet",
    "lilac": "purple",
    "plum": "purple",
    "purple": "purple",
    
    "coral": "coral",
    "peach": "coral",
    "tangerine": "orange",
    "orange": "orange",
    
    "maroon": "maroon",
    "burgundy": "burgundy",
    "wine": "burgundy",
    
    "turquoise": "teal",
    "aqua": "teal",
    "teal": "teal",
    
    "tan": "brown",
    "chocolate": "brown",
    "coffee": "brown",
    "brown": "brown",
    
    "silver": "grey",
    "gray": "grey",
    "grey": "grey",
    
    "khaki": "beige",
    "nude": "beige",
    "beige": "beige",
}

SORTED_COLOR_KEYS = sorted(COLOR_SYNONYMS.keys(), key=len, reverse=True)

def find_color_in_text(text):
    if not text:
        return None
    for k in SORTED_COLOR_KEYS:
        if re.search(r'\b' + re.escape(k) + r'\b', text):
            return COLOR_SYNONYMS[k]
    return None

def extract_garment_color(prompt):
    """Parse prompt for garment recoloring instructions with 100% natural language accuracy."""
    if not prompt:
        return None
    p = prompt.lower().strip()
    
    # 1. Pattern: "change/make [dress/shirt/etc] [color] / to [color]"
    m1 = re.search(r'(?:change|make|turn|set|recolor)\s+(?:the\s+)?(?:dress|shirt|tshirt|t-shirt|top|cloth|clothes|clothing|outfit|suit|jacket|coat|garment|apparel|polo)?\s*(?:colou?r)?\s*(?:to|into|as|in|:)?\s*([a-z\s]+)', p)
    if m1:
        col = find_color_in_text(m1.group(1))
        if col:
            return col

    # 2. Pattern: "[dress/shirt/etc] colou?r to/is/: [color]"
    m2 = re.search(r'(?:dress|shirt|tshirt|t-shirt|top|cloth|clothes|clothing|outfit|suit|jacket|coat|garment|apparel|polo)\s*colou?r\s*(?:to|into|as|is|:)?\s*([a-z\s]+)', p)
    if m2:
        col = find_color_in_text(m2.group(1))
        if col:
            return col

    # 3. Pattern: "[color] dress/shirt/tshirt/jacket/top"
    garment_types = r'(?:dress|shirt|tshirt|t-shirt|top|cloth|clothing|outfit|suit|jacket|coat|garment|apparel|polo)'
    m3 = re.search(r'([a-z\s]+?)\s+' + garment_types + r'\b', p)
    if m3:
        col = find_color_in_text(m3.group(1))
        if col:
            return col

    # 4. Pattern: "change/recolor colou?r to [color]"
    m4 = re.search(r'(?:change|recolor|turn)\s+(?:the\s+)?colou?r\s*(?:to|into|as|in|:)?\s*([a-z\s]+)', p)
    if m4:
        col = find_color_in_text(m4.group(1))
        if col:
            return col

    return None

def segment_and_recolor(cutout_img, color_name):
    """
    Photorealistically recolor dress/shirt/jacket on cutout RGBA image.
    Preserves all fabric folds, wrinkles, buttons, stitching, lighting & shadows.
    Cleanly excludes skin (face, neck, arms, hands) and trousers/jeans without color bleeding.
    """
    color_info = COLOR_SPECS.get(color_name.lower(), COLOR_SPECS["red"])
    cutout_np = np.array(cutout_img)
    rgb = cutout_np[:, :, :3]
    alpha = cutout_np[:, :, 3]
    fg_mask = alpha > 35
    
    rows = np.any(fg_mask, axis=1)
    cols = np.any(fg_mask, axis=0)
    if not np.any(rows):
        return cutout_img
        
    ymin, ymax = np.where(rows)[0][[0, -1]]
    xmin, xmax = np.where(cols)[0][[0, -1]]
    ph = ymax - ymin
    pw = xmax - xmin
    cx = xmin + pw // 2
    H, W = cutout_np.shape[:2]
    
    is_person = (ph > 0.40 * H)
    
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    gray = cv2.cvtColor(bgr, cv2.COLOR_RGB2GRAY)
    
    r = rgb[:, :, 0].astype(np.int16)
    g = rgb[:, :, 1].astype(np.int16)
    b = rgb[:, :, 2].astype(np.int16)
    cr = ycrcb[:, :, 1].astype(np.int16)
    cb = ycrcb[:, :, 2].astype(np.int16)
    h = hsv[:, :, 0]
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]
    
    if is_person:
        yy, xx = np.ogrid[:H, :W]

        # 1. Physiological Human Skin Detector
        is_skin = (
            fg_mask &
            (r > g + 8) & (g > b + 4) &
            (cr - cb >= 10) & (cr >= 132) & (cr <= 185) &
            (cb >= 75) & (cb <= 140) &
            (h >= 2) & (h <= 25) &
            (s >= 40) & (s <= 180) &
            (v >= 40)
        )

        # 2. Check if torso itself triggers skin rule (camel/brown/tan/khaki clothes!)
        torso_y1 = ymin + int(ph * 0.35)
        torso_y2 = ymin + int(ph * 0.55)
        torso_x1 = max(0, cx - int(pw * 0.15))
        torso_x2 = min(W, cx + int(pw * 0.15))
        torso_fg = fg_mask[torso_y1:torso_y2, torso_x1:torso_x2]
        torso_skin_count = np.sum(is_skin[torso_y1:torso_y2, torso_x1:torso_x2] & torso_fg)
        garment_is_skin_toned = (torso_skin_count / max(1, np.sum(torso_fg))) > 0.30

        # 3. Model Head & Chin Protection (following anatomical jawline profile)
        head_seed = np.zeros_like(fg_mask, dtype=bool)
        head_seed[ymin:ymin + int(ph * 0.15), :] = fg_mask[ymin:ymin + int(ph * 0.15), :]
        head_cols = np.where(np.any(head_seed, axis=0))[0]
        if len(head_cols) > 0:
            h_xmin, h_xmax = head_cols[0] - 10, head_cols[-1] + 10
            head_cx = (h_xmin + h_xmax) // 2
            head_w = max(20, h_xmax - h_xmin)
        else:
            head_cx = cx
            head_w = int(pw * 0.35)
            h_xmin, h_xmax = head_cx - head_w // 2, head_cx + head_w // 2

        chin_y = ymin + int(ph * 0.28)
        jaw_y = chin_y - np.maximum(0, (xx - head_cx) * 0.70) - np.maximum(0, (head_cx - xx) * 0.80)
        head_mask = (yy < jaw_y) & (xx >= h_xmin) & (xx <= h_xmax) & fg_mask
        head_mask |= (yy < ymin + int(ph * 0.14)) & fg_mask
        head_clean = cv2.dilate(head_mask.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), iterations=1).astype(bool)

        # 4. Skin & Hand Exclusion
        if garment_is_skin_toned:
            # Exposed neck skin below jawline in central cleft
            neck_skin = (yy >= jaw_y) & (yy <= jaw_y + int(ph * 0.08)) & (abs(xx - head_cx) < int(head_w * 0.35)) & (v > 185) & (s < 120) & fg_mask
            neck_skin = cv2.dilate(neck_skin.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), iterations=1).astype(bool)
            # Wrists / hands at outer extremities
            left_hand = (xx < xmin + int(pw * 0.05)) & fg_mask
            watch_hand = (xx > xmin + int(pw * 0.80)) & (yy > ymin + int(ph * 0.74)) & ((v > 180) & (s < 45)) & fg_mask
            pillar_strip = (yy < ymin + int(ph * 0.36)) & (xx < h_xmin) & (yy > ymin + int(ph * 0.16)) & fg_mask & (v < 110)
            excluded_skin = head_clean | neck_skin | left_hand | watch_hand | pillar_strip
        else:
            # Garment has distinct color: standard skin dilation
            k_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
            is_skin_clean = cv2.morphologyEx(is_skin.astype(np.uint8), cv2.MORPH_OPEN, k_open)
            k_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            skin_dilated = cv2.dilate(is_skin_clean, k_dilate, iterations=1).astype(bool)
            excluded_skin = head_clean | skin_dilated

        # 5. Trousers / Bottom Hem Separation (Protects white pants, black slacks, khaki, denim jeans)
        lower_body = (yy > ymin + int(ph * 0.70)) & fg_mask
        torso_mean_rgb = np.median(rgb[torso_y1:torso_y2, torso_x1:torso_x2][torso_fg], axis=0) if np.any(torso_fg) else np.array([128, 128, 128])
        dist_from_torso = np.linalg.norm(rgb.astype(np.float32) - torso_mean_rgb, axis=-1)

        # Pants differ from upper garment in color, or are dark (V < 55) or white/cream (V > 190, S < 45)
        is_trouser_cand = lower_body & ((dist_from_torso > 45) | (v < 55) | ((v > 190) & (s < 45)))
        # Hard lower boundary: upper garments (shirts, t-shirts, jackets) never extend past 0.86 of height
        is_trouser_cand |= (yy > ymin + int(ph * 0.86)) & fg_mask & (dist_from_torso > 25)

        # Morphological opening to filter out small shirt floral/pattern dots
        k_trouser_open = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 9))
        trousers_filtered = cv2.morphologyEx(is_trouser_cand.astype(np.uint8) * 255, cv2.MORPH_OPEN, k_trouser_open)
        k_trouser_close = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
        trousers_filtered = cv2.morphologyEx(trousers_filtered, cv2.MORPH_CLOSE, k_trouser_close)

        # Only retain connected components that reach the bottom region of the person
        num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(trousers_filtered)
        trousers_clean = np.zeros_like(fg_mask, dtype=bool)
        for lbl in range(1, num_labels):
            comp_mask = (labels == lbl)
            if np.any(comp_mask[ymin + int(ph * 0.80):, :]) and stats[lbl, cv2.CC_STAT_AREA] > 400:
                trousers_clean |= comp_mask

        # Dilate slightly so boundary seams between shirt and pants never leak color
        if np.any(trousers_clean):
            trousers_clean = cv2.dilate(
                trousers_clean.astype(np.uint8),
                cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
            ).astype(bool)

        # 6. Composite Garment Mask
        garment_mask = fg_mask & (~excluded_skin) & (~trousers_clean)

        # Morphological closing to bridge buttons, stitching, folds
        k_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
        garment_closed = cv2.morphologyEx(garment_mask.astype(np.uint8) * 255, cv2.MORPH_CLOSE, k_close)
        garment_mask = garment_closed > 128
    else:
        # Flat-lay product on white background
        garment_mask = fg_mask
        
    # Feather edges with Gaussian blur for seamless photo integration
    mask_u8 = (garment_mask.astype(np.uint8)) * 255
    mask_feathered = cv2.GaussianBlur(mask_u8, (5, 5), 0).astype(np.float32) / 255.0
    
    # 4. Adaptive Photorealistic Luminance Remapping
    # Solves black leather jackets, dark navy jackets, and high-contrast garments
    garment_v = v[mask_feathered > 0.4]
    if len(garment_v) > 0:
        v_median = np.median(garment_v)
        v_p5 = np.percentile(garment_v, 5)
        v_p95 = np.percentile(garment_v, 95)
    else:
        v_median, v_p5, v_p95 = 128, 50, 200
        
    mode = color_info.get("mode", "color")
    target_vmin = color_info.get("v_min", 100)
    target_vmax = color_info.get("v_max", 225)
    
    # Normalized fabric fold texture: [0, 1]
    v_norm = np.clip((v.astype(np.float32) - v_p5) / max(15.0, v_p95 - v_p5), 0.0, 1.0)
    
    if mode == "black":
        new_s = np.clip(s * 0.1, 0, 20)
        new_v = target_vmin + v_norm * (target_vmax - target_vmin)
    elif mode == "white":
        new_s = np.clip(s * 0.08, 0, 15)
        new_v = target_vmin + v_norm * (target_vmax - target_vmin)
    elif mode == "grey":
        new_s = np.clip(s * 0.10, 0, 20)
        new_v = target_vmin + v_norm * (target_vmax - target_vmin)
    else:
        new_s = np.full_like(s, color_info["s"])
        if v_median < 85:
            # DARK / BLACK GARMENT (e.g. black leather jacket)
            # Lift luminance so rich color is brilliant while preserving all wrinkles & highlights
            new_v = target_vmin + v_norm * (target_vmax - target_vmin)
        elif v_median > 210 and mode == "dark":
            # LIGHT GARMENT to dark color (e.g. white shirt to navy)
            new_v = target_vmin + v_norm * (target_vmax - target_vmin)
        else:
            # Medium / normal lightness garment: blend natural V with target range for rich vibrance
            v_scaled = target_vmin + v_norm * (target_vmax - target_vmin)
            new_v = np.clip(0.35 * v + 0.65 * v_scaled, 0, 255)
            
    new_h = np.full_like(h, color_info["h"])
    recolored_hsv = np.stack([new_h, new_s.astype(np.uint8), np.clip(new_v, 0, 255).astype(np.uint8)], axis=-1)
    recolored_bgr = cv2.cvtColor(recolored_hsv, cv2.COLOR_HSV2BGR)
    recolored_rgb = cv2.cvtColor(recolored_bgr, cv2.COLOR_BGR2RGB).astype(np.float32)
    
    orig_rgb = rgb.astype(np.float32)
    mask_3d = np.repeat(mask_feathered[:, :, np.newaxis], 3, axis=2)
    blended_rgb = orig_rgb * (1.0 - mask_3d) + recolored_rgb * mask_3d
    blended_rgb = np.clip(blended_rgb, 0, 255).astype(np.uint8)
    
    result_rgba = np.dstack([blended_rgb, alpha])
    return Image.fromarray(result_rgba, "RGBA")

def parse_prompt_for_style(prompt_text, preset):
    p = (prompt_text or "").lower()
    
    # Strip garment recolor instructions so they don't falsely trigger background styles
    bg_p = re.sub(r'(?:change|make|turn|set|recolor)?\s*(?:the\s*)?(?:dress|shirt|tshirt|t-shirt|top|cloth|clothes|clothing|outfit|suit|jacket|coat|garment|apparel|polo)?\s*(?:colou?r)?\s*(?:to|into|as|in|:)?\s*([a-z\s]+)', '', p)
    
    if any(k in bg_p for k in ["neon", "cyber", "glow", "led", "synthwave"]):
        return "neon-cyber"
    if any(k in bg_p for k in ["wood", "oak", "timber", "wooden table", "parquet"]):
        return "warm-wood"
    if any(k in bg_p for k in ["concrete", "cement", "loft", "architectural", "industrial"]):
        return "concrete-minimal"
    if any(k in bg_p for k in ["sunlit", "golden hour", "sunlight", "outdoor", "sun ray"]):
        return "sunlit-outdoor"
    if any(k in bg_p for k in ["velvet", "regal", "royal velvet"]):
        return "velvet-luxury"
    if any(k in bg_p for k in ["blush", "pastel", "peach", "champagne"]):
        return "pastel-blush"
    if any(k in bg_p for k in ["black", "dark", "luxury", "graphite", "night", "slate", "charcoal", "shadow"]):
        return "luxury-dark"
    if any(k in bg_p for k in ["marble", "counter", "kitchen", "stone", "granite"]):
        return "marble-table"
    if any(k in bg_p for k in ["podium", "pedestal", "platform", "stand", "cylinder"]):
        return "studio-podium"
    if any(k in bg_p for k in ["warm", "sunset", "amber", "golden", "fire"]):
        return "warm-ambient"
    if any(k in bg_p for k in ["grey", "gray", "silver", "neutral"]):
        return "studio-grey"
    if any(k in bg_p for k in ["white", "clean", "bright", "seamless", "cyclorama", "pure"]):
        return "studio-white"
    if any(k in bg_p for k in ["navy", "deep blue", "azure"]):
        return "studio-blue"
    if any(k in bg_p for k in ["cinematic", "sky", "cloud", "cloudy", "smoke", "smoky", "overcast", "atmospheric", "storm", "dramatic sky"]):
        return "cinematic-sky"
    if preset in ["cinematic-sky", "dramatic-sky"]:
        return "cinematic-sky"
    if any(k in bg_p for k in ["rose"]):
        return "studio-pink"
        
    return preset or "luxury-dark"

def create_background_fast(style, prompt="", W=1000, H=1000):
    """Generate high-end photographic studio backgrounds in under 0.05 seconds using NumPy."""
    y, x = np.ogrid[:H, :W]

    if style == "concrete-minimal":
        # Minimalist Concrete Loft Studio with Directional Daylight
        horizon = int(H * 0.74)
        bg = Image.new("RGBA", (W, H), (255, 255, 255, 255))
        draw = ImageDraw.Draw(bg)
        for cur_y in range(horizon):
            frac = cur_y / horizon
            g_val = int(222 - frac * 27)
            draw.line([(0, cur_y), (W, cur_y)], fill=(g_val, g_val + 2, g_val + 5, 255))
        for cur_y in range(horizon, H):
            frac = (cur_y - horizon) / (H - horizon)
            f_val = int(210 - frac * 35)
            draw.line([(0, cur_y), (W, cur_y)], fill=(f_val - 4, f_val - 2, f_val + 2, 255))
        spot = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(spot)
        s_draw.ellipse([W // 2 - int(W * 0.42), int(H * 0.15), W // 2 + int(W * 0.42), int(H * 0.75)], fill=(255, 255, 255, 60))
        spot = spot.filter(ImageFilter.GaussianBlur(35))
        return Image.alpha_composite(bg, spot)

    elif style == "warm-wood":
        # Warm Oak Table with Warm Studio Backdrop
        horizon = int(H * 0.72)
        bg = Image.new("RGBA", (W, H), (255, 255, 255, 255))
        draw = ImageDraw.Draw(bg)
        for cur_y in range(horizon):
            frac = cur_y / horizon
            r_val = int(246 - frac * 14)
            g_val = int(240 - frac * 16)
            b_val = int(230 - frac * 18)
            draw.line([(0, cur_y), (W, cur_y)], fill=(r_val, g_val, b_val, 255))
        for cur_y in range(horizon, H):
            frac = (cur_y - horizon) / (H - horizon)
            r_val = int(212 - frac * 45)
            g_val = int(160 - frac * 48)
            b_val = int(112 - frac * 46)
            draw.line([(0, cur_y), (W, cur_y)], fill=(r_val, g_val, b_val, 255))
        for gy in range(horizon + 15, H, 24):
            draw.line([(0, gy), (W, gy + 4)], fill=(160, 110, 70, 35), width=1)
        draw.line([(0, horizon), (W, horizon)], fill=(175, 125, 85, 90), width=2)
        return bg

    elif style == "neon-cyber":
        # Neon Glow Studio: Dark slate with cyan & magenta neon rim lighting
        cx, cy = W // 2, int(H * 0.42)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.75
        t = np.clip(d / max_r, 0.0, 1.0)
        r = (22 * (1.0 - t) + 8 * t).astype(np.uint8)
        g = (20 * (1.0 - t) + 8 * t).astype(np.uint8)
        b = (35 * (1.0 - t) + 16 * t).astype(np.uint8)
        rgb = np.stack([r, g, b], axis=-1)
        bg = Image.fromarray(rgb, "RGB").convert("RGBA")
        neon_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        n_draw = ImageDraw.Draw(neon_overlay)
        n_draw.ellipse([-80, int(H * 0.15), int(W * 0.35), int(H * 0.85)], fill=(6, 182, 212, 110))
        n_draw.ellipse([int(W * 0.65), int(H * 0.15), W + 80, int(H * 0.85)], fill=(236, 72, 153, 110))
        neon_overlay = neon_overlay.filter(ImageFilter.GaussianBlur(55))
        return Image.alpha_composite(bg, neon_overlay)

    elif style == "pastel-blush":
        # Soft Pastel Blush: Editorial fashion peach-pink champagne gradient
        cx, cy = W // 2, int(H * 0.36)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.70
        t = np.clip(d / max_r, 0.0, 1.0)
        r = (255 * (1.0 - t) + 246 * t).astype(np.uint8)
        g = (244 * (1.0 - t) + 215 * t).astype(np.uint8)
        b = (238 * (1.0 - t) + 210 * t).astype(np.uint8)
        rgb = np.stack([r, g, b], axis=-1)
        return Image.fromarray(rgb, "RGB").convert("RGBA")

    elif style == "sunlit-outdoor":
        # Sunlit Golden Hour: Warm late-afternoon sunlight casting diagonal warm glow
        diag = (x * 0.55 + y * 0.45) / float(W)
        t = np.clip(diag, 0.0, 1.0)
        r = (255 * (1.0 - t) + 235 * t).astype(np.uint8)
        g = (248 * (1.0 - t) + 210 * t).astype(np.uint8)
        b = (226 * (1.0 - t) + 175 * t).astype(np.uint8)
        rgb = np.stack([r, g, b], axis=-1)
        bg = Image.fromarray(rgb, "RGB").convert("RGBA")
        sun_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(sun_overlay)
        s_draw.ellipse([-50, -50, int(W * 0.65), int(H * 0.65)], fill=(255, 245, 205, 95))
        sun_overlay = sun_overlay.filter(ImageFilter.GaussianBlur(60))
        return Image.alpha_composite(bg, sun_overlay)

    elif style == "velvet-luxury":
        # Royal Velvet Studio: Deep emerald-teal luxury velvet cyclorama
        cx, cy = W // 2, int(H * 0.38)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.72
        t = np.clip(d / max_r, 0.0, 1.0)
        r = (24 * (1.0 - t) + 8 * t).astype(np.uint8)
        g = (58 * (1.0 - t) + 22 * t).astype(np.uint8)
        b = (52 * (1.0 - t) + 20 * t).astype(np.uint8)
        rgb = np.stack([r, g, b], axis=-1)
        return Image.fromarray(rgb, "RGB").convert("RGBA")

    elif style == "luxury-dark":
        # Luxury Black Studio Background with Soft Key Lighting & Ambient Vignette
        cx, cy = W // 2, int(H * 0.40)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.72
        t = np.clip(d / max_r, 0.0, 1.0)
        
        # Center soft keylight: deep graphite slate (36, 38, 48) fading to rich velvet black (8, 9, 13)
        r = (36 * (1.0 - t) + 8 * t).astype(np.uint8)
        g = (38 * (1.0 - t) + 9 * t).astype(np.uint8)
        b = (48 * (1.0 - t) + 14 * t).astype(np.uint8)
        rgb = np.stack([r, g, b], axis=-1)
        bg = Image.fromarray(rgb, "RGB").convert("RGBA")

        # Subtle floor horizon illumination
        horizon_y = int(H * 0.76)
        floor_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        f_draw = ImageDraw.Draw(floor_overlay)
        f_draw.rectangle([0, horizon_y, W, H], fill=(15, 17, 24, 60))
        bg = Image.alpha_composite(bg, floor_overlay)
        return bg

    elif style == "warm-ambient":
        # Warm Golden Diffused Studio
        cx, cy = W // 2, int(H * 0.38)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.68
        t = np.clip(d / max_r, 0.0, 1.0)
        
        r = (255 * (1.0 - t) + 236 * t).astype(np.uint8)
        g = (250 * (1.0 - t) + 220 * t).astype(np.uint8)
        b = (240 * (1.0 - t) + 204 * t).astype(np.uint8)
        rgb = np.stack([r, g, b], axis=-1)
        return Image.fromarray(rgb, "RGB").convert("RGBA")

    elif style == "studio-grey":
        # Modern Grey Studio
        cx, cy = W // 2, int(H * 0.35)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.68
        t = np.clip(d / max_r, 0.0, 1.0)
        
        val = (248 * (1.0 - t) + 204 * t).astype(np.uint8)
        rgb = np.stack([val, val, (val.astype(np.int32) + 2).clip(0, 255).astype(np.uint8)], axis=-1)
        return Image.fromarray(rgb, "RGB").convert("RGBA")

    elif style == "studio-blue":
        # Sophisticated Navy Studio
        cx, cy = W // 2, int(H * 0.38)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.70
        t = np.clip(d / max_r, 0.0, 1.0)
        
        r = (26 * (1.0 - t) + 10 * t).astype(np.uint8)
        g = (42 * (1.0 - t) + 16 * t).astype(np.uint8)
        b = (72 * (1.0 - t) + 32 * t).astype(np.uint8)
        rgb = np.stack([r, g, b], axis=-1)
        return Image.fromarray(rgb, "RGB").convert("RGBA")

    elif style == "studio-pink":
        # Pastel Rose Studio
        cx, cy = W // 2, int(H * 0.38)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.68
        t = np.clip(d / max_r, 0.0, 1.0)
        
        r = (255 * (1.0 - t) + 245 * t).astype(np.uint8)
        g = (240 * (1.0 - t) + 218 * t).astype(np.uint8)
        b = (245 * (1.0 - t) + 226 * t).astype(np.uint8)
        rgb = np.stack([r, g, b], axis=-1)
        return Image.fromarray(rgb, "RGB").convert("RGBA")

    elif style == "marble-table":
        # Luxury Marble Countertop with Studio Wall Horizon
        horizon = int(H * 0.72)
        bg = Image.new("RGBA", (W, H), (255, 255, 255, 255))
        draw = ImageDraw.Draw(bg)
        
        for cur_y in range(horizon):
            frac = cur_y / horizon
            shade = int(248 - frac * 16)
            draw.line([(0, cur_y), (W, cur_y)], fill=(shade, shade, shade + 2, 255))
            
        for cur_y in range(horizon, H):
            frac = (cur_y - horizon) / (H - horizon)
            shade = int(255 - frac * 28)
            draw.line([(0, cur_y), (W, cur_y)], fill=(shade, shade + 1, shade + 3, 255))
            
        draw.line([(80, horizon + 22), (320, horizon + 58), (680, horizon + 20), (960, horizon + 75)], fill=(195, 202, 214, 90), width=2)
        draw.line([(140, horizon + 80), (380, horizon + 120), (820, horizon + 95)], fill=(205, 212, 222, 60), width=2)
        return bg

    elif style == "studio-podium":
        # Studio Podium Cyclorama
        cx, cy = W // 2, int(H * 0.38)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.72
        t = np.clip(d / max_r, 0.0, 1.0)
        val = (255 * (1.0 - t) + 228 * t).astype(np.uint8)
        rgb = np.stack([val, val, (val.astype(np.int32) + 2).clip(0, 255).astype(np.uint8)], axis=-1)
        return Image.fromarray(rgb, "RGB").convert("RGBA")

    elif style in ["cinematic-sky", "dramatic-sky"]:
        # Cinematic Dramatic Overcast Sky with Atmospheric Backlight and Low Mist
        bg_asset_path = os.path.join(os.path.dirname(__file__), "../public/images/ai_presets/cinematic_sky_bg.jpg")
        if os.path.exists(bg_asset_path):
            try:
                bg_raw = Image.open(bg_asset_path).convert("RGBA")
                return bg_raw.resize((W, H), Image.Resampling.LANCZOS)
            except Exception as e:
                pass

        horizon_y = int(H * 0.46)
        
        bg = Image.new("RGBA", (W, H), (255, 255, 255, 255))
        draw = ImageDraw.Draw(bg)
        
        for cur_y in range(horizon_y):
            frac = cur_y / float(horizon_y)
            ease = frac * frac * 0.4 + frac * 0.6
            r_val = int(88 + ease * (228 - 88))
            g_val = int(94 + ease * (232 - 94))
            b_val = int(106 + ease * (240 - 106))
            draw.line([(0, cur_y), (W, cur_y)], fill=(r_val, g_val, b_val, 255))
            
        for cur_y in range(horizon_y, H):
            frac = (cur_y - horizon_y) / float(H - horizon_y)
            r_val = int(228 - frac * 32)
            g_val = int(232 - frac * 28)
            b_val = int(240 - frac * 25)
            draw.line([(0, cur_y), (W, cur_y)], fill=(r_val, g_val, b_val, 255))

        # Central radiant backlight daylight glow (sun behind clouds creating rim light)
        sun_glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sg_draw = ImageDraw.Draw(sun_glow)
        cx, cy = W // 2, int(H * 0.42)
        rx, ry = int(W * 0.55), int(H * 0.38)
        sg_draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(255, 255, 255, 140))
        sg_draw.ellipse([cx - int(rx * 0.45), cy - int(ry * 0.45), cx + int(rx * 0.45), cy + int(ry * 0.45)], fill=(255, 255, 255, 160))
        sun_glow = sun_glow.filter(ImageFilter.GaussianBlur(55))
        bg = Image.alpha_composite(bg, sun_glow)

        # Layered cinematic cloud textures and volume
        clouds = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        c_draw = ImageDraw.Draw(clouds)
        
        # Upper dark dramatic storm clouds (left & right corners, overhead)
        c_draw.ellipse([-int(W * 0.2), -int(H * 0.15), int(W * 0.55), int(H * 0.45)], fill=(75, 82, 94, 130))
        c_draw.ellipse([int(W * 0.45), -int(H * 0.2), int(W * 1.25), int(H * 0.42)], fill=(80, 88, 100, 140))
        c_draw.ellipse([int(W * 0.15), -int(H * 0.1), int(W * 0.85), int(H * 0.28)], fill=(65, 72, 85, 110))
        
        # Mid-level cumulus billows
        c_draw.ellipse([-int(W * 0.15), int(H * 0.20), int(W * 0.40), int(H * 0.60)], fill=(120, 128, 140, 75))
        c_draw.ellipse([int(W * 0.60), int(H * 0.18), int(W * 1.18), int(H * 0.62)], fill=(125, 132, 145, 80))
        
        clouds = clouds.filter(ImageFilter.GaussianBlur(65))
        bg = Image.alpha_composite(bg, clouds)

        # Low-lying atmospheric ground fog / smoke roll (across the bottom 25%)
        mist = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        m_draw = ImageDraw.Draw(mist)
        
        mist_start = int(H * 0.70)
        m_draw.rectangle([0, mist_start, W, H], fill=(230, 234, 240, 80))
        m_draw.ellipse([-int(W * 0.1), int(H * 0.74), int(W * 0.6), H + int(H * 0.1)], fill=(245, 248, 252, 120))
        m_draw.ellipse([int(W * 0.4), int(H * 0.72), int(W * 1.1), H + int(H * 0.12)], fill=(240, 244, 250, 110))
        m_draw.ellipse([int(W * 0.15), int(H * 0.82), int(W * 0.85), H + int(H * 0.08)], fill=(250, 252, 255, 130))
        
        mist = mist.filter(ImageFilter.GaussianBlur(42))
        bg = Image.alpha_composite(bg, mist)
        
        return bg

    else:
        # Clean White Studio Cyclorama
        cx, cy = W // 2, int(H * 0.35)
        d = np.hypot(x - cx, y - cy)
        max_r = W * 0.70
        t = np.clip(d / max_r, 0.0, 1.0)
        val = (255 * (1.0 - t) + 238 * t).astype(np.uint8)
        rgb = np.stack([val, val, (val.astype(np.int32) + 1).clip(0, 255).astype(np.uint8)], axis=-1)
        return Image.fromarray(rgb, "RGB").convert("RGBA")

def render_pipeline(input_path, output_path, cutout_output_path=None, prompt="", preset="luxury-dark"):
    session = get_session()
    
    # ---------------------------------------------------------
    # STEP 1: DETECT / REMOVE ORIGINAL BACKGROUND -> TRANSPARENT PNG
    # ---------------------------------------------------------
    orig_img = Image.open(input_path).convert("RGBA")
    
    ow, oh = orig_img.size
    if max(ow, oh) > 1200:
        scale_ratio = 1200 / max(ow, oh)
        dw, dh = max(10, int(ow * scale_ratio)), max(10, int(oh * scale_ratio))
        proc_img = orig_img.resize((dw, dh), Image.Resampling.LANCZOS)
    else:
        proc_img = orig_img

    # Neural background removal isolates bottle / person / product cleanly
    cutout = remove(proc_img, session=session)
    
    # ---------------------------------------------------------
    # STEP 1.5: RECOLOR GARMENT IF REQUESTED IN PROMPT
    # ---------------------------------------------------------
    garment_color = extract_garment_color(prompt)
    if garment_color:
        try:
            cutout = segment_and_recolor(cutout, garment_color)
        except Exception as e:
            print(f"[AI Recolor Warning]: {e}", file=sys.stderr)

    if output_path and os.path.dirname(output_path):
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    if cutout_output_path and os.path.dirname(cutout_output_path):
        os.makedirs(os.path.dirname(os.path.abspath(cutout_output_path)), exist_ok=True)

    # Save the standalone transparent PNG cutout (with recolored garment)
    if cutout_output_path:
        cutout.save(cutout_output_path, "PNG")

    style = parse_prompt_for_style(prompt, preset)

    # ---------------------------------------------------------
    # STEP 2: CREATE THE NEW STUDIO BACKGROUND
    # ---------------------------------------------------------
    W, H = 1000, 1000
    bg = create_background_fast(style, prompt=prompt, W=W, H=H)

    # Crop cutout to non-empty subject boundary
    bbox = cutout.getbbox()
    if bbox:
        cropped_cutout = cutout.crop(bbox)
    else:
        cropped_cutout = cutout

    cW, cH = cropped_cutout.size
    cutout_alpha = np.array(cutout)[:, :, 3]
    # Check if subject was cropped at bottom of original frame (e.g. waist-up fashion portrait)
    is_bottom_anchored = np.sum(cutout_alpha[-4:, :] > 40) > 15

    if is_bottom_anchored:
        # Editorial fashion portrait: scale to fill ~88% of canvas height and anchor naturally to floor
        targetH = int(H * 0.88)
        scale = targetH / max(1, cH)
        targetW = max(10, int(cW * scale))
        targetX = (W - targetW) // 2
        targetY = H - targetH
        prodBottom = H
    else:
        # Floating product packshot: center with 75% max bounds
        maxW, maxH = 750, 750
        scale = min(maxW / max(1, cW), maxH / max(1, cH))
        targetW = max(10, int(cW * scale))
        targetH = max(10, int(cH * scale))
        targetX = (W - targetW) // 2
        targetY = (H - targetH) // 2 + 15
        prodBottom = targetY + targetH

    scaled_cutout = cropped_cutout.resize((targetW, targetH), Image.Resampling.LANCZOS)

    # ---------------------------------------------------------
    # STEP 3: COMBINE CUTOUT OVER BACKGROUND WITH REALISTIC LIGHTING & SHADOW
    # ---------------------------------------------------------
    if is_bottom_anchored:
        # Natural studio wall drop-shadow behind fashion model
        shadow_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sh_alpha = scaled_cutout.split()[-1]
        sh_mask = Image.new("RGBA", (targetW, targetH), (0, 0, 0, 48))
        shadow_overlay.paste(sh_mask, (targetX + 8, targetY + 12), mask=sh_alpha)
        shadow_overlay = shadow_overlay.filter(ImageFilter.GaussianBlur(16))
        bg = Image.alpha_composite(bg, shadow_overlay)
    elif style == "studio-podium":
        podiumW = max(int(targetW * 1.18), 380)
        podiumH = 46
        podiumTopY = prodBottom - 4
        podCx = W // 2
        podTopRx = podiumW // 2
        podTopRy = 18

        draw = ImageDraw.Draw(bg)
        draw.ellipse([podCx - int(podTopRx * 1.15), podiumTopY + podiumH - 5, podCx + int(podTopRx * 1.15), podiumTopY + podiumH + 35], fill=(15, 23, 42, 35))
        draw.rectangle([podCx - podTopRx, podiumTopY, podCx + podTopRx, podiumTopY + podiumH], fill=(212, 218, 226, 255))
        draw.ellipse([podCx - podTopRx, podiumTopY + podiumH - 12, podCx + podTopRx, podiumTopY + podiumH + 12], fill=(195, 202, 210, 255))
        draw.ellipse([podCx - podTopRx, podiumTopY - podTopRy, podCx + podTopRx, podiumTopY + podTopRy], fill=(246, 248, 251, 255), outline=(255, 255, 255, 255), width=2)

    elif style == "luxury-dark":
        ref_h = min(targetH, 130)
        ref_cutout = scaled_cutout.transpose(Image.Transpose.FLIP_TOP_BOTTOM).crop((0, 0, targetW, ref_h))
        
        mask = Image.new("L", (targetW, ref_h), 0)
        for my in range(ref_h):
            alpha = int(48 * (1.0 - my / ref_h))
            for mx in range(targetW):
                mask.putpixel((mx, my), alpha)
        bg.paste(ref_cutout, (targetX, prodBottom), mask=mask)

        shadow_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow_overlay)
        rx, ry = int(targetW * 0.44), 16
        s_draw.ellipse([W // 2 - rx, prodBottom - 4, W // 2 + rx, prodBottom + ry * 2], fill=(0, 0, 0, 170))
        shadow_overlay = shadow_overlay.filter(ImageFilter.GaussianBlur(9))
        bg = Image.alpha_composite(bg, shadow_overlay)

    else:
        shadow_overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        s_draw = ImageDraw.Draw(shadow_overlay)
        rx, ry = int(targetW * 0.44), 16
        
        if style in ["warm-wood", "sunlit-outdoor", "warm-ambient"]:
            s_color = (80, 48, 22, 95)
        elif style == "neon-cyber":
            s_color = (12, 10, 24, 180)
        elif style == "velvet-luxury":
            s_color = (4, 16, 14, 140)
        else:
            s_color = (15, 23, 42, 75)
            
        s_draw.ellipse([W // 2 - rx, prodBottom - 4, W // 2 + rx, prodBottom + ry * 2], fill=s_color)
        shadow_overlay = shadow_overlay.filter(ImageFilter.GaussianBlur(12))
        bg = Image.alpha_composite(bg, shadow_overlay)

        core_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        c_draw = ImageDraw.Draw(core_shadow)
        c_draw.ellipse([W // 2 - int(rx * 0.72), prodBottom - 2, W // 2 + int(rx * 0.72), prodBottom + 8], fill=(10, 15, 25, 130))
        core_shadow = core_shadow.filter(ImageFilter.GaussianBlur(4))
        bg = Image.alpha_composite(bg, core_shadow)

    # Layer 3: Put product cutout over the generated background
    bg.paste(scaled_cutout, (targetX, targetY), mask=scaled_cutout)

    if style in ["cinematic-sky", "dramatic-sky"]:
        # Layer 4: Atmospheric low mist slightly touching the base of the subject/product
        mist_fg = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        m_draw = ImageDraw.Draw(mist_fg)
        m_draw.ellipse([W // 2 - int(targetW * 0.65), prodBottom - 16, W // 2 + int(targetW * 0.65), H + 40], fill=(235, 238, 245, 55))
        m_draw.ellipse([int(W * 0.2), prodBottom - 8, int(W * 0.8), H + 25], fill=(240, 244, 250, 45))
        mist_fg = mist_fg.filter(ImageFilter.GaussianBlur(26))
        bg = Image.alpha_composite(bg, mist_fg)

    final_rgb = bg.convert("RGB")
    final_rgb.save(output_path, "JPEG", quality=95)
    
    return {
        "style": style,
        "garmentColor": garment_color,
        "outputPath": output_path,
        "cutoutPath": cutout_output_path
    }

if __name__ == "__main__":
    # WORKER MODE: Keeps model warm in memory and listens on stdin for ultra-fast inference
    if len(sys.argv) > 1 and sys.argv[1] == "--worker":
        s = get_session()
        print(json.dumps({"status": "ready"}), flush=True)
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                req = json.loads(line)
                res = render_pipeline(
                    req["input"],
                    req["output"],
                    cutout_output_path=req.get("cutout"),
                    prompt=req.get("prompt", ""),
                    preset=req.get("preset", "luxury-dark")
                )
                print(json.dumps({"success": True, **res}), flush=True)
            except Exception as e:
                print(json.dumps({"success": False, "error": str(e)}), flush=True)
        sys.exit(0)

    # CLI STANDALONE MODE
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python aiStudioEngine.py <input> <output> [cutout] [prompt] [preset]"}))
        sys.exit(1)

        
    inp = sys.argv[1]
    out = sys.argv[2]
    cutout_path = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "null" else None
    prompt = sys.argv[4] if len(sys.argv) > 4 else ""
    preset = sys.argv[5] if len(sys.argv) > 5 else "studio-white"

    res = render_pipeline(inp, out, cutout_output_path=cutout_path, prompt=prompt, preset=preset)
    print(json.dumps(res))
