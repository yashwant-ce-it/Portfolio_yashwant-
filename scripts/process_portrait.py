import sys
import os
import types

# Stub pymatting to avoid numba Windows AppLocker restriction
m = types.ModuleType('pymatting')
m.__path__ = []
sys.modules['pymatting'] = m
sys.modules['pymatting.alpha'] = types.ModuleType('alpha')
sys.modules['pymatting.alpha.estimate_alpha_cf'] = types.SimpleNamespace(estimate_alpha_cf=lambda *a, **k: None)
sys.modules['pymatting.foreground'] = types.ModuleType('foreground')
sys.modules['pymatting.foreground.estimate_foreground_ml'] = types.SimpleNamespace(estimate_foreground_ml=lambda *a, **k: None)
sys.modules['pymatting.util'] = types.ModuleType('util')
sys.modules['pymatting.util.util'] = types.SimpleNamespace(stack_images=lambda *a, **k: None)

from PIL import Image, ImageFilter, ImageOps
import rembg
from rembg import new_session, remove

def process():
    input_path = "public/images/yashwant-photo.jpg"
    if not os.path.exists(input_path):
        print(f"Error: {input_path} not found")
        sys.exit(1)

    print(f"Loading {input_path}...")
    img = Image.open(input_path).convert("RGB")
    print(f"Original size: {img.size}")

    # Models in order of preference
    models = ["birefnet-portrait", "birefnet-general", "u2net_human_seg", "u2net"]
    session = None
    for m_name in models:
        try:
            print(f"Trying model '{m_name}'...")
            session = new_session(m_name)
            print(f"Loaded model '{m_name}' successfully!")
            break
        except Exception as e:
            print(f"Model '{m_name}' failed: {e}")

    if session is None:
        print("Falling back to default session...")
        session = new_session()

    print("Executing background removal...")
    output = remove(img, session=session)
    print("Background removed. Post-processing alpha and defringing...")

    # Defringe: erode alpha 1px and feather 0.6px
    r, g, b, a = output.split()
    a_eroded = a.filter(ImageFilter.MinFilter(3))
    a_blended = Image.blend(a, a_eroded, 0.4)
    a_feathered = a_blended.filter(ImageFilter.GaussianBlur(0.6))
    output = Image.merge("RGBA", (r, g, b, a_feathered))

    # Auto-trim transparent borders
    bbox = output.getbbox()
    if bbox:
        print(f"Trimming to bounding box: {bbox}")
        output = output.crop(bbox)

    print(f"Trimmed size: {output.size}")

    # Framing: waist-up / mid-thigh framing so face is large and prominent
    w, h = output.size
    # Focus on top 88% (subject is waist/mid-thigh up)
    crop_h = int(h * 0.95)
    output = output.crop((0, 0, w, crop_h))
    print(f"Framed size: {output.size}")

    os.makedirs("public/images", exist_ok=True)

    # 1. Full-res PNG master
    cutout_png = "public/images/yashwant-cutout.png"
    output.save(cutout_png, "PNG")
    print(f"Saved: {cutout_png}")

    # 2. Desktop WebP (max height 1400px, quality 90)
    w_curr, h_curr = output.size
    max_h = 1400
    if h_curr > max_h:
        target_w = int(w_curr * (max_h / h_curr))
        desktop_img = output.resize((target_w, max_h), Image.Resampling.LANCZOS)
    else:
        desktop_img = output

    cutout_webp = "public/images/yashwant-cutout.webp"
    desktop_img.save(cutout_webp, "WEBP", quality=90)
    print(f"Saved: {cutout_webp} ({desktop_img.size})")

    # 3. Mobile WebP (height 700px, quality 90)
    mobile_h = 700
    mobile_w = int(w_curr * (mobile_h / h_curr))
    mobile_img = output.resize((mobile_w, mobile_h), Image.Resampling.LANCZOS)
    cutout_700_webp = "public/images/yashwant-cutout-700.webp"
    mobile_img.save(cutout_700_webp, "WEBP", quality=90)
    print(f"Saved: {cutout_700_webp} ({mobile_img.size})")

    # 4. AVIF if supported
    try:
        cutout_avif = "public/images/yashwant-cutout.avif"
        desktop_img.save(cutout_avif, "AVIF", quality=90)
        print(f"Saved: {cutout_avif}")
    except Exception as e:
        print(f"AVIF export skipped: {e}")

    print("All cutout exports created successfully!")

if __name__ == "__main__":
    process()
