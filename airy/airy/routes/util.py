from pathlib import Path

from PIL import Image


def conv_to_webp(src: Path, dst: Path):
    img = Image.open(src)
    img.save(dst, format="webp")
