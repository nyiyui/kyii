from pathlib import Path

from PIL import Image


def conv_to_webp(src: Path, dst: Path) -> None:
    """
    Convert image at src to webp at dst.
    """
    img = Image.open(src)
    img.save(dst, format="webp")
